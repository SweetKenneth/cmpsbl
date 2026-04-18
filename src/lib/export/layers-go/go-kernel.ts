/**
 * CMPSBL® Native Go — Tier 1 Kernel Bodies
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const GO_KERNEL_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'kernel-clock': `${HEADER('Kernel Clock')}
package cmpsblclock

import (
    "fmt"
    "sync"
    "time"
)

type ClockMode int

const (
    ModeSystem ClockMode = iota
    ModeFixed
    ModeMonotonic
)

var (
    cmpsblClockMu     sync.Mutex
    cmpsblClockMode   ClockMode = ModeSystem
    cmpsblClockFixed  int64
    cmpsblClockMono   int64
    cmpsblClockSeed   uint64 = 0x9E3779B97F4A7C15
)

func SetMode(m ClockMode) { cmpsblClockMu.Lock(); defer cmpsblClockMu.Unlock(); cmpsblClockMode = m }

func SetFixed(ms int64) {
    cmpsblClockMu.Lock(); defer cmpsblClockMu.Unlock()
    cmpsblClockMode = ModeFixed; cmpsblClockFixed = ms
}

func NowMs() int64 {
    cmpsblClockMu.Lock(); defer cmpsblClockMu.Unlock()
    switch cmpsblClockMode {
    case ModeFixed:
        return cmpsblClockFixed
    case ModeMonotonic:
        cmpsblClockMono++; return cmpsblClockMono
    default:
        return time.Now().UnixMilli()
    }
}

func UUID() string {
    cmpsblClockMu.Lock(); defer cmpsblClockMu.Unlock()
    cmpsblClockSeed = cmpsblClockSeed*6364136223846793005 + 1442695040888963407
    a := cmpsblClockSeed
    b := cmpsblClockSeed * 0x9E3779B97F4A7C15
    return fmt.Sprintf("%016x-%016x", a, b)
}`,

  'capability-registry': `${HEADER('Capability Registry')}
package cmpsblregistry

import (
    "fmt"
    "sort"
    "sync"
)

type Handler func(string) string

var (
    cmpsblRegMu       sync.RWMutex
    cmpsblRegHandlers = map[string]Handler{}
)

func Register(name string, h Handler) {
    cmpsblRegMu.Lock(); defer cmpsblRegMu.Unlock()
    cmpsblRegHandlers[name] = h
}

func Has(name string) bool {
    cmpsblRegMu.RLock(); defer cmpsblRegMu.RUnlock()
    _, ok := cmpsblRegHandlers[name]; return ok
}

func Dispatch(name, payload string) (string, error) {
    cmpsblRegMu.RLock()
    h, ok := cmpsblRegHandlers[name]
    cmpsblRegMu.RUnlock()
    if !ok {
        return "", fmt.Errorf("cmpsbl_registry: unknown capability '%s'", name)
    }
    return h(payload), nil
}

func List() []string {
    cmpsblRegMu.RLock(); defer cmpsblRegMu.RUnlock()
    out := make([]string, 0, len(cmpsblRegHandlers))
    for k := range cmpsblRegHandlers { out = append(out, k) }
    sort.Strings(out); return out
}

func Count() int {
    cmpsblRegMu.RLock(); defer cmpsblRegMu.RUnlock()
    return len(cmpsblRegHandlers)
}`,

  'kernel-bootstrap': `${HEADER('Kernel Bootstrap')}
package cmpsblboot

import (
    "sync"
    "time"
)

type BootStatus string

const (
    StatusCold     BootStatus = "cold"
    StatusBooting  BootStatus = "booting"
    StatusReady    BootStatus = "ready"
    StatusDegraded BootStatus = "degraded"
    StatusShutdown BootStatus = "shutdown"
)

type KernelHandle struct {
    Status     BootStatus
    StartedMs  int64
    Components []string
}

var (
    cmpsblBootMu     sync.Mutex
    cmpsblBootHandle = &KernelHandle{Status: StatusCold}
)

// Boot brings the kernel quintet up in canonical order.
func Boot() bool {
    cmpsblBootMu.Lock(); defer cmpsblBootMu.Unlock()
    if cmpsblBootHandle.Status == StatusReady { return true }
    cmpsblBootHandle.Status = StatusBooting
    cmpsblBootHandle.Components = []string{"clock", "state-store", "contract-validator", "quarantine", "isolated-executor"}
    cmpsblBootHandle.StartedMs = time.Now().UnixMilli()
    cmpsblBootHandle.Status = StatusReady
    return true
}

func Health() BootStatus {
    cmpsblBootMu.Lock(); defer cmpsblBootMu.Unlock()
    return cmpsblBootHandle.Status
}

func Shutdown() {
    cmpsblBootMu.Lock(); defer cmpsblBootMu.Unlock()
    cmpsblBootHandle.Status = StatusShutdown
    cmpsblBootHandle.Components = nil
}`,
});
