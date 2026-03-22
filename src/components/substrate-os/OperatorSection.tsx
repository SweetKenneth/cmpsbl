/**
 * Operator Section — Safe Control Actions
 * Trigger brain cycles, dream operations, routing tests
 */

import { useState } from 'react';
import { Play, Sparkles, Moon, Route, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  useBrainReflectOS,
  useBrainDreamOS,
  useBrainSynthesizeOS,
  useDreamCycleOS,
  useNexusRouteTest,
} from '@/hooks/useSubstrateOS';

interface OperatorActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  onAction: () => void;
  isPending: boolean;
  disabled?: boolean;
}

function OperatorActionCard({ 
  title, 
  description, 
  icon: Icon, 
  iconColor, 
  onAction, 
  isPending,
  disabled 
}: OperatorActionCardProps) {
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${(iconColor ?? 'text-primary').replace('text-', 'bg-')}/10 flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          <Button 
            size="sm" 
            onClick={onAction}
            disabled={isPending || disabled}
            className="shrink-0"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function OperatorSection({ enabled = true }: { enabled?: boolean }) {
  const [routePrompt, setRoutePrompt] = useState('');
  const [routeResult, setRouteResult] = useState<any>(null);

  const reflectMutation = useBrainReflectOS();
  const dreamMutation = useBrainDreamOS();
  const synthesizeMutation = useBrainSynthesizeOS();
  const dreamCycleMutation = useDreamCycleOS();
  const routeTestMutation = useNexusRouteTest();

  const handleAction = async (
    action: () => Promise<any>,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      const result = await action();
      if (result?.success) {
        toast.success(successMessage);
      } else {
        toast.error(result?.error || errorMessage);
      }
    } catch (error) {
      toast.error(errorMessage);
    }
  };

  const handleRouteTest = async () => {
    if (!routePrompt.trim()) {
      toast.error('Enter a prompt to test routing');
      return;
    }

    try {
      const result = await routeTestMutation.mutateAsync(routePrompt);
      setRouteResult(result);
      if (result?.success) {
        toast.success('Routing test complete');
      } else {
        toast.error('Routing test failed');
      }
    } catch {
      toast.error('Routing test error');
    }
  };

  if (!enabled) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-amber/10 flex items-center justify-center">
            <Play className="w-4 h-4 text-neon-amber" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-muted-foreground">Operator</h2>
          <Badge variant="outline" className="text-xs">Locked</Badge>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground italic">
              Operator controls require elevated privileges. Contact a governor to request access.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4 md:space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neon-amber/10 flex items-center justify-center">
          <Play className="w-4 h-4 text-neon-amber" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold">Operator</h2>
        <Badge variant="outline" className="text-xs bg-neon-amber/10 text-neon-amber border-neon-amber/20">
          Actions
        </Badge>
      </div>

      {/* Action Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        <OperatorActionCard
          title="Brain Reflect"
          description="Synthesize recent memories into reflections"
          icon={Sparkles}
          iconColor="text-neon-cyan"
          onAction={() => handleAction(
            () => reflectMutation.mutateAsync(),
            'Reflection cycle complete',
            'Reflection failed'
          )}
          isPending={reflectMutation.isPending}
        />

        <OperatorActionCard
          title="Brain Dream"
          description="Process hot memories through dream cycle"
          icon={Moon}
          iconColor="text-primary"
          onAction={() => handleAction(
            () => dreamMutation.mutateAsync(),
            'Dream cycle initiated',
            'Dream cycle failed'
          )}
          isPending={dreamMutation.isPending}
        />

        <OperatorActionCard
          title="Brain Synthesize"
          description="Cross-domain cognitive synthesis"
          icon={Sparkles}
          iconColor="text-neon-purple"
          onAction={() => handleAction(
            () => synthesizeMutation.mutateAsync(),
            'Synthesis complete',
            'Synthesis failed'
          )}
          isPending={synthesizeMutation.isPending}
        />

        <OperatorActionCard
          title="Dream-Eater Cycle"
          description="Trigger dream consumption and mutation"
          icon={Moon}
          iconColor="text-neon-purple"
          onAction={() => handleAction(
            () => dreamCycleMutation.mutateAsync(),
            'Dream-Eater cycle complete',
            'Dream-Eater cycle failed'
          )}
          isPending={dreamCycleMutation.isPending}
        />
      </div>

      {/* Route Test */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="w-4 h-4 text-neon-green" />
            Nexus Route Test
          </CardTitle>
          <CardDescription className="text-xs">
            Test provider routing with a sample prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter test prompt..."
              value={routePrompt}
              onChange={(e) => setRoutePrompt(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleRouteTest()}
            />
            <Button 
              onClick={handleRouteTest}
              disabled={routeTestMutation.isPending || !routePrompt.trim()}
            >
              {routeTestMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
          </div>

          {routeResult && (
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <div className="flex items-center gap-2 mb-2">
                {routeResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <span className="font-medium">
                  {routeResult.success ? 'Route Success' : 'Route Failed'}
                </span>
              </div>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
                {JSON.stringify(routeResult.data || routeResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
