/**
 * CMPSBL® Native Java — Tier 1 Kernel (Resource Budget + Health Probe)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const JAVA_KERNEL_GOVERNANCE_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'resource-budget-gate': `${HEADER('Resource Budget Gate')}
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

public final class CmpsblBudget {
    public Long maxWallMs;
    public Long maxMemoryBytes;
    public Integer maxDepth;

    public static final class Verdict {
        public final boolean allowed;
        public final String reason;
        public final int strikes;
        public Verdict(boolean a, String r, int s) { allowed = a; reason = r; strikes = s; }
    }

    public static final class Breach {
        public final String name, kind;
        public final long observed, limit, ts;
        public Breach(String n, String k, long o, long l, long t) {
            name = n; kind = k; observed = o; limit = l; ts = t;
        }
    }

    private static final int BREACH_MAX = 256;
    private static final int STRIKE_THRESHOLD = 3;
    private static final ReentrantLock LOCK = new ReentrantLock();
    private static final Map<String, CmpsblBudget> BUDGETS = new HashMap<>();
    private static final Map<String, Integer> DEPTH = new HashMap<>();
    private static final Map<String, Integer> STRIKES = new HashMap<>();
    private static final ArrayDeque<Breach> BREACHES = new ArrayDeque<>();

    public static void declare(String name, CmpsblBudget b) {
        LOCK.lock(); try { BUDGETS.put(name, b); } finally { LOCK.unlock(); }
    }

    private static int strike(String name, String kind, long observed, long limit) {
        int n = STRIKES.getOrDefault(name, 0) + 1;
        STRIKES.put(name, n);
        BREACHES.addLast(new Breach(name, kind, observed, limit, System.currentTimeMillis()));
        while (BREACHES.size() > BREACH_MAX) BREACHES.removeFirst();
        return n;
    }

    public static Verdict enter(String name) {
        LOCK.lock();
        try {
            int cur = DEPTH.getOrDefault(name, 0);
            CmpsblBudget b = BUDGETS.get(name);
            if (b != null && b.maxDepth != null && cur >= b.maxDepth) {
                int n = strike(name, "depth", cur + 1L, b.maxDepth);
                return new Verdict(false, "depth-exceeded", n);
            }
            DEPTH.put(name, cur + 1);
            return new Verdict(true, null, STRIKES.getOrDefault(name, 0));
        } finally { LOCK.unlock(); }
    }

    public static Verdict exit(String name, long wallMs, Long memBytes) {
        LOCK.lock();
        try {
            int cur = DEPTH.getOrDefault(name, 1);
            DEPTH.put(name, Math.max(0, cur - 1));
            CmpsblBudget b = BUDGETS.get(name);
            if (b == null) return new Verdict(true, null, STRIKES.getOrDefault(name, 0));
            String reason = null;
            if (b.maxWallMs != null && wallMs > b.maxWallMs) {
                strike(name, "wall-time", wallMs, b.maxWallMs);
                reason = "wall-time-exceeded";
            }
            if (memBytes != null && b.maxMemoryBytes != null && memBytes > b.maxMemoryBytes) {
                strike(name, "memory", memBytes, b.maxMemoryBytes);
                reason = reason == null ? "memory-exceeded" : reason + "+memory-exceeded";
            }
            return new Verdict(reason == null, reason, STRIKES.getOrDefault(name, 0));
        } finally { LOCK.unlock(); }
    }

    public static boolean shouldQuarantine(String name) {
        LOCK.lock(); try { return STRIKES.getOrDefault(name, 0) >= STRIKE_THRESHOLD; } finally { LOCK.unlock(); }
    }

    public static int strikesFor(String name) {
        LOCK.lock(); try { return STRIKES.getOrDefault(name, 0); } finally { LOCK.unlock(); }
    }

    public static void clearStrikes(String name) {
        LOCK.lock(); try { STRIKES.remove(name); } finally { LOCK.unlock(); }
    }

    public static List<Breach> allBreaches() {
        LOCK.lock(); try { return new ArrayList<>(BREACHES); } finally { LOCK.unlock(); }
    }

    public static List<String> declaredAll() {
        LOCK.lock(); try { return new ArrayList<>(BUDGETS.keySet()); } finally { LOCK.unlock(); }
    }

    public static void reset() {
        LOCK.lock();
        try { BUDGETS.clear(); DEPTH.clear(); STRIKES.clear(); BREACHES.clear(); }
        finally { LOCK.unlock(); }
    }
}`,

  'kernel-health-probe': `${HEADER('Kernel Health Probe')}
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

public final class CmpsblHealth {
    public static final class Report {
        public final String quartet, store;
        public final int contracts, quarantined, budgetStrikes;
        public final long executions, receipts, ts;
        public Report(String q, String s, int c, int qn, long e, long r, int bs, long t) {
            quartet = q; store = s; contracts = c; quarantined = qn;
            executions = e; receipts = r; budgetStrikes = bs; ts = t;
        }
    }

    private static final ReentrantLock LOCK = new ReentrantLock();
    private static final Map<String, Boolean> SURFACES = new HashMap<>();
    private static final Map<String, Long> COUNTERS = new HashMap<>();

    public static void registerSurface(String name, boolean present) {
        LOCK.lock(); try { SURFACES.put(name, present); } finally { LOCK.unlock(); }
    }

    public static void setCounter(String name, long value) {
        LOCK.lock(); try { COUNTERS.put(name, value); } finally { LOCK.unlock(); }
    }

    public static Report probe() {
        LOCK.lock();
        try {
            int count = 0;
            for (String k : new String[]{"contracts", "quarantine", "executor", "budget"}) {
                if (Boolean.TRUE.equals(SURFACES.get(k))) count++;
            }
            String quartet = count == 4 ? "ok" : count > 0 ? "degraded" : "down";
            String store = Boolean.TRUE.equals(SURFACES.get("store")) ? "ok" : "down";
            return new Report(
                quartet, store,
                COUNTERS.getOrDefault("contracts", 0L).intValue(),
                COUNTERS.getOrDefault("quarantined", 0L).intValue(),
                COUNTERS.getOrDefault("executions", 0L),
                COUNTERS.getOrDefault("receipts", 0L),
                COUNTERS.getOrDefault("budget_strikes", 0L).intValue(),
                System.currentTimeMillis()
            );
        } finally { LOCK.unlock(); }
    }
}`,
});
