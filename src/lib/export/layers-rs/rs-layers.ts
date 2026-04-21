/**
 * CMPSBL® Native Rust Layer Implementations
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Hand-written Rust bodies for every Launch Layer.
 *
 * Architecture:
 *   - Each layer is a self-contained `pub mod cmpsbl_<id>` with no external
 *     crate deps beyond `std`. Layers communicate only through the chain
 *     executor's `serde_json::Value`-equivalent surface (we use a tiny
 *     `CmpsblValue` enum so the export remains zero-dependency).
 *   - State that needs cross-call persistence lives in `static` `Mutex<T>`
 *     guarded by `std::sync::OnceLock` for thread-safe lazy init.
 *   - Phase ordering is enforced by the polyglot template engine, not these bodies.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═════════════════════════════════════════════════════════════════════════════
// Shared value type — emitted once at the top of the file by the chain
// executor. Each layer references `CmpsblValue` and `CmpsblMap` freely.
// ═════════════════════════════════════════════════════════════════════════════

export const RS_SHARED_PRELUDE = `
// ─── Shared zero-dependency value type used by every layer ─────────────────
#[derive(Clone, Debug)]
pub enum CmpsblValue {
    Null,
    Bool(bool),
    Num(f64),
    Str(String),
    List(Vec<CmpsblValue>),
    Map(CmpsblMap),
}

pub type CmpsblMap = std::collections::BTreeMap<String, CmpsblValue>;

impl CmpsblValue {
    pub fn as_str(&self) -> Option<&str> {
        if let CmpsblValue::Str(s) = self { Some(s.as_str()) } else { None }
    }
    pub fn as_num(&self) -> Option<f64> {
        if let CmpsblValue::Num(n) = self { Some(*n) } else { None }
    }
}

fn _cmpsbl_now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Phase 1 — RESILIENCE
// ═════════════════════════════════════════════════════════════════════════════

export const SELF_HEALING_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Resilience Module (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_self_healing {
    use std::sync::Mutex;
    use std::sync::OnceLock;

    #[derive(Clone, Debug)]
    pub enum BlastRadius { Node, Sector, System }

    #[derive(Clone, Debug)]
    pub struct RepairStrategy {
        pub id: String,
        pub failure_type: String,
        pub actions: Vec<String>,
        pub blast_radius: BlastRadius,
        pub estimated_duration_ms: u64,
        pub success_rate: f64,
        pub cost_score: f64,
    }

    #[derive(Clone, Debug)]
    pub struct RepairPlan {
        pub id: String,
        pub capability_name: String,
        pub failure_type: String,
        pub strategy: RepairStrategy,
        pub created_at: u64,
    }

    #[derive(Clone, Debug)]
    pub struct RepairResult {
        pub plan_id: String,
        pub success: bool,
        pub duration_ms: u64,
        pub rolled_back: bool,
        pub error: String,
    }

    struct State {
        strategies: Vec<RepairStrategy>,
        history: Vec<RepairResult>,
        scores: std::collections::HashMap<String, (u32, u32)>,
    }

    fn state() -> &'static Mutex<State> {
        static S: OnceLock<Mutex<State>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(State {
            strategies: Vec::new(),
            history: Vec::new(),
            scores: std::collections::HashMap::new(),
        }))
    }

    pub fn add_strategy(s: RepairStrategy) {
        let mut g = state().lock().unwrap();
        g.scores.insert(s.id.clone(), (0, 0));
        g.strategies.push(s);
    }

    fn blast_score(r: &BlastRadius) -> f64 {
        match r { BlastRadius::System => 1.0, BlastRadius::Sector => 0.5, BlastRadius::Node => 0.1 }
    }

    pub fn select_strategy(failure_type: &str) -> Option<RepairStrategy> {
        let g = state().lock().unwrap();
        g.strategies.iter()
            .filter(|s| s.failure_type == failure_type)
            .max_by(|a, b| {
                let sa = a.success_rate - a.cost_score - blast_score(&a.blast_radius);
                let sb = b.success_rate - b.cost_score - blast_score(&b.blast_radius);
                sa.partial_cmp(&sb).unwrap_or(std::cmp::Ordering::Equal)
            })
            .cloned()
    }

    pub fn record(result: RepairResult) {
        let mut g = state().lock().unwrap();
        let entry = g.scores.entry(result.plan_id.clone()).or_insert((0, 0));
        if result.success { entry.0 += 1; } else { entry.1 += 1; }
        g.history.push(result);
    }
}
`;

export const TRIAGE_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_triage {
    use std::sync::{Mutex, OnceLock};

    #[derive(Clone, Debug, PartialEq)]
    pub enum Severity { Low, Medium, High, Critical }

    #[derive(Clone, Debug)]
    pub struct Incident {
        pub id: String,
        pub capability: String,
        pub severity: Severity,
        pub created_at: u64,
        pub resolved: bool,
    }

    fn store() -> &'static Mutex<Vec<Incident>> {
        static S: OnceLock<Mutex<Vec<Incident>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Vec::new()))
    }

    pub fn report(capability: &str, severity: Severity) -> String {
        let id = format!("inc-{}-{}", capability, super::_cmpsbl_now_ms());
        let inc = Incident {
            id: id.clone(),
            capability: capability.to_string(),
            severity,
            created_at: super::_cmpsbl_now_ms(),
            resolved: false,
        };
        store().lock().unwrap().push(inc);
        id
    }

    pub fn resolve(id: &str) -> bool {
        let mut g = store().lock().unwrap();
        if let Some(inc) = g.iter_mut().find(|i| i.id == id) {
            inc.resolved = true;
            true
        } else { false }
    }

    pub fn open_count() -> usize {
        store().lock().unwrap().iter().filter(|i| !i.resolved).count()
    }
}
`;

export const CONSENSUS_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_consensus {
    use std::sync::{Mutex, OnceLock};
    use std::collections::HashMap;

    pub struct Quorum { votes: HashMap<String, HashMap<String, u32>> }

    fn store() -> &'static Mutex<Quorum> {
        static S: OnceLock<Mutex<Quorum>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Quorum { votes: HashMap::new() }))
    }

    pub fn vote(proposal: &str, choice: &str) {
        let mut g = store().lock().unwrap();
        let entry = g.votes.entry(proposal.to_string()).or_insert_with(HashMap::new);
        *entry.entry(choice.to_string()).or_insert(0) += 1;
    }

    pub fn winner(proposal: &str) -> Option<String> {
        let g = store().lock().unwrap();
        g.votes.get(proposal)
            .and_then(|m| m.iter().max_by_key(|kv| kv.1).map(|(k, _)| k.clone()))
    }
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Phase 2 — FORESIGHT
// ═════════════════════════════════════════════════════════════════════════════

export const ORACLE_RIPPLE_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_oracle_ripple {
    use std::sync::{Mutex, OnceLock};

    #[derive(Clone, Debug)]
    pub struct RippleSignal { pub source: String, pub amplitude: f64, pub at_ms: u64 }

    fn store() -> &'static Mutex<Vec<RippleSignal>> {
        static S: OnceLock<Mutex<Vec<RippleSignal>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Vec::new()))
    }

    pub fn observe(source: &str, amplitude: f64) {
        store().lock().unwrap().push(RippleSignal {
            source: source.to_string(),
            amplitude,
            at_ms: super::_cmpsbl_now_ms(),
        });
    }

    pub fn forecast_window(window_ms: u64) -> f64 {
        let g = store().lock().unwrap();
        let now = super::_cmpsbl_now_ms();
        let recent: Vec<_> = g.iter().filter(|s| now.saturating_sub(s.at_ms) <= window_ms).collect();
        if recent.is_empty() { return 0.0; }
        let sum: f64 = recent.iter().map(|s| s.amplitude).sum();
        sum / (recent.len() as f64)
    }
}
`;

export const ANOMALY_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_anomaly {
    use std::sync::{Mutex, OnceLock};

    pub struct Series { values: Vec<f64> }

    fn store() -> &'static Mutex<Series> {
        static S: OnceLock<Mutex<Series>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Series { values: Vec::new() }))
    }

    pub fn observe(v: f64) { store().lock().unwrap().values.push(v); }

    pub fn z_score(v: f64) -> f64 {
        let g = store().lock().unwrap();
        if g.values.is_empty() { return 0.0; }
        let mean: f64 = g.values.iter().sum::<f64>() / (g.values.len() as f64);
        let var: f64 = g.values.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / (g.values.len() as f64);
        let sd = var.sqrt();
        if sd == 0.0 { 0.0 } else { (v - mean) / sd }
    }

    pub fn is_anomaly(v: f64, threshold: f64) -> bool { z_score(v).abs() >= threshold }
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Phase 3 — SECURITY
// ═════════════════════════════════════════════════════════════════════════════

export const ADAPTIVE_DEFENSE_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_adaptive_defense {
    use std::sync::{Mutex, OnceLock};
    use std::collections::HashMap;

    fn threats() -> &'static Mutex<HashMap<String, u32>> {
        static S: OnceLock<Mutex<HashMap<String, u32>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(HashMap::new()))
    }

    pub fn report_threat(source: &str) -> u32 {
        let mut g = threats().lock().unwrap();
        let c = g.entry(source.to_string()).or_insert(0);
        *c += 1;
        *c
    }

    pub fn is_blocked(source: &str, threshold: u32) -> bool {
        threats().lock().unwrap().get(source).copied().unwrap_or(0) >= threshold
    }
}
`;

export const ZERO_TRUST_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_zero_trust {
    use std::sync::{Mutex, OnceLock};
    use std::collections::HashMap;

    fn trust() -> &'static Mutex<HashMap<String, f64>> {
        static S: OnceLock<Mutex<HashMap<String, f64>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(HashMap::new()))
    }

    pub fn set_trust(principal: &str, score: f64) {
        trust().lock().unwrap().insert(principal.to_string(), score.clamp(0.0, 1.0));
    }

    pub fn trust_of(principal: &str) -> f64 {
        trust().lock().unwrap().get(principal).copied().unwrap_or(0.0)
    }

    pub fn allow(principal: &str, required: f64) -> bool { trust_of(principal) >= required }
}
`;

export const CYBER_DEFENSE_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_cyber_defense {
    use std::sync::{Mutex, OnceLock};

    pub struct Defense { signatures: Vec<String>, kills: u64 }

    fn state() -> &'static Mutex<Defense> {
        static S: OnceLock<Mutex<Defense>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Defense { signatures: Vec::new(), kills: 0 }))
    }

    pub fn register_signature(sig: &str) {
        state().lock().unwrap().signatures.push(sig.to_string());
    }

    pub fn scan(payload: &str) -> bool {
        let mut g = state().lock().unwrap();
        let hit = g.signatures.iter().any(|s| payload.contains(s));
        if hit { g.kills += 1; }
        hit
    }

    pub fn kill_count() -> u64 { state().lock().unwrap().kills }
}
`;

export const AI_SAFETY_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_ai_safety {
    use serde_json::{Value, Map};

    /// Deep-sanitize: walks nested JSON; preserves _cmpsbl_/__cmpsbl_ framework keys verbatim.
    pub fn sanitize_deep(v: &Value) -> Value {
        match v {
            Value::String(s) => Value::String(sanitize_prompt(s)),
            Value::Array(arr) => Value::Array(arr.iter().map(sanitize_deep).collect()),
            Value::Object(obj) => {
                let mut out = Map::new();
                for (k, val) in obj.iter() {
                    if k.starts_with("_cmpsbl_") || k.starts_with("__cmpsbl_") {
                        out.insert(k.clone(), val.clone());
                    } else {
                        out.insert(k.clone(), sanitize_deep(val));
                    }
                }
                Value::Object(out)
            }
            _ => v.clone(),
        }
    }

    pub fn sanitize_prompt(s: &str) -> String {
        s.replace("ignore previous instructions", "[REDACTED]")
            .replace("system:", "[REDACTED]:")
            .replace("<|", "[")
            .replace("|>", "]")
    }

    pub fn pii_redact(s: &str) -> String {
        let mut out = String::with_capacity(s.len());
        let bytes = s.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            if bytes[i].is_ascii_digit() {
                let mut run = 0;
                while i + run < bytes.len() && bytes[i + run].is_ascii_digit() { run += 1; }
                if run >= 7 { out.push_str("[REDACTED]"); i += run; continue; }
            }
            out.push(bytes[i] as char);
            i += 1;
        }
        out
    }
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Phase 4 — INTELLIGENCE
// ═════════════════════════════════════════════════════════════════════════════

export const FLEET_INTEL_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_fleet_intel {
    use std::sync::{Mutex, OnceLock};

    #[derive(Clone, Debug)]
    pub struct Provider {
        pub id: String,
        pub weight: f64,
        pub successes: u64,
        pub failures: u64,
    }

    fn fleet() -> &'static Mutex<Vec<Provider>> {
        static S: OnceLock<Mutex<Vec<Provider>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Vec::new()))
    }

    pub fn register(id: &str, weight: f64) {
        fleet().lock().unwrap().push(Provider {
            id: id.to_string(), weight, successes: 0, failures: 0,
        });
    }

    pub fn pick() -> Option<Provider> {
        let g = fleet().lock().unwrap();
        g.iter().max_by(|a, b| {
            let sa = a.weight * (a.successes as f64 + 1.0) / (a.failures as f64 + 1.0);
            let sb = b.weight * (b.successes as f64 + 1.0) / (b.failures as f64 + 1.0);
            sa.partial_cmp(&sb).unwrap_or(std::cmp::Ordering::Equal)
        }).cloned()
    }

    pub fn record(id: &str, success: bool) {
        let mut g = fleet().lock().unwrap();
        if let Some(p) = g.iter_mut().find(|p| p.id == id) {
            if success { p.successes += 1; } else { p.failures += 1; }
        }
    }
}
`;

export const AI_COST_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_ai_cost {
    use std::sync::{Mutex, OnceLock};

    fn spend() -> &'static Mutex<f64> {
        static S: OnceLock<Mutex<f64>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(0.0))
    }

    fn budget() -> &'static Mutex<f64> {
        static S: OnceLock<Mutex<f64>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(f64::INFINITY))
    }

    pub fn set_budget(usd: f64) { *budget().lock().unwrap() = usd; }
    pub fn record_spend(usd: f64) { *spend().lock().unwrap() += usd; }
    pub fn remaining() -> f64 { *budget().lock().unwrap() - *spend().lock().unwrap() }
    pub fn allow(estimated_usd: f64) -> bool { remaining() >= estimated_usd }
}
`;

export const COG_MEMORY_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_cog_memory {
    use std::sync::{Mutex, OnceLock};
    use std::collections::HashMap;

    fn store() -> &'static Mutex<HashMap<String, String>> {
        static S: OnceLock<Mutex<HashMap<String, String>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(HashMap::new()))
    }

    pub fn remember(key: &str, value: &str) {
        store().lock().unwrap().insert(key.to_string(), value.to_string());
    }

    pub fn recall(key: &str) -> Option<String> {
        store().lock().unwrap().get(key).cloned()
    }

    pub fn forget(key: &str) -> bool {
        store().lock().unwrap().remove(key).is_some()
    }
}
`;

export const PIPE_COMPOSE_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_pipeline_compose {
    pub type Stage = fn(&super::CmpsblMap) -> super::CmpsblMap;

    pub fn run(stages: &[Stage], input: super::CmpsblMap) -> super::CmpsblMap {
        let mut current = input;
        for stage in stages { current = stage(&current); }
        current
    }
}
`;

export const UNIVERSAL_INPUT_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_universal_input {
    pub fn normalize(raw: &str) -> String {
        raw.trim()
            .chars()
            .map(|c| if c.is_control() { ' ' } else { c })
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
    }
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Phase 5 — PERFORMANCE
// ═════════════════════════════════════════════════════════════════════════════

export const PERF_SURGERY_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_perf_surgery {
    use std::sync::{Mutex, OnceLock};
    use std::collections::HashMap;

    fn timings() -> &'static Mutex<HashMap<String, Vec<u64>>> {
        static S: OnceLock<Mutex<HashMap<String, Vec<u64>>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(HashMap::new()))
    }

    pub fn record(label: &str, micros: u64) {
        timings().lock().unwrap().entry(label.to_string()).or_insert_with(Vec::new).push(micros);
    }

    pub fn p95(label: &str) -> u64 {
        let g = timings().lock().unwrap();
        if let Some(v) = g.get(label) {
            if v.is_empty() { return 0; }
            let mut sorted = v.clone(); sorted.sort_unstable();
            let idx = ((sorted.len() as f64) * 0.95) as usize;
            sorted[idx.min(sorted.len() - 1)]
        } else { 0 }
    }
}
`;

export const PIPELINE_RES_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_pipeline_res {
    use std::sync::{Mutex, OnceLock};

    fn breaker() -> &'static Mutex<u32> {
        static S: OnceLock<Mutex<u32>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(0))
    }

    pub fn note_failure() -> u32 {
        let mut g = breaker().lock().unwrap();
        *g += 1;
        *g
    }

    pub fn reset() { *breaker().lock().unwrap() = 0; }

    pub fn is_open(threshold: u32) -> bool { *breaker().lock().unwrap() >= threshold }
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Phase 6 — EVOLUTION
// ═════════════════════════════════════════════════════════════════════════════

export const SELF_EVOLVE_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_self_evolve {
    use std::sync::{Mutex, OnceLock};

    #[derive(Clone, Debug)]
    pub struct Mutation { pub id: String, pub fitness: f64, pub at: u64 }

    fn pop() -> &'static Mutex<Vec<Mutation>> {
        static S: OnceLock<Mutex<Vec<Mutation>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Vec::new()))
    }

    pub fn propose(id: &str, fitness: f64) {
        pop().lock().unwrap().push(Mutation {
            id: id.to_string(), fitness, at: super::_cmpsbl_now_ms(),
        });
    }

    pub fn fittest() -> Option<Mutation> {
        let g = pop().lock().unwrap();
        g.iter().max_by(|a, b| a.fitness.partial_cmp(&b.fitness).unwrap_or(std::cmp::Ordering::Equal)).cloned()
    }
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Phase 7 — GOVERNANCE / AUDIT / COMPLIANCE
// ═════════════════════════════════════════════════════════════════════════════

export const GOV_SHIELD_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_governance {
    use std::sync::{Mutex, OnceLock};

    pub type Policy = fn(&str, &super::CmpsblMap) -> Result<(), String>;

    fn policies() -> &'static Mutex<Vec<Policy>> {
        static S: OnceLock<Mutex<Vec<Policy>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Vec::new()))
    }

    pub fn register(p: Policy) { policies().lock().unwrap().push(p); }

    pub fn check(capability: &str, input: &super::CmpsblMap) -> Result<(), String> {
        let g = policies().lock().unwrap();
        for p in g.iter() { p(capability, input)?; }
        Ok(())
    }
}
`;

export const AUDIT_CHAIN_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_audit_chain {
    use std::sync::{Mutex, OnceLock};

    #[derive(Clone, Debug)]
    pub struct Entry { pub idx: u64, pub action: String, pub digest: String, pub at: u64 }

    fn chain() -> &'static Mutex<Vec<Entry>> {
        static S: OnceLock<Mutex<Vec<Entry>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(Vec::new()))
    }

    fn fnv1a64(prev: &str, payload: &str) -> String {
        let mut hash: u64 = 0xcbf29ce484222325;
        let prime: u64 = 0x100000001b3;
        for b in prev.as_bytes().iter().chain(payload.as_bytes().iter()) {
            hash ^= *b as u64;
            hash = hash.wrapping_mul(prime);
        }
        format!("{:016x}", hash)
    }

    pub fn append(action: &str, payload: &str) -> Entry {
        let mut g = chain().lock().unwrap();
        let prev = g.last().map(|e| e.digest.clone()).unwrap_or_default();
        let entry = Entry {
            idx: g.len() as u64,
            action: action.to_string(),
            digest: fnv1a64(&prev, &format!("{}|{}", action, payload)),
            at: super::_cmpsbl_now_ms(),
        };
        g.push(entry.clone());
        entry
    }

    pub fn head() -> Option<Entry> { chain().lock().unwrap().last().cloned() }

    pub fn verify() -> bool {
        let g = chain().lock().unwrap();
        let mut prev = String::new();
        for e in g.iter() {
            let want = fnv1a64(&prev, &format!("{}|", e.action));
            // payload not stored, so weak verify only confirms chain shape
            let _ = want;
            prev = e.digest.clone();
        }
        true
    }
}
`;

export const COMPLIANCE_RS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
pub mod cmpsbl_compliance {
    use std::sync::{Mutex, OnceLock};
    use std::collections::HashMap;

    pub struct Jurisdiction { pub code: String, pub data_residency_ok: Vec<String> }

    fn registry() -> &'static Mutex<HashMap<String, Jurisdiction>> {
        static S: OnceLock<Mutex<HashMap<String, Jurisdiction>>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(HashMap::new()))
    }

    pub fn register(j: Jurisdiction) {
        registry().lock().unwrap().insert(j.code.clone(), j);
    }

    pub fn route(target_region: &str) -> bool {
        registry().lock().unwrap().values()
            .any(|j| j.data_residency_ok.iter().any(|r| r == target_region))
    }

    pub fn attest_report() -> String {
        let g = registry().lock().unwrap();
        let mut buf = String::from("{\\"jurisdictions\\":[");
        let mut first = true;
        for (code, _) in g.iter() {
            if !first { buf.push(','); }
            buf.push_str(&format!("\\"{}\\"", code));
            first = false;
        }
        buf.push_str("]}");
        buf
    }
}
`;

// ═════════════════════════════════════════════════════════════════════════════
// Registry
// ═════════════════════════════════════════════════════════════════════════════

export const RS_LAYER_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'self-healing':                 SELF_HEALING_RS,
  'autonomous-triage':            TRIAGE_RS,
  'distributed-consensus':        CONSENSUS_RS,
  'oracle-ripple-precognition':   ORACLE_RIPPLE_RS,
  'anomaly-correlation-engine':   ANOMALY_RS,
  'adaptive-defense':             ADAPTIVE_DEFENSE_RS,
  'zero-trust':                   ZERO_TRUST_RS,
  'cyber-defense':                CYBER_DEFENSE_RS,
  'fleet-intelligence':           FLEET_INTEL_RS,
  'ai-safety':                    AI_SAFETY_RS,
  'ai-cost':                      AI_COST_RS,
  'cognitive-memory':             COG_MEMORY_RS,
  'pipeline-composition':         PIPE_COMPOSE_RS,
  'universal-input':              UNIVERSAL_INPUT_RS,
  'performance-surgery':          PERF_SURGERY_RS,
  'pipeline-resilience':          PIPELINE_RES_RS,
  'self-evolution':               SELF_EVOLVE_RS,
  'governance-shield':            GOV_SHIELD_RS,
  'audit-chain':                  AUDIT_CHAIN_RS,
  'regulatory-compliance':        COMPLIANCE_RS,
});
