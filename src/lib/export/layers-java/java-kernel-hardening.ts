/**
 * CMPSBL® Native Java — Kernel Hardening (Components #15-#20)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const JAVA_KERNEL_HARDENING_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'circuit-breaker-recoverable': `${HEADER('Recoverable Circuit Breaker')}
package com.cmpsbl;

import java.util.HashMap;
import java.util.Map;

public final class CmpsblBreaker {
    public enum State { CLOSED, OPEN, HALF_OPEN }

    public static final class Config {
        public int failureThreshold = 5;
        public long cooldownMs = 30000L;
        public int successThreshold = 1;
    }

    public static final class Verdict {
        public final boolean allowed;
        public final State state;
        public final String reason;
        public Verdict(boolean a, State s, String r) { allowed = a; state = s; reason = r; }
    }

    private static final int QUARANTINE_CYCLES = 3;

    private static final class Entry {
        Config config;
        State state = State.CLOSED;
        int failures, successes, openCycles;
        long openedAt;
    }

    private static final Object LOCK = new Object();
    private static final Map<String, Entry> ENTRIES = new HashMap<>();

    public static void declare(String name, Config config) {
        synchronized (LOCK) {
            Entry e = new Entry();
            e.config = config != null ? config : new Config();
            ENTRIES.put(name, e);
        }
    }

    public static Verdict beforeCall(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e == null) return new Verdict(true, State.CLOSED, null);
            if (e.state == State.OPEN) {
                if (System.currentTimeMillis() - e.openedAt >= e.config.cooldownMs) {
                    e.state = State.HALF_OPEN;
                    return new Verdict(true, State.HALF_OPEN, null);
                }
                return new Verdict(false, State.OPEN, "breaker-open");
            }
            return new Verdict(true, e.state, null);
        }
    }

    public static void recordSuccess(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e == null) return;
            if (e.state == State.HALF_OPEN) {
                e.successes++;
                if (e.successes >= e.config.successThreshold) {
                    e.failures = 0; e.successes = 0;
                    e.state = State.CLOSED;
                }
            } else if (e.state == State.CLOSED) {
                e.failures = 0;
            }
        }
    }

    public static void recordFailure(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e == null) return;
            if (e.state == State.HALF_OPEN) {
                e.successes = 0;
                e.openedAt = System.currentTimeMillis();
                e.openCycles++;
                e.state = State.OPEN;
                return;
            }
            e.failures++;
            if (e.state == State.CLOSED && e.failures >= e.config.failureThreshold) {
                e.openedAt = System.currentTimeMillis();
                e.openCycles++;
                e.state = State.OPEN;
            }
        }
    }

    public static boolean shouldQuarantine(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            return e != null && e.openCycles >= QUARANTINE_CYCLES;
        }
    }

    private CmpsblBreaker() {}
}
`,

  'causality-tracker': `${HEADER('Causality Tracker')}
package com.cmpsbl;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public final class CmpsblCausality {
    public static final class Span {
        public final String traceId, spanId, parentSpanId, name;
        public final long startTs;
        public Long endTs;
        Span(String t, String s, String p, String n, long st) {
            traceId = t; spanId = s; parentSpanId = p; name = n; startTs = st;
        }
    }

    private static final int BUFFER_MAX = 1024;
    private static final SecureRandom RAND = new SecureRandom();
    private static final Object LOCK = new Object();
    private static final List<Span> SPANS = new ArrayList<>();
    private static final List<Span> STACK = new ArrayList<>();

    private static String randId() {
        byte[] b = new byte[8];
        RAND.nextBytes(b);
        StringBuilder sb = new StringBuilder(16);
        for (byte x : b) sb.append(String.format("%02x", x));
        return sb.toString();
    }

    public static Span begin(String name) {
        synchronized (LOCK) {
            String traceId, parentId = null;
            if (!STACK.isEmpty()) {
                Span parent = STACK.get(STACK.size() - 1);
                traceId = parent.traceId;
                parentId = parent.spanId;
            } else {
                traceId = randId();
            }
            Span span = new Span(traceId, randId(), parentId, name, System.currentTimeMillis());
            STACK.add(span);
            SPANS.add(span);
            if (SPANS.size() > BUFFER_MAX) SPANS.remove(0);
            return span;
        }
    }

    public static void end(String spanId) {
        synchronized (LOCK) {
            Iterator<Span> it = STACK.iterator();
            while (it.hasNext()) {
                Span s = it.next();
                if (s.spanId.equals(spanId)) {
                    s.endTs = System.currentTimeMillis();
                    it.remove();
                    return;
                }
            }
        }
    }

    public static int depth() { synchronized (LOCK) { return STACK.size(); } }
    public static int count() { synchronized (LOCK) { return SPANS.size(); } }

    private CmpsblCausality() {}
}
`,

  'backpressure-governor': `${HEADER('Backpressure Governor')}
package com.cmpsbl;

import java.util.HashMap;
import java.util.Map;

public final class CmpsblBackpressure {
    public static final class Limits {
        public int maxConcurrent = 64;
        public int maxQueueDepth = 128;
    }

    public static final class Verdict {
        public final boolean admitted;
        public final String reason;
        public final int inFlight, queued;
        public Verdict(boolean a, String r, int i, int q) { admitted = a; reason = r; inFlight = i; queued = q; }
    }

    private static final class Entry {
        Limits limits;
        int inFlight, queued;
        long totalAdmitted, totalShed;
    }

    private static final Object LOCK = new Object();
    private static final Map<String, Entry> ENTRIES = new HashMap<>();

    public static void declare(String name, Limits limits) {
        synchronized (LOCK) {
            Entry e = new Entry();
            e.limits = limits != null ? limits : new Limits();
            ENTRIES.put(name, e);
        }
    }

    public static Verdict admit(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e == null) return new Verdict(true, null, 0, 0);
            if (e.inFlight >= e.limits.maxConcurrent) {
                String reason = e.queued >= e.limits.maxQueueDepth ? "queue-full" : "concurrency-exceeded";
                e.totalShed++;
                return new Verdict(false, reason, e.inFlight, e.queued);
            }
            e.inFlight++; e.totalAdmitted++;
            return new Verdict(true, null, e.inFlight, e.queued);
        }
    }

    public static void release(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e != null && e.inFlight > 0) e.inFlight--;
        }
    }

    public static double saturation(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e == null || e.limits.maxConcurrent == 0) return 0.0;
            return (double) e.inFlight / e.limits.maxConcurrent;
        }
    }

    private CmpsblBackpressure() {}
}
`,

  'determinism-fingerprint': `${HEADER('Determinism Fingerprint')}
package com.cmpsbl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class CmpsblFingerprint {
    public static final class Divergence {
        public final String name, fingerprint, expectedHash, actualHash;
        public final long ts;
        public Divergence(String n, String f, String e, String a, long t) {
            name = n; fingerprint = f; expectedHash = e; actualHash = a; ts = t;
        }
    }

    private static final int TABLE_MAX = 512;
    private static final int DIVERGENCE_MAX = 256;

    private static final class Entry { String hash; long hits; long lastSeen; }

    private static final Object LOCK = new Object();
    private static final Map<String, Entry> TABLE = new HashMap<>();
    private static final List<Divergence> DIVERGENCES = new ArrayList<>();

    public static String fnv1a(String s) {
        int h = 0x811c9dc5;
        for (int i = 0; i < s.length(); i++) {
            h ^= s.charAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        return String.format("%08x", h & 0xffffffffL);
    }

    public static String fingerprint(String name, String argsCanonical, String version, String envHint) {
        return fnv1a(name + "|" + version + "|" + envHint + "|" + argsCanonical);
    }

    public static String hashOutput(String outputCanonical) { return fnv1a(outputCanonical); }

    public static boolean observe(String name, String fingerprint, String outputHash) {
        synchronized (LOCK) {
            long now = System.currentTimeMillis();
            Entry existing = TABLE.get(fingerprint);
            if (existing != null) {
                existing.hits++;
                existing.lastSeen = now;
                if (!existing.hash.equals(outputHash)) {
                    DIVERGENCES.add(new Divergence(name, fingerprint, existing.hash, outputHash, now));
                    if (DIVERGENCES.size() > DIVERGENCE_MAX) DIVERGENCES.remove(0);
                    return true;
                }
                return false;
            }
            if (TABLE.size() >= TABLE_MAX) {
                String oldestKey = null; long oldestTs = Long.MAX_VALUE;
                for (Map.Entry<String, Entry> en : TABLE.entrySet()) {
                    if (en.getValue().lastSeen < oldestTs) { oldestTs = en.getValue().lastSeen; oldestKey = en.getKey(); }
                }
                if (oldestKey != null) TABLE.remove(oldestKey);
            }
            Entry fresh = new Entry();
            fresh.hash = outputHash; fresh.hits = 1; fresh.lastSeen = now;
            TABLE.put(fingerprint, fresh);
            return false;
        }
    }

    public static int divergenceCount() { synchronized (LOCK) { return DIVERGENCES.size(); } }

    private CmpsblFingerprint() {}
}
`,

  'contract-versioning': `${HEADER('Contract Versioning')}
package com.cmpsbl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class CmpsblVersioning {
    public static final class Resolution {
        public final String name, requested, resolved, strategy;
        public Resolution(String n, String r, String res, String s) {
            name = n; requested = r; resolved = res; strategy = s;
        }
    }

    public static final class Migration {
        public final String name, fromVersion, toVersion;
        public final long ts;
        public Migration(String n, String f, String t, long ts_) {
            name = n; fromVersion = f; toVersion = t; ts = ts_;
        }
    }

    private static final int MIGRATION_LOG_MAX = 128;
    private static final Object LOCK = new Object();
    private static final Map<String, Set<String>> VERSIONS = new HashMap<>();
    private static final List<Migration> MIGRATIONS = new ArrayList<>();

    private static int[] parseVersion(String v) {
        String[] parts = v.trim().split("\\\\.");
        int[] out = new int[]{0, 0, 0};
        for (int i = 0; i < 3 && i < parts.length; i++) {
            StringBuilder digits = new StringBuilder();
            for (char c : parts[i].toCharArray()) {
                if (c < '0' || c > '9') break;
                digits.append(c);
            }
            try { out[i] = Integer.parseInt(digits.toString()); } catch (Exception ignore) {}
        }
        return out;
    }

    private static int compareTriple(int[] a, int[] b) {
        for (int i = 0; i < 3; i++) if (a[i] != b[i]) return a[i] - b[i];
        return 0;
    }

    public static void register(String name, String version) {
        synchronized (LOCK) {
            VERSIONS.computeIfAbsent(name, k -> new HashSet<>()).add(version);
        }
    }

    public static Resolution resolveVersion(String name, String requested) {
        synchronized (LOCK) {
            Set<String> set = VERSIONS.get(name);
            if (set == null || set.isEmpty()) return new Resolution(name, requested, "", "none");
            if (set.contains(requested)) return new Resolution(name, requested, requested, "exact");
            int[] target = parseVersion(requested);
            List<String> all = new ArrayList<>(set);
            all.sort(Comparator.comparing((String s) -> parseVersion(s), CmpsblVersioning::compareTriple).reversed());
            for (String v : all) {
                int[] p = parseVersion(v);
                if (p[0] == target[0] && p[1] == target[1])
                    return new Resolution(name, requested, v, "latest-minor");
            }
            for (String v : all) {
                int[] p = parseVersion(v);
                if (p[0] == target[0]) return new Resolution(name, requested, v, "latest-major");
            }
            return new Resolution(name, requested, all.get(0), "latest");
        }
    }

    public static void recordMigration(String name, String fromVersion, String toVersion) {
        synchronized (LOCK) {
            MIGRATIONS.add(new Migration(name, fromVersion, toVersion, System.currentTimeMillis()));
            if (MIGRATIONS.size() > MIGRATION_LOG_MAX) MIGRATIONS.remove(0);
        }
    }

    private CmpsblVersioning() {}
}
`,

  'saturation-metrics': `${HEADER('Saturation Metrics')}
package com.cmpsbl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class CmpsblSaturation {
    public static final class Quantiles {
        public final double p50, p95, p99, min, max;
        public final int count;
        public Quantiles(double p50_, double p95_, double p99_, int c, double mn, double mx) {
            p50 = p50_; p95 = p95_; p99 = p99_; count = c; min = mn; max = mx;
        }
    }

    public static final class ErrorBudget {
        public final long errors, total;
        public final double rate, budget;
        public final boolean breached;
        public ErrorBudget(long e, long t, double r, double b, boolean br) {
            errors = e; total = t; rate = r; budget = b; breached = br;
        }
    }

    private static final int RESERVOIR_MAX = 512;
    private static final double DEFAULT_BUDGET = 0.05;

    private static final class Entry {
        List<Double> samples = new ArrayList<>();
        long errors, total;
        double budget = DEFAULT_BUDGET;
        double min = Double.POSITIVE_INFINITY, max = Double.NEGATIVE_INFINITY;
    }

    private static final Object LOCK = new Object();
    private static final Map<String, Entry> ENTRIES = new HashMap<>();

    private static Entry ensure(String name) {
        return ENTRIES.computeIfAbsent(name, k -> new Entry());
    }

    public static void declare(String name, double errorBudget) {
        synchronized (LOCK) {
            Entry e = new Entry();
            e.budget = errorBudget;
            ENTRIES.put(name, e);
        }
    }

    public static void observe(String name, double latencyMs) {
        synchronized (LOCK) {
            Entry e = ensure(name);
            if (e.samples.size() >= RESERVOIR_MAX) e.samples.remove(0);
            e.samples.add(latencyMs);
            e.total++;
            if (latencyMs < e.min) e.min = latencyMs;
            if (latencyMs > e.max) e.max = latencyMs;
        }
    }

    public static void observeError(String name) {
        synchronized (LOCK) {
            Entry e = ensure(name);
            e.errors++; e.total++;
        }
    }

    public static Quantiles quantiles(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e == null || e.samples.isEmpty()) return new Quantiles(0, 0, 0, 0, 0, 0);
            List<Double> sorted = new ArrayList<>(e.samples);
            Collections.sort(sorted);
            int n = sorted.size();
            double p50 = sorted.get(Math.min(n - 1, (int)(0.50 * n)));
            double p95 = sorted.get(Math.min(n - 1, (int)(0.95 * n)));
            double p99 = sorted.get(Math.min(n - 1, (int)(0.99 * n)));
            double mn = Double.isInfinite(e.min) ? 0 : e.min;
            double mx = Double.isInfinite(e.max) ? 0 : e.max;
            return new Quantiles(p50, p95, p99, n, mn, mx);
        }
    }

    public static ErrorBudget errorBudget(String name) {
        synchronized (LOCK) {
            Entry e = ENTRIES.get(name);
            if (e == null || e.total == 0) return new ErrorBudget(0, 0, 0, DEFAULT_BUDGET, false);
            double rate = (double) e.errors / e.total;
            return new ErrorBudget(e.errors, e.total, rate, e.budget, rate > e.budget);
        }
    }

    private CmpsblSaturation() {}
}
`,
});
