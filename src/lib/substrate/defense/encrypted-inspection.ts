/**
 * DEFENSE — Encrypted/Compressed Payload Inspection v1.0.0
 * Handles encrypted, compressed, and multi-layer encoded payloads.
 *
 * Features:
 *  - Base64/hex/URL multi-layer decoding (up to 8 layers)
 *  - Entropy analysis to detect encrypted blobs
 *  - Compression signature detection (gzip, brotli, zstd, lz4)
 *  - Steganography indicator detection
 *  - Polyglot file format detection
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type EncodingLayer = 'base64' | 'hex' | 'url' | 'unicode_escape' | 'html_entity' | 'rot13' | 'reverse' | 'unknown';
export type CompressionFormat = 'gzip' | 'brotli' | 'zstd' | 'lz4' | 'deflate' | 'xz' | 'unknown';

export interface InspectionResult {
  readonly inspected: boolean;
  readonly layers: readonly DecodedLayer[];
  readonly totalLayers: number;
  readonly isEncrypted: boolean;
  readonly isCompressed: boolean;
  readonly compressionFormat: CompressionFormat | null;
  readonly entropy: number;
  readonly entropyVerdict: 'normal' | 'suspicious' | 'encrypted';
  readonly steganographyIndicators: readonly string[];
  readonly polyglotSignatures: readonly string[];
  readonly decodedContent: string | null;    // Only if safe to decode
  readonly riskScore: number;                // 0-100
  readonly budgetExhausted: boolean;
}

export interface DecodedLayer {
  readonly encoding: EncodingLayer;
  readonly depth: number;
  readonly contentLength: number;
  readonly entropyDelta: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_DECODE_LAYERS = 8;
const MAX_CONTENT_SIZE = 256 * 1024; // 256KB
const ENTROPY_SUSPICIOUS = 5.5;
const ENTROPY_ENCRYPTED = 7.0;
const CPU_BUDGET_MS = 50;

// Compression magic bytes (hex)
const COMPRESSION_SIGNATURES: Record<string, CompressionFormat> = {
  '1f8b': 'gzip',
  '425a': 'brotli',
  '28b52ffd': 'zstd',
  '04224d18': 'lz4',
  '7801': 'deflate',
  '789c': 'deflate',
  'fd377a58': 'xz',
};

// Polyglot file signatures
const POLYGLOT_SIGNATURES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /^%PDF.*<script/is, label: 'PDF+HTML polyglot' },
  { pattern: /^GIF8[79]a.*<script/is, label: 'GIF+HTML polyglot' },
  { pattern: /^PK\x03\x04.*<\?php/is, label: 'ZIP+PHP polyglot' },
  { pattern: /^\x89PNG.*<script/is, label: 'PNG+HTML polyglot' },
  { pattern: /^RIFF.*<script/is, label: 'RIFF+HTML polyglot' },
];

// Steganography indicators
const STEGO_INDICATORS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\x00{50,}[^\x00]{10,}/s, label: 'null-padding with hidden data' },
  { pattern: /IEND.*[^\x00]{20,}/s, label: 'data after PNG IEND' },
  { pattern: /%%EOF.*[^\x00]{20,}/s, label: 'data after PDF EOF' },
  { pattern: /\xff\xd9.*[^\x00]{20,}/s, label: 'data after JPEG EOI' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENTROPY CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

function shannonEntropy(data: string): number {
  if (data.length === 0) return 0;
  const freq = new Map<number, number>();
  for (let i = 0; i < data.length; i++) {
    const c = data.charCodeAt(i);
    freq.set(c, (freq.get(c) || 0) + 1);
  }
  let entropy = 0;
  const len = data.length;
  for (const count of freq.values()) {
    const p = count / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECODING
// ═══════════════════════════════════════════════════════════════════════════════

function tryBase64Decode(input: string): string | null {
  if (!/^[A-Za-z0-9+/=\s]{20,}$/.test(input.trim())) return null;
  try {
    const decoded = atob(input.trim().replace(/\s/g, ''));
    // Check if output is printable or binary
    if (decoded.length > 0 && decoded.length < input.length) return decoded;
    return null;
  } catch { return null; }
}

function tryHexDecode(input: string): string | null {
  const cleaned = input.replace(/\s|0x/gi, '');
  if (!/^[0-9a-fA-F]{20,}$/.test(cleaned)) return null;
  if (cleaned.length % 2 !== 0) return null;
  try {
    let result = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      result += String.fromCharCode(parseInt(cleaned.substring(i, i + 2), 16));
    }
    return result;
  } catch { return null; }
}

function tryUrlDecode(input: string): string | null {
  if (!/%[0-9a-fA-F]{2}/.test(input)) return null;
  try {
    const decoded = decodeURIComponent(input);
    return decoded !== input ? decoded : null;
  } catch { return null; }
}

function tryUnicodeEscape(input: string): string | null {
  if (!/\\u[0-9a-fA-F]{4}/.test(input)) return null;
  try {
    const decoded = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)));
    return decoded !== input ? decoded : null;
  } catch { return null; }
}

function tryHtmlEntity(input: string): string | null {
  if (!/&#?[a-zA-Z0-9]+;/.test(input)) return null;
  try {
    const decoded = input
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    return decoded !== input ? decoded : null;
  } catch { return null; }
}

const DECODERS: Array<{ name: EncodingLayer; fn: (input: string) => string | null }> = [
  { name: 'url', fn: tryUrlDecode },
  { name: 'base64', fn: tryBase64Decode },
  { name: 'hex', fn: tryHexDecode },
  { name: 'unicode_escape', fn: tryUnicodeEscape },
  { name: 'html_entity', fn: tryHtmlEntity },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPRESSION DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectCompression(data: string): CompressionFormat | null {
  const hexPrefix = Array.from(data.slice(0, 4))
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

  for (const [sig, format] of Object.entries(COMPRESSION_SIGNATURES)) {
    if (hexPrefix.startsWith(sig)) return format;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE INSPECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inspect a payload for encrypted, compressed, or multi-encoded content.
 */
