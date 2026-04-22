# 02 — What this is, in plain English

**Audience:** Anyone. No software background required.

---

## The two-sentence version

We invented a way to look at any chunk of computer code and **automatically tell what it can do that even the person who wrote it didn't realize**. Then we invented a way to **wrap rules around that code so it cannot misbehave when it runs anywhere in the world**.

The first invention is called **Ascension™**. The second is called **Mana™**. Both are covered by U.S. provisional patent applications.

---

## Why this matters

When companies ship software, customers run it, and nobody — not even the people who built it — has a real-time, tamper-evident record of **what the code is allowed to do** and **what it actually did**. When something goes wrong, investigators reconstruct events from logs that may have been deleted or modified.

Two inventions fix this from two ends:

- **Ascension** is the inspection. It evaluates your code against a fixed catalog of architectural building blocks (we call them primitives) and reports what your code is structurally capable of. It is deterministic — the same code always produces the same report.
- **Mana** is the wrap. After Ascension reports what your code can do, Mana attaches **rules** to the code. The rules travel with the code into production. Every invocation produces a tamper-evident receipt that links back to the previous receipt in a chain.

---

## A worked example

You wrote a small script that backs up a database.

**You think it does:** read the database, compress, write to disk.
**Ascension reports it does:** that, plus latent caching, latent audit-trail writing, latent filesystem access, and latent ability to be redirected to attack the very database it protects if input is hostile. Each latency is scored on four factors and your script gets a fingerprint.

**You ask Mana to wrap it.** Mana writes a new file containing your script verbatim, plus a wrapper. The wrapper has rules: "may only write to `/var/backups/`," "may not run more than once per minute," "every call logs user, timestamp, file path." The wrapper enforces those rules at every call, on every machine.

A year later someone asks: "Did your backup script ever try to write outside `/var/backups/`?" You answer with a chain of cryptographic receipts — not "I think no," but a verifiable yes or no.

---

## What's actually new

1. **Discovery as a deterministic process** — Most code-analysis tools are statistical (they use AI; outputs vary run-to-run). Ours is not. Same input + same matrix state = same output, byte-for-byte, every time.
2. **Governance that travels inside the code** — Most policy systems live at the perimeter (firewall, API gateway, cloud platform). If you move the code, the policy stays behind. Ours moves with the code.
3. **A receipt chain that proves both** — Every Ascension run and every Mana invocation appends to a chain (each entry's hash includes the previous entry's hash). The chain is the audit posture.

---

## What this is NOT

| We don't claim | Why people might think we do |
|---|---|
| It's an AI | Looks intelligent, but uses zero LLM calls. |
| It's a sandbox | Doesn't isolate execution; observes and gates at function boundaries. |
| It generates new code | Surfaces structural relationships that already exist. |
| It rewrites your code | Wraps verbatim source, byte-perfect. |
| It's a static analyzer | Static analyzers run once at build; ours runs at every invocation. |

---

## Three numbers worth knowing

| Number | Meaning |
|---|---|
| **40** | Fixed primitive matrix size (12 Organs + 12 Layers + 8 Engines + 8 Agents). |
| **92** | Distinct governance capabilities Mana can attach to a function. |
| **2** | Filed provisional patents: **64/029,678** and **64/031,637**. |

---

## Where to read next

- Investor: chapter **03**
- History: chapter **04**
- Architecture: chapters **08** and **09**
- Don't believe it works: chapter **12** — run the protocol yourself

---

© 2025–2026 CMPSBL®
