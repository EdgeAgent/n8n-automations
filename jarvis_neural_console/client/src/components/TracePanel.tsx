/**
 * Synaptic Observatory design reminder: this is a readable high-level worklog, never raw hidden reasoning.
 * It sits beside the neural field as an instrument stream; selecting a step selects the corresponding brain node.
 */

import { Bot, Check, CircleDashed, Eye, Mic, Radio, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrainMode, MEMORY_LENS, MemoryScope, MODE_COPY, TRACE_SCENARIOS, TraceStatus, TRANSCRIPT_COPY } from "@/lib/neural-data";

type TracePanelProps = {
  mode: BrainMode;
  selectedId: string;
  onSelect: (nodeId: string) => void;
  memoryScope: MemoryScope;
  boostCount: number;
};

const statusIcon: Record<TraceStatus, typeof Check> = {
  complete: Check,
  active: CircleDashed,
  queued: Eye,
  awaiting: ShieldCheck,
};

export function TracePanel({ mode, selectedId, onSelect, memoryScope, boostCount }: TracePanelProps) {
  const events = TRACE_SCENARIOS[mode];
  const [visibleCount, setVisibleCount] = useState(1);
  const feedRef = useRef<HTMLDivElement>(null);
  const stateCopy = MODE_COPY[mode];
  const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount]);

  useEffect(() => {
    setVisibleCount(1);
    const timer = window.setInterval(() => {
      setVisibleCount((count) => {
        if (count >= events.length) {
          window.clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, 520);
    return () => window.clearInterval(timer);
  }, [mode, events.length]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount]);

  const showAgentResponse = mode === "speaking" || mode === "approval";

  return (
    <aside className="trace-panel panel-glass" aria-label="JARVIS live execution trace">
      <div className="trace-topline">
        <div className="panel-kicker"><Radio size={14} /> LIVE TRACE</div>
        <span className="trace-live"><span /> LIVE RECORD</span>
      </div>

      <div className="trace-conversation">
        <div className="trace-message trace-user-message"><span><Mic size={12} /> TRANSCRIPT</span><p>{TRANSCRIPT_COPY[mode]}</p></div>
        {showAgentResponse && <div className="trace-message trace-agent-message"><span><Bot size={12} /> JARVIS RESPONSE</span><p>{TRANSCRIPT_COPY.speaking}</p></div>}
        <div className="trace-memory-signal"><span>MEMORY / {memoryScope}</span><p>{MEMORY_LENS[memoryScope].title}</p></div>
        {boostCount > 0 && <div className="trace-priority-pulse" aria-live="polite"><Zap size={12} /><span>PRIORITY PULSE {String(boostCount).padStart(2, "0")} ROUTED TO OPERATIONS</span></div>}
      </div>

      <div className="trace-heading"><span>EXECUTION / HIGH LEVEL</span><Sparkles size={13} color={stateCopy.color} /></div>
      <div className="trace-feed" ref={feedRef}>
        {visibleEvents.map((event, index) => {
          const Icon = statusIcon[event.status];
          const isSelected = event.nodeId === selectedId;
          return (
            <button className={`trace-event ${event.status} ${isSelected ? "is-selected" : ""}`} onClick={() => onSelect(event.nodeId)} key={event.id}>
              <span className="trace-rail"><i style={{ backgroundColor: event.status === "awaiting" ? "#ffbd66" : stateCopy.color }} /><b>{event.step}</b>{index < visibleEvents.length - 1 && <em />}</span>
              <span className="trace-entry"><span className="trace-meta"><small>{event.source}</small><time>{event.time}</time><Icon size={12} /></span><strong>{event.label}</strong><span className="trace-detail">{event.detail}</span></span>
            </button>
          );
        })}
      </div>
      <div className="trace-safe-note"><ShieldCheck size={12} /> OPERATOR VIEW ONLY. PRIVATE REASONING, CREDENTIALS, AND RAW MEMORY REMAIN SEALED.</div>
    </aside>
  );
}
