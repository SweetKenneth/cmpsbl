/**
 * CMPSBL® Native Rust — Tier 1 Kernel Hardening (Components #15-#20)
 * Recoverable Circuit Breaker, Causality Tracker, Backpressure Governor,
 * Determinism Fingerprint, Contract Versioning, Saturation Metrics.
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const RS_KERNEL_HARDENING_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'circuit-breaker-recoverable': `${HEADER('Recoverable Circuit Breaker')}
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, PartialEq)]
pub enum CmpsblBreakerState { Closed, Open, HalfOpen }

#[derive(Debug, Clone)]
pub struct CmpsblBreakerConfig {
    pub failure_threshold: u32,
    pub cooldown_ms: u64,
    pub success_threshold: u32,
}
impl Default for CmpsblBreakerConfig {
    fn default() -> Self { Self { failure_threshold: 5, cooldown_ms: 30000, success_threshold: 1 } }
}

#[derive(Debug, Clone)]
pub struct CmpsblBreakerVerdict { pub allowed: bool, pub state: CmpsblBreakerState, pub reason: Option<String> }

struct BreakerEntry {
    config: CmpsblBreakerConfig,
    state: CmpsblBreakerState,
    failures: u32,
    successes: u32,
    opened_at: u64,
    open_cycles: u32,
}

const BREAKER_QUARANTINE_CYCLES: u32 = 3;

static BREAKER: Mutex<Option<HashMap<String, BreakerEntry>>> = Mutex::new(None);

fn now_ms_cb() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn with_breaker<R>(f: impl FnOnce(&mut HashMap<String, BreakerEntry>) -> R) -> R {
    let mut g = BREAKER.lock().unwrap();
    if g.is_none() { *g = Some(HashMap::new()); }
    f(g.as_mut().unwrap())
}

pub fn cmpsbl_breaker_declare(name: &str, config: CmpsblBreakerConfig) {
    with_breaker(|m| {
        m.insert(name.to_string(), BreakerEntry {
            config, state: CmpsblBreakerState::Closed,
            failures: 0, successes: 0, opened_at: 0, open_cycles: 0,
        });
    });
}

pub fn cmpsbl_breaker_before_call(name: &str) -> CmpsblBreakerVerdict {
    with_breaker(|m| {
        let e = match m.get_mut(name) {
            Some(e) => e,
            None => return CmpsblBreakerVerdict { allowed: true, state: CmpsblBreakerState::Closed, reason: None },
        };
        if e.state == CmpsblBreakerState::Open {
            if now_ms_cb() - e.opened_at >= e.config.cooldown_ms {
                e.state = CmpsblBreakerState::HalfOpen;
                return CmpsblBreakerVerdict { allowed: true, state: CmpsblBreakerState::HalfOpen, reason: None };
            }
            return CmpsblBreakerVerdict { allowed: false, state: CmpsblBreakerState::Open, reason: Some("breaker-open".into()) };
        }
        CmpsblBreakerVerdict { allowed: true, state: e.state.clone(), reason: None }
    })
}

pub fn cmpsbl_breaker_record_success(name: &str) {
    with_breaker(|m| {
        if let Some(e) = m.get_mut(name) {
            if e.state == CmpsblBreakerState::HalfOpen {
                e.successes += 1;
                if e.successes >= e.config.success_threshold {
                    e.failures = 0; e.successes = 0;
                    e.state = CmpsblBreakerState::Closed;
                }
            } else if e.state == CmpsblBreakerState::Closed {
                e.failures = 0;
            }
        }
    });
}

pub fn cmpsbl_breaker_record_failure(name: &str) {
    with_breaker(|m| {
        if let Some(e) = m.get_mut(name) {
            if e.state == CmpsblBreakerState::HalfOpen {
                e.successes = 0;
                e.opened_at = now_ms_cb();
                e.open_cycles += 1;
                e.state = CmpsblBreakerState::Open;
                return;
            }
            e.failures += 1;
            if e.state == CmpsblBreakerState::Closed && e.failures >= e.config.failure_threshold {
                e.opened_at = now_ms_cb();
                e.open_cycles += 1;
                e.state = CmpsblBreakerState::Open;
            }
        }
    });
}

pub fn cmpsbl_breaker_should_quarantine(name: &str) -> bool {
    with_breaker(|m| m.get(name).map(|e| e.open_cycles >= BREAKER_QUARANTINE_CYCLES).unwrap_or(false))
}
`,

  'causality-tracker': `${HEADER('Causality Tracker')}
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CmpsblSpan {
    pub trace_id: String,
    pub span_id: String,
    pub parent_span_id: Option<String>,
    pub name: String,
    pub start_ts: u64,
    pub end_ts: Option<u64>,
}

const CAUSALITY_BUFFER_MAX: usize = 1024;

struct CausalityState { spans: Vec<CmpsblSpan>, stack: Vec<CmpsblSpan> }

static CAUSALITY: Mutex<Option<CausalityState>> = Mutex::new(None);

fn now_ms_ct() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn rand_id_ct() -> String {
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or(0);
    let r = (nanos.wrapping_mul(2862933555777941757).wrapping_add(3037000493)) as u64;
    format!("{:016x}", r)
}

fn with_causality<R>(f: impl FnOnce(&mut CausalityState) -> R) -> R {
    let mut g = CAUSALITY.lock().unwrap();
    if g.is_none() { *g = Some(CausalityState { spans: Vec::new(), stack: Vec::new() }); }
    f(g.as_mut().unwrap())
}

pub fn cmpsbl_causality_begin(name: &str) -> CmpsblSpan {
    with_causality(|s| {
        let parent = s.stack.last().cloned();
        let span = CmpsblSpan {
            trace_id: parent.as_ref().map(|p| p.trace_id.clone()).unwrap_or_else(rand_id_ct),
            span_id: rand_id_ct(),
            parent_span_id: parent.as_ref().map(|p| p.span_id.clone()),
            name: name.to_string(),
            start_ts: now_ms_ct(),
            end_ts: None,
        };
        s.stack.push(span.clone());
        s.spans.push(span.clone());
        if s.spans.len() > CAUSALITY_BUFFER_MAX { s.spans.remove(0); }
        span
    })
}

pub fn cmpsbl_causality_end(span_id: &str) {
    with_causality(|s| {
        if let Some(idx) = s.stack.iter().position(|x| x.span_id == span_id) {
            s.stack[idx].end_ts = Some(now_ms_ct());
            s.stack.remove(idx);
        }
    });
}

pub fn cmpsbl_causality_depth() -> usize {
    with_causality(|s| s.stack.len())
}

pub fn cmpsbl_causality_count() -> usize {
    with_causality(|s| s.spans.len())
}
`,

  'backpressure-governor': `${HEADER('Backpressure Governor')}
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone)]
pub struct CmpsblBackpressureLimits { pub max_concurrent: u32, pub max_queue_depth: u32 }
impl Default for CmpsblBackpressureLimits {
    fn default() -> Self { Self { max_concurrent: 64, max_queue_depth: 128 } }
}

#[derive(Debug, Clone)]
pub struct CmpsblBackpressureVerdict {
    pub admitted: bool, pub reason: Option<String>, pub in_flight: u32, pub queued: u32,
}

struct BPEntry {
    limits: CmpsblBackpressureLimits,
    in_flight: u32, queued: u32,
    total_admitted: u64, total_shed: u64,
}

static BP: Mutex<Option<HashMap<String, BPEntry>>> = Mutex::new(None);

fn with_bp<R>(f: impl FnOnce(&mut HashMap<String, BPEntry>) -> R) -> R {
    let mut g = BP.lock().unwrap();
    if g.is_none() { *g = Some(HashMap::new()); }
    f(g.as_mut().unwrap())
}

pub fn cmpsbl_bp_declare(name: &str, limits: CmpsblBackpressureLimits) {
    with_bp(|m| { m.insert(name.to_string(), BPEntry {
        limits, in_flight: 0, queued: 0, total_admitted: 0, total_shed: 0,
    }); });
}

pub fn cmpsbl_bp_admit(name: &str) -> CmpsblBackpressureVerdict {
    with_bp(|m| {
        let e = match m.get_mut(name) {
            Some(e) => e,
            None => return CmpsblBackpressureVerdict { admitted: true, reason: None, in_flight: 0, queued: 0 },
        };
        if e.in_flight >= e.limits.max_concurrent {
            let reason = if e.queued >= e.limits.max_queue_depth { "queue-full" } else { "concurrency-exceeded" };
            e.total_shed += 1;
            return CmpsblBackpressureVerdict { admitted: false, reason: Some(reason.into()), in_flight: e.in_flight, queued: e.queued };
        }
        e.in_flight += 1;
        e.total_admitted += 1;
        CmpsblBackpressureVerdict { admitted: true, reason: None, in_flight: e.in_flight, queued: e.queued }
    })
}

pub fn cmpsbl_bp_release(name: &str) {
    with_bp(|m| { if let Some(e) = m.get_mut(name) { e.in_flight = e.in_flight.saturating_sub(1); } });
}

pub fn cmpsbl_bp_saturation(name: &str) -> f64 {
    with_bp(|m| m.get(name).map(|e| e.in_flight as f64 / e.limits.max_concurrent.max(1) as f64).unwrap_or(0.0))
}
`,

  'determinism-fingerprint': `${HEADER('Determinism Fingerprint')}
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CmpsblDivergence {
    pub name: String, pub fingerprint: String,
    pub expected_hash: String, pub actual_hash: String, pub ts: u64,
}

const FP_TABLE_MAX: usize = 512;
const FP_DIVERGENCE_MAX: usize = 256;

struct FPEntry { hash: String, hits: u64, last_seen: u64 }
struct FPState { table: HashMap<String, FPEntry>, divergences: Vec<CmpsblDivergence> }

static FP: Mutex<Option<FPState>> = Mutex::new(None);

fn now_ms_df() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn fnv1a(s: &str) -> String {
    let mut h: u32 = 0x811c9dc5;
    for b in s.bytes() {
        h ^= b as u32;
        h = h.wrapping_add((h << 1).wrapping_add(h << 4).wrapping_add(h << 7).wrapping_add(h << 8).wrapping_add(h << 24));
    }
    format!("{:08x}", h)
}

fn with_fp<R>(f: impl FnOnce(&mut FPState) -> R) -> R {
    let mut g = FP.lock().unwrap();
    if g.is_none() { *g = Some(FPState { table: HashMap::new(), divergences: Vec::new() }); }
    f(g.as_mut().unwrap())
}

pub fn cmpsbl_fp_fingerprint(name: &str, args_canonical: &str, version: &str, env_hint: &str) -> String {
    fnv1a(&format!("{}|{}|{}|{}", name, version, env_hint, args_canonical))
}

pub fn cmpsbl_fp_hash_output(output_canonical: &str) -> String {
    fnv1a(output_canonical)
}

pub fn cmpsbl_fp_observe(name: &str, fingerprint: &str, output_hash: &str) -> bool {
    with_fp(|s| {
        let now = now_ms_df();
        if let Some(existing) = s.table.get_mut(fingerprint) {
            existing.hits += 1;
            existing.last_seen = now;
            if existing.hash != output_hash {
                let d = CmpsblDivergence {
                    name: name.to_string(), fingerprint: fingerprint.to_string(),
                    expected_hash: existing.hash.clone(), actual_hash: output_hash.to_string(), ts: now,
                };
                s.divergences.push(d);
                if s.divergences.len() > FP_DIVERGENCE_MAX { s.divergences.remove(0); }
                return true;
            }
            return false;
        }
        if s.table.len() >= FP_TABLE_MAX {
            if let Some(oldest_k) = s.table.iter().min_by_key(|(_, v)| v.last_seen).map(|(k, _)| k.clone()) {
                s.table.remove(&oldest_k);
            }
        }
        s.table.insert(fingerprint.to_string(), FPEntry { hash: output_hash.to_string(), hits: 1, last_seen: now });
        false
    })
}

pub fn cmpsbl_fp_divergence_count() -> usize {
    with_fp(|s| s.divergences.len())
}
`,

  'contract-versioning': `${HEADER('Contract Versioning')}
use std::collections::{HashMap, HashSet};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CmpsblVersionResolution {
    pub name: String, pub requested: String,
    pub resolved: String, pub strategy: String,
}

#[derive(Debug, Clone)]
pub struct CmpsblMigrationRecord {
    pub name: String, pub from_version: String, pub to_version: String, pub ts: u64,
}

const CV_MIGRATION_LOG_MAX: usize = 128;

struct CVState {
    versions: HashMap<String, HashSet<String>>,
    migrations: Vec<CmpsblMigrationRecord>,
}

static CV: Mutex<Option<CVState>> = Mutex::new(None);

fn now_ms_cv() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn parse_version(v: &str) -> (u32, u32, u32) {
    let mut parts = v.trim().split('.').map(|p| p.chars().take_while(|c| c.is_ascii_digit()).collect::<String>().parse::<u32>().unwrap_or(0));
    (parts.next().unwrap_or(0), parts.next().unwrap_or(0), parts.next().unwrap_or(0))
}

fn with_cv<R>(f: impl FnOnce(&mut CVState) -> R) -> R {
    let mut g = CV.lock().unwrap();
    if g.is_none() { *g = Some(CVState { versions: HashMap::new(), migrations: Vec::new() }); }
    f(g.as_mut().unwrap())
}

pub fn cmpsbl_cv_register(name: &str, version: &str) {
    with_cv(|s| { s.versions.entry(name.to_string()).or_insert_with(HashSet::new).insert(version.to_string()); });
}

pub fn cmpsbl_cv_resolve(name: &str, requested: &str) -> CmpsblVersionResolution {
    with_cv(|s| {
        let set = match s.versions.get(name) {
            Some(set) if !set.is_empty() => set,
            _ => return CmpsblVersionResolution {
                name: name.into(), requested: requested.into(),
                resolved: String::new(), strategy: "none".into(),
            },
        };
        if set.contains(requested) {
            return CmpsblVersionResolution {
                name: name.into(), requested: requested.into(),
                resolved: requested.into(), strategy: "exact".into(),
            };
        }
        let target = parse_version(requested);
        let mut parsed: Vec<(String, (u32, u32, u32))> =
            set.iter().map(|v| (v.clone(), parse_version(v))).collect();
        parsed.sort_by(|a, b| b.1.cmp(&a.1));
        if let Some((v, _)) = parsed.iter().find(|(_, p)| p.0 == target.0 && p.1 == target.1) {
            return CmpsblVersionResolution {
                name: name.into(), requested: requested.into(),
                resolved: v.clone(), strategy: "latest-minor".into(),
            };
        }
        if let Some((v, _)) = parsed.iter().find(|(_, p)| p.0 == target.0) {
            return CmpsblVersionResolution {
                name: name.into(), requested: requested.into(),
                resolved: v.clone(), strategy: "latest-major".into(),
            };
        }
        CmpsblVersionResolution {
            name: name.into(), requested: requested.into(),
            resolved: parsed[0].0.clone(), strategy: "latest".into(),
        }
    })
}

pub fn cmpsbl_cv_record_migration(name: &str, from_version: &str, to_version: &str) {
    with_cv(|s| {
        s.migrations.push(CmpsblMigrationRecord {
            name: name.into(), from_version: from_version.into(),
            to_version: to_version.into(), ts: now_ms_cv(),
        });
        if s.migrations.len() > CV_MIGRATION_LOG_MAX { s.migrations.remove(0); }
    });
}
`,

  'saturation-metrics': `${HEADER('Saturation Metrics')}
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone)]
pub struct CmpsblQuantiles {
    pub p50: f64, pub p95: f64, pub p99: f64,
    pub count: usize, pub min: f64, pub max: f64,
}

#[derive(Debug, Clone)]
pub struct CmpsblErrorBudget {
    pub errors: u64, pub total: u64, pub rate: f64, pub budget: f64, pub breached: bool,
}

const SM_RESERVOIR_MAX: usize = 512;
const SM_DEFAULT_BUDGET: f64 = 0.05;

struct SatEntry {
    samples: Vec<f64>, errors: u64, total: u64,
    budget: f64, min: f64, max: f64,
}

static SAT: Mutex<Option<HashMap<String, SatEntry>>> = Mutex::new(None);

fn with_sat<R>(f: impl FnOnce(&mut HashMap<String, SatEntry>) -> R) -> R {
    let mut g = SAT.lock().unwrap();
    if g.is_none() { *g = Some(HashMap::new()); }
    f(g.as_mut().unwrap())
}

fn ensure_entry(m: &mut HashMap<String, SatEntry>, name: &str) -> &mut SatEntry {
    m.entry(name.to_string()).or_insert_with(|| SatEntry {
        samples: Vec::new(), errors: 0, total: 0,
        budget: SM_DEFAULT_BUDGET, min: f64::INFINITY, max: f64::NEG_INFINITY,
    })
}

pub fn cmpsbl_sat_declare(name: &str, error_budget: f64) {
    with_sat(|m| {
        m.insert(name.to_string(), SatEntry {
            samples: Vec::new(), errors: 0, total: 0,
            budget: error_budget, min: f64::INFINITY, max: f64::NEG_INFINITY,
        });
    });
}

pub fn cmpsbl_sat_observe(name: &str, latency_ms: f64) {
    with_sat(|m| {
        let e = ensure_entry(m, name);
        if e.samples.len() >= SM_RESERVOIR_MAX { e.samples.remove(0); }
        e.samples.push(latency_ms);
        e.total += 1;
        if latency_ms < e.min { e.min = latency_ms; }
        if latency_ms > e.max { e.max = latency_ms; }
    });
}

pub fn cmpsbl_sat_observe_error(name: &str) {
    with_sat(|m| { let e = ensure_entry(m, name); e.errors += 1; e.total += 1; });
}

pub fn cmpsbl_sat_quantiles(name: &str) -> CmpsblQuantiles {
    with_sat(|m| {
        let e = match m.get(name) { Some(e) if !e.samples.is_empty() => e, _ =>
            return CmpsblQuantiles { p50: 0.0, p95: 0.0, p99: 0.0, count: 0, min: 0.0, max: 0.0 } };
        let mut sorted: Vec<f64> = e.samples.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let n = sorted.len();
        let q = |p: f64| sorted[((p * n as f64) as usize).min(n - 1)];
        CmpsblQuantiles {
            p50: q(0.50), p95: q(0.95), p99: q(0.99),
            count: n,
            min: if e.min.is_infinite() { 0.0 } else { e.min },
            max: if e.max.is_infinite() { 0.0 } else { e.max },
        }
    })
}

pub fn cmpsbl_sat_error_budget(name: &str) -> CmpsblErrorBudget {
    with_sat(|m| {
        let e = match m.get(name) { Some(e) if e.total > 0 => e, _ =>
            return CmpsblErrorBudget { errors: 0, total: 0, rate: 0.0, budget: SM_DEFAULT_BUDGET, breached: false } };
        let rate = e.errors as f64 / e.total as f64;
        CmpsblErrorBudget { errors: e.errors, total: e.total, rate, budget: e.budget, breached: rate > e.budget }
    })
}
`,
});
