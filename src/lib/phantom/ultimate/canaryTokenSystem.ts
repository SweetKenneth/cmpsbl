/**
 * PHANTOM Ultimate — Canary Token System
 * Embeds invisible unique markers in data exports.
 * If data leaks, canary tokens identify source, recipient, and timestamp.
 */

export interface CanaryToken {
  id: string;
  exportId: string;
  recipientId: string;
  datasetId: string;
  tokenValue: string;       // unique marker
  embeddingMethod: 'row_injection' | 'field_watermark' | 'ordering_signature' | 'precision_encoding';
  createdAt: number;
  tripped: boolean;
  trippedAt?: number;
  trippedLocation?: string;
}

export interface HoneypotRecord {
  id: string;
  exportId: string;
  recordData: Record<string, unknown>;
  triggerField: string;
  createdAt: number;
  accessed: boolean;
  accessedAt?: number;
}

export interface CanaryStats {
  totalTokens: number;
  activeTokens: number;
  trippedTokens: number;
  honeypotRecords: number;
  accessedHoneypots: number;
}

const MAX_TOKENS = 1000;
const MAX_HONEYPOTS = 500;

const tokens = new Map<string, CanaryToken>();
const honeypots: HoneypotRecord[] = [];

function generateTokenValue(): string {
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    parts.push(Math.random().toString(36).slice(2, 6));
  }
  return `cny_${parts.join('')}`;
}

export function embedCanaryToken(
  exportId: string, recipientId: string, datasetId: string,
  method: CanaryToken['embeddingMethod'] = 'field_watermark'
): CanaryToken {
  const token: CanaryToken = {
    id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    exportId, recipientId, datasetId,
    tokenValue: generateTokenValue(),
    embeddingMethod: method,
    createdAt: Date.now(),
    tripped: false,
  };
  if (tokens.size >= MAX_TOKENS) {
    // Evict oldest non-tripped
    const oldest = [...tokens.values()]
      .filter(t => !t.tripped)
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) tokens.delete(oldest.id);
  }
  tokens.set(token.id, token);
  return token;
}

export function injectHoneypot(
  exportId: string, recordData: Record<string, unknown>, triggerField: string
): HoneypotRecord {
  const hp: HoneypotRecord = {
    id: `hp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    exportId, recordData, triggerField,
    createdAt: Date.now(), accessed: false,
  };
  if (honeypots.length >= MAX_HONEYPOTS) honeypots.shift();
  honeypots.push(hp);
  return hp;
}

export function tripCanary(tokenId: string, location: string): CanaryToken | null {
  const token = tokens.get(tokenId);
  if (!token) return null;
  token.tripped = true;
  token.trippedAt = Date.now();
  token.trippedLocation = location;
  return token;
}

export function detectCanaryInData(data: string): CanaryToken | null {
  for (const token of tokens.values()) {
    if (data.includes(token.tokenValue)) {
      token.tripped = true;
      token.trippedAt = Date.now();
      token.trippedLocation = 'data_scan';
      return token;
    }
  }
  return null;
}

export function reportHoneypotAccess(honeypotId: string): HoneypotRecord | null {
  const hp = honeypots.find(h => h.id === honeypotId);
  if (!hp) return null;
  hp.accessed = true;
  hp.accessedAt = Date.now();
  return hp;
}

export function getCanaryStats(): CanaryStats {
  const all = [...tokens.values()];
  return {
    totalTokens: all.length,
    activeTokens: all.filter(t => !t.tripped).length,
    trippedTokens: all.filter(t => t.tripped).length,
    honeypotRecords: honeypots.length,
    accessedHoneypots: honeypots.filter(h => h.accessed).length,
  };
}

export function resetCanaryState(): void { tokens.clear(); honeypots.length = 0; }
