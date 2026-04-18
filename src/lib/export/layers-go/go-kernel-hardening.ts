/**
 * CMPSBL® Native Go — Kernel Hardening (Components #15-#20)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const GO_KERNEL_HARDENING_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'circuit-breaker-recoverable': `${HEADER('Recoverable Circuit Breaker')}
package cmpsbl

import (
	"sync"
	"time"
)

type CmpsblBreakerState int

const (
	CmpsblBreakerClosed CmpsblBreakerState = iota
	CmpsblBreakerOpen
	CmpsblBreakerHalfOpen
)

type CmpsblBreakerConfig struct {
	FailureThreshold uint32
	CooldownMs       int64
	SuccessThreshold uint32
}

type CmpsblBreakerVerdict struct {
	Allowed bool
	State   CmpsblBreakerState
	Reason  string
}

type breakerEntry struct {
	config     CmpsblBreakerConfig
	state      CmpsblBreakerState
	failures   uint32
	successes  uint32
	openedAt   int64
	openCycles uint32
}

const breakerQuarantineCycles uint32 = 3

var (
	breakerMu sync.Mutex
	breakers  = make(map[string]*breakerEntry)
)

func nowMsCb() int64 { return time.Now().UnixMilli() }

func CmpsblBreakerDeclare(name string, config CmpsblBreakerConfig) {
	if config.FailureThreshold == 0 { config.FailureThreshold = 5 }
	if config.CooldownMs == 0 { config.CooldownMs = 30000 }
	if config.SuccessThreshold == 0 { config.SuccessThreshold = 1 }
	breakerMu.Lock(); defer breakerMu.Unlock()
	breakers[name] = &breakerEntry{config: config, state: CmpsblBreakerClosed}
}

func CmpsblBreakerBeforeCall(name string) CmpsblBreakerVerdict {
	breakerMu.Lock(); defer breakerMu.Unlock()
	e, ok := breakers[name]
	if !ok {
		return CmpsblBreakerVerdict{Allowed: true, State: CmpsblBreakerClosed}
	}
	if e.state == CmpsblBreakerOpen {
		if nowMsCb()-e.openedAt >= e.config.CooldownMs {
			e.state = CmpsblBreakerHalfOpen
			return CmpsblBreakerVerdict{Allowed: true, State: CmpsblBreakerHalfOpen}
		}
		return CmpsblBreakerVerdict{Allowed: false, State: CmpsblBreakerOpen, Reason: "breaker-open"}
	}
	return CmpsblBreakerVerdict{Allowed: true, State: e.state}
}

func CmpsblBreakerRecordSuccess(name string) {
	breakerMu.Lock(); defer breakerMu.Unlock()
	e, ok := breakers[name]
	if !ok { return }
	if e.state == CmpsblBreakerHalfOpen {
		e.successes++
		if e.successes >= e.config.SuccessThreshold {
			e.failures = 0; e.successes = 0
			e.state = CmpsblBreakerClosed
		}
	} else if e.state == CmpsblBreakerClosed {
		e.failures = 0
	}
}

func CmpsblBreakerRecordFailure(name string) {
	breakerMu.Lock(); defer breakerMu.Unlock()
	e, ok := breakers[name]
	if !ok { return }
	if e.state == CmpsblBreakerHalfOpen {
		e.successes = 0
		e.openedAt = nowMsCb()
		e.openCycles++
		e.state = CmpsblBreakerOpen
		return
	}
	e.failures++
	if e.state == CmpsblBreakerClosed && e.failures >= e.config.FailureThreshold {
		e.openedAt = nowMsCb()
		e.openCycles++
		e.state = CmpsblBreakerOpen
	}
}

func CmpsblBreakerShouldQuarantine(name string) bool {
	breakerMu.Lock(); defer breakerMu.Unlock()
	if e, ok := breakers[name]; ok { return e.openCycles >= breakerQuarantineCycles }
	return false
}
`,

  'causality-tracker': `${HEADER('Causality Tracker')}
package cmpsbl

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

type CmpsblSpan struct {
	TraceID      string
	SpanID       string
	ParentSpanID string
	Name         string
	StartTs      int64
	EndTs        int64
}

const causalityBufferMax = 1024

var (
	causalityMu sync.Mutex
	causalitySpans []CmpsblSpan
	causalityStack []CmpsblSpan
)

func nowMsCt() int64 { return time.Now().UnixMilli() }

func randIDCt() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func CmpsblCausalityBegin(name string) CmpsblSpan {
	causalityMu.Lock(); defer causalityMu.Unlock()
	var traceID, parentID string
	if len(causalityStack) > 0 {
		parent := causalityStack[len(causalityStack)-1]
		traceID = parent.TraceID
		parentID = parent.SpanID
	} else {
		traceID = randIDCt()
	}
	span := CmpsblSpan{
		TraceID: traceID, SpanID: randIDCt(), ParentSpanID: parentID,
		Name: name, StartTs: nowMsCt(),
	}
	causalityStack = append(causalityStack, span)
	causalitySpans = append(causalitySpans, span)
	if len(causalitySpans) > causalityBufferMax {
		causalitySpans = causalitySpans[1:]
	}
	return span
}

func CmpsblCausalityEnd(spanID string) {
	causalityMu.Lock(); defer causalityMu.Unlock()
	for i, s := range causalityStack {
		if s.SpanID == spanID {
			causalityStack[i].EndTs = nowMsCt()
			causalityStack = append(causalityStack[:i], causalityStack[i+1:]...)
			return
		}
	}
}

func CmpsblCausalityDepth() int {
	causalityMu.Lock(); defer causalityMu.Unlock()
	return len(causalityStack)
}

func CmpsblCausalityCount() int {
	causalityMu.Lock(); defer causalityMu.Unlock()
	return len(causalitySpans)
}
`,

  'backpressure-governor': `${HEADER('Backpressure Governor')}
package cmpsbl

import "sync"

type CmpsblBackpressureLimits struct {
	MaxConcurrent uint32
	MaxQueueDepth uint32
}

type CmpsblBackpressureVerdict struct {
	Admitted bool
	Reason   string
	InFlight uint32
	Queued   uint32
}

type bpEntry struct {
	limits        CmpsblBackpressureLimits
	inFlight      uint32
	queued        uint32
	totalAdmitted uint64
	totalShed     uint64
}

var (
	bpMu sync.Mutex
	bpEntries = make(map[string]*bpEntry)
)

func CmpsblBpDeclare(name string, limits CmpsblBackpressureLimits) {
	if limits.MaxConcurrent == 0 { limits.MaxConcurrent = 64 }
	if limits.MaxQueueDepth == 0 { limits.MaxQueueDepth = 128 }
	bpMu.Lock(); defer bpMu.Unlock()
	bpEntries[name] = &bpEntry{limits: limits}
}

func CmpsblBpAdmit(name string) CmpsblBackpressureVerdict {
	bpMu.Lock(); defer bpMu.Unlock()
	e, ok := bpEntries[name]
	if !ok {
		return CmpsblBackpressureVerdict{Admitted: true}
	}
	if e.inFlight >= e.limits.MaxConcurrent {
		reason := "concurrency-exceeded"
		if e.queued >= e.limits.MaxQueueDepth { reason = "queue-full" }
		e.totalShed++
		return CmpsblBackpressureVerdict{Admitted: false, Reason: reason, InFlight: e.inFlight, Queued: e.queued}
	}
	e.inFlight++
	e.totalAdmitted++
	return CmpsblBackpressureVerdict{Admitted: true, InFlight: e.inFlight, Queued: e.queued}
}

func CmpsblBpRelease(name string) {
	bpMu.Lock(); defer bpMu.Unlock()
	if e, ok := bpEntries[name]; ok && e.inFlight > 0 { e.inFlight-- }
}

func CmpsblBpSaturation(name string) float64 {
	bpMu.Lock(); defer bpMu.Unlock()
	e, ok := bpEntries[name]
	if !ok || e.limits.MaxConcurrent == 0 { return 0 }
	return float64(e.inFlight) / float64(e.limits.MaxConcurrent)
}
`,

  'determinism-fingerprint': `${HEADER('Determinism Fingerprint')}
package cmpsbl

import (
	"fmt"
	"sync"
	"time"
)

type CmpsblDivergence struct {
	Name         string
	Fingerprint  string
	ExpectedHash string
	ActualHash   string
	Ts           int64
}

const (
	fpTableMax       = 512
	fpDivergenceMax  = 256
)

type fpEntry struct {
	hash     string
	hits     uint64
	lastSeen int64
}

var (
	fpMu sync.Mutex
	fpTable = make(map[string]*fpEntry)
	fpDivergences []CmpsblDivergence
)

func nowMsDf() int64 { return time.Now().UnixMilli() }

func fnv1a(s string) string {
	var h uint32 = 0x811c9dc5
	for i := 0; i < len(s); i++ {
		h ^= uint32(s[i])
		h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
	}
	return fmt.Sprintf("%08x", h)
}

func CmpsblFpFingerprint(name, argsCanonical, version, envHint string) string {
	return fnv1a(name + "|" + version + "|" + envHint + "|" + argsCanonical)
}

func CmpsblFpHashOutput(outputCanonical string) string { return fnv1a(outputCanonical) }

func CmpsblFpObserve(name, fingerprint, outputHash string) bool {
	fpMu.Lock(); defer fpMu.Unlock()
	now := nowMsDf()
	if existing, ok := fpTable[fingerprint]; ok {
		existing.hits++
		existing.lastSeen = now
		if existing.hash != outputHash {
			fpDivergences = append(fpDivergences, CmpsblDivergence{
				Name: name, Fingerprint: fingerprint,
				ExpectedHash: existing.hash, ActualHash: outputHash, Ts: now,
			})
			if len(fpDivergences) > fpDivergenceMax {
				fpDivergences = fpDivergences[1:]
			}
			return true
		}
		return false
	}
	if len(fpTable) >= fpTableMax {
		var oldestKey string
		var oldestTs int64 = 1<<62
		for k, v := range fpTable {
			if v.lastSeen < oldestTs { oldestTs = v.lastSeen; oldestKey = k }
		}
		delete(fpTable, oldestKey)
	}
	fpTable[fingerprint] = &fpEntry{hash: outputHash, hits: 1, lastSeen: now}
	return false
}

func CmpsblFpDivergenceCount() int {
	fpMu.Lock(); defer fpMu.Unlock()
	return len(fpDivergences)
}
`,

  'contract-versioning': `${HEADER('Contract Versioning')}
package cmpsbl

import (
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

type CmpsblVersionResolution struct {
	Name      string
	Requested string
	Resolved  string
	Strategy  string
}

type CmpsblMigrationRecord struct {
	Name        string
	FromVersion string
	ToVersion   string
	Ts          int64
}

const cvMigrationLogMax = 128

var (
	cvMu sync.Mutex
	cvVersions = make(map[string]map[string]struct{})
	cvMigrations []CmpsblMigrationRecord
)

func nowMsCv() int64 { return time.Now().UnixMilli() }

func parseVersionTriple(v string) [3]int {
	parts := strings.Split(strings.TrimSpace(v), ".")
	out := [3]int{0, 0, 0}
	for i := 0; i < 3 && i < len(parts); i++ {
		digits := strings.Builder{}
		for _, c := range parts[i] {
			if c < '0' || c > '9' { break }
			digits.WriteRune(c)
		}
		if n, err := strconv.Atoi(digits.String()); err == nil { out[i] = n }
	}
	return out
}

func compareTriple(a, b [3]int) int {
	for i := 0; i < 3; i++ {
		if a[i] != b[i] { return a[i] - b[i] }
	}
	return 0
}

func CmpsblCvRegister(name, version string) {
	cvMu.Lock(); defer cvMu.Unlock()
	if _, ok := cvVersions[name]; !ok { cvVersions[name] = make(map[string]struct{}) }
	cvVersions[name][version] = struct{}{}
}

func CmpsblCvResolve(name, requested string) CmpsblVersionResolution {
	cvMu.Lock(); defer cvMu.Unlock()
	set, ok := cvVersions[name]
	if !ok || len(set) == 0 {
		return CmpsblVersionResolution{Name: name, Requested: requested, Strategy: "none"}
	}
	if _, exact := set[requested]; exact {
		return CmpsblVersionResolution{Name: name, Requested: requested, Resolved: requested, Strategy: "exact"}
	}
	target := parseVersionTriple(requested)
	type pv struct { v string; p [3]int }
	parsed := make([]pv, 0, len(set))
	for v := range set { parsed = append(parsed, pv{v, parseVersionTriple(v)}) }
	sort.Slice(parsed, func(i, j int) bool { return compareTriple(parsed[i].p, parsed[j].p) > 0 })
	for _, x := range parsed {
		if x.p[0] == target[0] && x.p[1] == target[1] {
			return CmpsblVersionResolution{Name: name, Requested: requested, Resolved: x.v, Strategy: "latest-minor"}
		}
	}
	for _, x := range parsed {
		if x.p[0] == target[0] {
			return CmpsblVersionResolution{Name: name, Requested: requested, Resolved: x.v, Strategy: "latest-major"}
		}
	}
	return CmpsblVersionResolution{Name: name, Requested: requested, Resolved: parsed[0].v, Strategy: "latest"}
}

func CmpsblCvRecordMigration(name, fromVersion, toVersion string) {
	cvMu.Lock(); defer cvMu.Unlock()
	cvMigrations = append(cvMigrations, CmpsblMigrationRecord{
		Name: name, FromVersion: fromVersion, ToVersion: toVersion, Ts: nowMsCv(),
	})
	if len(cvMigrations) > cvMigrationLogMax { cvMigrations = cvMigrations[1:] }
}
`,

  'saturation-metrics': `${HEADER('Saturation Metrics')}
package cmpsbl

import (
	"math"
	"sort"
	"sync"
)

type CmpsblQuantiles struct {
	P50, P95, P99 float64
	Count         int
	Min, Max      float64
}

type CmpsblErrorBudget struct {
	Errors, Total uint64
	Rate, Budget  float64
	Breached      bool
}

const (
	smReservoirMax  = 512
	smDefaultBudget = 0.05
)

type satEntry struct {
	samples  []float64
	errors   uint64
	total    uint64
	budget   float64
	min, max float64
}

var (
	satMu sync.Mutex
	satEntries = make(map[string]*satEntry)
)

func ensureSat(name string) *satEntry {
	e, ok := satEntries[name]
	if !ok {
		e = &satEntry{budget: smDefaultBudget, min: math.Inf(1), max: math.Inf(-1)}
		satEntries[name] = e
	}
	return e
}

func CmpsblSatDeclare(name string, errorBudget float64) {
	satMu.Lock(); defer satMu.Unlock()
	satEntries[name] = &satEntry{budget: errorBudget, min: math.Inf(1), max: math.Inf(-1)}
}

func CmpsblSatObserve(name string, latencyMs float64) {
	satMu.Lock(); defer satMu.Unlock()
	e := ensureSat(name)
	if len(e.samples) >= smReservoirMax { e.samples = e.samples[1:] }
	e.samples = append(e.samples, latencyMs)
	e.total++
	if latencyMs < e.min { e.min = latencyMs }
	if latencyMs > e.max { e.max = latencyMs }
}

func CmpsblSatObserveError(name string) {
	satMu.Lock(); defer satMu.Unlock()
	e := ensureSat(name)
	e.errors++; e.total++
}

func CmpsblSatQuantiles(name string) CmpsblQuantiles {
	satMu.Lock(); defer satMu.Unlock()
	e, ok := satEntries[name]
	if !ok || len(e.samples) == 0 {
		return CmpsblQuantiles{}
	}
	sorted := append([]float64(nil), e.samples...)
	sort.Float64s(sorted)
	n := len(sorted)
	q := func(p float64) float64 {
		idx := int(p * float64(n))
		if idx >= n { idx = n - 1 }
		return sorted[idx]
	}
	minVal := e.min; if math.IsInf(minVal, 0) { minVal = 0 }
	maxVal := e.max; if math.IsInf(maxVal, 0) { maxVal = 0 }
	return CmpsblQuantiles{P50: q(0.50), P95: q(0.95), P99: q(0.99), Count: n, Min: minVal, Max: maxVal}
}

func CmpsblSatErrorBudget(name string) CmpsblErrorBudget {
	satMu.Lock(); defer satMu.Unlock()
	e, ok := satEntries[name]
	if !ok || e.total == 0 {
		return CmpsblErrorBudget{Budget: smDefaultBudget}
	}
	rate := float64(e.errors) / float64(e.total)
	return CmpsblErrorBudget{Errors: e.errors, Total: e.total, Rate: rate, Budget: e.budget, Breached: rate > e.budget}
}
`,
});
