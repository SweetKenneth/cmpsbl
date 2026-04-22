import { generateUnifiedPython } from './src/lib/export/unified-capability-file';
import { writeFileSync } from 'fs';

const userSource = `"""User module — must NOT be mutated."""
__all__ = ["main", "Greeter"]

class Greeter:
    def __init__(self, who="world"):
        self.who = who
    def execute(self, payload=None):
        return {"hello": self.who, "payload": payload}

def main(payload=None):
    print("[user] main() called with", payload)
    return {"user_main_ran": True, "payload": payload}

if __name__ == "__main__":
    print("[user] __main__ unmediated — VIOLATION")
    raise SystemExit("VIOLATION: user __main__ ran outside Layer 2")
`;

const cap = [{
  id: 'probe', name: 'probe', description: 'p',
  chain: ['DEFENSE', 'GOVERNANCE', 'COMPASS'],
  cjpiScore: 50, tier: 'mint' as const,
  fingerprint: '0123456789abcdef0123456789abcdef',
  moatSignature: 'm', capabilityType: 'utility',
}];

const py = generateUnifiedPython(cap, 'probe-pack', [{ name: 'user.py', content: userSource }] as any, undefined, 'observe');
writeFileSync('/tmp/probe.py', py);
console.log('emitted', py.length, 'bytes');
