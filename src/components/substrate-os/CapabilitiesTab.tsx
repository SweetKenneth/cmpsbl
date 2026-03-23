/**
 * Capabilities Control Panel
 * ARCHITECT — Dashboard tab for toggling 400+ capabilities on/off
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Shield, Brain, AlertTriangle, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, RefreshCw, Search, Filter, 
  ArrowUpRight, Clock, Activity, Sparkles, Eye, Power
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  ARCHIVED_CAPABILITIES, 
  type ArchivedCapabilityDef,
  runScanArchived,
  adaptArchivedCapabilities,
} from '@/lib/capabilities/archived-loader';
import { 
  useCapabilityState,
  setCapabilityEnabled,
  enableAllCapabilities,
  disableAllCapabilities,
} from '@/lib/capabilities/state';
import { listCapabilities, getManifest, type RegisteredCapability } from '@/lib/capabilities';

// Risk level colors
const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/30' },
  medium: { bg: 'bg-neon-amber/10', text: 'text-neon-amber', border: 'border-neon-amber/30' },
  high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
};

// Module icon mapping
const moduleIcons: Record<string, React.ElementType> = {
  BRAIN: Brain,
  DEFENSE: Shield,
  SYSTEM: Activity,
  EVOLUTION: Sparkles,
  CORTEX: Zap,
  DECODE: Eye,
  'DREAM Engine': Sparkles,
  VISION: Eye,
  CORE: Power,
};

interface CapabilityCardProps {
  capability: ArchivedCapabilityDef;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  lastToggled?: string;
}

function CapabilityCard({ capability, enabled, onToggle, lastToggled }: CapabilityCardProps) {
  const risk = riskColors[capability.risk] || riskColors.low;
  const ModuleIcon = moduleIcons[capability.modules[0]] || Zap;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        enabled 
          ? "bg-muted/20 border-border/50 hover:border-border" 
          : "bg-muted/5 border-border/20 opacity-60"
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-2 h-2 rounded-full",
        enabled ? "bg-neon-green animate-pulse" : "bg-muted-foreground/30"
      )} />
      
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          enabled ? risk.bg : "bg-muted/10",
          enabled ? risk.border : "border-muted/20",
          "border"
        )}>
          <ModuleIcon className={cn("w-5 h-5", enabled ? risk.text : "text-muted-foreground/50")} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-semibold text-sm truncate",
              enabled ? "text-foreground" : "text-muted-foreground"
            )}>
              {capability.name}
            </h3>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[9px] h-4 shrink-0",
                enabled ? `${risk.border} ${risk.text}` : "border-muted/30 text-muted-foreground"
              )}
            >
              {capability.risk.toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {capability.description}
          </p>
          
          {/* Modules */}
          <div className="flex items-center gap-1 flex-wrap mb-3">
            {capability.modules.map((mod) => (
              <Badge 
                key={mod} 
                variant="secondary" 
                className="text-[9px] h-4 bg-muted/30"
              >
                {mod}
              </Badge>
            ))}
          </div>
          
          {/* Toggle & Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-neon-green"
              />
              <span className="text-[10px] text-muted-foreground">
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            {lastToggled && (
              <span className="text-[9px] text-muted-foreground/60 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(lastToggled).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Value indicator */}
      <div className="absolute bottom-3 right-3">
        <span className={cn(
          "text-[9px] font-mono",
          capability.valueScore >= 90 ? "text-neon-green" :
          capability.valueScore >= 80 ? "text-neon-amber" :
          "text-muted-foreground"
        )}>
          v{capability.valueScore}
        </span>
      </div>
    </motion.div>
  );
}

