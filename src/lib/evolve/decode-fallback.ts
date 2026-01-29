/**
 * Decode Fallback Honesty — Mark fallback proposals explicitly
 * v0.7.5 — Prevent auto-evolution from fallback proposals
 */

import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DecodeProposal {
  proposal_id: string;
  title: string;
  description: string;
  changes: ProposedChange[];
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  fallback: boolean;
  fallback_reason?: string;
  requires_human_approval: boolean;
  created_at: string;
}

export interface ProposedChange {
  file_path: string;
  operation: 'create' | 'update' | 'delete';
  rationale: string;
}

export interface DecodeResult {
  success: boolean;
  proposal?: DecodeProposal;
  error?: string;
  was_fallback: boolean;
}

// ═══════════════════════════════════════════════════════════════
// DECODE FALLBACK HANDLER
// ═══════════════════════════════════════════════════════════════

class DecodeFallbackHandler {
  private fallbackThreshold = 0.3; // Below this confidence = fallback
  
  /**
   * Process a decode proposal and mark if it's a fallback
   */
  processProposal(rawProposal: Partial<DecodeProposal>): DecodeResult {
    const proposal_id = rawProposal.proposal_id || crypto.randomUUID();
    const confidence = rawProposal.confidence ?? 0;
    
    // Determine if this is a fallback
    const isFallback = this.isFallback(rawProposal);
    
    const proposal: DecodeProposal = {
      proposal_id,
      title: rawProposal.title || 'Untitled Proposal',
      description: rawProposal.description || '',
      changes: rawProposal.changes || [],
      confidence,
      risk_level: rawProposal.risk_level || 'medium',
      fallback: isFallback,
      fallback_reason: isFallback ? this.getFallbackReason(rawProposal) : undefined,
      requires_human_approval: isFallback, // Fallbacks always require approval
      created_at: new Date().toISOString(),
    };

    if (isFallback) {
      emitEvolveEvent('decode_fallback_detected', {
        proposal_id,
        confidence,
        reason: proposal.fallback_reason,
      });
    }

    return {
      success: true,
      proposal,
      was_fallback: isFallback,
    };
  }

  /**
   * Determine if a proposal is a fallback
   */
  private isFallback(proposal: Partial<DecodeProposal>): boolean {
    // Low confidence = fallback
    if ((proposal.confidence ?? 0) < this.fallbackThreshold) {
      return true;
    }

    // No changes = fallback
    if (!proposal.changes || proposal.changes.length === 0) {
      return true;
    }

    // Generic/vague title = fallback
    if (this.hasGenericTitle(proposal.title)) {
      return true;
    }

    return false;
  }

  /**
   * Get reason for fallback classification
   */
  private getFallbackReason(proposal: Partial<DecodeProposal>): string {
    const reasons: string[] = [];

    if ((proposal.confidence ?? 0) < this.fallbackThreshold) {
      reasons.push(`Low confidence (${(proposal.confidence ?? 0).toFixed(2)} < ${this.fallbackThreshold})`);
    }

    if (!proposal.changes || proposal.changes.length === 0) {
      reasons.push('No concrete changes proposed');
    }

    if (this.hasGenericTitle(proposal.title)) {
      reasons.push('Generic/vague proposal title');
    }

    return reasons.join('; ');
  }

  /**
   * Check for generic titles that indicate low-quality proposals
   */
  private hasGenericTitle(title?: string): boolean {
    if (!title) return true;
    
    const genericPatterns = [
      /^update/i,
      /^fix/i,
      /^improve/i,
      /^change/i,
      /^modify/i,
      /^untitled/i,
      /^proposal/i,
    ];

    // Title is just one generic word
    const words = title.trim().split(/\s+/);
    if (words.length === 1) {
      return genericPatterns.some(p => p.test(title));
    }

    return false;
  }

  /**
   * Check if a proposal can be auto-evolved
   */
  canAutoEvolve(proposal: DecodeProposal): { allowed: boolean; reason?: string } {
    if (proposal.fallback) {
      return {
        allowed: false,
        reason: `Fallback proposal requires human approval: ${proposal.fallback_reason}`,
      };
    }

    if (proposal.requires_human_approval) {
      return {
        allowed: false,
        reason: 'Proposal explicitly requires human approval',
      };
    }

    if (proposal.risk_level === 'high') {
      return {
        allowed: false,
        reason: 'High-risk proposals require human approval',
      };
    }

    return { allowed: true };
  }

  /**
   * Set the fallback threshold
   */
  setFallbackThreshold(threshold: number): void {
    this.fallbackThreshold = Math.max(0, Math.min(1, threshold));
  }
}

export const decodeFallback = new DecodeFallbackHandler();
