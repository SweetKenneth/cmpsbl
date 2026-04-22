# 02 — What this is, in plain English

**Audience:** Anyone. No software background required.

---

## The two-sentence version

We invented a way to look at any chunk of computer code and **automatically tell what it can do that even the person who wrote it didn't realize**. Then we invented a way to **wrap rules around that code so it cannot misbehave when it runs anywhere in the world**.

That's it. The first invention is called **Ascension™**. The second is called **Mana™**. We hold provisional U.S. patent applications on both.

---

## Why this matters

Imagine you hire a contractor to build you a house. They hand you the keys. You move in. A year later, you find out the same contractor has been building identical houses across the country, and one of them caught fire because of a wiring shortcut. You wonder: *did mine have that shortcut too? Is anyone watching?*

Software is exactly like that today. Companies ship code, customers run it, and nobody — not even the people who built it — has a real-time, tamper-proof record of **what the code is allowed to do** or **what it actually did**. When something goes wrong, investigators reconstruct it from logs that may have been deleted, modified, or never written.

CMPSBL®'s two inventions fix this from two ends:

- **Ascension** is the inspection. It collides your code against a fixed matrix of 40 architectural building blocks (we call them primitives — things like *DEFENSE*, *MEMORY*, *AUDIT*, *NEXUS*) and reports what your code is structurally capable of. It's deterministic — the same code always produces the same report.
- **Mana** is the wrap. After Ascension reports what your code can do, Mana attaches **rules** to the code. Those rules travel with the code into production. Every time the code is called, the rules check it. Every check produces a tamper-evident receipt that chains back to the previous receipt. You can prove, cryptographically, that the code did what it did and nothing else.

---

## A worked example, no jargon

You wrote a tiny script that backs up a database. It does three things: read the database, compress it, write the compressed file to disk.

**You think it does:** three things.
**Ascension reports it does:** three things — plus it has *latent* MEMORY (it caches), latent AUDIT (it writes to a log file), latent ACCESS (it touches the filesystem), and latent DEFENSE (it could in principle be turned against the very database it's protecting if someone passed in a malicious filename). Ascension scores each of those latencies on four factors — Novelty, Utility, Complexity, Composability — and assigns a *fingerprint* to your script.

**You ask Mana to wrap it.** Mana does not change one byte of your script. It writes a new file that contains your script verbatim, plus a wrapper. The wrapper has rules: "this script may only write to `/var/backups/`," "this script may not be called more than once per minute," "every call must log the user, the timestamp, and the file path." The wrapper enforces those rules at the moment your script is called, every time, on every machine.

If a year later someone asks you "did your backup script ever try to write outside `/var/backups/`?" — you can answer with a cryptographic chain of receipts. Not "I think no." Yes or no, provable, signed.

---

## What's actually new (and patentable)

Three things, in order of how unusual they are:

1. **Discovery as a deterministic collision** — Most "code analysis" tools are statistical (they use AI, they guess, they vary run-to-run). Ours is not. Given the same input code and the same matrix state, Ascension produces the same report, byte-for-byte, every time. This is the **collision pipeline as a method**. Patent claim territory.
2. **Governance that travels inside the code** — Most rule systems live at the perimeter (a firewall, an API gateway, the cloud platform). If you move the code, the rules don't follow. Ours do. The rules are *inside the wrapped file*. Move the wrapped file anywhere — laptop, container, satellite — the rules ride along and enforce. This is **inline governance attachment**.
3. **A receipt chain that proves both** — Every Ascension run and every Mana invocation appends to a Merkle-style chain (each entry's hash includes the previous entry's hash). Cut a link, the whole chain breaks. We use FNV-1a for speed and SHA-256 for trust. The chain is the audit posture. It is what makes the first two things provable rather than just claimed.

---

## What this is NOT

| Claim we don't make | Why people might think we do |
|--|--|
| It's an AI | It looks intelligent, but Ascension uses zero LLM calls. The "intelligence" is the matrix and the collision math. |
| It's a sandbox | Mana doesn't isolate code execution. It observes and gates at function boundaries. The host process still runs. |
| It generates new code | Ascension surfaces structural relationships that already exist. It doesn't synthesize anything. |
| It rewrites your code | Mana wraps your code. The original bytes are byte-for-byte preserved (we verify with SHA-256 at every wrap). |
| It's a static analyzer | Static analyzers run once at build time. Ours runs at every invocation. |

---

## Who needs this

- **Regulated industries** (finance, healthcare, defense) — they need to prove what their code did, not just claim it
- **Software supply chains** — they need governance that doesn't break when the code crosses an org boundary
- **Open source maintainers** — they want to ship their library and have it remain honest in any consumer's environment
- **Any company that does code review and wants the review to be enforced after merge**

---

## Three numbers worth knowing

| Number | What it is |
|--|--|
| **40** | The fixed matrix size. 12 Organs + 12 Layers + 8 Engines + 8 Agents. This is the universe Ascension collides your code against. |
| **92** | The number of distinct governance capabilities Mana can wrap onto a function. Each maps to a deterministic phase (gate / validate / failsafe / observe / analyze). |
| **2** | The number of provisional patents currently filed: **64/029,678** (Ascension) and **64/031,637** (Mana). |

---

## Where to read next

- If you're an investor: chapter **03 — Investor brief**.
- If you want the history of how this came together: chapter **04 — Invention history**.
- If you want the mathematics: chapter **08** (Ascension pipeline) and **09** (Mana runtime).
- If you don't believe it works: chapter **12** (the reproducible test protocol — run it yourself).

---

© 2025–2026 CMPSBL® · CONFIDENTIAL
