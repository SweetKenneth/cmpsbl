# 12 — CLI, Terminal & Access Control

**Classification:** 🔒 GOVERNOR EYES ONLY  
**Version:** v14.4.1 — MINDGAMES Epoch

---

## 1. Terminology

| Term | What It Is | Where It Runs |
|------|-----------|---------------|
| **Substrate Terminal** | The browser-based command console embedded in the CMPSBL dashboard and workspace | Browser (cmpsbl.com) |
| **CLI** (Command Line Interface) | The `@cmpsbl/cli` npm package developers install locally | Developer's machine |
| **SDK** (Software Dev Kit) | The full `@cmpsbl/*` package ecosystem (11 packages) | Developer's machine / CI/CD |

### Why the distinction matters

The **Substrate Terminal** is the full operating system console — ~600 commands spanning all 40 primitives. It has direct access to live telemetry, mesh communications, and governance controls.

The **CLI** is a curated local tool — 66 commands designed for offline development, scoring, validation, and export. It intentionally does NOT include governance, defense, or system-critical commands because those must execute against the live substrate.

---

## 2. The Five Access Tiers

Every user falls into exactly one tier. Higher tiers inherit all permissions from lower tiers.

```
Governor ⊇ Architect ⊇ Creator ⊇ Studio ⊇ Builder
```

| Tier | Monthly | Role in DB | Terminal Commands | CLI Commands | Key Capabilities |
|------|---------|-----------|-------------------|-------------|-----------------|
| **Builder** | $0 | `user` | ~45 (read-only + help) | 12 | Dashboard view, `help`, `glossary`, `status`, basic memory recall |
| **Studio** | $29 | (subscription) | ~120 | 24 | Terminal access, SDK templates, memory crystallization, basic analytics |
| **Creator** | $49 | `operator` | ~280 | 38 | Ascension exports, engine access, agent deployment (1 agency), DECODE channel |
| **Architect** | $79 | `moderator` | ~450 | 52 | Evolution proposals, mesh telemetry, multi-agency, SHADOW runs, ENCODE console |
| **Governor** | Admin | `admin` | **All ~600** | **All 66** | Full system control, governance modes, credential rotation, minting, red-line override |

### How tier is determined

```
1. Check user_roles table → admin / moderator / operator
2. Fallback: access_subscriptions.tier → enterprise / pro / studio / builder / free
3. Fallback: Edge function identity endpoint
4. Default: free
```

---

## 3. Substrate Terminal — Full Command Map (~600 Commands)

### 3.1 Universal Commands (All Tiers)

Every user, including Builder tier, gets these foundational commands:

| Command | Description |
|---------|-------------|
| `help` | Show all available commands for your tier |
| `help [module]` | Show commands for a specific module |
| `glossary` | Substrate terminology reference |
| `status` | System health overview |
| `whoami` | Show current identity and tier |
| `version` | Substrate version info |
| `clear` | Clear terminal output |
| `history` | Show command history |
| `theme [name]` | Switch terminal theme (dark/light/matrix/biohack) |

### 3.2 Per-Node Command Structure

Every node exposes a canonical triad plus specialized commands:

```
[node] status     — Health and operational state
[node] health     — Detailed diagnostics
[node] help       — Node-specific command reference
```

### 3.3 Full 40-Node × Command Matrix

#### CORE COGNITIVE REALITY (CCR) — Nodes 1–3

**CORE** (Node 1)
| Command | Tier | Description |
|---------|------|-------------|
| `core status` | Free | System pulse, boot state |
| `core health` | Free | Node health diagnostics |
| `core help` | Free | CORE command reference |
| `core pulse` | Creator | Trigger health heartbeat |
| `core boot-sequence` | Architect | View boot log |
| `core kill-switch` | Governor | Emergency system halt |
| `core restart` | Governor | Full system restart |

**BRAIN** (Node 2)
| Command | Tier | Description |
|---------|------|-------------|
| `brain status` | Free | Reasoning engine state |
| `brain health` | Free | Cognitive load metrics |
| `brain help` | Free | BRAIN command reference |
| `brain reason [prompt]` | Creator | Execute reasoning context |
| `brain embeddings` | Creator | View embedding stats (384-dim hash-embed-v1) |
| `brain context` | Studio | Full reasoning context dump |
| `brain learning-rate` | Architect | View CLM learning velocity |
| `brain writeback` | Governor | Force learning receipt writeback |
| `brain reset` | Governor | Reset reasoning state |

