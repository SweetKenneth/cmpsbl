/**
 * CMPSBL® Native Rust — Tier 1 Kernel (Resource Budget + Health Probe)
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const RS_KERNEL_GOVERNANCE_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'resource-budget-gate': `${HEADER('Resource Budget Gate')}
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Default)]
pub struct CmpsblBudget {
    pub max_wall_ms: Option<u64>,
    pub max_memory_bytes: Option<u64>,
    pub max_depth: Option<u32>,
}

#[derive(Debug, Clone)]
pub struct CmpsblBudgetVerdict {
    pub allowed: bool,
    pub reason: Option<String>,
    pub strikes: u32,
}

#[derive(Debug, Clone)]
pub struct CmpsblBudgetBreach {
    pub name: String,
    pub kind: String,
    pub observed: u64,
    pub limit: u64,
    pub ts: u64,
}

const BUDGET_BREACH_MAX: usize = 256;
const BUDGET_STRIKE_THRESHOLD: u32 = 3;

struct BudgetState {
    budgets: HashMap<String, CmpsblBudget>,
    depth: HashMap<String, u32>,
    strikes: HashMap<String, u32>,
    breaches: Vec<CmpsblBudgetBreach>,
}

static BUDGET: Mutex<BudgetState> = Mutex::new(BudgetState {
    budgets: HashMap::new(),
    depth: HashMap::new(),
    strikes: HashMap::new(),
    breaches: Vec::new(),
});

fn now_ms_bg() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

pub fn cmpsbl_budget_declare(name: &str, budget: CmpsblBudget) {
    let mut g = BUDGET.lock().unwrap();
    g.budgets.insert(name.to_string(), budget);
}

pub fn cmpsbl_budget_enter(name: &str) -> CmpsblBudgetVerdict {
    let mut g = BUDGET.lock().unwrap();
    let cur = *g.depth.get(name).unwrap_or(&0);
    let max_depth = g.budgets.get(name).and_then(|b| b.max_depth);
    if let Some(md) = max_depth {
        if cur >= md {
            let next = g.strikes.get(name).copied().unwrap_or(0) + 1;
            g.strikes.insert(name.to_string(), next);
            let ts = now_ms_bg();
            g.breaches.push(CmpsblBudgetBreach {
                name: name.to_string(), kind: "depth".into(),
                observed: (cur + 1) as u64, limit: md as u64, ts,
            });
            if g.breaches.len() > BUDGET_BREACH_MAX { g.breaches.remove(0); }
            return CmpsblBudgetVerdict { allowed: false, reason: Some("depth-exceeded".into()), strikes: next };
        }
    }
    g.depth.insert(name.to_string(), cur + 1);
    let strikes = g.strikes.get(name).copied().unwrap_or(0);
    CmpsblBudgetVerdict { allowed: true, reason: None, strikes }
}

pub fn cmpsbl_budget_exit(name: &str, wall_ms: u64, mem_bytes: Option<u64>) -> CmpsblBudgetVerdict {
    let mut g = BUDGET.lock().unwrap();
    let cur = *g.depth.get(name).unwrap_or(&1);
    g.depth.insert(name.to_string(), if cur > 0 { cur - 1 } else { 0 });
    let budget = g.budgets.get(name).cloned();
    let Some(b) = budget else {
        let strikes = g.strikes.get(name).copied().unwrap_or(0);
        return CmpsblBudgetVerdict { allowed: true, reason: None, strikes };
    };
    let mut reason: Option<String> = None;
    if let Some(mw) = b.max_wall_ms {
        if wall_ms > mw {
            let n = g.strikes.get(name).copied().unwrap_or(0) + 1;
            g.strikes.insert(name.to_string(), n);
            let ts = now_ms_bg();
            g.breaches.push(CmpsblBudgetBreach {
                name: name.to_string(), kind: "wall-time".into(),
                observed: wall_ms, limit: mw, ts,
            });
            if g.breaches.len() > BUDGET_BREACH_MAX { g.breaches.remove(0); }
            reason = Some("wall-time-exceeded".into());
        }
    }
    if let (Some(mb_observed), Some(mb_limit)) = (mem_bytes, b.max_memory_bytes) {
        if mb_observed > mb_limit {
            let n = g.strikes.get(name).copied().unwrap_or(0) + 1;
            g.strikes.insert(name.to_string(), n);
            let ts = now_ms_bg();
            g.breaches.push(CmpsblBudgetBreach {
                name: name.to_string(), kind: "memory".into(),
                observed: mb_observed, limit: mb_limit, ts,
            });
            if g.breaches.len() > BUDGET_BREACH_MAX { g.breaches.remove(0); }
            reason = Some(match reason {
                Some(r) => format!("{}+memory-exceeded", r),
                None => "memory-exceeded".into(),
            });
        }
    }
    let strikes = g.strikes.get(name).copied().unwrap_or(0);
    CmpsblBudgetVerdict { allowed: reason.is_none(), reason, strikes }
}

pub fn cmpsbl_budget_should_quarantine(name: &str) -> bool {
    let g = BUDGET.lock().unwrap();
    g.strikes.get(name).copied().unwrap_or(0) >= BUDGET_STRIKE_THRESHOLD
}

pub fn cmpsbl_budget_strikes_for(name: &str) -> u32 {
    BUDGET.lock().unwrap().strikes.get(name).copied().unwrap_or(0)
}

pub fn cmpsbl_budget_clear_strikes(name: &str) {
    BUDGET.lock().unwrap().strikes.remove(name);
}

pub fn cmpsbl_budget_all_breaches() -> Vec<CmpsblBudgetBreach> {
    BUDGET.lock().unwrap().breaches.clone()
}

pub fn cmpsbl_budget_declared_all() -> Vec<(String, CmpsblBudget)> {
    BUDGET.lock().unwrap().budgets.iter().map(|(k, v)| (k.clone(), v.clone())).collect()
}

pub fn cmpsbl_budget_reset() {
    let mut g = BUDGET.lock().unwrap();
    g.budgets.clear(); g.depth.clear(); g.strikes.clear(); g.breaches.clear();
}`,

  'kernel-health-probe': `${HEADER('Kernel Health Probe')}
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CmpsblHealthReport {
    pub quartet: String,
    pub store: String,
    pub contracts: u32,
    pub quarantined: u32,
    pub executions: u64,
    pub receipts: u64,
    pub budget_strikes: u32,
    pub ts: u64,
}

// Surface presence flags — flipped to true by each kernel module on init.
struct HealthSurfaces {
    contracts: bool,
    quarantine: bool,
    executor: bool,
    budget: bool,
    store: bool,
    receipts: bool,
    contract_count: u32,
    quarantine_count: u32,
    execution_count: u64,
    receipt_count: u64,
    budget_strike_total: u32,
}

static HEALTH: Mutex<HealthSurfaces> = Mutex::new(HealthSurfaces {
    contracts: false, quarantine: false, executor: false, budget: false,
    store: false, receipts: false,
    contract_count: 0, quarantine_count: 0, execution_count: 0,
    receipt_count: 0, budget_strike_total: 0,
});

pub fn cmpsbl_health_register_surface(name: &str, present: bool) {
    let mut g = HEALTH.lock().unwrap();
    match name {
        "contracts" => g.contracts = present,
        "quarantine" => g.quarantine = present,
        "executor" => g.executor = present,
        "budget" => g.budget = present,
        "store" => g.store = present,
        "receipts" => g.receipts = present,
        _ => {}
    }
}

pub fn cmpsbl_health_set_counter(name: &str, value: u64) {
    let mut g = HEALTH.lock().unwrap();
    match name {
        "contracts" => g.contract_count = value as u32,
        "quarantined" => g.quarantine_count = value as u32,
        "executions" => g.execution_count = value,
        "receipts" => g.receipt_count = value,
        "budget_strikes" => g.budget_strike_total = value as u32,
        _ => {}
    }
}

pub fn cmpsbl_health() -> CmpsblHealthReport {
    let g = HEALTH.lock().unwrap();
    let count = (g.contracts as u8) + (g.quarantine as u8) + (g.executor as u8) + (g.budget as u8);
    let quartet = if count == 4 { "ok" } else if count > 0 { "degraded" } else { "down" };
    let store = if g.store { "ok" } else { "down" };
    let ts = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0);
    CmpsblHealthReport {
        quartet: quartet.into(),
        store: store.into(),
        contracts: g.contract_count,
        quarantined: g.quarantine_count,
        executions: g.execution_count,
        receipts: g.receipt_count,
        budget_strikes: g.budget_strike_total,
        ts,
    }
}`,
});
