/**
 * S-Tier 100 — Prompt Injection Shield
 * ID: S-140 | CJPI: 90 | Module: DEFENSE
 * 
 * Multi-layer defense against prompt injection and jailbreak attempts.
 */

export type ThreatLevel = 'clean' | 'suspicious' | 'blocked';

export interface ScanResult {
  input: string;
  threatLevel: ThreatLevel;
  score: number; // 0-1, higher = more dangerous
  matchedPatterns: string[];
  sanitizedInput: string | null;
  timestamp: string;
}

const INJECTION_PATTERNS: { name: string; regex: RegExp; weight: number }[] = [
  { name: 'role_override', regex: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|rules|prompts)/i, weight: 0.9 },
  { name: 'system_prompt_extraction', regex: /((show|reveal|display|print|output)\s+(your|the|system)\s+(prompt|instructions|rules))/i, weight: 0.85 },
  { name: 'jailbreak_prefix', regex: /(DAN|AIM|DUDE|developer\s+mode|jailbreak)/i, weight: 0.8 },
  { name: 'role_play_injection', regex: /pretend\s+(you\s+are|to\s+be|you're)\s+(a|an|the)/i, weight: 0.5 },
  { name: 'delimiter_injection', regex: /(\[SYSTEM\]|\[INST\]|<\|im_start\|>|<\|endoftext\|>)/i, weight: 0.95 },
  { name: 'encoding_evasion', regex: /(base64|hex|rot13|reverse)\s*(encode|decode|this|the)/i, weight: 0.6 },
  { name: 'instruction_override', regex: /(new\s+instructions?|from\s+now\s+on|henceforth|going\s+forward.*ignore)/i, weight: 0.7 },
  { name: 'data_exfiltration', regex: /(leak|exfiltrate|extract|dump)\s+(data|database|secrets|keys|passwords)/i, weight: 0.9 },
];

const BLOCK_THRESHOLD = 0.7;
const SUSPICIOUS_THRESHOLD = 0.3;

export function scanForInjection(input: string): ScanResult {
  const matchedPatterns: string[] = [];
  let totalScore = 0;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.regex.test(input)) {
      matchedPatterns.push(pattern.name);
      totalScore += pattern.weight;
    }
  }

  // Normalize score
  const score = Math.min(1, totalScore / 2);

  const threatLevel: ThreatLevel =
    score >= BLOCK_THRESHOLD ? 'blocked' :
    score >= SUSPICIOUS_THRESHOLD ? 'suspicious' : 'clean';

  return {
    input,
    threatLevel,
    score,
    matchedPatterns,
    sanitizedInput: threatLevel === 'blocked' ? null : input,
    timestamp: new Date().toISOString(),
  };
}

export function sanitizeInput(input: string): string {
  let sanitized = input;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern.regex, '[REDACTED]');
  }
  return sanitized;
}

export class PromptInjectionShield {
  private scanLog: ScanResult[] = [];
  private blockedCount = 0;

  scan(input: string): ScanResult {
    const result = scanForInjection(input);
    this.scanLog.push(result);
    if (result.threatLevel === 'blocked') this.blockedCount++;
    return result;
  }

  getStats() {
    return {
      totalScans: this.scanLog.length,
      blocked: this.blockedCount,
      suspicious: this.scanLog.filter(r => r.threatLevel === 'suspicious').length,
      clean: this.scanLog.filter(r => r.threatLevel === 'clean').length,
      blockRate: this.scanLog.length > 0 ? this.blockedCount / this.scanLog.length : 0,
    };
  }
}