**MEMORY** (Node 3)
| Command | Tier | Description |
|---------|------|-------------|
| `memory status` | Free | Memory tier overview |
| `memory health` | Free | Storage diagnostics |
| `memory help` | Free | MEMORY command reference |
| `memory recall [query]` | Free | Search warm memory |
| `memory stream` | Creator | View Memory Stream activity |
| `memory crystallize` | Creator | Trigger crystallization cycle |
| `memory tiers` | Creator | View 4-tier breakdown (warm/cold/archive/meta) |
| `memory retention` | Studio | View retention policies |
| `memory promote [id]` | Architect | Promote memory tier |
| `memory archive [id]` | Architect | Force archival |
| `memory purge [id]` | Governor | Hard delete with audit trail |
| `memory export` | Governor | Full memory export |

#### OPERATIONAL COMMAND GROUP (OCG) — Nodes 4–9

**DREAM** (Node 4)
| Command | Tier | Description |
|---------|------|-------------|
| `dream status` | Free | Dream cycle state |
| `dream health` | Free | Synthesis diagnostics |
| `dream help` | Free | DREAM command reference |
| `dream cycle` | Studio | View current dream cycle |
| `dream synthesize` | Architect | Trigger synthesis |
| `dream pool` | Governor | View global dream pool |

**RIPPLE** (Node 5)
| Command | Tier | Description |
|---------|------|-------------|
| `ripple status` | Free | Task orchestrator state |
| `ripple health` | Free | Queue diagnostics |
| `ripple help` | Free | RIPPLE command reference |
| `ripple queue` | Creator | View task queue |
| `ripple dispatch [task]` | Studio | Dispatch task |
| `ripple priority` | Architect | View priority matrix |

**ACCESS** (Node 6)
| Command | Tier | Description |
|---------|------|-------------|
| `access status` | Free | Access module state |
| `access health` | Free | Auth diagnostics |
| `access help` | Free | ACCESS command reference |
| `access identity` | Free | Current identity info |
| `access keys` | Creator | View API key status |
| `access quotas` | Creator | View quota usage |
| `access developers` | Governor | List all developers |
| `access revoke [key]` | Governor | Revoke API key |

**IDENTITY** (Node 7)
| Command | Tier | Description |
|---------|------|-------------|
| `identity status` | Free | Identity resolution state |
| `identity health` | Free | Identity diagnostics |
| `identity help` | Free | IDENTITY command reference |
| `identity verify` | Creator | Verify current session |
| `identity fingerprint` | Architect | View device fingerprint |
| `identity roles` | Governor | Manage role assignments |

**RELAY** (Node 8)
| Command | Tier | Description |
|---------|------|-------------|
| `relay status` | Free | Signal relay state |
| `relay health` | Free | Relay diagnostics |
| `relay help` | Free | RELAY command reference |
| `relay routes` | Creator | View active routes |
| `relay throughput` | Architect | Throughput metrics |

**AUDIT** (Node 9)
| Command | Tier | Description |
|---------|------|-------------|
| `audit status` | Free | Audit chain state |
| `audit health` | Free | Chain integrity check |
| `audit help` | Free | AUDIT command reference |
| `audit recent` | Creator | View recent audit entries |
| `audit chain` | Architect | Merkle chain verification |
| `audit export` | Governor | Full audit log export |
| `audit anchors` | Governor | View chain anchors |

**NERVE** (Node 10)
| Command | Tier | Description |
|---------|------|-------------|
| `nerve status` | Free | Signal bus state |
| `nerve health` | Free | 4-gate emission diagnostics |
| `nerve help` | Free | NERVE command reference |
| `nerve signals` | Creator | View active signals |
| `nerve gates` | Architect | Gate status overview |
| `nerve throttle` | Governor | Adjust signal throttling |

#### EXECUTION LAYER — Nodes 11–20

**DECODE** (Node 11)
| Command | Tier | Description |
|---------|------|-------------|
| `decode status` | Free | Parser state |
| `decode health` | Free | 25-feature diagnostics |
| `decode help` | Free | DECODE command reference |
| `decode parse [input]` | Creator | Parse intent |
| `decode sanitize [input]` | Creator | Sanitize payload |
| `decode channel` | Studio | Open encrypted comms |
| `decode features` | Architect | View feature matrix |
| `decode govern` | Governor | Governor system control |
| `decode set-mode [mode]` | Governor | Set governance mode |

**ENCODE** (Node 12)
| Command | Tier | Description |
|---------|------|-------------|
| `encode status` | Free | Systems engineer state |
| `encode health` | Free | 7-stage chain diagnostics |
| `encode help` | Free | ENCODE command reference |
| `encode analyze [target]` | Architect | Code analysis |
| `encode build [spec]` | Architect | Execute build plan |
| `encode shadow` | Architect | Run shadow A/B test |
| `encode plans` | Architect | View patch plans |
| `encode templates` | Architect | List build templates |
| `encode skills` | Governor | View skill registry |
| `encode console` | Governor | Open full ENCODE console |

