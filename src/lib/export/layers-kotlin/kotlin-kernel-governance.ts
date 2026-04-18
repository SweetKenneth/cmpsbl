/**
 * CMPSBL® Native Kotlin — Tier 1 Kernel (Resource Budget + Health Probe)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const KOTLIN_KERNEL_GOVERNANCE_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'resource-budget-gate': `${HEADER('Resource Budget Gate')}
import java.util.ArrayDeque

data class CmpsblBudget(
    val maxWallMs: Long? = null,
    val maxMemoryBytes: Long? = null,
    val maxDepth: Int? = null,
)

data class CmpsblBudgetVerdict(val allowed: Boolean, val reason: String?, val strikes: Int)

data class CmpsblBudgetBreach(
    val name: String, val kind: String,
    val observed: Long, val limit: Long, val ts: Long,
)

object CmpsblBudgetGate {
    private const val BREACH_MAX = 256
    private const val STRIKE_THRESHOLD = 3
    private val lock = Any()
    private val budgets = HashMap<String, CmpsblBudget>()
    private val depth = HashMap<String, Int>()
    private val strikes = HashMap<String, Int>()
    private val breaches = ArrayDeque<CmpsblBudgetBreach>()

    fun declare(name: String, b: CmpsblBudget) = synchronized(lock) { budgets[name] = b }

    private fun strike(name: String, kind: String, observed: Long, limit: Long): Int {
        val n = (strikes[name] ?: 0) + 1
        strikes[name] = n
        breaches.addLast(CmpsblBudgetBreach(name, kind, observed, limit, System.currentTimeMillis()))
        while (breaches.size > BREACH_MAX) breaches.removeFirst()
        return n
    }

    fun enter(name: String): CmpsblBudgetVerdict = synchronized(lock) {
        val cur = depth[name] ?: 0
        val b = budgets[name]
        if (b?.maxDepth != null && cur >= b.maxDepth) {
            val n = strike(name, "depth", (cur + 1).toLong(), b.maxDepth.toLong())
            return CmpsblBudgetVerdict(false, "depth-exceeded", n)
        }
        depth[name] = cur + 1
        CmpsblBudgetVerdict(true, null, strikes[name] ?: 0)
    }

    fun exit(name: String, wallMs: Long, memBytes: Long? = null): CmpsblBudgetVerdict = synchronized(lock) {
        val cur = depth[name] ?: 1
        depth[name] = maxOf(0, cur - 1)
        val b = budgets[name] ?: return CmpsblBudgetVerdict(true, null, strikes[name] ?: 0)
        var reason: String? = null
        if (b.maxWallMs != null && wallMs > b.maxWallMs) {
            strike(name, "wall-time", wallMs, b.maxWallMs)
            reason = "wall-time-exceeded"
        }
        if (memBytes != null && b.maxMemoryBytes != null && memBytes > b.maxMemoryBytes) {
            strike(name, "memory", memBytes, b.maxMemoryBytes)
            reason = if (reason == null) "memory-exceeded" else "\${reason}+memory-exceeded"
        }
        CmpsblBudgetVerdict(reason == null, reason, strikes[name] ?: 0)
    }

    fun shouldQuarantine(name: String): Boolean = synchronized(lock) {
        (strikes[name] ?: 0) >= STRIKE_THRESHOLD
    }

    fun strikesFor(name: String): Int = synchronized(lock) { strikes[name] ?: 0 }
    fun clearStrikes(name: String) = synchronized(lock) { strikes.remove(name); Unit }
    fun allBreaches(): List<CmpsblBudgetBreach> = synchronized(lock) { breaches.toList() }
    fun declaredAll(): List<String> = synchronized(lock) { budgets.keys.sorted() }
    fun reset() = synchronized(lock) {
        budgets.clear(); depth.clear(); strikes.clear(); breaches.clear()
    }
}`,

  'kernel-health-probe': `${HEADER('Kernel Health Probe')}
data class CmpsblHealthReport(
    val quartet: String, val store: String,
    val contracts: Int, val quarantined: Int,
    val executions: Long, val receipts: Long,
    val budgetStrikes: Int, val ts: Long,
)

object CmpsblHealth {
    private val lock = Any()
    private val surfaces = HashMap<String, Boolean>()
    private val counters = HashMap<String, Long>()

    fun registerSurface(name: String, present: Boolean) = synchronized(lock) {
        surfaces[name] = present
    }

    fun setCounter(name: String, value: Long) = synchronized(lock) {
        counters[name] = value
    }

    fun probe(): CmpsblHealthReport = synchronized(lock) {
        val count = listOf("contracts", "quarantine", "executor", "budget")
            .count { surfaces[it] == true }
        val quartet = when {
            count == 4 -> "ok"
            count > 0 -> "degraded"
            else -> "down"
        }
        val store = if (surfaces["store"] == true) "ok" else "down"
        CmpsblHealthReport(
            quartet = quartet, store = store,
            contracts = (counters["contracts"] ?: 0L).toInt(),
            quarantined = (counters["quarantined"] ?: 0L).toInt(),
            executions = counters["executions"] ?: 0L,
            receipts = counters["receipts"] ?: 0L,
            budgetStrikes = (counters["budget_strikes"] ?: 0L).toInt(),
            ts = System.currentTimeMillis(),
        )
    }
}`,
});
