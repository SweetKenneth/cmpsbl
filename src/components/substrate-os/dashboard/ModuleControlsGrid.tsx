/**
 * Module Controls Grid — All execution surfaces with real-time status
 */

import { 
  Brain, MessageSquare, Shield, Zap, Eye, Moon, Cpu, Sparkles, 
  Radio, Key, Settings, Layers, Plug, Activity, Network, 
  RefreshCw, Wrench, GitBranch, Accessibility, Code, Database,
  Send, ClipboardCheck, Fingerprint, DollarSign, Box, Globe
} from 'lucide-react';
import { ModuleControlCard } from './ModuleControlCard';
import { 
  useBrainStatusOS, useDefenseStatusOS, useNexusStatusOS, 
  useDreamStatusOS, useEvolutionStatusOS, useDecodeStatusOS,
  useCoreStatusOS, useRippleStatusOS, useAccessStatusOS,
  useIntegrationStatusOS, useVisionHealthOS, useSystemStatus,
  useCortexStatusOS, useInclusiveStatusOS,
  useMemoryModStatusOS, useRelayModStatusOS, useAuditModStatusOS,
  useIdentityModStatusOS, useEconomyModStatusOS, useSandboxModStatusOS,
  useEncodeModStatusOS,
  // Expansion nodes
  useSovereignStatusOS, useOracleStatusOS, useConscienceStatusOS, useTreatyStatusOS,
  useCompassStatusOS, useEchoStatusOS, useReflexStatusOS,
  useForgeStatusOS, useLinguaStatusOS, useHarvestStatusOS,
  useShadowStatusOS, usePhantomStatusOS,
  useImmunityStatusOS, useIntentStatusOS, useGovernanceStatusOS,
  useMedicStatusOS, useNerveStatusOS,
} from '@/hooks/useSubstrateOS';
import { 
  useBrainReflectOS, useBrainDreamOS, useDreamCycleOS 
} from '@/hooks/useSubstrateOS';
import { 
  useBrainOptimize, useBrainCognitiveCycle, useSystemHeal, useDreamMutate 
} from '@/hooks/useSubstrateOSEnhanced';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { brain, defense, nexus, system, dream, decode, core, ripple, access, integration, vision, cortex, inclusive, memoryMod, relayMod, auditMod, identityMod, economyMod, sandboxMod, encodeMod, sovereignMod, oracleMod, conscienceMod, treatyMod, compassMod, echoMod, reflexMod, forgeMod, linguaMod, harvestMod, evolutionMod, shadowMod, phantomMod, immunityMod, intentMod, governanceMod, medicMod, nerveMod } from '@/lib/substrate';

interface ModuleControlsGridProps {
  enabled: boolean;
}