**VISION** (Node 13)
| Command | Tier | Description |
|---------|------|-------------|
| `vision status` | Free | Vision processor state |
| `vision health` | Free | Vision diagnostics |
| `vision help` | Free | VISION command reference |
| `vision analyze [url]` | Studio | Analyze visual content |
| `vision ocr [url]` | Studio | Extract text from image |

**CORTEX** (Node 14)
| Command | Tier | Description |
|---------|------|-------------|
| `cortex status` | Free | Orchestrator state |
| `cortex health` | Free | Pipeline diagnostics |
| `cortex help` | Free | CORTEX command reference |
| `cortex pipelines` | Creator | View active pipelines |
| `cortex bottlenecks` | Architect | Bottleneck analysis (throughput/queue depth) |
| `cortex cascade` | Architect | Cascade failure prevention status |
| `cortex sla` | Governor | SLA monitoring dashboard |
| `cortex load-shed` | Governor | Trigger 80% load-shedding |

**NEXUS** (Node 15)
| Command | Tier | Description |
|---------|------|-------------|
| `nexus status` | Free | Routing engine state |
| `nexus health` | Free | Provider fleet diagnostics |
| `nexus help` | Free | NEXUS command reference |
| `nexus providers` | Creator | View provider fleet |
| `nexus route [model]` | Studio | Route to specific model |
| `nexus fallback` | Architect | View 12-step fallback chain |
| `nexus consensus` | Architect | Multi-model consensus job |
| `nexus budget` | Governor | View/set cost budget caps |
| `nexus override [provider]` | Governor | Force provider routing |

**ECONOMY** (Node 16)
| Command | Tier | Description |
|---------|------|-------------|
| `economy status` | Free | Economy engine state |
| `economy health` | Free | Cost diagnostics |
| `economy help` | Free | ECONOMY command reference |
| `economy usage` | Creator | View usage metrics |
| `economy ledger` | Architect | Full cost ledger |
| `economy quotas` | Governor | Manage tier quotas |
| `economy budget` | Governor | Set/view budget caps |

**SANDBOX** (Node 17)
| Command | Tier | Description |
|---------|------|-------------|
| `sandbox status` | Free | Sandbox state |
| `sandbox health` | Free | Isolation diagnostics |
| `sandbox help` | Free | SANDBOX command reference |
| `sandbox create` | Studio | Create isolated sandbox |
| `sandbox list` | Studio | List active sandboxes |
| `sandbox destroy [id]` | Studio | Destroy sandbox |

**INCLUSIVE** (Node 18)
| Command | Tier | Description |
|---------|------|-------------|
| `inclusive status` | Free | Accessibility scanner state |
| `inclusive health` | Free | Scanner diagnostics |
| `inclusive help` | Free | INCLUSIVE command reference |
| `inclusive scan [url]` | Creator | Run accessibility scan |
| `inclusive report [id]` | Creator | View scan report |
| `inclusive wcag` | Studio | WCAG compliance check |

**MEDIC** (Node 19)
| Command | Tier | Description |
|---------|------|-------------|
| `medic status` | Free | Self-healing state |
| `medic health` | Free | Repair diagnostics |
| `medic help` | Free | MEDIC command reference |
| `medic diagnose` | Architect | Run full diagnostic |
| `medic repair [target]` | Governor | Trigger targeted repair |
| `medic quarantine [node]` | Governor | Quarantine a node |

**INTEGRATION** (Node 20)
| Command | Tier | Description |
|---------|------|-------------|
| `integration status` | Free | Integration hub state |
| `integration health` | Free | Connector diagnostics |
| `integration help` | Free | INTEGRATION command reference |
| `integration list` | Creator | List active integrations |
| `integration test [name]` | Studio | Test integration endpoint |

#### ETHICAL / SOVEREIGNTY ZONE (ESZ) — Nodes 21–24

**SOVEREIGN** (Node 21)
| Command | Tier | Description |
|---------|------|-------------|
| `sovereign status` | Free | Compliance engine state |
| `sovereign health` | Free | 5-tier compliance diagnostics |
| `sovereign help` | Free | SOVEREIGN command reference |
| `sovereign compliance` | Studio | View GDPR/HIPAA status |
| `sovereign consent` | Architect | Consent lifecycle dashboard |
| `sovereign retention` | Governor | Manage retention policies |
| `sovereign purge` | Governor | GDPR right-to-erasure execution |

**ORACLE** (Node 22)
| Command | Tier | Description |
|---------|------|-------------|
| `oracle status` | Free | Predictive engine state |
| `oracle health` | Free | Bayesian network diagnostics |
| `oracle help` | Free | ORACLE command reference |
| `oracle predict [query]` | Studio | Run prediction (Monte Carlo) |
| `oracle confidence` | Architect | View confidence intervals (90/95/99%) |
| `oracle calibrate` | Governor | Recalibrate prediction models |

