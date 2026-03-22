/**
 * DEFENSE — Enterprise Payload & Upload Scanner v1.0.0
 * Scans file uploads, API payloads, and user inputs for malicious signatures.
 * Detects: malware patterns, encoded exploits, polyglot files, obfuscated payloads.
 *
 * Architecture:
 *  - Signature-based detection (known patterns)
 *  - Entropy analysis (encrypted/packed payloads)
 *  - Magic byte validation (polyglot detection)
 *  - Encoded payload unwinding (base64, hex, unicode escapes)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ScanVerdict = 'clean' | 'suspicious' | 'malicious' | 'blocked';

export interface ScanResult {
  verdict: ScanVerdict;
  threats: DetectedThreat[];
  entropy: number;
  scanDurationMs: number;
  payloadSizeBytes: number;
  decodingLayers: number;
  metadata: Record<string, unknown>;
}

export interface DetectedThreat {
  id: string;
  category: string;
  severity: ThreatSeverity;
  pattern: string;
  matchedContent: string;   // redacted snippet
  offset: number;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNATURE DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

interface MalwareSignature {
  id: string;
  pattern: RegExp;
  category: string;
  severity: ThreatSeverity;
  description: string;
}

const SIGNATURES: MalwareSignature[] = [
  // Shell/Command execution
  { id: 'MAL-001', pattern: /(?:eval|exec|system|passthru|shell_exec|popen)\s*\(/gi, category: 'remote_code_execution', severity: 'critical', description: 'Remote code execution function call detected' },
  { id: 'MAL-002', pattern: /(?:\/bin\/(?:sh|bash|zsh)|cmd\.exe|powershell)/gi, category: 'shell_access', severity: 'critical', description: 'Direct shell access attempt' },
  { id: 'MAL-003', pattern: /(?:nc|ncat|netcat)\s+-[a-z]*[el]/gi, category: 'reverse_shell', severity: 'critical', description: 'Reverse shell / bind shell attempt' },

  // Web shells
  { id: 'MAL-010', pattern: /(?:c99|r57|b374k|weevely|phpspy|wso)\b/gi, category: 'web_shell', severity: 'critical', description: 'Known web shell signature detected' },
  { id: 'MAL-011', pattern: /\$_(?:GET|POST|REQUEST|COOKIE)\s*\[\s*['"][^'"]+['"]\s*\]\s*\(/gi, category: 'web_shell', severity: 'critical', description: 'PHP web shell pattern — dynamic function call from user input' },

  // Data exfiltration
  { id: 'MAL-020', pattern: /(?:document\.cookie|localStorage\.getItem|sessionStorage)\s*(?:\.|;)/gi, category: 'data_exfiltration', severity: 'high', description: 'Client-side data access for potential exfiltration' },
  { id: 'MAL-021', pattern: /new\s+(?:XMLHttpRequest|WebSocket|EventSource)\s*\(\s*['"`](?:https?:\/\/|wss?:\/\/)/gi, category: 'data_exfiltration', severity: 'high', description: 'Outbound connection to external endpoint' },
  { id: 'MAL-022', pattern: /(?:navigator\.sendBeacon|fetch)\s*\(\s*['"`](?:https?:\/\/)/gi, category: 'data_exfiltration', severity: 'high', description: 'Beacon/fetch exfiltration vector' },

  // Crypto miners
  { id: 'MAL-030', pattern: /(?:coinhive|cryptonight|monero|stratum\+tcp)/gi, category: 'cryptominer', severity: 'high', description: 'Cryptocurrency mining signature' },
  { id: 'MAL-031', pattern: /(?:wasm|WebAssembly)\.(?:instantiate|compile)/gi, category: 'cryptominer', severity: 'medium', description: 'WebAssembly instantiation — potential crypto miner' },

  // Obfuscation patterns
  { id: 'MAL-040', pattern: /(?:String\.fromCharCode|atob|btoa)\s*\(\s*(?:[0-9,\s]+|['"`][A-Za-z0-9+/=]+['"`])\s*\)/gi, category: 'obfuscation', severity: 'medium', description: 'Encoded payload via character code or base64' },
  { id: 'MAL-041', pattern: /\\x[0-9a-f]{2}(?:\\x[0-9a-f]{2}){5,}/gi, category: 'obfuscation', severity: 'medium', description: 'Hex-encoded payload string' },
  { id: 'MAL-042', pattern: /\\u[0-9a-f]{4}(?:\\u[0-9a-f]{4}){5,}/gi, category: 'obfuscation', severity: 'medium', description: 'Unicode-escaped payload string' },
  { id: 'MAL-043', pattern: /(?:unescape|decodeURI(?:Component)?)\s*\(\s*['"`]%[0-9a-f]{2}/gi, category: 'obfuscation', severity: 'medium', description: 'URL-encoded payload decoding' },

  // Ransomware indicators
  { id: 'MAL-050', pattern: /(?:crypto\.createCipher|AES|RSA)\s*(?:\.|,|\()/gi, category: 'ransomware', severity: 'high', description: 'Encryption API usage — potential ransomware' },
  { id: 'MAL-051', pattern: /(?:\.encrypt|\.decrypt)\s*\(/gi, category: 'ransomware', severity: 'medium', description: 'Encrypt/decrypt operation' },

  // Keyloggers
  { id: 'MAL-060', pattern: /addEventListener\s*\(\s*['"`]key(?:down|up|press)['"`]/gi, category: 'keylogger', severity: 'high', description: 'Keyboard event listener — potential keylogger' },
  { id: 'MAL-061', pattern: /(?:onkeydown|onkeyup|onkeypress)\s*=/gi, category: 'keylogger', severity: 'medium', description: 'Inline keyboard event handler' },

  // Supply chain
  { id: 'MAL-070', pattern: /(?:npm|yarn|pnpm)\s+(?:install|add)\s+.*(?:--unsafe-perm|--ignore-scripts=false)/gi, category: 'supply_chain', severity: 'high', description: 'Package installation with disabled security' },
  { id: 'MAL-071', pattern: /postinstall.*(?:curl|wget|fetch)\s/gi, category: 'supply_chain', severity: 'critical', description: 'Post-install script with network access' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAGIC BYTES — Polyglot detection
// ═══════════════════════════════════════════════════════════════════════════════

interface MagicByteSignature {
  extension: string;
  bytes: number[];
  description: string;
  dangerous: boolean;
}

const MAGIC_BYTES: MagicByteSignature[] = [
  { extension: 'exe', bytes: [0x4D, 0x5A], description: 'Windows PE executable', dangerous: true },
  { extension: 'elf', bytes: [0x7F, 0x45, 0x4C, 0x46], description: 'Linux ELF binary', dangerous: true },
  { extension: 'mach-o', bytes: [0xFE, 0xED, 0xFA, 0xCE], description: 'macOS Mach-O binary', dangerous: true },
  { extension: 'mach-o-64', bytes: [0xFE, 0xED, 0xFA, 0xCF], description: 'macOS Mach-O 64-bit binary', dangerous: true },
  { extension: 'class', bytes: [0xCA, 0xFE, 0xBA, 0xBE], description: 'Java class file', dangerous: true },
  { extension: 'dex', bytes: [0x64, 0x65, 0x78, 0x0A], description: 'Android DEX file', dangerous: true },
  { extension: 'zip', bytes: [0x50, 0x4B, 0x03, 0x04], description: 'ZIP archive (may contain executables)', dangerous: false },
  { extension: 'rar', bytes: [0x52, 0x61, 0x72, 0x21], description: 'RAR archive', dangerous: false },
  { extension: '7z', bytes: [0x37, 0x7A, 0xBC, 0xAF], description: '7-Zip archive', dangerous: false },
  { extension: 'pdf', bytes: [0x25, 0x50, 0x44, 0x46], description: 'PDF document', dangerous: false },
  { extension: 'swf', bytes: [0x46, 0x57, 0x53], description: 'Flash SWF (deprecated, dangerous)', dangerous: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENTROPY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/** Shannon entropy — high values indicate encryption/compression/obfuscation */