export function inspectPayload(input: string): InspectionResult {
  const start = performance.now();
  const layers: DecodedLayer[] = [];
  let current = input.slice(0, MAX_CONTENT_SIZE);
  let budgetExhausted = false;

  // Multi-layer decode
  let prevEntropy = shannonEntropy(current);
  for (let depth = 0; depth < MAX_DECODE_LAYERS; depth++) {
    if (performance.now() - start > CPU_BUDGET_MS) {
      budgetExhausted = true;
      break;
    }

    let decoded: string | null = null;
    let encoding: EncodingLayer = 'unknown';

    for (const decoder of DECODERS) {
      const result = decoder.fn(current);
      if (result) {
        decoded = result;
        encoding = decoder.name;
        break;
      }
    }

    if (!decoded || decoded === current) break;

    const newEntropy = shannonEntropy(decoded);
    layers.push({
      encoding,
      depth: depth + 1,
      contentLength: decoded.length,
      entropyDelta: newEntropy - prevEntropy,
    });

    prevEntropy = newEntropy;
    current = decoded;
  }

  // Entropy analysis on final content
  const finalEntropy = shannonEntropy(current);
  let entropyVerdict: InspectionResult['entropyVerdict'] = 'normal';
  if (finalEntropy >= ENTROPY_ENCRYPTED) entropyVerdict = 'encrypted';
  else if (finalEntropy >= ENTROPY_SUSPICIOUS) entropyVerdict = 'suspicious';

  // Compression detection
  const compressionFormat = detectCompression(current);

  // Polyglot detection
  const polyglotSignatures: string[] = [];
  for (const sig of POLYGLOT_SIGNATURES) {
    if (sig.pattern.test(current)) polyglotSignatures.push(sig.label);
  }

  // Steganography detection
  const steganographyIndicators: string[] = [];
  for (const ind of STEGO_INDICATORS) {
    if (ind.pattern.test(current)) steganographyIndicators.push(ind.label);
  }

  // Risk score calculation
  let riskScore = 0;
  riskScore += layers.length * 10;
  if (entropyVerdict === 'encrypted') riskScore += 30;
  else if (entropyVerdict === 'suspicious') riskScore += 15;
  if (compressionFormat) riskScore += 10;
  riskScore += polyglotSignatures.length * 20;
  riskScore += steganographyIndicators.length * 25;
  riskScore = Math.min(100, riskScore);

  return Object.freeze({
    inspected: true,
    layers: Object.freeze(layers),
    totalLayers: layers.length,
    isEncrypted: entropyVerdict === 'encrypted',
    isCompressed: compressionFormat !== null,
    compressionFormat,
    entropy: Math.round(finalEntropy * 100) / 100,
    entropyVerdict,
    steganographyIndicators: Object.freeze(steganographyIndicators),
    polyglotSignatures: Object.freeze(polyglotSignatures),
    decodedContent: layers.length > 0 ? current.slice(0, 200) : null,
    riskScore,
    budgetExhausted,
  });
}

/**
 * Quick entropy check for pre-screening.
 */
export function quickEntropyCheck(input: string): { entropy: number; verdict: InspectionResult['entropyVerdict'] } {
  const entropy = shannonEntropy(input.slice(0, 1024));
  let verdict: InspectionResult['entropyVerdict'] = 'normal';
  if (entropy >= ENTROPY_ENCRYPTED) verdict = 'encrypted';
  else if (entropy >= ENTROPY_SUSPICIOUS) verdict = 'suspicious';
  return { entropy: Math.round(entropy * 100) / 100, verdict };
}