**CONSCIENCE** (Node 23)
| Command | Tier | Description |
|---------|------|-------------|
| `conscience status` | Free | Ethics engine state |
| `conscience health` | Free | Bias detection diagnostics |
| `conscience help` | Free | CONSCIENCE command reference |
| `conscience scan` | Studio | Run 5-type bias detection |
| `conscience report` | Architect | Full ethics audit |
| `conscience override` | Governor | Ethics override (logged, red-line) |

**TREATY** (Node 24)
| Command | Tier | Description |
|---------|------|-------------|
| `treaty status` | Free | SLA management state |
| `treaty health` | Free | Treaty compliance diagnostics |
| `treaty help` | Free | TREATY command reference |
| `treaty list` | Studio | View active SLAs |
| `treaty violations` | Architect | View penalty escalation ladder |
| `treaty enforce` | Governor | Manual SLA enforcement |
| `treaty terminate [id]` | Governor | Terminate SLA contract |

#### EXPERIENTIAL PROCESSING ZONE (EPZ) — Nodes 25–27

**COMPASS** (Node 25)
| Command | Tier | Description |
|---------|------|-------------|
| `compass status` | Free | Route optimizer state |
| `compass health` | Free | Optimization diagnostics |
| `compass help` | Free | COMPASS command reference |
| `compass route [data]` | Studio | Run 2-opt route optimization |
| `compass forecast [data]` | Architect | Time-series decomposition |
| `compass confidence` | Architect | Decaying confidence metrics |

**ECHO** (Node 26)
| Command | Tier | Description |
|---------|------|-------------|
| `echo status` | Free | Reverberation engine state |
| `echo health` | Free | Signal echo diagnostics |
| `echo help` | Free | ECHO command reference |
| `echo trace [signal]` | Creator | Trace signal propagation |
| `echo replay [id]` | Architect | Replay historical signal |

**REFLEX** (Node 27 — OBSERVER)
| Command | Tier | Description |
|---------|------|-------------|
| `reflex status` | Free | Watchdog state |
| `reflex health` | Free | Telemetry buffer diagnostics |
| `reflex help` | Free | REFLEX command reference |
| `reflex buffer` | Creator | View rolling buffer (500 entries) |
| `reflex anomalies` | Architect | Z-score anomaly detection (>2.0) |
| `reflex alerts` | Architect | View alert escalation history |
| `reflex watchdog` | Governor | Configure module health scoring |

#### EXPRESSIVE / MANUFACTURING ZONE (EMZ) — Nodes 28–30

**FORGE** (Node 28)
| Command | Tier | Description |
|---------|------|-------------|
| `forge status` | Free | Cognitive forge state |
| `forge health` | Free | Forge diagnostics |
| `forge help` | Free | FORGE command reference |
| `forge cognitives` | Governor | List all cognitives |
| `forge create [spec]` | Governor | Create new cognitive |
| `forge seal [id]` | Governor | Seal cognitive (immutable) |
| `forge registry` | Governor | Full cognitive registry |

**LINGUA** (Node 29)
| Command | Tier | Description |
|---------|------|-------------|
| `lingua status` | Free | Language processor state |
| `lingua health` | Free | NLP diagnostics |
| `lingua help` | Free | LINGUA command reference |
| `lingua translate [text]` | Creator | Translate text |
| `lingua sentiment [text]` | Studio | Sentiment analysis |
| `lingua entities [text]` | Architect | Named entity extraction |

**HARVEST** (Node 30)
| Command | Tier | Description |
|---------|------|-------------|
| `harvest status` | Free | Data harvester state |
| `harvest health` | Free | SHA-256 bloom filter diagnostics |
| `harvest help` | Free | HARVEST command reference |
| `harvest crawl [url]` | Studio | Crawl and extract data |
| `harvest dedup` | Architect | Run deduplication |
| `harvest export` | Governor | Export harvested datasets |

#### COGNITIVE SECURITY ZONE (CSZ) — Nodes 31–33

**EVOLUTION** (Node 31)
| Command | Tier | Description |
|---------|------|-------------|
| `evolution status` | Free | Evolution engine state |
| `evolution health` | Free | SEBA pipeline diagnostics |
| `evolution help` | Free | EVOLUTION command reference |
| `evolution proposals` | Architect | View pending proposals |
| `evolution fitness [id]` | Architect | Fitness scoring for proposal |
| `evolution promote [id]` | Governor | Promote through 7-gate pipeline |
| `evolution rollback [id]` | Governor | Rollback promotion |
| `evolution pipeline` | Governor | Full pipeline status |
| `evolution reset` | Governor | Reset evolution pipeline |

