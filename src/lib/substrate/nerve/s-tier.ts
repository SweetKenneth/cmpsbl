/**
 * NERVE — S-Tier Primitives
 * Consensus heartbeat, partition detection, quorum, state sync, mesh topology, gossip
 */
export * from '@/crownjewels/s-tier/005-consensus-heartbeat-protocol';
// consensus-engine has ConsensusResult collision with nexus/028
export {
  createConsensusEngine,
  type VotingStrategy,
  type Voter,
  type Vote,
  type ConsensusResult as NerveConsensusResult,
  type ConsensusConfig,
} from '@/crownjewels/s-tier/018-consensus-engine';
export * from '@/crownjewels/s-tier/039-distributed-consensus-mesh';
export * from '@/crownjewels/s-tier/043-partition-detection';
export * from '@/crownjewels/s-tier/071-resilient-communication-backbone';
export * from '@/crownjewels/s-tier/083-quorum-negotiator';
export * from '@/crownjewels/s-tier/103-state-synchronization';
export * from '@/crownjewels/s-tier/199-mesh-topology-optimizer';
export * from '@/crownjewels/s-tier/220-gossip-protocol-engine';
