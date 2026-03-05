/**
 * Multi-Anchor Head Storage — Redundant chain head persistence
 */

export interface ChainAnchor {
  anchor_id: string;
  head_hash: string;
  receipt_count: number;
  anchored_at: string;
  store: 'primary' | 'redundant';
}

// In-memory anchors (primary + redundant)
const anchors = new Map<string, ChainAnchor>();

/** Store a chain head in both primary and redundant anchors */
export function anchorHead(headHash: string, receiptCount: number): ChainAnchor[] {
  const now = new Date().toISOString();
  const primary: ChainAnchor = {
    anchor_id: crypto.randomUUID(),
    head_hash: headHash,
    receipt_count: receiptCount,
    anchored_at: now,
    store: 'primary',
  };
  const redundant: ChainAnchor = {
    anchor_id: crypto.randomUUID(),
    head_hash: headHash,
    receipt_count: receiptCount,
    anchored_at: now,
    store: 'redundant',
  };

  anchors.set('primary', primary);
  anchors.set('redundant', redundant);

  return [primary, redundant];
}

/** Verify anchor consistency */
export function verifyAnchors(): { consistent: boolean; primary: ChainAnchor | null; redundant: ChainAnchor | null } {
  const primary = anchors.get('primary') ?? null;
  const redundant = anchors.get('redundant') ?? null;

  if (!primary || !redundant) {
    return { consistent: primary === null && redundant === null, primary, redundant };
  }

  return {
    consistent: primary.head_hash === redundant.head_hash && primary.receipt_count === redundant.receipt_count,
    primary,
    redundant,
  };
}

/** Get current head hash */
export function getHeadHash(): string | null {
  return anchors.get('primary')?.head_hash ?? null;
}

/** Get anchor count */
export function getAnchorCount(): number {
  return anchors.size;
}