**SHADOW** (Node 32)
| Command | Tier | Description |
|---------|------|-------------|
| `shadow status` | Free | Shadow testing state |
| `shadow health` | Free | TSAC verification diagnostics |
| `shadow help` | Free | SHADOW command reference |
| `shadow run [id]` | Architect | Execute shadow A/B test |
| `shadow results [id]` | Architect | View shadow test results |
| `shadow store` | Governor | View shadow store (max 50 entries, 1MB) |
| `shadow verify` | Governor | TSAC truth verification |

**PHANTOM** (Node 33)
| Command | Tier | Description |
|---------|------|-------------|
| `phantom status` | Free | Privacy engine state |
| `phantom health` | Free | PII detection diagnostics |
| `phantom help` | Free | PHANTOM command reference |
| `phantom scan [text]` | Studio | PII detection scan (SSN, CC, email) |
| `phantom noise [data]` | Architect | Differential privacy noise injection |
| `phantom covert` | Governor | Covert operations gate (2+ approvals, TTL) |
| `phantom constraints` | Governor | View ethical constraints |

#### FLUID LAYER — Nodes 34–35

**IMMUNITY** (Node 34)
| Command | Tier | Description |
|---------|------|-------------|
| `immunity status` | Free | Adaptive defense state |
| `immunity health` | Free | 3-sigma rule diagnostics |
| `immunity help` | Free | IMMUNITY command reference |
| `immunity threats` | Creator | View detected threats |
| `immunity training` | Architect | Toggle immunity training mode |
| `immunity quarantine [target]` | Governor | Quarantine a module |
| `immunity release [target]` | Governor | Release from quarantine |

**INTENT** (Node 35)
| Command | Tier | Description |
|---------|------|-------------|
| `intent status` | Free | Intent mesh state |
| `intent health` | Free | DAG sequencing diagnostics |
| `intent help` | Free | INTENT command reference |
| `intent broadcast [type]` | Creator | Broadcast an intent |
| `intent receipts` | Creator | View intent receipts |
| `intent dag` | Architect | View DAG dependency graph |
| `intent mesh` | Governor | Full mesh topology view |
| `intent routing` | Governor | View/modify routing rules |

#### PLANE LAYER — Nodes 36–37

**GOVERNANCE** (Node 36)
| Command | Tier | Description |
|---------|------|-------------|
| `governance status` | Free | Governance plane state |
| `governance health` | Free | Policy enforcement diagnostics |
| `governance help` | Free | GOVERNANCE command reference |
| `governance mode` | Architect | View current governance mode |
| `governance set-mode [mode]` | Governor | Set mode (ACTIVE/OBSERVE/LOCKDOWN/EVOLVE) |
| `governance policies` | Governor | View all active policies |
| `governance override [policy]` | Governor | Override policy (logged) |

**DEFENSE** (Node 37)
| Command | Tier | Description |
|---------|------|-------------|
| `defense status` | Free | Perimeter defense state |
| `defense health` | Free | Citadel/Bastion diagnostics |
| `defense help` | Free | DEFENSE command reference |
| `defense threats` | Creator | View threat landscape |
| `defense fingerprints` | Architect | View device fingerprint registry |
| `defense circuit-breakers` | Architect | Circuit breaker status |
| `defense lockdown` | Governor | Trigger emergency lockdown |
| `defense whitelist [ip]` | Governor | Add IP to whitelist |
| `defense blacklist [ip]` | Governor | Block IP |

#### SHELL LAYER — Node 38

**ATLAS** (Node 38)
| Command | Tier | Description |
|---------|------|-------------|
| `atlas status` | Free | Governance hub state |
| `atlas health` | Free | 80-capability diagnostics |
| `atlas help` | Free | ATLAS command reference |
| `atlas capabilities` | Creator | View capability registry |
| `atlas inbox` | Architect | View Node Inbox |
| `atlas marketplace` | Architect | View marketplace listings |
| `atlas enable [cap]` | Governor | Enable capability |
| `atlas disable [cap]` | Governor | Disable capability |
| `atlas audit` | Governor | Full ATLAS audit view |

#### ENGINEER — Node 39

**ENGINEER** (Node 39)
| Command | Tier | Description |
|---------|------|-------------|
| `engineer status` | Free | Technical debt tracker state |
| `engineer health` | Free | P95 latency diagnostics |
| `engineer help` | Free | ENGINEER command reference |
| `engineer debt` | Creator | View technical debt |
| `engineer perf` | Architect | Performance profiling |
| `engineer propose [spec]` | Architect | Submit engineering proposal |
| `engineer latency` | Governor | Full latency dashboard |

#### OBSERVER — Node 40

