/**
 * Enhanced Bot Builder — D-Mode Multi-Class Manufacturing
 * Supports all cognitive classes with full capability selection
 */

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Loader2, Download, Github, CheckCircle2, Rocket, 
  Search, Code, BarChart3, Workflow, PenLine, Layers,
  Zap, Clock, Database, GitBranch, Moon, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  BOT_CLASSES, MEMORY_MODES, LEARNING_MODES, PROVIDERS,
  getClassById, BotClass, MemoryMode, LearningMode, Provider 
} from '@/lib/forge/botClasses';
import { createExportBundle, downloadBundle, ExportConfig } from '@/lib/forge/botExporter';

const CLASS_ICONS: Record<string, React.ElementType> = {
  Search, Code, BarChart3, Workflow, PenLine, Layers,
};

const MEMORY_ICONS: Record<string, React.ElementType> = {
  Zap, Clock, Database, GitBranch, Moon,
};

interface EnhancedBotBuilderProps {
  onSuccess?: () => void;
}

export function EnhancedBotBuilder({ onSuccess }: EnhancedBotBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'class' | 'config' | 'success'>('class');
  const [mintedCognitive, setMintedCognitive] = useState<ExportConfig | null>(null);

  // Form state
  const [botName, setBotName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('Research');
  const [memoryMode, setMemoryMode] = useState<MemoryMode>('Episodic');
  const [learningModes, setLearningModes] = useState<LearningMode[]>(['task']);
  const [providers, setProviders] = useState<Provider[]>(['Groq']);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [dreamEnabled, setDreamEnabled] = useState(false);
  const [graphEnabled, setGraphEnabled] = useState(false);

  const currentClass = useMemo(() => getClassById(selectedClass), [selectedClass]);

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    const cls = getClassById(classId);
    // Pre-select first 3 capabilities
    setCapabilities(cls?.capabilities.slice(0, 3).map(c => c.id) || []);
    setStep('config');
  };

  const toggleProvider = (id: Provider) => {
    setProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleLearningMode = (id: LearningMode) => {
    setLearningModes(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleCapability = (id: string) => {
    setCapabilities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleMint = async () => {
    if (!botName.trim()) {
      toast.error('Cognitive name is required');
      return;
    }
    if (providers.length === 0) {
      toast.error('Select at least one provider');
      return;
    }
    if (capabilities.length === 0 && selectedClass !== 'Hybrid') {
      toast.error('Select at least one capability');
      return;
    }

    setLoading(true);
    try {
      const config: ExportConfig = {
        id: crypto.randomUUID(),
        name: botName,
        class: selectedClass,
        version: '1.0.0',
        memoryMode,
        learningModes,
        capabilities,
        providers,
        dreamEnabled,
        graphEnabled,
      };

      // Store in cognitive_registry
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from('cognitive_registry')
        .insert({
          id: config.id,
          name: config.name,
          class: config.class,
          version: config.version,
          owner: user?.id,
          memory_mode: config.memoryMode,
          learning_mode: config.learningModes,
          dream_enabled: config.dreamEnabled,
          graph_enabled: config.graphEnabled,
          capabilities: config.capabilities,
          providers: config.providers,
          status: 'active',
        });

      if (insertError) throw insertError;

      // Log event
      await supabase.from('brain_events').insert({
        module: 'forge',
        event_type: 'cognitive_minted',
        data: {
          cognitive_id: config.id,
          name: config.name,
          class: config.class,
          version: config.version,
        },
        outcome: 'success',
      });

      setMintedCognitive(config);
      setStep('success');
      toast.success(`Cognitive "${botName}" minted successfully!`);
    } catch (err) {
      console.error('Mint error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to mint cognitive');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!mintedCognitive) return;
    
    try {
      const bundle = await createExportBundle(mintedCognitive);
      downloadBundle(bundle);
      toast.success('Export bundle downloaded');
    } catch (err) {
      toast.error('Failed to create export bundle');
    }
  };

  const handleReset = () => {
    setMintedCognitive(null);
    setBotName('');
    setSelectedClass('Research');
    setCapabilities([]);
    setStep('class');
    onSuccess?.();
  };

  // Success Screen
  if (step === 'success' && mintedCognitive) {
    return (
      <Card className="border-neon-green/30 bg-black/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-neon-green/20 border border-neon-green/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <CardTitle className="text-lg">Cognitive Minted</CardTitle>
              <CardDescription>Ready for deployment</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-black/30 border border-border/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{mintedCognitive.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Class</p>
              <Badge 
                variant="outline" 
                className={cn(
                  "border-" + (currentClass?.color || 'gray') + "-500/50",
                  "text-" + (currentClass?.color || 'gray') + "-400"
                )}
              >
                {mintedCognitive.class}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Version</p>
              <code className="text-xs bg-background px-1.5 py-0.5 rounded">
                v{mintedCognitive.version}
              </code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Memory</p>
              <Badge variant="secondary" className="text-xs">
                {mintedCognitive.memoryMode}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} className="gap-2 bg-gradient-to-r from-neon-green to-neon-cyan hover:from-neon-green hover:to-neon-cyan">
              <Download className="w-4 h-4" />
              Download Bundle
            </Button>
            <Button variant="outline" disabled className="gap-2 border-border/50">
              <Github className="w-4 h-4" />
              Push to Repo
              <Badge variant="secondary" className="text-[9px] ml-1">Soon</Badge>
            </Button>
            <Button variant="outline" disabled className="gap-2 border-border/50">
              <Rocket className="w-4 h-4" />
              Deploy Runtime
              <Badge variant="secondary" className="text-[9px] ml-1">Soon</Badge>
            </Button>
          </div>

          <Separator />

          <Button variant="ghost" onClick={handleReset} className="w-full">
            Build Another Cognitive
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Class Selection Screen
  if (step === 'class') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Choose Cognitive Class</h2>
          <p className="text-sm text-muted-foreground">
            Select the type of cognitive to manufacture
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOT_CLASSES.map((cls) => {
            const Icon = CLASS_ICONS[cls.icon] || Layers;
            const colorClasses = {
              cyan: 'border-neon-cyan/30 hover:border-neon-cyan/60 hover:shadow-neon-cyan/20',
              emerald: 'border-neon-green/30 hover:border-neon-green/60 hover:shadow-neon-green/20',
              violet: 'border-neon-purple/30 hover:border-neon-purple/60 hover:shadow-neon-purple/20',
              amber: 'border-neon-amber/30 hover:border-neon-amber/60 hover:shadow-neon-amber/20',
              rose: 'border-neon-magenta/30 hover:border-neon-magenta/60 hover:shadow-neon-magenta/20',
              fuchsia: 'border-neon-magenta/30 hover:border-neon-magenta/60 hover:shadow-neon-magenta/20',
            };
            const iconBgClasses = {
              cyan: 'bg-neon-cyan/20 border-neon-cyan/40',
              emerald: 'bg-neon-green/20 border-neon-green/40',
              violet: 'bg-neon-purple/20 border-neon-purple/40',
              amber: 'bg-neon-amber/20 border-neon-amber/40',
              rose: 'bg-neon-magenta/20 border-neon-magenta/40',
              fuchsia: 'bg-neon-magenta/20 border-neon-magenta/40',
            };
            const iconTextClasses = {
              cyan: 'text-neon-cyan',
              emerald: 'text-neon-green',
              violet: 'text-neon-purple',
              amber: 'text-neon-amber',
              rose: 'text-neon-magenta',
              fuchsia: 'text-neon-magenta',
            };
            return (
              <div 
                key={cls.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                  "rounded-xl p-4 backdrop-blur-xl",
                  "bg-muted/50 dark:bg-white/[0.03]",
                  "border hover:shadow-lg",
                  colorClasses[cls.color as keyof typeof colorClasses] || colorClasses.cyan
                )}
                onClick={() => handleClassSelect(cls.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                    iconBgClasses[cls.color as keyof typeof iconBgClasses] || iconBgClasses.cyan
                  )}>
                    <Icon className={cn("w-5 h-5", iconTextClasses[cls.color as keyof typeof iconTextClasses] || iconTextClasses.cyan)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm mb-1 text-foreground">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {cls.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge variant="outline" className="text-[10px] h-5 bg-background/50 backdrop-blur-sm">
                        {cls.capabilities.length} capabilities
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Configuration Screen
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setStep('class')}
          className="text-muted-foreground"
        >
          ← Back
        </Button>
        {currentClass && (
          <Badge 
            variant="outline" 
            className={cn(
              `border-${currentClass.color}-500/50 text-${currentClass.color}-400 bg-${currentClass.color}-500/10`
            )}
          >
            {currentClass.name}
          </Badge>
        )}
      </div>

      <Card className="border-border/50 bg-black/40">
        <CardHeader>
          <CardTitle className="text-lg">Configure Cognitive</CardTitle>
          <CardDescription>Set up capabilities and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="cogName">Cognitive Name *</Label>
            <Input
              id="cogName"
              placeholder="e.g., MarketResearcher"
              value={botName}
              onChange={e => setBotName(e.target.value)}
              disabled={loading}
              className="bg-black/30"
            />
          </div>

          {/* Memory Mode */}
          <div className="space-y-3">
            <Label>Memory Mode *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MEMORY_MODES.map((mode) => {
                const Icon = MEMORY_ICONS[mode.icon] || Database;
                const isSelected = memoryMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setMemoryMode(mode.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      isSelected 
                        ? "border-neon-cyan/50 bg-neon-cyan/10" 
                        : "border-border/30 bg-black/20 hover:border-border/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn("w-4 h-4", isSelected ? "text-neon-cyan" : "text-muted-foreground")} />
                      <span className="text-sm font-medium">{mode.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{mode.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capabilities */}
          {currentClass && currentClass.capabilities.length > 0 && (
            <div className="space-y-3">
              <Label>Capabilities *</Label>
              <ScrollArea className="h-[180px] rounded-lg border border-border/30 bg-black/20 p-3">
                <div className="space-y-2">
                  {currentClass.capabilities.map((cap) => (
                    <div key={cap.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`cap-${cap.id}`}
                        checked={capabilities.includes(cap.id)}
                        onCheckedChange={() => toggleCapability(cap.id)}
                        disabled={loading}
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={`cap-${cap.id}`} className="text-sm font-medium cursor-pointer">
                          {cap.name}
                        </label>
                        <p className="text-xs text-muted-foreground">{cap.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Learning Modes */}
          <div className="space-y-3">
            <Label>Learning Modes</Label>
            <div className="flex flex-wrap gap-2">
              {LEARNING_MODES.map((mode) => (
                <Badge
                  key={mode.id}
                  variant={learningModes.includes(mode.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    learningModes.includes(mode.id) 
                      ? "bg-neon-magenta/20 text-neon-magenta border-neon-magenta/50" 
                      : "border-border/50 hover:border-border"
                  )}
                  onClick={() => toggleLearningMode(mode.id)}
                >
                  {mode.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Providers */}
          <div className="space-y-3">
            <Label>AI Providers *</Label>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((provider) => (
                <Badge
                  key={provider.id}
                  variant={providers.includes(provider.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    providers.includes(provider.id) 
                      ? "bg-neon-green/20 text-neon-green border-neon-green/50" 
                      : "border-border/50 hover:border-border"
                  )}
                  onClick={() => toggleProvider(provider.id)}
                >
                  {provider.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Advanced Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dream Learning</Label>
                <p className="text-xs text-muted-foreground">Enable dream-based memory synthesis</p>
              </div>
              <Switch checked={dreamEnabled} onCheckedChange={setDreamEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Knowledge Graph</Label>
                <p className="text-xs text-muted-foreground">Build connected knowledge structures</p>
              </div>
              <Switch checked={graphEnabled} onCheckedChange={setGraphEnabled} />
            </div>
          </div>

          <Separator />

          {/* Submit */}
          <Button
            onClick={handleMint}
            disabled={loading || !botName.trim() || providers.length === 0}
            className="w-full gap-2 bg-gradient-to-r from-neon-amber to-neon-amber hover:from-neon-amber hover:to-neon-amber"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Manufacturing Cognitive...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Mint Cognitive
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
