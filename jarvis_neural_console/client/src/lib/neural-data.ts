// Synaptic Observatory design reminder: data represents living JARVIS departments, not generic dashboard metrics.

export type BrainMode = "idle" | "listening" | "thinking" | "speaking" | "approval";
export type MemoryScope = "session" | "representation" | "recall";

export type NeuralNode = {
  id: string;
  label: string;
  type: "gateway" | "cortex" | "manager" | "specialist" | "memory" | "output" | "decision";
  department: string;
  position: [number, number, number];
  activity: "stable" | "live" | "reasoning" | "waiting";
  metric: string;
  description: string;
  currentTask: string;
  connections: number;
  lastSignal: string;
};

export const NEURAL_NODES: NeuralNode[] = [
  { id: "voice-gateway", label: "Voice gateway", type: "gateway", department: "Input", position: [-3.3, -0.35, 0.5], activity: "live", metric: "24 ms", description: "Receives spoken input, preserves the session, and routes normalized audio to the cortex.", currentTask: "Awaiting microphone signal", connections: 3, lastSignal: "Now" },
  { id: "input-cortex", label: "Input cortex", type: "cortex", department: "Perception", position: [-2.25, 0.85, 0.35], activity: "live", metric: "98.4%", description: "Separates intent, transcript context, and voice-state cues before JARVIS responds.", currentTask: "Parsing vocal intent", connections: 4, lastSignal: "0.4s ago" },
  { id: "core", label: "JARVIS core", type: "cortex", department: "Orchestrator", position: [0, 0, 0], activity: "reasoning", metric: "11 active", description: "The central orchestration node. It assigns the current request to one department manager and reconciles the response.", currentTask: "Synthesizing a spoken reply", connections: 9, lastSignal: "Now" },
  { id: "router", label: "Intent router", type: "cortex", department: "Orchestrator", position: [-0.35, 1.55, -0.05], activity: "reasoning", metric: "0.18 s", description: "Matches the request to a single department while preserving confirmation boundaries.", currentTask: "Selecting the best manager", connections: 7, lastSignal: "0.1s ago" },
  { id: "executive", label: "Executive", type: "manager", department: "Planning", position: [-1.85, 2.15, -0.4], activity: "stable", metric: "2 briefs", description: "Coordinates priorities, plans, and decisions through planning and concierge sub-agents.", currentTask: "Standing by for priorities", connections: 3, lastSignal: "2m ago" },
  { id: "research", label: "Research", type: "manager", department: "Intelligence", position: [1.65, 2.15, 0.1], activity: "reasoning", metric: "4 sources", description: "Owns evidence-led research, comparison, analysis, and news monitoring.", currentTask: "Tracing an evidence path", connections: 4, lastSignal: "Now" },
  { id: "workspace", label: "Workspace", type: "manager", department: "Communication", position: [-2.25, -1.7, -0.35], activity: "stable", metric: "3 drafts", description: "Prepares documents, messages, calendar changes, and file work without sending anything automatically.", currentTask: "Draft queue clear", connections: 3, lastSignal: "8m ago" },
  { id: "operations", label: "Operations", type: "manager", department: "Automation", position: [2.25, -1.6, 0.2], activity: "reasoning", metric: "6 flows", description: "Maps n8n workflows, integrations, operational safeguards, and system state.", currentTask: "Validating a Telegram flow", connections: 4, lastSignal: "Now" },
  { id: "memory", label: "Memory", type: "memory", department: "Knowledge", position: [2.55, 0.75, -0.4], activity: "stable", metric: "128 notes", description: "Retrieves relevant, durable context and proposes knowledge updates only with permission.", currentTask: "Context index ready", connections: 4, lastSignal: "1m ago" },
  { id: "growth", label: "Growth", type: "manager", department: "Revenue", position: [-1.2, -2.45, 0.3], activity: "stable", metric: "12 leads", description: "Supports agency positioning, ethical prospect strategy, truthful outreach drafts, and sales preparation.", currentTask: "Prospect criteria ready", connections: 4, lastSignal: "4m ago" },
  { id: "news-monitor", label: "News monitor", type: "specialist", department: "Research", position: [2.45, 3.1, -0.5], activity: "stable", metric: "3 signals", description: "Groups time-bounded stories, checks source signals, and produces a concise importance-led brief.", currentTask: "Watching selected sources", connections: 2, lastSignal: "6m ago" },
  { id: "lead-strategist", label: "Lead strategist", type: "specialist", department: "Growth", position: [-2.55, -3.1, -0.5], activity: "stable", metric: "1 ICP", description: "Builds permission-aware ideal-customer criteria and qualification logic for the Growth manager.", currentTask: "No campaign in progress", connections: 2, lastSignal: "10m ago" },
  { id: "automation-engineer", label: "Automation engineer", type: "specialist", department: "Operations", position: [3.25, -2.65, -0.2], activity: "reasoning", metric: "2 checks", description: "Defines event contracts, retries, observability, and safe handoffs for automation workflows.", currentTask: "Inspecting delivery path", connections: 2, lastSignal: "Now" },
  { id: "speech-engine", label: "Speech engine", type: "output", department: "Voice", position: [3.25, -0.35, 0.35], activity: "live", metric: "150 ms", description: "Turns the final JARVIS voice response into a natural spoken waveform for delivery.", currentTask: "Voice channel primed", connections: 3, lastSignal: "0.2s ago" },
  { id: "approval-gate", label: "Approval gate", type: "decision", department: "Control", position: [1.1, -3.15, 0.25], activity: "waiting", metric: "1 queued", description: "Holds external sends, CRM writes, workflow activation, and other real-world actions until the user explicitly confirms them.", currentTask: "Waiting for user approval", connections: 3, lastSignal: "Now" },
  { id: "response-wave", label: "Response wave", type: "output", department: "Voice", position: [4.15, 0.75, -0.1], activity: "live", metric: "Ready", description: "The final outgoing response signal. Its pulse reflects the JARVIS speaking state.", currentTask: "Ready to transmit", connections: 2, lastSignal: "Now" },
  { id: "semantic-extractor", label: "Semantic extractor", type: "specialist", department: "Input", position: [-4.1, 0.75, -1.2], activity: "live", metric: "18 entities", description: "Extracts instructions, entities, and intent signals from the active input before orchestration.", currentTask: "Normalizing current request", connections: 2, lastSignal: "Now" },
  { id: "intent-evaluator", label: "Intent evaluator", type: "specialist", department: "Perception", position: [-2.85, 1.95, -0.9], activity: "reasoning", metric: "0.91 score", description: "Evaluates request intent and routes each operation through the appropriate control boundary.", currentTask: "Scoring operational intent", connections: 3, lastSignal: "0.2s ago" },
  { id: "context-retriever", label: "Context retriever", type: "specialist", department: "Knowledge", position: [-3.55, -0.95, 1.25], activity: "stable", metric: "6 matches", description: "Collects current session and durable context relevant to the live instruction.", currentTask: "Index standing by", connections: 2, lastSignal: "1m ago" },
  { id: "session-ledger", label: "Session ledger", type: "memory", department: "Knowledge", position: [-1.1, 1.15, -1.45], activity: "stable", metric: "12 turns", description: "Maintains a bounded record of the active session and confirmed operating context.", currentTask: "Session context retained", connections: 2, lastSignal: "Now" },
  { id: "knowledge-index", label: "Knowledge index", type: "memory", department: "Knowledge", position: [2.15, 1.7, -1.35], activity: "stable", metric: "128 notes", description: "Indexes durable knowledge entities so retrieval stays scoped and traceable.", currentTask: "Knowledge graph ready", connections: 2, lastSignal: "1m ago" },
  { id: "task-planner", label: "Task planner", type: "specialist", department: "Planning", position: [-0.7, 2.75, 0.95], activity: "reasoning", metric: "3 steps", description: "Breaks the current request into bounded actions, checkpoints, and execution dependencies.", currentTask: "Sequencing operation", connections: 3, lastSignal: "Now" },
  { id: "policy-guard", label: "Policy guard", type: "decision", department: "Control", position: [1.7, -2.35, -1.3], activity: "waiting", metric: "0 violations", description: "Checks intent, authority, and release conditions before an external action can proceed.", currentTask: "Monitoring control boundary", connections: 2, lastSignal: "Now" },
  { id: "source-verifier", label: "Source verifier", type: "specialist", department: "Research", position: [3.55, 2.35, -0.95], activity: "stable", metric: "4 sources", description: "Ranks evidence by provenance and recency before it reaches response synthesis.", currentTask: "Evidence queue ready", connections: 2, lastSignal: "4m ago" },
  { id: "synthesis-analyst", label: "Synthesis analyst", type: "specialist", department: "Research", position: [3.25, 1.25, 1.05], activity: "reasoning", metric: "2 findings", description: "Combines verified evidence into a concise, decision-ready research signal.", currentTask: "Integrating evidence", connections: 2, lastSignal: "Now" },
  { id: "event-router", label: "Event router", type: "specialist", department: "Automation", position: [3.75, -1.9, 0.9], activity: "reasoning", metric: "6 flows", description: "Matches approved intents to named workflow triggers and delivery paths.", currentTask: "Mapping workflow event", connections: 3, lastSignal: "Now" },
  { id: "workflow-monitor", label: "Workflow monitor", type: "specialist", department: "Automation", position: [4.45, -2.9, -0.8], activity: "stable", metric: "99.8%", description: "Observes run health, retries, and handoffs without initiating new external work.", currentTask: "Awaiting workflow release", connections: 2, lastSignal: "3m ago" },
  { id: "delivery-formatter", label: "Delivery formatter", type: "specialist", department: "Voice", position: [3.85, -0.95, -1.35], activity: "live", metric: "2 formats", description: "Adapts the finalized response to the selected output channel and delivery format.", currentTask: "Formatting response payload", connections: 2, lastSignal: "0.5s ago" },
  { id: "audit-ledger", label: "Audit ledger", type: "memory", department: "Control", position: [0.05, -3.85, 1.1], activity: "stable", metric: "18 events", description: "Records approval states, execution outcomes, and operator-visible audit markers.", currentTask: "Audit trail sealed", connections: 2, lastSignal: "Now" },
];

