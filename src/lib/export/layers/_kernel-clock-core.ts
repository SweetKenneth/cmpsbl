/**
 * CMPSBL® Always-On Core — Kernel Clock & ID Source (Kernel Component #5)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Deterministic time and identifier source for the kernel.
 *
 * Why: every other kernel component currently calls `Date.now()` and ad-hoc
 * random sources directly. That makes traces, receipts, and audit chains
 * non-reproducible in tests and replays. Routing all of them through this
 * single source lets us pin the clock for replay/test mode.
 *
 * Modes (env CMPSBL_CLOCK_MODE):
 *   • "system" (default) — wall clock + cryptographic-ish UUIDv4
 *   • "fixed"            — frozen at CMPSBL_CLOCK_FIXED_MS (testing/replay)
 *   • "monotonic"        — start = boot, then strictly increments per call
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, falls back to
 * direct system time and Math.random — exports stay byte-compatible.
 *
 * Module: GOVERNANCE  ·  CJPI: 92  ·  Crown Jewel #45
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const CLOCK_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Clock & ID Source (sealed module, proprietary).           ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblClockMode = 'system' | 'fixed' | 'monotonic';

function _cmpsbl_kernel_enabled_clk(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

class CmpsblClock {
  private mode: CmpsblClockMode = 'system';
  private fixedMs = 0;
  private monoBase = 0;
  private monoStep = 0;
  private idCounter = 0;
  private enabled = true;

  constructor() {
    this.enabled = _cmpsbl_kernel_enabled_clk();
    const m = (typeof process !== 'undefined' && process.env?.CMPSBL_CLOCK_MODE) || 'system';
    this.mode = (m === 'fixed' || m === 'monotonic') ? m : 'system';
    if (this.mode === 'fixed') {
      const f = (typeof process !== 'undefined' && process.env?.CMPSBL_CLOCK_FIXED_MS) || '0';
      this.fixedMs = Math.max(0, parseInt(String(f), 10) || 0);
    }
    if (this.mode === 'monotonic') {
      this.monoBase = Date.now();
    }
  }

  now(): number {
    if (!this.enabled) return Date.now();
    if (this.mode === 'fixed') return this.fixedMs;
    if (this.mode === 'monotonic') {
      this.monoStep += 1;
      return this.monoBase + this.monoStep;
    }
    return Date.now();
  }

  // RFC 4122-ish v4 UUID. Deterministic in 'fixed' mode (counter-only).
  uuid(): string {
    if (!this.enabled || this.mode === 'system') {
      const rnd = (n: number) => Math.floor(Math.random() * n);
      const hex = (n: number, len: number) => n.toString(16).padStart(len, '0');
      return [
        hex(rnd(0x1_0000_0000), 8),
        hex(rnd(0x1_0000), 4),
        hex(0x4000 | rnd(0x1000), 4),
        hex(0x8000 | rnd(0x4000), 4),
        hex(rnd(0x1_0000), 4) + hex(rnd(0x1_0000_0000), 8),
      ].join('-');
    }
    // Deterministic counter-based ID for fixed/monotonic modes.
    this.idCounter += 1;
    const seed = this.idCounter.toString(16).padStart(12, '0');
    return \`00000000-0000-4000-8000-\${seed}\`;
  }

  getMode(): CmpsblClockMode { return this.mode; }
  setFixed(ms: number): void { if (this.mode === 'fixed') this.fixedMs = Math.max(0, ms); }
  reset(): void {
    this.idCounter = 0;
    this.monoStep = 0;
    if (this.mode === 'monotonic') this.monoBase = Date.now();
  }
}

const _cmpsbl_clock = new CmpsblClock();

function cmpsbl_clock(): CmpsblClock {
  return _cmpsbl_clock;
}
`;

const CLOCK_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Clock & ID Source (sealed module, proprietary).           ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import random


def _cmpsbl_kernel_enabled_clk() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


class CmpsblClock:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_clk()
        m = os.environ.get("CMPSBL_CLOCK_MODE", "system")
        self._mode = m if m in ("fixed", "monotonic") else "system"
        self._fixed_ms = 0
        self._mono_base = 0
        self._mono_step = 0
        self._id_counter = 0
        if self._mode == "fixed":
            try:
                self._fixed_ms = max(0, int(os.environ.get("CMPSBL_CLOCK_FIXED_MS", "0")))
            except ValueError:
                self._fixed_ms = 0
        if self._mode == "monotonic":
            self._mono_base = int(time.time() * 1000)

    def now(self) -> int:
        if not self._enabled:
            return int(time.time() * 1000)
        if self._mode == "fixed":
            return self._fixed_ms
        if self._mode == "monotonic":
            self._mono_step += 1
            return self._mono_base + self._mono_step
        return int(time.time() * 1000)

    def uuid(self) -> str:
        if not self._enabled or self._mode == "system":
            r = random
            def hex_(n: int, w: int) -> str: return format(n, "0" + str(w) + "x")
            return "-".join([
                hex_(r.randrange(0x1_0000_0000), 8),
                hex_(r.randrange(0x1_0000), 4),
                hex_(0x4000 | r.randrange(0x1000), 4),
                hex_(0x8000 | r.randrange(0x4000), 4),
                hex_(r.randrange(0x1_0000), 4) + hex_(r.randrange(0x1_0000_0000), 8),
            ])
        self._id_counter += 1
        seed = format(self._id_counter, "012x")
        return "00000000-0000-4000-8000-" + seed

    def get_mode(self) -> str:
        return self._mode

    def set_fixed(self, ms: int) -> None:
        if self._mode == "fixed":
            self._fixed_ms = max(0, ms)

    def reset(self) -> None:
        self._id_counter = 0
        self._mono_step = 0
        if self._mode == "monotonic":
            self._mono_base = int(time.time() * 1000)


_cmpsbl_clock = CmpsblClock()


def cmpsbl_clock() -> CmpsblClock:
    return _cmpsbl_clock
`;

const CLOCK_WIRE_TS = `
// Clock auto-wires by initialization. Other kernel components should call
// cmpsbl_clock().now() and cmpsbl_clock().uuid() instead of Date.now() / random.
if (_cmpsbl_kernel_enabled_clk()) {
  void cmpsbl_clock();
}`;

const CLOCK_WIRE_PY = `
# Clock auto-wires by initialization. Other kernel components should call
# cmpsbl_clock().now() and cmpsbl_clock().uuid() instead of time.time() / random.
if _cmpsbl_kernel_enabled_clk():
    _ = cmpsbl_clock()`;

const KERNEL_CLOCK_CORE: CmpsblLayerDefinition = {
  id: 'kernel-clock',
  name: 'Kernel Clock',
  crownJewelRank: 45,
  cjpi: 92,
  module: 'GOVERNANCE',
  description:
    'Deterministic time and identifier source for the kernel. Modes: system (default), fixed (replay/test), monotonic (strict increment). Routing all kernel components through this source enables reproducible traces, receipts, and audit chains. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: CLOCK_TS,
  pyCode: CLOCK_PY,
  autoWire: {
    wrapperName: 'cmpsbl_clock',
    behavior:
      'Initializes a single time/ID source at module load. Mode is selected via CMPSBL_CLOCK_MODE env. Other kernel components consult cmpsbl_clock() instead of system time directly.',
    tsWire: CLOCK_WIRE_TS,
    pyWire: CLOCK_WIRE_PY,
  },
};

export { KERNEL_CLOCK_CORE };
