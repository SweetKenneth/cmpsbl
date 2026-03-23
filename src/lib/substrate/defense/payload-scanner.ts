/**
 * DEFENSE — Enterprise Payload & Upload Scanner v2.0.0 (Hardened)
 * Scans file uploads, API payloads, and user inputs for malicious signatures.
 * Detects: malware patterns, encoded exploits, polyglot files, obfuscated payloads.
 *
 * v2.0.0 Hardening:
 *  - Anti-evasion: null-byte stripping, Unicode normalization, comment removal
 *  - Frozen immutable results (no post-scan tampering)
 *  - Pre-indexed critical signatures for O(1) quickScan
 *  - Double-scan: original + every decoded layer individually
 *  - Scan audit trail with monotonic IDs
 *  - Resource-bounded: CPU time budget per scan
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ScanVerdict = 'clean' | 'suspicious' | 'malicious' | 'blocked';

export interface ScanResult {
  readonly scanId: string;
  readonly verdict: ScanVerdict;
  readonly threats: readonly DetectedThreat[];
  readonly entropy: number;
  readonly scanDurationMs: number;
  readonly payloadSizeBytes: number;
  readonly decodingLayers: number;
  readonly normalizationApplied: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface DetectedThreat {
  readonly id: string;
  readonly category: string;
  readonly severity: ThreatSeverity;
  readonly pattern: string;
  readonly matchedContent: string;
  readonly offset: number;
  readonly description: string;
  readonly layer: number;  // which decoding layer triggered this
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

  // v2.0.0 — Additional hardened signatures
  { id: 'MAL-080', pattern: /(?:process\.env|require\s*\(\s*['"]child_process)/gi, category: 'environment_access', severity: 'high', description: 'Process environment or child process access' },
  { id: 'MAL-081', pattern: /(?:fs\.(?:readFile|writeFile|unlink|rmdir)|require\s*\(\s*['"]fs)/gi, category: 'filesystem_access', severity: 'high', description: 'Filesystem read/write/delete attempt' },
  { id: 'MAL-082', pattern: /(?:import\s*\(\s*['"`](?:https?:|data:))/gi, category: 'dynamic_import', severity: 'high', description: 'Dynamic import from remote URL or data URI' },
  { id: 'MAL-083', pattern: /(?:Reflect\.(?:apply|construct|defineProperty)|Proxy\s*\()/gi, category: 'meta_programming', severity: 'medium', description: 'Metaprogramming API — potential evasion technique' },
  { id: 'MAL-084', pattern: /(?:with\s*\(|(?:void|delete)\s+\w+\.\w+)/gi, category: 'scope_manipulation', severity: 'medium', description: 'Scope manipulation via with/void/delete' },
  { id: 'MAL-090', pattern: /(?:new\s+Function\s*\(|setTimeout\s*\(\s*['"`])/gi, category: 'code_generation', severity: 'high', description: 'Dynamic code generation via Function constructor or string eval' },
  { id: 'MAL-091', pattern: /(?:window\[['"`]|globalThis\[['"`]|self\[['"`])/gi, category: 'bracket_access', severity: 'medium', description: 'Global object bracket notation access — evasion technique' },
];

// Pre-index critical signatures for O(1) quickScan
const CRITICAL_SIGNATURES = SIGNATURES.filter(s => s.severity === 'critical');

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
  // v2.0.0 — additional signatures
  { extension: 'dll', bytes: [0x4D, 0x5A], description: 'Windows DLL (PE format)', dangerous: true },
  { extension: 'wasm', bytes: [0x00, 0x61, 0x73, 0x6D], description: 'WebAssembly binary', dangerous: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-EVASION NORMALIZER
// ═══════════════════════════════════════════════════════════════════════════════

interface NormalizationResult {
  content: string;
  techniques: string[];
}

/**
 * Normalize input to defeat common evasion techniques.
 * Applied BEFORE signature matching for maximum detection.
 */
