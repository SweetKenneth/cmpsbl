/**
 * CMPSBL® Native Go — Tier 1 Kernel Emitters (Receipts + Telemetry)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const GO_KERNEL_EMITTER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'receipt-emitter': `${HEADER('Receipt Emitter')}
import (
	"fmt"
	"sync"
	"time"
)

type CmpsblReceipt struct {
	Hash       string
	PrevHash   string
	Name       string
	ArgsHash   string
	ResultHash string
	DurationMs int64
	Code       string
	Ts         int64
	Seq        uint64
}

const cmpsblReceiptRingMax = 1024

var (
	cmpsblReceiptMu    sync.Mutex
	cmpsblReceiptChain []CmpsblReceipt
	cmpsblReceiptHead  string
	cmpsblReceiptSeq   uint64
)

func cmpsblFnv1a(s string) string {
	hash := uint32(0x811c9dc5)
	for i := 0; i < len(s); i++ {
		hash ^= uint32(s[i])
		hash *= 0x01000193
	}
	return fmt.Sprintf("%08x", hash)
}

func CmpsblReceiptsEmit(name, argsHash, resultHash string, durationMs int64, code string) CmpsblReceipt {
	cmpsblReceiptMu.Lock()
	defer cmpsblReceiptMu.Unlock()
	prev := cmpsblReceiptHead
	cmpsblReceiptSeq++
	seq := cmpsblReceiptSeq
	ts := time.Now().UnixMilli()
	prevField := "null"
	if prev != "" {
		prevField = "\\"" + prev + "\\""
	}
	payload := fmt.Sprintf("{\\"name\\":\\"%s\\",\\"argsHash\\":\\"%s\\",\\"resultHash\\":\\"%s\\",\\"durationMs\\":%d,\\"code\\":\\"%s\\",\\"prevHash\\":%s,\\"seq\\":%d}",
		name, argsHash, resultHash, durationMs, code, prevField, seq)
	hash := cmpsblFnv1a(payload)
	r := CmpsblReceipt{Hash: hash, PrevHash: prev, Name: name, ArgsHash: argsHash, ResultHash: resultHash, DurationMs: durationMs, Code: code, Ts: ts, Seq: seq}
	cmpsblReceiptChain = append(cmpsblReceiptChain, r)
	if len(cmpsblReceiptChain) > cmpsblReceiptRingMax {
		cmpsblReceiptChain = cmpsblReceiptChain[1:]
	}
	cmpsblReceiptHead = hash
	return r
}

func CmpsblReceiptsHead() string { cmpsblReceiptMu.Lock(); defer cmpsblReceiptMu.Unlock(); return cmpsblReceiptHead }
func CmpsblReceiptsLength() int  { cmpsblReceiptMu.Lock(); defer cmpsblReceiptMu.Unlock(); return len(cmpsblReceiptChain) }
func CmpsblReceiptsChain() []CmpsblReceipt {
	cmpsblReceiptMu.Lock()
	defer cmpsblReceiptMu.Unlock()
	out := make([]CmpsblReceipt, len(cmpsblReceiptChain))
	copy(out, cmpsblReceiptChain)
	return out
}

func CmpsblReceiptsVerify() bool {
	cmpsblReceiptMu.Lock()
	defer cmpsblReceiptMu.Unlock()
	for i := 1; i < len(cmpsblReceiptChain); i++ {
		if cmpsblReceiptChain[i].PrevHash != cmpsblReceiptChain[i-1].Hash {
			return false
		}
	}
	return true
}

func CmpsblReceiptsReset() {
	cmpsblReceiptMu.Lock()
	defer cmpsblReceiptMu.Unlock()
	cmpsblReceiptChain = nil
	cmpsblReceiptHead = ""
	cmpsblReceiptSeq = 0
}`,

  'telemetry-bus': `${HEADER('Telemetry Bus')}
import (
	"sync"
	"time"
)

type CmpsblTelemetryEvent struct {
	Event   string
	Payload interface{}
	Ts      int64
	Seq     uint64
}

type CmpsblTelemetryHandler func(CmpsblTelemetryEvent)

const (
	cmpsblTbMaxHandlers = 256
	cmpsblTbWildcard    = "*"
)

var (
	cmpsblTbMu       sync.RWMutex
	cmpsblTbHandlers = map[string][]CmpsblTelemetryHandler{}
	cmpsblTbSeq      uint64
)

func CmpsblTelemetryOn(event string, handler CmpsblTelemetryHandler) bool {
	cmpsblTbMu.Lock()
	defer cmpsblTbMu.Unlock()
	if len(cmpsblTbHandlers[event]) >= cmpsblTbMaxHandlers {
		return false
	}
	cmpsblTbHandlers[event] = append(cmpsblTbHandlers[event], handler)
	return true
}

func CmpsblTelemetryOff(event string) int {
	cmpsblTbMu.Lock()
	defer cmpsblTbMu.Unlock()
	n := len(cmpsblTbHandlers[event])
	delete(cmpsblTbHandlers, event)
	return n
}

func CmpsblEmit(event string, payload interface{}) int {
	cmpsblTbMu.Lock()
	cmpsblTbSeq++
	evt := CmpsblTelemetryEvent{Event: event, Payload: payload, Ts: time.Now().UnixMilli(), Seq: cmpsblTbSeq}
	direct := append([]CmpsblTelemetryHandler{}, cmpsblTbHandlers[event]...)
	wild := append([]CmpsblTelemetryHandler{}, cmpsblTbHandlers[cmpsblTbWildcard]...)
	cmpsblTbMu.Unlock()
	fired := 0
	for _, h := range direct {
		func() { defer func() { recover() }(); h(evt); fired++ }()
	}
	for _, h := range wild {
		func() { defer func() { recover() }(); h(evt); fired++ }()
	}
	return fired
}

func CmpsblTelemetryChannels() []string {
	cmpsblTbMu.RLock()
	defer cmpsblTbMu.RUnlock()
	out := make([]string, 0, len(cmpsblTbHandlers))
	for k := range cmpsblTbHandlers {
		out = append(out, k)
	}
	return out
}

func CmpsblTelemetrySubscriberCount(event string) int {
	cmpsblTbMu.RLock()
	defer cmpsblTbMu.RUnlock()
	return len(cmpsblTbHandlers[event])
}`,
});
