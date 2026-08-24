import { describe, expect, it } from "vitest";
import { briefingToSpeech, successfulAnswerPresentation, unavailableAnswerPresentation } from "../client/src/lib/agent-response";

const answer = {
  title: "Working answer",
  summary: "JARVIS has completed the response and is returning it to the console.",
  steps: [
    { title: "Return", detail: "Show the summary in the briefing panel." },
    { title: "Speak", detail: "Send the same content to browser speech synthesis." },
  ],
};

describe("console answer presentation", () => {
  it("renders a successful answer into the visible transcript and speaking state", () => {
    expect(successfulAnswerPresentation(answer)).toEqual({
      mode: "speaking",
      voiceStatus: "JARVIS / ANSWERING",
      liveTranscript: "JARVIS: JARVIS has completed the response and is returning it to the console.",
    });
  });

  it("creates spoken output from the returned answer rather than a fixed acknowledgement", () => {
    expect(briefingToSpeech(answer)).toContain("Show the summary in the briefing panel.");
    expect(briefingToSpeech(answer)).not.toContain("Send the same content to browser speech synthesis.");
  });

  it("shows an honest, user-visible error when the answer service fails", () => {
    const state = unavailableAnswerPresentation("The model timed out.");
    expect(state.voiceStatus).toBe("JARVIS / ANSWER UNAVAILABLE");
    expect(state.liveTranscript).toContain("The model timed out.");
    expect(state.steps).toHaveLength(2);
  });
});
