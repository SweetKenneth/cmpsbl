/**
 * CMPSBL® Native C# Layer Implementations
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Hand-written C# bodies for every Launch Layer + core utility layer.
 *
 * Architecture:
 *   - Each layer exports a string snippet defining a `static class` nested
 *     inside the top-level `Cmpsbl` class so file-level naming stays sane and
 *     every layer gets its own namespace.
 *   - Wrappers (auto-wire) follow the same caller-isolation rules as TS/Java/
 *     Go/Rust/Python: never mutate the caller input dictionary; strip sidecar
 *     keys from output.
 *   - Phase ordering is enforced by the C# chain executor
 *     by the polyglot template engine, not by these snippets.
 *
 * © CMPSBL® — All rights reserved.
 */

// ─── Phase 1 — RESILIENCE — Self-Healing ───────────────────────────────────

export const SELF_HEALING_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Resilience Module (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class SelfHealing {
    public enum BlastRadius { Node, Sector, System }

    public sealed class RepairStrategy {
        public string Id { get; }
        public string FailureType { get; }
        public List<string> Actions { get; }
        public BlastRadius Radius { get; }
        public long EstimatedDurationMs { get; }
        public double SuccessRate { get; }
        public double CostScore { get; }
        public RepairStrategy(string id, string ft, List<string> a, BlastRadius br, long d, double sr, double cs) {
            Id = id; FailureType = ft; Actions = a; Radius = br;
            EstimatedDurationMs = d; SuccessRate = sr; CostScore = cs;
        }
    }

    public sealed class RepairPlan {
        public string Id { get; }
        public string CapabilityName { get; }
        public string FailureType { get; }
        public RepairStrategy Strategy { get; }
        public List<string> Actions { get; }
        public List<string> RollbackPlan { get; }
        public long EstimatedDurationMs { get; }
        public long CreatedAt { get; }
        public RepairPlan(string id, string cn, string ft, RepairStrategy s, List<string> a, List<string> rb, long d, long ca) {
            Id = id; CapabilityName = cn; FailureType = ft; Strategy = s;
            Actions = a; RollbackPlan = rb; EstimatedDurationMs = d; CreatedAt = ca;
        }
    }

    public sealed class RepairResult {
        public string PlanId { get; }
        public bool Success { get; }
        public long DurationMs { get; }
        public List<string> ActionsExecuted { get; }
        public bool RolledBack { get; }
        public string Error { get; }
        public RepairResult(string pid, bool s, long d, List<string> ae, bool rb, string err) {
            PlanId = pid; Success = s; DurationMs = d; ActionsExecuted = ae; RolledBack = rb; Error = err;
        }
    }

    private static readonly List<RepairStrategy> _strategies = new();
    private static readonly List<RepairResult> _history = new();
    private static readonly Dictionary<string, int[]> _scores = new();
    private static readonly object _lock = new();

    public static void AddStrategy(RepairStrategy s) {
        lock (_lock) { _strategies.Add(s); _scores[s.Id] = new[] { 0, 0 }; }
    }

    private static double BlastScore(BlastRadius r) => r switch {
        BlastRadius.System => 1.0,
        BlastRadius.Sector => 0.5,
        _ => 0.1
    };

    private static int BlastIndex(BlastRadius r) => r switch {
        BlastRadius.Node => 0,
        BlastRadius.Sector => 1,
        _ => 2
    };

    private static double AdjustedRate(string sid) {
        if (!_scores.TryGetValue(sid, out var sc) || sc[0] + sc[1] == 0) {
            foreach (var s in _strategies) if (s.Id == sid) return s.SuccessRate;
            return 0.5;
        }
        return (double)sc[0] / (sc[0] + sc[1]);
    }

    public static RepairPlan PlanRepair(string capabilityName, string failureType, BlastRadius maxRadius) {
        lock (_lock) {
            int maxIdx = BlastIndex(maxRadius);
            var candidates = new List<RepairStrategy>();
            foreach (var s in _strategies)
                if (s.FailureType == failureType && BlastIndex(s.Radius) <= maxIdx) candidates.Add(s);
            if (candidates.Count == 0) return null;
            candidates.Sort((a, b) => {
                double sa = AdjustedRate(a.Id) * 0.5 - BlastScore(a.Radius) * 0.3 - a.CostScore * 0.2;
                double sb = AdjustedRate(b.Id) * 0.5 - BlastScore(b.Radius) * 0.3 - b.CostScore * 0.2;
                return sb.CompareTo(sa);
            });
            var best = candidates[0];
            var rollback = new List<string>();
            for (int i = best.Actions.Count - 1; i >= 0; i--) rollback.Add("rollback_" + best.Actions[i]);
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            return new RepairPlan("plan_" + now, capabilityName, failureType, best,
                new List<string>(best.Actions), rollback, best.EstimatedDurationMs, now);
        }
    }

    public static RepairResult ExecuteRepair(RepairPlan plan, Func<string, string, bool> executor, Action<string, string> onRollback) {
        long start = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var executed = new List<string>();
        foreach (var action in plan.Actions) {
            if (!executor(action, plan.CapabilityName)) {
                if (onRollback != null) {
                    for (int i = executed.Count - 1; i >= 0; i--) {
                        try { onRollback("rollback_" + executed[i], plan.CapabilityName); } catch { /* swallow */ }
                    }
                }
                var failRes = new RepairResult(plan.Id, false, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - start,
                    executed, onRollback != null, "Repair action '" + action + "' failed");
                lock (_lock) { _scores[plan.Strategy.Id][1]++; _history.Add(failRes); }
                return failRes;
            }
            executed.Add(action);
        }
        var okRes = new RepairResult(plan.Id, true, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - start, executed, false, null);
        lock (_lock) { _scores[plan.Strategy.Id][0]++; _history.Add(okRes); }
        return okRes;
    }

    public static List<RepairResult> History() { lock (_lock) return new List<RepairResult>(_history); }

    public static double SuccessRate() {
        lock (_lock) {
            if (_history.Count == 0) return 1.0;
            int s = 0; foreach (var r in _history) if (r.Success) s++;
            return (double)s / _history.Count;
        }
    }
}
`;

// ─── Phase 2 — RESILIENCE — Autonomous Triage ──────────────────────────────

export const TRIAGE_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class Triage {
    public enum Severity { Critical, Degraded, Warning, Info }

    public sealed class SymptomReport {
        public string CapabilityName { get; }
        public string Symptom { get; }
        public double Value { get; }
        public double Threshold { get; }
        public long Timestamp { get; set; }
        public SymptomReport(string cn, string s, double v, double t) {
            CapabilityName = cn; Symptom = s; Value = v; Threshold = t;
        }
    }

    public sealed class FailureSignature {
        public string Name { get; }
        public Dictionary<string, double> MinSymptoms { get; }
        public Severity Severity { get; }
        public List<string> Causes { get; }
        public List<string> Actions { get; }
        public double Confidence { get; }
        public FailureSignature(string n, Dictionary<string, double> ms, Severity sv, List<string> c, List<string> a, double conf) {
            Name = n; MinSymptoms = ms; Severity = sv; Causes = c; Actions = a; Confidence = conf;
        }
    }

    public sealed class Diagnosis {
        public string CapabilityName { get; }
        public Severity Severity { get; }
        public List<SymptomReport> Symptoms { get; }
        public List<string> PossibleCauses { get; }
        public List<string> RecommendedActions { get; }
        public double Confidence { get; }
        public long DiagnosedAt { get; }
        public Diagnosis(string cn, Severity sv, List<SymptomReport> s, List<string> pc, List<string> ra, double conf, long da) {
            CapabilityName = cn; Severity = sv; Symptoms = s; PossibleCauses = pc;
            RecommendedActions = ra; Confidence = conf; DiagnosedAt = da;
        }
    }

    private static readonly Dictionary<string, List<SymptomReport>> _buffer = new();
    private static readonly object _lock = new();
    private static readonly List<FailureSignature> _signatures = new() {
        new FailureSignature("memory_leak",
            new Dictionary<string, double> { { "memory_usage", 0.9 }, { "gc_pressure", 0.7 } },
            Severity.Critical, new List<string> { "Unbounded cache growth" },
            new List<string> { "restart", "alert" }, 0.85),
        new FailureSignature("cascading_failure",
            new Dictionary<string, double> { { "error_rate", 0.3 }, { "dependency_errors", 0.5 } },
            Severity.Critical, new List<string> { "Upstream failure" },
            new List<string> { "circuit_break", "reroute", "alert" }, 0.80),
        new FailureSignature("latency_spike",
            new Dictionary<string, double> { { "latency_p95", 5000.0 } },
            Severity.Degraded, new List<string> { "Slow query" },
            new List<string> { "scale_up", "reroute" }, 0.75),
    };

    public static void ReportSymptom(SymptomReport r) {
        lock (_lock) {
            r.Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            if (!_buffer.TryGetValue(r.CapabilityName, out var list)) {
                list = new List<SymptomReport>();
                _buffer[r.CapabilityName] = list;
            }
            list.Add(r);
            if (list.Count > 100) list.RemoveRange(0, list.Count - 100);
        }
    }

    public static List<Diagnosis> Diagnose(string capabilityName) {
        lock (_lock) {
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var targets = !string.IsNullOrEmpty(capabilityName)
                ? new List<string> { capabilityName }
                : new List<string>(_buffer.Keys);
            var output = new List<Diagnosis>();
            foreach (var cap in targets) {
                if (!_buffer.TryGetValue(cap, out var all)) continue;
                var fresh = new List<SymptomReport>();
                foreach (var s in all) if (now - s.Timestamp < 300_000L) fresh.Add(s);
                if (fresh.Count == 0) continue;
                FailureSignature best = null; double bestScore = 0.0;
                foreach (var sig in _signatures) {
                    int matched = 0;
                    foreach (var req in sig.MinSymptoms) {
                        foreach (var s in fresh) {
                            if (s.Symptom == req.Key && s.Value >= req.Value) { matched++; break; }
                        }
                    }
                    if (sig.MinSymptoms.Count == 0) continue;
                    double score = (double)matched / sig.MinSymptoms.Count;
                    if (score > bestScore && score >= 0.5) { best = sig; bestScore = score; }
                }
                if (best != null) {
                    output.Add(new Diagnosis(cap, best.Severity, fresh, best.Causes, best.Actions, best.Confidence, now));
                }
            }
            return output;
        }
    }
}
`;

// ─── Phase 3 — RESILIENCE — Distributed Consensus ──────────────────────────

export const CONSENSUS_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class Consensus {
    public sealed class HeartbeatNode {
        public string Id { get; }
        public long LastSeenMs { get; set; }
        public int ConsecutiveMisses { get; set; }
        public bool IsAlive { get; set; }
        public HeartbeatNode(string id) { Id = id; IsAlive = true; }
    }

    private static readonly Dictionary<string, HeartbeatNode> _nodes = new();
    private static readonly object _lock = new();

    public static void HeartbeatTick(string nodeId) {
        lock (_lock) {
            if (!_nodes.TryGetValue(nodeId, out var n)) {
                n = new HeartbeatNode(nodeId);
                _nodes[nodeId] = n;
            }
            n.LastSeenMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            n.ConsecutiveMisses = 0;
            n.IsAlive = true;
        }
    }

    public static List<string> CheckLiveness(long timeoutMs) {
        lock (_lock) {
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var dead = new List<string>();
            foreach (var n in _nodes.Values) {
                if (now - n.LastSeenMs > timeoutMs) {
                    n.ConsecutiveMisses++;
                    if (n.ConsecutiveMisses >= 3) { n.IsAlive = false; dead.Add(n.Id); }
                }
            }
            return dead;
        }
    }

    public static int QuorumSize() {
        lock (_lock) {
            int alive = 0; foreach (var n in _nodes.Values) if (n.IsAlive) alive++;
            return alive / 2 + 1;
        }
    }

    public static bool HasQuorum(int votes) => votes >= QuorumSize();
}
`;

// ─── Phase 4 — FORESIGHT — Oracle-Ripple ───────────────────────────────────

export const ORACLE_RIPPLE_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class OracleRipple {
    public sealed class Observation {
        public string CapabilityName { get; }
        public string Metric { get; }
        public double Value { get; }
        public long Timestamp { get; set; }
        public Observation(string cn, string m, double v) { CapabilityName = cn; Metric = m; Value = v; }
    }

    public sealed class Forecast {
        public string CapabilityName { get; }
        public string Metric { get; }
        public long HorizonMs { get; }
        public double PredictedValue { get; }
        public double Confidence { get; }
        public long IssuedAt { get; }
        public Forecast(string cn, string m, long h, double pv, double c, long ia) {
            CapabilityName = cn; Metric = m; HorizonMs = h;
            PredictedValue = pv; Confidence = c; IssuedAt = ia;
        }
    }

    private static readonly Dictionary<string, List<Observation>> _obs = new();
    private static readonly object _lock = new();

    public static void Record(Observation o) {
        lock (_lock) {
            o.Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            string key = o.CapabilityName + "|" + o.Metric;
            if (!_obs.TryGetValue(key, out var list)) {
                list = new List<Observation>();
                _obs[key] = list;
            }
            list.Add(o);
            if (list.Count > 100) list.RemoveRange(0, list.Count - 100);
        }
    }

    public static Forecast Forecast_(string capability, string metric, long horizonMs) {
        lock (_lock) {
            if (!_obs.TryGetValue(capability + "|" + metric, out var list) || list.Count < 3) return null;
            double n = list.Count, sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (int i = 0; i < list.Count; i++) {
                double x = i, y = list[i].Value;
                sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
            }
            double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX + 1e-9);
            double intercept = (sumY - slope * sumX) / n;
            double futureX = n + horizonMs / 1000.0;
            double predicted = slope * futureX + intercept;
            double confidence = Math.Max(0, 1.0 - Math.Abs(slope) / 100.0);
            return new Forecast(capability, metric, horizonMs, predicted, confidence,
                DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
        }
    }
}
`;

// ─── Phase 5 — FORESIGHT — Anomaly Correlation ─────────────────────────────

export const ANOMALY_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class Anomaly {
    public sealed class Signal {
        public string Stream { get; }
        public double Value { get; }
        public double Baseline { get; }
        public double Deviation { get; set; }
        public long Timestamp { get; set; }
        public Signal(string s, double v, double b) { Stream = s; Value = v; Baseline = b; }
    }

    public sealed class IncidentHypothesis {
        public string Id { get; }
        public List<string> Streams { get; }
        public string Severity { get; }
        public double Confidence { get; }
        public long IssuedAt { get; }
        public IncidentHypothesis(string id, List<string> s, string sv, double c, long ia) {
            Id = id; Streams = s; Severity = sv; Confidence = c; IssuedAt = ia;
        }
    }

    private static readonly List<Signal> _buf = new();
    private static readonly object _lock = new();

    public static void Observe(Signal s) {
        lock (_lock) {
            s.Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            s.Deviation = Math.Abs(s.Value - s.Baseline);
            _buf.Add(s);
            if (_buf.Count > 500) _buf.RemoveRange(0, _buf.Count - 500);
        }
    }

    public static List<IncidentHypothesis> Correlate(long windowMs) {
        lock (_lock) {
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var seen = new HashSet<string>();
            foreach (var s in _buf) {
                if (now - s.Timestamp <= windowMs && s.Deviation > s.Baseline * 0.3) seen.Add(s.Stream);
            }
            if (seen.Count < 2) return new List<IncidentHypothesis>();
            double conf = Math.Min(1.0, seen.Count / 5.0);
            string severity = seen.Count >= 4 ? "critical" : (seen.Count >= 3 ? "degraded" : "warning");
            return new List<IncidentHypothesis> {
                new("inc_" + now, new List<string>(seen), severity, conf, now)
            };
        }
    }
}
`;

// ─── Phase 6 — SECURITY — Adaptive Defense ─────────────────────────────────

export const ADAPTIVE_DEFENSE_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class AdaptiveDefense {
    public sealed class Defense {
        public string Id { get; }
        public string Pattern { get; }
        public double Fitness { get; set; }
        public int Generation { get; set; }
        public int Matches { get; set; }
        public long CreatedAt { get; }
        public Defense(string id, string p) {
            Id = id; Pattern = p; Fitness = 1.0; Generation = 0;
            Matches = 0; CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }
    }

    private static readonly List<Defense> _defenses = new();
    private static readonly object _lock = new();

    public static string Seed(string pattern) {
        lock (_lock) {
            string id = "def_" + DateTime.UtcNow.Ticks;
            _defenses.Add(new Defense(id, pattern));
            return id;
        }
    }

    public static List<string> Test(string input) {
        lock (_lock) {
            var matched = new List<string>();
            foreach (var d in _defenses) {
                if (input.Contains(d.Pattern)) { d.Matches++; d.Fitness += 0.1; matched.Add(d.Id); }
            }
            return matched;
        }
    }

    public static int Evolve() {
        lock (_lock) {
            int culled = 0;
            for (int i = _defenses.Count - 1; i >= 0; i--) {
                var d = _defenses[i];
                if (d.Fitness < 0.5 && d.Generation > 0) { _defenses.RemoveAt(i); culled++; }
            }
            return culled;
        }
    }
}
`;

// ─── Phase 7 — SECURITY — Zero-Trust ───────────────────────────────────────

export const ZERO_TRUST_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class ZeroTrust {
    public sealed class Session {
        public string Id { get; }
        public string UserId { get; }
        public string BoundIp { get; }
        public string BoundUa { get; }
        public double TrustScore { get; set; }
        public long IssuedAt { get; }
        public long LastActivity { get; set; }
        public Session(string id, string uid, string ip, string ua) {
            Id = id; UserId = uid; BoundIp = ip; BoundUa = ua;
            TrustScore = 1.0;
            IssuedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            LastActivity = IssuedAt;
        }
    }

    private static readonly Dictionary<string, Session> _sessions = new();
    private static readonly object _lock = new();

    public static string Bind(string userId, string ip, string ua) {
        lock (_lock) {
            string id = "sess_" + userId + "_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            _sessions[id] = new Session(id, userId, ip, ua);
            return id;
        }
    }

    public static bool Verify(string sessId, string ip, string ua) {
        lock (_lock) {
            if (!_sessions.TryGetValue(sessId, out var s)) return false;
            if (s.BoundIp != ip) s.TrustScore *= 0.4;
            if (s.BoundUa != ua) s.TrustScore *= 0.6;
            s.LastActivity = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            return s.TrustScore >= 0.5;
        }
    }

    public static void Revoke(string sessId) { lock (_lock) _sessions.Remove(sessId); }
}
`;

// ─── Phase 8 — SECURITY — Cyber Defense ────────────────────────────────────

export const CYBER_DEFENSE_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class CyberDefense {
    public sealed class IOC {
        public string Indicator { get; }
        public string Type { get; }
        public int Hits { get; set; }
        public long FirstSeen { get; }
        public long LastSeen { get; set; }
        public IOC(string i, string t) {
            Indicator = i; Type = t; Hits = 1;
            FirstSeen = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            LastSeen = FirstSeen;
        }
    }

    private static readonly Dictionary<string, IOC> _iocs = new();
    private static readonly Dictionary<string, int> _traffic = new();
    private static readonly object _lock = new();

    public static void ObserveIoc(string indicator, string type) {
        lock (_lock) {
            string k = type + ":" + indicator;
            if (!_iocs.TryGetValue(k, out var e)) _iocs[k] = new IOC(indicator, type);
            else { e.Hits++; e.LastSeen = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(); }
        }
    }

    public static bool DdosCheck(string sourceIp) {
        lock (_lock) {
            int n = (_traffic.TryGetValue(sourceIp, out var x) ? x : 0) + 1;
            _traffic[sourceIp] = n;
            return n <= 100;
        }
    }

    public static void DdosReset() { lock (_lock) _traffic.Clear(); }
}
`;

// ─── Phase 9 — INTELLIGENCE — Fleet Intelligence ───────────────────────────

export const FLEET_INTEL_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class FleetIntelligence {
    public sealed class Provider {
        public string Id { get; }
        public double Cost { get; }
        public double LatencyMs { get; }
        public double Quality { get; }
        public bool Available { get; set; }
        public int Calls { get; set; }
        public int Failures { get; set; }
        public Provider(string id, double c, double l, double q) {
            Id = id; Cost = c; LatencyMs = l; Quality = q; Available = true;
        }
    }

    private static readonly Dictionary<string, Provider> _providers = new();
    private static readonly object _lock = new();

    public static Provider Register(string id, double cost, double latencyMs, double quality) {
        lock (_lock) {
            var p = new Provider(id, cost, latencyMs, quality);
            _providers[id] = p;
            return p;
        }
    }

    public static double Score(Provider p) {
        if (!p.Available) return double.NegativeInfinity;
        double failureRate = p.Calls > 0 ? (double)p.Failures / p.Calls : 0.0;
        return (p.Quality * 100) - (p.Cost * 10) - (p.LatencyMs / 100) - (failureRate * 50);
    }

    public static Provider Pick() {
        lock (_lock) {
            Provider best = null; double bestScore = double.NegativeInfinity;
            foreach (var p in _providers.Values) {
                double s = Score(p);
                if (s > bestScore) { bestScore = s; best = p; }
            }
            return best;
        }
    }

    public static void RecordCall(string id, bool success) {
        lock (_lock) {
            if (!_providers.TryGetValue(id, out var p)) return;
            p.Calls++;
            if (!success) {
                p.Failures++;
                if (p.Calls >= 5 && (double)p.Failures / p.Calls > 0.5) p.Available = false;
            }
        }
    }
}
`;

// ─── Phase 10 — INTELLIGENCE — AI Safety ───────────────────────────────────

export const AI_SAFETY_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class AiSafety {
    private static readonly string[] _injectionPatterns = new[] {
        "ignore previous instructions", "ignore all previous", "disregard prior",
        "system prompt", "you are now", "pretend you are",
        "<script", "javascript:", "data:text/html",
        "\\\\x", "\\\\u00", "\\\\u202E"
    };

    public static string SanitizePrompt(string input) {
        if (input == null) return null;
        string lower = input.ToLowerInvariant();
        foreach (var pat in _injectionPatterns) {
            if (lower.Contains(pat)) return "[CMPSBL_BLOCKED]";
        }
        return input;
    }

    /// <summary>Deep-sanitize: walks nested IDictionary/IList. Framework keys (_cmpsbl_/__cmpsbl_) pass through.</summary>
    public static object SanitizeDeep(object v) {
        if (v is string s) return SanitizePrompt(s);
        if (v is System.Collections.IDictionary dict) {
            var outDict = new Dictionary<string, object>();
            foreach (System.Collections.DictionaryEntry e in dict) {
                string k = e.Key?.ToString() ?? "";
                if (k.StartsWith("_cmpsbl_") || k.StartsWith("__cmpsbl_")) outDict[k] = e.Value;
                else outDict[k] = SanitizeDeep(e.Value);
            }
            return outDict;
        }
        if (v is System.Collections.IList list) {
            var outList = new List<object>(list.Count);
            foreach (var item in list) outList.Add(SanitizeDeep(item));
            return outList;
        }
        return v;
    }

    public static double CheckHallucination(string claim, List<string> sources) {
        if (sources == null || sources.Count == 0) return 0.0;
        string lower = claim.ToLowerInvariant();
        int supported = 0;
        foreach (var src in sources) {
            string s = src.ToLowerInvariant();
            if (s.Contains(lower) || lower.Contains(s)) supported++;
        }
        return (double)supported / sources.Count;
    }
}
`;

// ─── Phase 11 — INTELLIGENCE — AI Cost ─────────────────────────────────────

export const AI_COST_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class AiCost {
    private static long _budgetCents = 1_000_000L;
    private static long _spentCents = 0L;
    private static readonly object _lock = new();

    public static void SetBudget(long cents) { lock (_lock) _budgetCents = cents; }

    public static bool CanSpend(long cents) {
        lock (_lock) return _spentCents + cents <= _budgetCents;
    }

    public static void RecordSpend(long cents) { lock (_lock) _spentCents += cents; }

    public static long BudgetRemaining() {
        lock (_lock) return _budgetCents - _spentCents;
    }

    public static string OptimizeTokens(string text, int maxTokens) {
        int maxChars = maxTokens * 4;
        return text.Length <= maxChars ? text : text.Substring(0, maxChars);
    }
}
`;

// ─── Phase 12 — INTELLIGENCE — Cognitive Memory ────────────────────────────

export const COG_MEMORY_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class CognitiveMemory {
    public sealed class MemoryNode {
        public string Id { get; }
        public string Content { get; }
        public List<string> Edges { get; } = new();
        public long CreatedAt { get; }
        public MemoryNode(string id, string c) {
            Id = id; Content = c; CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }
    }

    private static readonly Dictionary<string, MemoryNode> _nodes = new();
    private static readonly object _lock = new();

    public static string Remember(string content) {
        lock (_lock) {
            foreach (var n in _nodes.Values) if (n.Content == content) return n.Id;
            string id = "mem_" + DateTime.UtcNow.Ticks;
            _nodes[id] = new MemoryNode(id, content);
            return id;
        }
    }

    public static void Link(string fromId, string toId) {
        lock (_lock) {
            if (!_nodes.TryGetValue(fromId, out var n)) return;
            if (!n.Edges.Contains(toId)) n.Edges.Add(toId);
        }
    }

    public static List<string> Recall(string query) {
        lock (_lock) {
            string lower = query.ToLowerInvariant();
            var hits = new List<string>();
            foreach (var n in _nodes.Values) if (n.Content.ToLowerInvariant().Contains(lower)) hits.Add(n.Id);
            return hits;
        }
    }
}
`;

// ─── Phase 13 — PERFORMANCE — Performance Surgery ──────────────────────────

export const PERF_SURGERY_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class PerformanceSurgery {
    public sealed class Sample {
        public string Function { get; }
        public double DurationMs { get; }
        public long Timestamp { get; }
        public Sample(string f, double d) {
            Function = f; DurationMs = d;
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }
    }

    private static readonly Dictionary<string, List<Sample>> _samples = new();
    private static readonly object _lock = new();

    public static void RecordSample(string function, double durationMs) {
        lock (_lock) {
            if (!_samples.TryGetValue(function, out var list)) {
                list = new List<Sample>();
                _samples[function] = list;
            }
            list.Add(new Sample(function, durationMs));
            if (list.Count > 1000) list.RemoveRange(0, list.Count - 1000);
        }
    }

    public static double P99(string function) {
        lock (_lock) {
            if (!_samples.TryGetValue(function, out var list) || list.Count == 0) return 0.0;
            var durations = new double[list.Count];
            for (int i = 0; i < list.Count; i++) durations[i] = list[i].DurationMs;
            Array.Sort(durations);
            int idx = Math.Min((int)(durations.Length * 0.99), durations.Length - 1);
            return durations[idx];
        }
    }

    public static bool DetectRegression(string function, double baselineMs) {
        return P99(function) > baselineMs * 1.5;
    }
}
`;

// ─── Phase 14 — PERFORMANCE — Pipeline Resilience ──────────────────────────

export const PIPELINE_RES_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class PipelineResilience {
    public sealed class Queue {
        public string Name { get; }
        public List<object> Buffer { get; } = new();
        public int MaxSize { get; }
        public int Dropped { get; set; }
        public Queue(string n, int m) { Name = n; MaxSize = m; }
    }

    private static readonly Dictionary<string, Queue> _queues = new();
    private static readonly object _lock = new();

    public static Queue CreateQueue(string name, int maxSize) {
        lock (_lock) {
            var q = new Queue(name, maxSize);
            _queues[name] = q;
            return q;
        }
    }

    public static bool Publish(string queueName, object msg) {
        lock (_lock) {
            if (!_queues.TryGetValue(queueName, out var q)) return false;
            if (q.Buffer.Count >= q.MaxSize) { q.Dropped++; return false; }
            q.Buffer.Add(msg);
            return true;
        }
    }

    public static object Consume(string queueName) {
        lock (_lock) {
            if (!_queues.TryGetValue(queueName, out var q) || q.Buffer.Count == 0) return null;
            var first = q.Buffer[0];
            q.Buffer.RemoveAt(0);
            return first;
        }
    }

    public static int QueueLag(string queueName) {
        lock (_lock) return _queues.TryGetValue(queueName, out var q) ? q.Buffer.Count : 0;
    }
}
`;

// ─── Phase 15 — ORCHESTRATION — Pipeline Composition ───────────────────────

export const PIPE_COMPOSE_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class PipelineComposition {
    public sealed class Pipeline {
        public string Name { get; }
        public List<Func<object, object>> Stages { get; }
        public Pipeline(string n, List<Func<object, object>> s) { Name = n; Stages = s; }

        public object Run(object input) {
            object current = input;
            for (int i = 0; i < Stages.Count; i++) {
                try { current = Stages[i](current); }
                catch (Exception e) { throw new Exception("stage " + i + ": " + e.Message, e); }
            }
            return current;
        }
    }

    public static Pipeline Build(string name, params Func<object, object>[] stages) {
        return new Pipeline(name, new List<Func<object, object>>(stages));
    }
}
`;

// ─── Phase 16 — ORCHESTRATION — Universal Input ────────────────────────────

export const UNIVERSAL_INPUT_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class UniversalInput {
    public enum InputFormat { NaturalLanguage, Json, Command, Code }

    public sealed class NormalizedInput {
        public InputFormat Format { get; }
        public string Raw { get; }
        public object Parsed { get; }
        public string ThreadId { get; }
        public NormalizedInput(InputFormat f, string r, object p, string t) {
            Format = f; Raw = r; Parsed = p; ThreadId = t;
        }
    }

    private static readonly Dictionary<string, List<NormalizedInput>> _threads = new();
    private static readonly object _lock = new();

    public static InputFormat DetectFormat(string input) {
        string t = input.Trim();
        if (t.StartsWith("{") || t.StartsWith("[")) return InputFormat.Json;
        if (t.StartsWith("/") || t.StartsWith("$")) return InputFormat.Command;
        if (t.Contains("function ") || t.Contains("def ") || t.Contains("public ")) return InputFormat.Code;
        return InputFormat.NaturalLanguage;
    }

    public static NormalizedInput Normalize(string threadId, string raw) {
        lock (_lock) {
            var n = new NormalizedInput(DetectFormat(raw), raw, raw, threadId);
            if (!_threads.TryGetValue(threadId, out var list)) {
                list = new List<NormalizedInput>();
                _threads[threadId] = list;
            }
            list.Add(n);
            return n;
        }
    }

    public static List<NormalizedInput> ThreadHistory(string threadId) {
        lock (_lock) return _threads.TryGetValue(threadId, out var list)
            ? new List<NormalizedInput>(list)
            : new List<NormalizedInput>();
    }
}
`;

// ─── Phase 17 — EVOLUTION — Self-Evolution ─────────────────────────────────

export const SELF_EVOLVE_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class SelfEvolution {
    public sealed class Mutation {
        public string Id { get; }
        public string Target { get; }
        public string Proposal { get; }
        public bool ShadowOk { get; set; }
        public bool Promoted { get; set; }
        public long CreatedAt { get; }
        public Mutation(string id, string t, string p) {
            Id = id; Target = t; Proposal = p;
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }
    }

    private static readonly List<Mutation> _mutations = new();
    private static readonly object _lock = new();

    public static string Propose(string target, string proposal) {
        lock (_lock) {
            string id = "mut_" + DateTime.UtcNow.Ticks;
            _mutations.Add(new Mutation(id, target, proposal));
            return id;
        }
    }

    public static bool ShadowRun(string mutationId, Func<string, bool> simulate) {
        lock (_lock) {
            foreach (var m in _mutations) {
                if (m.Id == mutationId) {
                    bool ok = simulate(m.Proposal);
                    m.ShadowOk = ok;
                    return ok;
                }
            }
            return false;
        }
    }

    public static bool Promote(string mutationId) {
        lock (_lock) {
            foreach (var m in _mutations) {
                if (m.Id == mutationId && m.ShadowOk) { m.Promoted = true; return true; }
            }
            return false;
        }
    }
}
`;

// ─── Phase 18 — GOVERNANCE — Governance Shield ─────────────────────────────

export const GOV_SHIELD_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class GovernanceShield {
    public sealed class Policy {
        public string Id { get; }
        public string Name { get; }
        public Func<string, Dictionary<string, object>, bool> Check { get; }
        public string Message { get; }
        public Policy(string id, string n, Func<string, Dictionary<string, object>, bool> c, string m) {
            Id = id; Name = n; Check = c; Message = m;
        }
    }

    public sealed class Veto {
        public string PolicyId { get; }
        public string Action { get; }
        public string Reason { get; }
        public long At { get; }
        public Veto(string p, string a, string r) {
            PolicyId = p; Action = a; Reason = r;
            At = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }
    }

    private static readonly List<Policy> _policies = new();
    private static readonly List<Veto> _vetoes = new();
    private static readonly object _lock = new();

    public static void Register(Policy p) { lock (_lock) _policies.Add(p); }

    /// <summary>Returns (ok, violations).</summary>
    public static (bool, List<string>) Check(string action, Dictionary<string, object> ctx) {
        lock (_lock) {
            var violations = new List<string>();
            foreach (var p in _policies) {
                if (!p.Check(action, ctx)) {
                    violations.Add(p.Message);
                    _vetoes.Add(new Veto(p.Id, action, p.Message));
                }
            }
            return (violations.Count == 0, violations);
        }
    }

    public static List<Veto> VetoHistory() { lock (_lock) return new List<Veto>(_vetoes); }
}
`;

// ─── Phase 19 — GOVERNANCE — Audit Chain ───────────────────────────────────

export const AUDIT_CHAIN_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class AuditChain {
    public sealed class Entry {
        public int Index { get; }
        public string Action { get; }
        public string Actor { get; }
        public string Payload { get; }
        public string PrevHash { get; }
        public string Hash { get; }
        public long At { get; }
        public Entry(int i, string ac, string at_, string p, string pr, string h, long t) {
            Index = i; Action = ac; Actor = at_; Payload = p;
            PrevHash = pr; Hash = h; At = t;
        }
    }

    private static readonly List<Entry> _chain = new();
    private static readonly object _lock = new();

    private static string Sha256Hex(string data) {
        using var md = System.Security.Cryptography.SHA256.Create();
        var digest = md.ComputeHash(System.Text.Encoding.UTF8.GetBytes(data));
        var sb = new System.Text.StringBuilder(digest.Length * 2);
        foreach (var b in digest) sb.AppendFormat("{0:x2}", b);
        return sb.ToString();
    }

    private static string HashEntry(int idx, string action, string actor, string payload, string prev, long at) {
        return Sha256Hex(idx + "|" + action + "|" + actor + "|" + payload + "|" + prev + "|" + at);
    }

    public static string Append(string action, string actor, string payload) {
        lock (_lock) {
            string prev = _chain.Count == 0 ? "" : _chain[_chain.Count - 1].Hash;
            long at = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            int idx = _chain.Count;
            string hash = HashEntry(idx, action, actor, payload, prev, at);
            _chain.Add(new Entry(idx, action, actor, payload, prev, hash, at));
            return hash;
        }
    }

    /// <summary>Returns (valid, length-or-firstBadIdx).</summary>
    public static (bool, int) Verify() {
        lock (_lock) {
            string prev = "";
            for (int i = 0; i < _chain.Count; i++) {
                var e = _chain[i];
                string expected = HashEntry(i, e.Action, e.Actor, e.Payload, prev, e.At);
                if (expected != e.Hash || e.PrevHash != prev) return (false, i);
                prev = e.Hash;
            }
            return (true, _chain.Count);
        }
    }
}
`;

// ─── Phase 20 — COMPLIANCE — Regulatory Compliance ─────────────────────────

export const COMPLIANCE_CSHARP = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static class Compliance {
    public sealed class Jurisdiction {
        public string Code { get; }
        public List<string> DataResidencyOk { get; }
        public bool RequiresEncryption { get; }
        public Jurisdiction(string c, List<string> dr, bool re) {
            Code = c; DataResidencyOk = dr; RequiresEncryption = re;
        }
    }

    private static readonly Dictionary<string, Jurisdiction> _jurisdictions = new() {
        { "EU",   new Jurisdiction("EU",   new List<string> { "eu-west", "eu-central" }, true) },
        { "US",   new Jurisdiction("US",   new List<string> { "us-east", "us-west" },     false) },
        { "APAC", new Jurisdiction("APAC", new List<string> { "ap-south", "ap-east" },   false) },
    };

    public static List<string> RouteFor(string code) {
        return _jurisdictions.TryGetValue(code, out var j)
            ? new List<string>(j.DataResidencyOk)
            : new List<string>();
    }

    /// <summary>Returns (ok, reason).</summary>
    public static (bool, string) Check(string code, string region, bool encrypted) {
        if (!_jurisdictions.TryGetValue(code, out var j)) return (false, "Unknown jurisdiction");
        if (j.RequiresEncryption && !encrypted) return (false, "Encryption required");
        foreach (var ok in j.DataResidencyOk) if (ok == region) return (true, "");
        return (false, "Region not in residency allowlist");
    }

    public static Dictionary<string, object> AttestationReport() {
        var regions = new Dictionary<string, object>();
        foreach (var kv in _jurisdictions) regions[kv.Key] = kv.Value.DataResidencyOk;
        return new Dictionary<string, object> {
            { "timestamp", DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() },
            { "jurisdictions", regions },
        };
    }
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// Registry: layerId -> C# body
// ═══════════════════════════════════════════════════════════════════════════

export const CSHARP_LAYER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'self-healing':                 SELF_HEALING_CSHARP,
  'autonomous-triage':            TRIAGE_CSHARP,
  'distributed-consensus':        CONSENSUS_CSHARP,
  'oracle-ripple-precognition':   ORACLE_RIPPLE_CSHARP,
  'anomaly-correlation-engine':   ANOMALY_CSHARP,
  'adaptive-defense':             ADAPTIVE_DEFENSE_CSHARP,
  'zero-trust':                   ZERO_TRUST_CSHARP,
  'cyber-defense':                CYBER_DEFENSE_CSHARP,
  'fleet-intelligence':           FLEET_INTEL_CSHARP,
  'ai-safety':                    AI_SAFETY_CSHARP,
  'ai-cost':                      AI_COST_CSHARP,
  'cognitive-memory':             COG_MEMORY_CSHARP,
  'performance-surgery':          PERF_SURGERY_CSHARP,
  'pipeline-resilience':          PIPELINE_RES_CSHARP,
  'pipeline-composition':         PIPE_COMPOSE_CSHARP,
  'universal-input':              UNIVERSAL_INPUT_CSHARP,
  'self-evolution':               SELF_EVOLVE_CSHARP,
  'governance-shield':            GOV_SHIELD_CSHARP,
  'audit-chain':                  AUDIT_CHAIN_CSHARP,
  'regulatory-compliance':        COMPLIANCE_CSHARP,
});

/** All C# usings any layer body might reference. */
export const CSHARP_STD_USINGS = [
  'System',
  'System.Collections.Generic',
  'System.Linq',
  'System.Threading',
] as const;