function normalizeForScan(input: string): NormalizationResult {
  const techniques: string[] = [];
  let content = input;

  // 1. Strip null bytes (common WAF bypass)
  if (content.includes('\0') || content.includes('\x00')) {
    content = content.replace(/\0|\x00/g, '');
    techniques.push('null_byte_strip');
  }

  // 2. Unicode normalization (defeats homoglyph attacks)
  try {
    const normalized = content.normalize('NFKC');
    if (normalized !== content) {
      content = normalized;
      techniques.push('unicode_nfkc');
    }
  } catch { /* ignore normalization failures */ }

  // 3. Strip inline comments from code payloads (evasion: sel/**/ect)
  const commentStripped = content.replace(/\/\*.*?\*\//gs, '');
  if (commentStripped !== content) {
    content = commentStripped;
    techniques.push('comment_strip');
  }

  // 4. Collapse excessive whitespace (evasion: S  E  L  E  C  T)
  const collapsed = content.replace(/\s{3,}/g, ' ');
  if (collapsed !== content) {
    content = collapsed;
    techniques.push('whitespace_collapse');
  }

  // 5. Decode HTML entities (evasion: &#x3C;script&#x3E;)
  if (/&#x?[0-9a-f]+;/i.test(content)) {
    content = content
      .replace(/&#x([0-9a-f]{1,4});/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d{1,5});/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
    techniques.push('html_entity_decode');
  }

  return { content, techniques };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTROPY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/** Shannon entropy — high values indicate encryption/compression/obfuscation */
function calculateEntropy(data: string): number {
  if (data.length === 0) return 0;
  const freq = new Uint32Array(256);
  for (let i = 0; i < data.length; i++) {
    freq[data.charCodeAt(i) & 0xFF]++;
  }
  let entropy = 0;
  const len = data.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] === 0) continue;
    const p = freq[i] / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 1000) / 1000;
}

const ENTROPY_SUSPICIOUS = 5.5;
const ENTROPY_MALICIOUS = 7.0;

// ═══════════════════════════════════════════════════════════════════════════════
// DECODER — Multi-layer payload unwinding
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_DECODE_LAYERS = 5;
const MAX_DECODE_LENGTH = 65_536;

function tryDecodeBase64(input: string): string | null {
  const b64Match = input.match(/[A-Za-z0-9+/]{20,}={0,2}/);
  if (!b64Match) return null;
  try {
    const decoded = atob(b64Match[0]);
    if (decoded.length > 4 && /[\x20-\x7e]{4,}/.test(decoded)) return decoded;
  } catch { /* not valid base64 */ }
  return null;
}

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

/** Recursively unwind encoded payloads, returning each intermediate layer */
function unwindPayload(input: string, maxLayers = MAX_DECODE_LAYERS): { layers: string[]; finalContent: string } {
  let current = input.slice(0, MAX_DECODE_LENGTH);
  const layers: string[] = [current];

  for (let i = 0; i < maxLayers; i++) {
    const b64 = tryDecodeBase64(current);
    if (b64) { current = b64; layers.push(current); continue; }

    const hex = tryDecodeHex(current);
    if (hex) { current = hex; layers.push(current); continue; }

    try {
      const urlDecoded = decodeURIComponent(current);
      if (urlDecoded !== current && urlDecoded.length > 4) {
        current = urlDecoded; layers.push(current); continue;
      }
    } catch { /* not url encoded */ }

    break;
  }

  return { layers, finalContent: current };
}

// ═══════════════════════════════════════════════════════════════════════════════
// POLYGLOT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectPolyglot(content: string, declaredMimeType?: string): DetectedThreat[] {
  const threats: DetectedThreat[] = [];
  const bytes: number[] = [];

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
        layer: 0,
      });
    }
  }

  return threats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCAN AUDIT TRAIL
// ═══════════════════════════════════════════════════════════════════════════════

let scanSequence = 0;
const SCAN_HISTORY_MAX = 500;
const scanAuditTrail: Array<{ scanId: string; verdict: ScanVerdict; threatCount: number; ts: number }> = [];