function calculateEntropy(data: string): number {
  if (data.length === 0) return 0;
  const freq = new Map<number, number>();
  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  let entropy = 0;
  const len = data.length;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 1000) / 1000;
}

// High-entropy thresholds
const ENTROPY_SUSPICIOUS = 5.5;
const ENTROPY_MALICIOUS = 7.0;

// ═══════════════════════════════════════════════════════════════════════════════
// DECODER — Multi-layer payload unwinding
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_DECODE_LAYERS = 5;
const MAX_DECODE_LENGTH = 65_536;

/** Attempt to decode base64 content */
function tryDecodeBase64(input: string): string | null {
  const b64Match = input.match(/[A-Za-z0-9+/]{20,}={0,2}/);
  if (!b64Match) return null;
  try {
    const decoded = atob(b64Match[0]);
    // Only return if decoded is printable or contains recognizable content
    if (decoded.length > 4 && /[\x20-\x7e]{4,}/.test(decoded)) return decoded;
  } catch { /* not valid base64 */ }
  return null;
}

/** Attempt to decode hex content */
function tryDecodeHex(input: string): string | null {
  const hexMatch = input.match(/(?:0x|\\x)?([0-9a-fA-F]{12,})/);
  if (!hexMatch) return null;
  try {
    const hex = hexMatch[1];
    let decoded = '';
    for (let i = 0; i < hex.length - 1; i += 2) {
      decoded += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
    }
    if (decoded.length > 4 && /[\x20-\x7e]{4,}/.test(decoded)) return decoded;
  } catch { /* invalid hex */ }
  return null;
}

