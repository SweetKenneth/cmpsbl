/**
 * CMPSBL® Native Java — Tier 1 Kernel Emitters (Receipts + Telemetry)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const JAVA_KERNEL_EMITTER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'receipt-emitter': `${HEADER('Receipt Emitter')}
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

public final class CmpsblReceipts {
    public static final class Receipt {
        public final String hash, prevHash, name, argsHash, resultHash, code;
        public final long durationMs, ts, seq;
        Receipt(String hash, String prevHash, String name, String argsHash, String resultHash, long durationMs, String code, long ts, long seq) {
            this.hash = hash; this.prevHash = prevHash; this.name = name;
            this.argsHash = argsHash; this.resultHash = resultHash;
            this.durationMs = durationMs; this.code = code; this.ts = ts; this.seq = seq;
        }
    }

    private static final int RING_MAX = 1024;
    private static final Object LOCK = new Object();
    private static final Deque<Receipt> CHAIN = new ArrayDeque<>();
    private static String head = null;
    private static final AtomicLong SEQ = new AtomicLong(0);

    private CmpsblReceipts() {}

    private static String fnv1a(String s) {
        int h = 0x811c9dc5;
        for (int i = 0; i < s.length(); i++) { h ^= s.charAt(i); h *= 0x01000193; }
        return String.format("%08x", h & 0xFFFFFFFFL);
    }

    public static Receipt emit(String name, String argsHash, String resultHash, long durationMs, String code) {
        synchronized (LOCK) {
            String prev = head;
            long seq = SEQ.incrementAndGet();
            long ts = System.currentTimeMillis();
            String prevField = prev == null ? "null" : "\\"" + prev + "\\"";
            String payload = String.format("{\\"name\\":\\"%s\\",\\"argsHash\\":\\"%s\\",\\"resultHash\\":\\"%s\\",\\"durationMs\\":%d,\\"code\\":\\"%s\\",\\"prevHash\\":%s,\\"seq\\":%d}",
                name, argsHash, resultHash, durationMs, code, prevField, seq);
            String hash = fnv1a(payload);
            Receipt r = new Receipt(hash, prev, name, argsHash, resultHash, durationMs, code, ts, seq);
            CHAIN.addLast(r);
            if (CHAIN.size() > RING_MAX) CHAIN.removeFirst();
            head = hash;
            return r;
        }
    }

    public static String head() { synchronized (LOCK) { return head; } }
    public static int length() { synchronized (LOCK) { return CHAIN.size(); } }
    public static List<Receipt> chain() { synchronized (LOCK) { return new ArrayList<>(CHAIN); } }

    public static boolean verify() {
        synchronized (LOCK) {
            Receipt prev = null;
            for (Receipt r : CHAIN) {
                if (prev != null && !Objects.equals(r.prevHash, prev.hash)) return false;
                prev = r;
            }
            return true;
        }
    }

    public static void reset() {
        synchronized (LOCK) { CHAIN.clear(); head = null; SEQ.set(0); }
    }
}`,

  'telemetry-bus': `${HEADER('Telemetry Bus')}
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

public final class CmpsblTelemetry {
    public static final class Event {
        public final String event;
        public final Object payload;
        public final long ts, seq;
        Event(String event, Object payload, long ts, long seq) {
            this.event = event; this.payload = payload; this.ts = ts; this.seq = seq;
        }
    }

    private static final int MAX_HANDLERS = 256;
    private static final String WILDCARD = "*";
    private static final ConcurrentMap<String, List<Consumer<Event>>> HANDLERS = new ConcurrentHashMap<>();
    private static final AtomicLong SEQ = new AtomicLong(0);

    private CmpsblTelemetry() {}

    public static boolean on(String event, Consumer<Event> handler) {
        if (handler == null) return false;
        List<Consumer<Event>> list = HANDLERS.computeIfAbsent(event, k -> new CopyOnWriteArrayList<>());
        if (list.size() >= MAX_HANDLERS) return false;
        list.add(handler);
        return true;
    }

    public static int off(String event) {
        List<Consumer<Event>> removed = HANDLERS.remove(event);
        return removed == null ? 0 : removed.size();
    }

    public static int emit(String event, Object payload) {
        Event evt = new Event(event, payload, System.currentTimeMillis(), SEQ.incrementAndGet());
        int fired = 0;
        for (String ch : new String[]{event, WILDCARD}) {
            List<Consumer<Event>> list = HANDLERS.get(ch);
            if (list == null) continue;
            for (Consumer<Event> h : list) {
                try { h.accept(evt); fired++; } catch (Throwable ignored) {}
            }
        }
        return fired;
    }

    public static Set<String> channels() { return new HashSet<>(HANDLERS.keySet()); }
    public static int subscriberCount(String event) {
        List<Consumer<Event>> list = HANDLERS.get(event);
        return list == null ? 0 : list.size();
    }
}`,
});