function nextScanId(): string {
  return `SCN-${Date.now().toString(36)}-${(++scanSequence).toString(36)}`;
}

function recordScanAudit(scanId: string, verdict: ScanVerdict, threatCount: number): void {
  scanAuditTrail.push({ scanId, verdict, threatCount, ts: Date.now() });
  if (scanAuditTrail.length > SCAN_HISTORY_MAX) {
    scanAuditTrail.splice(0, scanAuditTrail.length - SCAN_HISTORY_MAX);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCANNER
// ═══════════════════════════════════════════════════════════════════════════════

export interface ScanOptions {
  maxPayloadBytes?: number;
  enableEntropy?: boolean;
  enablePolyglot?: boolean;
  enableDecoding?: boolean;
  enableNormalization?: boolean;
  declaredMimeType?: string;
  source?: string;
  cpuBudgetMs?: number;
}

const DEFAULT_OPTIONS: Required<ScanOptions> = {
  maxPayloadBytes: 5_242_880,
  enableEntropy: true,
  enablePolyglot: true,
  enableDecoding: true,
  enableNormalization: true,
  declaredMimeType: '',
  source: 'unknown',
  cpuBudgetMs: 50,
};

/**
 * Scan a payload for malware signatures, encoded exploits, and polyglot files.
 * Returns a frozen, immutable ScanResult with verdict and detected threats.
 */
export function scanPayload(payload: string, options?: ScanOptions): ScanResult {
  const start = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const scanId = nextScanId();
  const threats: DetectedThreat[] = [];
  const normalizationApplied: string[] = [];

  // Size check
  const sizeBytes = new Blob([payload]).size;
  if (sizeBytes > opts.maxPayloadBytes) {
    threats.push({
      id: 'SIZE-001', category: 'oversized_payload', severity: 'high',
      pattern: 'size_limit', matchedContent: `${sizeBytes} bytes`,
      offset: 0, description: `Payload exceeds ${opts.maxPayloadBytes} byte limit`, layer: 0,
    });
  }

  // Phase 0: Anti-evasion normalization
  let normalizedPayload = payload;
  if (opts.enableNormalization) {
    const norm = normalizeForScan(payload);
    normalizedPayload = norm.content;
    normalizationApplied.push(...norm.techniques);
  }

  // Phase 1: Polyglot detection
  if (opts.enablePolyglot) {
    threats.push(...detectPolyglot(normalizedPayload, opts.declaredMimeType || undefined));
  }

  // Phase 2: Decode layers (scan EVERY layer, not just final)
  const allLayers: Array<{ content: string; layer: number }> = [{ content: normalizedPayload, layer: 0 }];
  let decodingLayers = 0;
  if (opts.enableDecoding) {
    const unwound = unwindPayload(normalizedPayload);
    decodingLayers = unwound.layers.length - 1;
    for (let i = 1; i < unwound.layers.length; i++) {
      allLayers.push({ content: unwound.layers[i], layer: i });
      // Normalize each decoded layer too
      if (opts.enableNormalization) {
        const layerNorm = normalizeForScan(unwound.layers[i]);
        if (layerNorm.techniques.length > 0) {
          allLayers.push({ content: layerNorm.content, layer: i });
        }
      }
    }
    if (decodingLayers >= 3) {
      threats.push({
        id: 'ENC-001', category: 'deep_encoding', severity: 'high',
        pattern: `${decodingLayers}_encoding_layers`,
        matchedContent: `${decodingLayers} layers unwound`,
        offset: 0, description: `Payload was encoded ${decodingLayers} layers deep — likely evasion attempt`, layer: 0,
      });
    }
  }

  // Phase 3: Signature scan on ALL layers (with CPU budget guard)
  const seenIds = new Set<string>();
  for (const { content: target, layer } of allLayers) {
    if (performance.now() - start > opts.cpuBudgetMs) break; // CPU budget guard
    for (const sig of SIGNATURES) {
      if (seenIds.has(sig.id)) continue;
      sig.pattern.lastIndex = 0;
      const match = sig.pattern.exec(target);
      if (match) {
        seenIds.add(sig.id);
        threats.push({
          id: sig.id, category: sig.category, severity: sig.severity,
          pattern: sig.pattern.source.slice(0, 50),
          matchedContent: redactMatch(match[0]),
          offset: match.index, description: sig.description, layer,
        });
      }
    }
  }

  // Phase 4: Entropy analysis on final decoded content
  let entropy = 0;
  if (opts.enableEntropy) {
    const entropyTarget = allLayers[allLayers.length - 1].content;
    entropy = calculateEntropy(entropyTarget);
    if (entropy >= ENTROPY_MALICIOUS) {
      threats.push({
        id: 'ENT-001', category: 'high_entropy', severity: 'high',
        pattern: 'shannon_entropy', matchedContent: `entropy=${entropy}`,
        offset: 0, description: `Extremely high entropy (${entropy}) — likely encrypted/packed malicious payload`, layer: allLayers.length - 1,
      });
    } else if (entropy >= ENTROPY_SUSPICIOUS) {
      threats.push({
        id: 'ENT-002', category: 'elevated_entropy', severity: 'medium',
        pattern: 'shannon_entropy', matchedContent: `entropy=${entropy}`,
        offset: 0, description: `Elevated entropy (${entropy}) — possible obfuscation`, layer: allLayers.length - 1,
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

  // Boost verdict if evasion was detected (normalization applied + threats found)
  if (normalizationApplied.length >= 2 && threats.length > 0 && verdict === 'suspicious') {
    verdict = 'malicious';
  }

  recordScanAudit(scanId, verdict, threats.length);

  // Return FROZEN result — prevents post-scan tampering
  const result: ScanResult = Object.freeze({
    scanId,
    verdict,
    threats: Object.freeze(threats.map(t => Object.freeze(t))),
    entropy,
    scanDurationMs: Math.round(performance.now() - start),
    payloadSizeBytes: sizeBytes,
    decodingLayers,
    normalizationApplied: Object.freeze(normalizationApplied),
    metadata: Object.freeze({
      source: opts.source,
      signaturesChecked: SIGNATURES.length,
      layersScanned: allLayers.length,
      cpuBudgetMs: opts.cpuBudgetMs,
    }),
  });

  return result;
}

/**
 * Quick scan — lightweight check for most common threats only.
 * Uses pre-indexed critical signatures for speed.
 */
export function quickScan(payload: string): ScanVerdict {
  // Normalize first
  const { content } = normalizeForScan(payload);
  for (const sig of CRITICAL_SIGNATURES) {
    sig.pattern.lastIndex = 0;
    if (sig.pattern.test(content)) return 'blocked';
  }
  const entropy = calculateEntropy(content.slice(0, 4096));
  if (entropy >= ENTROPY_MALICIOUS) return 'malicious';
  if (entropy >= ENTROPY_SUSPICIOUS) return 'suspicious';
  return 'clean';
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function redactMatch(content: string): string {
  if (content.length <= 12) return content;
  return `${content.slice(0, 4)}...${content.slice(-4)}`;
}

export function getScannerStats() {
  return {
    version: '2.0.0',
    totalSignatures: SIGNATURES.length,
    criticalSignatures: CRITICAL_SIGNATURES.length,
    magicByteSignatures: MAGIC_BYTES.length,
    categories: [...new Set(SIGNATURES.map(s => s.category))],
    maxDecodeDepth: MAX_DECODE_LAYERS,
    entropyThresholds: { suspicious: ENTROPY_SUSPICIOUS, malicious: ENTROPY_MALICIOUS },
    scanAuditSize: scanAuditTrail.length,
    recentVerdicts: scanAuditTrail.slice(-10).map(a => a.verdict),
  };
}

export function getScanAuditTrail(limit = 50) {
  return scanAuditTrail.slice(-limit);
}
