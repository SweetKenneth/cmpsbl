/**
 * CMPSBL® Native Swift — Tier 1 Kernel Bodies
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const SWIFT_KERNEL_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'kernel-clock': `${HEADER('Kernel Clock')}
import Foundation

public enum CmpsblClockMode { case system, fixed, monotonic }

public enum CmpsblClock {
    private static let lock = NSLock()
    nonisolated(unsafe) private static var mode: CmpsblClockMode = .system
    nonisolated(unsafe) private static var fixedMs: Int64 = 0
    nonisolated(unsafe) private static var monoMs: Int64 = 0
    nonisolated(unsafe) private static var seed: UInt64 = 0x9E3779B97F4A7C15

    public static func setMode(_ m: CmpsblClockMode) { lock.lock(); defer { lock.unlock() }; mode = m }

    public static func setFixed(_ ms: Int64) {
        lock.lock(); defer { lock.unlock() }
        mode = .fixed; fixedMs = ms
    }

    public static func nowMs() -> Int64 {
        lock.lock(); defer { lock.unlock() }
        switch mode {
        case .fixed: return fixedMs
        case .monotonic: monoMs += 1; return monoMs
        case .system: return Int64(Date().timeIntervalSince1970 * 1000)
        }
    }

    public static func uuid() -> String {
        lock.lock(); defer { lock.unlock() }
        seed = seed &* 6364136223846793005 &+ 1442695040888963407
        let a = seed
        let b = seed &* 0x9E3779B97F4A7C15
        return String(format: "%016llx-%016llx", a, b)
    }
}`,

  'capability-registry': `${HEADER('Capability Registry')}
import Foundation

public enum CmpsblRegistryError: Error { case unknownCapability(String) }

public enum CmpsblRegistry {
    private static let lock = NSLock()
    nonisolated(unsafe) private static var handlers: [String: (String) -> String] = [:]

    public static func register(_ name: String, _ handler: @escaping (String) -> String) {
        lock.lock(); defer { lock.unlock() }
        handlers[name] = handler
    }

    public static func has(_ name: String) -> Bool {
        lock.lock(); defer { lock.unlock() }
        return handlers[name] != nil
    }

    public static func dispatch(_ name: String, _ payload: String) throws -> String {
        lock.lock()
        let h = handlers[name]
        lock.unlock()
        guard let h = h else { throw CmpsblRegistryError.unknownCapability(name) }
        return h(payload)
    }

    public static func list() -> [String] {
        lock.lock(); defer { lock.unlock() }
        return handlers.keys.sorted()
    }

    public static func count() -> Int {
        lock.lock(); defer { lock.unlock() }
        return handlers.count
    }
}`,

  'kernel-bootstrap': `${HEADER('Kernel Bootstrap')}
import Foundation

public enum CmpsblBootStatus: String { case cold, booting, ready, degraded, shutdown }

public final class CmpsblKernelHandle {
    public var status: CmpsblBootStatus = .cold
    public var startedMs: Int64 = 0
    public var components: [String] = []
}

public enum CmpsblBoot {
    private static let lock = NSLock()
    nonisolated(unsafe) private static let handle = CmpsblKernelHandle()

    @discardableResult
    public static func boot() -> Bool {
        lock.lock(); defer { lock.unlock() }
        if handle.status == .ready { return true }
        handle.status = .booting
        handle.components = ["clock", "state-store", "contract-validator", "quarantine", "isolated-executor"]
        handle.startedMs = Int64(Date().timeIntervalSince1970 * 1000)
        handle.status = .ready
        return true
    }

    public static func health() -> CmpsblBootStatus {
        lock.lock(); defer { lock.unlock() }
        return handle.status
    }

    public static func shutdown() {
        lock.lock(); defer { lock.unlock() }
        handle.status = .shutdown
        handle.components.removeAll()
    }
}`,
});
