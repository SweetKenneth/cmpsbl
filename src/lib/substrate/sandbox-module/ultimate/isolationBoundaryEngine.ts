/**
 * Isolation Boundary Engine
 * 
 * Creates hermetically sealed execution contexts with zero-trust defaults.
 * Capability allow-lists, syscall filtering, stack depth limits, nested sandboxing.
 * 
 * @module sandbox/ultimate/isolationBoundaryEngine
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export interface IsolationNamespace {
  id: string;
  parentId: string | null;
  allowedCapabilities: string[];
  deniedSyscalls: string[];
  maxStackDepth: number;
  maxRecursionDepth: number;
  createdAt: number;
  sealed: boolean;
}

export interface BoundaryViolation {
  namespaceId: string;
  violationType: 'capability_denied' | 'syscall_blocked' | 'stack_overflow' | 'recursion_exceeded' | 'namespace_breach';
  detail: string;
  timestamp: number;
  severity: number; // 1–10
}

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_DENIED_SYSCALLS = ['exec', 'spawn', 'fork', 'kill', 'raw_socket', 'mount', 'chroot'];
const DEFAULT_MAX_STACK = 256;
const DEFAULT_MAX_RECURSION = 64;

// ── State ──────────────────────────────────────────────────────

const namespaces = new Map<string, IsolationNamespace>();
const violations: BoundaryViolation[] = [];

// ── Core ───────────────────────────────────────────────────────

/** Create a new isolation namespace */
export function createNamespace(
  id: string,
  allowedCapabilities: string[],
  parentId?: string,
): IsolationNamespace {
  // If child, inherit restrictions from parent (child can never exceed parent)
  let deniedSyscalls = [...DEFAULT_DENIED_SYSCALLS];
  let maxStack = DEFAULT_MAX_STACK;
  let maxRecursion = DEFAULT_MAX_RECURSION;
  let effectiveCapabilities = [...allowedCapabilities];

  if (parentId) {
    const parent = namespaces.get(parentId);
    if (parent) {
      // Child inherits parent's denials
      deniedSyscalls = [...new Set([...deniedSyscalls, ...parent.deniedSyscalls])];
      maxStack = Math.min(maxStack, parent.maxStackDepth);
      maxRecursion = Math.min(maxRecursion, parent.maxRecursionDepth);
      // Child can only use capabilities parent also has
      effectiveCapabilities = allowedCapabilities.filter(c => parent.allowedCapabilities.includes(c));
    }
  }

  const ns: IsolationNamespace = {
    id,
    parentId: parentId ?? null,
    allowedCapabilities: effectiveCapabilities,
    deniedSyscalls,
    maxStackDepth: maxStack,
    maxRecursionDepth: maxRecursion,
    createdAt: Date.now(),
    sealed: true,
  };
  namespaces.set(id, ns);
  return ns;
}

/** Check if a capability is allowed in a namespace */
export function checkCapability(namespaceId: string, capability: string): boolean {
  const ns = namespaces.get(namespaceId);
  if (!ns) return false;
  const allowed = ns.allowedCapabilities.includes(capability);
  if (!allowed) {
    violations.push({
      namespaceId, violationType: 'capability_denied',
      detail: `Capability "${capability}" not in allow-list`,
      timestamp: Date.now(), severity: 5,
    });
  }
  return allowed;
}

/** Check if a syscall is permitted */
export function checkSyscall(namespaceId: string, syscall: string): boolean {
  const ns = namespaces.get(namespaceId);
  if (!ns) return false;
  const blocked = ns.deniedSyscalls.includes(syscall);
  if (blocked) {
    violations.push({
      namespaceId, violationType: 'syscall_blocked',
      detail: `Syscall "${syscall}" is denied`,
      timestamp: Date.now(), severity: 7,
    });
  }
  return !blocked;
}

/** Validate stack depth */
export function checkStackDepth(namespaceId: string, currentDepth: number): boolean {
  const ns = namespaces.get(namespaceId);
  if (!ns) return false;
  if (currentDepth > ns.maxStackDepth) {
    violations.push({
      namespaceId, violationType: 'stack_overflow',
      detail: `Stack depth ${currentDepth} exceeds limit ${ns.maxStackDepth}`,
      timestamp: Date.now(), severity: 8,
    });
    return false;
  }
  return true;
}

export function getNamespace(id: string): IsolationNamespace | undefined { return namespaces.get(id); }
export function getViolations(namespaceId?: string): BoundaryViolation[] {
  if (namespaceId) return violations.filter(v => v.namespaceId === namespaceId);
  return [...violations];
}

export function getIsolationHealth() {
  return {
    activeNamespaces: namespaces.size,
    totalViolations: violations.length,
    highSeverityViolations: violations.filter(v => v.severity >= 7).length,
  };
}

export function resetIsolation(): void {
  namespaces.clear();
  violations.length = 0;
}
