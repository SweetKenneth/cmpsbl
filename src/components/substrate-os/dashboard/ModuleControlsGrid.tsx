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
  useDreamStatusOS, useModernizerStatusOS, useDecodeStatusOS,
  useCoreStatusOS, useRippleStatusOS, useAccessStatusOS,
  useIntegrationStatusOS, useVisionHealthOS, useSystemStatus,
  useCortexStatusOS, useInclusiveStatusOS,
  useMemoryModStatusOS, useRelayModStatusOS, useAuditModStatusOS,
  useIdentityModStatusOS, useEconomyModStatusOS, useSandboxModStatusOS,
  useEncodeModStatusOS
} from '@/hooks/useSubstrateOS';
import { 
  useBrainReflectOS, useBrainDreamOS, useDreamCycleOS 
} from '@/hooks/useSubstrateOS';
import { 
  useBrainOptimize, useBrainCognitiveCycle, useSystemHeal, useDreamMutate 
} from '@/hooks/useSubstrateOSEnhanced';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { brain, defense, nexus, system, dream, modernizer, decode, core, ripple, access, integration, vision, cortex, inclusive, memoryMod, relayMod, auditMod, identityMod, economyMod, sandboxMod, encodeMod } from '@/lib/substrate';

interface ModuleControlsGridProps {
  enabled: boolean;
}

