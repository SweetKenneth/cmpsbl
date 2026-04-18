/**
 * CMPSBL® Native C# — Kernel Hardening (Components #15-#20)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const CSHARP_KERNEL_HARDENING_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'circuit-breaker-recoverable': `${HEADER('Recoverable Circuit Breaker')}
namespace Cmpsbl;

using System;
using System.Collections.Generic;

public enum CmpsblBreakerState { Closed, Open, HalfOpen }

public sealed class CmpsblBreakerConfig
{
    public int FailureThreshold { get; set; } = 5;
    public long CooldownMs { get; set; } = 30000;
    public int SuccessThreshold { get; set; } = 1;
}

public sealed class CmpsblBreakerVerdict
{
    public bool Allowed { get; set; }
    public CmpsblBreakerState State { get; set; }
    public string? Reason { get; set; }
}

public static class CmpsblBreaker
{
    private const int QuarantineCycles = 3;

    private sealed class Entry
    {
        public CmpsblBreakerConfig Config = new();
        public CmpsblBreakerState State = CmpsblBreakerState.Closed;
        public int Failures, Successes, OpenCycles;
        public long OpenedAt;
    }

    private static readonly object Lock = new();
    private static readonly Dictionary<string, Entry> Entries = new();

    private static long NowMs() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    public static void Declare(string name, CmpsblBreakerConfig? config = null)
    {
        lock (Lock) { Entries[name] = new Entry { Config = config ?? new CmpsblBreakerConfig() }; }
    }

    public static CmpsblBreakerVerdict BeforeCall(string name)
    {
        lock (Lock)
        {
            if (!Entries.TryGetValue(name, out var e))
                return new CmpsblBreakerVerdict { Allowed = true, State = CmpsblBreakerState.Closed };
            if (e.State == CmpsblBreakerState.Open)
            {
                if (NowMs() - e.OpenedAt >= e.Config.CooldownMs)
                {
                    e.State = CmpsblBreakerState.HalfOpen;
                    return new CmpsblBreakerVerdict { Allowed = true, State = CmpsblBreakerState.HalfOpen };
                }
                return new CmpsblBreakerVerdict { Allowed = false, State = CmpsblBreakerState.Open, Reason = "breaker-open" };
            }
            return new CmpsblBreakerVerdict { Allowed = true, State = e.State };
        }
    }

    public static void RecordSuccess(string name)
    {
        lock (Lock)
        {
            if (!Entries.TryGetValue(name, out var e)) return;
            if (e.State == CmpsblBreakerState.HalfOpen)
            {
                e.Successes++;
                if (e.Successes >= e.Config.SuccessThreshold)
                {
                    e.Failures = 0; e.Successes = 0;
                    e.State = CmpsblBreakerState.Closed;
                }
            }
            else if (e.State == CmpsblBreakerState.Closed) { e.Failures = 0; }
        }
    }

    public static void RecordFailure(string name)
    {
        lock (Lock)
        {
            if (!Entries.TryGetValue(name, out var e)) return;
            if (e.State == CmpsblBreakerState.HalfOpen)
            {
                e.Successes = 0;
                e.OpenedAt = NowMs();
                e.OpenCycles++;
                e.State = CmpsblBreakerState.Open;
                return;
            }
            e.Failures++;
            if (e.State == CmpsblBreakerState.Closed && e.Failures >= e.Config.FailureThreshold)
            {
                e.OpenedAt = NowMs();
                e.OpenCycles++;
                e.State = CmpsblBreakerState.Open;
            }
        }
    }

    public static bool ShouldQuarantine(string name)
    {
        lock (Lock) { return Entries.TryGetValue(name, out var e) && e.OpenCycles >= QuarantineCycles; }
    }
}
`,

  'causality-tracker': `${HEADER('Causality Tracker')}
namespace Cmpsbl;

using System;
using System.Collections.Generic;
using System.Security.Cryptography;

public sealed class CmpsblSpan
{
    public string TraceId { get; init; } = "";
    public string SpanId { get; init; } = "";
    public string? ParentSpanId { get; init; }
    public string Name { get; init; } = "";
    public long StartTs { get; init; }
    public long? EndTs { get; set; }
}

public static class CmpsblCausality
{
    private const int BufferMax = 1024;
    private static readonly object Lock = new();
    private static readonly List<CmpsblSpan> Spans = new();
    private static readonly List<CmpsblSpan> Stack = new();

    private static string RandId()
    {
        var b = new byte[8];
        RandomNumberGenerator.Fill(b);
        return Convert.ToHexString(b).ToLowerInvariant();
    }

    private static long NowMs() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    public static CmpsblSpan Begin(string name)
    {
        lock (Lock)
        {
            string traceId; string? parentId = null;
            if (Stack.Count > 0)
            {
                var parent = Stack[^1];
                traceId = parent.TraceId;
                parentId = parent.SpanId;
            }
            else { traceId = RandId(); }
            var span = new CmpsblSpan {
                TraceId = traceId, SpanId = RandId(), ParentSpanId = parentId,
                Name = name, StartTs = NowMs(),
            };
            Stack.Add(span);
            Spans.Add(span);
            if (Spans.Count > BufferMax) Spans.RemoveAt(0);
            return span;
        }
    }

    public static void End(string spanId)
    {
        lock (Lock)
        {
            for (int i = 0; i < Stack.Count; i++)
            {
                if (Stack[i].SpanId == spanId)
                {
                    Stack[i].EndTs = NowMs();
                    Stack.RemoveAt(i);
                    return;
                }
            }
        }
    }

    public static int Depth() { lock (Lock) { return Stack.Count; } }
    public static int Count() { lock (Lock) { return Spans.Count; } }
}
`,

  'backpressure-governor': `${HEADER('Backpressure Governor')}
namespace Cmpsbl;

using System.Collections.Generic;

public sealed class CmpsblBackpressureLimits
{
    public int MaxConcurrent { get; set; } = 64;
    public int MaxQueueDepth { get; set; } = 128;
}

public sealed class CmpsblBackpressureVerdict
{
    public bool Admitted { get; set; }
    public string? Reason { get; set; }
    public int InFlight { get; set; }
    public int Queued { get; set; }
}

public static class CmpsblBackpressure
{
    private sealed class Entry
    {
        public CmpsblBackpressureLimits Limits = new();
        public int InFlight, Queued;
        public long TotalAdmitted, TotalShed;
    }

    private static readonly object Lock = new();
    private static readonly Dictionary<string, Entry> Entries = new();

    public static void Declare(string name, CmpsblBackpressureLimits? limits = null)
    {
        lock (Lock) { Entries[name] = new Entry { Limits = limits ?? new CmpsblBackpressureLimits() }; }
    }

    public static CmpsblBackpressureVerdict Admit(string name)
    {
        lock (Lock)
        {
            if (!Entries.TryGetValue(name, out var e))
                return new CmpsblBackpressureVerdict { Admitted = true };
            if (e.InFlight >= e.Limits.MaxConcurrent)
            {
                var reason = e.Queued >= e.Limits.MaxQueueDepth ? "queue-full" : "concurrency-exceeded";
                e.TotalShed++;
                return new CmpsblBackpressureVerdict { Admitted = false, Reason = reason, InFlight = e.InFlight, Queued = e.Queued };
            }
            e.InFlight++; e.TotalAdmitted++;
            return new CmpsblBackpressureVerdict { Admitted = true, InFlight = e.InFlight, Queued = e.Queued };
        }
    }

    public static void Release(string name)
    {
        lock (Lock)
        {
            if (Entries.TryGetValue(name, out var e) && e.InFlight > 0) e.InFlight--;
        }
    }

    public static double Saturation(string name)
    {
        lock (Lock)
        {
            if (!Entries.TryGetValue(name, out var e) || e.Limits.MaxConcurrent == 0) return 0.0;
            return (double)e.InFlight / e.Limits.MaxConcurrent;
        }
    }
}
`,

  'determinism-fingerprint': `${HEADER('Determinism Fingerprint')}
namespace Cmpsbl;

using System;
using System.Collections.Generic;

public sealed class CmpsblDivergence
{
    public string Name { get; init; } = "";
    public string Fingerprint { get; init; } = "";
    public string ExpectedHash { get; init; } = "";
    public string ActualHash { get; init; } = "";
    public long Ts { get; init; }
}

public static class CmpsblFingerprint
{
    private const int TableMax = 512;
    private const int DivergenceMax = 256;

    private sealed class Entry { public string Hash = ""; public long Hits, LastSeen; }

    private static readonly object Lock = new();
    private static readonly Dictionary<string, Entry> Table = new();
    private static readonly List<CmpsblDivergence> Divergences = new();

    private static long NowMs() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    public static string Fnv1a(string s)
    {
        uint h = 0x811c9dc5;
        foreach (var c in s)
        {
            h ^= c;
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        return h.ToString("x8");
    }

    public static string Fingerprint(string name, string argsCanonical, string version, string envHint)
        => Fnv1a($"{name}|{version}|{envHint}|{argsCanonical}");

    public static string HashOutput(string outputCanonical) => Fnv1a(outputCanonical);

    public static bool Observe(string name, string fingerprint, string outputHash)
    {
        lock (Lock)
        {
            var now = NowMs();
            if (Table.TryGetValue(fingerprint, out var existing))
            {
                existing.Hits++;
                existing.LastSeen = now;
                if (existing.Hash != outputHash)
                {
                    Divergences.Add(new CmpsblDivergence {
                        Name = name, Fingerprint = fingerprint,
                        ExpectedHash = existing.Hash, ActualHash = outputHash, Ts = now,
                    });
                    if (Divergences.Count > DivergenceMax) Divergences.RemoveAt(0);
                    return true;
                }
                return false;
            }
            if (Table.Count >= TableMax)
            {
                string? oldestKey = null; long oldestTs = long.MaxValue;
                foreach (var kv in Table)
                {
                    if (kv.Value.LastSeen < oldestTs) { oldestTs = kv.Value.LastSeen; oldestKey = kv.Key; }
                }
                if (oldestKey != null) Table.Remove(oldestKey);
            }
            Table[fingerprint] = new Entry { Hash = outputHash, Hits = 1, LastSeen = now };
            return false;
        }
    }

    public static int DivergenceCount() { lock (Lock) { return Divergences.Count; } }
}
`,

  'contract-versioning': `${HEADER('Contract Versioning')}
namespace Cmpsbl;

using System;
using System.Collections.Generic;
using System.Linq;

public sealed class CmpsblVersionResolution
{
    public string Name { get; init; } = "";
    public string Requested { get; init; } = "";
    public string Resolved { get; init; } = "";
    public string Strategy { get; init; } = "";
}

public sealed class CmpsblMigrationRecord
{
    public string Name { get; init; } = "";
    public string FromVersion { get; init; } = "";
    public string ToVersion { get; init; } = "";
    public long Ts { get; init; }
}

public static class CmpsblVersioning
{
    private const int MigrationLogMax = 128;
    private static readonly object Lock = new();
    private static readonly Dictionary<string, HashSet<string>> Versions = new();
    private static readonly List<CmpsblMigrationRecord> Migrations = new();

    private static (int, int, int) ParseVersion(string v)
    {
        var parts = v.Trim().Split('.');
        int[] result = new int[3];
        for (int i = 0; i < 3 && i < parts.Length; i++)
        {
            var digits = new string(parts[i].TakeWhile(char.IsDigit).ToArray());
            int.TryParse(digits, out result[i]);
        }
        return (result[0], result[1], result[2]);
    }

    private static int CompareTriple((int, int, int) a, (int, int, int) b)
    {
        if (a.Item1 != b.Item1) return a.Item1 - b.Item1;
        if (a.Item2 != b.Item2) return a.Item2 - b.Item2;
        return a.Item3 - b.Item3;
    }

    public static void Register(string name, string version)
    {
        lock (Lock)
        {
            if (!Versions.TryGetValue(name, out var set))
            {
                set = new HashSet<string>(); Versions[name] = set;
            }
            set.Add(version);
        }
    }

    public static CmpsblVersionResolution ResolveVersion(string name, string requested)
    {
        lock (Lock)
        {
            if (!Versions.TryGetValue(name, out var set) || set.Count == 0)
                return new CmpsblVersionResolution { Name = name, Requested = requested, Strategy = "none" };
            if (set.Contains(requested))
                return new CmpsblVersionResolution { Name = name, Requested = requested, Resolved = requested, Strategy = "exact" };
            var target = ParseVersion(requested);
            var parsed = set.Select(v => (v, p: ParseVersion(v)))
                .OrderByDescending(x => x.p, Comparer<(int, int, int)>.Create(CompareTriple))
                .ToList();
            var minor = parsed.FirstOrDefault(x => x.p.Item1 == target.Item1 && x.p.Item2 == target.Item2);
            if (minor.v != null)
                return new CmpsblVersionResolution { Name = name, Requested = requested, Resolved = minor.v, Strategy = "latest-minor" };
            var major = parsed.FirstOrDefault(x => x.p.Item1 == target.Item1);
            if (major.v != null)
                return new CmpsblVersionResolution { Name = name, Requested = requested, Resolved = major.v, Strategy = "latest-major" };
            return new CmpsblVersionResolution { Name = name, Requested = requested, Resolved = parsed[0].v, Strategy = "latest" };
        }
    }

    public static void RecordMigration(string name, string fromVersion, string toVersion)
    {
        lock (Lock)
        {
            Migrations.Add(new CmpsblMigrationRecord {
                Name = name, FromVersion = fromVersion, ToVersion = toVersion,
                Ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            });
            if (Migrations.Count > MigrationLogMax) Migrations.RemoveAt(0);
        }
    }
}
`,

  'saturation-metrics': `${HEADER('Saturation Metrics')}
namespace Cmpsbl;

using System.Collections.Generic;
using System.Linq;

public sealed class CmpsblQuantiles
{
    public double P50 { get; init; }
    public double P95 { get; init; }
    public double P99 { get; init; }
    public int Count { get; init; }
    public double Min { get; init; }
    public double Max { get; init; }
}

public sealed class CmpsblErrorBudget
{
    public long Errors { get; init; }
    public long Total { get; init; }
    public double Rate { get; init; }
    public double Budget { get; init; }
    public bool Breached { get; init; }
}

public static class CmpsblSaturation
{
    private const int ReservoirMax = 512;
    private const double DefaultBudget = 0.05;

    private sealed class Entry
    {
        public List<double> Samples = new();
        public long Errors, Total;
        public double Budget = DefaultBudget;
        public double Min = double.PositiveInfinity, Max = double.NegativeInfinity;
    }

    private static readonly object Lock = new();
    private static readonly Dictionary<string, Entry> Entries = new();

    private static Entry Ensure(string name)
    {
        if (!Entries.TryGetValue(name, out var e))
        {
            e = new Entry(); Entries[name] = e;
        }
        return e;
    }

    public static void Declare(string name, double errorBudget)
    {
        lock (Lock) { Entries[name] = new Entry { Budget = errorBudget }; }
    }

    public static void Observe(string name, double latencyMs)
    {
        lock (Lock)
        {
            var e = Ensure(name);
            if (e.Samples.Count >= ReservoirMax) e.Samples.RemoveAt(0);
            e.Samples.Add(latencyMs);
            e.Total++;
            if (latencyMs < e.Min) e.Min = latencyMs;
            if (latencyMs > e.Max) e.Max = latencyMs;
        }
    }

    public static void ObserveError(string name)
    {
        lock (Lock)
        {
            var e = Ensure(name);
            e.Errors++; e.Total++;
        }
    }

    public static CmpsblQuantiles Quantiles(string name)
    {
        lock (Lock)
        {
            if (!Entries.TryGetValue(name, out var e) || e.Samples.Count == 0)
                return new CmpsblQuantiles();
            var sorted = e.Samples.OrderBy(x => x).ToList();
            int n = sorted.Count;
            double Q(double p) => sorted[System.Math.Min(n - 1, (int)(p * n))];
            double mn = double.IsInfinity(e.Min) ? 0 : e.Min;
            double mx = double.IsInfinity(e.Max) ? 0 : e.Max;
            return new CmpsblQuantiles { P50 = Q(0.50), P95 = Q(0.95), P99 = Q(0.99), Count = n, Min = mn, Max = mx };
        }
    }

    public static CmpsblErrorBudget ErrorBudget(string name)
    {
        lock (Lock)
        {
            if (!Entries.TryGetValue(name, out var e) || e.Total == 0)
                return new CmpsblErrorBudget { Budget = DefaultBudget };
            double rate = (double)e.Errors / e.Total;
            return new CmpsblErrorBudget { Errors = e.Errors, Total = e.Total, Rate = rate, Budget = e.Budget, Breached = rate > e.Budget };
        }
    }
}
`,
});
