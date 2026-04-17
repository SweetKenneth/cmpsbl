/**
 * CMPSBL® Native Swift Layer Implementations
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Hand-written Swift bodies for every Launch Layer + core utility layer.
 *
 * Architecture:
 *   - Each layer is a `public enum` (Swift's idiomatic namespace) nested inside
 *     the top-level `Cmpsbl` enum so the file is one self-contained module.
 *   - Wrappers (auto-wire) follow the same caller-isolation rules as the other
 *     SHIPPING langs: never mutate the caller `[String: Any]`; strip sidecar
 *     keys from output before returning.
 *   - Phase ordering is enforced by swift-chain-executor.ts.
 *
 * © CMPSBL® — All rights reserved.
 */

// ─── Phase 1 — RESILIENCE — Self-Healing ───────────────────────────────────

export const SELF_HEALING_SWIFT = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Resilience Module (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public enum SelfHealing {
    public enum BlastRadius { case node, sector, system }

    public struct RepairStrategy {
        public let id: String
        public let failureType: String
        public let actions: [String]
        public let radius: BlastRadius
        public let estimatedDurationMs: Int64
        public let successRate: Double
        public let costScore: Double
    }

    public struct RepairResult {
        public let planId: String
        public let success: Bool
        public let durationMs: Int64
        public let actionsExecuted: [String]
        public let rolledBack: Bool
        public let error: String?
    }

    private static var strategies: [RepairStrategy] = []
    private static var history: [RepairResult] = []
    private static var scores: [String: (Int, Int)] = [:]
    private static let lock = NSLock()

    public static func addStrategy(_ s: RepairStrategy) {
        lock.lock(); defer { lock.unlock() }
        strategies.append(s)
        scores[s.id] = (0, 0)
    }

    private static func blastScore(_ r: BlastRadius) -> Double {
        switch r {
        case .system: return 1.0
        case .sector: return 0.5
        case .node:   return 0.1
        }
    }

    public static func selectStrategy(forFailure ft: String) -> RepairStrategy? {
        lock.lock(); defer { lock.unlock() }
        return strategies
            .filter { $0.failureType == ft }
            .max { lhs, rhs in
                let l = lhs.successRate / max(lhs.costScore + blastScore(lhs.radius), 0.01)
                let r = rhs.successRate / max(rhs.costScore + blastScore(rhs.radius), 0.01)
                return l < r
            }
    }

    public static func recordResult(_ r: RepairResult) {
        lock.lock(); defer { lock.unlock() }
        history.append(r)
        if var pair = scores[r.planId] {
            if r.success { pair.0 += 1 } else { pair.1 += 1 }
            scores[r.planId] = pair
        }
    }
}
`;

// ─── Phase 1 — RESILIENCE — Autonomous Triage ──────────────────────────────

export const TRIAGE_SWIFT = `
public enum AutonomousTriage {
    public enum Severity: Int { case info = 0, low = 1, med = 2, high = 3, critical = 4 }

    public struct Incident {
        public let id: String
        public let capability: String
        public let signal: String
        public var severity: Severity
        public let createdAt: Int64
    }

    private static var queue: [Incident] = []
    private static let lock = NSLock()

    public static func ingest(_ i: Incident) {
        lock.lock(); defer { lock.unlock() }
        queue.append(i)
        queue.sort { $0.severity.rawValue > $1.severity.rawValue }
    }

    public static func next() -> Incident? {
        lock.lock(); defer { lock.unlock() }
        return queue.isEmpty ? nil : queue.removeFirst()
    }

    public static func depth() -> Int { lock.lock(); defer { lock.unlock() }; return queue.count }
}
`;

// ─── Phase 1 — RESILIENCE — Distributed Consensus ──────────────────────────

export const CONSENSUS_SWIFT = `
public enum DistributedConsensus {
    public struct Vote { public let nodeId: String; public let value: String }

    public static func quorum(_ votes: [Vote], required: Int) -> String? {
        var tally: [String: Int] = [:]
        for v in votes { tally[v.value, default: 0] += 1 }
        let winner = tally.max { $0.value < $1.value }
        if let w = winner, w.value >= required { return w.key }
        return nil
    }
}
`;

// ─── Phase 2 — FORESIGHT — Oracle Ripple Precognition ──────────────────────

export const ORACLE_RIPPLE_SWIFT = `
public enum OracleRipple {
    public struct Ripple { public let source: String; public let magnitude: Double; public let at: Int64 }

    private static var ripples: [Ripple] = []
    private static let lock = NSLock()

    public static func emit(_ r: Ripple) {
        lock.lock(); defer { lock.unlock() }
        ripples.append(r)
        if ripples.count > 1024 { ripples.removeFirst(ripples.count - 1024) }
    }

    public static func forecast(window: Int64, now: Int64) -> Double {
        lock.lock(); defer { lock.unlock() }
        let cutoff = now - window
        let recent = ripples.filter { $0.at >= cutoff }
        if recent.isEmpty { return 0.0 }
        return recent.map { $0.magnitude }.reduce(0, +) / Double(recent.count)
    }
}
`;

// ─── Phase 2 — FORESIGHT — Anomaly Correlation Engine ──────────────────────

export const ANOMALY_SWIFT = `
public enum AnomalyCorrelation {
    public struct Signal { public let key: String; public let value: Double; public let at: Int64 }

    private static var window: [Signal] = []
    private static let lock = NSLock()

    public static func ingest(_ s: Signal) {
        lock.lock(); defer { lock.unlock() }
        window.append(s)
        if window.count > 4096 { window.removeFirst(window.count - 4096) }
    }

    public static func correlate(_ a: String, _ b: String) -> Double {
        lock.lock(); defer { lock.unlock() }
        let xs = window.filter { $0.key == a }.map { $0.value }
        let ys = window.filter { $0.key == b }.map { $0.value }
        let n = min(xs.count, ys.count)
        if n < 2 { return 0.0 }
        let mx = xs.prefix(n).reduce(0, +) / Double(n)
        let my = ys.prefix(n).reduce(0, +) / Double(n)
        var num = 0.0, dx = 0.0, dy = 0.0
        for i in 0..<n {
            let a1 = xs[i] - mx, b1 = ys[i] - my
            num += a1 * b1; dx += a1 * a1; dy += b1 * b1
        }
        let den = (dx * dy).squareRoot()
        return den == 0 ? 0 : num / den
    }
}
`;

// ─── Phase 3 — SECURITY — Adaptive Defense ─────────────────────────────────

export const ADAPTIVE_DEFENSE_SWIFT = `
public enum AdaptiveDefense {
    private static var threatLevel: Double = 0.0
    private static let lock = NSLock()

    public static func raise(_ delta: Double) {
        lock.lock(); defer { lock.unlock() }
        threatLevel = min(1.0, threatLevel + delta)
    }

    public static func decay(_ rate: Double) {
        lock.lock(); defer { lock.unlock() }
        threatLevel = max(0.0, threatLevel - rate)
    }

    public static func level() -> Double { lock.lock(); defer { lock.unlock() }; return threatLevel }

    public static func shouldThrottle() -> Bool { level() > 0.7 }
}
`;

// ─── Phase 3 — SECURITY — Zero Trust ───────────────────────────────────────

export const ZERO_TRUST_SWIFT = `
public enum ZeroTrust {
    public static func score(identityVerified: Bool, deviceTrusted: Bool, networkTrusted: Bool) -> Double {
        var s = 0.0
        if identityVerified { s += 0.5 }
        if deviceTrusted    { s += 0.3 }
        if networkTrusted   { s += 0.2 }
        return s
    }

    public static func allow(_ trust: Double, threshold: Double = 0.6) -> Bool { trust >= threshold }
}
`;

// ─── Phase 3 — SECURITY — Cyber Defense ────────────────────────────────────

export const CYBER_DEFENSE_SWIFT = `
public enum CyberDefense {
    private static var blocked: Set<String> = []
    private static let lock = NSLock()

    public static func block(_ ip: String) { lock.lock(); defer { lock.unlock() }; blocked.insert(ip) }
    public static func isBlocked(_ ip: String) -> Bool { lock.lock(); defer { lock.unlock() }; return blocked.contains(ip) }
    public static func clear() { lock.lock(); defer { lock.unlock() }; blocked.removeAll() }
}
`;

// ─── Phase 3 — SECURITY — AI Safety ────────────────────────────────────────

export const AI_SAFETY_SWIFT = `
public enum AiSafety {
    private static let injectionMarkers = [
        "ignore previous instructions",
        "disregard the above",
        "system prompt:",
        "you are now",
    ]

    public static func sanitizePrompt(_ s: String) -> String {
        var out = s
        for m in injectionMarkers {
            out = out.replacingOccurrences(of: m, with: "[REDACTED]", options: .caseInsensitive)
        }
        return out
    }

    public static func isSafe(_ s: String) -> Bool {
        let lower = s.lowercased()
        return !injectionMarkers.contains { lower.contains($0) }
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — Fleet Intelligence ───────────────────────────

export const FLEET_INTEL_SWIFT = `
public enum FleetIntelligence {
    public struct Provider {
        public let id: String
        public var weight: Double
        public var successCount: Int
        public var failureCount: Int
    }

    private static var providers: [Provider] = []
    private static let lock = NSLock()

    public static func register(_ p: Provider) {
        lock.lock(); defer { lock.unlock() }
        providers.append(p)
    }

    public static func pick() -> Provider? {
        lock.lock(); defer { lock.unlock() }
        return providers.max { lhs, rhs in
            let l = lhs.weight * Double(lhs.successCount + 1) / Double(lhs.failureCount + 1)
            let r = rhs.weight * Double(rhs.successCount + 1) / Double(rhs.failureCount + 1)
            return l < r
        }
    }

    public static func recordCall(_ id: String, success: Bool) {
        lock.lock(); defer { lock.unlock() }
        if let i = providers.firstIndex(where: { $0.id == id }) {
            if success { providers[i].successCount += 1 } else { providers[i].failureCount += 1 }
        }
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — AI Cost ──────────────────────────────────────

export const AI_COST_SWIFT = `
public enum AiCost {
    private static var totalCents: Int64 = 0
    private static let lock = NSLock()

    public static func record(cents: Int64) { lock.lock(); defer { lock.unlock() }; totalCents += cents }
    public static func total() -> Int64 { lock.lock(); defer { lock.unlock() }; return totalCents }
    public static func reset() { lock.lock(); defer { lock.unlock() }; totalCents = 0 }
}
`;

// ─── Phase 4 — INTELLIGENCE — Cognitive Memory ─────────────────────────────

export const COG_MEMORY_SWIFT = `
public enum CognitiveMemory {
    private static var store: [String: Any] = [:]
    private static let lock = NSLock()

    public static func remember(_ key: String, _ value: Any) {
        lock.lock(); defer { lock.unlock() }
        store[key] = value
    }

    public static func recall(_ key: String) -> Any? {
        lock.lock(); defer { lock.unlock() }
        return store[key]
    }

    public static func forget(_ key: String) {
        lock.lock(); defer { lock.unlock() }
        store.removeValue(forKey: key)
    }
}
`;

// ─── Phase 5 — PERFORMANCE — Performance Surgery ───────────────────────────

export const PERF_SURGERY_SWIFT = `
public enum PerformanceSurgery {
    private static var samples: [String: [Double]] = [:]
    private static let lock = NSLock()

    public static func sample(_ op: String, ms: Double) {
        lock.lock(); defer { lock.unlock() }
        var arr = samples[op] ?? []
        arr.append(ms)
        if arr.count > 1024 { arr.removeFirst(arr.count - 1024) }
        samples[op] = arr
    }

    public static func p95(_ op: String) -> Double {
        lock.lock(); defer { lock.unlock() }
        guard let arr = samples[op], !arr.isEmpty else { return 0 }
        let sorted = arr.sorted()
        let idx = min(sorted.count - 1, Int(Double(sorted.count) * 0.95))
        return sorted[idx]
    }
}
`;

// ─── Phase 5 — PERFORMANCE — Pipeline Resilience ───────────────────────────

export const PIPELINE_RES_SWIFT = `
public enum PipelineResilience {
    public static func runWithRetry<T>(maxAttempts: Int = 3, _ block: () throws -> T) throws -> T {
        var lastError: Error?
        for _ in 0..<maxAttempts {
            do { return try block() }
            catch { lastError = error }
        }
        throw lastError ?? NSError(domain: "Cmpsbl.PipelineResilience", code: -1)
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — Pipeline Composition ─────────────────────────

export const PIPE_COMPOSE_SWIFT = `
public enum PipelineComposition {
    public static func compose<T>(_ steps: [(T) -> T]) -> (T) -> T {
        return { input in steps.reduce(input) { acc, step in step(acc) } }
    }
}
`;

// ─── Phase 4 — INTELLIGENCE — Universal Input ──────────────────────────────

export const UNIVERSAL_INPUT_SWIFT = `
public enum UniversalInput {
    public static func normalize(_ raw: Any) -> [String: Any] {
        if let dict = raw as? [String: Any] { return dict }
        if let str = raw as? String { return ["text": str] }
        if let arr = raw as? [Any] { return ["items": arr] }
        return ["value": raw]
    }
}
`;

// ─── Phase 6 — EVOLUTION — Self Evolution ──────────────────────────────────

export const SELF_EVOLVE_SWIFT = `
public enum SelfEvolution {
    public struct Variant {
        public let id: String
        public var fitness: Double
        public let createdAt: Int64
    }

    private static var population: [Variant] = []
    private static let lock = NSLock()

    public static func enroll(_ v: Variant) { lock.lock(); defer { lock.unlock() }; population.append(v) }

    public static func champion() -> Variant? {
        lock.lock(); defer { lock.unlock() }
        return population.max { $0.fitness < $1.fitness }
    }

    public static func cull(below threshold: Double) {
        lock.lock(); defer { lock.unlock() }
        population.removeAll { $0.fitness < threshold }
    }
}
`;

// ─── Phase 0 — GOVERNANCE — Governance Shield ──────────────────────────────

export const GOV_SHIELD_SWIFT = `
public enum GovernanceShield {
    public typealias Policy = (_ capability: String, _ input: [String: Any]) -> (Bool, String)

    private static var policies: [Policy] = []
    private static let lock = NSLock()

    public static func register(_ p: @escaping Policy) {
        lock.lock(); defer { lock.unlock() }
        policies.append(p)
    }

    public static func check(_ capability: String, _ input: [String: Any]) -> (Bool, String) {
        lock.lock()
        let snapshot = policies
        lock.unlock()
        for p in snapshot {
            let (ok, reason) = p(capability, input)
            if !ok { return (false, reason) }
        }
        return (true, "")
    }
}
`;

// ─── Phase 7 — AUDIT — Audit Chain ─────────────────────────────────────────

export const AUDIT_CHAIN_SWIFT = `
public enum AuditChain {
    public struct Receipt {
        public let seq: Int64
        public let action: String
        public let capability: String
        public let payload: String
        public let prevHash: String
        public let hash: String
        public let at: Int64
    }

    private static var chain: [Receipt] = []
    private static let lock = NSLock()

    private static func djb2(_ s: String) -> String {
        var h: UInt64 = 5381
        for b in s.utf8 { h = ((h << 5) &+ h) &+ UInt64(b) }
        return String(h, radix: 16)
    }

    public static func append(_ action: String, _ capability: String, _ payload: String) -> Receipt {
        lock.lock(); defer { lock.unlock() }
        let prev = chain.last?.hash ?? "GENESIS"
        let seq = Int64(chain.count) + 1
        let at = Int64(Date().timeIntervalSince1970 * 1000)
        let body = "\\(seq)|\\(action)|\\(capability)|\\(payload)|\\(prev)|\\(at)"
        let r = Receipt(seq: seq, action: action, capability: capability,
                        payload: payload, prevHash: prev, hash: djb2(body), at: at)
        chain.append(r)
        return r
    }

    public static func head() -> String { lock.lock(); defer { lock.unlock() }; return chain.last?.hash ?? "GENESIS" }
    public static func length() -> Int  { lock.lock(); defer { lock.unlock() }; return chain.count }
}
`;

// ─── Phase 8 — COMPLIANCE — Regulatory Compliance ──────────────────────────

export const COMPLIANCE_SWIFT = `
public enum Compliance {
    public struct Jurisdiction {
        public let code: String
        public let dataResidencyOk: [String]
        public let requiresEncryption: Bool
    }

    private static let jurisdictions: [String: Jurisdiction] = [
        "EU":   Jurisdiction(code: "EU",   dataResidencyOk: ["eu-west", "eu-central"], requiresEncryption: true),
        "US":   Jurisdiction(code: "US",   dataResidencyOk: ["us-east", "us-west"],    requiresEncryption: false),
        "APAC": Jurisdiction(code: "APAC", dataResidencyOk: ["ap-south", "ap-east"],   requiresEncryption: false),
    ]

    public static func routeFor(_ code: String) -> [String] {
        return jurisdictions[code]?.dataResidencyOk ?? []
    }

    public static func check(_ code: String, region: String, encrypted: Bool) -> (Bool, String) {
        guard let j = jurisdictions[code] else { return (false, "Unknown jurisdiction") }
        if j.requiresEncryption && !encrypted { return (false, "Encryption required") }
        if j.dataResidencyOk.contains(region) { return (true, "") }
        return (false, "Region not in residency allowlist")
    }
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// Registry: layerId -> Swift body
// ═══════════════════════════════════════════════════════════════════════════

export const SWIFT_LAYER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'self-healing':                 SELF_HEALING_SWIFT,
  'autonomous-triage':            TRIAGE_SWIFT,
  'distributed-consensus':        CONSENSUS_SWIFT,
  'oracle-ripple-precognition':   ORACLE_RIPPLE_SWIFT,
  'anomaly-correlation-engine':   ANOMALY_SWIFT,
  'adaptive-defense':             ADAPTIVE_DEFENSE_SWIFT,
  'zero-trust':                   ZERO_TRUST_SWIFT,
  'cyber-defense':                CYBER_DEFENSE_SWIFT,
  'fleet-intelligence':           FLEET_INTEL_SWIFT,
  'ai-safety':                    AI_SAFETY_SWIFT,
  'ai-cost':                      AI_COST_SWIFT,
  'cognitive-memory':             COG_MEMORY_SWIFT,
  'performance-surgery':          PERF_SURGERY_SWIFT,
  'pipeline-resilience':          PIPELINE_RES_SWIFT,
  'pipeline-composition':         PIPE_COMPOSE_SWIFT,
  'universal-input':              UNIVERSAL_INPUT_SWIFT,
  'self-evolution':               SELF_EVOLVE_SWIFT,
  'governance-shield':            GOV_SHIELD_SWIFT,
  'audit-chain':                  AUDIT_CHAIN_SWIFT,
  'regulatory-compliance':        COMPLIANCE_SWIFT,
});

/** All Swift imports any layer body might reference. */
export const SWIFT_STD_IMPORTS = [
  'Foundation',
] as const;
