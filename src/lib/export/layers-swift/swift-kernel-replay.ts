/**
 * CMPSBL® Native Swift — Tier 1 Kernel (Replay/Shadow/Effect)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const SWIFT_KERNEL_REPLAY_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'replay-log': `${HEADER('Replay Log')}
import Foundation

public struct CmpsblReplayEntry {
    public let seq: UInt64
    public let ts: Int64
    public let name: String
    public let args: String
    public let result: String
    public let ok: Bool
    public let durationMs: Int64
}

public enum CmpsblReplayLog {
    private static let ringMax = 2048
    private static let lock = NSLock()
    private static var entries: [CmpsblReplayEntry] = []
    private static var seq: UInt64 = 0
    private static var sampleRate: UInt64 = 1

    public static func setSampleRate(_ n: UInt64) {
        lock.lock(); defer { lock.unlock() }
        sampleRate = max(1, n)
    }

    @discardableResult
    public static func record(name: String, args: String, result: String, ok: Bool, durationMs: Int64) -> CmpsblReplayEntry? {
        lock.lock(); defer { lock.unlock() }
        seq += 1
        let s = seq
        if sampleRate > 1 && s % sampleRate != 0 { return nil }
        let e = CmpsblReplayEntry(
            seq: s, ts: Int64(Date().timeIntervalSince1970 * 1000),
            name: name, args: args, result: result, ok: ok, durationMs: durationMs
        )
        entries.append(e)
        if entries.count > ringMax { entries.removeFirst() }
        return e
    }

    public static func entriesFor(_ name: String) -> [CmpsblReplayEntry] {
        lock.lock(); defer { lock.unlock() }
        return entries.filter { $0.name == name }
    }

    public static func all() -> [CmpsblReplayEntry] {
        lock.lock(); defer { lock.unlock() }
        return entries
    }

    public static func length() -> Int {
        lock.lock(); defer { lock.unlock() }
        return entries.count
    }

    public static func reset() {
        lock.lock(); defer { lock.unlock() }
        entries.removeAll(); seq = 0; sampleRate = 1
    }
}`,

  'shadow-execution': `${HEADER('Shadow Execution')}
import Foundation

public struct CmpsblShadowDivergence {
    public let name: String
    public let ts: Int64
    public let prodResult: String
    public let shadowResult: String
    public let prodOk: Bool
    public let shadowOk: Bool
    public let prodDurationMs: Int64
    public let shadowDurationMs: Int64
    public let reason: String
}

public final class CmpsblShadowStats {
    public var runs: UInt64 = 0
    public var matches: UInt64 = 0
    public var divergences: UInt64 = 0
    public var shadowErrors: UInt64 = 0
}

public enum CmpsblShadow {
    public typealias Candidate = (String) throws -> String
    private static let divMax = 256
    private static let lock = NSLock()
    private static var candidates: [String: Candidate] = [:]
    private static var divergences: [CmpsblShadowDivergence] = []
    private static var stats: [String: CmpsblShadowStats] = [:]

    public static func register(name: String, candidate: @escaping Candidate) {
        lock.lock(); defer { lock.unlock() }
        candidates[name] = candidate
        if stats[name] == nil { stats[name] = CmpsblShadowStats() }
    }

    @discardableResult
    public static func unregister(_ name: String) -> Bool {
        lock.lock(); defer { lock.unlock() }
        return candidates.removeValue(forKey: name) != nil
    }

    @discardableResult
    public static func compare(name: String, args: String, prodResult: String, prodOk: Bool, prodDurationMs: Int64) -> String {
        lock.lock()
        guard let candidate = candidates[name] else { lock.unlock(); return prodResult }
        let st = stats[name] ?? CmpsblShadowStats()
        stats[name] = st
        st.runs += 1
        lock.unlock()

        let t0 = Date().timeIntervalSince1970
        var shadowResult = ""
        var shadowOk = true
        var reason = ""
        do { shadowResult = try candidate(args) }
        catch { shadowOk = false; reason = "shadow-throw:\\(error)" }
        let shadowDurationMs = Int64((Date().timeIntervalSince1970 - t0) * 1000)

        lock.lock(); defer { lock.unlock() }
        if shadowOk {
            if shadowResult == prodResult && shadowOk == prodOk {
                st.matches += 1
                return prodResult
            }
            reason = "envelope-mismatch"
        } else {
            st.shadowErrors += 1
        }
        st.divergences += 1
        let d = CmpsblShadowDivergence(
            name: name, ts: Int64(Date().timeIntervalSince1970 * 1000),
            prodResult: prodResult, shadowResult: shadowResult,
            prodOk: prodOk, shadowOk: shadowOk,
            prodDurationMs: prodDurationMs, shadowDurationMs: shadowDurationMs,
            reason: reason
        )
        divergences.append(d)
        if divergences.count > divMax { divergences.removeFirst() }
        return prodResult
    }

    public static func divergencesFor(_ name: String) -> [CmpsblShadowDivergence] {
        lock.lock(); defer { lock.unlock() }
        return divergences.filter { $0.name == name }
    }

    public static func allDivergences() -> [CmpsblShadowDivergence] {
        lock.lock(); defer { lock.unlock() }
        return divergences
    }

    public static func statsFor(_ name: String) -> CmpsblShadowStats? {
        lock.lock(); defer { lock.unlock() }
        return stats[name]
    }

    public static func registered() -> [String] {
        lock.lock(); defer { lock.unlock() }
        return Array(candidates.keys)
    }

    public static func reset() {
        lock.lock(); defer { lock.unlock() }
        candidates.removeAll(); divergences.removeAll(); stats.removeAll()
    }
}`,

  'effect-tracker': `${HEADER('Effect Tracker')}
import Foundation

public enum CmpsblEffectClass: String {
    case pure, io, network, mutation
    public var rank: Int {
        switch self { case .pure: return 0; case .io: return 1
                      case .network: return 2; case .mutation: return 3 }
    }
}

public struct CmpsblEffectViolation {
    public let name: String
    public let declared: CmpsblEffectClass
    public let observed: CmpsblEffectClass
    public let ts: Int64
    public let reason: String
}

public enum CmpsblEffects {
    private static let violMax = 256
    private static let lock = NSLock()
    private static var declared: [String: CmpsblEffectClass] = [:]
    private static var violations: [CmpsblEffectViolation] = []
    private static var strict = false

    public static func setStrict(_ on: Bool) {
        lock.lock(); defer { lock.unlock() }
        strict = on
    }

    public static func declare(name: String, effect: CmpsblEffectClass) {
        lock.lock(); defer { lock.unlock() }
        declared[name] = effect
    }

    public static func declaredFor(_ name: String) -> CmpsblEffectClass? {
        lock.lock(); defer { lock.unlock() }
        return declared[name]
    }

    @discardableResult
    public static func audit(name: String, observed: CmpsblEffectClass) -> Bool {
        lock.lock(); defer { lock.unlock() }
        guard let decl = declared[name] else { return true }
        var violated = false
        var reason = ""
        if strict {
            if observed != decl { violated = true; reason = "strict-mismatch" }
        } else if observed.rank > decl.rank {
            violated = true; reason = "effect-escalation"
        }
        if !violated { return true }
        let v = CmpsblEffectViolation(
            name: name, declared: decl, observed: observed,
            ts: Int64(Date().timeIntervalSince1970 * 1000), reason: reason
        )
        violations.append(v)
        if violations.count > violMax { violations.removeFirst() }
        return false
    }

    public static func violationsFor(_ name: String) -> [CmpsblEffectViolation] {
        lock.lock(); defer { lock.unlock() }
        return violations.filter { $0.name == name }
    }

    public static func allViolations() -> [CmpsblEffectViolation] {
        lock.lock(); defer { lock.unlock() }
        return violations
    }

    public static func reset() {
        lock.lock(); defer { lock.unlock() }
        declared.removeAll(); violations.removeAll(); strict = false
    }
}`,
});