**OBSERVER** (Node 40)
| Command | Tier | Description |
|---------|------|-------------|
| `observer status` | Free | System watchdog state |
| `observer health` | Free | Rolling buffer diagnostics |
| `observer help` | Free | OBSERVER command reference |
| `observer buffer` | Creator | View telemetry buffer (500 entries) |
| `observer anomalies` | Architect | Z-score anomaly report (>2.0) |
| `observer alerts` | Governor | Alert escalation configuration |
| `observer watchdog` | Governor | Module health scoring config |

---

## 4. CLI (@cmpsbl/cli) — Local Development Commands

The CLI is for **local development only**. It is installed via:

```bash
npm install -g @cmpsbl/cli
# or
npx @cmpsbl/cli [command]
```

### 4.1 CLI Command Reference (66 Total)

#### Foundation (All Tiers — 12 commands)

| Command | Description |
|---------|-------------|
| `cmpsbl help` | Show all available commands |
| `cmpsbl version` | Show CLI version |
| `cmpsbl init` | Initialize a new CMPSBL project |
| `cmpsbl validate [file]` | Validate a manifest.json |
| `cmpsbl score <n> <u> <c> <m>` | Calculate CJPI score |
| `cmpsbl export [file]` | Generate export bundle |
| `cmpsbl glossary` | Substrate terminology |
| `cmpsbl status` | Check substrate connection |
| `cmpsbl login` | Authenticate with substrate |
| `cmpsbl logout` | Clear credentials |
| `cmpsbl config` | View/set local configuration |
| `cmpsbl whoami` | Show authenticated identity |

#### Creator Tier (12 additional — 24 total)

| Command | Description |
|---------|-------------|
| `cmpsbl sdk init [template]` | Scaffold SDK template project |
| `cmpsbl sdk templates` | List available templates |
| `cmpsbl memory recall [query]` | Search memory from CLI |
| `cmpsbl memory crystallize` | Trigger crystallization |
| `cmpsbl intent broadcast [type]` | Broadcast intent |
| `cmpsbl intent receipts` | View recent receipts |
| `cmpsbl analytics summary` | Usage analytics |
| `cmpsbl key create [name]` | Create API key |
| `cmpsbl key list` | List API keys |
| `cmpsbl key revoke [id]` | Revoke API key |
| `cmpsbl scan [url]` | Run accessibility scan |
| `cmpsbl test [suite]` | Run test harness |

#### Studio Tier (14 additional — 38 total)

| Command | Description |
|---------|-------------|
| `cmpsbl ascension start` | Begin Ascension lifecycle |
| `cmpsbl ascension status` | View Ascension progress |
| `cmpsbl ascension export` | Export Ascension artifact |
| `cmpsbl agent create [spec]` | Create agent from spec |
| `cmpsbl agent list` | List agents in agency |
| `cmpsbl agent deploy [id]` | Deploy agent |
| `cmpsbl agent task [id] [type]` | Assign task to agent |
| `cmpsbl engine list` | List available engines |
| `cmpsbl engine invoke [name]` | Invoke engine endpoint |
| `cmpsbl engine status [name]` | Check engine health |
| `cmpsbl sandbox create` | Create isolated sandbox |
| `cmpsbl sandbox list` | List sandboxes |
| `cmpsbl sandbox destroy [id]` | Destroy sandbox |
| `cmpsbl decode channel` | Open encrypted channel |

#### Architect Tier (14 additional — 52 total)

| Command | Description |
|---------|-------------|
| `cmpsbl evolution propose [file]` | Submit evolution proposal |
| `cmpsbl evolution status` | View proposal pipeline |
| `cmpsbl evolution fitness [id]` | Score proposal fitness |
| `cmpsbl shadow run [id]` | Execute shadow A/B test |
| `cmpsbl shadow results [id]` | View shadow results |
| `cmpsbl mesh status` | View mesh topology |
| `cmpsbl mesh comms` | View mesh communications |
| `cmpsbl encode analyze [target]` | Code analysis |
| `cmpsbl encode build [spec]` | Execute build |
| `cmpsbl telemetry stream` | Live telemetry stream |
| `cmpsbl cortex pipelines` | View active pipelines |
| `cmpsbl cortex bottlenecks` | Bottleneck analysis |
| `cmpsbl nexus providers` | View provider fleet |
| `cmpsbl nexus fallback` | View fallback chain |

#### Governor Tier (14 additional — 66 total)

