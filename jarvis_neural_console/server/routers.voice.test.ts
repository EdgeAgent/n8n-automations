import { describe, expect, it } from "vitest";
import { z } from "zod";

const clipInput = z.object({
  audioBase64: z.string().min(1).max(8_000_000),
  mimeType: z.enum(["audio/webm", "audio/ogg", "audio/wav", "audio/mp4", "audio/mpeg"]),
  language: z.string().min(2).max(16).optional(),
});

const answerInput = z.object({
  question: z.string().trim().min(3).max(1_500),
  activeNode: z.string().trim().min(1).max(120),
  activeDepartment: z.string().trim().min(1).max(120),
});

describe("cloud voice clip input", () => {
  it("accepts a compact supported audio payload", () => {
    const parsed = clipInput.parse({ audioBase64: "AQID", mimeType: "audio/webm", language: "en" });
    expect(parsed.mimeType).toBe("audio/webm");
  });

  it("rejects unsupported recording formats", () => {
    expect(() => clipInput.parse({ audioBase64: "AQID", mimeType: "audio/flac" })).toThrow();
  });

  it("accepts a bounded detailed conversational question", () => {
    const parsed = answerInput.parse({ question: "What should I do next?", activeNode: "JARVIS Core", activeDepartment: "Executive" });
    expect(parsed.question).toBe("What should I do next?");
  });
});
