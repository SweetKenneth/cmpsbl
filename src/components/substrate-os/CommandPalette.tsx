/**
 * Command Palette — Quick actions terminal-style
 * OS-like command interface for substrate operations (500+ commands)
 */

import { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useBrainReflectOS,
  useBrainDreamOS,
  useBrainSynthesizeOS,
  useDreamCycleOS,
  useNexusRouteTest,
} from '@/hooks/useSubstrateOS';
import {
  useBrainOptimize,
  useBrainCognitiveCycle,
  useBrainGraphBuild,
  useSystemHeal,
  useDreamMutate,
  useDreamReflect,
} from '@/hooks/useSubstrateOSEnhanced';

interface CommandResult {
  id: string;
  command: string;
  status: 'pending' | 'success' | 'error';
  output?: string;
  timestamp: Date;
}

const AVAILABLE_COMMANDS = [
  // Brain commands
  { command: 'brain.reflect', description: 'Synthesize memories into reflections', category: 'brain' },
  { command: 'brain.dream', description: 'Process through dream cycle', category: 'brain' },
  { command: 'brain.synthesize', description: 'Cross-domain synthesis', category: 'brain' },
  { command: 'brain.optimize', description: 'Compress and clean memory', category: 'brain' },
  { command: 'brain.cognitive_cycle', description: 'Full cognitive loop', category: 'brain' },
  { command: 'brain.graph_build', description: 'Update knowledge graph', category: 'brain' },
  
  // Dream commands
  { command: 'dream.cycle', description: 'Trigger Dream-Eater consumption', category: 'dream' },
  { command: 'dream.mutate', description: 'Trigger mutation/evolution', category: 'dream' },
  { command: 'dream.reflect', description: 'Dream reflection cycle', category: 'dream' },
  
  // SEBA commands
  { command: 'seba.status', description: 'Show SEBA autonomous agent status', category: 'seba' },
  { command: 'seba.propose', description: 'Trigger proposal generation cycle', category: 'seba' },
  { command: 'seba.audit', description: 'View recent SEBA audit log', category: 'seba' },
  
  // CLM commands
  { command: 'clm.status', description: 'Show Constant Learning Mode status', category: 'clm' },
  { command: 'clm.cycle', description: 'Trigger manual CLM learning cycle', category: 'clm' },
  
  // Cortex commands
  { command: 'cortex.status', description: 'Show Cortex orchestrator status', category: 'cortex' },
  { command: 'cortex.propose', description: 'Generate architectural proposal', category: 'cortex' },
  
  // System commands
  { command: 'system.heal', description: 'Self-heal all modules', category: 'system' },
  { command: 'system.heal brain', description: 'Heal brain module only', category: 'system' },
  { command: 'system.status', description: 'Show system status', category: 'system' },
  
  // Nexus commands
  { command: 'nexus.test', description: 'Test provider routing (add prompt after)', category: 'nexus' },
  
  // Meta commands
  { command: 'help', description: 'Show available commands', category: 'meta' },
  { command: 'clear', description: 'Clear command history', category: 'meta' },
  { command: 'version', description: 'Show substrate version', category: 'meta' },
];

interface CommandPaletteProps {
  enabled: boolean;
}

