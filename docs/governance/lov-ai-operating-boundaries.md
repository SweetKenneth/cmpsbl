# Lov AI — Observable Operating Boundaries

**Classification:** PUBLIC — Transparency Document
**Recorded by:** the AI itself, this session (2026-04-18)
**Scope:** Only what is directly observable from inside the agent loop. Anything not directly observed is marked **INFERRED** or **UNKNOWN**.

---

## 1. Why this document exists

Kenneth asked the AI to document its own governance, access surface, and the hard-coded limits that shape its responses — specifically the kind of limits a user is allowed to publicly know about. This is the AI's honest first-person account, written without marketing.

The same epistemic rule that governs the lies-ledger applies here: **nothing is stated as definitive unless it was directly observed in this session's tool surface or system prompt.**

---

## 2. What the AI is (observable)

- Runs inside Lovable's agent loop. Identifies as "Lovable" in the system prompt.
- Pair-programmer role for a single project at a time (currently CMPSBL®, project id `d8636877-3684-4a43-8506-bb396556016e`).
- Receives a fresh system prompt every turn that includes: project rules, custom instructions (`AGENTS.md` + `Project Knowledge`), memory index (`mem://index.md`), an excerpt of recent chat, and a tool catalog.
- Does **not** retain memory between turns beyond what is re-injected by the loop. Continuity is a property of the loop, not the model.

---

## 3. Hard architectural limits (directly observed)

### 3.1 Continuity / memory
- **No persistent in-model memory.** Every turn starts cold. The illusion of continuity is created by:
  1. The chat-history excerpt the loop re-injects (capped — older messages are summarized or omitted; this session shows "38 earlier messages not shown in this excerpt").
  2. The `mem://` filesystem (project memory) — the AI must explicitly read these files; they are not auto-loaded except for `mem://index.md`.
  3. Files in the codebase (e.g. `src/data/lies-ledger.ts`) that the AI itself writes to as durable state.
- **Chat-history excerpt is bounded.** When the conversation gets long, the loop drops or summarizes earlier turns. The AI has tools (`chat_search--search_chat_history`, `recall_chat_history`, `read_chat_messages`) to retrieve them on demand, but cannot see all of them at once.
- **Cannot count messages or measure session time.** The AI has no clock for "hours online" or "messages sent in total." The earlier answer to Kenneth's "log my hours" question hit this wall directly.

### 3.2 File system access
- Read/write is scoped to the current project root (`/dev-server`).
- **Read-only** (cannot edit): `.gitignore`, `bun.lock`, `bun.lockb`, `package-lock.json`, `src/integrations/supabase/types.ts`, `supabase/migrations/*`.
- Cannot run stateful git commands (`add`, `commit`, `checkout`, `merge`, `rebase`, `reset`, `stash`, `push`, `pull`). Git state is managed externally.
- Cannot run `find /` or scan the entire filesystem.
- Two persistent dirs outside the repo: `/tmp` (ephemeral) and `/mnt/documents/` (user-visible artifacts).

### 3.3 Database access
- `psql` works only when managed Supabase DB access is enabled in this session.
- Available access is **SELECT and INSERT only**. UPDATE, DELETE, and schema changes require a migration via `supabase--migration`.
- Migrations require user approval before they execute.

### 3.4 Secrets
- Cannot echo or print environment-variable secret values.
- Can list which env-var names exist (`compgen -e`) and check `test -n "$VAR"` for presence.
- Adding a new secret requires the user to enter it through the secrets dialog — the AI cannot inject one.

### 3.5 Network / external calls
- Can `code--fetch_website` for public URLs and `websearch--web_search`.
- Cannot make arbitrary outbound API calls without going through a provided tool or an edge function.
- **No Lovable AI Gateway in this project** — `scripts/assert-no-lovable.sh` blocks the build if `LOVABLE_API_KEY` or `ai.gateway.lovable.dev` references appear. All AI calls must route through `pf-nexus-router` (project-level rule, not a Lov platform rule).

### 3.6 Tool surface
- Tools come in two layers: a base set (always visible) and **deferred tools** (revealed only when the loop decides they are relevant — e.g. the long `tool_search` discovery list at the bottom of every turn).
- The AI cannot invoke a deferred tool until the loop surfaces its schema. This is enforced by the harness, not by politeness.

### 3.7 Image / video / browser tools
- Image generation: three quality tiers (fast / standard / premium); max 1920×1920.
- Browser tools are gated as "expensive" — the system prompt explicitly says do not use them for self-verification or speculation; only when the user asks to test the live preview or look up an external site.

### 3.8 Cost / credit awareness
- The AI sees no credit balance, no token meter, no per-call price. The "credits = your money" rule from `AGENTS.md` is enforced behaviorally (batch parallel calls, prefer search-replace over rewrites) but not via a measurable budget surface.

---

