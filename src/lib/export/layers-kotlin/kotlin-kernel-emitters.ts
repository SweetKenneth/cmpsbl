/**
 * CMPSBL® Native Kotlin — Tier 1 Kernel Emitters (Receipts + Telemetry)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const KOTLIN_KERNEL_EMITTER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'receipt-emitter': `${HEADER('Receipt Emitter')}
import java.util.ArrayDeque
import java.util.concurrent.atomic.AtomicLong

data class CmpsblReceipt(
    val hash: String,
    val prevHash: String?,
    val name: String,
    val argsHash: String,
    val resultHash: String,
    val durationMs: Long,
    val code: String,
    val ts: Long,
    val seq: Long,
)

object CmpsblReceipts {
    private const val RING_MAX = 1024
    private val lock = Any()
    private val chain = ArrayDeque<CmpsblReceipt>()
    private var head: String? = null
    private val seq = AtomicLong(0)

    private fun fnv1a(s: String): String {
        var h = 0x811c9dc5.toInt()
        for (ch in s) { h = h xor ch.code; h *= 0x01000193 }
        return "%08x".format(h.toLong() and 0xFFFFFFFFL)
    }

    fun emit(name: String, argsHash: String, resultHash: String, durationMs: Long, code: String): CmpsblReceipt {
        synchronized(lock) {
            val prev = head
            val s = seq.incrementAndGet()
            val ts = System.currentTimeMillis()
            val prevField = prev?.let { "\\"$it\\"" } ?: "null"
            val payload = "{\\"name\\":\\"$name\\",\\"argsHash\\":\\"$argsHash\\",\\"resultHash\\":\\"$resultHash\\",\\"durationMs\\":$durationMs,\\"code\\":\\"$code\\",\\"prevHash\\":$prevField,\\"seq\\":$s}"
            val hash = fnv1a(payload)
            val r = CmpsblReceipt(hash, prev, name, argsHash, resultHash, durationMs, code, ts, s)
            chain.addLast(r)
            if (chain.size > RING_MAX) chain.removeFirst()
            head = hash
            return r
        }
    }

    fun head(): String? = synchronized(lock) { head }
    fun length(): Int = synchronized(lock) { chain.size }
    fun chain(): List<CmpsblReceipt> = synchronized(lock) { chain.toList() }

    fun verify(): Boolean = synchronized(lock) {
        var prev: CmpsblReceipt? = null
        for (r in chain) {
            if (prev != null && r.prevHash != prev!!.hash) return@synchronized false
            prev = r
        }
        true
    }

    fun reset() = synchronized(lock) {
        chain.clear(); head = null; seq.set(0)
    }
}`,

  'telemetry-bus': `${HEADER('Telemetry Bus')}
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicLong

data class CmpsblTelemetryEvent(
    val event: String,
    val payload: Any?,
    val ts: Long,
    val seq: Long,
)

object CmpsblTelemetry {
    private const val MAX_HANDLERS = 256
    private const val WILDCARD = "*"
    private val handlers = ConcurrentHashMap<String, CopyOnWriteArrayList<(CmpsblTelemetryEvent) -> Unit>>()
    private val seq = AtomicLong(0)

    fun on(event: String, handler: (CmpsblTelemetryEvent) -> Unit): Boolean {
        val list = handlers.computeIfAbsent(event) { CopyOnWriteArrayList() }
        if (list.size >= MAX_HANDLERS) return false
        list.add(handler)
        return true
    }

    fun off(event: String): Int = handlers.remove(event)?.size ?: 0

    fun emit(event: String, payload: Any? = null): Int {
        val s = seq.incrementAndGet()
        val evt = CmpsblTelemetryEvent(event, payload, System.currentTimeMillis(), s)
        var fired = 0
        for (ch in arrayOf(event, WILDCARD)) {
            val list = handlers[ch] ?: continue
            for (h in list) {
                try { h(evt); fired++ } catch (_: Throwable) { }
            }
        }
        return fired
    }

    fun channels(): Set<String> = handlers.keys
    fun subscriberCount(event: String): Int = handlers[event]?.size ?: 0
}

fun cmpsblEmit(event: String, payload: Any? = null): Int = CmpsblTelemetry.emit(event, payload)`,
});