export function CapabilitiesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  
  // Get state from store
  const capabilityStates = useCapabilityState((state) => state.capabilities);
  const getState = useCapabilityState((state) => state.getState);
  
  // Initialize capabilities on mount
  useEffect(() => {
    // Run initial adaptation to populate registry
    const result = adaptArchivedCapabilities({ dryRun: false, verbose: false });
    setLastScan(result.timestamp);
  }, []);
  
  // Filter capabilities
  const filteredCapabilities = ARCHIVED_CAPABILITIES.filter((cap) => {
    const matchesSearch = 
      cap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cap.modules.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRisk = !filterRisk || cap.risk === filterRisk;
    
    return matchesSearch && matchesRisk;
  });
  
  // Stats
  const enabledCount = ARCHIVED_CAPABILITIES.filter(cap => {
    const state = getState(cap.id);
    return state?.enabled ?? true;
  }).length;
  
  const handleToggle = (capId: string, enabled: boolean) => {
    setCapabilityEnabled(capId, enabled, 'dashboard');
    toast.success(`${capId} ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleScan = async () => {
    setScanning(true);
    try {
      const result = runScanArchived({ 
        dryRun: false, 
        confirm: true, 
        verbose: true 
      });
      setLastScan(result.timestamp);
      toast.success(`Scan complete: ${result.adaptedCount} adapted, ${result.blockedCount} blocked`);
    } catch (err) {
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };
  
  const handleEnableAll = () => {
    enableAllCapabilities();
    toast.success('All capabilities enabled');
  };
  
  const handleDisableAll = () => {
    disableAllCapabilities();
    toast.success('All capabilities disabled');
  };
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-muted/10 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{ARCHIVED_CAPABILITIES.length}</p>
                <p className="text-[10px] text-muted-foreground font-mono">TOTAL</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/10 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{enabledCount}</p>
                <p className="text-[10px] text-muted-foreground font-mono">ENABLED</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/10 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-neon-amber" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{ARCHIVED_CAPABILITIES.length - enabledCount}</p>
                <p className="text-[10px] text-muted-foreground font-mono">DISABLED</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/10 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(ARCHIVED_CAPABILITIES.reduce((sum, c) => sum + c.valueScore, 0) / ARCHIVED_CAPABILITIES.length)}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">AVG VALUE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search capabilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-muted/10 border-border/30"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterRisk(filterRisk === 'low' ? null : 'low')}
            className={cn(
              "text-xs",
              filterRisk === 'low' && "bg-neon-green/10 border-neon-green/30 text-neon-green"
            )}
          >
            Low Risk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterRisk(filterRisk === 'medium' ? null : 'medium')}
            className={cn(
              "text-xs",
              filterRisk === 'medium' && "bg-neon-amber/10 border-neon-amber/30 text-neon-amber"
            )}
          >
            Medium Risk
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnableAll}
            className="text-xs"
          >
            <ToggleRight className="w-3 h-3 mr-1" />
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisableAll}
            className="text-xs"
          >
            <ToggleLeft className="w-3 h-3 mr-1" />
            Disable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScan}
            disabled={scanning}
            className="text-xs"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", scanning && "animate-spin")} />
            Scan
          </Button>
        </div>
      </div>
      
      {/* Last scan info */}
      {lastScan && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Last scan: {new Date(lastScan).toLocaleString()}
        </div>
      )}
      
      {/* Capability Grid */}
      <ScrollArea className="h-[500px]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          <AnimatePresence mode="popLayout">
            {filteredCapabilities.map((cap) => {
              const state = getState(cap.id);
              return (
                <CapabilityCard
                  key={cap.id}
                  capability={cap}
                  enabled={state?.enabled ?? true}
                  onToggle={(enabled) => handleToggle(cap.id, enabled)}
                  lastToggled={state?.lastToggled}
                />
              );
            })}
          </AnimatePresence>
        </div>
        
        {filteredCapabilities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No capabilities match your search</p>
          </div>
        )}
      </ScrollArea>
      
      {/* Footer note */}
      <div className="text-[10px] text-muted-foreground/60 text-center">
        400+ Registered Capabilities
      </div>
    </div>
  );
}

export default CapabilitiesTab;
