/**
 * S-Tier 039 — Distributed Consensus Mesh
 * CJPI: 94 | Node: MESH | ID: S-MSH02
 *
 * Lightweight Raft-inspired consensus for multi-tab/multi-instance
 * substrate coordination. Elects a leader and replicates decisions.
 */

export type NodeState = 'follower' | 'candidate' | 'leader';

export interface MeshNode {
  id: string;
  state: NodeState;
  term: number;
  votedFor: string | null;
  lastHeartbeat: number;
}

export interface ConsensusEntry {
  term: number;
  command: string;
  data: Record<string, unknown>;
  committedAt: number;
}

const ELECTION_TIMEOUT_MIN = 1500;
const ELECTION_TIMEOUT_MAX = 3000;
const HEARTBEAT_INTERVAL = 500;

export function createMeshNode(id: string): MeshNode {
  return { id, state: 'follower', term: 0, votedFor: null, lastHeartbeat: Date.now() };
}

export function randomElectionTimeout(): number {
  return ELECTION_TIMEOUT_MIN + Math.random() * (ELECTION_TIMEOUT_MAX - ELECTION_TIMEOUT_MIN);
}

export function shouldStartElection(node: MeshNode): boolean {
  return node.state !== 'leader' && (Date.now() - node.lastHeartbeat) > randomElectionTimeout();
}

export function requestVote(
  candidate: MeshNode,
  voter: MeshNode
): { granted: boolean; term: number } {
  if (candidate.term < voter.term) {
    return { granted: false, term: voter.term };
  }
  if (candidate.term > voter.term || voter.votedFor === null || voter.votedFor === candidate.id) {
    voter.term = candidate.term;
    voter.votedFor = candidate.id;
    return { granted: true, term: voter.term };
  }
  return { granted: false, term: voter.term };
}

export function becomeLeader(node: MeshNode): void {
  node.state = 'leader';
  node.lastHeartbeat = Date.now();
}

export function receiveHeartbeat(node: MeshNode, leaderTerm: number): void {
  if (leaderTerm >= node.term) {
    node.state = 'follower';
    node.term = leaderTerm;
    node.votedFor = null;
    node.lastHeartbeat = Date.now();
  }
}

export function createEntry(term: number, command: string, data: Record<string, unknown>): ConsensusEntry {
  return { term, command, data, committedAt: Date.now() };
}

export { HEARTBEAT_INTERVAL };