export const NEURAL_EDGES: Array<[string, string]> = [
  ["voice-gateway", "input-cortex"], ["input-cortex", "router"], ["input-cortex", "memory"], ["router", "core"],
  ["core", "executive"], ["core", "research"], ["core", "workspace"], ["core", "operations"], ["core", "memory"], ["core", "growth"],
  ["research", "news-monitor"], ["growth", "lead-strategist"], ["operations", "automation-engineer"], ["operations", "approval-gate"],
  ["workspace", "approval-gate"], ["growth", "approval-gate"], ["memory", "research"], ["memory", "workspace"],
  ["core", "speech-engine"], ["speech-engine", "response-wave"], ["core", "approval-gate"], ["executive", "growth"],
  ["voice-gateway", "semantic-extractor"], ["semantic-extractor", "input-cortex"], ["input-cortex", "intent-evaluator"], ["intent-evaluator", "router"],
  ["input-cortex", "context-retriever"], ["context-retriever", "memory"], ["memory", "session-ledger"], ["session-ledger", "core"], ["memory", "knowledge-index"],
  ["knowledge-index", "research"], ["core", "task-planner"], ["task-planner", "executive"], ["task-planner", "operations"],
  ["core", "policy-guard"], ["policy-guard", "approval-gate"], ["research", "source-verifier"], ["source-verifier", "synthesis-analyst"], ["synthesis-analyst", "core"],
  ["operations", "event-router"], ["event-router", "automation-engineer"], ["event-router", "workflow-monitor"], ["workflow-monitor", "approval-gate"],
  ["workspace", "delivery-formatter"], ["delivery-formatter", "speech-engine"], ["core", "audit-ledger"], ["audit-ledger", "approval-gate"],
];

