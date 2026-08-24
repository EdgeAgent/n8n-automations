# Contributing to JARVIS

JARVIS is designed around one rule: **the operator speaks to one assistant identity, while bounded department work remains internal and reviewable.** Contributions should make that behavior clearer, safer, or more reliable.

## Development standard

Use Python 3.11 or later, create a virtual environment, install `requirements.txt`, and run the offline test suite before opening a pull request. Keep every external action behind an explicit confirmation boundary and add test coverage when behavior changes.

```bash
JARVIS_OFFLINE_MODE=true python3 -m pytest -q jarvis_agent/tests
```

## Guardrails that must not be weakened

| Area | Requirement |
| --- | --- |
| Assistant identity | The operator receives one coherent JARVIS reply, not raw manager or sub-agent chatter. |
| External effects | Sending messages, writing CRM data, modifying files, activating workflows, or touching credentials must remain explicit proposals until approved. |
| Secrets | Never commit tokens, tunnel URLs containing credentials, personal voice samples, or exported n8n credentials. |
| Observability | Log high-level routing and delivery status only. Keep prompts, private memory, credentials, and hidden reasoning out of user-facing traces. |

## Pull requests

Describe the operator-visible change, list the tests you ran, and identify any new environment variable or n8n mapping. Small, focused pull requests are easier to review and safer to deploy.
