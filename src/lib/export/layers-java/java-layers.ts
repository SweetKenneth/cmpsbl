/**
 * CMPSBL® Native Java Layer Implementations
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Hand-written Java bodies for every Launch Layer + core utility layer.
 *
 * Architecture:
 *   - Each layer exports a string snippet defining a `static class` nested
 *     inside the top-level `Cmpsbl` class. This keeps Java's one-public-class-
 *     per-file rule satisfied while giving every layer its own namespace.
 *   - Wrappers (auto-wire) follow the same caller-isolation rules as TS/Go/Py:
 *     never mutate the caller input map; strip sidecar keys from output.
 *   - Phase ordering is enforced by the Java chain executor
 *     (java-chain-executor.ts), not by these snippets.
 *
 * © CMPSBL® — All rights reserved.
 */

// ─── Phase 1 — RESILIENCE — Self-Healing ───────────────────────────────────

export const SELF_HEALING_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Resilience Module (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class SelfHealing {
    public enum BlastRadius { NODE, SECTOR, SYSTEM }

    public static final class RepairStrategy {
        public final String id, failureType;
        public final List<String> actions;
        public final BlastRadius blastRadius;
        public final long estimatedDurationMs;
        public final double successRate, costScore;
        public RepairStrategy(String id, String ft, List<String> a, BlastRadius br, long d, double sr, double cs) {
            this.id = id; this.failureType = ft; this.actions = a; this.blastRadius = br;
            this.estimatedDurationMs = d; this.successRate = sr; this.costScore = cs;
        }
    }

    public static final class RepairPlan {
        public final String id, capabilityName, failureType;
        public final RepairStrategy strategy;
        public final List<String> actions, rollbackPlan;
        public final long estimatedDurationMs, createdAt;
        public RepairPlan(String id, String cn, String ft, RepairStrategy s, List<String> a, List<String> rb, long d, long ca) {
            this.id = id; this.capabilityName = cn; this.failureType = ft; this.strategy = s;
            this.actions = a; this.rollbackPlan = rb; this.estimatedDurationMs = d; this.createdAt = ca;
        }
    }

    public static final class RepairResult {
        public final String planId, error;
        public final boolean success, rolledBack;
        public final long durationMs;
        public final List<String> actionsExecuted;
        public RepairResult(String pid, boolean s, long d, List<String> ae, boolean rb, String err) {
            this.planId = pid; this.success = s; this.durationMs = d; this.actionsExecuted = ae;
            this.rolledBack = rb; this.error = err;
        }
    }

    private static final List<RepairStrategy> STRATEGIES = new ArrayList<>();
    private static final List<RepairResult> HISTORY = new ArrayList<>();
    private static final Map<String, int[]> SCORES = new HashMap<>();
    private static final Object LOCK = new Object();

    public static void addStrategy(RepairStrategy s) {
        synchronized (LOCK) { STRATEGIES.add(s); SCORES.put(s.id, new int[]{0, 0}); }
    }

    private static double blastScore(BlastRadius r) {
        switch (r) { case SYSTEM: return 1.0; case SECTOR: return 0.5; default: return 0.1; }
    }

    private static int blastIndex(BlastRadius r) {
        switch (r) { case NODE: return 0; case SECTOR: return 1; default: return 2; }
    }

    private static double adjustedRate(String sid) {
        int[] sc = SCORES.get(sid);
        if (sc == null || sc[0] + sc[1] == 0) {
            for (RepairStrategy s : STRATEGIES) if (s.id.equals(sid)) return s.successRate;
            return 0.5;
        }
        return (double) sc[0] / (sc[0] + sc[1]);
    }

    public static RepairPlan planRepair(String capabilityName, String failureType, BlastRadius maxRadius) {
        synchronized (LOCK) {
            int maxIdx = blastIndex(maxRadius);
            List<RepairStrategy> candidates = new ArrayList<>();
            for (RepairStrategy s : STRATEGIES) {
                if (s.failureType.equals(failureType) && blastIndex(s.blastRadius) <= maxIdx) candidates.add(s);
            }
            if (candidates.isEmpty()) return null;
            candidates.sort((a, b) -> {
                double sa = adjustedRate(a.id) * 0.5 - blastScore(a.blastRadius) * 0.3 - a.costScore * 0.2;
                double sb = adjustedRate(b.id) * 0.5 - blastScore(b.blastRadius) * 0.3 - b.costScore * 0.2;
                return Double.compare(sb, sa);
            });
            RepairStrategy best = candidates.get(0);
            List<String> rollback = new ArrayList<>();
            for (int i = best.actions.size() - 1; i >= 0; i--) rollback.add("rollback_" + best.actions.get(i));
            long now = System.currentTimeMillis();
            return new RepairPlan("plan_" + now, capabilityName, failureType, best,
                new ArrayList<>(best.actions), rollback, best.estimatedDurationMs, now);
        }
    }

    public static RepairResult executeRepair(RepairPlan plan, java.util.function.BiFunction<String, String, Boolean> executor,
                                             java.util.function.BiConsumer<String, String> onRollback) {
        long start = System.currentTimeMillis();
        List<String> executed = new ArrayList<>();
        for (String action : plan.actions) {
            if (!executor.apply(action, plan.capabilityName)) {
                if (onRollback != null) {
                    for (int i = executed.size() - 1; i >= 0; i--) {
                        try { onRollback.accept("rollback_" + executed.get(i), plan.capabilityName); } catch (Throwable ignored) {}
                    }
                }
                RepairResult res = new RepairResult(plan.id, false, System.currentTimeMillis() - start,
                    executed, onRollback != null, "Repair action '" + action + "' failed");
                synchronized (LOCK) { SCORES.get(plan.strategy.id)[1]++; HISTORY.add(res); }
                return res;
            }
            executed.add(action);
        }
        RepairResult res = new RepairResult(plan.id, true, System.currentTimeMillis() - start, executed, false, null);
        synchronized (LOCK) { SCORES.get(plan.strategy.id)[0]++; HISTORY.add(res); }
        return res;
    }

    public static List<RepairResult> history() {
        synchronized (LOCK) { return new ArrayList<>(HISTORY); }
    }

    public static double successRate() {
        synchronized (LOCK) {
            if (HISTORY.isEmpty()) return 1.0;
            int s = 0; for (RepairResult r : HISTORY) if (r.success) s++;
            return (double) s / HISTORY.size();
        }
    }
}
`;

// ─── Phase 2 — RESILIENCE — Autonomous Triage ──────────────────────────────

export const TRIAGE_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class Triage {
    public enum Severity { CRITICAL, DEGRADED, WARNING, INFO }

    public static final class SymptomReport {
        public final String capabilityName, symptom;
        public final double value, threshold;
        public long timestamp;
        public SymptomReport(String cn, String s, double v, double t) {
            this.capabilityName = cn; this.symptom = s; this.value = v; this.threshold = t;
        }
    }

    public static final class FailureSignature {
        public final String name;
        public final Map<String, Double> minSymptoms;
        public final Severity severity;
        public final List<String> causes, actions;
        public final double confidence;
        public FailureSignature(String n, Map<String, Double> ms, Severity sv, List<String> c, List<String> a, double conf) {
            this.name = n; this.minSymptoms = ms; this.severity = sv; this.causes = c; this.actions = a; this.confidence = conf;
        }
    }

    public static final class Diagnosis {
        public final String capabilityName;
        public final Severity severity;
        public final List<SymptomReport> symptoms;
        public final List<String> possibleCauses, recommendedActions;
        public final double confidence;
        public final long diagnosedAt;
        public Diagnosis(String cn, Severity sv, List<SymptomReport> s, List<String> pc, List<String> ra, double conf, long da) {
            this.capabilityName = cn; this.severity = sv; this.symptoms = s; this.possibleCauses = pc;
            this.recommendedActions = ra; this.confidence = conf; this.diagnosedAt = da;
        }
    }

    private static final Map<String, List<SymptomReport>> BUFFER = new HashMap<>();
    private static final Object LOCK = new Object();
    private static final List<FailureSignature> SIGNATURES = new ArrayList<>();
    static {
        Map<String, Double> ml = new HashMap<>(); ml.put("memory_usage", 0.9); ml.put("gc_pressure", 0.7);
        SIGNATURES.add(new FailureSignature("memory_leak", ml, Severity.CRITICAL,
            Arrays.asList("Unbounded cache growth"), Arrays.asList("restart", "alert"), 0.85));
        Map<String, Double> cf = new HashMap<>(); cf.put("error_rate", 0.3); cf.put("dependency_errors", 0.5);
        SIGNATURES.add(new FailureSignature("cascading_failure", cf, Severity.CRITICAL,
            Arrays.asList("Upstream failure"), Arrays.asList("circuit_break", "reroute", "alert"), 0.80));
        Map<String, Double> ls = new HashMap<>(); ls.put("latency_p95", 5000.0);
        SIGNATURES.add(new FailureSignature("latency_spike", ls, Severity.DEGRADED,
            Arrays.asList("Slow query"), Arrays.asList("scale_up", "reroute"), 0.75));
    }

    public static void reportSymptom(SymptomReport r) {
        synchronized (LOCK) {
            r.timestamp = System.currentTimeMillis();
            List<SymptomReport> list = BUFFER.computeIfAbsent(r.capabilityName, k -> new ArrayList<>());
            list.add(r);
            if (list.size() > 100) list.subList(0, list.size() - 100).clear();
        }
    }

    public static List<Diagnosis> diagnose(String capabilityName) {
        synchronized (LOCK) {
            long now = System.currentTimeMillis();
            List<String> targets = capabilityName != null && !capabilityName.isEmpty()
                ? Arrays.asList(capabilityName) : new ArrayList<>(BUFFER.keySet());
            List<Diagnosis> out = new ArrayList<>();
            for (String cap : targets) {
                List<SymptomReport> all = BUFFER.getOrDefault(cap, Collections.emptyList());
                List<SymptomReport> fresh = new ArrayList<>();
                for (SymptomReport s : all) if (now - s.timestamp < 300_000L) fresh.add(s);
                if (fresh.isEmpty()) continue;
                FailureSignature best = null; double bestScore = 0.0;
                for (FailureSignature sig : SIGNATURES) {
                    int matched = 0;
                    for (Map.Entry<String, Double> req : sig.minSymptoms.entrySet()) {
                        for (SymptomReport s : fresh) if (s.symptom.equals(req.getKey()) && s.value >= req.getValue()) { matched++; break; }
                    }
                    if (sig.minSymptoms.isEmpty()) continue;
                    double score = (double) matched / sig.minSymptoms.size();
                    if (score > bestScore && score >= 0.5) { best = sig; bestScore = score; }
                }
                if (best != null) {
                    out.add(new Diagnosis(cap, best.severity, fresh, best.causes, best.actions, best.confidence, now));
                }
            }
            return out;
        }
    }
}
`;

// ─── Phase 3 — RESILIENCE — Distributed Consensus ──────────────────────────

export const CONSENSUS_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class Consensus {
    public static final class HeartbeatNode {
        public final String id;
        public long lastSeenMs;
        public int consecutiveMisses;
        public boolean isAlive;
        public HeartbeatNode(String id) { this.id = id; this.isAlive = true; }
    }

    private static final Map<String, HeartbeatNode> NODES = new HashMap<>();
    private static final Object LOCK = new Object();

    public static void heartbeatTick(String nodeId) {
        synchronized (LOCK) {
            HeartbeatNode n = NODES.computeIfAbsent(nodeId, HeartbeatNode::new);
            n.lastSeenMs = System.currentTimeMillis();
            n.consecutiveMisses = 0;
            n.isAlive = true;
        }
    }

    public static List<String> checkLiveness(long timeoutMs) {
        synchronized (LOCK) {
            long now = System.currentTimeMillis();
            List<String> dead = new ArrayList<>();
            for (HeartbeatNode n : NODES.values()) {
                if (now - n.lastSeenMs > timeoutMs) {
                    n.consecutiveMisses++;
                    if (n.consecutiveMisses >= 3) { n.isAlive = false; dead.add(n.id); }
                }
            }
            return dead;
        }
    }

    public static int quorumSize() {
        synchronized (LOCK) {
            int alive = 0; for (HeartbeatNode n : NODES.values()) if (n.isAlive) alive++;
            return alive / 2 + 1;
        }
    }

    public static boolean hasQuorum(int votes) { return votes >= quorumSize(); }
}
`;

// ─── Phase 4 — FORESIGHT — Oracle-Ripple ───────────────────────────────────

export const ORACLE_RIPPLE_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class OracleRipple {
    public static final class Observation {
        public final String capabilityName, metric;
        public final double value;
        public long timestamp;
        public Observation(String cn, String m, double v) { this.capabilityName = cn; this.metric = m; this.value = v; }
    }

    public static final class Forecast {
        public final String capabilityName, metric;
        public final long horizonMs, issuedAt;
        public final double predictedValue, confidence;
        public Forecast(String cn, String m, long h, double pv, double c, long ia) {
            this.capabilityName = cn; this.metric = m; this.horizonMs = h;
            this.predictedValue = pv; this.confidence = c; this.issuedAt = ia;
        }
    }

    private static final Map<String, List<Observation>> OBS = new HashMap<>();
    private static final Object LOCK = new Object();

    public static void record(Observation o) {
        synchronized (LOCK) {
            o.timestamp = System.currentTimeMillis();
            String key = o.capabilityName + "|" + o.metric;
            List<Observation> list = OBS.computeIfAbsent(key, k -> new ArrayList<>());
            list.add(o);
            if (list.size() > 100) list.subList(0, list.size() - 100).clear();
        }
    }

    public static Forecast forecast(String capability, String metric, long horizonMs) {
        synchronized (LOCK) {
            List<Observation> list = OBS.getOrDefault(capability + "|" + metric, Collections.emptyList());
            if (list.size() < 3) return null;
            double n = list.size(), sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (int i = 0; i < list.size(); i++) {
                double x = i, y = list.get(i).value;
                sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
            }
            double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX + 1e-9);
            double intercept = (sumY - slope * sumX) / n;
            double futureX = n + horizonMs / 1000.0;
            double predicted = slope * futureX + intercept;
            double confidence = Math.max(0, 1.0 - Math.abs(slope) / 100.0);
            return new Forecast(capability, metric, horizonMs, predicted, confidence, System.currentTimeMillis());
        }
    }
}
`;

// ─── Phase 5 — FORESIGHT — Anomaly Correlation ─────────────────────────────

export const ANOMALY_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class Anomaly {
    public static final class Signal {
        public final String stream;
        public final double value, baseline;
        public double deviation;
        public long timestamp;
        public Signal(String s, double v, double b) { this.stream = s; this.value = v; this.baseline = b; }
    }

    public static final class IncidentHypothesis {
        public final String id, severity;
        public final List<String> streams;
        public final double confidence;
        public final long issuedAt;
        public IncidentHypothesis(String id, List<String> s, String sv, double c, long ia) {
            this.id = id; this.streams = s; this.severity = sv; this.confidence = c; this.issuedAt = ia;
        }
    }

    private static final List<Signal> BUF = new ArrayList<>();
    private static final Object LOCK = new Object();

    public static void observe(Signal s) {
        synchronized (LOCK) {
            s.timestamp = System.currentTimeMillis();
            s.deviation = Math.abs(s.value - s.baseline);
            BUF.add(s);
            if (BUF.size() > 500) BUF.subList(0, BUF.size() - 500).clear();
        }
    }

    public static List<IncidentHypothesis> correlate(long windowMs) {
        synchronized (LOCK) {
            long now = System.currentTimeMillis();
            Set<String> seen = new LinkedHashSet<>();
            for (Signal s : BUF) {
                if (now - s.timestamp <= windowMs && s.deviation > s.baseline * 0.3) seen.add(s.stream);
            }
            if (seen.size() < 2) return Collections.emptyList();
            double conf = Math.min(1.0, seen.size() / 5.0);
            String severity = seen.size() >= 4 ? "critical" : (seen.size() >= 3 ? "degraded" : "warning");
            return Arrays.asList(new IncidentHypothesis("inc_" + now, new ArrayList<>(seen), severity, conf, now));
        }
    }
}
`;

// ─── Phase 6 — SECURITY — Adaptive Defense ─────────────────────────────────

export const ADAPTIVE_DEFENSE_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class AdaptiveDefense {
    public static final class Defense {
        public final String id, pattern;
        public double fitness;
        public int generation, matches;
        public final long createdAt;
        public Defense(String id, String p) {
            this.id = id; this.pattern = p; this.fitness = 1.0; this.generation = 0;
            this.matches = 0; this.createdAt = System.currentTimeMillis();
        }
    }

    private static final List<Defense> DEFENSES = new ArrayList<>();
    private static final Object LOCK = new Object();

    public static String seed(String pattern) {
        synchronized (LOCK) {
            String id = "def_" + System.nanoTime();
            DEFENSES.add(new Defense(id, pattern));
            return id;
        }
    }

    public static List<String> test(String input) {
        synchronized (LOCK) {
            List<String> matched = new ArrayList<>();
            for (Defense d : DEFENSES) {
                if (input.contains(d.pattern)) { d.matches++; d.fitness += 0.1; matched.add(d.id); }
            }
            return matched;
        }
    }

    public static int evolve() {
        synchronized (LOCK) {
            int culled = 0;
            Iterator<Defense> it = DEFENSES.iterator();
            while (it.hasNext()) {
                Defense d = it.next();
                if (d.fitness < 0.5 && d.generation > 0) { it.remove(); culled++; }
            }
            return culled;
        }
    }
}
`;

// ─── Phase 7 — SECURITY — Zero-Trust ───────────────────────────────────────

export const ZERO_TRUST_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class ZeroTrust {
    public static final class Session {
        public final String id, userId, boundIp, boundUa;
        public double trustScore;
        public final long issuedAt;
        public long lastActivity;
        public Session(String id, String uid, String ip, String ua) {
            this.id = id; this.userId = uid; this.boundIp = ip; this.boundUa = ua;
            this.trustScore = 1.0; this.issuedAt = System.currentTimeMillis(); this.lastActivity = this.issuedAt;
        }
    }

    private static final Map<String, Session> SESSIONS = new HashMap<>();
    private static final Object LOCK = new Object();

    public static String bind(String userId, String ip, String ua) {
        synchronized (LOCK) {
            String id = "sess_" + userId + "_" + System.currentTimeMillis();
            SESSIONS.put(id, new Session(id, userId, ip, ua));
            return id;
        }
    }

    public static boolean verify(String sessId, String ip, String ua) {
        synchronized (LOCK) {
            Session s = SESSIONS.get(sessId);
            if (s == null) return false;
            if (!s.boundIp.equals(ip)) s.trustScore *= 0.4;
            if (!s.boundUa.equals(ua)) s.trustScore *= 0.6;
            s.lastActivity = System.currentTimeMillis();
            return s.trustScore >= 0.5;
        }
    }

    public static void revoke(String sessId) {
        synchronized (LOCK) { SESSIONS.remove(sessId); }
    }
}
`;

// ─── Phase 8 — SECURITY — Cyber Defense ────────────────────────────────────

export const CYBER_DEFENSE_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class CyberDefense {
    public static final class IOC {
        public final String indicator, type;
        public int hits;
        public final long firstSeen;
        public long lastSeen;
        public IOC(String i, String t) {
            this.indicator = i; this.type = t; this.hits = 1;
            this.firstSeen = System.currentTimeMillis(); this.lastSeen = this.firstSeen;
        }
    }

    private static final Map<String, IOC> IOCS = new HashMap<>();
    private static final Map<String, Integer> TRAFFIC = new HashMap<>();
    private static final Object LOCK = new Object();

    public static void observeIoc(String indicator, String type) {
        synchronized (LOCK) {
            String k = type + ":" + indicator;
            IOC e = IOCS.get(k);
            if (e == null) IOCS.put(k, new IOC(indicator, type));
            else { e.hits++; e.lastSeen = System.currentTimeMillis(); }
        }
    }

    public static boolean ddosCheck(String sourceIp) {
        synchronized (LOCK) {
            int n = TRAFFIC.getOrDefault(sourceIp, 0) + 1;
            TRAFFIC.put(sourceIp, n);
            return n <= 100;
        }
    }

    public static void ddosReset() { synchronized (LOCK) { TRAFFIC.clear(); } }
}
`;

// ─── Phase 9 — INTELLIGENCE — Fleet Intelligence ───────────────────────────

export const FLEET_INTEL_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class FleetIntelligence {
    public static final class Provider {
        public final String id;
        public final double cost, latencyMs, quality;
        public boolean available;
        public int calls, failures;
        public Provider(String id, double c, double l, double q) {
            this.id = id; this.cost = c; this.latencyMs = l; this.quality = q; this.available = true;
        }
    }

    private static final Map<String, Provider> PROVIDERS = new HashMap<>();
    private static final Object LOCK = new Object();

    public static Provider register(String id, double cost, double latencyMs, double quality) {
        synchronized (LOCK) {
            Provider p = new Provider(id, cost, latencyMs, quality);
            PROVIDERS.put(id, p);
            return p;
        }
    }

    public static double score(Provider p) {
        if (!p.available) return Double.NEGATIVE_INFINITY;
        double failureRate = p.calls > 0 ? (double) p.failures / p.calls : 0.0;
        return (p.quality * 100) - (p.cost * 10) - (p.latencyMs / 100) - (failureRate * 50);
    }

    public static Provider pick() {
        synchronized (LOCK) {
            Provider best = null; double bestScore = Double.NEGATIVE_INFINITY;
            for (Provider p : PROVIDERS.values()) {
                double s = score(p);
                if (s > bestScore) { bestScore = s; best = p; }
            }
            return best;
        }
    }

    public static void recordCall(String id, boolean success) {
        synchronized (LOCK) {
            Provider p = PROVIDERS.get(id);
            if (p == null) return;
            p.calls++;
            if (!success) {
                p.failures++;
                if (p.calls >= 5 && (double) p.failures / p.calls > 0.5) p.available = false;
            }
        }
    }
}
`;

// ─── Phase 10 — INTELLIGENCE — AI Safety ───────────────────────────────────

export const AI_SAFETY_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class AiSafety {
    private static final String[] INJECTION_PATTERNS = {
        "ignore previous instructions", "ignore all previous", "disregard prior",
        "system prompt", "you are now", "pretend you are",
        "<script", "javascript:", "data:text/html",
        "\\\\x", "\\\\u00", "\\\\u202E"
    };

    public static String sanitizePrompt(String input) {
        if (input == null) return null;
        String lower = input.toLowerCase();
        for (String pat : INJECTION_PATTERNS) {
            if (lower.contains(pat)) return "[CMPSBL_BLOCKED]";
        }
        return input;
    }

    /** Deep-sanitize: walks nested Map/List structures. Preserves framework keys (_cmpsbl_/__cmpsbl_). */
    @SuppressWarnings("unchecked")
    public static Object sanitizeDeep(Object v) {
        if (v instanceof String) return sanitizePrompt((String) v);
        if (v instanceof List) {
            List<Object> in = (List<Object>) v;
            List<Object> out = new ArrayList<>(in.size());
            for (Object e : in) out.add(sanitizeDeep(e));
            return out;
        }
        if (v instanceof Map) {
            Map<String, Object> in = (Map<String, Object>) v;
            Map<String, Object> out = new LinkedHashMap<>();
            for (Map.Entry<String, Object> e : in.entrySet()) {
                String k = e.getKey();
                if (k.startsWith("_cmpsbl_") || k.startsWith("__cmpsbl_")) {
                    out.put(k, e.getValue());
                } else {
                    out.put(k, sanitizeDeep(e.getValue()));
                }
            }
            return out;
        }
        return v;
    }

    public static double checkHallucination(String claim, List<String> sources) {
        if (sources == null || sources.isEmpty()) return 0.0;
        String lower = claim.toLowerCase();
        int supported = 0;
        for (String src : sources) {
            String s = src.toLowerCase();
            if (s.contains(lower) || lower.contains(s)) supported++;
        }
        return (double) supported / sources.size();
    }
}
`;

// ─── Phase 11 — INTELLIGENCE — AI Cost ─────────────────────────────────────

export const AI_COST_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class AiCost {
    private static long budgetCents = 1_000_000L;
    private static long spentCents = 0L;
    private static final Object LOCK = new Object();

    public static void setBudget(long cents) { synchronized (LOCK) { budgetCents = cents; } }

    public static boolean canSpend(long cents) {
        synchronized (LOCK) { return spentCents + cents <= budgetCents; }
    }

    public static void recordSpend(long cents) { synchronized (LOCK) { spentCents += cents; } }

    public static long budgetRemaining() {
        synchronized (LOCK) { return budgetCents - spentCents; }
    }

    public static String optimizeTokens(String text, int maxTokens) {
        int maxChars = maxTokens * 4;
        return text.length() <= maxChars ? text : text.substring(0, maxChars);
    }
}
`;

// ─── Phase 12 — INTELLIGENCE — Cognitive Memory ────────────────────────────

export const COG_MEMORY_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class CognitiveMemory {
    public static final class MemoryNode {
        public final String id, content;
        public final List<String> edges = new ArrayList<>();
        public final long createdAt;
        public MemoryNode(String id, String c) {
            this.id = id; this.content = c; this.createdAt = System.currentTimeMillis();
        }
    }

    private static final Map<String, MemoryNode> NODES = new LinkedHashMap<>();
    private static final Object LOCK = new Object();

    public static String remember(String content) {
        synchronized (LOCK) {
            for (MemoryNode n : NODES.values()) if (n.content.equals(content)) return n.id;
            String id = "mem_" + System.nanoTime();
            NODES.put(id, new MemoryNode(id, content));
            return id;
        }
    }

    public static void link(String fromId, String toId) {
        synchronized (LOCK) {
            MemoryNode n = NODES.get(fromId);
            if (n == null) return;
            if (!n.edges.contains(toId)) n.edges.add(toId);
        }
    }

    public static List<String> recall(String query) {
        synchronized (LOCK) {
            String lower = query.toLowerCase();
            List<String> hits = new ArrayList<>();
            for (MemoryNode n : NODES.values()) if (n.content.toLowerCase().contains(lower)) hits.add(n.id);
            return hits;
        }
    }
}
`;

// ─── Phase 13 — PERFORMANCE — Performance Surgery ──────────────────────────

export const PERF_SURGERY_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class PerformanceSurgery {
    public static final class Sample {
        public final String function;
        public final double durationMs;
        public final long timestamp;
        public Sample(String f, double d) { this.function = f; this.durationMs = d; this.timestamp = System.currentTimeMillis(); }
    }

    private static final Map<String, List<Sample>> SAMPLES = new HashMap<>();
    private static final Object LOCK = new Object();

    public static void recordSample(String function, double durationMs) {
        synchronized (LOCK) {
            List<Sample> list = SAMPLES.computeIfAbsent(function, k -> new ArrayList<>());
            list.add(new Sample(function, durationMs));
            if (list.size() > 1000) list.subList(0, list.size() - 1000).clear();
        }
    }

    public static double p99(String function) {
        synchronized (LOCK) {
            List<Sample> list = SAMPLES.get(function);
            if (list == null || list.isEmpty()) return 0.0;
            double[] durations = new double[list.size()];
            for (int i = 0; i < list.size(); i++) durations[i] = list.get(i).durationMs;
            Arrays.sort(durations);
            int idx = Math.min((int) (durations.length * 0.99), durations.length - 1);
            return durations[idx];
        }
    }

    public static boolean detectRegression(String function, double baselineMs) {
        return p99(function) > baselineMs * 1.5;
    }
}
`;

// ─── Phase 14 — PERFORMANCE — Pipeline Resilience ──────────────────────────

export const PIPELINE_RES_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class PipelineResilience {
    public static final class Queue {
        public final String name;
        public final List<Object> buffer = new ArrayList<>();
        public final int maxSize;
        public int dropped;
        public Queue(String n, int m) { this.name = n; this.maxSize = m; }
    }

    private static final Map<String, Queue> QUEUES = new HashMap<>();
    private static final Object LOCK = new Object();

    public static Queue createQueue(String name, int maxSize) {
        synchronized (LOCK) {
            Queue q = new Queue(name, maxSize);
            QUEUES.put(name, q);
            return q;
        }
    }

    public static boolean publish(String queueName, Object msg) {
        synchronized (LOCK) {
            Queue q = QUEUES.get(queueName);
            if (q == null) return false;
            if (q.buffer.size() >= q.maxSize) { q.dropped++; return false; }
            q.buffer.add(msg);
            return true;
        }
    }

    public static Object consume(String queueName) {
        synchronized (LOCK) {
            Queue q = QUEUES.get(queueName);
            if (q == null || q.buffer.isEmpty()) return null;
            return q.buffer.remove(0);
        }
    }

    public static int queueLag(String queueName) {
        synchronized (LOCK) {
            Queue q = QUEUES.get(queueName);
            return q == null ? 0 : q.buffer.size();
        }
    }
}
`;

// ─── Phase 15 — ORCHESTRATION — Pipeline Composition ───────────────────────

export const PIPE_COMPOSE_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class PipelineComposition {
    public interface Stage { Object apply(Object input) throws Exception; }

    public static final class Pipeline {
        public final String name;
        public final List<Stage> stages;
        public Pipeline(String n, List<Stage> s) { this.name = n; this.stages = s; }

        public Object run(Object input) throws Exception {
            Object current = input;
            for (int i = 0; i < stages.size(); i++) {
                try { current = stages.get(i).apply(current); }
                catch (Exception e) { throw new RuntimeException("stage " + i + ": " + e.getMessage(), e); }
            }
            return current;
        }
    }

    public static Pipeline pipeline(String name, Stage... stages) {
        return new Pipeline(name, Arrays.asList(stages));
    }
}
`;

// ─── Phase 16 — ORCHESTRATION — Universal Input ────────────────────────────

export const UNIVERSAL_INPUT_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class UniversalInput {
    public enum InputFormat { NATURAL_LANGUAGE, JSON, COMMAND, CODE }

    public static final class NormalizedInput {
        public final InputFormat format;
        public final String raw, threadId;
        public final Object parsed;
        public NormalizedInput(InputFormat f, String r, Object p, String t) {
            this.format = f; this.raw = r; this.parsed = p; this.threadId = t;
        }
    }

    private static final Map<String, List<NormalizedInput>> THREADS = new HashMap<>();
    private static final Object LOCK = new Object();

    public static InputFormat detectFormat(String input) {
        String t = input.trim();
        if (t.startsWith("{") || t.startsWith("[")) return InputFormat.JSON;
        if (t.startsWith("/") || t.startsWith("$")) return InputFormat.COMMAND;
        if (t.contains("function ") || t.contains("def ") || t.contains("public ")) return InputFormat.CODE;
        return InputFormat.NATURAL_LANGUAGE;
    }

    public static NormalizedInput normalize(String threadId, String raw) {
        synchronized (LOCK) {
            NormalizedInput n = new NormalizedInput(detectFormat(raw), raw, raw, threadId);
            THREADS.computeIfAbsent(threadId, k -> new ArrayList<>()).add(n);
            return n;
        }
    }

    public static List<NormalizedInput> threadHistory(String threadId) {
        synchronized (LOCK) { return new ArrayList<>(THREADS.getOrDefault(threadId, Collections.emptyList())); }
    }
}
`;

// ─── Phase 17 — EVOLUTION — Self-Evolution ─────────────────────────────────

export const SELF_EVOLVE_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class SelfEvolution {
    public static final class Mutation {
        public final String id, target, proposal;
        public boolean shadowOk, promoted;
        public final long createdAt;
        public Mutation(String id, String t, String p) {
            this.id = id; this.target = t; this.proposal = p; this.createdAt = System.currentTimeMillis();
        }
    }

    private static final List<Mutation> MUTATIONS = new ArrayList<>();
    private static final Object LOCK = new Object();

    public static String propose(String target, String proposal) {
        synchronized (LOCK) {
            String id = "mut_" + System.nanoTime();
            MUTATIONS.add(new Mutation(id, target, proposal));
            return id;
        }
    }

    public static boolean shadowRun(String mutationId, java.util.function.Function<String, Boolean> simulate) {
        synchronized (LOCK) {
            for (Mutation m : MUTATIONS) {
                if (m.id.equals(mutationId)) {
                    boolean ok = simulate.apply(m.proposal);
                    m.shadowOk = ok;
                    return ok;
                }
            }
            return false;
        }
    }

    public static boolean promote(String mutationId) {
        synchronized (LOCK) {
            for (Mutation m : MUTATIONS) {
                if (m.id.equals(mutationId) && m.shadowOk) { m.promoted = true; return true; }
            }
            return false;
        }
    }
}
`;

// ─── Phase 18 — GOVERNANCE — Governance Shield ─────────────────────────────

export const GOV_SHIELD_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class GovernanceShield {
    public interface PolicyCheck { boolean apply(String action, Map<String, Object> ctx); }

    public static final class Policy {
        public final String id, name, message;
        public final PolicyCheck check;
        public Policy(String id, String n, PolicyCheck c, String m) {
            this.id = id; this.name = n; this.check = c; this.message = m;
        }
    }

    public static final class Veto {
        public final String policyId, action, reason;
        public final long at;
        public Veto(String p, String a, String r) {
            this.policyId = p; this.action = a; this.reason = r; this.at = System.currentTimeMillis();
        }
    }

    private static final List<Policy> POLICIES = new ArrayList<>();
    private static final List<Veto> VETOES = new ArrayList<>();
    private static final Object LOCK = new Object();

    public static void register(Policy p) { synchronized (LOCK) { POLICIES.add(p); } }

    /** Returns [okFlag (Boolean), violations (List<String>)]. */
    public static Object[] check(String action, Map<String, Object> ctx) {
        synchronized (LOCK) {
            List<String> violations = new ArrayList<>();
            for (Policy p : POLICIES) {
                if (!p.check.apply(action, ctx)) {
                    violations.add(p.message);
                    VETOES.add(new Veto(p.id, action, p.message));
                }
            }
            return new Object[] { violations.isEmpty(), violations };
        }
    }

    public static List<Veto> vetoHistory() {
        synchronized (LOCK) { return new ArrayList<>(VETOES); }
    }
}
`;

// ─── Phase 19 — GOVERNANCE — Audit Chain ───────────────────────────────────

export const AUDIT_CHAIN_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class AuditChain {
    public static final class Entry {
        public final int index;
        public final String action, actor, payload, prevHash, hash;
        public final long at;
        public Entry(int i, String ac, String at_, String p, String pr, String h, long t) {
            this.index = i; this.action = ac; this.actor = at_; this.payload = p;
            this.prevHash = pr; this.hash = h; this.at = t;
        }
    }

    private static final List<Entry> CHAIN = new ArrayList<>();
    private static final Object LOCK = new Object();

    private static String sha256Hex(String data) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] dig = md.digest(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(dig.length * 2);
            for (byte b : dig) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private static String hashEntry(int idx, String action, String actor, String payload, String prev, long at) {
        return sha256Hex(idx + "|" + action + "|" + actor + "|" + payload + "|" + prev + "|" + at);
    }

    public static String append(String action, String actor, String payload) {
        synchronized (LOCK) {
            String prev = CHAIN.isEmpty() ? "" : CHAIN.get(CHAIN.size() - 1).hash;
            long at = System.currentTimeMillis();
            int idx = CHAIN.size();
            String hash = hashEntry(idx, action, actor, payload, prev, at);
            CHAIN.add(new Entry(idx, action, actor, payload, prev, hash, at));
            return hash;
        }
    }

    /** Returns [valid (Boolean), length (Integer)]. */
    public static Object[] verify() {
        synchronized (LOCK) {
            String prev = "";
            for (int i = 0; i < CHAIN.size(); i++) {
                Entry e = CHAIN.get(i);
                String expected = hashEntry(i, e.action, e.actor, e.payload, prev, e.at);
                if (!expected.equals(e.hash) || !e.prevHash.equals(prev)) return new Object[] { false, i };
                prev = e.hash;
            }
            return new Object[] { true, CHAIN.size() };
        }
    }
}
`;

// ─── Phase 20 — COMPLIANCE — Regulatory Compliance ─────────────────────────

export const COMPLIANCE_JAVA = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
public static final class Compliance {
    public static final class Jurisdiction {
        public final String code;
        public final List<String> dataResidencyOk;
        public final boolean requiresEncryption;
        public Jurisdiction(String c, List<String> dr, boolean re) {
            this.code = c; this.dataResidencyOk = dr; this.requiresEncryption = re;
        }
    }

    private static final Map<String, Jurisdiction> JURISDICTIONS = new HashMap<>();
    static {
        JURISDICTIONS.put("EU", new Jurisdiction("EU", Arrays.asList("eu-west", "eu-central"), true));
        JURISDICTIONS.put("US", new Jurisdiction("US", Arrays.asList("us-east", "us-west"), false));
        JURISDICTIONS.put("APAC", new Jurisdiction("APAC", Arrays.asList("ap-south", "ap-east"), false));
    }

    public static List<String> routeFor(String code) {
        Jurisdiction j = JURISDICTIONS.get(code);
        return j == null ? Collections.emptyList() : new ArrayList<>(j.dataResidencyOk);
    }

    /** Returns [ok (Boolean), reason (String)]. */
    public static Object[] check(String code, String region, boolean encrypted) {
        Jurisdiction j = JURISDICTIONS.get(code);
        if (j == null) return new Object[] { false, "Unknown jurisdiction" };
        if (j.requiresEncryption && !encrypted) return new Object[] { false, "Encryption required" };
        for (String ok : j.dataResidencyOk) if (ok.equals(region)) return new Object[] { true, "" };
        return new Object[] { false, "Region not in residency allowlist" };
    }

    public static Map<String, Object> attestationReport() {
        Map<String, Object> regions = new LinkedHashMap<>();
        for (Map.Entry<String, Jurisdiction> e : JURISDICTIONS.entrySet()) regions.put(e.getKey(), e.getValue().dataResidencyOk);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("timestamp", System.currentTimeMillis());
        out.put("jurisdictions", regions);
        return out;
    }
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// Registry: layerId -> Java body
// ═══════════════════════════════════════════════════════════════════════════

export const JAVA_LAYER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'self-healing':                 SELF_HEALING_JAVA,
  'autonomous-triage':            TRIAGE_JAVA,
  'distributed-consensus':        CONSENSUS_JAVA,
  'oracle-ripple-precognition':   ORACLE_RIPPLE_JAVA,
  'anomaly-correlation-engine':   ANOMALY_JAVA,
  'adaptive-defense':             ADAPTIVE_DEFENSE_JAVA,
  'zero-trust':                   ZERO_TRUST_JAVA,
  'cyber-defense':                CYBER_DEFENSE_JAVA,
  'fleet-intelligence':           FLEET_INTEL_JAVA,
  'ai-safety':                    AI_SAFETY_JAVA,
  'ai-cost':                      AI_COST_JAVA,
  'cognitive-memory':             COG_MEMORY_JAVA,
  'performance-surgery':          PERF_SURGERY_JAVA,
  'pipeline-resilience':          PIPELINE_RES_JAVA,
  'pipeline-composition':         PIPE_COMPOSE_JAVA,
  'universal-input':              UNIVERSAL_INPUT_JAVA,
  'self-evolution':               SELF_EVOLVE_JAVA,
  'governance-shield':            GOV_SHIELD_JAVA,
  'audit-chain':                  AUDIT_CHAIN_JAVA,
  'regulatory-compliance':        COMPLIANCE_JAVA,
});

/** All Java imports any layer body might reference. */
export const JAVA_STD_IMPORTS = [
  'java.util.*',
  'java.util.concurrent.*',
] as const;