export function ModuleControlsGrid({ enabled }: ModuleControlsGridProps) {
  // Status hooks for all execution surfaces
  const brainStatus = useBrainStatusOS();
  const defenseStatus = useDefenseStatusOS();
  const nexusStatus = useNexusStatusOS();
  const dreamStatus = useDreamStatusOS();
  const evolutionAdminStatus = useEvolutionStatusOS();
  const decodeStatus = useDecodeStatusOS();
  const coreStatus = useCoreStatusOS();
  const rippleStatus = useRippleStatusOS();
  const accessStatus = useAccessStatusOS();
  const integrationStatus = useIntegrationStatusOS();
  const visionStatus = useVisionHealthOS();
  const systemStatusQuery = useSystemStatus();
  const cortexStatus = useCortexStatusOS();
  const inclusiveStatus = useInclusiveStatusOS();
  const memoryStatus = useMemoryModStatusOS();
  const relayStatus = useRelayModStatusOS();
  const auditStatus = useAuditModStatusOS();
  const identityStatus = useIdentityModStatusOS();
  const economyStatus = useEconomyModStatusOS();
  const sandboxStatus = useSandboxModStatusOS();
  const encodeStatus = useEncodeModStatusOS();
  // Expansion nodes
  const sovereignStatus = useSovereignStatusOS();
  const oracleStatus = useOracleStatusOS();
  const conscienceStatus = useConscienceStatusOS();
  const treatyStatus = useTreatyStatusOS();
  const compassStatus = useCompassStatusOS();
  const echoStatus = useEchoStatusOS();
  const reflexStatus = useReflexStatusOS();
  const forgeStatus = useForgeStatusOS();
  const linguaStatus = useLinguaStatusOS();
  const harvestStatus = useHarvestStatusOS();
  const evolutionStatus = useEvolutionStatusOS();
  const shadowStatus = useShadowStatusOS();
  const phantomStatus = usePhantomStatusOS();
  const immunityStatus = useImmunityStatusOS();
  const intentStatus = useIntentStatusOS();
  const governanceStatus = useGovernanceStatusOS();
  const medicStatus = useMedicStatusOS();
  const nerveStatus = useNerveStatusOS();

  // Action mutations
  const brainReflect = useBrainReflectOS();
  const brainDream = useBrainDreamOS();
  const brainOptimize = useBrainOptimize();
  const brainCycle = useBrainCognitiveCycle();
  const dreamCycle = useDreamCycleOS();
  const dreamMutate = useDreamMutate();
  const systemHeal = useSystemHeal();

  const modules = [
    // Kernel Layer
    {
      id: 'core', name: 'CORE', layer: 'kernel' as const, icon: Cpu,
      description: 'Kernel orchestration & scheduling',
      gradient: 'bg-gradient-to-r from-neon-amber to-neon-amber', accentColor: 'bg-neon-amber',
      status: coreStatus,
      metrics: [{ label: 'Status', value: coreStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity, variant: 'primary' as const }],
      onAction: async (actionId: string) => {
        if (actionId === 'status') { const r = await core.status(); toast.info(`Core: ${r.success ? 'Online' : 'Check failed'}`); }
      },
    },
    {
      id: 'ripple', name: 'RIPPLE', layer: 'kernel' as const, icon: Radio,
      description: 'Message bus & event sourcing',
      gradient: 'bg-gradient-to-r from-neon-cyan to-neon-blue', accentColor: 'bg-neon-cyan',
      status: rippleStatus,
      metrics: [{ label: 'Bus', value: rippleStatus.data?.success ? 'Connected' : 'Checking' }],
      actions: [{ id: 'jobs', label: 'Jobs', icon: Activity }],
      onAction: async (actionId: string) => {
        if (actionId === 'jobs') { const r = await ripple.jobs(); toast.info(`Ripple: ${r.success ? 'Fetched' : 'Failed'}`); }
      },
    },
    {
      id: 'access', name: 'ACCESS', layer: 'kernel' as const, icon: Key,
      description: 'Identity, API keys & metering',
      gradient: 'bg-gradient-to-r from-neon-amber to-neon-amber', accentColor: 'bg-neon-amber',
      status: accessStatus,
      metrics: [{ label: 'Identity', value: accessStatus.data?.success ? 'Verified' : 'Checking' }],
      actions: [{ id: 'products', label: 'Products', icon: Layers }],
      onAction: async (actionId: string) => {
        if (actionId === 'products') { const r = await access.products(); toast.info(`Access: ${r.success ? 'Loaded' : 'Failed'}`); }
      },
    },
    // Cognitive Layer
    {
      id: 'brain', name: 'BRAIN', layer: 'cognitive' as const, icon: Brain,
      description: 'Three-tier memory & learning',
      gradient: 'bg-gradient-to-r from-neon-purple to-neon-purple', accentColor: 'bg-neon-purple',
      status: brainStatus,
      metrics: [{ label: 'Memory', value: brainStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [
        { id: 'reflect', label: 'Reflect', icon: Brain, variant: 'primary' as const },
        { id: 'optimize', label: 'Optimize', icon: Sparkles, variant: 'success' as const },
        { id: 'cycle', label: 'Cycle', icon: RefreshCw },
      ],
      onAction: async (actionId: string) => {
        if (actionId === 'reflect') await brainReflect.mutateAsync();
        if (actionId === 'optimize') await brainOptimize.mutateAsync();
        if (actionId === 'cycle') await brainCycle.mutateAsync();
      },
    },
    {
      id: 'decode', name: 'DECODE', layer: 'cognitive' as const, icon: MessageSquare,
      description: 'Epistemic conversation engine',
      gradient: 'bg-gradient-to-r from-neon-magenta to-neon-magenta', accentColor: 'bg-neon-magenta',
      status: decodeStatus,
      metrics: [{ label: 'Interface', value: decodeStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await decode.status(); toast.info(`Decode: ${r.success ? 'Online' : 'Check failed'}`); },
    },
    {
      id: 'nexus', name: 'NEXUS', layer: 'cognitive' as const, icon: Zap,
      description: 'AI provider routing',
      gradient: 'bg-gradient-to-r from-neon-green to-neon-green', accentColor: 'bg-neon-green',
      status: nexusStatus,
      metrics: [{ label: 'Router', value: nexusStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'providers', label: 'Providers', icon: Network }],
      onAction: async () => { const r = await nexus.providers(); toast.info(`Nexus: ${r.success ? 'Loaded' : 'Failed'}`); },
    },
    // Operational Layer
    {
      id: 'defense', name: 'DEFENSE', layer: 'operational' as const, icon: Shield,
      description: 'Security & threat detection',
      gradient: 'bg-gradient-to-r from-destructive to-neon-magenta', accentColor: 'bg-destructive',
      status: defenseStatus,
      metrics: [{ label: 'Perimeter', value: defenseStatus.data?.success ? 'Secure' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Shield, variant: 'warning' as const }],
      onAction: async () => { const r = await defense.status(); toast.info(`Defense: ${r.success ? 'Secure' : 'Check failed'}`); },
    },
    {
      id: 'vision', name: 'VISION', layer: 'operational' as const, icon: Eye,
      description: 'Observability & telemetry',
      gradient: 'bg-gradient-to-r from-neon-blue to-primary', accentColor: 'bg-neon-blue',
      status: visionStatus,
      metrics: [{ label: 'Telemetry', value: visionStatus.data?.success ? 'Streaming' : 'Checking' }],
      actions: [{ id: 'metrics', label: 'Metrics', icon: Activity }],
      onAction: async () => { const r = await vision.metrics(); toast.info(`Vision: ${r.success ? 'Loaded' : 'Failed'}`); },
    },
    {
      id: 'dream', name: 'DREAM', layer: 'operational' as const, icon: Moon,
      description: 'Dream-Eater consumption engine',
      gradient: 'bg-gradient-to-r from-neon-purple to-neon-purple', accentColor: 'bg-neon-purple',
      status: dreamStatus,
      metrics: [{ label: 'Engine', value: dreamStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [
        { id: 'cycle', label: 'Cycle', icon: Moon, variant: 'primary' as const },
        { id: 'mutate', label: 'Mutate', icon: Sparkles, variant: 'warning' as const },
      ],
      onAction: async (actionId: string) => {
        if (actionId === 'cycle') await dreamCycle.mutateAsync();
        if (actionId === 'mutate') await dreamMutate.mutateAsync();
      },
    },
    {
      id: 'encode', name: 'ENCODE', layer: 'operational' as const, icon: Code,
      description: 'Structural code generation',
      gradient: 'bg-gradient-to-r from-lime-500 to-neon-green', accentColor: 'bg-lime-500',
      status: encodeStatus,
      metrics: [{ label: 'Engine', value: encodeStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await encodeMod.status(); toast.info(`Encode: ${r.success ? 'Engine ready' : 'Check failed'}`); },
    },
    // Administrative Layer
    {
      id: 'system', name: 'SYSTEM', layer: 'admin' as const, icon: Settings,
      description: 'Core administration & control',
      gradient: 'bg-gradient-to-r from-neon-green to-neon-cyan', accentColor: 'bg-neon-green',
      status: systemStatusQuery,
      metrics: [{ label: 'Health', value: systemStatusQuery.data?.success ? 'Nominal' : 'Checking' }],
      actions: [{ id: 'heal', label: 'Heal', icon: Wrench, variant: 'success' as const }],
      onAction: async () => { await systemHeal.mutateAsync(undefined); },
    },
    {
      id: 'evolution', name: 'EVOLUTION', layer: 'admin' as const, icon: Sparkles,
      description: 'Bounded self-evolution engine',
      gradient: 'bg-gradient-to-r from-neon-magenta to-neon-magenta', accentColor: 'bg-neon-magenta',
      status: evolutionAdminStatus,
      metrics: [{ label: 'Engine', value: evolutionAdminStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'scan', label: 'Scan', icon: Activity }],
      onAction: async () => { const r = await evolutionMod.status(); toast.info(`Evolution: ${r.success ? 'Online' : 'Failed'}`); },
    },
    {
      id: 'integration', name: 'INTEGRATION', layer: 'admin' as const, icon: Plug,
      description: 'Enterprise adapters & governance',
      gradient: 'bg-gradient-to-r from-neon-cyan to-neon-cyan', accentColor: 'bg-neon-cyan',
      status: integrationStatus,
      metrics: [{ label: 'Adapters', value: integrationStatus.data?.success ? 'Connected' : 'Checking' }],
      actions: [{ id: 'discover', label: 'Discover', icon: Network }],
      onAction: async () => { const r = await integration.discover(); toast.info(`Integration: ${r.success ? 'Done' : 'Failed'}`); },
    },
    {
      id: 'inclusive', name: 'INCLUSIVE', layer: 'admin' as const, icon: Accessibility,
      description: 'Human compatibility layer',
      gradient: 'bg-gradient-to-r from-neon-magenta to-neon-magenta', accentColor: 'bg-neon-magenta',
      status: inclusiveStatus,
      metrics: [{ label: 'Scanner', value: inclusiveStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'scan', label: 'Scan', icon: Activity }],
      onAction: async () => { const r = await inclusive.selfScan(); toast.info(`Inclusive: ${r.success ? 'Done' : 'Failed'}`); },
    },
    // Orchestrator Layer
    {
      id: 'cortex', name: 'CORTEX', layer: 'orchestrator' as const, icon: GitBranch,
      description: 'Agency-class orchestrator',
      gradient: 'bg-gradient-to-r from-primary to-neon-purple', accentColor: 'bg-primary',
      status: cortexStatus,
      metrics: [{ label: 'Orchestrator', value: cortexStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [
        { id: 'status', label: 'Status', icon: Activity, variant: 'primary' as const },
        { id: 'summary', label: 'Summary', icon: Layers },
      ],
      onAction: async (actionId: string) => {
        if (actionId === 'status') { const r = await cortex.status(); toast.info(`Cortex: ${r.success ? 'Active' : 'Failed'}`); }
        if (actionId === 'summary') { const r = await cortex.summary(); toast.info(`Cortex: ${r.success ? 'Generated' : 'Failed'}`); }
      },
    },
    // Infrastructure Layer
    {
      id: 'memory', name: 'MEMORY', layer: 'infrastructure' as const, icon: Database,
      description: 'Vector/RAG recall & tiering',
      gradient: 'bg-gradient-to-r from-neon-cyan to-neon-blue', accentColor: 'bg-neon-cyan',
      status: memoryStatus,
      metrics: [{ label: 'Module', value: memoryStatus.data?.success ? 'Online' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await memoryMod.status(); toast.info(`Memory: ${r.success ? 'Module online' : 'Check failed'}`); },
    },
    {
      id: 'relay', name: 'RELAY', layer: 'infrastructure' as const, icon: Send,
      description: 'Outbound routing engine',
      gradient: 'bg-gradient-to-r from-neon-amber to-neon-amber', accentColor: 'bg-neon-amber',
      status: relayStatus,
      metrics: [{ label: 'Router', value: relayStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await relayMod.status(); toast.info(`Relay: ${r.success ? 'Router active' : 'Check failed'}`); },
    },
    {
      id: 'audit', name: 'AUDIT', layer: 'infrastructure' as const, icon: ClipboardCheck,
      description: 'Immutable compliance logging',
      gradient: 'bg-gradient-to-r from-slate-500 to-gray-600', accentColor: 'bg-slate-500',
      status: auditStatus,
      metrics: [{ label: 'Logger', value: auditStatus.data?.success ? 'Recording' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await auditMod.status(); toast.info(`Audit: ${r.success ? 'Logger recording' : 'Check failed'}`); },
    },
    {
      id: 'identity', name: 'IDENTITY', layer: 'infrastructure' as const, icon: Fingerprint,
      description: 'Actor attribution & WebAuthn',
      gradient: 'bg-gradient-to-r from-neon-green to-neon-green', accentColor: 'bg-neon-green',
      status: identityStatus,
      metrics: [{ label: 'Auth', value: identityStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await identityMod.status(); toast.info(`Identity: ${r.success ? 'Auth active' : 'Check failed'}`); },
    },
    {
      id: 'economy', name: 'ECONOMY', layer: 'infrastructure' as const, icon: DollarSign,
      description: 'Budget enforcement & costing',
      gradient: 'bg-gradient-to-r from-neon-amber to-neon-amber', accentColor: 'bg-neon-amber',
      status: economyStatus,
      metrics: [{ label: 'Budget', value: economyStatus.data?.success ? 'Tracking' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await economyMod.status(); toast.info(`Economy: ${r.success ? 'Budget tracking' : 'Check failed'}`); },
    },
    {
      id: 'sandbox', name: 'SANDBOX', layer: 'infrastructure' as const, icon: Box,
      description: 'Isolated execution environment',
      gradient: 'bg-gradient-to-r from-neon-purple to-neon-purple', accentColor: 'bg-neon-purple',
      status: sandboxStatus,
      metrics: [{ label: 'Environment', value: sandboxStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await sandboxMod.status(); toast.info(`Sandbox: ${r.success ? 'Environment ready' : 'Check failed'}`); },
    },
    // ═══ ESZ — Expansion Sovereignty Zone ═══
    {
      id: 'sovereign', name: 'SOVEREIGN', layer: 'infrastructure' as const, icon: Globe,
      description: 'Jurisdiction classification & compliance',
      gradient: 'bg-gradient-to-r from-neon-amber to-neon-amber', accentColor: 'bg-neon-amber',
      status: sovereignStatus,
      metrics: [{ label: 'Zone', value: sovereignStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await sovereignMod.status(); toast.info(`Sovereign: ${r.success ? 'Classifier online' : 'Check failed'}`); },
    },
    {
      id: 'oracle', name: 'ORACLE', layer: 'infrastructure' as const, icon: Eye,
      description: 'Predictive analytics & forecasting',
      gradient: 'bg-gradient-to-r from-neon-amber to-neon-amber', accentColor: 'bg-neon-amber',
      status: oracleStatus,
      metrics: [{ label: 'Engine', value: oracleStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await oracleMod.status(); toast.info(`Oracle: ${r.success ? 'Engine online' : 'Check failed'}`); },
    },
    {
      id: 'conscience', name: 'CONSCIENCE', layer: 'infrastructure' as const, icon: Brain,
      description: 'Ethical framework & bias detection',
      gradient: 'bg-gradient-to-r from-neon-magenta to-neon-magenta', accentColor: 'bg-neon-magenta',
      status: conscienceStatus,
      metrics: [{ label: 'Ethics', value: conscienceStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await conscienceMod.status(); toast.info(`Conscience: ${r.success ? 'Framework online' : 'Check failed'}`); },
    },
    {
      id: 'treaty', name: 'TREATY', layer: 'infrastructure' as const, icon: ClipboardCheck,
      description: 'Contract engine & SLA compliance',
      gradient: 'bg-gradient-to-r from-neon-green to-neon-green', accentColor: 'bg-neon-green',
      status: treatyStatus,
      metrics: [{ label: 'Contracts', value: treatyStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await treatyMod.status(); toast.info(`Treaty: ${r.success ? 'Engine online' : 'Check failed'}`); },
    },
    // ═══ EPZ — Expansion Perception Zone ═══
    {
      id: 'compass', name: 'COMPASS', layer: 'infrastructure' as const, icon: Globe,
      description: 'Strategic compass & horizon scanning',
      gradient: 'bg-gradient-to-r from-sky-400 to-neon-blue', accentColor: 'bg-sky-400',
      status: compassStatus,
      metrics: [{ label: 'Bearing', value: compassStatus.data?.success ? 'Aligned' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await compassMod.status(); toast.info(`Compass: ${r.success ? 'Bearing aligned' : 'Check failed'}`); },
    },
    {
      id: 'echo', name: 'ECHO', layer: 'infrastructure' as const, icon: Radio,
      description: 'What-if simulation & replay',
      gradient: 'bg-gradient-to-r from-primary to-neon-purple', accentColor: 'bg-primary',
      status: echoStatus,
      metrics: [{ label: 'Simulator', value: echoStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await echoMod.status(); toast.info(`Echo: ${r.success ? 'Simulator ready' : 'Check failed'}`); },
    },
    {
      id: 'reflex', name: 'REFLEX', layer: 'infrastructure' as const, icon: Zap,
      description: 'Edge compute & low-latency response',
      gradient: 'bg-gradient-to-r from-neon-magenta to-neon-magenta', accentColor: 'bg-neon-magenta',
      status: reflexStatus,
      metrics: [{ label: 'Edge', value: reflexStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await reflexMod.status(); toast.info(`Reflex: ${r.success ? 'Edge active' : 'Check failed'}`); },
    },
    // ═══ EMZ — Expansion Manufacturing Zone ═══
    {
      id: 'forge', name: 'FORGE', layer: 'infrastructure' as const, icon: Cpu,
      description: 'Asset generation & templates',
      gradient: 'bg-gradient-to-r from-neon-amber to-destructive', accentColor: 'bg-neon-amber',
      status: forgeStatus,
      metrics: [{ label: 'Forge', value: forgeStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await forgeMod.status(); toast.info(`Forge: ${r.success ? 'Ready' : 'Check failed'}`); },
    },
    {
      id: 'lingua', name: 'LINGUA', layer: 'infrastructure' as const, icon: Globe,
      description: 'Translation & localization engine',
      gradient: 'bg-gradient-to-r from-neon-cyan to-neon-cyan', accentColor: 'bg-neon-cyan',
      status: linguaStatus,
      metrics: [{ label: 'Engine', value: linguaStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await linguaMod.status(); toast.info(`Lingua: ${r.success ? 'Engine online' : 'Check failed'}`); },
    },
    {
      id: 'phantom', name: 'PHANTOM', layer: 'infrastructure' as const, icon: Shield,
      description: 'Privacy engine & data anonymization',
      gradient: 'bg-gradient-to-r from-slate-500 to-zinc-600', accentColor: 'bg-slate-500',
      status: phantomStatus,
      metrics: [{ label: 'Privacy', value: phantomStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await phantomMod.status(); toast.info(`Phantom: ${r.success ? 'Privacy active' : 'Check failed'}`); },
    },
    {
      id: 'harvest', name: 'HARVEST', layer: 'infrastructure' as const, icon: Database,
      description: 'Data ingestion & ETL',
      gradient: 'bg-gradient-to-r from-lime-400 to-neon-green', accentColor: 'bg-lime-400',
      status: harvestStatus,
      metrics: [{ label: 'Pipeline', value: harvestStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await harvestMod.status(); toast.info(`Harvest: ${r.success ? 'Pipeline active' : 'Check failed'}`); },
    },
    // ═══ Execution: MEDIC & NERVE ═══
    {
      id: 'medic', name: 'MEDIC', layer: 'operational' as const, icon: Activity,
      description: 'Autonomous diagnostics & self-repair',
      gradient: 'bg-gradient-to-r from-neon-magenta to-neon-magenta', accentColor: 'bg-neon-magenta',
      status: medicStatus,
      metrics: [{ label: 'Diagnostics', value: medicStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await medicMod.status(); toast.info(`Medic: ${r.success ? 'Diagnostics active' : 'Check failed'}`); },
    },
    {
      id: 'nerve', name: 'NERVE', layer: 'operational' as const, icon: Zap,
      description: 'Inter-node signaling & consensus',
      gradient: 'bg-gradient-to-r from-sky-400 to-neon-blue', accentColor: 'bg-sky-400',
      status: nerveStatus,
      metrics: [{ label: 'Signals', value: nerveStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await nerveMod.status(); toast.info(`Nerve: ${r.success ? 'Mesh active' : 'Check failed'}`); },
    },
    // ═══ Mesh Overlays + CSZ ═══
    {
      id: 'evolution', name: 'EVOLUTION', layer: 'orchestrator' as const, icon: Sparkles,
      description: 'Mutation pipeline & shadow runs',
      gradient: 'bg-gradient-to-r from-neon-magenta to-neon-magenta', accentColor: 'bg-neon-magenta',
      status: evolutionStatus,
      metrics: [{ label: 'Field', value: evolutionStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await evolutionMod.status(); toast.info(`Evolution: ${r.success ? 'Pipeline ready' : 'Check failed'}`); },
    },
    {
      id: 'shadow', name: 'SHADOW', layer: 'orchestrator' as const, icon: Eye,
      description: 'Shadow validation & A/B testing',
      gradient: 'bg-gradient-to-r from-slate-500 to-gray-600', accentColor: 'bg-slate-500',
      status: shadowStatus,
      metrics: [{ label: 'Validator', value: shadowStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await shadowMod.status(); toast.info(`Shadow: ${r.success ? 'Validator ready' : 'Check failed'}`); },
    },
    {
      id: 'immunity', name: 'IMMUNITY', layer: 'orchestrator' as const, icon: Shield,
      description: 'Self-healing mesh & threat correlation',
      gradient: 'bg-gradient-to-r from-neon-magenta to-destructive', accentColor: 'bg-neon-magenta',
      status: immunityStatus,
      metrics: [{ label: 'Field', value: immunityStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await immunityMod.status(); toast.info(`Immunity: ${r.success ? 'Mesh active' : 'Check failed'}`); },
    },
    {
      id: 'intent', name: 'INTENT', layer: 'orchestrator' as const, icon: Brain,
      description: 'User intent classification & routing',
      gradient: 'bg-gradient-to-r from-neon-amber to-neon-amber', accentColor: 'bg-neon-amber',
      status: intentStatus,
      metrics: [{ label: 'Field', value: intentStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await intentMod.status(); toast.info(`Intent: ${r.success ? 'Classifier active' : 'Check failed'}`); },
    },
    {
      id: 'governance', name: 'GOVERNANCE', layer: 'orchestrator' as const, icon: Globe,
      description: 'Policy enforcement & veto authority',
      gradient: 'bg-gradient-to-r from-sky-500 to-neon-blue', accentColor: 'bg-sky-500',
      status: governanceStatus,
      metrics: [{ label: 'Plane', value: governanceStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await governanceMod.status(); toast.info(`Governance: ${r.success ? 'Enforcement active' : 'Check failed'}`); },
    },
  ];

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-magenta/20 to-neon-cyan/20 border border-neon-magenta/30 flex items-center justify-center">
          <Layers className="w-4 h-4 text-neon-magenta" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Surface Control Panels</h3>
          <p className="text-[10px] text-muted-foreground font-mono">EXECUTION SURFACES • CMPSBL</p>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module, idx) => (
          <ModuleControlCard
            key={module.id}
            id={module.id}
            name={module.name}
            layer={module.layer}
            icon={module.icon}
            description={module.description}
            isActive={module.status.data?.success ?? false}
            isLoading={module.status.isLoading}
            metrics={module.metrics}
            actions={enabled ? module.actions : []}
            onAction={enabled ? module.onAction : undefined}
            onRefresh={() => module.status.refetch()}
            gradient={module.gradient}
            accentColor={module.accentColor}
            delay={0.05 + Math.min(idx, 8) * 0.02}
          />
        ))}
      </div>
    </motion.div>
  );
}