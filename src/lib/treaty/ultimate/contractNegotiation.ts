/**
 * TREATY Ultimate — Contract Negotiation Engine
 * Counter-offer generation, term optimization, and automated
 * negotiation rounds with convergence detection.
 */

export type NegotiationStatus = 'open' | 'counter_offered' | 'converging' | 'agreed' | 'deadlocked' | 'abandoned';

export interface NegotiationSession {
  id: string;
  contractId: string;
  parties: string[];
  rounds: NegotiationRound[];
  status: NegotiationStatus;
  convergenceScore: number; // 0–1, how close parties are to agreement
  maxRounds: number;
  startedAt: number;
  resolvedAt: number | null;
}

export interface NegotiationRound {
  roundNumber: number;
  proposedBy: string;
  terms: NegotiationTerm[];
  acceptedTerms: number;
  rejectedTerms: number;
  counterOffered: number;
  timestamp: number;
}

export interface NegotiationTerm {
  clause: string;
  proposedValue: number;
  counterValue: number | null;
  status: 'proposed' | 'accepted' | 'rejected' | 'counter_offered';
  flexibility: number; // 0–1, how much the proposer is willing to move
}

const MAX_SESSIONS = 200;
const sessions: NegotiationSession[] = [];
let sessionCounter = 0;

export function startNegotiation(
  contractId: string,
  parties: string[],
  initialTerms: Array<{ clause: string; proposedValue: number; flexibility?: number }>,
  maxRounds: number = 10,
): NegotiationSession {
  const session: NegotiationSession = {
    id: `neg-${++sessionCounter}`,
    contractId,
    parties,
    rounds: [{
      roundNumber: 1,
      proposedBy: parties[0],
      terms: initialTerms.map(t => ({
        clause: t.clause,
        proposedValue: t.proposedValue,
        counterValue: null,
        status: 'proposed',
        flexibility: t.flexibility ?? 0.3,
      })),
      acceptedTerms: 0,
      rejectedTerms: 0,
      counterOffered: 0,
      timestamp: Date.now(),
    }],
    status: 'open',
    convergenceScore: 0,
    maxRounds,
    startedAt: Date.now(),
    resolvedAt: null,
  };

  if (sessions.length >= MAX_SESSIONS) sessions.shift();
  sessions.push(session);
  return session;
}

export function submitCounterOffer(
  sessionId: string,
  counterParty: string,
  counters: Array<{ clause: string; counterValue: number; accept?: boolean }>,
): NegotiationRound | null {
  const session = sessions.find(s => s.id === sessionId);
  if (!session || session.status === 'agreed' || session.status === 'abandoned') return null;
  if (session.rounds.length >= session.maxRounds) {
    session.status = 'deadlocked';
    session.resolvedAt = Date.now();
    return null;
  }

  const prevRound = session.rounds[session.rounds.length - 1];
  const newTerms: NegotiationTerm[] = prevRound.terms.map(term => {
    const counter = counters.find(c => c.clause === term.clause);
    if (!counter) return { ...term, status: 'accepted' as const, counterValue: null };

    if (counter.accept) {
      return { ...term, status: 'accepted' as const, counterValue: null };
    }

    // Check if counter is within flexibility range
    const maxDelta = term.proposedValue * term.flexibility;
    const delta = Math.abs(counter.counterValue - term.proposedValue);

    if (delta <= maxDelta * 0.1) {
      // Close enough — auto-accept
      return { ...term, status: 'accepted' as const, counterValue: counter.counterValue };
    }

    return {
      ...term,
      proposedValue: counter.counterValue,
      counterValue: term.proposedValue,
      status: 'counter_offered' as const,
      flexibility: term.flexibility * 0.9, // reduce flexibility each round
    };
  });

  const accepted = newTerms.filter(t => t.status === 'accepted').length;
  const rejected = newTerms.filter(t => t.status === 'rejected').length;
  const counterOffered = newTerms.filter(t => t.status === 'counter_offered').length;

  const round: NegotiationRound = {
    roundNumber: session.rounds.length + 1,
    proposedBy: counterParty,
    terms: newTerms,
    acceptedTerms: accepted,
    rejectedTerms: rejected,
    counterOffered,
    timestamp: Date.now(),
  };

  session.rounds.push(round);
  session.convergenceScore = newTerms.length > 0 ? accepted / newTerms.length : 0;

  // Status transitions
  if (accepted === newTerms.length) {
    session.status = 'agreed';
    session.resolvedAt = Date.now();
  } else if (session.convergenceScore > 0.7) {
    session.status = 'converging';
  } else {
    session.status = 'counter_offered';
  }

  return round;
}

export function abandonNegotiation(sessionId: string): boolean {
  const session = sessions.find(s => s.id === sessionId);
  if (!session || session.status === 'agreed') return false;
  session.status = 'abandoned';
  session.resolvedAt = Date.now();
  return true;
}

export function getNegotiationStats() {
  return {
    total: sessions.length,
    open: sessions.filter(s => s.status === 'open' || s.status === 'counter_offered' || s.status === 'converging').length,
    agreed: sessions.filter(s => s.status === 'agreed').length,
    deadlocked: sessions.filter(s => s.status === 'deadlocked').length,
    avgRoundsToAgreement: (() => {
      const agreed = sessions.filter(s => s.status === 'agreed');
      return agreed.length > 0
        ? Math.round(agreed.reduce((s, a) => s + a.rounds.length, 0) / agreed.length * 10) / 10
        : 0;
    })(),
  };
}

export function getSessions(): NegotiationSession[] { return [...sessions]; }
export function getSession(id: string): NegotiationSession | undefined { return sessions.find(s => s.id === id); }
