/**
 * CMPSBL® Native Kotlin Layer Implementations
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Hand-written Kotlin bodies for every Launch Layer + core utility layer.
 *
 * Architecture:
 *   - Each layer is a Kotlin `object` (singleton namespace) nested inside the
 *     top-level `Cmpsbl` object so the file is one self-contained module.
 *   - Wrappers (auto-wire) follow the same caller-isolation rules as the other
 *     SHIPPING langs: never mutate the caller `MutableMap<String, Any>`; strip
 *     sidecar keys from output before returning.
 *   - Phase ordering is enforced by the polyglot template engine.
 *
 * © CMPSBL® — All rights reserved.
 */

// ─── Phase 1 — RESILIENCE — Self-Healing ───────────────────────────────────

export const SELF_HEALING_KOTLIN = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Resilience Module (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
object SelfHealing {
    enum class BlastRadius { NODE, SECTOR, SYSTEM }

    data class RepairStrategy(
        val id: String,
        val failureType: String,
        val actions: List<String>,
        val radius: BlastRadius,
        val estimatedDurationMs: Long,
        val successRate: Double,
        val costScore: Double,
    )

    data class RepairResult(
        val planId: String,
        val success: Boolean,
        val durationMs: Long,
        val actionsExecuted: List<String>,
        val rolledBack: Boolean,
        val error: String?,
    )

    private val strategies = mutableListOf<RepairStrategy>()
    private val history = mutableListOf<RepairResult>()
    private val scores = mutableMapOf<String, IntArray>()
    private val lock = Any()

    fun addStrategy(s: RepairStrategy) = synchronized(lock) {
        strategies.add(s)
        scores[s.id] = intArrayOf(0, 0)
    }

    private fun blastScore(r: BlastRadius): Double = when (r) {
        BlastRadius.SYSTEM -> 1.0
        BlastRadius.SECTOR -> 0.5
        BlastRadius.NODE -> 0.1
    }

    fun selectStrategy(failureType: String): RepairStrategy? = synchronized(lock) {
        strategies.filter { it.failureType == failureType }
            .maxByOrNull { it.successRate / maxOf(it.costScore + blastScore(it.radius), 0.01) }
    }

    fun recordResult(r: RepairResult) = synchronized(lock) {
        history.add(r)
        scores[r.planId]?.let { if (r.success) it[0]++ else it[1]++ }
    }
}
`;

// ─── Phase 1 — RESILIENCE — Autonomous Triage ──────────────────────────────

export const TRIAGE_KOTLIN = `
object AutonomousTriage {
    enum class Severity(val rank: Int) { INFO(0), LOW(1), MED(2), HIGH(3), CRITICAL(4) }

    data class Incident(
        val id: String,
        val capability: String,
        val signal: String,
        val severity: Severity,
        val createdAt: Long,
    )

    private val queue = mutableListOf<Incident>()
    private val lock = Any()

    fun ingest(i: Incident) = synchronized(lock) {
        queue.add(i)
        queue.sortByDescending { it.severity.rank }
    }

    fun next(): Incident? = synchronized(lock) {
        if (queue.isEmpty()) null else queue.removeAt(0)
    }

    fun depth(): Int = synchronized(lock) { queue.size }
}
`;

// ─── Phase 1 — RESILIENCE — Distributed Consensus ──────────────────────────

export const CONSENSUS_KOTLIN = `
object DistributedConsensus {
    data class Vote(val nodeId: String, val value: String)

    fun quorum(votes: List<Vote>, required: Int): String? {
        val tally = mutableMapOf<String, Int>()
        for (v in votes) tally[v.value] = (tally[v.value] ?: 0) + 1
        val winner = tally.maxByOrNull { it.value }
        return if (winner != null && winner.value >= required) winner.key else null
    }
}
`;

// ─── Phase 2 — FORESIGHT — Oracle Ripple Precognition ──────────────────────

export const ORACLE_RIPPLE_KOTLIN = `
object OracleRipple {
    data class Ripple(val source: String, val magnitude: Double, val at: Long)

    private val ripples = mutableListOf<Ripple>()
    private val lock = Any()

    fun emit(r: Ripple) = synchronized(lock) {
        ripples.add(r)
        if (ripples.size > 1024) ripples.subList(0, ripples.size - 1024).clear()
    }

    fun forecast(window: Long, now: Long): Double = synchronized(lock) {
        val cutoff = now - window
        val recent = ripples.filter { it.at >= cutoff }
        if (recent.isEmpty()) 0.0 else recent.sumOf { it.magnitude } / recent.size
    }
}
`;

// ─── Phase 2 — FORESIGHT — Anomaly Correlation Engine ──────────────────────

export const ANOMALY_KOTLIN = `
object AnomalyCorrelation {
    data class Signal(val key: String, val value: Double, val at: Long)

    private val window = mutableListOf<Signal>()
    private val lock = Any()

    fun ingest(s: Signal) = synchronized(lock) {
        window.add(s)
        if (window.size > 4096) window.subList(0, window.size - 4096).clear()
    }

    fun correlate(a: String, b: String): Double = synchronized(lock) {
        val xs = window.filter { it.key == a }.map { it.value }
        val ys = window.filter { it.key == b }.map { it.value }
        val n = minOf(xs.size, ys.size)
        if (n < 2) return@synchronized 0.0
        val mx = xs.take(n).sum() / n
        val my = ys.take(n).sum() / n
        var num = 0.0; var dx = 0.0; var dy = 0.0
        for (i in 0 until n) {
            val a1 = xs[i] - mx; val b1 = ys[i] - my
            num += a1 * b1; dx += a1 * a1; dy += b1 * b1
        }
        val den = kotlin.math.sqrt(dx * dy)
        if (den == 0.0) 0.0 else num / den
    }
}
`;

// ─── Phase 3 — SECURITY — Adaptive Defense ─────────────────────────────────

export const ADAPTIVE_DEFENSE_KOTLIN = `
object AdaptiveDefense {
    private var threatLevel: Double = 0.0
    private val lock = Any()

    fun raise(delta: Double) = synchronized(lock) { threatLevel = minOf(1.0, threatLevel + delta) }
    fun decay(rate: Double) = synchronized(lock) { threatLevel = maxOf(0.0, threatLevel - rate) }
    fun level(): Double = synchronized(lock) { threatLevel }
    fun shouldThrottle(): Boolean = level() > 0.7
}
`;

// ─── Phase 3 — SECURITY — Zero Trust ───────────────────────────────────────

export const ZERO_TRUST_KOTLIN = `
object ZeroTrust {
    fun score(identityVerified: Boolean, deviceTrusted: Boolean, networkTrusted: Boolean): Double {
        var s = 0.0
        if (identityVerified) s += 0.5
        if (deviceTrusted)    s += 0.3
        if (networkTrusted)   s += 0.2
        return s
    }

    fun allow(trust: Double, threshold: Double = 0.6): Boolean = trust >= threshold
}
`;

// ─── Phase 3 — SECURITY — Cyber Defense ────────────────────────────────────

export const CYBER_DEFENSE_KOTLIN = `
object CyberDefense {
    private val blocked = mutableSetOf<String>()
    private val lock = Any()

    fun block(ip: String) = synchronized(lock) { blocked.add(ip) }
    fun isBlocked(ip: String): Boolean = synchronized(lock) { blocked.contains(ip) }
    fun clear() = synchronized(lock) { blocked.clear() }
}
`;

// ─── Phase 3 — SECURITY — AI Safety ────────────────────────────────────────

export const AI_SAFETY_KOTLIN = `
object AiSafety {
    private val injectionMarkers = listOf(
        "ignore previous instructions",
        "disregard the above",
        "system prompt:",
        "you are now",
    )

    fun sanitizePrompt(s: String): String {
        var out = s
        for (m in injectionMarkers) {
            out = out.replace(Regex(Regex.escape(m), RegexOption.IGNORE_CASE), "[REDACTED]")
        }
        return out
    }

    /** Deep-sanitize: walks nested Map/List. Framework keys (_cmpsbl_/__cmpsbl_) pass through. */
    @Suppress("UNCHECKED_CAST")
    fun sanitizeDeep(v: Any?): Any? = when (v) {
        is String -> sanitizePrompt(v)
        is List<*> -> v.map { sanitizeDeep(it) }
        is Map<*, *> -> {
            val out = linkedMapOf<String, Any?>()
            for ((rawK, value) in v) {
                val k = rawK?.toString() ?: ""
                if (k.startsWith("_cmpsbl_") || k.startsWith("__cmpsbl_")) out[k] = value
                else out[k] = sanitizeDeep(value)
            }
            out
        }
        else -> v
    }

    fun isSafe(s: String): Boolean {
        val lower = s.lowercase()
        return injectionMarkers.none { lower.contains(it) }
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — Fleet Intelligence ───────────────────────────

export const FLEET_INTEL_KOTLIN = `
object FleetIntelligence {
    data class Provider(
        val id: String,
        var weight: Double,
        var successCount: Int,
        var failureCount: Int,
    )

    private val providers = mutableListOf<Provider>()
    private val lock = Any()

    fun register(p: Provider) = synchronized(lock) { providers.add(p) }

    fun pick(): Provider? = synchronized(lock) {
        providers.maxByOrNull {
            it.weight * (it.successCount + 1).toDouble() / (it.failureCount + 1).toDouble()
        }
    }

    fun recordCall(id: String, success: Boolean) = synchronized(lock) {
        providers.find { it.id == id }?.let {
            if (success) it.successCount++ else it.failureCount++
        }
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — AI Cost ──────────────────────────────────────

export const AI_COST_KOTLIN = `
object AiCost {
    private var totalCents: Long = 0
    private val lock = Any()

    fun record(cents: Long) = synchronized(lock) { totalCents += cents }
    fun total(): Long = synchronized(lock) { totalCents }
    fun reset() = synchronized(lock) { totalCents = 0 }
}
`;

// ─── Phase 4 — INTELLIGENCE — Cognitive Memory ─────────────────────────────

export const COG_MEMORY_KOTLIN = `
object CognitiveMemory {
    private val store = mutableMapOf<String, Any>()
    private val lock = Any()

    /** Strip framework-internal sidecar keys before persisting Map values. */
    @Suppress("UNCHECKED_CAST")
    private fun stripSidecars(v: Any): Any = when (v) {
        is Map<*, *> -> v.entries
            .filter {
                val k = it.key?.toString() ?: ""
                !k.startsWith("_cmpsbl_") && !k.startsWith("__cmpsbl_")
            }
            .associate { (it.key?.toString() ?: "") to (it.value?.let { v2 -> stripSidecars(v2) } ?: "") }
        is List<*> -> v.map { it?.let { v2 -> stripSidecars(v2) } }
        else -> v
    }

    fun remember(key: String, value: Any) = synchronized(lock) { store[key] = stripSidecars(value) }
    fun recall(key: String): Any? = synchronized(lock) { store[key] }
    fun forget(key: String) = synchronized(lock) { store.remove(key) }
}
`;

// ─── Phase 5 — PERFORMANCE — Performance Surgery ───────────────────────────

export const PERF_SURGERY_KOTLIN = `
object PerformanceSurgery {
    private val samples = mutableMapOf<String, MutableList<Double>>()
    private val lock = Any()

    fun sample(op: String, ms: Double) = synchronized(lock) {
        val arr = samples.getOrPut(op) { mutableListOf() }
        arr.add(ms)
        if (arr.size > 1024) arr.subList(0, arr.size - 1024).clear()
    }

    fun p95(op: String): Double = synchronized(lock) {
        val arr = samples[op] ?: return@synchronized 0.0
        if (arr.isEmpty()) return@synchronized 0.0
        val sorted = arr.sorted()
        val idx = minOf(sorted.size - 1, (sorted.size * 0.95).toInt())
        sorted[idx]
    }
}
`;

// ─── Phase 5 — PERFORMANCE — Pipeline Resilience ───────────────────────────

export const PIPELINE_RES_KOTLIN = `
object PipelineResilience {
    fun <T> runWithRetry(maxAttempts: Int = 3, block: () -> T): T {
        var lastError: Throwable? = null
        repeat(maxAttempts) {
            try { return block() } catch (t: Throwable) { lastError = t }
        }
        throw lastError ?: RuntimeException("Cmpsbl.PipelineResilience: exhausted")
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — Pipeline Composition ─────────────────────────

export const PIPE_COMPOSE_KOTLIN = `
object PipelineComposition {
    fun <T> compose(steps: List<(T) -> T>): (T) -> T = { input ->
        steps.fold(input) { acc, step -> step(acc) }
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — Universal Input ──────────────────────────────

export const UNIVERSAL_INPUT_KOTLIN = `
object UniversalInput {
    @Suppress("UNCHECKED_CAST")
    fun normalize(raw: Any?): MutableMap<String, Any> {
        if (raw is Map<*, *>) return raw.entries.associate { it.key.toString() to (it.value ?: "") }.toMutableMap()
        if (raw is String) return mutableMapOf("text" to raw)
        if (raw is List<*>) return mutableMapOf("items" to raw)
        return mutableMapOf("value" to (raw ?: ""))
    }
}
`;

// ─── Phase 6 — EVOLUTION — Self Evolution ──────────────────────────────────

export const SELF_EVOLVE_KOTLIN = `
object SelfEvolution {
    data class Variant(val id: String, var fitness: Double, val createdAt: Long)

    private val population = mutableListOf<Variant>()
    private val lock = Any()

    fun enroll(v: Variant) = synchronized(lock) { population.add(v) }

    fun champion(): Variant? = synchronized(lock) { population.maxByOrNull { it.fitness } }

    fun cull(threshold: Double) = synchronized(lock) {
        population.removeAll { it.fitness < threshold }
    }
}
`;

// ─── Phase 0 — GOVERNANCE — Governance Shield ──────────────────────────────

export const GOV_SHIELD_KOTLIN = `
object GovernanceShield {
    // Returns Pair(ok, reason)
    private val policies = mutableListOf<(String, MutableMap<String, Any>) -> Pair<Boolean, String>>()
    private val lock = Any()

    fun register(p: (String, MutableMap<String, Any>) -> Pair<Boolean, String>) = synchronized(lock) {
        policies.add(p)
    }

    fun check(capability: String, input: MutableMap<String, Any>): Pair<Boolean, String> {
        val snapshot = synchronized(lock) { policies.toList() }
        for (p in snapshot) {
            val (ok, reason) = p(capability, input)
            if (!ok) return Pair(false, reason)
        }
        return Pair(true, "")
    }
}
`;

// ─── Phase 7 — AUDIT — Audit Chain ─────────────────────────────────────────

export const AUDIT_CHAIN_KOTLIN = `
object AuditChain {
    data class Receipt(
        val seq: Long,
        val action: String,
        val capability: String,
        val payload: String,
        val prevHash: String,
        val hash: String,
        val at: Long,
    )

    private val chain = mutableListOf<Receipt>()
    private val lock = Any()

    private fun djb2(s: String): String {
        var h: ULong = 5381uL
        for (b in s.toByteArray()) h = ((h shl 5) + h) + b.toUByte().toULong()
        return h.toString(16)
    }

    fun append(action: String, capability: String, payload: String): Receipt = synchronized(lock) {
        val prev = chain.lastOrNull()?.hash ?: "GENESIS"
        val seq = (chain.size + 1).toLong()
        val at = System.currentTimeMillis()
        val body = "\${seq}|\${action}|\${capability}|\${payload}|\${prev}|\${at}"
        val r = Receipt(seq, action, capability, payload, prev, djb2(body), at)
        chain.add(r)
        r
    }

    fun head(): String = synchronized(lock) { chain.lastOrNull()?.hash ?: "GENESIS" }
    fun length(): Int = synchronized(lock) { chain.size }
}
`;

// ─── Phase 8 — COMPLIANCE — Regulatory Compliance ──────────────────────────

export const COMPLIANCE_KOTLIN = `
object Compliance {
    data class Jurisdiction(
        val code: String,
        val dataResidencyOk: List<String>,
        val requiresEncryption: Boolean,
    )

    private val jurisdictions = mapOf(
        "EU"   to Jurisdiction("EU",   listOf("eu-west", "eu-central"), true),
        "US"   to Jurisdiction("US",   listOf("us-east", "us-west"),    false),
        "APAC" to Jurisdiction("APAC", listOf("ap-south", "ap-east"),   false),
    )

    fun routeFor(code: String): List<String> = jurisdictions[code]?.dataResidencyOk ?: emptyList()

    fun check(code: String, region: String, encrypted: Boolean): Pair<Boolean, String> {
        val j = jurisdictions[code] ?: return Pair(false, "Unknown jurisdiction")
        if (j.requiresEncryption && !encrypted) return Pair(false, "Encryption required")
        if (region in j.dataResidencyOk) return Pair(true, "")
        return Pair(false, "Region not in residency allowlist")
    }
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// Registry: layerId -> Kotlin body
// ═══════════════════════════════════════════════════════════════════════════

export const KOTLIN_LAYER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'self-healing':                 SELF_HEALING_KOTLIN,
  'autonomous-triage':            TRIAGE_KOTLIN,
  'distributed-consensus':        CONSENSUS_KOTLIN,
  'oracle-ripple-precognition':   ORACLE_RIPPLE_KOTLIN,
  'anomaly-correlation-engine':   ANOMALY_KOTLIN,
  'adaptive-defense':             ADAPTIVE_DEFENSE_KOTLIN,
  'zero-trust':                   ZERO_TRUST_KOTLIN,
  'cyber-defense':                CYBER_DEFENSE_KOTLIN,
  'fleet-intelligence':           FLEET_INTEL_KOTLIN,
  'ai-safety':                    AI_SAFETY_KOTLIN,
  'ai-cost':                      AI_COST_KOTLIN,
  'cognitive-memory':             COG_MEMORY_KOTLIN,
  'performance-surgery':          PERF_SURGERY_KOTLIN,
  'pipeline-resilience':          PIPELINE_RES_KOTLIN,
  'pipeline-composition':         PIPE_COMPOSE_KOTLIN,
  'universal-input':              UNIVERSAL_INPUT_KOTLIN,
  'self-evolution':               SELF_EVOLVE_KOTLIN,
  'governance-shield':            GOV_SHIELD_KOTLIN,
  'audit-chain':                  AUDIT_CHAIN_KOTLIN,
  'regulatory-compliance':        COMPLIANCE_KOTLIN,
});
