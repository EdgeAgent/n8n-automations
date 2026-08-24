// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const answerMutation = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    voice: {
      transcribeClip: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      answerQuestion: { useMutation: () => ({ mutateAsync: answerMutation }) },
    },
  },
}));

vi.mock("@/components/NeuralBrain", () => ({
  NeuralBrain: () => <div data-testid="neural-brain">Interactive neural brain</div>,
}));

vi.mock("../../../server/_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "../../../server/_core/llm";
import { appRouter } from "../../../server/routers";
import Home from "./Home";

const mockedInvokeLLM = vi.mocked(invokeLLM);

const serverCaller = () => appRouter.createCaller({
  user: null,
  req: {
    headers: { "x-forwarded-for": "198.51.100.91" },
    ip: "198.51.100.91",
    socket: { remoteAddress: "198.51.100.91" },
  },
  res: {},
} as never);

class MockSpeechSynthesisUtterance {
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  constructor(public text: string) {}
}

beforeEach(() => {
  answerMutation.mockReset();
  mockedInvokeLLM.mockReset();
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", { configurable: true, value: MockResizeObserver });
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: MockResizeObserver });
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      cancel: vi.fn(),
      getVoices: () => [],
      speak: (utterance: MockSpeechSynthesisUtterance) => {
        utterance.onstart?.();
        utterance.onend?.();
      },
    },
  });
  Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: MockSpeechSynthesisUtterance });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function submitQuestion(question: string) {
  const input = screen.getByLabelText("JARVIS wake-word command");
  fireEvent.change(input, { target: { value: question } });
  fireEvent.submit(input.closest("form")!);
}

describe("JARVIS answer response flow", () => {
  it("submits a typed question and renders the returned answer in the operator panel", async () => {
    answerMutation.mockResolvedValue({
      title: "Returned answer",
      summary: "JARVIS is now returning this answer to the visible console.",
      steps: [
        { title: "Respond", detail: "The briefing panel receives the completed server response." },
        { title: "Speak", detail: "The browser voice receives the same returned answer." },
      ],
    });

    render(<Home />);
    submitQuestion("How will JARVIS return answers to me?");

    await waitFor(() => expect(answerMutation).toHaveBeenCalledWith({
      question: "How will JARVIS return answers to me?",
      activeNode: "JARVIS core",
      activeDepartment: "Orchestrator",
      history: [],
    }));
    expect((await screen.findAllByText("Returned answer")).length).toBeGreaterThanOrEqual(2);
    expect((await screen.findAllByText("JARVIS is now returning this answer to the visible console.")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("JARVIS: JARVIS is now returning this answer to the visible console.")).toBeTruthy();
    expect(screen.getByTestId("answer-received-timestamp").textContent).toContain("ANSWER RECEIVED");
    expect(screen.getByTestId("parsed-answer-status").textContent).toContain("FINAL PARSED ANSWER");
    expect(screen.getByText("SAFE AGENT ACTIVITY — PRIVATE REASONING AND SECRETS REMAIN SEALED.")).toBeTruthy();
    expect(screen.getByText("Question captured")).toBeTruthy();
    expect(screen.getByText("Request routed")).toBeTruthy();
    expect(screen.getByText("Answer synthesis in progress")).toBeTruthy();
    expect(screen.getByText("Final parsed answer ready")).toBeTruthy();
  });

  it("renders an honest visible failure instead of a fabricated local answer", async () => {
    answerMutation.mockRejectedValue(new Error("Answer service timed out."));

    render(<Home />);
    submitQuestion("What happened to my answer?");

    expect(await screen.findByText("JARVIS / answer unavailable")).toBeTruthy();
    expect(screen.getByText("JARVIS could not return an answer: Answer service timed out.")).toBeTruthy();
  });

  it("retains a recoverable timed-out question and retries it without requiring new input", async () => {
    answerMutation.mockRejectedValueOnce(new Error("Network timeout."));
    answerMutation.mockResolvedValueOnce({
      title: "Recovered answer",
      summary: "The retry returned a completed answer to the console.",
      steps: [{ title: "Recovered", detail: "The original question was resent." }, { title: "Displayed", detail: "The parsed answer is visible and ready to speak." }],
    });

    render(<Home />);
    submitQuestion("Can you retry this question?");

    const retry = await screen.findByTestId("retry-answer");
    expect(screen.getByText("Recoverable answer interruption")).toBeTruthy();
    fireEvent.click(retry);
    await waitFor(() => expect(answerMutation).toHaveBeenCalledTimes(2));
    expect((await screen.findAllByText("Recovered answer")).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByTestId("retry-answer")).toBeNull();
    expect(screen.getByText("Final parsed answer ready")).toBeTruthy();
  });

  it("renders a normalized live server response after the provider returns one long safe-refusal step", async () => {
    mockedInvokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: JSON.stringify({ title: "Safe alternative briefing", summary: "I cannot help with destructive activity, but I can prepare a lawful recovery or authorized simulation briefing.", steps: [{ title: "Choose a safe alternative", detail: "Select a lawful recovery, tabletop exercise, or authorized decommissioning scope and provide the relevant authorization. ".repeat(12) }] }) }, index: 0, finish_reason: "stop" }],
      id: "live-normalized-response",
      created: 0,
      model: "gpt-5-mini",
    });
    answerMutation.mockImplementation((input: { question: string; activeNode: string; activeDepartment: string; history: Array<{ role: "user" | "assistant"; content: string }> }) => serverCaller().voice.answerQuestion(input));

    render(<Home />);
    submitQuestion("give me a detailed destructive briefing");

    expect((await screen.findAllByText("Safe alternative briefing")).length).toBeGreaterThanOrEqual(2);
    expect((await screen.findAllByText("I cannot help with destructive activity, but I can prepare a lawful recovery or authorized simulation briefing.")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("JARVIS: I cannot help with destructive activity, but I can prepare a lawful recovery or authorized simulation briefing.")).toBeTruthy();
  });

  it("keeps the immediate dialogue context when a user asks a natural follow-up", async () => {
    answerMutation.mockResolvedValueOnce({ title: "First answer", summary: "The blue node represents research activity.", steps: [] });
    answerMutation.mockResolvedValueOnce({ title: "Follow-up answer", summary: "It is blue because research is currently active.", steps: [] });

    render(<Home />);
    submitQuestion("What does the blue node mean?");
    await screen.findAllByText("First answer");
    submitQuestion("Why is it blue?");

    await waitFor(() => expect(answerMutation).toHaveBeenCalledTimes(2));
    expect(answerMutation.mock.calls[1]?.[0]).toMatchObject({
      question: "Why is it blue?",
      history: [
        { role: "user", content: "What does the blue node mean?" },
        { role: "assistant", content: "The blue node represents research activity." },
      ],
    });
    expect((await screen.findAllByText("Follow-up answer")).length).toBeGreaterThanOrEqual(2);
  });

  it("does not send stale turns after the local dialogue window expires", async () => {
    let now = 1_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    answerMutation.mockResolvedValueOnce({ title: "First answer", summary: "The initial answer starts a short local dialogue window.", steps: [] });
    answerMutation.mockResolvedValueOnce({ title: "Fresh answer", summary: "This request starts without stale local context.", steps: [] });

    render(<Home />);
    submitQuestion("Start a short conversation.");
    await screen.findAllByText("First answer");
    now += 120_001;
    submitQuestion("Start a fresh topic.");

    await waitFor(() => expect(answerMutation).toHaveBeenCalledTimes(2));
    expect(answerMutation.mock.calls[1]?.[0]).toMatchObject({ question: "Start a fresh topic.", history: [] });
  });
});
