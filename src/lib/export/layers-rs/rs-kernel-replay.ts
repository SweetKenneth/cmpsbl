/**
 * CMPSBL® Native Rust — Tier 1 Kernel (Replay/Shadow/Effect)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const RS_KERNEL_REPLAY_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'replay-log': `${HEADER('Replay Log')}
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CmpsblReplayEntry {
    pub seq: u64,
    pub ts: u64,
    pub name: String,
    pub args: String,
    pub result: String,
    pub ok: bool,
    pub duration_ms: u64,
}

const REPLAY_RING_MAX: usize = 2048;

struct ReplayState {
    entries: Vec<CmpsblReplayEntry>,
    seq: u64,
    sample_rate: u64,
}

static REPLAY_STATE: Mutex<ReplayState> = Mutex::new(ReplayState {
    entries: Vec::new(),
    seq: 0,
    sample_rate: 1,
});

pub enum CmpsblReplayLog {}

impl CmpsblReplayLog {
    pub fn set_sample_rate(n: u64) {
        let mut s = REPLAY_STATE.lock().unwrap();
        s.sample_rate = if n == 0 { 1 } else { n };
    }

    pub fn record(name: &str, args: &str, result: &str, ok: bool, duration_ms: u64) -> Option<CmpsblReplayEntry> {
        let mut s = REPLAY_STATE.lock().unwrap();
        s.seq += 1;
        let seq = s.seq;
        if s.sample_rate > 1 && seq % s.sample_rate != 0 { return None; }
        let ts = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64;
        let entry = CmpsblReplayEntry {
            seq, ts, name: name.to_string(),
            args: args.to_string(), result: result.to_string(),
            ok, duration_ms,
        };
        s.entries.push(entry.clone());
        if s.entries.len() > REPLAY_RING_MAX { s.entries.remove(0); }
        Some(entry)
    }

    pub fn entries_for(name: &str) -> Vec<CmpsblReplayEntry> {
        REPLAY_STATE.lock().unwrap().entries.iter()
            .filter(|e| e.name == name).cloned().collect()
    }
    pub fn all() -> Vec<CmpsblReplayEntry> { REPLAY_STATE.lock().unwrap().entries.clone() }
    pub fn length() -> usize { REPLAY_STATE.lock().unwrap().entries.len() }
    pub fn reset() {
        let mut s = REPLAY_STATE.lock().unwrap();
        s.entries.clear(); s.seq = 0;
    }
}`,

  'shadow-execution': `${HEADER('Shadow Execution')}
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

pub type CmpsblShadowFn = Box<dyn Fn(&str) -> Result<String, String> + Send + Sync>;

#[derive(Debug, Clone)]
pub struct CmpsblShadowDivergence {
    pub name: String,
    pub ts: u64,
    pub prod_result: String,
    pub shadow_result: String,
    pub prod_ok: bool,
    pub shadow_ok: bool,
    pub prod_duration_ms: u64,
    pub shadow_duration_ms: u64,
    pub reason: String,
}

#[derive(Debug, Clone, Default)]
pub struct CmpsblShadowStats {
    pub runs: u64,
    pub matches: u64,
    pub divergences: u64,
    pub shadow_errors: u64,
}

const SHADOW_DIV_MAX: usize = 256;

struct ShadowState {
    candidates: HashMap<String, CmpsblShadowFn>,
    divergences: Vec<CmpsblShadowDivergence>,
    stats: HashMap<String, CmpsblShadowStats>,
}

static SHADOW_STATE: Mutex<ShadowState> = Mutex::new(ShadowState {
    candidates: HashMap::new(),
    divergences: Vec::new(),
    stats: HashMap::new(),
});

pub enum CmpsblShadow {}

impl CmpsblShadow {
    pub fn register(name: &str, candidate: CmpsblShadowFn) {
        let mut s = SHADOW_STATE.lock().unwrap();
        s.candidates.insert(name.to_string(), candidate);
        s.stats.entry(name.to_string()).or_insert_with(CmpsblShadowStats::default);
    }

    pub fn unregister(name: &str) -> bool {
        SHADOW_STATE.lock().unwrap().candidates.remove(name).is_some()
    }

    pub fn compare(name: &str, args: &str, prod_result: &str, prod_ok: bool, prod_duration_ms: u64) -> String {
        let mut s = SHADOW_STATE.lock().unwrap();
        if !s.candidates.contains_key(name) { return prod_result.to_string(); }
        let stats = s.stats.entry(name.to_string()).or_insert_with(CmpsblShadowStats::default);
        stats.runs += 1;
        let candidate = s.candidates.get(name).unwrap();
        let t0 = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64;
        let (shadow_result, shadow_ok, mut reason) = match candidate(args) {
            Ok(r) => (r, true, String::new()),
            Err(e) => (String::new(), false, format!("shadow-throw:{}", e)),
        };
        let shadow_duration_ms = (SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64).saturating_sub(t0);
        if shadow_ok {
            if shadow_result == prod_result && shadow_ok == prod_ok {
                let stats = s.stats.get_mut(name).unwrap();
                stats.matches += 1;
                return prod_result.to_string();
            }
            reason = "envelope-mismatch".to_string();
        } else {
            let stats = s.stats.get_mut(name).unwrap();
            stats.shadow_errors += 1;
        }
        let stats = s.stats.get_mut(name).unwrap();
        stats.divergences += 1;
        let div = CmpsblShadowDivergence {
            name: name.to_string(),
            ts: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64,
            prod_result: prod_result.to_string(), shadow_result,
            prod_ok, shadow_ok, prod_duration_ms, shadow_duration_ms, reason,
        };
        s.divergences.push(div);
        if s.divergences.len() > SHADOW_DIV_MAX { s.divergences.remove(0); }
        prod_result.to_string()
    }

    pub fn divergences_for(name: &str) -> Vec<CmpsblShadowDivergence> {
        SHADOW_STATE.lock().unwrap().divergences.iter()
            .filter(|d| d.name == name).cloned().collect()
    }
    pub fn all_divergences() -> Vec<CmpsblShadowDivergence> {
        SHADOW_STATE.lock().unwrap().divergences.clone()
    }
    pub fn stats_for(name: &str) -> Option<CmpsblShadowStats> {
        SHADOW_STATE.lock().unwrap().stats.get(name).cloned()
    }
    pub fn registered() -> Vec<String> {
        SHADOW_STATE.lock().unwrap().candidates.keys().cloned().collect()
    }
    pub fn reset() {
        let mut s = SHADOW_STATE.lock().unwrap();
        s.candidates.clear(); s.divergences.clear(); s.stats.clear();
    }
}`,

  'effect-tracker': `${HEADER('Effect Tracker')}
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CmpsblEffectClass { Pure, Io, Network, Mutation }

impl CmpsblEffectClass {
    pub fn rank(&self) -> u8 {
        match self { Self::Pure => 0, Self::Io => 1, Self::Network => 2, Self::Mutation => 3 }
    }
    pub fn from_str(s: &str) -> Option<Self> {
        match s { "pure" => Some(Self::Pure), "io" => Some(Self::Io),
                  "network" => Some(Self::Network), "mutation" => Some(Self::Mutation),
                  _ => None }
    }
    pub fn as_str(&self) -> &'static str {
        match self { Self::Pure => "pure", Self::Io => "io",
                     Self::Network => "network", Self::Mutation => "mutation" }
    }
}

#[derive(Debug, Clone)]
pub struct CmpsblEffectViolation {
    pub name: String,
    pub declared: CmpsblEffectClass,
    pub observed: CmpsblEffectClass,
    pub ts: u64,
    pub reason: String,
}

const EFFECT_VIOL_MAX: usize = 256;

struct EffectState {
    declared: HashMap<String, CmpsblEffectClass>,
    violations: Vec<CmpsblEffectViolation>,
    strict: bool,
}

static EFFECT_STATE: Mutex<EffectState> = Mutex::new(EffectState {
    declared: HashMap::new(),
    violations: Vec::new(),
    strict: false,
});

pub enum CmpsblEffects {}

impl CmpsblEffects {
    pub fn set_strict(on: bool) { EFFECT_STATE.lock().unwrap().strict = on; }

    pub fn declare(name: &str, effect: CmpsblEffectClass) {
        EFFECT_STATE.lock().unwrap().declared.insert(name.to_string(), effect);
    }

    pub fn declared_for(name: &str) -> Option<CmpsblEffectClass> {
        EFFECT_STATE.lock().unwrap().declared.get(name).copied()
    }

    pub fn audit(name: &str, observed: CmpsblEffectClass) -> bool {
        let mut s = EFFECT_STATE.lock().unwrap();
        let decl = match s.declared.get(name).copied() { Some(d) => d, None => return true };
        let (violated, reason) = if s.strict {
            (decl != observed, "strict-mismatch")
        } else {
            (observed.rank() > decl.rank(), "effect-escalation")
        };
        if !violated { return true; }
        let v = CmpsblEffectViolation {
            name: name.to_string(), declared: decl, observed,
            ts: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64,
            reason: reason.to_string(),
        };
        s.violations.push(v);
        if s.violations.len() > EFFECT_VIOL_MAX { s.violations.remove(0); }
        false
    }

    pub fn violations_for(name: &str) -> Vec<CmpsblEffectViolation> {
        EFFECT_STATE.lock().unwrap().violations.iter()
            .filter(|v| v.name == name).cloned().collect()
    }
    pub fn all_violations() -> Vec<CmpsblEffectViolation> {
        EFFECT_STATE.lock().unwrap().violations.clone()
    }
    pub fn reset() {
        let mut s = EFFECT_STATE.lock().unwrap();
        s.declared.clear(); s.violations.clear(); s.strict = false;
    }
}`,
});