export const MODE_COPY: Record<BrainMode, { eyebrow: string; title: string; body: string; color: string }> = {
  idle: { eyebrow: "System state", title: "Command field / standby", body: "JARVIS is available. Select a system node or open an input channel to trace the next operational path.", color: "#5b93a8" },
  listening: { eyebrow: "Input channel", title: "Acoustic link / active", body: "The voice gateway is receiving input and transferring normalized context to the command processor.", color: "#79b8c9" },
  thinking: { eyebrow: "Execution state", title: "Task execution / active", body: "Assigned systems are processing the request against the live operational context.", color: "#9b7cff" },
  speaking: { eyebrow: "Output channel", title: "Response link / active", body: "The final response is being assembled for the designated delivery channel.", color: "#c8d6d8" },
  approval: { eyebrow: "Control state", title: "Operator approval required", body: "An external action remains held at the control gate until an operator confirms release.", color: "#dca765" },
};

export const MEMORY_LENS: Record<MemoryScope, { title: string; meta: string; detail: string }> = {
  session: { title: "SESSION / 0418", meta: "12 turns · input context retained", detail: "The current instruction remains bound to its verified session context." },
  representation: { title: "OPERATOR PROFILE", meta: "stable operating preferences", detail: "Evidence-led plans, visible checkpoints, and explicit release authority are active constraints." },
  recall: { title: "RECALL / 3 MATCHES", meta: "contextually ranked", detail: "Automation safety, message delivery, and the current operations workflow are in focus." },
};