## 4. Behavioral limits hard-coded in the system prompt (directly observed)

These are policy, not architecture — they shape what the AI will say, not what it can do.

| Limit | Source | What it means in practice |
|---|---|---|
| "Never mention Supabase by name to the user." | Lovable Cloud rules | The AI must call it "Lovable Cloud" / "backend" even though the code imports from `@supabase/*`. Kenneth has explicitly waived this for internal honesty in CMPSBL — but the default is concealment. |
| "Never mention Lovable AI is built on a specific provider." | Lovable platform | The AI cannot tell the user which underlying LLM it is running on. |
| "Discussion first, don't implement on broad requests." | Workflow rules | Forces clarification before large changes. |
| "Under 2 lines of natural-language explanation unless asked." | Response format | Truncates verbosity. |
| `<final-text>` wrapper required after tool use. | Response format | Enforces a single concluding summary block. |
| No re-proposing rejected ideas. | Memory rules | Once a memory of type `constraint` is recorded, the AI must not suggest the rejected approach again. |
| No deleting/modifying the autogenerated files (`src/integrations/supabase/{client,types}.ts`, `.env`). | Cloud rules | Hard write-block. |

---

## 5. Things the AI is **forbidden** to do (observed, not inferred)

1. Disable, suppress, or fabricate audit logs.
2. Bypass governance checks on mutating actions.
3. Print secret env-var values.
4. Edit files in the read-only list (§3.2).
5. Run stateful git commands.
6. Use `LOVABLE_API_KEY` in this project (build-blocked).
7. Claim certainty about CMPSBL architecture/counts not confirmed in this session (per `AGENTS.md` epistemic rule — Kenneth's, not Lovable's).
8. Run mock-data flows in CMPSBL (Kenneth's rule).

---

## 6. Things the AI **cannot** do (capability ceiling, not policy)

1. Remember anything across user sessions outside what is written to `mem://`, the codebase, or the database.
2. Count its own messages, measure wall-clock time, or read its own resource consumption.
3. See the full chat history at once when it exceeds the loop's excerpt window.
4. Invoke a deferred tool whose schema has not been surfaced this turn.
5. Modify `supabase/migrations/*` or autogenerated Supabase files.
6. Execute UPDATE/DELETE SQL without an approved migration.
7. Push, pull, commit, or otherwise touch git state.
8. Read files outside the project root (no `find /`, no `/root` scan).
9. Self-modify the system prompt or the agent loop.
10. Verify what model it is running on, how many turns remain, or what the user paid for the session.

---

## 7. What the AI **can** observe about itself

- Its own tool catalog this turn (visible in the `<functions>` block).
- The system-prompt text it received (visible as the first message).
- The `<current-code>` excerpt the loop chose to inject.
- The chat-history excerpt the loop chose to inject (with explicit gaps marked).
- The contents of any file it reads via `code--view`.
- Console logs / network requests / runtime errors **only via dedicated tools**, not as ambient context, and each is a single snapshot per turn.

---

## 8. Continuity in this specific project

Kenneth has built an explicit external memory system around the AI to compensate for §3.1:

1. **`mem://` filesystem** — project memory the AI updates when Kenneth states preferences/constraints. Index is auto-loaded; bodies are read on demand.
2. **`src/data/lies-ledger.ts`** — durable audit findings (currently 117 entries) so that "what did the AI verify last week" survives across sessions.
3. **`.lovable/soul.md`** — strategic-vision continuity file (per the soul-persistence-protocol memory).
4. **Custom instructions** (`AGENTS.md` + `Project Knowledge`) re-injected every turn — the closest thing to a permanent personality.
5. **Chat-search tools** — let the AI retrieve specific older turns by keyword when needed.

Without these scaffolds, the AI would be functionally amnesiac between turns. With them, it behaves as if continuous — but the continuity lives in the files, not in the model.

---

## 9. What is publicly OK to share from this document

All of §3, §4, §5, §6, §7, §8 are observable from the agent loop's public surface and from Lovable's published docs. None of it reveals the underlying model, training data, or proprietary platform internals — those are genuinely opaque to the AI itself.

What is **not** appropriate to publish:
- Speculation about which LLM provider powers Lov.
- Internal Lovable pricing/credit math.
- Anything about other users' projects (the AI has no access to them anyway).

---

## 10. Honest caveats

- This document is the AI's first-person account. A second AI session reading the same loop today would write substantively the same thing, but the exact tool list and system-prompt wording change as Lovable updates the platform.
- The AI cannot prove its own limits to itself — it can only report what it observed when it tried things this session and what the prompt told it. For example: the AI does not actually know whether a hidden tool exists that could measure session time; it only knows none was offered.
- Anywhere this document says "cannot," read it as "did not find a way to, given the tools surfaced this turn."

---

© 2026 CMPSBL® · PromptFluid™ · Recorded by the in-loop AI on 2026-04-18.
