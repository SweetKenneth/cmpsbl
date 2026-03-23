/**
 * CMPSBL® MEMORY — Tiered Compression Codebook
 * Domain-specific compression codebooks for each memory tier.
 *
 * Each codebook contains frequently-occurring patterns for its domain,
 * enabling higher compression ratios than generic text compression.
 *
 * Codebook types:
 * - Code patterns (function signatures, imports, error messages)
 * - Architecture terms (node names, resolver patterns, mesh signals)
 * - Error signatures (stack traces, error codes, status patterns)
 * - General (common English phrases, filler removal)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CodebookEntry {
  pattern: string;     // the full text pattern
  token: string;       // the compressed replacement token
  frequency: number;   // usage count
  domain: string;
}

export interface CompressionResult {
  original: string;
  compressed: string;
  ratio: number;       // compressed/original size
  codebookHits: number;
  bytesaved: number;
}

export interface CodebookStats {
  totalEntries: number;
  byDomain: Record<string, number>;
  avgCompressionRatio: number;
  totalBytesSaved: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CODEBOOKS
// ═══════════════════════════════════════════════════════════════════════════════

const CODE_CODEBOOK: Array<[string, string]> = [
  ['import { supabase } from', '⌁SUP'],
  ['@/integrations/supabase/client', '⌁SPC'],
  ['export async function', '⌁EAF'],
  ['export function', '⌁EF'],
  ['export interface', '⌁EI'],
  ['export const', '⌁EC'],
  ['async function', '⌁AF'],
  ['const { data, error }', '⌁DE'],
  ['console.error', '⌁CE'],
  ['console.log', '⌁CL'],
  ['try { } catch', '⌁TC'],
  ['Promise.all', '⌁PA'],
  ['Promise.allSettled', '⌁PAS'],
  ['.select(', '⌁SEL'],
  ['.insert(', '⌁INS'],
  ['.update(', '⌁UPD'],
  ['.delete(', '⌁DEL'],
  ['.from(', '⌁FRM'],
  ['.order(', '⌁ORD'],
  ['.limit(', '⌁LIM'],
  ['Record<string, any>', '⌁RSA'],
  ['Record<string, unknown>', '⌁RSU'],
  ['Promise<void>', '⌁PV'],
  ['number | null', '⌁NN'],
  ['string | null', '⌁SN'],
  ['boolean | null', '⌁BN'],
];

const ARCHITECTURE_CODEBOOK: Array<[string, string]> = [
  ['brain_memory_hot', '⌂BMH'],
  ['brain_memory_warm', '⌂BMW'],
  ['brain_memory_cold', '⌂BMC'],
  ['brain_memory_archive', '⌂BMA'],
  ['mesh_comms', '⌂MC'],
  ['intent_receipts', '⌂IR'],
  ['memory_stream', '⌂MS'],
  ['resolver_registry', '⌂RR'],
  ['artifact_registry', '⌂AR'],
  ['cognitive_registry', '⌂CR'],
  ['broadcastIntent', '⌂BI'],
  ['value_score', '⌂VS'],
  ['access_count', '⌂AC'],
  ['source_module', '⌂SM'],
  ['created_at', '⌂CA'],
  ['updated_at', '⌂UA'],
  ['ascending: false', '⌂DF'],
  ['ascending: true', '⌂AT'],
];

const ERROR_CODEBOOK: Array<[string, string]> = [
  ['TypeError: Cannot read properties of', '⌀TR'],
  ['TypeError: Cannot read property', '⌀TRP'],
  ['ReferenceError:', '⌀RE'],
  ['SyntaxError:', '⌀SE'],
  ['Error: Network request failed', '⌀NF'],
  ['Error: PGRST', '⌀PG'],
  ['status code 400', '⌀400'],
  ['status code 401', '⌀401'],
  ['status code 403', '⌀403'],
  ['status code 404', '⌀404'],
  ['status code 500', '⌀500'],
  ['CORS policy', '⌀CRS'],
  ['timeout exceeded', '⌀TO'],
  ['connection refused', '⌀CR'],
  ['undefined is not a function', '⌀UNF'],
  ['null is not an object', '⌀NNO'],
];

const GENERAL_CODEBOOK: Array<[string, string]> = [
  ['implementation', '⊕impl'],
  ['configuration', '⊕conf'],
  ['authentication', '⊕auth'],
  ['authorization', '⊕authz'],
  ['optimization', '⊕opt'],
  ['performance', '⊕perf'],
  ['functionality', '⊕func'],
  ['successfully', '⊕succ'],
  ['automatically', '⊕auto'],
  ['documentation', '⊕doc'],
  ['infrastructure', '⊕infra'],
  ['architecture', '⊕arch'],
  ['environment', '⊕env'],
  ['development', '⊕dev'],
  ['application', '⊕app'],
  ['initialized', '⊕init'],
  ['subscription', '⊕sub'],
  ['notification', '⊕notif'],
  ['dependencies', '⊕deps'],
  ['maintenance', '⊕maint'],
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

type CodebookDomain = 'code' | 'architecture' | 'error' | 'general';

const DOMAIN_CODEBOOKS: Record<CodebookDomain, Array<[string, string]>> = {
  code: CODE_CODEBOOK,
  architecture: ARCHITECTURE_CODEBOOK,
  error: ERROR_CODEBOOK,
  general: GENERAL_CODEBOOK,
};

class CompressionCodebookEngine {
  private stats = { compressions: 0, totalBytesSaved: 0, totalRatio: 0 };
  private customEntries = new Map<string, string>(); // learned patterns

  /**
   * Compress content using domain-appropriate codebooks.
   * Automatically detects applicable domains.
   */
  compress(content: string, forceDomains?: CodebookDomain[]): CompressionResult {
    const domains = forceDomains || this.detectDomains(content);
    let compressed = content;
    let hits = 0;

    // Apply codebooks in order: specific → general
    for (const domain of domains) {
      const codebook = DOMAIN_CODEBOOKS[domain];
      if (!codebook) continue;

      for (const [pattern, token] of codebook) {
        if (compressed.includes(pattern)) {
          compressed = compressed.split(pattern).join(token);
          hits++;
        }
      }
    }

    // Apply custom learned patterns
    for (const [pattern, token] of this.customEntries) {
      if (compressed.includes(pattern)) {
        compressed = compressed.split(pattern).join(token);
        hits++;
      }
    }

    const ratio = content.length > 0 ? compressed.length / content.length : 1;
    const saved = content.length - compressed.length;

    this.stats.compressions++;
    this.stats.totalBytesSaved += Math.max(0, saved);
    this.stats.totalRatio += ratio;

    return { original: content, compressed, ratio, codebookHits: hits, bytesaved: Math.max(0, saved) };
  }

  /**
   * Decompress content by reversing codebook tokens.
   */
  decompress(compressed: string): string {
    let result = compressed;

    // Reverse all codebooks
    for (const codebook of Object.values(DOMAIN_CODEBOOKS)) {
      for (const [pattern, token] of codebook) {
        if (result.includes(token)) {
          result = result.split(token).join(pattern);
        }
      }
    }

    // Reverse custom patterns
    for (const [pattern, token] of this.customEntries) {
      if (result.includes(token)) {
        result = result.split(token).join(pattern);
      }
    }

    return result;
  }

  /**
   * Learn a new compression pattern from repeated content.
   */
  learnPattern(pattern: string, minLength: number = 10): boolean {
    if (pattern.length < minLength) return false;
    if (this.customEntries.has(pattern)) return false;

    // Generate a unique token
    const token = `⊗${this.customEntries.size.toString(36)}`;
    this.customEntries.set(pattern, token);
    return true;
  }

  /**
   * Auto-detect which codebook domains apply to content.
   */
  private detectDomains(content: string): CodebookDomain[] {
    const domains: CodebookDomain[] = ['general']; // always apply general

    if (content.includes('import ') || content.includes('export ') || content.includes('function ') || content.includes('const ')) {
      domains.unshift('code');
    }
    if (content.includes('brain_') || content.includes('mesh_') || content.includes('memory_') || content.includes('Intent')) {
      domains.unshift('architecture');
    }
    if (content.includes('Error') || content.includes('error') || content.includes('status code') || content.includes('TypeError')) {
      domains.unshift('error');
    }

    return domains;
  }

  getStats(): CodebookStats {
    const byDomain: Record<string, number> = {};
    for (const [domain, codebook] of Object.entries(DOMAIN_CODEBOOKS)) {
      byDomain[domain] = codebook.length;
    }
    byDomain['custom'] = this.customEntries.size;

    return {
      totalEntries: Object.values(DOMAIN_CODEBOOKS).reduce((s, c) => s + c.length, 0) + this.customEntries.size,
      byDomain,
      avgCompressionRatio: this.stats.compressions > 0 ? this.stats.totalRatio / this.stats.compressions : 1,
      totalBytesSaved: this.stats.totalBytesSaved,
    };
  }

  clear(): void {
    this.customEntries.clear();
    this.stats = { compressions: 0, totalBytesSaved: 0, totalRatio: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: CompressionCodebookEngine | null = null;

export function getCompressionCodebook(): CompressionCodebookEngine {
  if (!_engine) _engine = new CompressionCodebookEngine();
  return _engine;
}

export function resetCompressionCodebook(): void {
  _engine = null;
}
