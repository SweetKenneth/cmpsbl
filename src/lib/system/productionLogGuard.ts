/**
 * Production Log Guard
 * Suppresses debug/info console output in production builds.
 * Call once at app boot to patch global console methods.
 * 
 * Investor-ready console hygiene
 */

const IS_PROD = import.meta.env.PROD;

const originalConsole = {
  log: console.log,
  info: console.info,
  debug: console.debug,
  warn: console.warn,
};

// Patterns that are always suppressed in production
const SUPPRESSED_PREFIXES = [
  '[GOAL]',
  '[circuit-breaker]',
  '[RIPPLE]',
  '[CLM]',
  '[Rollback]',
  '[MemoryCore]',
  '[CapabilityGate]',
  '[Knowledge-AutoFill]',
  '[EvolutionStamp]',
  '[ProposalStore]',
  '[chaos-testing]',
  '[RenderGuard]',
  '[Deprecation]',
  'Deprecation:',
];

function shouldSuppress(args: unknown[]): boolean {
  if (!IS_PROD) return false;
  if (args.length === 0) return false;

  const first = args[0];
  if (typeof first !== 'string') return false;

  return SUPPRESSED_PREFIXES.some(prefix => first.includes(prefix));
}

/**
 * Install production log guards.
 * In production: suppresses debug entirely, suppresses info/log with substrate prefixes.
 * In development: no-op, all logs pass through.
 */
export function installProductionLogGuard(): void {
  if (!IS_PROD) return;

  // Fully suppress debug in production
  console.debug = () => {};

  // Gate log and info — suppress substrate noise
  console.log = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    originalConsole.log(...args);
  };

  console.info = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    originalConsole.info(...args);
  };

  // Warnings — suppress deprecation noise but keep real warnings
  console.warn = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    originalConsole.warn(...args);
  };

  // console.error is NEVER suppressed
}

/**
 * Restore original console methods (for testing).
 */
export function restoreConsole(): void {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  console.warn = originalConsole.warn;
}
