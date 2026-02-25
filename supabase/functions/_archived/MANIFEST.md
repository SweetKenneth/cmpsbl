# Edge Function Manifest — SPARTA Epoch

## Classification: Internal Reference

**Last Audited:** February 2026

---

## Active Substrate Functions

These functions are actively used by the substrate and should NOT be modified without review:

| Function | Purpose | Auth |
|----------|---------|------|
| `pf-nexus-router` | AI provider routing (NEXUS module) | JWT validated |
| `pf-agency-chat` | Agency cognitive chat interface | JWT via getClaims() |
| `pf-core-admin` | Admin operations panel | JWT + admin role |
| `pf-substrate` | Core substrate orchestration | SERVICE_ROLE (internal) |
| `pf-substrate-coder` | Code generation pipeline | SERVICE_ROLE (internal) |
| `pf-substrate-evolve` | Evolution mutation executor | SERVICE_ROLE (internal) |
| `pf-substrate-package` | Artifact packaging | SERVICE_ROLE (internal) |
| `pf-substrate-sandbox` | Sandboxed code execution | SERVICE_ROLE (internal) |
| `pf-substrate-upgrade` | Upgrade plan executor | SERVICE_ROLE (internal) |
| `pf-owner-report` | 3-hour owner report generator | SERVICE_ROLE (internal) |
| `pf-clm-engine` | Continuous Learning Machine | SERVICE_ROLE (internal) |
| `pf-tsac-verify` | TSAC acceptance criteria verification | SERVICE_ROLE (internal) |
| `pf-decode-search` | Semantic search for DECODE | SERVICE_ROLE (internal) |
| `pf-auto-blog` | Automated blog content generation | SERVICE_ROLE (internal) |
| `pf-autoblog-scheduler` | Blog scheduling orchestration | SERVICE_ROLE (internal) |
| `pf-radio-broadcast` | Radio broadcast content delivery | SERVICE_ROLE (internal) |
| `pf-nexus-image-gen` | Image generation via NEXUS | JWT validated |
| `cmpsbl-patch-download` | Patch artifact download | Signed URL |
| `cmpsbl-patch-manifest` | Patch manifest listing | Public read |

## Active Commerce Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `passkey-auth` | WebAuthn/passkey authentication | Challenge/response |
| `marketplace-checkout` | Marketplace purchases | JWT validated |
| `marketplace-fulfill` | Order fulfillment | Webhook (Stripe) |
| `marketplace-verify-license` | License validation | API key |
| `marketplace-generate-template` | Template generation | JWT validated |
| `engine-checkout` | Engine subscription checkout | JWT validated |
| `cognitives-checkout` | Cognitive purchase checkout | JWT validated |
| `cognitives-admin-upload` | Admin cognitive upload | JWT + admin |
| `cognitives-free-download` | Free cognitive download | JWT validated |
| `cognitives-verify` | Cognitive verification | JWT validated |
| `create-agency-checkout` | Agency creation checkout | JWT validated |
| `tier-checkout` | Tier upgrade checkout | JWT validated |
| `licensing-checkout` | Licensing inquiry checkout | JWT validated |
| `licensing-verify` | License verification | API key |
| `evolution-mesh-checkout` | Evolution mesh checkout | JWT validated |
| `evolution-receipts` | Evolution receipt generation | JWT validated |
| `stripe-price-lookup` | Stripe price retrieval | Public |
| `check-engine-subscription` | Engine subscription status | JWT validated |
| `capability-checkout` | Capability purchase | JWT validated |

## Active Agency Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `pf-agency-execute-task` | Task execution pipeline | JWT validated |
| `pf-agency-export` | Agency data export | JWT validated |
| `pf-agency-daily-brief` | Daily briefing generator | SERVICE_ROLE (cron) |
| `pf-agency-global-dream` | Global dream pool processing | SERVICE_ROLE (cron) |
| `pf-agency-local-dream` | Local dream processing | SERVICE_ROLE (internal) |
| `pf-agency-scheduler` | Task scheduler | SERVICE_ROLE (cron) |
| `pf-agency-send-email` | Email delivery | SERVICE_ROLE (internal) |

## Active Utility Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `developer-signup` | Developer portal registration | Public |
| `developer-learning` | Developer learning paths | JWT validated |
| `dream-feeder-api` | Public dream submission API | Rate limited |
| `defense-check-subscription` | Defense subscription check | JWT validated |
| `defense-create-checkout` | Defense checkout | JWT validated |
| `defense-customer-portal` | Defense customer portal | JWT validated |
| `cascade-daily-seed` | Daily cascade seed | SERVICE_ROLE (cron) |
| `cascade-dream-generator` | Dream generation cascade | SERVICE_ROLE (internal) |
| `cascade-reflection-email` | Reflection email | SERVICE_ROLE (internal) |
| `agent-mesh` | Agent mesh communication | SERVICE_ROLE (internal) |
| `byok-proxy` | BYOK API proxy | JWT validated |
| `extension-registry` | Extension registry | JWT validated |
| `memory-playground` | Memory playground API | JWT validated |
| `modernizer` | Code modernization | SERVICE_ROLE (internal) |
| `nexus-code-assistant` | Code assistant via NEXUS | JWT validated |
| `radio-dj-tts` | Text-to-speech for radio | SERVICE_ROLE (internal) |

## Archived Functions

Functions in `_archived/` are NOT connected to the substrate. They are retained for reference only and should NOT be deployed or invoked.

---

*Edge Function Manifest — CMPSBL SPARTA Epoch*  
*© 2025–2026 PromptFluid®. All rights reserved.*