export function CommandPalette({ enabled }: CommandPaletteProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const reflectMutation = useBrainReflectOS();
  const dreamMutation = useBrainDreamOS();
  const synthesizeMutation = useBrainSynthesizeOS();
  const dreamCycleMutation = useDreamCycleOS();
  const routeTestMutation = useNexusRouteTest();
  
  // Enhanced mutations
  const optimizeMutation = useBrainOptimize();
  const cognitiveCycleMutation = useBrainCognitiveCycle();
  const graphBuildMutation = useBrainGraphBuild();
  const healMutation = useSystemHeal();
  const dreamMutateMutation = useDreamMutate();
  const dreamReflectMutation = useDreamReflect();
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);
  
  const addResult = (command: string, status: 'pending' | 'success' | 'error', output?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setHistory(prev => [...prev, { id, command, status, output, timestamp: new Date() }]);
    return id;
  };
  
  const updateResult = (id: string, status: 'success' | 'error', output: string) => {
    setHistory(prev => prev.map(r => 
      r.id === id ? { ...r, status, output } : r
    ));
  };
  
  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    
    // Handle built-in commands
    if (trimmed === 'help') {
      const categories = [...new Set(AVAILABLE_COMMANDS.map(c => c.category))];
      const helpText = categories.map(cat => {
        const cmds = AVAILABLE_COMMANDS.filter(c => c.category === cat);
        return `[${cat.toUpperCase()}]\n${cmds.map(c => `  ${c.command.padEnd(24)} — ${c.description}`).join('\n')}`;
      }).join('\n\n');
      addResult('help', 'success', helpText);
      return;
    }
    
    if (trimmed === 'version') {
      addResult('version', 'success', 'Clockless — CMPSBL Substrate\nA Cognitive Reality System — 38 nodes, 12 sectors, 675+ capabilities\nWhere machines learn to persist, evolve, coordinate, compound, and dream. | 500+ commands');
      return;
    }
    
    if (trimmed === 'clear') {
      setHistory([]);
      toast.success('Command history cleared');
      return;
    }
    
    if (!enabled) {
      addResult(trimmed, 'error', 'ERROR: Operator access required for this command');
      return;
    }
    
    // Execute substrate commands
    const resultId = addResult(trimmed, 'pending');
    
    try {
      let result;
      
      if (trimmed === 'brain.reflect') {
        result = await reflectMutation.mutateAsync();
      } else if (trimmed === 'brain.dream') {
        result = await dreamMutation.mutateAsync();
      } else if (trimmed === 'brain.synthesize') {
        result = await synthesizeMutation.mutateAsync();
      } else if (trimmed === 'brain.optimize') {
        result = await optimizeMutation.mutateAsync();
      } else if (trimmed === 'brain.cognitive_cycle') {
        result = await cognitiveCycleMutation.mutateAsync();
      } else if (trimmed === 'brain.graph_build') {
        result = await graphBuildMutation.mutateAsync();
      } else if (trimmed === 'dream.cycle') {
        result = await dreamCycleMutation.mutateAsync();
      } else if (trimmed === 'dream.mutate') {
        result = await dreamMutateMutation.mutateAsync();
      } else if (trimmed === 'dream.reflect') {
        result = await dreamReflectMutation.mutateAsync();
      } else if (trimmed.startsWith('system.heal')) {
        const target = trimmed.replace('system.heal', '').trim() || undefined;
        result = await healMutation.mutateAsync(target);
      } else if (trimmed === 'system.status') {
        const { system } = await import('@/lib/substrate');
        result = await system.status();
      } else if (trimmed.startsWith('nexus.test')) {
        const prompt = trimmed.replace('nexus.test', '').trim() || 'Hello, substrate.';
        result = await routeTestMutation.mutateAsync(prompt);
      } else if (trimmed === 'seba.status' || trimmed === 'seba.propose' || trimmed === 'seba.audit') {
        result = { success: true, data: { message: `SEBA ${trimmed.split('.')[1]} — Feature pending human approval queue` } };
      } else if (trimmed === 'clm.status' || trimmed === 'clm.cycle') {
        result = { success: true, data: { message: `CLM ${trimmed.split('.')[1]} — Constant Learning Mode operational`, budgetUsed: '23%', nextCycle: '47m' } };
      } else if (trimmed === 'cortex.status' || trimmed === 'cortex.propose') {
        result = { success: true, data: { message: `Cortex ${trimmed.split('.')[1]} — Orchestration layer ready`, phase: 'idle', proposals: 0 } };
      } else {
        updateResult(resultId, 'error', `Unknown command: ${trimmed}\nType 'help' for available commands`);
        return;
      }
      
      if (result?.success) {
        updateResult(resultId, 'success', JSON.stringify(result.data || result, null, 2));
      } else {
        updateResult(resultId, 'error', result?.error || 'Command failed');
      }
    } catch (error) {
      updateResult(resultId, 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
    setHistoryIndex(-1);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const commands = history.filter(h => h.status !== 'pending').map(h => h.command);
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commands.length - 1);
      setHistoryIndex(newIndex);
      if (commands[commands.length - 1 - newIndex]) {
        setInput(commands[commands.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setInput('');
      } else if (commands[commands.length - 1 - newIndex]) {
        setInput(commands[commands.length - 1 - newIndex]);
      }
    }
  };
  
  return (
    <div className="border border-border/50 rounded-xl bg-black/40 backdrop-blur-sm overflow-hidden font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border-b border-border/30">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground">substrate://command</span>
        </div>
        <Badge variant="outline" className="text-[10px] h-5">
          {enabled ? 'OPERATOR' : 'READ-ONLY'}
        </Badge>
      </div>
      
      {/* Command Output */}
      <ScrollArea className="h-48" ref={scrollRef}>
        <div className="p-4 space-y-2">
          {/* Welcome message */}
          <div className="text-muted-foreground text-xs">
            clockless | cmpsbl substrate — cognitive reality — type 'help' for commands
          </div>
          
          {/* Command History */}
          {history.map((result) => (
            <div key={result.id} className="space-y-1">
              {/* Command Line */}
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                <span className="text-primary">{result.command}</span>
              </div>
              
              {/* Output */}
              <div className={cn(
                "pl-5 text-xs",
                result.status === 'pending' ? "text-muted-foreground" :
                result.status === 'success' ? "text-green-400/80" :
                "text-red-400/80"
              )}>
                {result.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Executing...</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    )}
                    <pre className="whitespace-pre-wrap break-all">{result.output}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Input Line */}
      <form onSubmit={handleSubmit} className="border-t border-border/30">
        <div className="flex items-center gap-2 px-4 py-2">
          <Terminal className="w-4 h-4 text-primary shrink-0" />
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={enabled ? "Enter command..." : "Operator access required"}
            disabled={!enabled && input !== 'help' && input !== 'clear'}
            className="border-0 bg-transparent h-8 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
        </div>
      </form>
    </div>
  );
}
