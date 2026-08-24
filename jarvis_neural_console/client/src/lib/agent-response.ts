// Response handoff reminder: the console must visibly present a real answer or an explicit service failure; it must never fabricate one.

export type AgentBriefing = {
  title: string;
  summary: string;
  steps: Array<{ title: string; detail: string }>;
};

export function briefingToSpeech(answer: AgentBriefing) {
  const firstHelpfulStep = answer.steps[0];
  return [answer.summary, firstHelpfulStep ? `${firstHelpfulStep.title}. ${firstHelpfulStep.detail}` : ""].filter(Boolean).join(" ");
}

export function successfulAnswerPresentation(answer: AgentBriefing) {
  return {
    mode: "speaking" as const,
    voiceStatus: "JARVIS / ANSWERING",
    liveTranscript: `JARVIS: ${answer.summary}`,
  };
}

export function unavailableAnswerPresentation(detail: string): AgentBriefing & { mode: "idle"; voiceStatus: string; liveTranscript: string } {
  return {
    title: "JARVIS / answer unavailable",
    summary: "I received your request, but I could not reach the answer service. I have not fabricated a response.",
    steps: [
      { title: "Service status", detail },
      { title: "What to do next", detail: "Try the command again in a moment. If the issue persists, review the live trace for the failed stage." },
    ],
    mode: "idle",
    voiceStatus: "JARVIS / ANSWER UNAVAILABLE",
    liveTranscript: `JARVIS could not return an answer: ${detail}`,
  };
}
