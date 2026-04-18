/**
 * CMPSBL® Native C# — Tier 1 Kernel Emitters (Receipts + Telemetry)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const CSHARP_KERNEL_EMITTER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'receipt-emitter': `${HEADER('Receipt Emitter')}
using System;
using System.Collections.Generic;
using System.Threading;

public static class CmpsblReceipts
{
    public sealed class Receipt
    {
        public string Hash { get; init; } = "";
        public string? PrevHash { get; init; }
        public string Name { get; init; } = "";
        public string ArgsHash { get; init; } = "";
        public string ResultHash { get; init; } = "";
        public long DurationMs { get; init; }
        public string Code { get; init; } = "";
        public long Ts { get; init; }
        public long Seq { get; init; }
    }

    private const int RingMax = 1024;
    private static readonly object _lock = new();
    private static readonly LinkedList<Receipt> _chain = new();
    private static string? _head;
    private static long _seq;

    private static string Fnv1a(string s)
    {
        uint h = 0x811c9dc5;
        for (int i = 0; i < s.Length; i++) { h ^= s[i]; h *= 0x01000193; }
        return h.ToString("x8");
    }

    public static Receipt Emit(string name, string argsHash, string resultHash, long durationMs, string code)
    {
        lock (_lock)
        {
            var prev = _head;
            var seq = Interlocked.Increment(ref _seq);
            var ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var prevField = prev == null ? "null" : $"\\"{prev}\\"";
            var payload = $"{{\\"name\\":\\"{name}\\",\\"argsHash\\":\\"{argsHash}\\",\\"resultHash\\":\\"{resultHash}\\",\\"durationMs\\":{durationMs},\\"code\\":\\"{code}\\",\\"prevHash\\":{prevField},\\"seq\\":{seq}}}";
            var hash = Fnv1a(payload);
            var r = new Receipt { Hash = hash, PrevHash = prev, Name = name, ArgsHash = argsHash, ResultHash = resultHash, DurationMs = durationMs, Code = code, Ts = ts, Seq = seq };
            _chain.AddLast(r);
            if (_chain.Count > RingMax) _chain.RemoveFirst();
            _head = hash;
            return r;
        }
    }

    public static string? Head() { lock (_lock) return _head; }
    public static int Length() { lock (_lock) return _chain.Count; }
    public static List<Receipt> Chain() { lock (_lock) return new List<Receipt>(_chain); }

    public static bool Verify()
    {
        lock (_lock)
        {
            Receipt? prev = null;
            foreach (var r in _chain)
            {
                if (prev != null && r.PrevHash != prev.Hash) return false;
                prev = r;
            }
            return true;
        }
    }

    public static void Reset()
    {
        lock (_lock) { _chain.Clear(); _head = null; Interlocked.Exchange(ref _seq, 0); }
    }
}`,

  'telemetry-bus': `${HEADER('Telemetry Bus')}
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;

public static class CmpsblTelemetry
{
    public sealed class Event
    {
        public string Channel { get; init; } = "";
        public object? Payload { get; init; }
        public long Ts { get; init; }
        public long Seq { get; init; }
    }

    private const int MaxHandlers = 256;
    private const string Wildcard = "*";
    private static readonly ConcurrentDictionary<string, List<Action<Event>>> _handlers = new();
    private static long _seq;
    private static readonly object _writeLock = new();

    public static bool On(string evt, Action<Event> handler)
    {
        if (handler == null) return false;
        lock (_writeLock)
        {
            var list = _handlers.GetOrAdd(evt, _ => new List<Action<Event>>());
            if (list.Count >= MaxHandlers) return false;
            list.Add(handler);
            return true;
        }
    }

    public static int Off(string evt)
    {
        lock (_writeLock)
        {
            return _handlers.TryRemove(evt, out var list) ? list.Count : 0;
        }
    }

    public static int Emit(string evt, object? payload = null)
    {
        var seq = Interlocked.Increment(ref _seq);
        var e = new Event { Channel = evt, Payload = payload, Ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), Seq = seq };
        int fired = 0;
        foreach (var ch in new[] { evt, Wildcard })
        {
            if (!_handlers.TryGetValue(ch, out var list)) continue;
            Action<Event>[] snapshot;
            lock (_writeLock) { snapshot = list.ToArray(); }
            foreach (var h in snapshot)
            {
                try { h(e); fired++; } catch { /* isolate */ }
            }
        }
        return fired;
    }

    public static IReadOnlyCollection<string> Channels() => new List<string>(_handlers.Keys);
    public static int SubscriberCount(string evt) =>
        _handlers.TryGetValue(evt, out var list) ? list.Count : 0;
}`,
});
