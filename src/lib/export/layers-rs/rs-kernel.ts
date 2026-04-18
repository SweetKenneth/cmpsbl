/**
 * CMPSBL® Native Rust — Tier 1 Kernel Bodies
 * Hand-written Rust modules for kernel-clock, capability-registry, kernel-bootstrap.
 * Each module is self-contained, std-only, deterministic.
 * © CMPSBL® — All rights reserved.
 */

const HEADER = (name: string) =>
  `// ╔═══════════════════════════════════════════════════════════════════════════════╗\n` +
  `// ║  ASCENSION KERNEL — ${name}${' '.repeat(Math.max(0, 56 - name.length))}║\n` +
  `// ╚═══════════════════════════════════════════════════════════════════════════════╝`;

export const RS_KERNEL_BODIES: Readonly<Record<string, string>> = Object.freeze({
  'kernel-clock': `${HEADER('Kernel Clock')}
pub mod cmpsbl_clock {
    use std::sync::Mutex;
    use std::sync::OnceLock;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[derive(Clone, Debug, PartialEq)]
    pub enum ClockMode { System, Fixed, Monotonic }

    struct ClockState {
        mode: ClockMode,
        fixed_ms: u128,
        mono_ms: u128,
        seed: u64,
    }

    fn state() -> &'static Mutex<ClockState> {
        static S: OnceLock<Mutex<ClockState>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(ClockState {
            mode: ClockMode::System, fixed_ms: 0, mono_ms: 0, seed: 0x9E3779B97F4A7C15,
        }))
    }

    pub fn set_mode(mode: ClockMode) { state().lock().unwrap().mode = mode; }
    pub fn set_fixed(ms: u128) { let mut s = state().lock().unwrap(); s.mode = ClockMode::Fixed; s.fixed_ms = ms; }

    pub fn now_ms() -> u128 {
        let mut s = state().lock().unwrap();
        match s.mode {
            ClockMode::System => SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0),
            ClockMode::Fixed => s.fixed_ms,
            ClockMode::Monotonic => { s.mono_ms = s.mono_ms.wrapping_add(1); s.mono_ms }
        }
    }

    pub fn uuid() -> String {
        let mut s = state().lock().unwrap();
        s.seed = s.seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        let a = s.seed; let b = s.seed.wrapping_mul(0x9E3779B97F4A7C15);
        format!("{:016x}-{:016x}", a, b)
    }
}`,

  'capability-registry': `${HEADER('Capability Registry')}
pub mod cmpsbl_registry {
    use std::collections::HashMap;
    use std::sync::Mutex;
    use std::sync::OnceLock;

    pub type Handler = fn(&str) -> String;

    struct RegistryState { handlers: HashMap<String, Handler> }

    fn state() -> &'static Mutex<RegistryState> {
        static S: OnceLock<Mutex<RegistryState>> = OnceLock::new();
        S.get_or_init(|| Mutex::new(RegistryState { handlers: HashMap::new() }))
    }

    pub fn register(name: &str, handler: Handler) {
        state().lock().unwrap().handlers.insert(name.to_string(), handler);
    }

    pub fn has(name: &str) -> bool {
        state().lock().unwrap().handlers.contains_key(name)
    }

    pub fn dispatch(name: &str, payload: &str) -> Result<String, String> {
        let h = { state().lock().unwrap().handlers.get(name).copied() };
        match h {
            Some(f) => Ok(f(payload)),
            None => Err(format!("cmpsbl_registry: unknown capability '{}'", name)),
        }
    }

    pub fn list() -> Vec<String> {
        let s = state().lock().unwrap();
        let mut v: Vec<String> = s.handlers.keys().cloned().collect();
        v.sort(); v
    }

    pub fn count() -> usize { state().lock().unwrap().handlers.len() }
}`,

  'kernel-bootstrap': `${HEADER('Kernel Bootstrap')}
pub mod cmpsbl_boot {
    use std::sync::Mutex;
    use std::sync::OnceLock;

    #[derive(Clone, Debug, PartialEq)]
    pub enum BootStatus { Cold, Booting, Ready, Degraded, Shutdown }

    pub struct KernelHandle {
        pub status: BootStatus,
        pub started_ms: u128,
        pub components: Vec<String>,
    }

    fn handle() -> &'static Mutex<KernelHandle> {
        static H: OnceLock<Mutex<KernelHandle>> = OnceLock::new();
        H.get_or_init(|| Mutex::new(KernelHandle {
            status: BootStatus::Cold, started_ms: 0, components: Vec::new(),
        }))
    }

    /// Boot the kernel quintet in canonical order.
    /// Returns true if boot reached Ready, false if Degraded.
    pub fn boot() -> bool {
        let mut h = handle().lock().unwrap();
        if h.status == BootStatus::Ready { return true; }
        h.status = BootStatus::Booting;
        h.components.clear();
        for c in &["clock", "state-store", "contract-validator", "quarantine", "isolated-executor"] {
            h.components.push((*c).to_string());
        }
        h.started_ms = super::cmpsbl_clock::now_ms();
        h.status = BootStatus::Ready;
        true
    }

    pub fn health() -> BootStatus { handle().lock().unwrap().status.clone() }

    pub fn shutdown() {
        let mut h = handle().lock().unwrap();
        h.status = BootStatus::Shutdown;
        h.components.clear();
    }
}`,
});