/** Recursively unwind encoded payloads */
function unwindPayload(input: string, maxLayers = MAX_DECODE_LAYERS): { content: string; layers: number } {
  let current = input.slice(0, MAX_DECODE_LENGTH);
  let layers = 0;

  for (let i = 0; i < maxLayers; i++) {
    const b64 = tryDecodeBase64(current);
    if (b64) { current = b64; layers++; continue; }

    const hex = tryDecodeHex(current);
    if (hex) { current = hex; layers++; continue; }

    // Try URL decode
    try {
      const urlDecoded = decodeURIComponent(current);
      if (urlDecoded !== current && urlDecoded.length > 4) {
        current = urlDecoded; layers++; continue;
      }
    } catch { /* not url encoded */ }

    break; // No more layers to unwind
  }

  return { content: current, layers };
}

// ═══════════════════════════════════════════════════════════════════════════════
// POLYGLOT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectPolyglot(content: string, declaredMimeType?: string): DetectedThreat[] {
  const threats: DetectedThreat[] = [];
  const bytes: number[] = [];

  // Convert first 16 chars to byte values
  for (let i = 0; i < Math.min(content.length, 16); i++) {
    bytes.push(content.charCodeAt(i));
  }

  for (const sig of MAGIC_BYTES) {
    if (sig.bytes.length > bytes.length) continue;
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (bytes[i] !== sig.bytes[i]) { match = false; break; }
    }
    if (match) {
      // Check if declared type contradicts detected type
      const isPolyglot = declaredMimeType && !declaredMimeType.includes(sig.extension);

      threats.push({
        id: `PLG-${sig.extension.toUpperCase()}`,
        category: isPolyglot ? 'polyglot_file' : 'binary_detected',
        severity: sig.dangerous ? 'critical' : isPolyglot ? 'high' : 'info',
        pattern: `magic_bytes:${sig.extension}`,
        matchedContent: `[${sig.bytes.map(b => b.toString(16)).join(' ')}]`,
        offset: 0,
        description: isPolyglot
          ? `Polyglot file: declared as ${declaredMimeType} but contains ${sig.description}`
          : sig.dangerous
            ? `Dangerous binary detected: ${sig.description}`
            : sig.description,
      });
    }
  }

  return threats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCANNER
// ═══════════════════════════════════════════════════════════════════════════════

export interface ScanOptions {
  maxPayloadBytes?: number;
  enableEntropy?: boolean;
  enablePolyglot?: boolean;
  enableDecoding?: boolean;
  declaredMimeType?: string;
  source?: string;
}

const DEFAULT_OPTIONS: Required<ScanOptions> = {
  maxPayloadBytes: 5_242_880, // 5MB
  enableEntropy: true,
  enablePolyglot: true,
  enableDecoding: true,
  declaredMimeType: '',
  source: 'unknown',
};

/**
 * Scan a payload for malware signatures, encoded exploits, and polyglot files.
 * Returns a structured ScanResult with verdict and detected threats.
 */
