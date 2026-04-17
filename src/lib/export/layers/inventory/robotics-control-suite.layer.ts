/**
 * CMPSBL® Inventory Layer — Robotics Control Suite
 * Primitives: FABRICATOR · SERVO · TENSOR · LIDAR
 *
 *   FABRICATOR → motion-plan (path) cost estimation
 *   SERVO      → PID control step
 *   TENSOR     → 3-component vector ops (dot, norm, scale)
 *   LIDAR      → simple obstacle distance check from a scan ring
 *
 * Auto-wire injects a fresh PID controller per execution and an
 * obstacle-safety gate that aborts the call if the latest LIDAR reading
 * is below the configured minimum clearance.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Robotics Control Suite (proprietary).                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── FABRICATOR · path-cost estimator ────────────────────────────────────────
export function cmpsbl_rcs_fabricator_cost(path: Array<[number, number, number]>): number {
  if (path.length < 2) return 0;
  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i][0] - path[i - 1][0];
    const dy = path[i][1] - path[i - 1][1];
    const dz = path[i][2] - path[i - 1][2];
    cost += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  return cost;
}

// ── SERVO · PID controller ──────────────────────────────────────────────────
export type CmpsblPid = { kp: number; ki: number; kd: number; integral: number; lastErr: number };
export function cmpsbl_rcs_servo_new(kp: number, ki: number, kd: number): CmpsblPid {
  return { kp, ki, kd, integral: 0, lastErr: 0 };
}
export function cmpsbl_rcs_servo_step(pid: CmpsblPid, setpoint: number, measured: number, dt: number): number {
  const err = setpoint - measured;
  pid.integral += err * dt;
  const deriv = dt > 0 ? (err - pid.lastErr) / dt : 0;
  pid.lastErr = err;
  return pid.kp * err + pid.ki * pid.integral + pid.kd * deriv;
}

// ── TENSOR · 3-vector ops ───────────────────────────────────────────────────
export type CmpsblVec3 = [number, number, number];
export function cmpsbl_rcs_tensor_dot(a: CmpsblVec3, b: CmpsblVec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function cmpsbl_rcs_tensor_norm(a: CmpsblVec3): number {
  return Math.sqrt(cmpsbl_rcs_tensor_dot(a, a));
}
export function cmpsbl_rcs_tensor_scale(a: CmpsblVec3, k: number): CmpsblVec3 {
  return [a[0] * k, a[1] * k, a[2] * k];
}

// ── LIDAR · obstacle clearance check ────────────────────────────────────────
export function cmpsbl_rcs_lidar_min(scan: number[]): number {
  if (scan.length === 0) return Infinity;
  let m = scan[0];
  for (let i = 1; i < scan.length; i++) if (scan[i] < m) m = scan[i];
  return m;
}
export function cmpsbl_rcs_lidar_safe(scan: number[], minClearance: number): { safe: boolean; closestM: number } {
  const closestM = cmpsbl_rcs_lidar_min(scan);
  return { safe: closestM >= minClearance, closestM };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Robotics Control Suite (proprietary).                      ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import math
from typing import List, Tuple

def cmpsbl_rcs_fabricator_cost(path: List[Tuple[float, float, float]]) -> float:
    if len(path) < 2: return 0.0
    cost = 0.0
    for i in range(1, len(path)):
        dx = path[i][0] - path[i - 1][0]
        dy = path[i][1] - path[i - 1][1]
        dz = path[i][2] - path[i - 1][2]
        cost += math.sqrt(dx * dx + dy * dy + dz * dz)
    return cost

def cmpsbl_rcs_servo_new(kp: float, ki: float, kd: float) -> dict:
    return { "kp": kp, "ki": ki, "kd": kd, "integral": 0.0, "last_err": 0.0 }

def cmpsbl_rcs_servo_step(pid: dict, setpoint: float, measured: float, dt: float) -> float:
    err = setpoint - measured
    pid["integral"] += err * dt
    deriv = (err - pid["last_err"]) / dt if dt > 0 else 0.0
    pid["last_err"] = err
    return pid["kp"] * err + pid["ki"] * pid["integral"] + pid["kd"] * deriv

def cmpsbl_rcs_tensor_dot(a, b) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def cmpsbl_rcs_tensor_norm(a) -> float:
    return math.sqrt(cmpsbl_rcs_tensor_dot(a, a))
def cmpsbl_rcs_tensor_scale(a, k: float):
    return (a[0] * k, a[1] * k, a[2] * k)

def cmpsbl_rcs_lidar_min(scan: List[float]) -> float:
    if not scan: return float('inf')
    return min(scan)

def cmpsbl_rcs_lidar_safe(scan: List[float], min_clearance: float) -> dict:
    closest = cmpsbl_rcs_lidar_min(scan)
    return { "safe": closest >= min_clearance, "closest_m": closest }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_rcs = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_rcs(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // LIDAR safety gate — abort if obstacle inside minimum clearance
  if (Array.isArray(input._cmpsbl_lidar_scan)) {
    const clearance = typeof input._cmpsbl_min_clearance_m === 'number' ? input._cmpsbl_min_clearance_m : 0.5;
    const lid = cmpsbl_rcs_lidar_safe(input._cmpsbl_lidar_scan as number[], clearance);
    if (!lid.safe) throw new Error(\`[CMPSBL:Robotics:\${capabilityName}] LIDAR abort — obstacle at \${lid.closestM.toFixed(2)}m (< \${clearance}m)\`);
  }
  return _cmpsbl_raw_execute_rcs(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_rcs = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Robotics Control Suite (LIDAR safety gate)."""
    scan = input_data.get('_cmpsbl_lidar_scan')
    if isinstance(scan, list):
        clearance = input_data.get('_cmpsbl_min_clearance_m', 0.5)
        lid = cmpsbl_rcs_lidar_safe(scan, clearance)
        if not lid['safe']:
            raise RuntimeError(f"[CMPSBL:Robotics:{capability_name}] LIDAR abort — obstacle at {lid['closest_m']:.2f}m (< {clearance}m)")
    return _cmpsbl_raw_execute_rcs(capability_name, input_data)`;

export const ROBOTICS_CONTROL_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'robotics-control-suite',
  name: 'Robotics Control Suite',
  crownJewelRank: 24,
  cjpi: 91,
  module: 'CONTROL',
  description: 'FABRICATOR path-cost + SERVO PID + TENSOR vec3 ops + LIDAR clearance safety gate.',
  priceCents: 8900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_rcs_lidar_safe',
    behavior: 'Aborts execution if the latest LIDAR scan shows an obstacle inside the minimum clearance.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
