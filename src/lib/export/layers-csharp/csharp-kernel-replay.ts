/**
 * CMPSBL® Native C# — Tier 1 Kernel (Replay/Shadow/Effect)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const CSHARP_KERNEL_REPLAY_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'replay-log': `${HEADER('Replay Log')}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

public static class CmpsblReplayLog {
    public sealed class Entry {
        public long Seq; public long Ts; public string Name = "";
        public string Args = ""; public string Result = "";
        public bool Ok; public long DurationMs;
    }

    private const int RingMax = 2048;
    private static readonly object Lock = new object();
    private static readonly LinkedList<Entry> Entries = new LinkedList<Entry>();
    private static long _seq;
    private static long _sampleRate = 1;

    public static void SetSampleRate(long n) {
        Interlocked.Exchange(ref _sampleRate, Math.Max(1, n));
    }

    public static Entry? Record(string name, string args, string result, bool ok, long durationMs) {
        long seq = Interlocked.Increment(ref _seq);
        long rate = Interlocked.Read(ref _sampleRate);
        if (rate > 1 && seq % rate != 0) return null;
        var e = new Entry {
            Seq = seq, Ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Name = name, Args = args, Result = result, Ok = ok, DurationMs = durationMs,
        };
        lock (Lock) {
            Entries.AddLast(e);
            if (Entries.Count > RingMax) Entries.RemoveFirst();
        }
        return e;
    }

    public static List<Entry> EntriesFor(string name) {
        lock (Lock) { return Entries.Where(e => e.Name == name).ToList(); }
    }
    public static List<Entry> All() { lock (Lock) { return Entries.ToList(); } }
    public static int Length() { lock (Lock) { return Entries.Count; } }
    public static void Reset() {
        lock (Lock) { Entries.Clear(); }
        Interlocked.Exchange(ref _seq, 0);
        Interlocked.Exchange(ref _sampleRate, 1);
    }
}`,

  'shadow-execution': `${HEADER('Shadow Execution')}
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

public static class CmpsblShadow {
    public sealed class Divergence {
        public string Name = ""; public long Ts;
        public string ProdResult = ""; public string ShadowResult = "";
        public bool ProdOk; public bool ShadowOk;
        public long ProdDurationMs; public long ShadowDurationMs;
        public string Reason = "";
    }

    public sealed class Stats {
        public long Runs; public long Matches; public long Divergences; public long ShadowErrors;
    }

    private const int DivMax = 256;
    private static readonly ConcurrentDictionary<string, Func<string, string>> Candidates = new();
    private static readonly ConcurrentDictionary<string, Stats> StatsMap = new();
    private static readonly object DivLock = new object();
    private static readonly LinkedList<Divergence> Divergences = new LinkedList<Divergence>();

    public static void Register(string name, Func<string, string> candidate) {
        Candidates[name] = candidate;
        StatsMap.GetOrAdd(name, _ => new Stats());
    }

    public static bool Unregister(string name) => Candidates.TryRemove(name, out _);

    public static string Compare(string name, string args, string prodResult, bool prodOk, long prodDurationMs) {
        if (!Candidates.TryGetValue(name, out var candidate)) return prodResult;
        var stats = StatsMap.GetOrAdd(name, _ => new Stats());
        Interlocked.Increment(ref stats.Runs);
        var t0 = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        string shadowResult = "";
        bool shadowOk = true;
        string reason = "";
        try { shadowResult = candidate(args); }
        catch (Exception ex) {
            shadowOk = false;
            reason = "shadow-throw:" + ex.Message;
            Interlocked.Increment(ref stats.ShadowErrors);
        }
        var shadowDurationMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - t0;
        if (shadowOk) {
            if (shadowResult == prodResult && shadowOk == prodOk) {
                Interlocked.Increment(ref stats.Matches);
                return prodResult;
            }
            reason = "envelope-mismatch";
        }
        Interlocked.Increment(ref stats.Divergences);
        var d = new Divergence {
            Name = name, Ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ProdResult = prodResult, ShadowResult = shadowResult,
            ProdOk = prodOk, ShadowOk = shadowOk,
            ProdDurationMs = prodDurationMs, ShadowDurationMs = shadowDurationMs,
            Reason = reason,
        };
        lock (DivLock) {
            Divergences.AddLast(d);
            if (Divergences.Count > DivMax) Divergences.RemoveFirst();
        }
        return prodResult;
    }

    public static List<Divergence> DivergencesFor(string name) {
        lock (DivLock) { return Divergences.Where(d => d.Name == name).ToList(); }
    }
    public static List<Divergence> AllDivergences() {
        lock (DivLock) { return Divergences.ToList(); }
    }
    public static Stats? StatsFor(string name) =>
        StatsMap.TryGetValue(name, out var s) ? s : null;
    public static IEnumerable<string> Registered() => Candidates.Keys;
    public static void Reset() {
        Candidates.Clear(); StatsMap.Clear();
        lock (DivLock) { Divergences.Clear(); }
    }
}`,

  'effect-tracker': `${HEADER('Effect Tracker')}
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

public static class CmpsblEffects {
    public enum EffectClass { Pure = 0, Io = 1, Network = 2, Mutation = 3 }

    public sealed class Violation {
        public string Name = ""; public EffectClass Declared; public EffectClass Observed;
        public long Ts; public string Reason = "";
    }

    private const int ViolMax = 256;
    private static readonly ConcurrentDictionary<string, EffectClass> Declared = new();
    private static readonly object Lock = new object();
    private static readonly LinkedList<Violation> Violations = new LinkedList<Violation>();
    private static volatile bool _strict = false;

    public static void SetStrict(bool on) { _strict = on; }

    public static void Declare(string name, EffectClass effect) {
        Declared[name] = effect;
    }

    public static EffectClass? DeclaredFor(string name) =>
        Declared.TryGetValue(name, out var e) ? e : (EffectClass?)null;

    public static bool Audit(string name, EffectClass observed) {
        if (!Declared.TryGetValue(name, out var decl)) return true;
        bool violated = false;
        string reason = "";
        if (_strict) {
            if (observed != decl) { violated = true; reason = "strict-mismatch"; }
        } else if ((int)observed > (int)decl) {
            violated = true; reason = "effect-escalation";
        }
        if (!violated) return true;
        var v = new Violation {
            Name = name, Declared = decl, Observed = observed,
            Ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), Reason = reason,
        };
        lock (Lock) {
            Violations.AddLast(v);
            if (Violations.Count > ViolMax) Violations.RemoveFirst();
        }
        return false;
    }

    public static List<Violation> ViolationsFor(string name) {
        lock (Lock) { return Violations.Where(v => v.Name == name).ToList(); }
    }
    public static List<Violation> AllViolations() {
        lock (Lock) { return Violations.ToList(); }
    }
    public static void Reset() {
        Declared.Clear(); _strict = false;
        lock (Lock) { Violations.Clear(); }
    }
}`,
});
