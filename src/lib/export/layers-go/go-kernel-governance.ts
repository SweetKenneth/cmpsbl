/**
 * CMPSBL® Native Go — Tier 1 Kernel (Resource Budget + Health Probe)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const GO_KERNEL_GOVERNANCE_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'resource-budget-gate': `${HEADER('Resource Budget Gate')}
import (
	"sync"
	"time"
)

type CmpsblBudget struct {
	MaxWallMs      int64
	MaxMemoryBytes int64
	MaxDepth       int32
}

type CmpsblBudgetVerdict struct {
	Allowed bool
	Reason  string
	Strikes int32
}

type CmpsblBudgetBreach struct {
	Name     string
	Kind     string
	Observed int64
	Limit    int64
	Ts       int64
}

const (
	cmpsblBudgetBreachMax       = 256
	cmpsblBudgetStrikeThreshold = 3
)

var (
	cmpsblBudgetMu       sync.Mutex
	cmpsblBudgetBudgets  = map[string]CmpsblBudget{}
	cmpsblBudgetDepth    = map[string]int32{}
	cmpsblBudgetStrikes  = map[string]int32{}
	cmpsblBudgetBreaches []CmpsblBudgetBreach
)

func CmpsblBudgetDeclare(name string, b CmpsblBudget) {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	cmpsblBudgetBudgets[name] = b
}

func cmpsblBudgetStrike(name, kind string, observed, limit int64) int32 {
	n := cmpsblBudgetStrikes[name] + 1
	cmpsblBudgetStrikes[name] = n
	cmpsblBudgetBreaches = append(cmpsblBudgetBreaches, CmpsblBudgetBreach{
		Name: name, Kind: kind, Observed: observed, Limit: limit, Ts: time.Now().UnixMilli(),
	})
	if len(cmpsblBudgetBreaches) > cmpsblBudgetBreachMax {
		cmpsblBudgetBreaches = cmpsblBudgetBreaches[1:]
	}
	return n
}

func CmpsblBudgetEnter(name string) CmpsblBudgetVerdict {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	cur := cmpsblBudgetDepth[name]
	if b, ok := cmpsblBudgetBudgets[name]; ok && b.MaxDepth > 0 && cur >= b.MaxDepth {
		n := cmpsblBudgetStrike(name, "depth", int64(cur+1), int64(b.MaxDepth))
		return CmpsblBudgetVerdict{Allowed: false, Reason: "depth-exceeded", Strikes: n}
	}
	cmpsblBudgetDepth[name] = cur + 1
	return CmpsblBudgetVerdict{Allowed: true, Reason: "", Strikes: cmpsblBudgetStrikes[name]}
}

func CmpsblBudgetExit(name string, wallMs int64, memBytes int64) CmpsblBudgetVerdict {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	cur := cmpsblBudgetDepth[name]
	if cur > 0 {
		cmpsblBudgetDepth[name] = cur - 1
	}
	b, ok := cmpsblBudgetBudgets[name]
	if !ok {
		return CmpsblBudgetVerdict{Allowed: true, Strikes: cmpsblBudgetStrikes[name]}
	}
	reason := ""
	if b.MaxWallMs > 0 && wallMs > b.MaxWallMs {
		cmpsblBudgetStrike(name, "wall-time", wallMs, b.MaxWallMs)
		reason = "wall-time-exceeded"
	}
	if memBytes > 0 && b.MaxMemoryBytes > 0 && memBytes > b.MaxMemoryBytes {
		cmpsblBudgetStrike(name, "memory", memBytes, b.MaxMemoryBytes)
		if reason != "" {
			reason = reason + "+memory-exceeded"
		} else {
			reason = "memory-exceeded"
		}
	}
	return CmpsblBudgetVerdict{Allowed: reason == "", Reason: reason, Strikes: cmpsblBudgetStrikes[name]}
}

func CmpsblBudgetShouldQuarantine(name string) bool {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	return cmpsblBudgetStrikes[name] >= cmpsblBudgetStrikeThreshold
}

func CmpsblBudgetStrikesFor(name string) int32 {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	return cmpsblBudgetStrikes[name]
}

func CmpsblBudgetClearStrikes(name string) {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	delete(cmpsblBudgetStrikes, name)
}

func CmpsblBudgetAllBreaches() []CmpsblBudgetBreach {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	out := make([]CmpsblBudgetBreach, len(cmpsblBudgetBreaches))
	copy(out, cmpsblBudgetBreaches)
	return out
}

func CmpsblBudgetReset() {
	cmpsblBudgetMu.Lock()
	defer cmpsblBudgetMu.Unlock()
	cmpsblBudgetBudgets = map[string]CmpsblBudget{}
	cmpsblBudgetDepth = map[string]int32{}
	cmpsblBudgetStrikes = map[string]int32{}
	cmpsblBudgetBreaches = nil
}`,

  'kernel-health-probe': `${HEADER('Kernel Health Probe')}
import (
	"sync"
	"time"
)

type CmpsblHealthReport struct {
	Quartet       string
	Store         string
	Contracts     int32
	Quarantined   int32
	Executions    int64
	Receipts      int64
	BudgetStrikes int32
	Ts            int64
}

var (
	cmpsblHealthMu          sync.RWMutex
	cmpsblHealthSurfaces    = map[string]bool{}
	cmpsblHealthCounters    = map[string]int64{}
)

func CmpsblHealthRegisterSurface(name string, present bool) {
	cmpsblHealthMu.Lock()
	defer cmpsblHealthMu.Unlock()
	cmpsblHealthSurfaces[name] = present
}

func CmpsblHealthSetCounter(name string, value int64) {
	cmpsblHealthMu.Lock()
	defer cmpsblHealthMu.Unlock()
	cmpsblHealthCounters[name] = value
}

func CmpsblHealth() CmpsblHealthReport {
	cmpsblHealthMu.RLock()
	defer cmpsblHealthMu.RUnlock()
	count := 0
	for _, k := range []string{"contracts", "quarantine", "executor", "budget"} {
		if cmpsblHealthSurfaces[k] {
			count++
		}
	}
	quartet := "down"
	if count == 4 {
		quartet = "ok"
	} else if count > 0 {
		quartet = "degraded"
	}
	store := "down"
	if cmpsblHealthSurfaces["store"] {
		store = "ok"
	}
	return CmpsblHealthReport{
		Quartet:       quartet,
		Store:         store,
		Contracts:     int32(cmpsblHealthCounters["contracts"]),
		Quarantined:   int32(cmpsblHealthCounters["quarantined"]),
		Executions:    cmpsblHealthCounters["executions"],
		Receipts:      cmpsblHealthCounters["receipts"],
		BudgetStrikes: int32(cmpsblHealthCounters["budget_strikes"]),
		Ts:            time.Now().UnixMilli(),
	}
}`,
});
