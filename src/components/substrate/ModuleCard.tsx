/**
 * CMPSBL® Module Card Component
 * Displays status for a single substrate module
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Shield, Zap, Eye, Moon, Settings, Sparkles, Cpu, Radio, Key, Plug, Wand2, Accessibility, Database, Send, FileCheck, Fingerprint, Coins, FlaskConical, Code2, HeartPulse, Dna, Target, Scale, Stethoscope, Cable, Crown, Telescope, Heart, Ghost, Hammer, Languages, Navigation, Repeat, Handshake, Wheat, Activity } from 'lucide-react';
import { SubstrateModule } from '@/lib/substrate';

interface ModuleCardProps {
  module: SubstrateModule;
  status: {
    active: boolean;
    lastCheck: string;
    health: number;
  };
  onClick?: () => void;
}

const moduleConfig: Record<SubstrateModule, { 
  icon: typeof Brain; 
  label: string; 
  description: string;
  color: string;
}> = {
  brain: {
    icon: Brain,
    label: 'Brain',
    description: 'Memory, learning, reflection',
    color: 'text-neon-purple',
  },
  decode: {
    icon: MessageSquare,
    label: 'Decode',
    description: 'Intent decoding, chat, dreams',
    color: 'text-neon-blue',
  },
  defense: {
    icon: Shield,
    label: 'Defense',
    description: 'Security, bot detection',
    color: 'text-destructive',
  },
  nexus: {
    icon: Zap,
    label: 'Nexus',
    description: 'AI routing, multi-provider',
    color: 'text-neon-amber',
  },
  vision: {
    icon: Eye,
    label: 'Vision',
    description: 'Observability, metrics',
    color: 'text-neon-green',
  },
  dream: {
    icon: Moon,
    label: 'Dream',
    description: 'Dream-Eater operations',
    color: 'text-primary',
  },
  system: {
    icon: Settings,
    label: 'System',
    description: 'Administration, config',
    color: 'text-gray-500',
  },
  core: {
    icon: Cpu,
    label: 'Core',
    description: 'Kernel, scheduling, lifecycle',
    color: 'text-neon-amber',
  },
  ripple: {
    icon: Radio,
    label: 'Ripple',
    description: 'Message bus, pub/sub, queues',
    color: 'text-neon-cyan',
  },
  access: {
    icon: Key,
    label: 'Access',
    description: 'API keys, billing, metering',
    color: 'text-neon-amber',
  },
  integration: {
    icon: Plug,
    label: 'Integration',
    description: 'Enterprise adapters, LLM governance',
    color: 'text-neon-green',
  },
  cortex: {
    icon: Wand2,
    label: 'Cortex',
    description: 'Orchestrator, evolution, governance',
    color: 'text-neon-purple',
  },
  inclusive: {
    icon: Accessibility,
    label: 'Inclusive',
    description: 'Human compatibility, WCAG, a11y',
    color: 'text-neon-magenta',
  },
  memory: {
    icon: Database,
    label: 'Memory',
    description: 'Vector embeddings, RAG orchestration',
    color: 'text-sky-500',
  },
  relay: {
    icon: Send,
    label: 'Relay',
    description: 'Outbound webhooks, notifications',
    color: 'text-lime-500',
  },
  audit: {
    icon: FileCheck,
    label: 'Audit',
    description: 'Immutable compliance ledger',
    color: 'text-stone-500',
  },
  identity: {
    icon: Fingerprint,
    label: 'Identity',
    description: 'Actor attribution, signatures',
    color: 'text-neon-magenta',
  },
  economy: {
    icon: Coins,
    label: 'Economy',
    description: 'Cost attribution, budgets',
    color: 'text-neon-amber',
  },
  sandbox: {
    icon: FlaskConical,
    label: 'Sandbox',
    description: 'Isolated execution environments',
    color: 'text-neon-cyan',
  },
  encode: {
    icon: Code2,
    label: 'Encode',
    description: 'Code execution & generation intelligence',
    color: 'text-neon-amber',
  },
  immunity: {
    icon: HeartPulse,
    label: 'Immunity',
    description: 'Adaptive resilience, self-healing patterns',
    color: 'text-neon-cyan',
  },
  evolution: {
    icon: Dna,
    label: 'Evolution',
    description: 'Mutation proposals, shadow A/B, promotion',
    color: 'text-neon-magenta',
  },
  intent: {
    icon: Target,
    label: 'Intent',
    description: 'Cross-module intent routing, goal decomposition',
    color: 'text-neon-amber',
  },
  governance: {
    icon: Scale,
    label: 'Governance',
    description: 'Ethical constraints, veto authority, coherence',
    color: 'text-slate-500',
  },
  medic: {
    icon: Stethoscope,
    label: 'Medic',
    description: 'Autonomous diagnostics, self-repair coordination',
    color: 'text-neon-green',
  },
  nerve: {
    icon: Cable,
    label: 'Nerve',
    description: 'Inter-node signaling, consensus repair',
    color: 'text-neon-purple',
  },
  // Expansion Modules (40-Node Architecture)
  sovereign: {
    icon: Crown,
    label: 'SOVEREIGN',
    description: 'Jurisdictional compliance & data sovereignty',
    color: 'text-neon-amber',
  },
  oracle: {
    icon: Telescope,
    label: 'ORACLE',
    description: 'Predictive analytics & forecasting',
    color: 'text-primary',
  },
  conscience: {
    icon: Heart,
    label: 'CONSCIENCE',
    description: 'Ethical governance & bias detection',
    color: 'text-neon-magenta',
  },
  phantom: {
    icon: Ghost,
    label: 'PHANTOM',
    description: 'Privacy engineering & data masking',
    color: 'text-slate-600',
  },
  forge: {
    icon: Hammer,
    label: 'FORGE',
    description: 'Discovery manufacturing & code generation',
    color: 'text-neon-amber',
  },
  lingua: {
    icon: Languages,
    label: 'LINGUA',
    description: 'Translation & multi-language support',
    color: 'text-sky-600',
  },
  compass: {
    icon: Navigation,
    label: 'COMPASS',
    description: 'Strategic navigation & trend analysis',
    color: 'text-neon-cyan',
  },
  echo: {
    icon: Repeat,
    label: 'ECHO',
    description: 'Event replay & temporal simulation',
    color: 'text-neon-purple',
  },
  treaty: {
    icon: Handshake,
    label: 'TREATY',
    description: 'Inter-system agreements & SLA management',
    color: 'text-neon-green',
  },
  harvest: {
    icon: Wheat,
    label: 'HARVEST',
    description: 'Data collection & ETL processes',
    color: 'text-lime-600',
  },
  reflex: {
    icon: Activity,
    label: 'REFLEX',
    description: 'Edge computing & real-time response',
    color: 'text-destructive',
  },
  shadow: {
    icon: Activity,
    label: 'SHADOW',
    description: 'Covert execution & shadow mesh operations',
    color: 'text-gray-500',
  },
  // Plane additions — Nodes 39 & 40
  engineer: {
    icon: Settings,
    label: 'ENGINEER',
    description: 'Engine & meta-engine maintenance intelligence',
    color: 'text-neon-cyan',
  },
  atlas: {
    icon: Scale,
    label: 'ATLAS',
    description: 'Governance authority & system control',
    color: 'text-neon-amber',
  },
};

export function ModuleCard({ module, status, onClick }: ModuleCardProps) {
  const config = moduleConfig[module];
  const Icon = config.icon;

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          {config.label}
        </CardTitle>
        <Badge variant={status.active ? 'default' : 'secondary'}>
          {status.active ? 'Active' : 'Inactive'}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{config.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Health: {status.health}%
          </span>
          {status.lastCheck && (
            <span className="text-xs text-muted-foreground">
              {new Date(status.lastCheck).toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