| Command | Description |
|---------|-------------|
| `cmpsbl govern mode [mode]` | Set governance mode |
| `cmpsbl govern policies` | View active policies |
| `cmpsbl govern override [policy]` | Override policy |
| `cmpsbl forge create [spec]` | Create cognitive |
| `cmpsbl forge seal [id]` | Seal cognitive |
| `cmpsbl defense lockdown` | Trigger lockdown |
| `cmpsbl defense whitelist [ip]` | Whitelist IP |
| `cmpsbl credential rotate` | Rotate credentials |
| `cmpsbl backup create` | Create system backup |
| `cmpsbl backup restore [id]` | Restore from backup |
| `cmpsbl audit export` | Export full audit log |
| `cmpsbl atlas enable [cap]` | Enable capability |
| `cmpsbl atlas disable [cap]` | Disable capability |
| `cmpsbl system restart` | Full system restart |

---

## 5. Access Enforcement Architecture

### 5.1 How gate-checking works

```
User runs command
    ↓
CLI/Terminal checks user tier
    ↓
checkGate(userTier, requiredTier) → boolean
    ↓
If false → "⛔ This command requires [tier] tier. Upgrade at cmpsbl.com/pricing"
If true  → Execute command
```

### 5.2 Implementation points

| Surface | Enforcement Mechanism |
|---------|----------------------|
| **Substrate Terminal** | `useUserRole()` hook → tier check before command execution |
| **CLI** | `access_api_keys.scopes` → validated against `@cmpsbl/runtime` `checkGate()` |
| **SDK** | API key scopes verified server-side at edge function gateway |
| **Edge Functions** | `has_role_text()` RPC + subscription tier check |

### 5.3 Scope strings

API keys carry scope arrays that map to tier permissions:

```json
{
  "scopes": ["read", "memory", "intent", "analytics"]  // Creator
}
```

```json
{
  "scopes": ["read", "memory", "intent", "analytics", "ascension", "agents", "engines", "sandbox", "decode"]  // Studio
}
```

```json
{
  "scopes": ["*"]  // Governor — wildcard access
}
```

---

## 6. How Key Systems Map to Tiers

### 6.1 Memory System

| Capability | Builder | Studio | Creator | Architect | Governor |
|-----------|------|---------|--------|-----------|---------|
| Memory recall (read) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Memory Stream view | ❌ | ✅ | ✅ | ✅ | ✅ |
| Crystallization trigger | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tier promotion | ❌ | ❌ | ❌ | ✅ | ✅ |
| Memory purge | ❌ | ❌ | ❌ | ❌ | ✅ |
| Full export | ❌ | ❌ | ❌ | ❌ | ✅ |

### 6.2 Ascension (Software Evolution)

| Capability | Builder | Studio | Creator | Architect | Governor |
|-----------|------|---------|--------|-----------|---------|
| View discoveries | ✅ | ✅ | ✅ | ✅ | ✅ |
| CJPI scoring | ❌ | ✅ | ✅ | ✅ | ✅ |
| Start Ascension lifecycle | ❌ | ❌ | ✅ | ✅ | ✅ |
| Export Ascension artifacts | ❌ | ❌ | ✅ | ✅ | ✅ |
| Silicon-tier exports (HDL) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Pipeline reset | ❌ | ❌ | ❌ | ❌ | ✅ |

**Ascension export rules:**
- Exports are **locked to the user's source language** (PHP→PHP, Verilog→Verilog)
- Score gating: 68+ (Mint), 80+ (Prime), 90+ (Relic), 94+ (Silicon)
- Requires paid subscription (Studio+)
- Subject to vault limits per tier

### 6.3 Agents & Agencies

| Capability | Builder | Studio | Creator | Architect | Governor |
|-----------|------|---------|--------|-----------|---------|
| View agent templates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Purchase agency | ❌ | ❌ | ✅ | ✅ | ✅ |
| Deploy agents | ❌ | ❌ | 1 agency | 3 agencies | Unlimited |
| Agent task assignment | ❌ | ❌ | ✅ | ✅ | ✅ |
| Agent telemetry | ❌ | ❌ | Basic | Full | Full |
| Dream pool access | ❌ | ❌ | Agency-scoped | Cross-agency | Global |
| Scheduled tasks | ❌ | ❌ | 5/agency | 20/agency | Unlimited |
| Agent competency tuning | ❌ | ❌ | ❌ | ✅ | ✅ |

### 6.4 Engines

| Capability | Builder | Studio | Creator | Architect | Governor |
|-----------|------|---------|--------|-----------|---------|
| View engine catalog | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invoke free engines | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invoke paid engines | ❌ | ❌ | ✅ | ✅ | ✅ |
| Engine SDK access | ❌ | ❌ | ✅ | ✅ | ✅ |
| Custom engine deployment | ❌ | ❌ | ❌ | ✅ | ✅ |
| Engine source access | ❌ | ❌ | ❌ | ❌ | ✅ |

### 6.5 Evolution & SEBA

