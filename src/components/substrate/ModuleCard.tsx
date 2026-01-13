/**
 * promptfluid® Module Card Component
 * Displays status for a single substrate module
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Shield, Zap, Eye } from 'lucide-react';
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
    color: 'text-purple-500',
  },
  cascade: {
    icon: MessageSquare,
    label: 'Cascade',
    description: 'User interaction, chat, dreams',
    color: 'text-blue-500',
  },
  defense: {
    icon: Shield,
    label: 'Defense',
    description: 'Security, bot detection',
    color: 'text-red-500',
  },
  nexus: {
    icon: Zap,
    label: 'Nexus',
    description: 'AI routing, multi-provider',
    color: 'text-yellow-500',
  },
  vision: {
    icon: Eye,
    label: 'Vision',
    description: 'Observability, metrics',
    color: 'text-green-500',
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
