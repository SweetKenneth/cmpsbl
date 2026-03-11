/**
 * Public Metrics Dashboard Tab
 * Single source of truth for all public-facing metrics
 * 
 * Update values here to sync across the entire substrate in real-time.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Save, RotateCcw, Check, AlertTriangle, 
  Layers, Zap, Cpu, Terminal, Code2, Settings, Users, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  usePublicMetricsStore, 
  DEFAULT_METRICS,
  type PublicMetrics 
} from '@/stores/publicMetricsStore';

// Metric field configuration
interface MetricField {
  key: keyof PublicMetrics;
  label: string;
  description: string;
  type: 'number' | 'string' | 'boolean';
  icon: React.ElementType;
  category: 'version' | 'architecture' | 'synergy' | 'engine' | 'capability' | 'other';
}

const METRIC_FIELDS: MetricField[] = [
  // Version
  { key: 'version', label: 'Version', description: 'Substrate version (e.g., 9.1.0)', type: 'string', icon: Settings, category: 'version' },
  { key: 'codename', label: 'Codename', description: 'Epoch codename (e.g., ARCHITECT)', type: 'string', icon: Settings, category: 'version' },
  { key: 'epoch', label: 'Epoch', description: 'Current epoch name', type: 'string', icon: Settings, category: 'version' },
  
  // Architecture
  { key: 'modulesCount', label: 'Nodes', description: 'Total substrate nodes', type: 'number', icon: Layers, category: 'architecture' },
  { key: 'layersCount', label: 'Layers', description: 'Architectural layers', type: 'number', icon: Layers, category: 'architecture' },
  
  // Synergy
  { key: 'synergyPipelinesCount', label: 'Synergy Memories', description: '98 core + 22 S-tier + 27 discovery', type: 'number', icon: Zap, category: 'synergy' },
  { key: 'synergyExecutorsCount', label: 'Synergy Executors', description: 'Custom executor functions', type: 'number', icon: Zap, category: 'synergy' },
  { key: 'stierPipelinesCount', label: 'S-Tier Memories', description: 'Premium synergy memories', type: 'number', icon: Zap, category: 'synergy' },
  
  // Engines
  { key: 'enginesCount', label: 'Engines', description: 'Base engine count', type: 'number', icon: Cpu, category: 'engine' },
  { key: 'metaEnginesCount', label: 'Meta-Engines', description: 'Orchestrating meta-engines', type: 'number', icon: Cpu, category: 'engine' },
  
  // Capabilities
  { key: 'capabilitiesCount', label: 'Capabilities', description: 'Total registered capabilities', type: 'number', icon: Terminal, category: 'capability' },
  { key: 'archivedCapabilitiesCount', label: 'Archived Capabilities', description: 'Legacy capabilities available', type: 'number', icon: Terminal, category: 'capability' },
  { key: 'terminalCommandsCount', label: 'Terminal Commands', description: 'Total CLI commands', type: 'number', icon: Terminal, category: 'capability' },
  
  // Other
  { key: 'integrationAdaptersCount', label: 'Integration Adapters', description: 'Enterprise connectors', type: 'number', icon: Users, category: 'other' },
  { key: 'linesOfCode', label: 'Lines of Code', description: 'Total codebase size', type: 'number', icon: Code2, category: 'other' },
  { key: 'linesOfCodeDisplay', label: 'LOC Display', description: 'Display string (e.g., 175k+)', type: 'string', icon: Code2, category: 'other' },
  { key: 'routingLatencyClaim', label: 'Routing Latency', description: 'Performance claim', type: 'string', icon: Eye, category: 'other' },
  { key: 'wcagLevel', label: 'WCAG Level', description: 'Accessibility standard', type: 'string', icon: Users, category: 'other' },
  { key: 'providersCount', label: 'AI Providers', description: 'Supported providers', type: 'number', icon: Zap, category: 'other' },
  { key: 'byokSupported', label: 'BYOK Supported', description: 'Bring your own key', type: 'boolean', icon: Settings, category: 'other' },
];

const CATEGORIES = [
  { id: 'version', label: 'Version Info', icon: Settings },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'synergy', label: 'Synergy Engine', icon: Zap },
  { id: 'engine', label: 'Engines', icon: Cpu },
  { id: 'capability', label: 'Capabilities', icon: Terminal },
  { id: 'other', label: 'Other Metrics', icon: BarChart3 },
];

export function PublicMetricsTab() {
  const { metrics, lastUpdated, updateMetric, updateMetrics, resetToDefaults } = usePublicMetricsStore();
  const [localMetrics, setLocalMetrics] = useState<PublicMetrics>({ ...metrics });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof PublicMetrics, value: string | number | boolean) => {
    setLocalMetrics(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaving(true);
    
    // Apply all changes
    updateMetrics(localMetrics);
    
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      toast.success('Public metrics updated', {
        description: 'Changes will sync across the entire substrate.',
      });
    }, 500);
  };

  const handleReset = () => {
    setLocalMetrics({ ...DEFAULT_METRICS });
    setHasChanges(true);
  };

  const handleRevert = () => {
    setLocalMetrics({ ...metrics });
    setHasChanges(false);
  };

  const renderField = (field: MetricField) => {
    const value = localMetrics[field.key];
    const defaultValue = DEFAULT_METRICS[field.key];
    const isModified = value !== defaultValue;

    if (field.type === 'boolean') {
      return (
        <div key={field.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
          <div className="flex items-center gap-3">
            <field.icon className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label className="text-sm font-medium">{field.label}</Label>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isModified && <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">modified</Badge>}
            <Switch 
              checked={value as boolean}
              onCheckedChange={(checked) => handleChange(field.key, checked)}
            />
          </div>
        </div>
      );
    }

    return (
      <div key={field.key} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
        <field.icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium">{field.label}</Label>
          <p className="text-xs text-muted-foreground truncate">{field.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isModified && <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">modified</Badge>}
          <Input
            type={field.type === 'number' ? 'number' : 'text'}
            value={value as string | number}
            onChange={(e) => handleChange(
              field.key, 
              field.type === 'number' ? Number(e.target.value) : e.target.value
            )}
            className="w-32 h-8 text-sm font-mono"
          />
        </div>
      </div>
    );
  };

  return (
    <motion.main 
      className="container mx-auto px-4 py-6 max-w-6xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Public Metrics</h1>
            <p className="text-sm text-muted-foreground font-mono">
              Single source of truth • v{metrics.version} {metrics.codename}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={handleRevert}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Revert
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={hasChanges ? 'bg-primary text-primary-foreground' : ''}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                {hasChanges ? <Save className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                {hasChanges ? 'Save Changes' : 'Saved'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Site-wide synchronization</p>
              <p className="text-xs text-muted-foreground mt-1">
                Any changes here will automatically update across the entire substrate — hero stats, 
                terminal output, documentation, and all marketing surfaces. Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {CATEGORIES.map((category) => {
          const fields = METRIC_FIELDS.filter(f => f.category === category.id);
          if (fields.length === 0) return null;
          
          return (
            <Card key={category.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <category.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {fields.length} metric{fields.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="max-h-[300px]">
                  {fields.map(renderField)}
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Preview */}
      <Card className="mt-6 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview
          </CardTitle>
          <CardDescription className="text-xs">
            How metrics will appear across the substrate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{localMetrics.modulesCount}</p>
              <p className="text-xs text-muted-foreground">Nodes</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{localMetrics.synergyPipelinesCount}</p>
              <p className="text-xs text-muted-foreground">Memories</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{localMetrics.enginesCount + localMetrics.metaEnginesCount}</p>
              <p className="text-xs text-muted-foreground">Engines</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{localMetrics.capabilitiesCount}</p>
              <p className="text-xs text-muted-foreground">Capabilities</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{localMetrics.terminalCommandsCount}</p>
              <p className="text-xs text-muted-foreground">Commands</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{localMetrics.linesOfCodeDisplay}</p>
              <p className="text-xs text-muted-foreground">Lines of Code</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.main>
  );
}

export default PublicMetricsTab;