| Capability | Builder | Studio | Creator | Architect | Governor |
|-----------|------|---------|--------|-----------|---------|
| View evolution state | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit proposals | ❌ | ❌ | ❌ | ✅ | ✅ |
| Shadow A/B testing | ❌ | ❌ | ❌ | ✅ | ✅ |
| SEBA 7-gate promotion | ❌ | ❌ | ❌ | ❌ | ✅ |
| Pipeline reset | ❌ | ❌ | ❌ | ❌ | ✅ |
| TSAC verification | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 7. What Users CAN'T Do (Hard Boundaries)

Regardless of tier, these are absolute restrictions:

| Restriction | Reason |
|------------|--------|
| Access internal substrate systems (CLM, SEBA, CORTEX logic) | Builder Isolation Protocol |
| Modify governance logic | Immutable by design |
| Disable AUDIT | Red line #5 |
| Bypass DEFENSE | Red line #2 |
| Access other users' data | RLS + tenant isolation |
| Export internal orchestration recipes | IP protection |
| Run arbitrary code on substrate | Sealed runtime |
| Exceed rate limits without upgrade | Economy module enforcement |
| Access Governor terminal commands | Role-gated at every layer |

---

## 8. Rate Limits by Tier

| Resource | Builder | Studio | Creator | Architect | Governor |
|----------|------|---------|--------|-----------|---------|
| API calls/minute | 10 | 60 | 200 | 500 | Unlimited |
| API calls/day | 100 | 5,000 | 20,000 | 100,000 | Unlimited |
| Memory entries | 50 | 500 | 5,000 | 50,000 | Unlimited |
| Crystallizations/day | 1 | 10 | 50 | 200 | Unlimited |
| Concurrent intents | 1 | 5 | 20 | 50 | Unlimited |
| Storage (MB) | 10 | 100 | 1,000 | 10,000 | Unlimited |
| Agent tasks/day | 0 | 0 | 50 | 200 | Unlimited |

---

## 9. Quick Reference: Governor Super-Commands

As Governor, these are your most powerful commands:

| Command | What It Does |
|---------|-------------|
| `governance set-mode LOCKDOWN` | Freeze all mutations system-wide |
| `core kill-switch` | Emergency system halt |
| `defense lockdown` | Perimeter lockdown |
| `forge seal [id]` | Make cognitive immutable |
| `evolution reset` | Reset evolution pipeline |
| `phantom covert` | Covert operations gate |
| `credential rotate` | Rotate all system credentials |
| `system restart` | Full system restart |
| `audit export` | Export tamper-evident audit chain |
| `sovereign purge` | GDPR right-to-erasure execution |

---

## 10. NPM Package Ecosystem — What Each Package Provides

| Package | Purpose | Tier Required |
|---------|---------|--------------|
| `@cmpsbl/types` | TypeScript schemas and interfaces | Free |
| `@cmpsbl/runtime` | Mini-Runtime™ engine (CJPI, tiering, gates) | Free |
| `@cmpsbl/failsafe` | Migration toolkit for platform portability | Free |
| `@cmpsbl/intent` | Intent broadcast and DAG sequencing | Creator |
| `@cmpsbl/mesh` | Mesh telemetry and communications | Creator |
| `@cmpsbl/bridge` | Polyglot execution bridges (24 languages) | Studio |
| `@cmpsbl/sdk` | Authenticated API access client | Studio |
| `@cmpsbl/discovery` | Foundry and pipeline discovery | Architect |
| `@cmpsbl/cli` | Command-line interface (this tool) | Free (gated per command) |
| `@cmpsbl/react` | React hooks for substrate integration | Creator |
| `@cmpsbl/test-harness` | Validation and testing suite | Creator |

---

## 11. Monitoring User Activity

As Governor, you have visibility into:

| What | Where | Command |
|------|-------|---------|
| All API calls | `access_usage` table | `access quotas` |
| User roles | `user_roles` table | `identity roles` |
| Active sessions | `access_developers` table | `access developers` |
| Rate limit violations | `ai_daily_quota` table | `economy quotas` |
| Audit trail | `audit_logs` table | `audit recent` / `audit export` |
| Mesh activity | `mesh_comms` table | `mesh comms` |
| Evolution proposals | SEBA pipeline | `evolution proposals` |
| Agent telemetry | `agency_agent_telemetry` table | Via ATLAS dashboard |

---

## 12. Changing a User's Access

### Promote a user
```sql
-- Via database (Governor only)
INSERT INTO user_roles (user_id, role) VALUES ('[user-id]', 'moderator');
-- This maps to 'architect' tier in the UI
```

### Demote a user
```sql
DELETE FROM user_roles WHERE user_id = '[user-id]' AND role = 'moderator';
```

### Revoke API access
```
access revoke [key-id]
```

### View all developers
```
access developers
```

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
