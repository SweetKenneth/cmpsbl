/**
 * CMPSBL® Native Go — Tier 1 Kernel (Replay/Shadow/Effect)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const GO_KERNEL_REPLAY_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'replay-log': `${HEADER('Replay Log')}
package cmpsbl

import (
	"sync"
	"time"
)

type CmpsblReplayEntry struct {
	Seq        uint64
	Ts         int64
	Name       string
	Args       string
	Result     string
	Ok         bool
	DurationMs int64
}

const replayRingMax = 2048

var (
	replayMu         sync.Mutex
	replayEntries    []CmpsblReplayEntry
	replaySeq        uint64
	replaySampleRate uint64 = 1
)

func CmpsblReplaySetSampleRate(n uint64) {
	replayMu.Lock()
	defer replayMu.Unlock()
	if n == 0 {
		replaySampleRate = 1
	} else {
		replaySampleRate = n
	}
}

func CmpsblReplayRecord(name, args, result string, ok bool, durationMs int64) *CmpsblReplayEntry {
	replayMu.Lock()
	defer replayMu.Unlock()
	replaySeq++
	seq := replaySeq
	if replaySampleRate > 1 && seq%replaySampleRate != 0 {
		return nil
	}
	e := CmpsblReplayEntry{
		Seq: seq, Ts: time.Now().UnixMilli(), Name: name,
		Args: args, Result: result, Ok: ok, DurationMs: durationMs,
	}
	replayEntries = append(replayEntries, e)
	if len(replayEntries) > replayRingMax {
		replayEntries = replayEntries[1:]
	}
	return &e
}

func CmpsblReplayEntriesFor(name string) []CmpsblReplayEntry {
	replayMu.Lock()
	defer replayMu.Unlock()
	out := make([]CmpsblReplayEntry, 0)
	for _, e := range replayEntries {
		if e.Name == name {
			out = append(out, e)
		}
	}
	return out
}

func CmpsblReplayAll() []CmpsblReplayEntry {
	replayMu.Lock()
	defer replayMu.Unlock()
	out := make([]CmpsblReplayEntry, len(replayEntries))
	copy(out, replayEntries)
	return out
}

func CmpsblReplayLength() int {
	replayMu.Lock()
	defer replayMu.Unlock()
	return len(replayEntries)
}

func CmpsblReplayReset() {
	replayMu.Lock()
	defer replayMu.Unlock()
	replayEntries = nil
	replaySeq = 0
}`,

  'shadow-execution': `${HEADER('Shadow Execution')}
package cmpsbl

import (
	"sync"
	"time"
)

type CmpsblShadowFn func(args string) (string, error)

type CmpsblShadowDivergence struct {
	Name             string
	Ts               int64
	ProdResult       string
	ShadowResult     string
	ProdOk           bool
	ShadowOk         bool
	ProdDurationMs   int64
	ShadowDurationMs int64
	Reason           string
}

type CmpsblShadowStats struct {
	Runs         uint64
	Matches      uint64
	Divergences  uint64
	ShadowErrors uint64
}

const shadowDivMax = 256

var (
	shadowMu          sync.Mutex
	shadowCandidates  = map[string]CmpsblShadowFn{}
	shadowDivergences []CmpsblShadowDivergence
	shadowStats       = map[string]*CmpsblShadowStats{}
)

func CmpsblShadowRegister(name string, fn CmpsblShadowFn) {
	shadowMu.Lock()
	defer shadowMu.Unlock()
	shadowCandidates[name] = fn
	if _, ok := shadowStats[name]; !ok {
		shadowStats[name] = &CmpsblShadowStats{}
	}
}

func CmpsblShadowUnregister(name string) bool {
	shadowMu.Lock()
	defer shadowMu.Unlock()
	if _, ok := shadowCandidates[name]; ok {
		delete(shadowCandidates, name)
		return true
	}
	return false
}

func CmpsblShadowCompare(name, args, prodResult string, prodOk bool, prodDurationMs int64) string {
	shadowMu.Lock()
	candidate, ok := shadowCandidates[name]
	if !ok {
		shadowMu.Unlock()
		return prodResult
	}
	stats := shadowStats[name]
	stats.Runs++
	shadowMu.Unlock()

	t0 := time.Now()
	shadowResult, err := candidate(args)
	shadowDurationMs := time.Since(t0).Milliseconds()
	shadowOk := err == nil
	reason := ""
	if !shadowOk {
		reason = "shadow-throw:" + err.Error()
	}

	shadowMu.Lock()
	defer shadowMu.Unlock()
	if shadowOk {
		if shadowResult == prodResult && shadowOk == prodOk {
			stats.Matches++
			return prodResult
		}
		reason = "envelope-mismatch"
	} else {
		stats.ShadowErrors++
	}
	stats.Divergences++
	div := CmpsblShadowDivergence{
		Name: name, Ts: time.Now().UnixMilli(),
		ProdResult: prodResult, ShadowResult: shadowResult,
		ProdOk: prodOk, ShadowOk: shadowOk,
		ProdDurationMs: prodDurationMs, ShadowDurationMs: shadowDurationMs,
		Reason: reason,
	}
	shadowDivergences = append(shadowDivergences, div)
	if len(shadowDivergences) > shadowDivMax {
		shadowDivergences = shadowDivergences[1:]
	}
	return prodResult
}

func CmpsblShadowDivergencesFor(name string) []CmpsblShadowDivergence {
	shadowMu.Lock()
	defer shadowMu.Unlock()
	out := make([]CmpsblShadowDivergence, 0)
	for _, d := range shadowDivergences {
		if d.Name == name {
			out = append(out, d)
		}
	}
	return out
}

func CmpsblShadowAllDivergences() []CmpsblShadowDivergence {
	shadowMu.Lock()
	defer shadowMu.Unlock()
	out := make([]CmpsblShadowDivergence, len(shadowDivergences))
	copy(out, shadowDivergences)
	return out
}

func CmpsblShadowStatsFor(name string) *CmpsblShadowStats {
	shadowMu.Lock()
	defer shadowMu.Unlock()
	s, ok := shadowStats[name]
	if !ok {
		return nil
	}
	cp := *s
	return &cp
}

func CmpsblShadowReset() {
	shadowMu.Lock()
	defer shadowMu.Unlock()
	shadowCandidates = map[string]CmpsblShadowFn{}
	shadowDivergences = nil
	shadowStats = map[string]*CmpsblShadowStats{}
}`,

  'effect-tracker': `${HEADER('Effect Tracker')}
package cmpsbl

import (
	"sync"
	"time"
)

type CmpsblEffectClass string

const (
	EffectPure     CmpsblEffectClass = "pure"
	EffectIo       CmpsblEffectClass = "io"
	EffectNetwork  CmpsblEffectClass = "network"
	EffectMutation CmpsblEffectClass = "mutation"
)

var effectRank = map[CmpsblEffectClass]int{
	EffectPure: 0, EffectIo: 1, EffectNetwork: 2, EffectMutation: 3,
}

type CmpsblEffectViolation struct {
	Name     string
	Declared CmpsblEffectClass
	Observed CmpsblEffectClass
	Ts       int64
	Reason   string
}

const effectViolMax = 256

var (
	effectMu         sync.Mutex
	effectDeclared   = map[string]CmpsblEffectClass{}
	effectViolations []CmpsblEffectViolation
	effectStrict     bool
)

func CmpsblEffectsSetStrict(on bool) {
	effectMu.Lock()
	defer effectMu.Unlock()
	effectStrict = on
}

func CmpsblEffectsDeclare(name string, effect CmpsblEffectClass) {
	if _, ok := effectRank[effect]; !ok {
		return
	}
	effectMu.Lock()
	defer effectMu.Unlock()
	effectDeclared[name] = effect
}

func CmpsblEffectsDeclaredFor(name string) (CmpsblEffectClass, bool) {
	effectMu.Lock()
	defer effectMu.Unlock()
	e, ok := effectDeclared[name]
	return e, ok
}

func CmpsblEffectsAudit(name string, observed CmpsblEffectClass) bool {
	effectMu.Lock()
	defer effectMu.Unlock()
	decl, ok := effectDeclared[name]
	if !ok {
		return true
	}
	dRank := effectRank[decl]
	oRank := effectRank[observed]
	violated := false
	reason := ""
	if effectStrict {
		if observed != decl {
			violated = true
			reason = "strict-mismatch"
		}
	} else if oRank > dRank {
		violated = true
		reason = "effect-escalation"
	}
	if !violated {
		return true
	}
	v := CmpsblEffectViolation{
		Name: name, Declared: decl, Observed: observed,
		Ts: time.Now().UnixMilli(), Reason: reason,
	}
	effectViolations = append(effectViolations, v)
	if len(effectViolations) > effectViolMax {
		effectViolations = effectViolations[1:]
	}
	return false
}

func CmpsblEffectsViolationsFor(name string) []CmpsblEffectViolation {
	effectMu.Lock()
	defer effectMu.Unlock()
	out := make([]CmpsblEffectViolation, 0)
	for _, v := range effectViolations {
		if v.Name == name {
			out = append(out, v)
		}
	}
	return out
}

func CmpsblEffectsAllViolations() []CmpsblEffectViolation {
	effectMu.Lock()
	defer effectMu.Unlock()
	out := make([]CmpsblEffectViolation, len(effectViolations))
	copy(out, effectViolations)
	return out
}

func CmpsblEffectsReset() {
	effectMu.Lock()
	defer effectMu.Unlock()
	effectDeclared = map[string]CmpsblEffectClass{}
	effectViolations = nil
	effectStrict = false
}`,
});
