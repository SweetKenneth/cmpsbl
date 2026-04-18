/**
 * CMPSBL® Native Swift — Tier 1 Kernel Emitters (Receipts + Telemetry)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const SWIFT_KERNEL_EMITTER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'receipt-emitter': `${HEADER('Receipt Emitter')}
import Foundation

public struct CmpsblReceipt {
    public let hash: String
    public let prevHash: String?
    public let name: String
    public let argsHash: String
    public let resultHash: String
    public let durationMs: Int64
    public let code: String
    public let ts: Int64
    public let seq: UInt64
}

public enum CmpsblReceipts {
    private static let lock = NSLock()
    private static let ringMax = 1024
    nonisolated(unsafe) private static var chainArr: [CmpsblReceipt] = []
    nonisolated(unsafe) private static var headHash: String? = nil
    nonisolated(unsafe) private static var seq: UInt64 = 0

    private static func fnv1a(_ s: String) -> String {
        var h: UInt32 = 0x811c9dc5
        for b in s.utf8 { h ^= UInt32(b); h = h &* 0x01000193 }
        return String(format: "%08x", h)
    }

    @discardableResult
    public static func emit(name: String, argsHash: String, resultHash: String, durationMs: Int64, code: String) -> CmpsblReceipt {
        lock.lock(); defer { lock.unlock() }
        let prev = headHash
        seq += 1
        let ts = Int64(Date().timeIntervalSince1970 * 1000)
        let prevField = prev.map { "\\"\\($0)\\"" } ?? "null"
        let payload = "{\\"name\\":\\"\\(name)\\",\\"argsHash\\":\\"\\(argsHash)\\",\\"resultHash\\":\\"\\(resultHash)\\",\\"durationMs\\":\\(durationMs),\\"code\\":\\"\\(code)\\",\\"prevHash\\":\\(prevField),\\"seq\\":\\(seq)}"
        let hash = fnv1a(payload)
        let r = CmpsblReceipt(hash: hash, prevHash: prev, name: name, argsHash: argsHash, resultHash: resultHash, durationMs: durationMs, code: code, ts: ts, seq: seq)
        chainArr.append(r)
        if chainArr.count > ringMax { chainArr.removeFirst() }
        headHash = hash
        return r
    }

    public static func head() -> String? { lock.lock(); defer { lock.unlock() }; return headHash }
    public static func length() -> Int { lock.lock(); defer { lock.unlock() }; return chainArr.count }
    public static func chain() -> [CmpsblReceipt] { lock.lock(); defer { lock.unlock() }; return chainArr }

    public static func verify() -> Bool {
        lock.lock(); defer { lock.unlock() }
        for i in 1..<chainArr.count {
            if chainArr[i].prevHash != chainArr[i-1].hash { return false }
        }
        return true
    }

    public static func reset() {
        lock.lock(); defer { lock.unlock() }
        chainArr.removeAll(); headHash = nil; seq = 0
    }
}`,

  'telemetry-bus': `${HEADER('Telemetry Bus')}
import Foundation

public struct CmpsblTelemetryEvent {
    public let event: String
    public let payload: Any?
    public let ts: Int64
    public let seq: UInt64
}

public enum CmpsblTelemetry {
    public typealias Handler = (CmpsblTelemetryEvent) -> Void
    private static let lock = NSLock()
    private static let maxHandlers = 256
    private static let wildcard = "*"
    nonisolated(unsafe) private static var handlers: [String: [Handler]] = [:]
    nonisolated(unsafe) private static var seq: UInt64 = 0

    @discardableResult
    public static func on(_ event: String, _ handler: @escaping Handler) -> Bool {
        lock.lock(); defer { lock.unlock() }
        var list = handlers[event] ?? []
        if list.count >= maxHandlers { return false }
        list.append(handler)
        handlers[event] = list
        return true
    }

    @discardableResult
    public static func off(_ event: String) -> Int {
        lock.lock(); defer { lock.unlock() }
        let n = handlers[event]?.count ?? 0
        handlers.removeValue(forKey: event)
        return n
    }

    @discardableResult
    public static func emit(_ event: String, _ payload: Any? = nil) -> Int {
        lock.lock()
        seq += 1
        let evt = CmpsblTelemetryEvent(event: event, payload: payload, ts: Int64(Date().timeIntervalSince1970 * 1000), seq: seq)
        let direct = handlers[event] ?? []
        let wild = handlers[wildcard] ?? []
        lock.unlock()
        var fired = 0
        for h in direct { h(evt); fired += 1 }
        for h in wild { h(evt); fired += 1 }
        return fired
    }

    public static func channels() -> [String] {
        lock.lock(); defer { lock.unlock() }; return Array(handlers.keys)
    }

    public static func subscriberCount(_ event: String) -> Int {
        lock.lock(); defer { lock.unlock() }; return handlers[event]?.count ?? 0
    }
}

public func cmpsbl_emit(_ event: String, _ payload: Any? = nil) -> Int {
    return CmpsblTelemetry.emit(event, payload)
}`,
});
