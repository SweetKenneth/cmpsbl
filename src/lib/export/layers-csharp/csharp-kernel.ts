/**
 * CMPSBL® Native C# — Tier 1 Kernel Bodies
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const CSHARP_KERNEL_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'kernel-clock': `${HEADER('Kernel Clock')}
using System;

public static class CmpsblClock {
    public enum Mode { System, Fixed, Monotonic }

    private static readonly object _lock = new object();
    private static Mode _mode = Mode.System;
    private static long _fixedMs = 0;
    private static long _monoMs = 0;
    private static ulong _seed = 0x9E3779B97F4A7C15UL;

    public static void SetMode(Mode m) { lock (_lock) { _mode = m; } }
    public static void SetFixed(long ms) { lock (_lock) { _mode = Mode.Fixed; _fixedMs = ms; } }

    public static long NowMs() {
        lock (_lock) {
            switch (_mode) {
                case Mode.Fixed: return _fixedMs;
                case Mode.Monotonic: _monoMs++; return _monoMs;
                default: return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            }
        }
    }

    public static string Uuid() {
        lock (_lock) {
            _seed = _seed * 6364136223846793005UL + 1442695040888963407UL;
            ulong a = _seed;
            ulong b = _seed * 0x9E3779B97F4A7C15UL;
            return $"{a:x16}-{b:x16}";
        }
    }
}`,

  'capability-registry': `${HEADER('Capability Registry')}
using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;

public static class CmpsblRegistry {
    private static readonly ConcurrentDictionary<string, Func<string, string>> _handlers = new();

    public static void Register(string name, Func<string, string> handler) {
        _handlers[name] = handler;
    }

    public static bool Has(string name) => _handlers.ContainsKey(name);

    public static string Dispatch(string name, string payload) {
        if (!_handlers.TryGetValue(name, out var h))
            throw new InvalidOperationException($"cmpsbl_registry: unknown capability '{name}'");
        return h(payload);
    }

    public static List<string> List() => _handlers.Keys.OrderBy(k => k).ToList();
    public static int Count() => _handlers.Count;
}`,

  'kernel-bootstrap': `${HEADER('Kernel Bootstrap')}
using System;
using System.Collections.Generic;

public static class CmpsblBoot {
    public enum Status { Cold, Booting, Ready, Degraded, Shutdown }

    public class KernelHandle {
        public Status Status = Status.Cold;
        public long StartedMs = 0;
        public List<string> Components = new();
    }

    private static readonly object _lock = new object();
    private static readonly KernelHandle _handle = new();

    public static bool Boot() {
        lock (_lock) {
            if (_handle.Status == Status.Ready) return true;
            _handle.Status = Status.Booting;
            _handle.Components = new List<string> { "clock", "state-store", "contract-validator", "quarantine", "isolated-executor" };
            _handle.StartedMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            _handle.Status = Status.Ready;
            return true;
        }
    }

    public static Status Health() { lock (_lock) { return _handle.Status; } }

    public static void Shutdown() {
        lock (_lock) {
            _handle.Status = Status.Shutdown;
            _handle.Components.Clear();
        }
    }
}`,
});
