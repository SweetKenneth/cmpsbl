/**
 * CMPSBL® Native Java — Tier 1 Kernel (Replay/Shadow/Effect)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const JAVA_KERNEL_REPLAY_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'replay-log': `${HEADER('Replay Log')}
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

public final class CmpsblReplayLog {
    public static final class Entry {
        public final long seq, ts, durationMs;
        public final String name, args, result;
        public final boolean ok;
        public Entry(long seq, long ts, String name, String args, String result, boolean ok, long durationMs) {
            this.seq = seq; this.ts = ts; this.name = name;
            this.args = args; this.result = result; this.ok = ok; this.durationMs = durationMs;
        }
    }

    private static final int RING_MAX = 2048;
    private static final Object LOCK = new Object();
    private static final ArrayDeque<Entry> ENTRIES = new ArrayDeque<>();
    private static final AtomicLong SEQ = new AtomicLong(0);
    private static volatile long sampleRate = 1;

    private CmpsblReplayLog() {}

    public static void setSampleRate(long n) { sampleRate = Math.max(1, n); }

    public static Entry record(String name, String args, String result, boolean ok, long durationMs) {
        long seq = SEQ.incrementAndGet();
        if (sampleRate > 1 && seq % sampleRate != 0) return null;
        Entry e = new Entry(seq, System.currentTimeMillis(), name, args, result, ok, durationMs);
        synchronized (LOCK) {
            ENTRIES.addLast(e);
            if (ENTRIES.size() > RING_MAX) ENTRIES.removeFirst();
        }
        return e;
    }

    public static List<Entry> entriesFor(String name) {
        List<Entry> out = new ArrayList<>();
        synchronized (LOCK) { for (Entry e : ENTRIES) if (e.name.equals(name)) out.add(e); }
        return out;
    }

    public static List<Entry> all() {
        synchronized (LOCK) { return new ArrayList<>(ENTRIES); }
    }

    public static int length() { synchronized (LOCK) { return ENTRIES.size(); } }

    public static void reset() {
        synchronized (LOCK) { ENTRIES.clear(); SEQ.set(0); sampleRate = 1; }
    }
}`,

  'shadow-execution': `${HEADER('Shadow Execution')}
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;

public final class CmpsblShadow {
    public static final class Divergence {
        public final String name, prodResult, shadowResult, reason;
        public final long ts, prodDurationMs, shadowDurationMs;
        public final boolean prodOk, shadowOk;
        public Divergence(String n, long ts, String pr, String sr, boolean pok, boolean sok,
                          long pdm, long sdm, String reason) {
            this.name = n; this.ts = ts; this.prodResult = pr; this.shadowResult = sr;
            this.prodOk = pok; this.shadowOk = sok; this.prodDurationMs = pdm;
            this.shadowDurationMs = sdm; this.reason = reason;
        }
    }

    public static final class Stats {
        public final AtomicLong runs = new AtomicLong();
        public final AtomicLong matches = new AtomicLong();
        public final AtomicLong divergences = new AtomicLong();
        public final AtomicLong shadowErrors = new AtomicLong();
    }

    private static final int DIV_MAX = 256;
    private static final ConcurrentHashMap<String, Function<String, String>> CANDIDATES = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, Stats> STATS = new ConcurrentHashMap<>();
    private static final Object DIV_LOCK = new Object();
    private static final ArrayDeque<Divergence> DIVERGENCES = new ArrayDeque<>();

    private CmpsblShadow() {}

    public static void register(String name, Function<String, String> candidate) {
        CANDIDATES.put(name, candidate);
        STATS.computeIfAbsent(name, k -> new Stats());
    }

    public static boolean unregister(String name) { return CANDIDATES.remove(name) != null; }

    public static String compare(String name, String args, String prodResult, boolean prodOk, long prodDurationMs) {
        Function<String, String> candidate = CANDIDATES.get(name);
        if (candidate == null) return prodResult;
        Stats stats = STATS.computeIfAbsent(name, k -> new Stats());
        stats.runs.incrementAndGet();
        long t0 = System.currentTimeMillis();
        String shadowResult = "";
        boolean shadowOk = true;
        String reason = "";
        try {
            shadowResult = candidate.apply(args);
        } catch (Throwable t) {
            shadowOk = false;
            reason = "shadow-throw:" + t.getMessage();
            stats.shadowErrors.incrementAndGet();
        }
        long shadowDurationMs = System.currentTimeMillis() - t0;
        if (shadowOk) {
            if (shadowResult.equals(prodResult) && shadowOk == prodOk) {
                stats.matches.incrementAndGet();
                return prodResult;
            }
            reason = "envelope-mismatch";
        }
        stats.divergences.incrementAndGet();
        Divergence d = new Divergence(name, System.currentTimeMillis(), prodResult, shadowResult,
                prodOk, shadowOk, prodDurationMs, shadowDurationMs, reason);
        synchronized (DIV_LOCK) {
            DIVERGENCES.addLast(d);
            if (DIVERGENCES.size() > DIV_MAX) DIVERGENCES.removeFirst();
        }
        return prodResult;
    }

    public static List<Divergence> divergencesFor(String name) {
        List<Divergence> out = new ArrayList<>();
        synchronized (DIV_LOCK) { for (Divergence d : DIVERGENCES) if (d.name.equals(name)) out.add(d); }
        return out;
    }

    public static List<Divergence> allDivergences() {
        synchronized (DIV_LOCK) { return new ArrayList<>(DIVERGENCES); }
    }

    public static Stats statsFor(String name) { return STATS.get(name); }
    public static Set<String> registered() { return CANDIDATES.keySet(); }

    public static void reset() {
        CANDIDATES.clear(); STATS.clear();
        synchronized (DIV_LOCK) { DIVERGENCES.clear(); }
    }
}`,

  'effect-tracker': `${HEADER('Effect Tracker')}
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public final class CmpsblEffects {
    public enum EffectClass {
        PURE(0), IO(1), NETWORK(2), MUTATION(3);
        public final int rank;
        EffectClass(int r) { this.rank = r; }
        public static EffectClass fromString(String s) {
            if (s == null) return null;
            switch (s.toLowerCase()) {
                case "pure": return PURE;
                case "io": return IO;
                case "network": return NETWORK;
                case "mutation": return MUTATION;
                default: return null;
            }
        }
    }

    public static final class Violation {
        public final String name, reason;
        public final EffectClass declared, observed;
        public final long ts;
        public Violation(String n, EffectClass d, EffectClass o, long ts, String r) {
            this.name = n; this.declared = d; this.observed = o; this.ts = ts; this.reason = r;
        }
    }

    private static final int VIOL_MAX = 256;
    private static final ConcurrentHashMap<String, EffectClass> DECLARED = new ConcurrentHashMap<>();
    private static final Object LOCK = new Object();
    private static final ArrayDeque<Violation> VIOLATIONS = new ArrayDeque<>();
    private static volatile boolean strict = false;

    private CmpsblEffects() {}

    public static void setStrict(boolean on) { strict = on; }

    public static void declare(String name, EffectClass effect) {
        if (effect == null) return;
        DECLARED.put(name, effect);
    }

    public static EffectClass declaredFor(String name) { return DECLARED.get(name); }

    public static boolean audit(String name, EffectClass observed) {
        EffectClass decl = DECLARED.get(name);
        if (decl == null) return true;
        boolean violated = false;
        String reason = "";
        if (strict) {
            if (observed != decl) { violated = true; reason = "strict-mismatch"; }
        } else if (observed != null && observed.rank > decl.rank) {
            violated = true; reason = "effect-escalation";
        }
        if (!violated) return true;
        Violation v = new Violation(name, decl, observed, System.currentTimeMillis(), reason);
        synchronized (LOCK) {
            VIOLATIONS.addLast(v);
            if (VIOLATIONS.size() > VIOL_MAX) VIOLATIONS.removeFirst();
        }
        return false;
    }

    public static List<Violation> violationsFor(String name) {
        List<Violation> out = new ArrayList<>();
        synchronized (LOCK) { for (Violation v : VIOLATIONS) if (v.name.equals(name)) out.add(v); }
        return out;
    }

    public static List<Violation> allViolations() {
        synchronized (LOCK) { return new ArrayList<>(VIOLATIONS); }
    }

    public static void reset() {
        DECLARED.clear(); strict = false;
        synchronized (LOCK) { VIOLATIONS.clear(); }
    }
}`,
});