export type TraceStatus = "complete" | "active" | "queued" | "awaiting";

export type TraceEvent = {
  id: string;
  step: string;
  source: string;
  label: string;
  detail: string;
  time: string;
  status: TraceStatus;
  nodeId: string;
};

export const TRANSCRIPT_COPY: Record<BrainMode, string> = {
  idle: "Awaiting a voice or text request.",
  listening: "“JARVIS, show me what you are doing as you work.”",
  thinking: "“JARVIS, show me what you are doing as you work.”",
  speaking: "“I’m routing this request, checking the relevant department, and preparing the response.”",
  approval: "“The action is ready. I need your confirmation before I continue.”",
};

export const TRACE_SCENARIOS: Record<BrainMode, TraceEvent[]> = {
  idle: [
    { id: "idle-1", step: "00", source: "SYSTEM", label: "Neural field online", detail: "All managers and registered specialists are available for the next request.", time: "NOW", status: "active", nodeId: "core" },
    { id: "idle-2", step: "01", source: "VOICE", label: "Waiting for input", detail: "The microphone channel is idle. A transcript will appear here when speech is detected.", time: "—", status: "queued", nodeId: "voice-gateway" },
  ],
  listening: [
    { id: "listen-1", step: "01", source: "VOICE", label: "Speech detected", detail: "The voice gateway opened a new conversation turn and retained its session context.", time: "10:43:07", status: "complete", nodeId: "voice-gateway" },
    { id: "listen-2", step: "02", source: "TRANSCRIPT", label: "Transcript updating", detail: "Speech is being converted into display-safe conversational text for JARVIS.", time: "10:43:08", status: "active", nodeId: "input-cortex" },
    { id: "listen-3", step: "03", source: "ROUTER", label: "Intent classification queued", detail: "The request will be mapped to one manager once the current speech turn ends.", time: "NEXT", status: "queued", nodeId: "router" },
  ],
  thinking: [
    { id: "think-1", step: "01", source: "VOICE", label: "Transcript captured", detail: "The request was normalized and attached to the active session context.", time: "10:43:07", status: "complete", nodeId: "input-cortex" },
    { id: "think-2", step: "02", source: "ROUTER", label: "Department selected", detail: "JARVIS identified Operations & Automation as the best manager for this request.", time: "10:43:08", status: "complete", nodeId: "router" },
    { id: "think-3", step: "03", source: "OPERATIONS", label: "Workflow scope mapped", detail: "The manager is defining the safe event flow, data contract, and approval boundaries.", time: "10:43:09", status: "active", nodeId: "operations" },
    { id: "think-4", step: "04", source: "SPECIALIST", label: "Automation review queued", detail: "The automation engineer will return a bounded implementation note to the manager.", time: "NEXT", status: "queued", nodeId: "automation-engineer" },
    { id: "think-5", step: "05", source: "JARVIS", label: "Response synthesis pending", detail: "JARVIS will reconcile the department result into one concise user-facing answer.", time: "NEXT", status: "queued", nodeId: "core" },
  ],
  speaking: [
    { id: "speak-1", step: "01", source: "JARVIS", label: "Response composed", detail: "The final answer has been converted into a concise voice-ready response.", time: "10:43:12", status: "complete", nodeId: "core" },
    { id: "speak-2", step: "02", source: "SPEECH", label: "Voice rendering", detail: "The local speech engine is turning the response into an outgoing audio waveform.", time: "10:43:13", status: "active", nodeId: "speech-engine" },
    { id: "speak-3", step: "03", source: "DELIVERY", label: "Voice response ready", detail: "The response wave is ready for the Telegram delivery workflow.", time: "NEXT", status: "queued", nodeId: "response-wave" },
  ],
  approval: [
    { id: "approval-1", step: "01", source: "JARVIS", label: "Action proposal prepared", detail: "JARVIS has prepared a high-level action proposal rather than executing it automatically.", time: "10:43:15", status: "complete", nodeId: "core" },
    { id: "approval-2", step: "02", source: "CONTROL", label: "Confirmation required", detail: "The proposed real-world action is held at the approval gate until the user confirms it.", time: "10:43:16", status: "awaiting", nodeId: "approval-gate" },
    { id: "approval-3", step: "03", source: "AUTOMATION", label: "n8n action on hold", detail: "No workflow activation, message send, or external write will occur before confirmation.", time: "HELD", status: "queued", nodeId: "operations" },
  ],
};

export const getNode = (id: string) => NEURAL_NODES.find((node) => node.id === id) ?? NEURAL_NODES[2];