export function scanPayload(payload: string, options?: ScanOptions): ScanResult {
  const start = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const threats: DetectedThreat[] = [];

  // Size check
  const sizeBytes = new Blob([payload]).size;
  if (sizeBytes > opts.maxPayloadBytes) {
    threats.push({
      id: 'SIZE-001', category: 'oversized_payload', severity: 'high',
      pattern: 'size_limit', matchedContent: `${sizeBytes} bytes`,
      offset: 0, description: `Payload exceeds ${opts.maxPayloadBytes} byte limit`,
    });
  }

  // Phase 1: Polyglot detection
  if (opts.enablePolyglot) {
    threats.push(...detectPolyglot(payload, opts.declaredMimeType || undefined));
  }

  // Phase 2: Decode layers
  let scanContent = payload;
  let decodingLayers = 0;
  if (opts.enableDecoding) {
    const unwound = unwindPayload(payload);
    scanContent = unwound.content;
    decodingLayers = unwound.layers;
    if (decodingLayers >= 3) {
      threats.push({
        id: 'ENC-001', category: 'deep_encoding', severity: 'high',
        pattern: `${decodingLayers}_encoding_layers`,
        matchedContent: `${decodingLayers} layers unwound`,
        offset: 0, description: `Payload was encoded ${decodingLayers} layers deep — likely evasion attempt`,
      });
    }
  }

  // Phase 3: Signature scan (on both original + decoded)
  const targets = decodingLayers > 0 ? [payload, scanContent] : [payload];
  for (const target of targets) {
    for (const sig of SIGNATURES) {
      sig.pattern.lastIndex = 0; // reset for global regexes
      const match = sig.pattern.exec(target);
      if (match) {
        // Avoid duplicate threat IDs
        if (!threats.some(t => t.id === sig.id)) {
          threats.push({
            id: sig.id,
            category: sig.category,
            severity: sig.severity,
            pattern: sig.pattern.source.slice(0, 50),
            matchedContent: redactMatch(match[0]),
            offset: match.index,
            description: sig.description,
          });
        }
      }
    }
  }

  // Phase 4: Entropy analysis
  let entropy = 0;
  if (opts.enableEntropy) {
    entropy = calculateEntropy(scanContent);
    if (entropy >= ENTROPY_MALICIOUS) {
      threats.push({
        id: 'ENT-001', category: 'high_entropy', severity: 'high',
        pattern: 'shannon_entropy', matchedContent: `entropy=${entropy}`,
        offset: 0, description: `Extremely high entropy (${entropy}) — likely encrypted/packed malicious payload`,
      });
    } else if (entropy >= ENTROPY_SUSPICIOUS) {
      threats.push({
        id: 'ENT-002', category: 'elevated_entropy', severity: 'medium',
        pattern: 'shannon_entropy', matchedContent: `entropy=${entropy}`,
        offset: 0, description: `Elevated entropy (${entropy}) — possible obfuscation`,
      });
    }
  }

  // Determine verdict
  const hasCritical = threats.some(t => t.severity === 'critical');
  const hasHigh = threats.some(t => t.severity === 'high');
  const hasMedium = threats.some(t => t.severity === 'medium');

  let verdict: ScanVerdict = 'clean';
  if (hasCritical) verdict = 'blocked';
  else if (hasHigh) verdict = 'malicious';
  else if (hasMedium) verdict = 'suspicious';

  return {
    verdict,
    threats,
    entropy,
    scanDurationMs: Math.round(performance.now() - start),
    payloadSizeBytes: sizeBytes,
    decodingLayers,
    metadata: { source: opts.source, signaturesChecked: SIGNATURES.length },
  };
}

/**
 * Quick scan — lightweight check for most common threats only
 */
export function quickScan(payload: string): ScanVerdict {
  const criticalSigs = SIGNATURES.filter(s => s.severity === 'critical');
  for (const sig of criticalSigs) {
    sig.pattern.lastIndex = 0;
    if (sig.pattern.test(payload)) return 'blocked';
  }
  const entropy = calculateEntropy(payload.slice(0, 4096));
  if (entropy >= ENTROPY_MALICIOUS) return 'malicious';
  return 'clean';
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Redact matched content — show first/last 4 chars only */
function redactMatch(content: string): string {
  if (content.length <= 12) return content;
  return `${content.slice(0, 4)}...${content.slice(-4)}`;
}

/** Get scanner stats */
export function getScannerStats() {
  return {
    totalSignatures: SIGNATURES.length,
    magicByteSignatures: MAGIC_BYTES.length,
    categories: [...new Set(SIGNATURES.map(s => s.category))],
    maxDecodeDepth: MAX_DECODE_LAYERS,
    entropyThresholds: { suspicious: ENTROPY_SUSPICIOUS, malicious: ENTROPY_MALICIOUS },
  };
}
