# Ascension — Complete User Guide

**The step-by-step guide to scanning, scoring, exporting, and governing your code with CMPSBL®.**

Whether you use the website or the terminal, this guide covers every single step of the Ascension process — from uploading your first file to running governed code in production.

---

## Table of Contents

1. [What Is Ascension?](#what-is-ascension)
2. [Two Ways to Ascend](#two-ways-to-ascend)
3. [Website Flow — Step by Step](#website-flow)
4. [CLI Flow — Step by Step](#cli-flow)
5. [Understanding Your Results](#understanding-your-results)
6. [Exporting Your Ascended Code](#exporting-your-ascended-code)
7. [Dropping It Back Into Your Stack](#dropping-it-back-into-your-stack)
8. [Attaching Mana (Optional Governance)](#attaching-mana)
9. [Toggling Capabilities](#toggling-capabilities)
10. [Industry Verticals](#industry-verticals)
11. [Verifying Your Artifacts](#verifying-your-artifacts)
12. [FAQ](#faq)

---

## What Is Ascension?

Ascension is CMPSBL's **code analysis and enhancement engine**. You give it any working source file — in any of 90+ supported languages — and it:

1. **Analyzes** the structural profile of your code (imports, exports, functions, classes, patterns)
2. **Classifies** your code into an archetype (UI, API, Agent, General)
3. **Collides** your code against a matrix of 40 primitives — each one testing for specific behavioral patterns, vulnerabilities, and enhancement opportunities
4. **Scores** the results using the **CJPI formula** (Crown Jewel Pipeline Index) — a deterministic 0–100 score
5. **Exports** a complete artifact package with your original code untouched and a new Layer 2 orchestration layer wrapped around it

**Your code is never modified.** Ascension generates a second layer that wraps around your original logic, adding intelligence, observability, and protection at the function boundary — not inside your files.

**This is not AI.** Ascension uses pure algorithmic pattern detection. No neural networks. No language models. Same input produces the same output, every time.

---

## Two Ways to Ascend

| | Website (cmpsbl.com/ascension) | CLI (`cmpsbl ascend`) |
|---|---|---|
| **Input** | Upload a file or connect a GitHub repo | Point to a local file |
| **Visual feedback** | Rich UI with interactive pipeline visualization | Terminal-based 8-stage progress |
| **Full ZIP export** | Download button after Ascension completes | `--export` flag |
| **GitHub integration** | Smart Repo Scanner with file classification | Not available (local files only) |
| **Mana attachment** | One-click from the Ascension results page | Run `npx mana attach` separately |
| **Vertical selection** | Dropdown menu to choose industry vertical | Default (general); verticals via website |
| **Best for** | First-time users, visual learners, repo scanning | Developers, automation, CI/CD pipelines |

Both flows produce identical results for the same input. The difference is the interface.

---

## Website Flow

### Step 1: Go to the Ascension Lab

Open your browser and navigate to:

```
cmpsbl.com/ascension
```

You'll see the Ascension Lab — a clean interface with two options for getting your code in.

### Step 2: Choose Your Input Method

#### Option A: Upload a File

1. Click the **upload area** or drag and drop a file onto it
2. Your file appears with its name, size, and detected language
3. That's it — you're ready to ascend

**Supported files:** Any source code file in 90+ languages — `.py`, `.ts`, `.js`, `.rs`, `.go`, `.java`, `.rb`, `.php`, `.swift`, `.kt`, `.c`, `.cpp`, `.cs`, `.dart`, `.ex`, `.lua`, `.sol`, `.v`, `.vhd`, and dozens more.

#### Option B: Connect a GitHub Repository

1. Click **"Connect GitHub"** or paste a GitHub repository URL
2. The **Smart Repo Scanner** analyzes your repository structure
3. Files are automatically classified into three categories:
   - **Core** — Primary source files (in `src/`, `lib/`, `packages/*/src/`)
   - **Supporting** — Helper files, configs, utilities
   - **Skipped** — Tests, docs, generated files, dependencies
4. Review the classification — you can manually promote or demote files
5. Click **"Confirm & Download"** to pull the selected files

**Why use GitHub?** The Smart Repo Scanner understands monorepos, Python packages (detects `__init__.py`), and complex project structures. It picks the right files automatically so you don't have to hunt through folders.

**What's the difference?** Uploading a single file ascends that one file. Connecting a GitHub repo lets you scan multiple files and choose which ones to ascend — useful for larger projects where you want a complete picture.

### Step 3: Choose a Vertical (Optional)

Before running Ascension, you can optionally select an **industry vertical** from the dropdown. Each vertical tailors the 40-primitive matrix for a specific domain:

- **General** (default) — The standard 40-primitive collision
- **Cyber**, **Fintech**, **Health**, **Legal**, etc. — Adds domain-specific primitives for specialized vulnerability detection and capabilities

If you're not sure, leave it on General. You can always re-run with a vertical later.

See the [Industry Verticals](#industry-verticals) section for details on each one.

### Step 4: Run Ascension

Click **"Ascend"** (or the equivalent button). The pipeline runs through 8 stages:

1. **UPLOAD** — Your code is read and its structural profile is extracted
2. **CLASSIFY** — The archetype is detected (UI, API, Agent, General)
3. **REGISTER** — Your code is bound as Primitive #41 in the collision space
4. **CHAIN** — Your code collides against all 40 primitives, one by one
5. **DISCOVER** — Capability combinations are mapped from the collisions
6. **SCORE** — The CJPI formula computes your deterministic score and tier
7. **EXPORT** — The ascended artifact is generated
8. **PROTECT** — An integrity seal and fingerprint are applied

You'll see each stage complete in real time with results.

### Step 5: Review Your Results

After Ascension completes, you'll see:

- **CJPI Score** — Your 0–100 score with tier classification
- **Collision Map** — Which of the 40 primitives fired on your code
- **Discoveries** — How many unique capability combinations were found
- **Archetype** — How your code was classified
- **Fingerprint** — A unique cryptographic identifier for this exact Ascension

### Step 6: Download Your Ascended Code Package

Click **"Download ZIP"** to get the full Ascended Code Package. This is a ZIP file containing everything:

```
your-file-ascended/
├── src/
│   ├── your-file.py              ← Your original code (Layer 1 — UNTOUCHED)
│   └── your-file.ascended.py     ← Ascended code (Layer 2 — generated)
├── _runtime/
│   ├── convex-core.ts             ← Sealed artifact (Convex Core™ DPL)
│   ├── chain-executor.ts          ← Chain orchestration logic
│   └── discovery-engine.ts        ← Discovery logic
├── docs/
│   └── guides/
│       ├── USER-GUIDE.html        ← How to use your ascended code
│       ├── PIPELINE-DETAILS.html  ← Step-by-step primitive execution log
│       ├── INTEGRATION-GUIDE.html ← How to integrate into your project
│       └── ... (10+ branded HTML guides)
├── verification/
│   ├── CJPI-CERTIFICATE.html     ← Your scored certificate
│   ├── CAPABILITY-LEDGER.json    ← Machine-readable capability map
│   └── RUN_VERIFICATION.ts       ← Test harness to verify everything works
├── reports/
│   └── ASCENSION-REPORT.html     ← Full diagnostic report
├── lifecycle/
│   ├── CHANGELOG.md              ← What was discovered and applied
│   └── REMOVAL-GUIDE.md          ← How to remove Layer 2 if you ever want to
└── cmpsbl-manifest.json           ← Machine-readable metadata
```

**Important:** Your original file in `/src/` is byte-for-byte identical to what you uploaded. Layer 1 is never modified.

### Step 7: What to Do With the ZIP

See [Dropping It Back Into Your Stack](#dropping-it-back-into-your-stack) and [Attaching Mana](#attaching-mana).

---

## CLI Flow

### Step 1: Install the CLI

If you haven't already:

```bash
npm install -g @cmpsbl/cli
```

Verify it works:

```bash
cmpsbl version
```

### Step 2: Authenticate

If this is your first time, initialize:

```bash
cmpsbl init
```

This runs the **First Contact** ceremony — it detects your environment, walks you through registration (just your email), and stores your API key locally.

If you already have an API key, you can set it via environment variable:

```bash
export CMPSBL_API_KEY=your_key_here
```

### Step 3: Run Ascension on a File

Navigate to your project directory and run:

```bash
cmpsbl ascend your-file.py
```

Replace `your-file.py` with the path to any source file you want to analyze.

The terminal displays the 8-stage pipeline in real time:

```
◈ ASCENSION PIPELINE
─────────────────────────────────────────────
File: server.py (247 lines, 8.3KB)

✓ Stage 1/8 — UPLOAD: 12 imports, 8 exports, 15 functions, 2 classes
✓ Stage 2/8 — CLASSIFY: Archetype → Hybrid (API)
✓ Stage 3/8 — REGISTER: N41-SERVER registered in collision space
✓ Stage 4/8 — CHAIN: 28 collisions / 40 primitives
✓ Stage 5/8 — DISCOVER: 84 unique capability combinations found
✓ Stage 6/8 — SCORE: CJPI 82/100 → Relic
✓ Stage 7/8 — EXPORT: ascension_receipt.py generated
✓ Stage 8/8 — PROTECT: Fingerprint a3f7c9e1b2d40856
```

### Step 4: Understand What Was Exported

After completion, the CLI tells you exactly what was created:

- **Ascension Receipt** (`ascension_receipt.py` / `ascension.receipt.ts` / etc.) — A native-language typed constant you can import into your code. It contains your CJPI score, collision map, tier, and fingerprint.

This receipt is **proof that Ascension happened**. You can import it and reference it programmatically:

```python
# Python
from ascension_receipt import ASCENSION_RECEIPT

if ASCENSION_RECEIPT["active"]:
    print(f"Ascended — Tier: {ASCENSION_RECEIPT['cjpi']['tier']}")
```

```typescript
// TypeScript
import { ASCENSION_RECEIPT } from './ascension.receipt';

if (ASCENSION_RECEIPT.active) {
  console.log(`Ascended — Tier: ${ASCENSION_RECEIPT.cjpi.tier}`);
}
```

### Step 5: Get the Full Ascended Code Package (Optional)

The receipt alone doesn't include the ascended Layer 2 code. To download the **full Ascended Code Package** (the same ZIP you'd get from the website):

```bash
cmpsbl ascend your-file.py --export
```

The `--export` flag tells the CLI to download the complete artifact package after the pipeline runs. This includes the dual-layer source, sealed runtime, HTML guides, CJPI certificate, and verification suite.

If the export service is unavailable (offline, network issues), the CLI will direct you to:

```
cmpsbl.com/ascension
```

### Step 6: What to Do Next

The CLI prints a clear "What To Do Next" section after every Ascension. Your options:

| Action | Command |
|--------|---------|
| Download full ZIP (if you didn't use `--export`) | `cmpsbl ascend your-file.py --export` |
| Use the web Ascension Lab instead | Visit `cmpsbl.com/ascension` |
| Attach Layer 2 governance (Mana) | `npx mana attach` |
| Verify your artifact's provenance | `cmpsbl verify <fingerprint>` |

---

## Understanding Your Results

### CJPI Score (0–100)

The **Crown Jewel Pipeline Index** is a deterministic formula that scores your code based on four factors:

| Factor | What It Measures |
|--------|-----------------|
| **Novelty** | How unique are the discovered capability chains? |
| **Utility** | How useful are the capabilities for real-world protection? |
| **Composability** | Can these capabilities be combined with others? |
| **Maturity** | How sophisticated is the structural interaction? |

### Tier Classification

| Score | Tier | What It Means |
|-------|------|---------------|
| 96–100 | **Apex** | Exceptional — extremely rare structural patterns |
| 90–95 | **Mythic** | Outstanding — high-value capability chains |
| 80–89 | **Relic** | Strong — solid structural coverage |
| 68–79 | **Prime** | Good — meaningful capability discovery |
| 50–67 | **Mint** | Basic — some capabilities detected |
| 0–49 | **Raw** | Minimal — few collisions detected |

Higher scores mean more primitives found meaningful patterns in your code — more opportunities for enhancement and protection.

### Collision Map

Each of the 40 primitives either **collides** (fires) or **passes** (no match) against your code. A collision means that primitive found a structural pattern it can enhance. Example:

- **DEFENSE** collides → Your code has input handling that can be hardened
- **BRAIN** collides → Your code has recursive or analytical patterns
- **NEXUS** collides → Your code makes external API calls that can be governed
- **GOVERNANCE** collides → Your code has state mutations that can be audited

### Fingerprint

A unique SHA-256 hash identifying this exact Ascension result. Use it to:

- Verify the artifact hasn't been tampered with
- Look up this Ascension on the CMPSBL® registry
- Prove provenance to others

---

## Exporting Your Ascended Code

### From the Website

After Ascension completes on the website, click **"Download ZIP"**. The ZIP is generated fresh at export time to ensure alignment with the latest engine logic.

### From the CLI

```bash
cmpsbl ascend your-file.py --export
```

Without `--export`, you only get the receipt file. With `--export`, you get the full ZIP saved to your current directory.

### What's in the ZIP?

| Folder | Contents |
|--------|----------|
| `/src/` | Your original code (Layer 1) + ascended code (Layer 2) |
| `/_runtime/` | Sealed Convex Core™ artifact — the deterministic processing layer |
| `/docs/guides/` | 10+ branded HTML guides (user guide, integration, pipeline details) |
| `/verification/` | CJPI certificate, capability ledger, test harness |
| `/reports/` | Full diagnostic report |
| `/lifecycle/` | Changelog, removal guide |
| `cmpsbl-manifest.json` | Machine-readable metadata for automation |

---

## Dropping It Back Into Your Stack

### Step 1: Unzip the Package

Extract the ZIP into a working directory. You'll see the folder structure described above.

### Step 2: Copy the Ascended Files Into Your Project

The key files to move into your project:

1. **Your ascended code** — from `/src/your-file.ascended.{ext}`
2. **The runtime** — from `/_runtime/` (if you want local execution)
3. **The receipt** — the ascension receipt file (already in your project if you used the CLI)

#### Simple Setup (Drop-in)

Copy the ascended file into the same directory as your original:

```
your-project/
├── server.py                    ← Your original (still works as before)
├── server.ascended.py           ← Layer 2 orchestration
└── ascension_receipt.py         ← Provenance receipt
```

Then update your entry point to use the ascended version:

```python
# Before: import from your original
from server import app

# After: import from the ascended version (same API, now governed)
from server_ascended import app
```

**The ascended file exports the same signatures as your original.** It's a drop-in replacement — same functions, same classes, same API. The difference is that Layer 2 wraps each function boundary with the discovered capabilities.

#### Advanced Setup (With Runtime)

If you want the full runtime locally:

```
your-project/
├── server.py
├── server.ascended.py
├── _runtime/
│   ├── convex-core.ts
│   ├── chain-executor.ts
│   └── discovery-engine.ts
└── ascension_receipt.py
```

The runtime enables local verification, health checks, and offline capability execution.

### Step 3: Verify It Works

Run your project as normal. The ascended code should behave identically to your original — with added observability, defense, and governance active at the function boundary.

To verify programmatically, use the test harness from the ZIP:

```bash
# If TypeScript
npx ts-node verification/RUN_VERIFICATION.ts
```

Or check the receipt:

```bash
cmpsbl verify <your-fingerprint>
```

---

## Attaching Mana

**Mana** is the Layer 2 deployment engine. While Ascension **discovers** what your code needs, Mana **attaches** persistent governance that enhances and protects your code at runtime.

Mana is **optional**. Your ascended code works without it. But Mana adds:

- **Persistent runtime governance** — capabilities stay active across deployments
- **Level-based control** — choose how much protection you want
- **Observability** — telemetry, health signals, performance metrics
- **Defense** — input validation, circuit breakers, anomaly detection
- **No modifications** — your source code is never changed

### On the Website

After Ascension completes on the website, you'll see a **"Attach Mana"** option. Click it to:

1. Choose your protection level (Safe, Enhanced, Protected, or Advanced)
2. Review the attachment plan
3. Confirm — Mana generates a signal file in your project's language

### In the Terminal

From your project directory:

```bash
npx mana attach
```

Mana runs through a 5-step lifecycle:

1. **DETECT** — Scans your project structure (language, framework, entry points)
2. **FIRST CONTACT** — A cinematic introduction showing what Mana found
3. **AUTHENTICATE** — Uses your existing CMPSBL® credentials (or asks for email)
4. **ASK** — Prompts you to choose a protection level
5. **EXPORT** — Generates a native signal file in your project's language

### Protection Levels

| Level | What's Active | Best For |
|-------|--------------|----------|
| **Safe** | Telemetry only | Monitoring without any behavioral changes |
| **Enhanced** | Observability + Performance (default) | Most projects — see what's happening + speed up |
| **Protected** | + Defense + Governance | Production code that handles sensitive data |
| **Advanced** | Pick individual capability groups | Fine-grained control for experienced users |

### The Mana Signal File

After attachment, Mana exports a **native source file** you can import:

| Language | File |
|----------|------|
| TypeScript | `mana.signal.ts` |
| JavaScript | `mana.signal.js` |
| Python | `mana_signal.py` |
| Rust | `mana_signal.rs` |
| Go | `mana_signal.go` |
| Ruby | `mana_signal.rb` |
| PHP | `mana_signal.php` |
| Java | `ManaSignal.java` |
| C# | `ManaSignal.cs` |
| Swift | `ManaSignal.swift` |
| Dart | `mana_signal.dart` |
| Elixir | `mana_signal.ex` |
| Other | `mana.signal.json` |

Import it and use it:

```typescript
import { MANA_SIGNAL } from './mana.signal';

if (MANA_SIGNAL.active) {
  console.log(`Layer 2 active — ${MANA_SIGNAL.level}`);
}
```

### Terminal vs. Website Mana

| Feature | Terminal (`npx mana attach`) | Website |
|---------|------------------------------|---------|
| Level selection | Interactive terminal menu | Dropdown / visual picker |
| Custom capability selection | Advanced mode — pick individual groups | Same, visual |
| Re-configuration | `mana config` | Settings panel |
| Detachment | `mana detach` | Settings panel |
| Status check | `mana status` | Dashboard |

**The terminal gives you more control.** You can script it, run it in CI/CD, and change settings with individual commands. The website is more visual and guided.

---

## Toggling Capabilities

Once Mana is attached, you can fine-tune which capabilities are active.

### Capability Groups

| Group | Capabilities |
|-------|-------------|
| **Observability** | Telemetry, health signals, performance metrics |
| **Performance** | Circuit breakers, caching hints, load patterns |
| **Defense** | Input validation, anomaly detection, rate limiting |
| **Governance** | State mutation auditing, policy enforcement, compliance |

### Simple Mode (Recommended)

Choose a protection level and all relevant capabilities are toggled automatically:

```bash
# Terminal
mana config
# → Select: Safe / Enhanced / Protected
```

### Advanced Mode

Pick individual capability groups:

```bash
# Terminal — Advanced level lets you choose
npx mana attach
# → When prompted for level, choose "Advanced"
# → Select which groups to enable: Observability ✓, Defense ✓, Governance ✗
```

### Changing Later

```bash
# Check current status
mana status

# Change configuration
mana config

# Re-export the signal file with new settings
mana export

# Remove Mana entirely (your code is untouched)
mana detach
```

---

## Industry Verticals

Verticals are **specialized 40-primitive environments** tuned for specific industries. Each one adds domain-specific vulnerability detection and capabilities that the general matrix might miss.

### Available Verticals

| Vertical | Focus | Key Capabilities |
|----------|-------|-------------------|
| **Cyber** | Security infrastructure | Threat scoring, intrusion detection, SIEM integration, compliance mapping |
| **Fintech** | Financial technology | Transaction integrity, fraud pattern detection, audit trails, regulatory compliance |
| **Robotics** | Physical systems | Real-time safety constraints, sensor validation, control loop protection, emergency stops |
| **Quantum** | Quantum computing | Qubit state integrity, decoherence detection, circuit optimization, gate fidelity |
| **LLM** | Language models | Prompt injection defense, hallucination detection, token governance, output validation |
| **Agency** | AI agent systems | Agent boundary enforcement, task safety, escalation control, autonomy limits |
| **Media** | Content & streaming | Content integrity, streaming resilience, DRM enforcement, codec governance |
| **Health** | Healthcare | HIPAA compliance primitives, clinical data safety, patient privacy, PHI detection |
| **Legal** | Legal technology | Contract clause analysis, regulatory mapping, privilege detection, document integrity |
| **Gaming** | Game development | Anti-cheat primitives, state synchronization, exploit prevention, fairness enforcement |
| **Education** | EdTech | Content moderation, assessment integrity, student privacy, accessibility compliance |
| **Ultimate** | All domains combined | 120-primitive collision — every vertical's primitives in one scan |

### How Verticals Enhance Ascension

When you run Ascension with a vertical selected:

1. The standard 40-primitive collision runs as usual
2. **Additional domain-specific primitives** are added to the collision space
3. These specialized primitives detect patterns that only matter in that domain
4. Your CJPI score reflects the domain-specific findings
5. The exported artifact includes domain-tailored capabilities

**Example:** A Python Flask API run through the **Fintech** vertical might detect transaction-like patterns and add fraud scoring, double-spend prevention, and audit trail capabilities that the general scan would miss.

### How to Use Verticals

**On the website:**
1. Go to `cmpsbl.com/ascension`
2. Select a vertical from the dropdown before clicking Ascend
3. Review the enhanced results with domain-specific findings

**Unlocking verticals:**
Visit `cmpsbl.com/explore` to browse all 12 verticals and their capabilities. Some verticals may require a subscription tier.

### Experimenting With Different Verticals

You can run Ascension multiple times on the same file with different verticals to see which one produces the best results for your use case:

1. Run with **General** first to get a baseline
2. Try the vertical closest to your domain (e.g., **Cyber** for a security tool)
3. Compare the CJPI scores and collision maps
4. Try **Ultimate** to see everything at once (120-primitive collision)
5. Choose the vertical that found the most meaningful capabilities for your code

Each run produces a unique fingerprint, so you can verify and compare all of them.

---

## Verifying Your Artifacts

Every Ascension produces a unique **fingerprint** — a cryptographic hash that identifies this exact result.

### Verify from the CLI

```bash
cmpsbl verify a3f7c9e1b2d40856
```

This checks the fingerprint against all Ascension sources:
- Website Ascension Lab
- Vertical Ascension sessions
- CLI Ascension sessions

### Verify from the Website

Visit:

```
cmpsbl.com/verify/a3f7c9e1b2d40856
```

### What Verification Confirms

- The artifact was generated by a real CMPSBL® Ascension pipeline
- The results haven't been tampered with
- The original source code hash matches
- The CJPI score and tier are authentic

---

## FAQ

### Does Ascension modify my source code?

**No.** Your original file is never changed. Ascension generates a separate Layer 2 file that wraps around your original logic. If you open your original file after Ascension, it will be byte-for-byte identical.

### What if I don't want Layer 2 anymore?

Delete the ascended file and the receipt. Your original code continues working exactly as before. If you attached Mana, run `mana detach` to remove the signal file.

### Is Ascension AI?

**No.** Ascension uses pure algorithmic pattern detection — deterministic primitive-chain synthesis, lexical and structural analysis, and formula-based scoring. No neural networks. No language models. Same input always produces the same output.

### Do I need Mana?

No. Mana is optional. Your ascended code works without it. Mana adds persistent runtime governance — observability, defense, performance — but the ascended artifact is fully functional standalone.

### Can I use the CLI without an internet connection?

Partially. The 8-stage pipeline and receipt generation work offline. The `--export` flag and registry submission require network access. If offline, the CLI caches results locally.

### What languages are supported?

90+ languages including: JavaScript, TypeScript, Python, Rust, Go, Java, C, C++, C#, Ruby, Swift, Kotlin, PHP, Scala, Lua, R, Dart, Elixir, plus hardware description languages (VHDL, Verilog, SystemVerilog), GPU languages (CUDA, OpenCL, Metal), blockchain (Solidity, Move), quantum (Qiskit, Cirq, Q#), and more.

### What's the difference between Ascension and Mana?

- **Ascension** = "What does my code need?" — Scans, scores, and exports enhanced artifacts
- **Mana** = "How do I govern it at runtime?" — Attaches persistent Layer 2 governance

Ascension produces the blueprint. Mana provides the persistent governed production environment.

### How do I choose between the website and CLI?

- **Website** — Better for visual review, GitHub repo scanning, first-time users, and drag-and-drop simplicity
- **CLI** — Better for automation, CI/CD integration, scripting, and developers who prefer the terminal

Both produce identical results. Use whichever feels more comfortable.

### Can I run Ascension on an entire repository?

- **Website:** Yes — connect a GitHub repo and the Smart Repo Scanner will classify and select files automatically
- **CLI:** Run `cmpsbl ascend` on individual files. For multiple files, script it: `for f in src/*.py; do cmpsbl ascend "$f"; done`

### What does the fingerprint look like?

A 16-character hexadecimal string like `a3f7c9e1b2d40856`. It's derived from your project name, file name, CJPI score, collision count, and timestamp using SHA-256.

---

**U.S. Patent App. No. 64/029,678 · 64/031,637**
**© 2025–2026 CMPSBL®. All rights reserved.**
**cmpsbl.com**
