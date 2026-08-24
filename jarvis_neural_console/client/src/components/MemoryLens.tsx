import { BookOpenCheck, Layers3, SearchCheck } from "lucide-react";
import { MEMORY_LENS, MemoryScope } from "@/lib/neural-data";

type MemoryLensProps = {
  scope: MemoryScope;
  onScopeChange: (scope: MemoryScope) => void;
};

const lensIcons = {
  session: BookOpenCheck,
  representation: Layers3,
  recall: SearchCheck,
};

export function MemoryLens({ scope, onScopeChange }: MemoryLensProps) {
  const current = MEMORY_LENS[scope];
  const Icon = lensIcons[scope];

  return (
    <section className="memory-lens" aria-label="Simulated persistent memory lens">
      <div className="memory-lens-heading"><span>CONTEXT STORE</span><em>LOCAL EMULATION</em></div>
      <div className="memory-tabs" role="tablist" aria-label="Memory view">
        {(Object.keys(MEMORY_LENS) as MemoryScope[]).map((item) => (
          <button
            aria-selected={scope === item}
            className={`memory-tab ${scope === item ? "is-active" : ""}`}
            key={item}
            onClick={() => onScopeChange(item)}
            role="tab"
          >
            {item === "representation" ? "peer" : item}
          </button>
        ))}
      </div>
      <div className="memory-readout">
        <Icon size={14} aria-hidden="true" />
        <div><strong>{current.title}</strong><span>{current.meta}</span><p>{current.detail}</p></div>
      </div>
    </section>
  );
}
