/**
 * CMPSBL® Native Kotlin — Kernel Hardening (Components #15-#20)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const KOTLIN_KERNEL_HARDENING_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'circuit-breaker-recoverable': `${HEADER('Recoverable Circuit Breaker')}
package com.cmpsbl

object CmpsblBreaker {
    enum class State { CLOSED, OPEN, HALF_OPEN }

    data class Config(
        var failureThreshold: Int = 5,
        var cooldownMs: Long = 30000L,
        var successThreshold: Int = 1,
    )

    data class Verdict(val allowed: Boolean, val state: State, val reason: String?)

    private const val QUARANTINE_CYCLES = 3

    private class Entry {
        var config: Config = Config()
        var state: State = State.CLOSED
        var failures = 0
        var successes = 0
        var openCycles = 0
        var openedAt: Long = 0L
    }

    private val lock = Any()
    private val entries = HashMap<String, Entry>()

    private fun nowMs() = System.currentTimeMillis()

    fun declare(name: String, config: Config = Config()) {
        synchronized(lock) {
            val e = Entry(); e.config = config
            entries[name] = e
        }
    }

    fun beforeCall(name: String): Verdict = synchronized(lock) {
        val e = entries[name] ?: return Verdict(true, State.CLOSED, null)
        if (e.state == State.OPEN) {
            if (nowMs() - e.openedAt >= e.config.cooldownMs) {
                e.state = State.HALF_OPEN
                return Verdict(true, State.HALF_OPEN, null)
            }
            return Verdict(false, State.OPEN, "breaker-open")
        }
        Verdict(true, e.state, null)
    }

    fun recordSuccess(name: String) = synchronized(lock) {
        val e = entries[name] ?: return@synchronized
        if (e.state == State.HALF_OPEN) {
            e.successes += 1
            if (e.successes >= e.config.successThreshold) {
                e.failures = 0; e.successes = 0
                e.state = State.CLOSED
            }
        } else if (e.state == State.CLOSED) e.failures = 0
    }

    fun recordFailure(name: String) = synchronized(lock) {
        val e = entries[name] ?: return@synchronized
        if (e.state == State.HALF_OPEN) {
            e.successes = 0
            e.openedAt = nowMs(); e.openCycles += 1
            e.state = State.OPEN
            return@synchronized
        }
        e.failures += 1
        if (e.state == State.CLOSED && e.failures >= e.config.failureThreshold) {
            e.openedAt = nowMs(); e.openCycles += 1
            e.state = State.OPEN
        }
    }

    fun shouldQuarantine(name: String): Boolean = synchronized(lock) {
        (entries[name]?.openCycles ?: 0) >= QUARANTINE_CYCLES
    }
}
`,

  'causality-tracker': `${HEADER('Causality Tracker')}
package com.cmpsbl

import java.security.SecureRandom

object CmpsblCausality {
    data class Span(
        val traceId: String,
        val spanId: String,
        val parentSpanId: String?,
        val name: String,
        val startTs: Long,
        var endTs: Long? = null,
    )

    private const val BUFFER_MAX = 1024
    private val lock = Any()
    private val rand = SecureRandom()
    private val spans = mutableListOf<Span>()
    private val stack = mutableListOf<Span>()

    private fun nowMs() = System.currentTimeMillis()

    private fun randId(): String {
        val b = ByteArray(8)
        rand.nextBytes(b)
        return b.joinToString("") { "%02x".format(it) }
    }

    fun begin(name: String): Span = synchronized(lock) {
        val parent = stack.lastOrNull()
        val span = Span(
            traceId = parent?.traceId ?: randId(),
            spanId = randId(),
            parentSpanId = parent?.spanId,
            name = name,
            startTs = nowMs(),
        )
        stack.add(span)
        spans.add(span)
        if (spans.size > BUFFER_MAX) spans.removeAt(0)
        span
    }

    fun end(spanId: String) = synchronized(lock) {
        val idx = stack.indexOfFirst { it.spanId == spanId }
        if (idx >= 0) {
            stack[idx].endTs = nowMs()
            stack.removeAt(idx)
        }
    }

    fun depth(): Int = synchronized(lock) { stack.size }
    fun count(): Int = synchronized(lock) { spans.size }
}
`,

  'backpressure-governor': `${HEADER('Backpressure Governor')}
package com.cmpsbl

object CmpsblBackpressure {
    data class Limits(var maxConcurrent: Int = 64, var maxQueueDepth: Int = 128)
    data class Verdict(val admitted: Boolean, val reason: String?, val inFlight: Int, val queued: Int)

    private class Entry {
        var limits = Limits()
        var inFlight = 0
        var queued = 0
        var totalAdmitted = 0L
        var totalShed = 0L
    }

    private val lock = Any()
    private val entries = HashMap<String, Entry>()

    fun declare(name: String, limits: Limits = Limits()) = synchronized(lock) {
        val e = Entry(); e.limits = limits
        entries[name] = e
    }

    fun admit(name: String): Verdict = synchronized(lock) {
        val e = entries[name] ?: return Verdict(true, null, 0, 0)
        if (e.inFlight >= e.limits.maxConcurrent) {
            val reason = if (e.queued >= e.limits.maxQueueDepth) "queue-full" else "concurrency-exceeded"
            e.totalShed += 1
            return Verdict(false, reason, e.inFlight, e.queued)
        }
        e.inFlight += 1; e.totalAdmitted += 1
        Verdict(true, null, e.inFlight, e.queued)
    }

    fun release(name: String) = synchronized(lock) {
        val e = entries[name] ?: return@synchronized
        if (e.inFlight > 0) e.inFlight -= 1
    }

    fun saturation(name: String): Double = synchronized(lock) {
        val e = entries[name] ?: return 0.0
        if (e.limits.maxConcurrent == 0) 0.0 else e.inFlight.toDouble() / e.limits.maxConcurrent
    }
}
`,

  'determinism-fingerprint': `${HEADER('Determinism Fingerprint')}
package com.cmpsbl

object CmpsblFingerprint {
    data class Divergence(
        val name: String, val fingerprint: String,
        val expectedHash: String, val actualHash: String, val ts: Long,
    )

    private const val TABLE_MAX = 512
    private const val DIVERGENCE_MAX = 256

    private class Entry { var hash = ""; var hits = 0L; var lastSeen = 0L }

    private val lock = Any()
    private val table = HashMap<String, Entry>()
    private val divergences = mutableListOf<Divergence>()

    private fun nowMs() = System.currentTimeMillis()

    fun fnv1a(s: String): String {
        var h: Int = 0x811c9dc5.toInt()
        for (c in s) {
            h = h xor c.code
            h += (h shl 1) + (h shl 4) + (h shl 7) + (h shl 8) + (h shl 24)
        }
        return String.format("%08x", h.toLong() and 0xffffffffL)
    }

    fun fingerprint(name: String, argsCanonical: String, version: String, envHint: String): String =
        fnv1a("$name|$version|$envHint|$argsCanonical")

    fun hashOutput(outputCanonical: String): String = fnv1a(outputCanonical)

    fun observe(name: String, fingerprint: String, outputHash: String): Boolean = synchronized(lock) {
        val now = nowMs()
        val existing = table[fingerprint]
        if (existing != null) {
            existing.hits += 1; existing.lastSeen = now
            if (existing.hash != outputHash) {
                divergences.add(Divergence(name, fingerprint, existing.hash, outputHash, now))
                if (divergences.size > DIVERGENCE_MAX) divergences.removeAt(0)
                return true
            }
            return false
        }
        if (table.size >= TABLE_MAX) {
            val oldest = table.minByOrNull { it.value.lastSeen }?.key
            if (oldest != null) table.remove(oldest)
        }
        val fresh = Entry().apply { hash = outputHash; hits = 1L; lastSeen = now }
        table[fingerprint] = fresh
        false
    }

    fun divergenceCount(): Int = synchronized(lock) { divergences.size }
}
`,

  'contract-versioning': `${HEADER('Contract Versioning')}
package com.cmpsbl

object CmpsblVersioning {
    data class Resolution(val name: String, val requested: String, val resolved: String, val strategy: String)
    data class Migration(val name: String, val fromVersion: String, val toVersion: String, val ts: Long)

    private const val MIGRATION_LOG_MAX = 128
    private val lock = Any()
    private val versions = HashMap<String, MutableSet<String>>()
    private val migrations = mutableListOf<Migration>()

    private fun parseVersion(v: String): Triple<Int, Int, Int> {
        val parts = v.trim().split('.')
        val out = IntArray(3)
        for (i in 0 until minOf(3, parts.size)) {
            val digits = parts[i].takeWhile { it.isDigit() }
            out[i] = digits.toIntOrNull() ?: 0
        }
        return Triple(out[0], out[1], out[2])
    }

    private fun compareTriple(a: Triple<Int, Int, Int>, b: Triple<Int, Int, Int>): Int {
        if (a.first != b.first) return a.first - b.first
        if (a.second != b.second) return a.second - b.second
        return a.third - b.third
    }

    fun register(name: String, version: String) = synchronized(lock) {
        versions.getOrPut(name) { mutableSetOf() }.add(version)
    }

    fun resolveVersion(name: String, requested: String): Resolution = synchronized(lock) {
        val set = versions[name] ?: return Resolution(name, requested, "", "none")
        if (set.isEmpty()) return Resolution(name, requested, "", "none")
        if (set.contains(requested)) return Resolution(name, requested, requested, "exact")
        val target = parseVersion(requested)
        val parsed = set.map { it to parseVersion(it) }
            .sortedWith(Comparator { a, b -> compareTriple(b.second, a.second) })
        parsed.firstOrNull { it.second.first == target.first && it.second.second == target.second }?.let {
            return Resolution(name, requested, it.first, "latest-minor")
        }
        parsed.firstOrNull { it.second.first == target.first }?.let {
            return Resolution(name, requested, it.first, "latest-major")
        }
        Resolution(name, requested, parsed[0].first, "latest")
    }

    fun recordMigration(name: String, fromVersion: String, toVersion: String) = synchronized(lock) {
        migrations.add(Migration(name, fromVersion, toVersion, System.currentTimeMillis()))
        if (migrations.size > MIGRATION_LOG_MAX) migrations.removeAt(0)
    }
}
`,

  'saturation-metrics': `${HEADER('Saturation Metrics')}
package com.cmpsbl

object CmpsblSaturation {
    data class Quantiles(val p50: Double, val p95: Double, val p99: Double,
                         val count: Int, val min: Double, val max: Double)
    data class ErrorBudget(val errors: Long, val total: Long, val rate: Double,
                           val budget: Double, val breached: Boolean)

    private const val RESERVOIR_MAX = 512
    private const val DEFAULT_BUDGET = 0.05

    private class Entry {
        val samples = mutableListOf<Double>()
        var errors = 0L
        var total = 0L
        var budget = DEFAULT_BUDGET
        var min = Double.POSITIVE_INFINITY
        var max = Double.NEGATIVE_INFINITY
    }

    private val lock = Any()
    private val entries = HashMap<String, Entry>()

    private fun ensure(name: String): Entry = entries.getOrPut(name) { Entry() }

    fun declare(name: String, errorBudget: Double) = synchronized(lock) {
        val e = Entry(); e.budget = errorBudget; entries[name] = e
    }

    fun observe(name: String, latencyMs: Double) = synchronized(lock) {
        val e = ensure(name)
        if (e.samples.size >= RESERVOIR_MAX) e.samples.removeAt(0)
        e.samples.add(latencyMs)
        e.total += 1
        if (latencyMs < e.min) e.min = latencyMs
        if (latencyMs > e.max) e.max = latencyMs
    }

    fun observeError(name: String) = synchronized(lock) {
        val e = ensure(name); e.errors += 1; e.total += 1
    }

    fun quantiles(name: String): Quantiles = synchronized(lock) {
        val e = entries[name]
        if (e == null || e.samples.isEmpty()) return Quantiles(0.0, 0.0, 0.0, 0, 0.0, 0.0)
        val sorted = e.samples.sorted()
        val n = sorted.size
        fun q(p: Double): Double = sorted[minOf(n - 1, (p * n).toInt())]
        val mn = if (e.min.isInfinite()) 0.0 else e.min
        val mx = if (e.max.isInfinite()) 0.0 else e.max
        Quantiles(q(0.50), q(0.95), q(0.99), n, mn, mx)
    }

    fun errorBudget(name: String): ErrorBudget = synchronized(lock) {
        val e = entries[name]
        if (e == null || e.total == 0L) return ErrorBudget(0L, 0L, 0.0, DEFAULT_BUDGET, false)
        val rate = e.errors.toDouble() / e.total
        ErrorBudget(e.errors, e.total, rate, e.budget, rate > e.budget)
    }
}
`,
});
