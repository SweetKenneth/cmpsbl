/**
 * CMPSBL® Native Swift — Tier 1 Kernel (Resource Budget + Health Probe)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const SWIFT_KERNEL_GOVERNANCE_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'resource-budget-gate': `${HEADER('Resource Budget Gate')}
import Foundation

public struct CmpsblBudget {
    public var maxWallMs: Int64?
    public var maxMemoryBytes: Int64?
    public var maxDepth: Int?
    public init(maxWallMs: Int64? = nil, maxMemoryBytes: Int64? = nil, maxDepth: Int? = nil) {
        self.maxWallMs = maxWallMs; self.maxMemoryBytes = maxMemoryBytes; self.maxDepth = maxDepth
    }
}

public struct CmpsblBudgetVerdict {
    public let allowed: Bool
    public let reason: String?
    public let strikes: Int
}

public struct CmpsblBudgetBreach {
    public let name: String
    public let kind: String
    public let observed: Int64
    public let limit: Int64
    public let ts: Int64
}

public enum CmpsblBudgetGate {
    private static let lock = NSLock()
    nonisolated(unsafe) private static var budgets: [String: CmpsblBudget] = [:]
    nonisolated(unsafe) private static var depth: [String: Int] = [:]
    nonisolated(unsafe) private static var strikes: [String: Int] = [:]
    nonisolated(unsafe) private static var breaches: [CmpsblBudgetBreach] = []
    private static let breachMax = 256
    private static let strikeThreshold = 3

    public static func declare(_ name: String, _ b: CmpsblBudget) {
        lock.lock(); defer { lock.unlock() }
        budgets[name] = b
    }

    private static func strike(_ name: String, _ kind: String, _ observed: Int64, _ limit: Int64) -> Int {
        let n = (strikes[name] ?? 0) + 1
        strikes[name] = n
        breaches.append(CmpsblBudgetBreach(name: name, kind: kind, observed: observed, limit: limit,
            ts: Int64(Date().timeIntervalSince1970 * 1000)))
        if breaches.count > breachMax { breaches.removeFirst() }
        return n
    }

    public static func enter(_ name: String) -> CmpsblBudgetVerdict {
        lock.lock(); defer { lock.unlock() }
        let cur = depth[name] ?? 0
        if let b = budgets[name], let md = b.maxDepth, cur >= md {
            let n = strike(name, "depth", Int64(cur + 1), Int64(md))
            return CmpsblBudgetVerdict(allowed: false, reason: "depth-exceeded", strikes: n)
        }
        depth[name] = cur + 1
        return CmpsblBudgetVerdict(allowed: true, reason: nil, strikes: strikes[name] ?? 0)
    }

    public static func exit(_ name: String, wallMs: Int64, memBytes: Int64? = nil) -> CmpsblBudgetVerdict {
        lock.lock(); defer { lock.unlock() }
        let cur = depth[name] ?? 1
        depth[name] = max(0, cur - 1)
        guard let b = budgets[name] else {
            return CmpsblBudgetVerdict(allowed: true, reason: nil, strikes: strikes[name] ?? 0)
        }
        var reason: String? = nil
        if let mw = b.maxWallMs, wallMs > mw {
            _ = strike(name, "wall-time", wallMs, mw)
            reason = "wall-time-exceeded"
        }
        if let mb = memBytes, let mbl = b.maxMemoryBytes, mb > mbl {
            _ = strike(name, "memory", mb, mbl)
            reason = reason == nil ? "memory-exceeded" : "\\(reason!)+memory-exceeded"
        }
        return CmpsblBudgetVerdict(allowed: reason == nil, reason: reason, strikes: strikes[name] ?? 0)
    }

    public static func shouldQuarantine(_ name: String) -> Bool {
        lock.lock(); defer { lock.unlock() }
        return (strikes[name] ?? 0) >= strikeThreshold
    }

    public static func strikesFor(_ name: String) -> Int {
        lock.lock(); defer { lock.unlock() }
        return strikes[name] ?? 0
    }

    public static func clearStrikes(_ name: String) {
        lock.lock(); defer { lock.unlock() }
        strikes.removeValue(forKey: name)
    }

    public static func allBreaches() -> [CmpsblBudgetBreach] {
        lock.lock(); defer { lock.unlock() }
        return breaches
    }

    public static func declaredAll() -> [String] {
        lock.lock(); defer { lock.unlock() }
        return Array(budgets.keys).sorted()
    }

    public static func reset() {
        lock.lock(); defer { lock.unlock() }
        budgets.removeAll(); depth.removeAll(); strikes.removeAll(); breaches.removeAll()
    }
}`,

  'kernel-health-probe': `${HEADER('Kernel Health Probe')}
import Foundation

public struct CmpsblHealthReport {
    public let quartet: String
    public let store: String
    public let contracts: Int
    public let quarantined: Int
    public let executions: Int64
    public let receipts: Int64
    public let budgetStrikes: Int
    public let ts: Int64
}

public enum CmpsblHealth {
    private static let lock = NSLock()
    nonisolated(unsafe) private static var surfaces: [String: Bool] = [:]
    nonisolated(unsafe) private static var counters: [String: Int64] = [:]

    public static func registerSurface(_ name: String, _ present: Bool) {
        lock.lock(); defer { lock.unlock() }
        surfaces[name] = present
    }

    public static func setCounter(_ name: String, _ value: Int64) {
        lock.lock(); defer { lock.unlock() }
        counters[name] = value
    }

    public static func probe() -> CmpsblHealthReport {
        lock.lock(); defer { lock.unlock() }
        let count = ["contracts", "quarantine", "executor", "budget"].filter { surfaces[$0] == true }.count
        let quartet = count == 4 ? "ok" : count > 0 ? "degraded" : "down"
        let store = surfaces["store"] == true ? "ok" : "down"
        return CmpsblHealthReport(
            quartet: quartet, store: store,
            contracts: Int(counters["contracts"] ?? 0),
            quarantined: Int(counters["quarantined"] ?? 0),
            executions: counters["executions"] ?? 0,
            receipts: counters["receipts"] ?? 0,
            budgetStrikes: Int(counters["budget_strikes"] ?? 0),
            ts: Int64(Date().timeIntervalSince1970 * 1000)
        )
    }
}`,
});
