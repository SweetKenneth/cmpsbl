/**
 * CMPSBL® Native Kotlin — Tier 1 Kernel (Replay/Shadow/Effect)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const KOTLIN_KERNEL_REPLAY_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'replay-log': `${HEADER('Replay Log')}
import java.util.ArrayDeque
import java.util.concurrent.atomic.AtomicLong

data class CmpsblReplayEntry(
    val seq: Long,
    val ts: Long,
    val name: String,
    val args: String,
    val result: String,
    val ok: Boolean,
    val durationMs: Long,
)

object CmpsblReplayLog {
    private const val RING_MAX = 2048
    private val lock = Any()
    private val entries = ArrayDeque<CmpsblReplayEntry>()
    private val seq = AtomicLong(0)
    @Volatile private var sampleRate: Long = 1L

    fun setSampleRate(n: Long) { sampleRate = if (n < 1) 1 else n }

    fun record(name: String, args: String, result: String, ok: Boolean, durationMs: Long): CmpsblReplayEntry? {
        val s = seq.incrementAndGet()
        val rate = sampleRate
        if (rate > 1 && s % rate != 0L) return null
        val e = CmpsblReplayEntry(s, System.currentTimeMillis(), name, args, result, ok, durationMs)
        synchronized(lock) {
            entries.addLast(e)
            if (entries.size > RING_MAX) entries.removeFirst()
        }
        return e
    }

    fun entriesFor(name: String): List<CmpsblReplayEntry> = synchronized(lock) {
        entries.filter { it.name == name }
    }
    fun all(): List<CmpsblReplayEntry> = synchronized(lock) { entries.toList() }
    fun length(): Int = synchronized(lock) { entries.size }
    fun reset() = synchronized(lock) {
        entries.clear(); seq.set(0); sampleRate = 1L
    }
}`,

  'shadow-execution': `${HEADER('Shadow Execution')}
import java.util.ArrayDeque
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

data class CmpsblShadowDivergence(
    val name: String, val ts: Long,
    val prodResult: String, val shadowResult: String,
    val prodOk: Boolean, val shadowOk: Boolean,
    val prodDurationMs: Long, val shadowDurationMs: Long,
    val reason: String,
)

class CmpsblShadowStats {
    val runs = AtomicLong(0)
    val matches = AtomicLong(0)
    val divergences = AtomicLong(0)
    val shadowErrors = AtomicLong(0)
}

object CmpsblShadow {
    private const val DIV_MAX = 256
    private val candidates = ConcurrentHashMap<String, (String) -> String>()
    private val stats = ConcurrentHashMap<String, CmpsblShadowStats>()
    private val divLock = Any()
    private val divergences = ArrayDeque<CmpsblShadowDivergence>()

    fun register(name: String, candidate: (String) -> String) {
        candidates[name] = candidate
        stats.computeIfAbsent(name) { CmpsblShadowStats() }
    }

    fun unregister(name: String): Boolean = candidates.remove(name) != null

    fun compare(name: String, args: String, prodResult: String, prodOk: Boolean, prodDurationMs: Long): String {
        val candidate = candidates[name] ?: return prodResult
        val st = stats.computeIfAbsent(name) { CmpsblShadowStats() }
        st.runs.incrementAndGet()
        val t0 = System.currentTimeMillis()
        var shadowResult = ""
        var shadowOk = true
        var reason = ""
        try { shadowResult = candidate(args) }
        catch (t: Throwable) {
            shadowOk = false
            reason = "shadow-throw:" + (t.message ?: "")
            st.shadowErrors.incrementAndGet()
        }
        val shadowDurationMs = System.currentTimeMillis() - t0
        if (shadowOk) {
            if (shadowResult == prodResult && shadowOk == prodOk) {
                st.matches.incrementAndGet()
                return prodResult
            }
            reason = "envelope-mismatch"
        }
        st.divergences.incrementAndGet()
        val d = CmpsblShadowDivergence(
            name, System.currentTimeMillis(),
            prodResult, shadowResult, prodOk, shadowOk,
            prodDurationMs, shadowDurationMs, reason,
        )
        synchronized(divLock) {
            divergences.addLast(d)
            if (divergences.size > DIV_MAX) divergences.removeFirst()
        }
        return prodResult
    }

    fun divergencesFor(name: String): List<CmpsblShadowDivergence> = synchronized(divLock) {
        divergences.filter { it.name == name }
    }
    fun allDivergences(): List<CmpsblShadowDivergence> = synchronized(divLock) { divergences.toList() }
    fun statsFor(name: String): CmpsblShadowStats? = stats[name]
    fun registered(): Set<String> = candidates.keys
    fun reset() {
        candidates.clear(); stats.clear()
        synchronized(divLock) { divergences.clear() }
    }
}`,

  'effect-tracker': `${HEADER('Effect Tracker')}
import java.util.ArrayDeque
import java.util.concurrent.ConcurrentHashMap

enum class CmpsblEffectClass(val rank: Int) {
    PURE(0), IO(1), NETWORK(2), MUTATION(3);
    companion object {
        fun fromString(s: String?): CmpsblEffectClass? = when (s?.lowercase()) {
            "pure" -> PURE; "io" -> IO; "network" -> NETWORK; "mutation" -> MUTATION
            else -> null
        }
    }
}

data class CmpsblEffectViolation(
    val name: String,
    val declared: CmpsblEffectClass,
    val observed: CmpsblEffectClass,
    val ts: Long,
    val reason: String,
)

object CmpsblEffects {
    private const val VIOL_MAX = 256
    private val declared = ConcurrentHashMap<String, CmpsblEffectClass>()
    private val lock = Any()
    private val violations = ArrayDeque<CmpsblEffectViolation>()
    @Volatile private var strict = false

    fun setStrict(on: Boolean) { strict = on }

    fun declare(name: String, effect: CmpsblEffectClass) { declared[name] = effect }

    fun declaredFor(name: String): CmpsblEffectClass? = declared[name]

    fun audit(name: String, observed: CmpsblEffectClass): Boolean {
        val decl = declared[name] ?: return true
        var violated = false
        var reason = ""
        if (strict) {
            if (observed != decl) { violated = true; reason = "strict-mismatch" }
        } else if (observed.rank > decl.rank) {
            violated = true; reason = "effect-escalation"
        }
        if (!violated) return true
        val v = CmpsblEffectViolation(name, decl, observed, System.currentTimeMillis(), reason)
        synchronized(lock) {
            violations.addLast(v)
            if (violations.size > VIOL_MAX) violations.removeFirst()
        }
        return false
    }

    fun violationsFor(name: String): List<CmpsblEffectViolation> = synchronized(lock) {
        violations.filter { it.name == name }
    }
    fun allViolations(): List<CmpsblEffectViolation> = synchronized(lock) { violations.toList() }
    fun reset() {
        declared.clear(); strict = false
        synchronized(lock) { violations.clear() }
    }
}`,
});