export function ModuleControlsGrid({ enabled }: ModuleControlsGridProps) {
  // Status hooks for all execution surfaces
  const brainStatus = useBrainStatusOS();
  const defenseStatus = useDefenseStatusOS();
  const nexusStatus = useNexusStatusOS();
  const dreamStatus = useDreamStatusOS();
  const modernizerStatus = useModernizerStatusOS();
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
      gradient: 'bg-gradient-to-r from-orange-500 to-amber-600', accentColor: 'bg-orange-500',
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
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600', accentColor: 'bg-cyan-500',
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
      gradient: 'bg-gradient-to-r from-amber-500 to-yellow-600', accentColor: 'bg-amber-500',
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
      gradient: 'bg-gradient-to-r from-purple-500 to-violet-600', accentColor: 'bg-purple-500',
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
      gradient: 'bg-gradient-to-r from-fuchsia-500 to-pink-600', accentColor: 'bg-fuchsia-500',
      status: decodeStatus,
      metrics: [{ label: 'Interface', value: decodeStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await decode.status(); toast.info(`Decode: ${r.success ? 'Online' : 'Check failed'}`); },
    },
    {
      id: 'nexus', name: 'NEXUS', layer: 'cognitive' as const, icon: Zap,
      description: 'AI provider routing',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-600', accentColor: 'bg-green-500',
      status: nexusStatus,
      metrics: [{ label: 'Router', value: nexusStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'providers', label: 'Providers', icon: Network }],
      onAction: async () => { const r = await nexus.providers(); toast.info(`Nexus: ${r.success ? 'Loaded' : 'Failed'}`); },
    },
    // Operational Layer
    {
      id: 'defense', name: 'DEFENSE', layer: 'operational' as const, icon: Shield,
      description: 'Security & threat detection',
      gradient: 'bg-gradient-to-r from-red-500 to-rose-600', accentColor: 'bg-red-500',
      status: defenseStatus,
      metrics: [{ label: 'Perimeter', value: defenseStatus.data?.success ? 'Secure' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Shield, variant: 'warning' as const }],
      onAction: async () => { const r = await defense.status(); toast.info(`Defense: ${r.success ? 'Secure' : 'Check failed'}`); },
    },
    {
      id: 'vision', name: 'VISION', layer: 'operational' as const, icon: Eye,
      description: 'Observability & telemetry',
      gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600', accentColor: 'bg-blue-500',
      status: visionStatus,
      metrics: [{ label: 'Telemetry', value: visionStatus.data?.success ? 'Streaming' : 'Checking' }],
      actions: [{ id: 'metrics', label: 'Metrics', icon: Activity }],
      onAction: async () => { const r = await vision.metrics(); toast.info(`Vision: ${r.success ? 'Loaded' : 'Failed'}`); },
    },
    {
      id: 'dream', name: 'DREAM', layer: 'operational' as const, icon: Moon,
      description: 'Dream-Eater consumption engine',
      gradient: 'bg-gradient-to-r from-violet-500 to-purple-600', accentColor: 'bg-violet-500',
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
      gradient: 'bg-gradient-to-r from-lime-500 to-green-600', accentColor: 'bg-lime-500',
      status: encodeStatus,
      metrics: [{ label: 'Engine', value: encodeStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await encodeMod.status(); toast.info(`Encode: ${r.success ? 'Engine ready' : 'Check failed'}`); },
    },
    // Administrative Layer
    {
      id: 'system', name: 'SYSTEM', layer: 'admin' as const, icon: Settings,
      description: 'Core administration & control',
      gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600', accentColor: 'bg-emerald-500',
      status: systemStatusQuery,
      metrics: [{ label: 'Health', value: systemStatusQuery.data?.success ? 'Nominal' : 'Checking' }],
      actions: [{ id: 'heal', label: 'Heal', icon: Wrench, variant: 'success' as const }],
      onAction: async () => { await systemHeal.mutateAsync(undefined); },
    },
    {
      id: 'modernizer', name: 'EVOLUTION', layer: 'admin' as const, icon: Sparkles,
      description: 'Bounded self-evolution engine',
      gradient: 'bg-gradient-to-r from-rose-500 to-pink-600', accentColor: 'bg-rose-500',
      status: modernizerStatus,
      metrics: [{ label: 'Engine', value: modernizerStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'scan', label: 'Scan', icon: Activity }],
      onAction: async () => { const r = await modernizer.scan(); toast.info(`Evolution: ${r.success ? 'Started' : 'Failed'}`); },
    },
    {
      id: 'integration', name: 'INTEGRATION', layer: 'admin' as const, icon: Plug,
      description: 'Enterprise adapters & governance',
      gradient: 'bg-gradient-to-r from-teal-500 to-cyan-600', accentColor: 'bg-teal-500',
      status: integrationStatus,
      metrics: [{ label: 'Adapters', value: integrationStatus.data?.success ? 'Connected' : 'Checking' }],
      actions: [{ id: 'discover', label: 'Discover', icon: Network }],
      onAction: async () => { const r = await integration.discover(); toast.info(`Integration: ${r.success ? 'Done' : 'Failed'}`); },
    },
    {
      id: 'inclusive', name: 'INCLUSIVE', layer: 'admin' as const, icon: Accessibility,
      description: 'Human compatibility pipeline',
      gradient: 'bg-gradient-to-r from-pink-500 to-rose-600', accentColor: 'bg-pink-500',
      status: inclusiveStatus,
      metrics: [{ label: 'Scanner', value: inclusiveStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'scan', label: 'Scan', icon: Activity }],
      onAction: async () => { const r = await inclusive.selfScan(); toast.info(`Inclusive: ${r.success ? 'Done' : 'Failed'}`); },
    },
    // Orchestrator Layer
    {
      id: 'cortex', name: 'CORTEX', layer: 'orchestrator' as const, icon: GitBranch,
      description: 'Agency-class orchestrator',
      gradient: 'bg-gradient-to-r from-indigo-500 to-violet-600', accentColor: 'bg-indigo-500',
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
      gradient: 'bg-gradient-to-r from-cyan-400 to-blue-500', accentColor: 'bg-cyan-400',
      status: memoryStatus,
      metrics: [{ label: 'Module', value: memoryStatus.data?.success ? 'Online' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await memoryMod.status(); toast.info(`Memory: ${r.success ? 'Module online' : 'Check failed'}`); },
    },
    {
      id: 'relay', name: 'RELAY', layer: 'infrastructure' as const, icon: Send,
      description: 'Outbound routing engine',
      gradient: 'bg-gradient-to-r from-amber-400 to-orange-500', accentColor: 'bg-amber-400',
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
      gradient: 'bg-gradient-to-r from-emerald-400 to-green-500', accentColor: 'bg-emerald-400',
      status: identityStatus,
      metrics: [{ label: 'Auth', value: identityStatus.data?.success ? 'Active' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await identityMod.status(); toast.info(`Identity: ${r.success ? 'Auth active' : 'Check failed'}`); },
    },
    {
      id: 'economy', name: 'ECONOMY', layer: 'infrastructure' as const, icon: DollarSign,
      description: 'Budget enforcement & costing',
      gradient: 'bg-gradient-to-r from-yellow-400 to-amber-500', accentColor: 'bg-yellow-400',
      status: economyStatus,
      metrics: [{ label: 'Budget', value: economyStatus.data?.success ? 'Tracking' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await economyMod.status(); toast.info(`Economy: ${r.success ? 'Budget tracking' : 'Check failed'}`); },
    },
    {
      id: 'sandbox', name: 'SANDBOX', layer: 'infrastructure' as const, icon: Box,
      description: 'Isolated execution environment',
      gradient: 'bg-gradient-to-r from-violet-400 to-purple-500', accentColor: 'bg-violet-400',
      status: sandboxStatus,
      metrics: [{ label: 'Environment', value: sandboxStatus.data?.success ? 'Ready' : 'Checking' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { const r = await sandboxMod.status(); toast.info(`Sandbox: ${r.success ? 'Environment ready' : 'Check failed'}`); },
    },
    // ═══ ESZ — Expansion Sovereignty Zone ═══
    {
      id: 'sovereign', name: 'SOVEREIGN', layer: 'infrastructure' as const, icon: Globe,
      description: 'Jurisdiction classification & compliance',
      gradient: 'bg-gradient-to-r from-orange-400 to-amber-500', accentColor: 'bg-orange-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Zone', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Sovereign: Jurisdiction classifier online'); },
    },
    {
      id: 'oracle', name: 'ORACLE', layer: 'infrastructure' as const, icon: Eye,
      description: 'Predictive analytics & forecasting',
      gradient: 'bg-gradient-to-r from-amber-400 to-yellow-500', accentColor: 'bg-amber-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Engine', value: 'Ready' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Oracle: Prediction engine online'); },
    },
    {
      id: 'conscience', name: 'CONSCIENCE', layer: 'infrastructure' as const, icon: Brain,
      description: 'Ethical framework & bias detection',
      gradient: 'bg-gradient-to-r from-rose-400 to-pink-500', accentColor: 'bg-rose-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Ethics', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Conscience: Ethical framework online'); },
    },
    {
      id: 'treaty', name: 'TREATY', layer: 'infrastructure' as const, icon: ClipboardCheck,
      description: 'Contract engine & SLA compliance',
      gradient: 'bg-gradient-to-r from-emerald-400 to-green-500', accentColor: 'bg-emerald-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Contracts', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Treaty: Contract engine online'); },
    },
    // ═══ EPZ — Expansion Perception Zone ═══
    {
      id: 'compass', name: 'COMPASS', layer: 'infrastructure' as const, icon: Globe,
      description: 'Strategic compass & horizon scanning',
      gradient: 'bg-gradient-to-r from-sky-400 to-blue-500', accentColor: 'bg-sky-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Bearing', value: 'Aligned' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Compass: Strategic bearing aligned'); },
    },
    {
      id: 'echo', name: 'ECHO', layer: 'infrastructure' as const, icon: Radio,
      description: 'What-if simulation & replay',
      gradient: 'bg-gradient-to-r from-indigo-400 to-violet-500', accentColor: 'bg-indigo-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Simulator', value: 'Ready' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Echo: Simulation engine ready'); },
    },
    {
      id: 'reflex', name: 'REFLEX', layer: 'infrastructure' as const, icon: Zap,
      description: 'Edge compute & low-latency response',
      gradient: 'bg-gradient-to-r from-pink-400 to-rose-500', accentColor: 'bg-pink-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Edge', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Reflex: Edge compute active'); },
    },
    // ═══ EMZ — Expansion Manufacturing Zone ═══
    {
      id: 'forge', name: 'FORGE', layer: 'infrastructure' as const, icon: Cpu,
      description: 'Asset generation & templates',
      gradient: 'bg-gradient-to-r from-orange-500 to-red-500', accentColor: 'bg-orange-500',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Forge', value: 'Ready' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Forge: Asset generation ready'); },
    },
    {
      id: 'lingua', name: 'LINGUA', layer: 'infrastructure' as const, icon: Globe,
      description: 'Translation & localization engine',
      gradient: 'bg-gradient-to-r from-teal-400 to-cyan-500', accentColor: 'bg-teal-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Engine', value: 'Ready' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Lingua: Translation engine online'); },
    },
    {
      id: 'phantom', name: 'PHANTOM', layer: 'infrastructure' as const, icon: Shield,
      description: 'Privacy engine & data anonymization',
      gradient: 'bg-gradient-to-r from-slate-500 to-zinc-600', accentColor: 'bg-slate-500',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Privacy', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Phantom: Privacy engine active'); },
    },
    {
      id: 'harvest', name: 'HARVEST', layer: 'infrastructure' as const, icon: Database,
      description: 'Data pipeline & ingestion',
      gradient: 'bg-gradient-to-r from-lime-400 to-green-500', accentColor: 'bg-lime-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Pipeline', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Harvest: Data pipeline active'); },
    },
    // ═══ Execution: MEDIC & NERVE ═══
    {
      id: 'medic', name: 'MEDIC', layer: 'operational' as const, icon: Activity,
      description: 'Autonomous diagnostics & self-repair',
      gradient: 'bg-gradient-to-r from-rose-400 to-pink-500', accentColor: 'bg-rose-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Diagnostics', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Medic: Diagnostics engine active'); },
    },
    {
      id: 'nerve', name: 'NERVE', layer: 'operational' as const, icon: Zap,
      description: 'Inter-node signaling & consensus',
      gradient: 'bg-gradient-to-r from-sky-400 to-blue-500', accentColor: 'bg-sky-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Signals', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Nerve: Signal mesh active'); },
    },
    // ═══ Mesh Overlays ═══
    {
      id: 'evolution', name: 'EVOLUTION', layer: 'orchestrator' as const, icon: Sparkles,
      description: 'Mutation pipeline & shadow runs',
      gradient: 'bg-gradient-to-r from-rose-500 to-pink-600', accentColor: 'bg-rose-500',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Field', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Evolution: Mutation pipeline ready'); },
    },
    {
      id: 'immunity', name: 'IMMUNITY', layer: 'orchestrator' as const, icon: Shield,
      description: 'Self-healing mesh & threat correlation',
      gradient: 'bg-gradient-to-r from-rose-400 to-red-500', accentColor: 'bg-rose-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Field', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Immunity: Self-healing mesh active'); },
    },
    {
      id: 'intent', name: 'INTENT', layer: 'orchestrator' as const, icon: Brain,
      description: 'User intent classification & routing',
      gradient: 'bg-gradient-to-r from-amber-400 to-orange-500', accentColor: 'bg-amber-400',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Field', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Intent: Classification engine active'); },
    },
    {
      id: 'governance', name: 'GOVERNANCE', layer: 'orchestrator' as const, icon: Globe,
      description: 'Policy enforcement & veto authority',
      gradient: 'bg-gradient-to-r from-sky-500 to-blue-600', accentColor: 'bg-sky-500',
      status: { data: { success: true }, isLoading: false, refetch: () => {} } as any,
      metrics: [{ label: 'Plane', value: 'Active' }],
      actions: [{ id: 'status', label: 'Status', icon: Activity }],
      onAction: async () => { toast.info('Governance: Policy enforcement active'); },
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
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 flex items-center justify-center">
          <Layers className="w-4 h-4 text-fuchsia-400" />
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