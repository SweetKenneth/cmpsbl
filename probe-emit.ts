import { generateUnifiedPython } from './src/lib/export/unified-capability-file';
import { writeFileSync, readFileSync } from 'fs';
import * as crypto from 'crypto';
const userSource = `"""User module."""
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
    raise SystemExit("VIOLATION")
`;
const concat = `# ─── user.py ───\n${userSource.trimEnd()}`;
console.log('JS-concat len', concat.length);
console.log('JS-concat sha', crypto.createHash('sha256').update(concat).digest('hex'));
console.log('first 200', JSON.stringify(concat.slice(0,200)));
