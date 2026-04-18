/**
 * CMPSBL® Native Swift — Kernel Hardening (Components #15-#20)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const SWIFT_KERNEL_HARDENING_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'circuit-breaker-recoverable': `${HEADER('Recoverable Circuit Breaker')}
import Foundation

public enum CmpsblBreakerState { case closed, open, halfOpen }

public struct CmpsblBreakerConfig {
    public var failureThreshold: Int = 5
    public var cooldownMs: Int64 = 30000
    public var successThreshold: Int = 1
    public init() {}
}

public struct CmpsblBreakerVerdict {
    public let allowed: Bool
    public let state: CmpsblBreakerState
    public let reason: String?
}

public enum CmpsblBreaker {
    private static let quarantineCycles = 3

    private final class Entry {
        var config = CmpsblBreakerConfig()
        var state: CmpsblBreakerState = .closed
        var failures = 0, successes = 0, openCycles = 0
        var openedAt: Int64 = 0
    }

    private static let lock = NSLock()
    private static var entries: [String: Entry] = [:]

    private static func nowMs() -> Int64 { Int64(Date().timeIntervalSince1970 * 1000) }

    public static func declare(name: String, config: CmpsblBreakerConfig = .init()) {
        lock.lock(); defer { lock.unlock() }
        let e = Entry()
        e.config = config
        entries[name] = e
    }

    public static func beforeCall(name: String) -> CmpsblBreakerVerdict {
        lock.lock(); defer { lock.unlock() }
        guard let e = entries[name] else {
            return CmpsblBreakerVerdict(allowed: true, state: .closed, reason: nil)
        }
        if e.state == .open {
            if nowMs() - e.openedAt >= e.config.cooldownMs {
                e.state = .halfOpen
                return CmpsblBreakerVerdict(allowed: true, state: .halfOpen, reason: nil)
            }
            return CmpsblBreakerVerdict(allowed: false, state: .open, reason: "breaker-open")
        }
        return CmpsblBreakerVerdict(allowed: true, state: e.state, reason: nil)
    }

    public static func recordSuccess(name: String) {
        lock.lock(); defer { lock.unlock() }
        guard let e = entries[name] else { return }
        if e.state == .halfOpen {
            e.successes += 1
            if e.successes >= e.config.successThreshold {
                e.failures = 0; e.successes = 0; e.state = .closed
            }
        } else if e.state == .closed {
            e.failures = 0
        }
    }

    public static func recordFailure(name: String) {
        lock.lock(); defer { lock.unlock() }
        guard let e = entries[name] else { return }
        if e.state == .halfOpen {
            e.successes = 0
            e.openedAt = nowMs()
            e.openCycles += 1
            e.state = .open
            return
        }
        e.failures += 1
        if e.state == .closed && e.failures >= e.config.failureThreshold {
            e.openedAt = nowMs()
            e.openCycles += 1
            e.state = .open
        }
    }

    public static func shouldQuarantine(name: String) -> Bool {
        lock.lock(); defer { lock.unlock() }
        return (entries[name]?.openCycles ?? 0) >= quarantineCycles
    }
}
`,

  'causality-tracker': `${HEADER('Causality Tracker')}
import Foundation

public struct CmpsblSpan {
    public let traceId: String
    public let spanId: String
    public let parentSpanId: String?
    public let name: String
    public let startTs: Int64
    public var endTs: Int64?
}

public enum CmpsblCausality {
    private static let bufferMax = 1024
    private static let lock = NSLock()
    private static var spans: [CmpsblSpan] = []
    private static var stack: [CmpsblSpan] = []

    private static func nowMs() -> Int64 { Int64(Date().timeIntervalSince1970 * 1000) }

    private static func randId() -> String {
        var bytes = [UInt8](repeating: 0, count: 8)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return bytes.map { String(format: "%02x", $0) }.joined()
    }

    @discardableResult
    public static func begin(name: String) -> CmpsblSpan {
        lock.lock(); defer { lock.unlock() }
        let traceId: String; let parentId: String?
        if let parent = stack.last {
            traceId = parent.traceId
            parentId = parent.spanId
        } else {
            traceId = randId()
            parentId = nil
        }
        let span = CmpsblSpan(traceId: traceId, spanId: randId(),
                              parentSpanId: parentId, name: name, startTs: nowMs(), endTs: nil)
        stack.append(span)
        spans.append(span)
        if spans.count > bufferMax { spans.removeFirst() }
        return span
    }

    public static func end(spanId: String) {
        lock.lock(); defer { lock.unlock() }
        if let idx = stack.firstIndex(where: { $0.spanId == spanId }) {
            stack[idx].endTs = nowMs()
            stack.remove(at: idx)
        }
    }

    public static func depth() -> Int { lock.lock(); defer { lock.unlock() }; return stack.count }
    public static func count() -> Int { lock.lock(); defer { lock.unlock() }; return spans.count }
}
`,

  'backpressure-governor': `${HEADER('Backpressure Governor')}
import Foundation

public struct CmpsblBackpressureLimits {
    public var maxConcurrent: Int = 64
    public var maxQueueDepth: Int = 128
    public init() {}
}

public struct CmpsblBackpressureVerdict {
    public let admitted: Bool
    public let reason: String?
    public let inFlight: Int
    public let queued: Int
}

public enum CmpsblBackpressure {
    private final class Entry {
        var limits = CmpsblBackpressureLimits()
        var inFlight = 0, queued = 0
        var totalAdmitted: Int64 = 0, totalShed: Int64 = 0
    }

    private static let lock = NSLock()
    private static var entries: [String: Entry] = [:]

    public static func declare(name: String, limits: CmpsblBackpressureLimits = .init()) {
        lock.lock(); defer { lock.unlock() }
        let e = Entry(); e.limits = limits
        entries[name] = e
    }

    public static func admit(name: String) -> CmpsblBackpressureVerdict {
        lock.lock(); defer { lock.unlock() }
        guard let e = entries[name] else {
            return CmpsblBackpressureVerdict(admitted: true, reason: nil, inFlight: 0, queued: 0)
        }
        if e.inFlight >= e.limits.maxConcurrent {
            let reason = e.queued >= e.limits.maxQueueDepth ? "queue-full" : "concurrency-exceeded"
            e.totalShed += 1
            return CmpsblBackpressureVerdict(admitted: false, reason: reason,
                                             inFlight: e.inFlight, queued: e.queued)
        }
        e.inFlight += 1; e.totalAdmitted += 1
        return CmpsblBackpressureVerdict(admitted: true, reason: nil,
                                         inFlight: e.inFlight, queued: e.queued)
    }

    public static func release(name: String) {
        lock.lock(); defer { lock.unlock() }
        if let e = entries[name], e.inFlight > 0 { e.inFlight -= 1 }
    }

    public static func saturation(name: String) -> Double {
        lock.lock(); defer { lock.unlock() }
        guard let e = entries[name], e.limits.maxConcurrent > 0 else { return 0.0 }
        return Double(e.inFlight) / Double(e.limits.maxConcurrent)
    }
}
`,

  'determinism-fingerprint': `${HEADER('Determinism Fingerprint')}
import Foundation

public struct CmpsblDivergence {
    public let name: String
    public let fingerprint: String
    public let expectedHash: String
    public let actualHash: String
    public let ts: Int64
}

public enum CmpsblFingerprint {
    private static let tableMax = 512
    private static let divergenceMax = 256

    private final class Entry { var hash = ""; var hits: Int64 = 0; var lastSeen: Int64 = 0 }

    private static let lock = NSLock()
    private static var table: [String: Entry] = [:]
    private static var divergences: [CmpsblDivergence] = []

    private static func nowMs() -> Int64 { Int64(Date().timeIntervalSince1970 * 1000) }

    public static func fnv1a(_ s: String) -> String {
        var h: UInt32 = 0x811c9dc5
        for byte in s.utf8 {
            h ^= UInt32(byte)
            h = h &+ ((h << 1) &+ (h << 4) &+ (h << 7) &+ (h << 8) &+ (h << 24))
        }
        return String(format: "%08x", h)
    }

    public static func fingerprint(name: String, argsCanonical: String, version: String, envHint: String) -> String {
        return fnv1a("\\(name)|\\(version)|\\(envHint)|\\(argsCanonical)")
    }

    public static func hashOutput(_ outputCanonical: String) -> String { fnv1a(outputCanonical) }

    @discardableResult
    public static func observe(name: String, fingerprint: String, outputHash: String) -> Bool {
        lock.lock(); defer { lock.unlock() }
        let now = nowMs()
        if let existing = table[fingerprint] {
            existing.hits += 1
            existing.lastSeen = now
            if existing.hash != outputHash {
                let d = CmpsblDivergence(name: name, fingerprint: fingerprint,
                                         expectedHash: existing.hash, actualHash: outputHash, ts: now)
                divergences.append(d)
                if divergences.count > divergenceMax { divergences.removeFirst() }
                return true
            }
            return false
        }
        if table.count >= tableMax {
            if let oldest = table.min(by: { $0.value.lastSeen < $1.value.lastSeen })?.key {
                table.removeValue(forKey: oldest)
            }
        }
        let fresh = Entry(); fresh.hash = outputHash; fresh.hits = 1; fresh.lastSeen = now
        table[fingerprint] = fresh
        return false
    }

    public static func divergenceCount() -> Int { lock.lock(); defer { lock.unlock() }; return divergences.count }
}
`,

  'contract-versioning': `${HEADER('Contract Versioning')}
import Foundation

public struct CmpsblVersionResolution {
    public let name: String
    public let requested: String
    public let resolved: String
    public let strategy: String
}

public struct CmpsblMigrationRecord {
    public let name: String
    public let fromVersion: String
    public let toVersion: String
    public let ts: Int64
}

public enum CmpsblVersioning {
    private static let migrationLogMax = 128
    private static let lock = NSLock()
    private static var versions: [String: Set<String>] = [:]
    private static var migrations: [CmpsblMigrationRecord] = []

    private static func nowMs() -> Int64 { Int64(Date().timeIntervalSince1970 * 1000) }

    private static func parseVersion(_ v: String) -> (Int, Int, Int) {
        let parts = v.trimmingCharacters(in: .whitespaces).split(separator: ".")
        var out = [0, 0, 0]
        for i in 0..<min(3, parts.count) {
            let digits = parts[i].prefix(while: { $0.isNumber })
            out[i] = Int(digits) ?? 0
        }
        return (out[0], out[1], out[2])
    }

    private static func compareTriple(_ a: (Int, Int, Int), _ b: (Int, Int, Int)) -> Int {
        if a.0 != b.0 { return a.0 - b.0 }
        if a.1 != b.1 { return a.1 - b.1 }
        return a.2 - b.2
    }

    public static func register(name: String, version: String) {
        lock.lock(); defer { lock.unlock() }
        var s = versions[name] ?? Set<String>()
        s.insert(version)
        versions[name] = s
    }

    public static func resolveVersion(name: String, requested: String) -> CmpsblVersionResolution {
        lock.lock(); defer { lock.unlock() }
        guard let set = versions[name], !set.isEmpty else {
            return CmpsblVersionResolution(name: name, requested: requested, resolved: "", strategy: "none")
        }
        if set.contains(requested) {
            return CmpsblVersionResolution(name: name, requested: requested, resolved: requested, strategy: "exact")
        }
        let target = parseVersion(requested)
        let parsed = set.map { (v: $0, p: parseVersion($0)) }
            .sorted { compareTriple($0.p, $1.p) > 0 }
        if let m = parsed.first(where: { $0.p.0 == target.0 && $0.p.1 == target.1 }) {
            return CmpsblVersionResolution(name: name, requested: requested, resolved: m.v, strategy: "latest-minor")
        }
        if let m = parsed.first(where: { $0.p.0 == target.0 }) {
            return CmpsblVersionResolution(name: name, requested: requested, resolved: m.v, strategy: "latest-major")
        }
        return CmpsblVersionResolution(name: name, requested: requested, resolved: parsed[0].v, strategy: "latest")
    }

    public static func recordMigration(name: String, fromVersion: String, toVersion: String) {
        lock.lock(); defer { lock.unlock() }
        migrations.append(CmpsblMigrationRecord(
            name: name, fromVersion: fromVersion, toVersion: toVersion, ts: nowMs()
        ))
        if migrations.count > migrationLogMax { migrations.removeFirst() }
    }
}
`,

  'saturation-metrics': `${HEADER('Saturation Metrics')}
import Foundation

public struct CmpsblQuantiles {
    public let p50: Double, p95: Double, p99: Double
    public let count: Int
    public let min: Double, max: Double
}

public struct CmpsblErrorBudget {
    public let errors: Int64, total: Int64
    public let rate: Double, budget: Double
    public let breached: Bool
}

public enum CmpsblSaturation {
    private static let reservoirMax = 512
    private static let defaultBudget = 0.05

    private final class Entry {
        var samples: [Double] = []
        var errors: Int64 = 0, total: Int64 = 0
        var budget: Double = defaultBudget
        var minVal: Double = .infinity, maxVal: Double = -.infinity
    }

    private static let lock = NSLock()
    private static var entries: [String: Entry] = [:]

    private static func ensure(_ name: String) -> Entry {
        if let e = entries[name] { return e }
        let e = Entry(); entries[name] = e; return e
    }

    public static func declare(name: String, errorBudget: Double) {
        lock.lock(); defer { lock.unlock() }
        let e = Entry(); e.budget = errorBudget
        entries[name] = e
    }

    public static func observe(name: String, latencyMs: Double) {
        lock.lock(); defer { lock.unlock() }
        let e = ensure(name)
        if e.samples.count >= reservoirMax { e.samples.removeFirst() }
        e.samples.append(latencyMs)
        e.total += 1
        if latencyMs < e.minVal { e.minVal = latencyMs }
        if latencyMs > e.maxVal { e.maxVal = latencyMs }
    }

    public static func observeError(name: String) {
        lock.lock(); defer { lock.unlock() }
        let e = ensure(name); e.errors += 1; e.total += 1
    }

    public static func quantiles(name: String) -> CmpsblQuantiles {
        lock.lock(); defer { lock.unlock() }
        guard let e = entries[name], !e.samples.isEmpty else {
            return CmpsblQuantiles(p50: 0, p95: 0, p99: 0, count: 0, min: 0, max: 0)
        }
        let sorted = e.samples.sorted()
        let n = sorted.count
        func q(_ p: Double) -> Double { sorted[min(n - 1, Int(p * Double(n)))] }
        let mn = e.minVal.isInfinite ? 0 : e.minVal
        let mx = e.maxVal.isInfinite ? 0 : e.maxVal
        return CmpsblQuantiles(p50: q(0.50), p95: q(0.95), p99: q(0.99), count: n, min: mn, max: mx)
    }

    public static func errorBudget(name: String) -> CmpsblErrorBudget {
        lock.lock(); defer { lock.unlock() }
        guard let e = entries[name], e.total > 0 else {
            return CmpsblErrorBudget(errors: 0, total: 0, rate: 0, budget: defaultBudget, breached: false)
        }
        let rate = Double(e.errors) / Double(e.total)
        return CmpsblErrorBudget(errors: e.errors, total: e.total, rate: rate, budget: e.budget, breached: rate > e.budget)
    }
}
`,
});
