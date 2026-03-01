/**
 * INTENT Communication Hub
 * Central inbound receiver for all node proposals, requests, and signals.
 * 
 * Every node in the substrate routes outbound communication through INTENT.
 * INTENT collects, prioritizes, translates to human-readable language,
 * and surfaces them in ATLAS for human review and approval.
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NodeMessage {
  id: string;
  sourceNode: string;           // Which module sent this (ENGINEER, BRAIN, DEFENSE, etc.)
  sourceCodename: string;       // Codename of the sender
  messageType: 'proposal' | 'request' | 'alert' | 'report' | 'need' | 'question';
  priority: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;                // Short summary
  humanSummary: string;         // Plain language explanation a non-tech person can understand
  technicalDetail: string;      // Technical detail for deep inspection
  impact: string;               // What happens if approved/ignored
  actionRequired: boolean;      // Does this need human approval?
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'expired' | 'auto_resolved';
  reviewerNote?: string;        // Human's reply
  createdAt: number;
  reviewedAt?: number;
  expiresAt: number;
  tags: string[];
  relatedProposalId?: string;   // Link to original proposal (e.g. ENGINEER proposal ID)
}

export interface IntentHubStats {
  totalMessages: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  expiredCount: number;
  byNode: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  avgResponseTimeMs: number;
}

// ─── State ─────────────────────────────────────────────────────────────────

const inbox: NodeMessage[] = [];
const MAX_INBOX = 500;

// ─── Core Operations ───────────────────────────────────────────────────────

export function submitToIntent(
  sourceNode: string,
  sourceCodename: string,
  messageType: NodeMessage['messageType'],
  priority: NodeMessage['priority'],
  title: string,
  humanSummary: string,
  technicalDetail: string,
  impact: string,
  actionRequired: boolean,
  tags: string[] = [],
  relatedProposalId?: string,
  ttlMs: number = 24 * 60 * 60 * 1000, // 24h default
): NodeMessage {
  const msg: NodeMessage = {
    id: `intent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sourceNode, sourceCodename, messageType, priority,
    title, humanSummary, technicalDetail, impact,
    actionRequired, status: 'pending', tags,
    relatedProposalId,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };
  inbox.push(msg);
  if (inbox.length > MAX_INBOX) inbox.splice(0, inbox.length - MAX_INBOX);

  // Auto-expire old messages
  expireOldMessages();

  return msg;
}

export function getPendingMessages(): NodeMessage[] {
  expireOldMessages();
  return inbox.filter(m => m.status === 'pending').sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || b.createdAt - a.createdAt;
  });
}

export function getAllMessages(limit = 50): NodeMessage[] {
  return inbox.slice(-limit);
}

export function getMessagesByNode(node: string): NodeMessage[] {
  return inbox.filter(m => m.sourceNode === node);
}

export function getMessagesByType(type: NodeMessage['messageType']): NodeMessage[] {
  return inbox.filter(m => m.messageType === type);
}

export function getActionRequired(): NodeMessage[] {
  return inbox.filter(m => m.actionRequired && m.status === 'pending');
}

// ─── Human Review Actions ──────────────────────────────────────────────────

export function approveMessage(messageId: string, reviewerNote?: string): boolean {
  const msg = inbox.find(m => m.id === messageId);
  if (!msg || msg.status !== 'pending') return false;
  msg.status = 'approved';
  msg.reviewedAt = Date.now();
  msg.reviewerNote = reviewerNote;
  return true;
}

export function rejectMessage(messageId: string, reviewerNote: string): boolean {
  const msg = inbox.find(m => m.id === messageId);
  if (!msg || msg.status !== 'pending') return false;
  msg.status = 'rejected';
  msg.reviewedAt = Date.now();
  msg.reviewerNote = reviewerNote;
  return true;
}

export function markReviewed(messageId: string): boolean {
  const msg = inbox.find(m => m.id === messageId);
  if (!msg) return false;
  msg.status = 'reviewed';
  msg.reviewedAt = Date.now();
  return true;
}

// ─── Expiration ────────────────────────────────────────────────────────────

function expireOldMessages(): void {
  const now = Date.now();
  for (const msg of inbox) {
    if (msg.status === 'pending' && msg.expiresAt < now) {
      msg.status = 'expired';
    }
  }
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export function getIntentHubStats(): IntentHubStats {
  const byNode: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let totalResponseTime = 0;
  let reviewedCount = 0;

  for (const msg of inbox) {
    byNode[msg.sourceNode] = (byNode[msg.sourceNode] ?? 0) + 1;
    byType[msg.messageType] = (byType[msg.messageType] ?? 0) + 1;
    byPriority[msg.priority] = (byPriority[msg.priority] ?? 0) + 1;
    if (msg.reviewedAt) {
      totalResponseTime += msg.reviewedAt - msg.createdAt;
      reviewedCount++;
    }
  }

  return {
    totalMessages: inbox.length,
    pendingCount: inbox.filter(m => m.status === 'pending').length,
    approvedCount: inbox.filter(m => m.status === 'approved').length,
    rejectedCount: inbox.filter(m => m.status === 'rejected').length,
    expiredCount: inbox.filter(m => m.status === 'expired').length,
    byNode, byType, byPriority,
    avgResponseTimeMs: reviewedCount > 0 ? Math.round(totalResponseTime / reviewedCount) : 0,
  };
}

// ─── Convenience: ENGINEER → INTENT bridge ─────────────────────────────────

export function submitEngineerProposal(proposal: {
  id: string; type: string; priority: string; targetEngine: string;
  title: string; description: string; estimatedImpact: string; estimatedRisk: string;
}): NodeMessage {
  return submitToIntent(
    'ENGINEER', 'Mechanist', 'proposal',
    proposal.priority as NodeMessage['priority'],
    proposal.title,
    proposal.description,
    `Engine: ${proposal.targetEngine} | Type: ${proposal.type} | Risk: ${proposal.estimatedRisk}`,
    proposal.estimatedImpact,
    true,
    ['engine-maintenance', proposal.type, proposal.targetEngine],
    proposal.id,
  );
}
