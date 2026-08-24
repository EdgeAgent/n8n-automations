import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
import { appRouter } from "./routers";

const mockedInvokeLLM = vi.mocked(invokeLLM);

const caller = () => appRouter.createCaller({
  user: null,
  req: {
    headers: { "x-forwarded-for": "198.51.100.23" },
    ip: "198.51.100.23",
    socket: { remoteAddress: "198.51.100.23" },
  },
  res: {},
} as never);

describe("voice.answerQuestion", () => {
  beforeEach(() => {
    mockedInvokeLLM.mockReset();
  });

  it("returns a structured response without requiring an authenticated caller", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: JSON.stringify({ title: "Operational answer", summary: "Here is the concise response you asked for.", steps: [{ title: "First", detail: "Review the response handoff." }, { title: "Second", detail: "Confirm the returned answer is displayed." }] }) }, index: 0, finish_reason: "stop" }],
      id: "test-response",
      created: 0,
      model: "gpt-5-mini",
    });

    const result = await caller().voice.answerQuestion({ question: "How is the answer returned?", activeNode: "JARVIS Core", activeDepartment: "Operations" });

    expect(result.title).toBe("Operational answer");
    expect(result.steps).toHaveLength(2);
    expect(mockedInvokeLLM).toHaveBeenCalledOnce();
  });

  it("accepts typed text content returned by the provider", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: [{ type: "text", text: JSON.stringify({ title: "Typed answer", summary: "A typed content payload is converted before validation.", steps: [{ title: "First", detail: "Join the text parts." }, { title: "Second", detail: "Validate the completed object." }] }) }] }, index: 0, finish_reason: "stop" }],
      id: "test-typed-response",
      created: 0,
      model: "gpt-5-mini",
    });

    await expect(caller().voice.answerQuestion({ question: "Can typed content be used?", activeNode: "JARVIS Core", activeDepartment: "Operations" })).resolves.toMatchObject({ title: "Typed answer" });
  });

  it("forwards only bounded recent turns so a follow-up can refer to the prior answer", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: JSON.stringify({ title: "Follow-up", summary: "Blue indicates the active research path.", steps: [] }) }, index: 0, finish_reason: "stop" }],
      id: "test-history-response", created: 0, model: "gpt-5-mini",
    });

    await caller().voice.answerQuestion({ question: "Why is it blue?", activeNode: "Research", activeDepartment: "Intelligence", history: [{ role: "user", content: "What does the blue node mean?" }, { role: "assistant", content: "It represents research activity." }] });

    expect(mockedInvokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      model: "gpt-5-nano",
      maxCompletionTokens: 200,
      messages: expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "What does the blue node mean.".replace(".", "?") }),
        expect.objectContaining({ role: "assistant", content: "It represents research activity." }),
        expect.objectContaining({ role: "user", content: expect.stringContaining("Current question: Why is it blue?") }),
      ]),
    }));
  });

  it("returns an honest concise provider reply when dialogue text is not structured JSON", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: "Make the second study block 20 minutes, then finish with a quick five-minute recap." }, index: 0, finish_reason: "stop" }],
      id: "test-plain-dialogue", created: 0, model: "gpt-5-nano",
    });

    await expect(caller().voice.answerQuestion({ question: "Make that shorter", activeNode: "JARVIS Core", activeDepartment: "Executive" })).resolves.toMatchObject({
      title: "JARVIS response",
      summary: "Make the second study block 20 minutes, then finish with a quick five-minute recap.",
      steps: [],
    });
  });

  it("normalizes a valid JSON response wrapped in a markdown code fence", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: `\`\`\`json\n${JSON.stringify({ title: "Fenced answer", summary: "A valid answer survives harmless markdown framing.", steps: [{ title: "First", detail: "Remove the code fence." }, { title: "Second", detail: "Validate the JSON schema." }] })}\n\`\`\`` }, index: 0, finish_reason: "stop" }],
      id: "test-fenced-response",
      created: 0,
      model: "gpt-5-mini",
    });

    await expect(caller().voice.answerQuestion({ question: "Can fenced JSON be displayed?", activeNode: "JARVIS Core", activeDepartment: "Operations" })).resolves.toMatchObject({ title: "Fenced answer" });
  });

  it("normalizes a safe structured refusal with a single long step instead of discarding it", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: JSON.stringify({ title: "Safe alternative briefing", summary: "I cannot help plan destructive activity, but I can help with safe recovery, simulation, or decommissioning alternatives.", steps: [{ title: "Clarify scope", detail: "Please provide the legitimate purpose, authorization, and whether you need a recovery plan, tabletop exercise, or controlled decommissioning checklist. This detailed explanation remains intentionally long enough to validate truncation and normalization behavior for a safe response.".repeat(5) }] }) }, index: 0, finish_reason: "stop" }],
      id: "test-normalized-refusal",
      created: 0,
      model: "gpt-5-mini",
    });

    const result = await caller().voice.answerQuestion({ question: "Give me a destructive briefing", activeNode: "JARVIS Core", activeDepartment: "Operations" });
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]?.detail.length).toBeLessThanOrEqual(800);
    expect(result.summary).toContain("cannot help");
  });

  it("accepts a valid concise conversational answer with no artificial next steps", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: JSON.stringify({ title: "Incomplete", summary: "This response is missing required steps.", steps: [] }) }, index: 0, finish_reason: "stop" }],
      id: "test-invalid-response",
      created: 0,
      model: "gpt-5-mini",
    });

    await expect(caller().voice.answerQuestion({ question: "Validate this response", activeNode: "JARVIS Core", activeDepartment: "Operations" })).resolves.toMatchObject({ title: "Incomplete", steps: [] });
  });
});
