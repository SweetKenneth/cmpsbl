/**
 * CMPSBL® Native Rust — Tier 1 Kernel Emitters (Receipts + Telemetry)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const RS_KERNEL_EMITTER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'receipt-emitter': `${HEADER('Receipt Emitter')}
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CmpsblReceipt {
    pub hash: String,
    pub prev_hash: Option<String>,
    pub name: String,
    pub args_hash: String,
    pub result_hash: String,
    pub duration_ms: u64,
    pub code: String,
    pub ts: u64,
    pub seq: u64,
}

const RECEIPT_RING_MAX: usize = 1024;

struct ReceiptState {
    chain: Vec<CmpsblReceipt>,
    head: Option<String>,
    seq: u64,
}

static RECEIPT_STATE: Mutex<ReceiptState> = Mutex::new(ReceiptState {
    chain: Vec::new(),
    head: None,
    seq: 0,
});

fn fnv1a(input: &str) -> String {
    let mut hash: u32 = 0x811c9dc5;
    for b in input.bytes() {
        hash ^= b as u32;
        hash = hash.wrapping_mul(0x01000193);
    }
    format!("{:08x}", hash)
}

pub enum CmpsblReceipts {}

impl CmpsblReceipts {
    pub fn emit(name: &str, args_hash: &str, result_hash: &str, duration_ms: u64, code: &str) -> CmpsblReceipt {
        let mut s = RECEIPT_STATE.lock().unwrap();
        let prev = s.head.clone();
        s.seq += 1;
        let seq = s.seq;
        let ts = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64;
        let payload = format!(
            "{{\\"name\\":\\"{}\\",\\"argsHash\\":\\"{}\\",\\"resultHash\\":\\"{}\\",\\"durationMs\\":{},\\"code\\":\\"{}\\",\\"prevHash\\":{},\\"seq\\":{}}}",
            name, args_hash, result_hash, duration_ms, code,
            prev.as_ref().map(|p| format!("\\"{}\\"", p)).unwrap_or_else(|| "null".into()),
            seq
        );
        let hash = fnv1a(&payload);
        let r = CmpsblReceipt {
            hash: hash.clone(),
            prev_hash: prev,
            name: name.to_string(),
            args_hash: args_hash.to_string(),
            result_hash: result_hash.to_string(),
            duration_ms,
            code: code.to_string(),
            ts,
            seq,
        };
        s.chain.push(r.clone());
        if s.chain.len() > RECEIPT_RING_MAX { s.chain.remove(0); }
        s.head = Some(hash);
        r
    }

    pub fn head() -> Option<String> { RECEIPT_STATE.lock().unwrap().head.clone() }
    pub fn length() -> usize { RECEIPT_STATE.lock().unwrap().chain.len() }
    pub fn chain() -> Vec<CmpsblReceipt> { RECEIPT_STATE.lock().unwrap().chain.clone() }

    pub fn verify() -> bool {
        let s = RECEIPT_STATE.lock().unwrap();
        for i in 1..s.chain.len() {
            if s.chain[i].prev_hash.as_deref() != Some(&s.chain[i-1].hash) { return false; }
        }
        true
    }

    pub fn reset() {
        let mut s = RECEIPT_STATE.lock().unwrap();
        s.chain.clear();
        s.head = None;
        s.seq = 0;
    }
}`,

  'telemetry-bus': `${HEADER('Telemetry Bus')}
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CmpsblTelemetryEvent {
    pub event: String,
    pub payload: String,
    pub ts: u64,
    pub seq: u64,
}

pub type CmpsblTelemetryHandler = Box<dyn Fn(&CmpsblTelemetryEvent) + Send + Sync>;

const TB_MAX_HANDLERS: usize = 256;
const TB_WILDCARD: &str = "*";

struct TelemetryState {
    handlers: HashMap<String, Vec<CmpsblTelemetryHandler>>,
    seq: u64,
}

static TELEMETRY_STATE: Mutex<TelemetryState> = Mutex::new(TelemetryState {
    handlers: HashMap::new(),
    seq: 0,
});

pub enum CmpsblTelemetry {}

impl CmpsblTelemetry {
    pub fn on(event: &str, handler: CmpsblTelemetryHandler) -> bool {
        let mut s = TELEMETRY_STATE.lock().unwrap();
        let list = s.handlers.entry(event.to_string()).or_insert_with(Vec::new);
        if list.len() >= TB_MAX_HANDLERS { return false; }
        list.push(handler);
        true
    }

    pub fn off(event: &str) -> usize {
        let mut s = TELEMETRY_STATE.lock().unwrap();
        s.handlers.remove(event).map(|v| v.len()).unwrap_or(0)
    }

    pub fn emit(event: &str, payload: &str) -> usize {
        let ts = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64;
        let mut s = TELEMETRY_STATE.lock().unwrap();
        s.seq += 1;
        let evt = CmpsblTelemetryEvent {
            event: event.to_string(),
            payload: payload.to_string(),
            ts,
            seq: s.seq,
        };
        let mut fired = 0;
        for ch in &[event, TB_WILDCARD] {
            if let Some(list) = s.handlers.get(*ch) {
                for h in list { h(&evt); fired += 1; }
            }
        }
        fired
    }

    pub fn channels() -> Vec<String> {
        TELEMETRY_STATE.lock().unwrap().handlers.keys().cloned().collect()
    }

    pub fn subscriber_count(event: &str) -> usize {
        TELEMETRY_STATE.lock().unwrap().handlers.get(event).map(|v| v.len()).unwrap_or(0)
    }
}

pub fn cmpsbl_emit(event: &str, payload: &str) -> usize {
    CmpsblTelemetry::emit(event, payload)
}`,
});
