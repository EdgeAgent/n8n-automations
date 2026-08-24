# JARVIS Neural Console — Integration Contract

This project is a **client-side visual console**. It deliberately contains no API key, webhook secret, or direct action capability. The current node graph uses simulated live data so the interaction model can be evaluated independently of the agent service.

## Visual state mapping

| JARVIS lifecycle event | Console mode | Visual result |
|---|---|---|
| Microphone opens or speech is detected | `listening` | Cyan packets travel from `voice-gateway` through `input-cortex` to `core`. |
| JARVIS routes a request or awaits manager output | `thinking` | Violet packets travel from `core` into the selected manager path. |
| A final reply is passed to the local speech engine | `speaking` | White-cyan packets move from `core` through `speech-engine` to `response-wave`. |
| JARVIS returns an external action proposal needing confirmation | `approval` | The amber `approval-gate` becomes the active focus. |
| No active request | `idle` | The graph returns to a stable cobalt field. |

## Node data mapping

The JARVIS agent service can publish a safe read-only snapshot containing the selected node’s `id`, `department`, `currentTask`, `metric`, `connections`, `lastSignal`, and `activity`. The front end should replace the matching record in `NEURAL_NODES` or move that collection into state.

Keep sensitive task details, prompts, credentials, raw memory, and approval payloads on the service side. The console only needs display-safe labels and metrics.

## Live trace event contract

The trace panel is intentionally a high-level operational worklog, not a display of hidden model reasoning. A secure application layer may stream events to the browser through a session-authorized WebSocket or server-sent-event endpoint. Each event should contain only the following display-safe fields:

```json
{
  "id": "evt_104",
  "sessionId": "telegram-chat-123",
  "step": "03",
  "source": "OPERATIONS",
  "label": "Workflow scope mapped",
  "detail": "The manager is defining the safe event flow and approval boundaries.",
  "time": "2026-08-23T11:10:09Z",
  "status": "active",
  "nodeId": "operations"
}
```

The browser should use `nodeId` to select and highlight the corresponding neural node, then render the remaining fields in the trace. Never publish chain-of-thought, raw provider output, credentials, tool arguments, private memory, hidden prompts, or user data that is not needed to understand the visible workflow stage.

## Safe connection pattern

The existing JARVIS service provides a guarded `/chat` endpoint. Add a separate secure application layer before connecting this static console to it. That layer should hold `X-Jarvis-Key`, convert the agent response into display-safe node updates, and expose only the minimal event stream required by the browser. Do not embed the shared secret in this static project.

## Local command

```bash
pnpm install
pnpm dev
```

The UI supports drag-to-orbit, scroll-to-zoom, click-to-select, selected-node data inspection, and simulated `idle`, `listening`, `thinking`, `speaking`, and `approval` states.
