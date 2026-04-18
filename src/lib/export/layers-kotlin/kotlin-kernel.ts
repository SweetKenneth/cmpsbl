/**
 * CMPSBL® Native Kotlin — Tier 1 Kernel Bodies
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const KOTLIN_KERNEL_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'kernel-clock': `${HEADER('Kernel Clock')}
object CmpsblClock {
    enum class Mode { SYSTEM, FIXED, MONOTONIC }

    private val lock = Any()
    @Volatile private var mode: Mode = Mode.SYSTEM
    @Volatile private var fixedMs: Long = 0L
    @Volatile private var monoMs: Long = 0L
    @Volatile private var seed: ULong = 0x9E3779B97F4A7C15UL

    fun setMode(m: Mode) { synchronized(lock) { mode = m } }
    fun setFixed(ms: Long) { synchronized(lock) { mode = Mode.FIXED; fixedMs = ms } }

    fun nowMs(): Long = synchronized(lock) {
        when (mode) {
            Mode.FIXED -> fixedMs
            Mode.MONOTONIC -> { monoMs += 1; monoMs }
            Mode.SYSTEM -> System.currentTimeMillis()
        }
    }

    fun uuid(): String = synchronized(lock) {
        seed = seed * 6364136223846793005UL + 1442695040888963407UL
        val a = seed
        val b = seed * 0x9E3779B97F4A7C15UL
        "%016x-%016x".format(a.toLong(), b.toLong())
    }
}`,

  'capability-registry': `${HEADER('Capability Registry')}
import java.util.concurrent.ConcurrentHashMap

object CmpsblRegistry {
    private val handlers = ConcurrentHashMap<String, (String) -> String>()

    fun register(name: String, handler: (String) -> String) {
        handlers[name] = handler
    }

    fun has(name: String): Boolean = handlers.containsKey(name)

    fun dispatch(name: String, payload: String): String {
        val h = handlers[name] ?: error("cmpsbl_registry: unknown capability '$name'")
        return h(payload)
    }

    fun list(): List<String> = handlers.keys.sorted()
    fun count(): Int = handlers.size
}`,

  'kernel-bootstrap': `${HEADER('Kernel Bootstrap')}
object CmpsblBoot {
    enum class Status { COLD, BOOTING, READY, DEGRADED, SHUTDOWN }

    class KernelHandle {
        var status: Status = Status.COLD
        var startedMs: Long = 0L
        val components: MutableList<String> = mutableListOf()
    }

    private val lock = Any()
    private val handle = KernelHandle()

    fun boot(): Boolean = synchronized(lock) {
        if (handle.status == Status.READY) return@synchronized true
        handle.status = Status.BOOTING
        handle.components.clear()
        handle.components.addAll(listOf("clock", "state-store", "contract-validator", "quarantine", "isolated-executor"))
        handle.startedMs = System.currentTimeMillis()
        handle.status = Status.READY
        true
    }

    fun health(): Status = synchronized(lock) { handle.status }

    fun shutdown() = synchronized(lock) {
        handle.status = Status.SHUTDOWN
        handle.components.clear()
    }
}`,
});
