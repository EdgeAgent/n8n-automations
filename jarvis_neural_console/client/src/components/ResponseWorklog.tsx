import { CheckCircle2, Clock3, Radio, RotateCcw, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import type { TraceEvent } from "@/lib/neural-data";

type Briefing = { title: string; summary: string };

type ResponseWorklogProps = {
  events: TraceEvent[];
  answer: Briefing | null;
  answerReceivedAt: string | null;
  retryable: boolean;
  isPending: boolean;
  onRetry: () => void;
  onSelect: (nodeId: string) => void;
};

export function ResponseWorklog({ events, answer, answerReceivedAt, retryable, isPending, onRetry, onSelect }: ResponseWorklogProps) {
  return (
    <aside className="response-worklog" aria-label="JARVIS response feedback and high-level execution log">
      <div className="response-worklog-head"><span><Radio size={12} /> LIVE RESPONSE LOG</span><b>{isPending ? "PROCESSING" : answer ? "ANSWER READY" : retryable ? "RETRY AVAILABLE" : "STANDBY"}</b></div>
      <div className="response-worklog-safe"><ShieldCheck size={12} /><span>SAFE AGENT ACTIVITY — PRIVATE REASONING AND SECRETS REMAIN SEALED.</span></div>
      <div className="response-worklog-events">
        {events.map((event) => <button key={event.id} className={`response-worklog-event ${event.status}`} onClick={() => onSelect(event.nodeId)}>
          <span className="response-worklog-rail" /><span><small>{event.step} / {event.source} / {event.time}</small><strong>{event.label}</strong><em>{event.detail}</em></span>
        </button>)}
      </div>
      {answer && answerReceivedAt && <div className="parsed-answer-status" data-testid="parsed-answer-status"><div><span><CheckCircle2 size={12} /> FINAL PARSED ANSWER</span><time><Clock3 size={11} /> ANSWER RECEIVED / {answerReceivedAt}</time></div><strong>{answer.title}</strong><p>{answer.summary}</p></div>}
      {retryable && <Button className="retry-answer-button" data-testid="retry-answer" onClick={onRetry} disabled={isPending}><RotateCcw size={13} /> Retry answer</Button>}
      {!answer && !retryable && !isPending && <div className="response-worklog-empty"><Sparkles size={12} /> Submit a question to begin the operator-visible worklog.</div>}
      {retryable && <div className="response-worklog-retry-note"><TriangleAlert size={12} /> A recoverable answer-service interruption was detected. Your question is retained for retry.</div>}
    </aside>
  );
}
