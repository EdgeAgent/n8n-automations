import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const audioPayloadSchema = z.object({
  audioBase64: z.string().min(1).max(8_000_000),
  mimeType: z.enum(["audio/webm", "audio/ogg", "audio/wav", "audio/mp4", "audio/mpeg"]),
  language: z.string().min(2).max(16).optional(),
});

const conversationTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200),
});

const questionInputSchema = z.object({
  question: z.string().trim().min(3).max(1_500),
  activeNode: z.string().trim().min(1).max(120),
  activeDepartment: z.string().trim().min(1).max(120),
  history: z.array(conversationTurnSchema).max(6).default([]),
});

const lucyAnswerSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(20).max(2_200),
  steps: z.array(z.object({
    title: z.string().min(2).max(120),
    detail: z.string().min(12).max(800),
  })).max(2),
});

const answerRateWindowMs = 60 * 60 * 1000;
const answerRateLimit = 30;
const answerRateBuckets = new Map<string, { count: number; resetAt: number }>();

function enforceAnswerRateLimit(req: { headers: Record<string, string | string[] | undefined>; ip?: string; socket?: { remoteAddress?: string } }) {
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]?.trim();
  const key = forwardedAddress || req.ip || req.socket?.remoteAddress || "anonymous";
  const now = Date.now();
  const current = answerRateBuckets.get(key);
  if (!current || now >= current.resetAt) {
    answerRateBuckets.set(key, { count: 1, resetAt: now + answerRateWindowMs });
    return;
  }
  if (current.count >= answerRateLimit) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "JARVIS has reached the hourly answer limit for this session. Please try again later." });
  }
  current.count += 1;
}

function completionToText(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((part): part is { type: "text"; text: string } => Boolean(part) && typeof part === "object" && (part as { type?: unknown }).type === "text" && typeof (part as { text?: unknown }).text === "string")
    .map((part) => part.text)
    .join("");
}

function parseLucyAnswer(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const objectSliceStart = fenced.indexOf("{");
  const objectSliceEnd = fenced.lastIndexOf("}");
  const candidates = [trimmed, fenced];
  if (objectSliceStart !== -1 && objectSliceEnd > objectSliceStart) candidates.push(fenced.slice(objectSliceStart, objectSliceEnd + 1));

  for (const candidate of candidates) {
    try {
      const decoded = JSON.parse(candidate) as unknown;
      const parsed = lucyAnswerSchema.safeParse(decoded);
      if (parsed.success) return parsed.data;
      if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) continue;

      const record = decoded as Record<string, unknown>;
      const title = typeof record.title === "string" && record.title.trim() ? record.title.trim().slice(0, 120) : "JARVIS / response";
      const summary = typeof record.summary === "string" && record.summary.trim() ? record.summary.trim().slice(0, 2_200) : "JARVIS returned a structured response without a separate summary.";
      const rawSteps = Array.isArray(record.steps) ? record.steps : [];
      const steps = rawSteps
        .filter((step): step is Record<string, unknown> => Boolean(step) && typeof step === "object" && !Array.isArray(step))
        .map((step, index) => ({
          title: typeof step.title === "string" && step.title.trim() ? step.title.trim().slice(0, 120) : `Step ${index + 1}`,
          detail: typeof step.detail === "string" && step.detail.trim() ? step.detail.trim().slice(0, 800) : summary.slice(0, 800),
        }))
        .filter((step) => step.detail.length >= 12)
        .slice(0, 4);

      const normalized = lucyAnswerSchema.safeParse({ title, summary, steps });
      if (normalized.success) return normalized.data;
    } catch {
      // Try the next normalized candidate while preserving the strict schema check.
    }
  }
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "JARVIS returned an invalid conversational answer" });
}

function toJarvisAnswer(content: string) {
  try {
    return parseLucyAnswer(content);
  } catch {
    const summary = content
      .replace(/^```(?:text|markdown)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1_200);

    if (summary.length < 3) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "JARVIS could not prepare a conversational answer" });
    }

    return { title: "JARVIS response", summary, steps: [] };
  }
}

const audioExtensions: Record<z.infer<typeof audioPayloadSchema>["mimeType"], string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
};

function getRequestOrigin(req: { protocol: string; get(name: string): string | undefined }) {
  const host = req.get("host");
  if (!host) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Request host is unavailable" });
  return `${req.protocol}://${host}`;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  voice: router({
    transcribeClip: protectedProcedure.input(audioPayloadSchema).mutation(async ({ ctx, input }) => {
      const audio = Buffer.from(input.audioBase64, "base64");
      if (audio.byteLength === 0 || audio.byteLength > 6 * 1024 * 1024) {
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Audio clips must be between 1 byte and 6MB" });
      }

      const extension = audioExtensions[input.mimeType];
      const { url } = await storagePut(`voice-transcription/${ctx.user.id}/${crypto.randomUUID()}.${extension}`, audio, input.mimeType);
      const audioUrl = new URL(url, getRequestOrigin(ctx.req)).toString();
      const result = await transcribeAudio({ audioUrl, language: input.language, prompt: "Transcribe the user's spoken command accurately. Preserve the wake word JARVIS." });

      if ("error" in result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error, cause: result.details });
      }

      return { text: result.text, language: result.language };
    }),
    answerQuestion: publicProcedure.input(questionInputSchema).mutation(async ({ ctx, input }) => {
      enforceAnswerRateLimit(ctx.req);
      const startedAt = Date.now();
      const completion = await invokeLLM({
        model: "gpt-5-nano",
        maxCompletionTokens: 200,
        messages: [
          { role: "system", content: "You are JARVIS, a warm, quick, natural voice assistant. Continue the conversation using the supplied recent turns. Treat follow-up words such as ‘that’, ‘it’, and ‘why’ as references to the immediately relevant prior turn. Answer directly in plain conversational language; do not sound like a task dashboard, do not recite hidden reasoning, and do not claim actions you did not take. Do not invent meanings for interface colors, data, tools, or actions that were not provided; say what you can and cannot tell from the current context. Reply in one or two short spoken-friendly sentences, with no markdown, headings, JSON, or hidden reasoning." },
          ...input.history.map((turn) => ({ role: turn.role, content: turn.content })),
          { role: "user", content: `Current question: ${input.question}\nActive console node: ${input.activeNode}\nActive department: ${input.activeDepartment}` },
        ],
      });
      const content = completionToText(completion.choices[0]?.message.content);
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "JARVIS could not prepare a conversational answer" });
      return { ...toJarvisAnswer(content), latencyMs: Date.now() - startedAt };
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
