/**
 * CrownJewelTierBreakdown — Detailed capability list per tier.
 * Shows WHAT each Crown Jewel does without revealing HOW it works.
 * Investors/users can reference this when choosing a plan.
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Diamond, Lock, Sparkles, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CrownJewelCapability {
  name: string;
  primitive: string;
  description: string;
}

const BUILDER_JEWELS: CrownJewelCapability[] = [
  { name: 'Adaptive Context Window', primitive: 'MEMORY', description: 'Dynamically adjusts recall depth based on task complexity — never waste context on irrelevant history.' },
  { name: 'Intent Resolution Engine', primitive: 'CORTEX', description: 'Disambiguates user intent across multiple possible interpretations with confidence scoring.' },
  { name: 'Cascade Reflection Loop', primitive: 'BRAIN', description: 'Self-evaluates reasoning quality before surfacing results — catches logical errors before you see them.' },
  { name: 'Semantic Drift Guard', primitive: 'GOVERNANCE', description: 'Detects when outputs deviate from original intent and auto-corrects mid-execution.' },
  { name: 'Composable Primitives', primitive: 'CORE', description: 'Chain multiple capabilities into compound workflows with automatic dependency resolution.' },
  { name: 'Health Beacon Protocol', primitive: 'BEACON', description: 'Real-time system health monitoring with degradation alerts before failures occur.' },
  { name: 'Graceful Degradation Shell', primitive: 'FAILSAFE', description: 'Automatically falls back to simpler execution paths when primary routes are unavailable.' },
  { name: 'Basic Memory Crystallization', primitive: 'DREAM', description: 'Converts ephemeral discoveries into persistent vault entries with metadata tagging.' },
];

const CREATOR_JEWELS: CrownJewelCapability[] = [
  { name: 'Multi-Hop Reasoning Chain', primitive: 'BRAIN', description: 'Connects insights across 3+ reasoning steps to reach conclusions no single step could produce.' },
  { name: 'Workflow Persistence Layer', primitive: 'MEMORY', description: 'Saves and replays complex multi-step workflows with full state restoration.' },
  { name: 'Confidence Calibration', primitive: 'CORTEX', description: 'Self-calibrates output confidence to match actual accuracy — know when to trust results.' },
  { name: 'Pattern Recognition Amplifier', primitive: 'ANALYTICS', description: 'Identifies recurring patterns across your usage history to suggest optimizations.' },
  { name: 'Semantic Search Indexer', primitive: 'MEMORY', description: 'Indexes vault memories by meaning, not just keywords — find related insights across domains.' },
  { name: 'Execution Trace Recorder', primitive: 'OBSERVABILITY', description: 'Records full execution paths for audit, debugging, and compliance review.' },
  { name: 'Priority Queue Optimizer', primitive: 'NEXUS', description: 'Intelligent request scheduling that minimizes latency for your most important tasks.' },
  { name: 'Cross-Primitive Synergy Detector', primitive: 'EVOLUTION', description: 'Discovers compound capabilities that emerge when multiple primitives interact.' },
  { name: 'Memory Compaction Engine', primitive: 'MEMORY', description: 'Intelligently merges redundant memories to maximize vault capacity without losing information.' },
  { name: 'Contextual Re-ranking', primitive: 'CORTEX', description: 'Re-orders retrieved context by relevance to your current task — not just recency.' },
  { name: 'Bias Detection Sweep', primitive: 'GOVERNANCE', description: 'Scans outputs for systematic biases and flags them before delivery.' },
  { name: 'ROI Attribution Tracker', primitive: 'ANALYTICS', description: 'Attributes measurable value to each capability interaction for usage-based ROI dashboards.' },
  { name: 'Heuristic Learning Snapshot', primitive: 'CLM', description: 'Captures learned heuristics as portable snapshots — transfer intelligence between sessions.' },
  { name: 'Resilient Retry Fabric', primitive: 'FAILSAFE', description: 'Automatically retries failed operations with exponential backoff and alternate routing.' },
  { name: 'Template Pack Assembler', primitive: 'ARCHITECT', description: 'Bundles capabilities into reusable template packs with versioned dependencies.' },
  { name: 'Notification Stream Router', primitive: 'BEACON', description: 'Routes health alerts and discovery notifications to your preferred channels.' },
  { name: 'Schema Evolution Guard', primitive: 'EVOLUTION', description: 'Ensures data schema changes are backward-compatible before applying them.' },
  { name: 'Temporal Memory Indexing', primitive: 'MEMORY', description: 'Organizes memories along temporal axes — recall what you knew at any point in time.' },
  { name: 'Agent Skill Profiling', primitive: 'CORTEX', description: 'Profiles agent capabilities to route tasks to the most competent handler.' },
  { name: 'Defense Perimeter Scanner', primitive: 'DEFENSE', description: 'Continuous security scanning of all input/output boundaries for anomaly detection.' },
];

const STUDIO_JEWELS: CrownJewelCapability[] = [
  { name: 'Knowledge Fusion Network', primitive: 'BRAIN', description: 'Merges knowledge from disparate domains into unified insights that neither source could produce alone.' },
  { name: 'Autonomous Memory Stream', primitive: 'DREAM', description: 'Continuously discovers new capabilities during idle cycles without manual triggering.' },
  { name: 'Compound Capability Weaver', primitive: 'CORE', description: 'Automatically composes multi-primitive capabilities from natural language intent descriptions.' },
  { name: 'Deep Recall Partitioning', primitive: 'MEMORY', description: 'Dedicated memory partitions that prevent cross-contamination between different project contexts.' },
  { name: 'Governance Snapshot Engine', primitive: 'GOVERNANCE', description: 'Point-in-time snapshots of system state for compliance auditing and rollback.' },
  { name: 'Predictive Routing Matrix', primitive: 'NEXUS', description: 'Pre-computes optimal routing paths based on historical latency and success patterns.' },
  { name: 'Export Template Compiler', primitive: 'ARCHITECT', description: 'Compiles capabilities into exportable packages with runtime, docs, and implementation code.' },
  { name: 'Cognitive Load Balancer', primitive: 'CORTEX', description: 'Distributes complex reasoning across multiple evaluation paths and merges the best outcomes.' },
  { name: 'Memory Stream Alerts', primitive: 'BEACON', description: 'Real-time notifications when the Memory Stream discovers high-value or rare capabilities.' },
  { name: 'Anomaly Isolation Chamber', primitive: 'DEFENSE', description: 'Quarantines suspicious inputs in isolated execution sandboxes before processing.' },
  { name: 'Recursive Self-Improvement', primitive: 'EVOLUTION', description: 'Iteratively refines its own heuristics based on outcome feedback loops.' },
  { name: 'Multi-Modal Reasoning Bridge', primitive: 'BRAIN', description: 'Bridges reasoning across text, structured data, and code representations simultaneously.' },
  { name: 'Compliance Export Pipeline', primitive: 'GOVERNANCE', description: 'Generates audit-ready compliance reports in PDF, CSV, and JSON formats.' },
  { name: 'Parallel Execution Orchestrator', primitive: 'NEXUS', description: 'Runs multiple capability chains in parallel with automatic result aggregation.' },
  { name: 'Semantic Versioning Guard', primitive: 'EVOLUTION', description: 'Tracks capability versions semantically and prevents breaking changes in dependent chains.' },
  { name: 'Vault Defragmentation', primitive: 'MEMORY', description: 'Reorganizes vault storage for optimal retrieval performance without data loss.' },
  { name: 'Contextual Agent Mesh', primitive: 'CORTEX', description: 'Dynamically assembles agent teams based on task requirements and agent competencies.' },
  { name: 'Cascading Fallback Router', primitive: 'FAILSAFE', description: 'Multi-tier fallback routing that tries progressively simpler strategies before failing.' },
  { name: 'CLM Gradient Accumulator', primitive: 'CLM', description: 'Accumulates learning gradients across sessions for continuous improvement without catastrophic forgetting.' },
  { name: 'Discovery Rarity Classifier', primitive: 'DREAM', description: 'Classifies Memory Stream discoveries by rarity tier — Common through Mythic.' },
  { name: 'SEBA Pipeline Optimizer', primitive: 'SEBA', description: 'Optimizes the full discovery pipeline for throughput without sacrificing quality gates.' },
  { name: 'Topology Health Monitor', primitive: 'OBSERVABILITY', description: 'Monitors the health of all 42 primitive interconnections in real-time.' },
  { name: 'Adaptive Threshold Tuner', primitive: 'ANALYTICS', description: 'Automatically tunes alert and activation thresholds based on your usage patterns.' },
  { name: 'Circuit Breaker Orchestrator', primitive: 'CORE', description: 'Coordinates circuit breakers across primitive boundaries to prevent cascade failures.' },
  { name: 'Intent Chain Debugger', primitive: 'CORTEX', description: 'Step-through debugging for multi-step intent resolution chains with state inspection.' },
  { name: 'Memory Glacier Archive', primitive: 'MEMORY', description: 'Long-term cold storage for memories you rarely access but need to preserve.' },
  { name: 'Execution Cost Predictor', primitive: 'ANALYTICS', description: 'Predicts computational cost before execution so you can optimize resource allocation.' },
  { name: 'Schema Migration Planner', primitive: 'EVOLUTION', description: 'Plans multi-step schema migrations with rollback checkpoints and validation gates.' },
  { name: 'Agent Performance Profiler', primitive: 'OBSERVABILITY', description: 'Profiles individual agent performance across task types with bottleneck identification.' },
  { name: 'Secure Export Envelope', primitive: 'DEFENSE', description: 'Wraps exported capabilities in tamper-evident envelopes with integrity verification.' },
  { name: 'Resonance Amplification Layer', primitive: 'DREAM', description: 'Amplifies weak cognitive signals that repeatedly appear across sessions into actionable insights.' },
  { name: 'Federated Learning Bridge', primitive: 'CLM', description: 'Enables learning transfer across isolated substrate instances without exposing raw data.' },
  { name: 'Dynamic Slot Rebalancer', primitive: 'CORE', description: 'Automatically rebalances active slots based on current workload priorities.' },
  { name: 'Governance Audit Chain', primitive: 'GOVERNANCE', description: 'Immutable append-only audit trail with cryptographic verification of every governance action.' },
  { name: 'Latency Prediction Model', primitive: 'NEXUS', description: 'Predicts execution latency before routing to enable SLA-aware task scheduling.' },
  { name: 'Cross-Session Continuity', primitive: 'MEMORY', description: 'Seamlessly resumes complex workflows across sessions with full context restoration.' },
  { name: 'Primitive Dependency Graph', primitive: 'OBSERVABILITY', description: 'Visualizes real-time dependency relationships between all active primitives.' },
  { name: 'Adaptive Export Formatter', primitive: 'ARCHITECT', description: 'Automatically formats exports for the target consumption environment (API, SDK, CLI).' },
  { name: 'Behavioral Drift Detector', primitive: 'GOVERNANCE', description: 'Detects gradual behavioral drift across long execution chains and flags deviations.' },
  { name: 'Sub-Threshold Signal Collector', primitive: 'DREAM', description: 'Collects cognitive fragments below activation threshold for later pattern synthesis.' },
];

const ARCHITECT_EXCLUSIVE_JEWELS: CrownJewelCapability[] = [
  { name: 'Pre-conscious Emergence', primitive: 'DREAM', description: 'Three-layer synthesis: sub-threshold fragment collection, resonance amplification, and bias injection into CORTEX for breakthrough insights.' },
  { name: 'Private Discovery Pool', primitive: 'DREAM', description: 'Isolated memory synthesis environment — your discoveries never mix with shared pools.' },
  { name: 'Full Governance Authority', primitive: 'GOVERNANCE', description: 'Complete control over all governance policies, thresholds, and enforcement rules.' },
  { name: 'Unlimited Vault Capacity', primitive: 'MEMORY', description: 'No ceiling on stored memories — keep everything the Memory Stream discovers.' },
  { name: 'Organization Workspace Manager', primitive: 'CORE', description: 'Multi-user workspaces with role-based access, shared vaults, and collaborative discovery.' },
  { name: 'SLA-Aware NEXUS Controls', primitive: 'NEXUS', description: 'Configure execution SLAs with guaranteed latency bounds and automatic escalation.' },
  { name: 'Custom Slot Configuration', primitive: 'ARCHITECT', description: 'Define custom slot behaviors, priorities, and activation rules beyond defaults.' },
  { name: 'Early Access Pipeline', primitive: 'EVOLUTION', description: 'First access to new agents, engines, and resolvers before general availability.' },
  { name: 'White-Glove Onboarding', primitive: 'CORE', description: 'Dedicated onboarding session with architecture review and optimization recommendations.' },
  { name: 'Dedicated Support Channel', primitive: 'BEACON', description: 'Private Slack channel with direct access to the CMPSBL engineering team.' },
];

interface TierSection {
  tier: string;
  accent: string;
  count: number;
  label: string;
  jewels: CrownJewelCapability[];
}

const TIER_SECTIONS: TierSection[] = [
  { tier: 'Builder', accent: 'text-neon-green', count: 8, label: 'Included free', jewels: BUILDER_JEWELS },
  { tier: 'Studio', accent: 'text-neon-purple', count: 20, label: '+20 capabilities', jewels: CREATOR_JEWELS },
  { tier: 'Creator', accent: 'text-sky-400', count: 40, label: '+40 capabilities', jewels: STUDIO_JEWELS },
  { tier: 'Architect', accent: 'text-neon-amber', count: 10, label: 'Exclusive', jewels: ARCHITECT_EXCLUSIVE_JEWELS },
];

export function CrownJewelTierBreakdown() {
  const [expandedTier, setExpandedTier] = useState<string | null>('Builder');

  return (
    <section id="crown-jewel-breakdown" className="container mx-auto px-4 mt-24 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
            <Diamond className="w-3 h-3 mr-1.5 inline" />
            Crown Jewel Capabilities
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            What Each Tier Unlocks
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every capability listed below is a sealed, production-grade cognitive primitive.
            Higher tiers accumulate — Architect includes <strong className="text-foreground">every capability</strong> from all tiers below.
          </p>
        </div>

        <div className="space-y-3">
          {TIER_SECTIONS.map((section) => {
            const isExpanded = expandedTier === section.tier;
            return (
              <div
                key={section.tier}
                className={cn(
                  "rounded-xl border transition-all duration-300",
                  isExpanded ? "border-primary/30 bg-card/60 shadow-lg" : "border-border/40 bg-card/30 hover:border-primary/20"
                )}
              >
                <button
                  onClick={() => setExpandedTier(isExpanded ? null : section.tier)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Diamond className={cn("w-5 h-5", section.accent)} />
                    <div>
                      <span className="font-semibold text-sm sm:text-base">{section.tier}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {section.label} ({section.count})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("text-[10px]", section.accent)}>
                      {section.count} capabilities
                    </Badge>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-1">
                        <div className="grid gap-2">
                          {section.jewels.map((jewel) => (
                            <div
                              key={jewel.name}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 hover:border-primary/15 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-medium">{jewel.name}</span>
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/40 text-muted-foreground">
                                    {jewel.primitive}
                                  </Badge>
                                </div>
                                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mt-0.5">
                                  {jewel.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Accumulation note */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-border/30">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              Architecture-class jewels are permanently internal IP — not available at any tier.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
