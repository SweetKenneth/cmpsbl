/**
 * CMPSBL® Native C# — Tier 1 Kernel (Resource Budget + Health Probe)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const CSHARP_KERNEL_GOVERNANCE_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'resource-budget-gate': `${HEADER('Resource Budget Gate')}
using System;
using System.Collections.Generic;
using System.Linq;

public sealed class CmpsblBudget {
    public long? MaxWallMs;
    public long? MaxMemoryBytes;
    public int? MaxDepth;
}

public readonly struct CmpsblBudgetVerdict {
    public readonly bool Allowed;
    public readonly string Reason;
    public readonly int Strikes;
    public CmpsblBudgetVerdict(bool a, string r, int s) { Allowed = a; Reason = r; Strikes = s; }
}

public readonly struct CmpsblBudgetBreach {
    public readonly string Name, Kind;
    public readonly long Observed, Limit, Ts;
    public CmpsblBudgetBreach(string n, string k, long o, long l, long t) {
        Name = n; Kind = k; Observed = o; Limit = l; Ts = t;
    }
}

public static class CmpsblBudgetGate {
    private const int BreachMax = 256;
    private const int StrikeThreshold = 3;
    private static readonly object _lock = new();
    private static readonly Dictionary<string, CmpsblBudget> _budgets = new();
    private static readonly Dictionary<string, int> _depth = new();
    private static readonly Dictionary<string, int> _strikes = new();
    private static readonly LinkedList<CmpsblBudgetBreach> _breaches = new();

    public static void Declare(string name, CmpsblBudget b) {
        lock (_lock) { _budgets[name] = b; }
    }

    private static int Strike(string name, string kind, long observed, long limit) {
        _strikes.TryGetValue(name, out var n);
        n++;
        _strikes[name] = n;
        _breaches.AddLast(new CmpsblBudgetBreach(name, kind, observed, limit,
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()));
        while (_breaches.Count > BreachMax) _breaches.RemoveFirst();
        return n;
    }

    public static CmpsblBudgetVerdict Enter(string name) {
        lock (_lock) {
            _depth.TryGetValue(name, out var cur);
            if (_budgets.TryGetValue(name, out var b) && b.MaxDepth.HasValue && cur >= b.MaxDepth.Value) {
                var n = Strike(name, "depth", cur + 1L, b.MaxDepth.Value);
                return new CmpsblBudgetVerdict(false, "depth-exceeded", n);
            }
            _depth[name] = cur + 1;
            _strikes.TryGetValue(name, out var s);
            return new CmpsblBudgetVerdict(true, null, s);
        }
    }

    public static CmpsblBudgetVerdict Exit(string name, long wallMs, long? memBytes) {
        lock (_lock) {
            _depth.TryGetValue(name, out var cur);
            _depth[name] = Math.Max(0, cur - 1);
            if (!_budgets.TryGetValue(name, out var b)) {
                _strikes.TryGetValue(name, out var s0);
                return new CmpsblBudgetVerdict(true, null, s0);
            }
            string reason = null;
            if (b.MaxWallMs.HasValue && wallMs > b.MaxWallMs.Value) {
                Strike(name, "wall-time", wallMs, b.MaxWallMs.Value);
                reason = "wall-time-exceeded";
            }
            if (memBytes.HasValue && b.MaxMemoryBytes.HasValue && memBytes.Value > b.MaxMemoryBytes.Value) {
                Strike(name, "memory", memBytes.Value, b.MaxMemoryBytes.Value);
                reason = reason == null ? "memory-exceeded" : reason + "+memory-exceeded";
            }
            _strikes.TryGetValue(name, out var s);
            return new CmpsblBudgetVerdict(reason == null, reason, s);
        }
    }

    public static bool ShouldQuarantine(string name) {
        lock (_lock) { return _strikes.TryGetValue(name, out var n) && n >= StrikeThreshold; }
    }

    public static int StrikesFor(string name) {
        lock (_lock) { _strikes.TryGetValue(name, out var n); return n; }
    }

    public static void ClearStrikes(string name) {
        lock (_lock) { _strikes.Remove(name); }
    }

    public static List<CmpsblBudgetBreach> AllBreaches() {
        lock (_lock) { return _breaches.ToList(); }
    }

    public static List<string> DeclaredAll() {
        lock (_lock) { return _budgets.Keys.ToList(); }
    }

    public static void Reset() {
        lock (_lock) {
            _budgets.Clear(); _depth.Clear(); _strikes.Clear(); _breaches.Clear();
        }
    }
}`,

  'kernel-health-probe': `${HEADER('Kernel Health Probe')}
using System;
using System.Collections.Generic;

public sealed class CmpsblHealthReport {
    public string Quartet { get; init; }
    public string Store { get; init; }
    public int Contracts { get; init; }
    public int Quarantined { get; init; }
    public long Executions { get; init; }
    public long Receipts { get; init; }
    public int BudgetStrikes { get; init; }
    public long Ts { get; init; }
}

public static class CmpsblHealth {
    private static readonly object _lock = new();
    private static readonly Dictionary<string, bool> _surfaces = new();
    private static readonly Dictionary<string, long> _counters = new();

    public static void RegisterSurface(string name, bool present) {
        lock (_lock) { _surfaces[name] = present; }
    }

    public static void SetCounter(string name, long value) {
        lock (_lock) { _counters[name] = value; }
    }

    public static CmpsblHealthReport Probe() {
        lock (_lock) {
            int count = 0;
            foreach (var k in new[] { "contracts", "quarantine", "executor", "budget" }) {
                if (_surfaces.TryGetValue(k, out var v) && v) count++;
            }
            var quartet = count == 4 ? "ok" : count > 0 ? "degraded" : "down";
            var store = (_surfaces.TryGetValue("store", out var s) && s) ? "ok" : "down";
            return new CmpsblHealthReport {
                Quartet = quartet,
                Store = store,
                Contracts = (int)(_counters.TryGetValue("contracts", out var c) ? c : 0),
                Quarantined = (int)(_counters.TryGetValue("quarantined", out var q) ? q : 0),
                Executions = _counters.TryGetValue("executions", out var e) ? e : 0,
                Receipts = _counters.TryGetValue("receipts", out var r) ? r : 0,
                BudgetStrikes = (int)(_counters.TryGetValue("budget_strikes", out var bs) ? bs : 0),
                Ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }
    }
}`,
});
