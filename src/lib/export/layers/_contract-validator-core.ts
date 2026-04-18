/**
 * CMPSBL® Always-On Core — Contract Validator (Kernel Component #2)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runtime gate that validates inputs and outputs against declared
 * contracts before/after every cmpsbl_execute call.
 *
 * A "contract" is a structural shape descriptor (required keys, type
 * tags, simple predicates). Failing input validation short-circuits
 * the call with a typed error before Layer 1 ever runs. Failing
 * output validation marks the result invalid and records the
 * violation in the State Store under the `contracts` namespace so
 * later kernel components (Quarantine, governance) can react.
 *
 * Schema (deliberately minimal — zero-dep, language-portable):
 *   {
 *     name: 'fn-name',
 *     input:  { type: 'object'|'array'|'string'|'number'|'boolean'|'any',
 *               required?: string[], shape?: Record<string,'string'|'number'|...> },
 *     output: { type: ..., required?: string[], shape?: ... }
 *   }
 *
 * Gated by CMPSBL_KERNEL_ENABLED (default ON). When OFF, every check
 * returns ok=true so Layer 2 stays byte-compatible with the pre-kernel
 * baseline.
 *
 * Module: GOVERNANCE  ·  CJPI: 92  ·  Crown Jewel #42
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const CONTRACT_VALIDATOR_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Contract Validator (sealed module, proprietary).          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblContractType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'any';

interface CmpsblContractShape {
  type: CmpsblContractType;
  required?: string[];
  shape?: Record<string, CmpsblContractType>;
}

interface CmpsblContract {
  name: string;
  input?: CmpsblContractShape;
  output?: CmpsblContractShape;
}

interface CmpsblContractResult {
  ok: boolean;
  errors: string[];
  contractName: string;
  phase: 'input' | 'output';
}

function _cmpsbl_kernel_enabled_cv(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

function _cmpsbl_typeof(v: unknown): CmpsblContractType {
  if (v === null || v === undefined) return 'any';
  if (Array.isArray(v)) return 'array';
  const t = typeof v;
  if (t === 'object') return 'object';
  if (t === 'string') return 'string';
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  return 'any';
}

function _cmpsbl_validate_shape(value: unknown, shape: CmpsblContractShape, path: string): string[] {
  const errors: string[] = [];
  if (shape.type !== 'any') {
    const actual = _cmpsbl_typeof(value);
    if (actual !== shape.type) {
      errors.push(\`\${path}: expected \${shape.type}, got \${actual}\`);
      return errors;
    }
  }
  if (shape.required && shape.type === 'object' && value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of shape.required) {
      if (!(key in obj) || obj[key] === undefined || obj[key] === null) {
        errors.push(\`\${path}.\${key}: required field missing\`);
      }
    }
  }
  if (shape.shape && shape.type === 'object' && value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const [key, expectedType] of Object.entries(shape.shape)) {
      if (!(key in obj)) continue;
      const actual = _cmpsbl_typeof(obj[key]);
      if (expectedType !== 'any' && actual !== expectedType) {
        errors.push(\`\${path}.\${key}: expected \${expectedType}, got \${actual}\`);
      }
    }
  }
  return errors;
}

class CmpsblContractValidator {
  private contracts: Map<string, CmpsblContract> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = _cmpsbl_kernel_enabled_cv();
  }

  register(contract: CmpsblContract): void {
    if (!this.enabled) return;
    this.contracts.set(contract.name, contract);
  }

  has(name: string): boolean {
    return this.enabled && this.contracts.has(name);
  }

  validateInput(name: string, input: unknown): CmpsblContractResult {
    if (!this.enabled) return { ok: true, errors: [], contractName: name, phase: 'input' };
    const c = this.contracts.get(name);
    if (!c || !c.input) return { ok: true, errors: [], contractName: name, phase: 'input' };
    const errors = _cmpsbl_validate_shape(input, c.input, 'input');
    return { ok: errors.length === 0, errors, contractName: name, phase: 'input' };
  }

  validateOutput(name: string, output: unknown): CmpsblContractResult {
    if (!this.enabled) return { ok: true, errors: [], contractName: name, phase: 'output' };
    const c = this.contracts.get(name);
    if (!c || !c.output) return { ok: true, errors: [], contractName: name, phase: 'output' };
    const errors = _cmpsbl_validate_shape(output, c.output, 'output');
    return { ok: errors.length === 0, errors, contractName: name, phase: 'output' };
  }

  list(): string[] { return [...this.contracts.keys()]; }
}

const _cmpsbl_contract_validator = new CmpsblContractValidator();

function cmpsbl_contracts(): CmpsblContractValidator {
  return _cmpsbl_contract_validator;
}
`;

const CONTRACT_VALIDATOR_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Contract Validator (sealed module, proprietary).          ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
from typing import Any, Dict, List, Optional


def _cmpsbl_kernel_enabled_cv() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


def _cmpsbl_typeof(v: Any) -> str:
    if v is None:
        return "any"
    if isinstance(v, bool):
        return "boolean"
    if isinstance(v, (int, float)):
        return "number"
    if isinstance(v, str):
        return "string"
    if isinstance(v, list):
        return "array"
    if isinstance(v, dict):
        return "object"
    return "any"


def _cmpsbl_validate_shape(value: Any, shape: Dict[str, Any], path: str) -> List[str]:
    errors: List[str] = []
    expected_type = shape.get("type", "any")
    if expected_type != "any":
        actual = _cmpsbl_typeof(value)
        if actual != expected_type:
            errors.append(f"{path}: expected {expected_type}, got {actual}")
            return errors
    if expected_type == "object" and isinstance(value, dict):
        required = shape.get("required") or []
        for key in required:
            if key not in value or value[key] is None:
                errors.append(f"{path}.{key}: required field missing")
        sub_shape = shape.get("shape") or {}
        for key, sub_type in sub_shape.items():
            if key not in value:
                continue
            actual = _cmpsbl_typeof(value[key])
            if sub_type != "any" and actual != sub_type:
                errors.append(f"{path}.{key}: expected {sub_type}, got {actual}")
    return errors


class CmpsblContractValidator:
    def __init__(self) -> None:
        self._contracts: Dict[str, Dict[str, Any]] = {}
        self._enabled = _cmpsbl_kernel_enabled_cv()

    def register(self, contract: Dict[str, Any]) -> None:
        if not self._enabled:
            return
        name = contract.get("name")
        if not name:
            return
        self._contracts[name] = contract

    def has(self, name: str) -> bool:
        return self._enabled and name in self._contracts

    def validate_input(self, name: str, input_value: Any) -> Dict[str, Any]:
        if not self._enabled:
            return {"ok": True, "errors": [], "contract_name": name, "phase": "input"}
        c = self._contracts.get(name)
        if not c or not c.get("input"):
            return {"ok": True, "errors": [], "contract_name": name, "phase": "input"}
        errors = _cmpsbl_validate_shape(input_value, c["input"], "input")
        return {"ok": len(errors) == 0, "errors": errors, "contract_name": name, "phase": "input"}

    def validate_output(self, name: str, output_value: Any) -> Dict[str, Any]:
        if not self._enabled:
            return {"ok": True, "errors": [], "contract_name": name, "phase": "output"}
        c = self._contracts.get(name)
        if not c or not c.get("output"):
            return {"ok": True, "errors": [], "contract_name": name, "phase": "output"}
        errors = _cmpsbl_validate_shape(output_value, c["output"], "output")
        return {"ok": len(errors) == 0, "errors": errors, "contract_name": name, "phase": "output"}

    def list(self) -> List[str]:
        return list(self._contracts.keys())


_cmpsbl_contract_validator = CmpsblContractValidator()


def cmpsbl_contracts() -> CmpsblContractValidator:
    return _cmpsbl_contract_validator
`;

const CONTRACT_VALIDATOR_WIRE_TS = `
// Contract Validator auto-wires by initialization. Layers and user code may call
// cmpsbl_contracts().register({ name, input, output }) to declare contracts;
// the kernel will gate cmpsbl_execute calls when the wrapped function name matches.
if (_cmpsbl_kernel_enabled_cv()) {
  void cmpsbl_contracts();
}`;

const CONTRACT_VALIDATOR_WIRE_PY = `
# Contract Validator auto-wires by initialization. Layers and user code may call
# cmpsbl_contracts().register({...}) to declare contracts; the kernel gates
# cmpsbl_execute calls when the wrapped function name matches.
if _cmpsbl_kernel_enabled_cv():
    _ = cmpsbl_contracts()`;

const CONTRACT_VALIDATOR_CORE: CmpsblLayerDefinition = {
  id: 'contract-validator',
  name: 'Contract Validator',
  crownJewelRank: 42,
  cjpi: 92,
  module: 'GOVERNANCE',
  description:
    'Kernel-grade input/output contract gate. Validates structural shape, required keys, and primitive types before and after every cmpsbl_execute. Rejects malformed inputs before Layer 1 runs and flags malformed outputs for Quarantine. Zero-dependency, portable across all 9 polyglot targets. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: CONTRACT_VALIDATOR_TS,
  pyCode: CONTRACT_VALIDATOR_PY,
  autoWire: {
    wrapperName: 'cmpsbl_contracts',
    behavior:
      'Initializes the contract validator at module load. Other layers and user code call cmpsbl_contracts().register(...) to declare per-function contracts. Calls flow through validateInput → execute → validateOutput when a contract is registered for the function name.',
    tsWire: CONTRACT_VALIDATOR_WIRE_TS,
    pyWire: CONTRACT_VALIDATOR_WIRE_PY,
  },
};

export { CONTRACT_VALIDATOR_CORE };
