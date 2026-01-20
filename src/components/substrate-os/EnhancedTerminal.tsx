/**
 * Enhanced Terminal v2026
 * Full-featured terminal with personality and 2026 aesthetics
 * Larger, more interactive command interface
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, ChevronRight, Loader2, CheckCircle2, XCircle, Cpu, Zap, Brain, Shield, Eye, Sparkles } from 'lucide-react';
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

// Terminal personality messages
const BOOT_MESSAGES = [
  '▓▓▓▓▓▓▓▓▓▓ substrate os v2026.01',
  '◉ cognitive kernel loaded',
  '◉ neural pathways initialized',
  '◉ memory banks online',
  '◉ dream-eater: standby',
  '────────────────────────────────',
  'type \'help\' for available commands',
  '',
];

const PERSONALITY_RESPONSES = {
  greeting: [
    'standing by for orders...',
    'neural pathways ready.',
    'cognitive substrate: online.',
    'awaiting input...',
  ],
  success: [
    'operation complete.',
    'task executed successfully.',
    'neural pathways confirmed.',
    'cognitive loop closed.',
  ],
  error: [
    'anomaly detected.',
    'pathway failed.',
    'cognitive disruption.',
    'attempting recovery...',
  ],
  thinking: [
    'processing neural patterns...',
    'traversing knowledge graph...',
    'synthesizing insights...',
    'cognitive cycle in progress...',
  ],
};

const AVAILABLE_COMMANDS = [
  { command: 'brain.reflect', description: 'Synthesize memories into reflections', category: 'brain', icon: Brain },
  { command: 'brain.dream', description: 'Process through dream cycle', category: 'brain', icon: Brain },
  { command: 'brain.synthesize', description: 'Cross-domain synthesis', category: 'brain', icon: Brain },
  { command: 'brain.optimize', description: 'Compress and clean memory', category: 'brain', icon: Brain },
  { command: 'brain.cognitive_cycle', description: 'Full cognitive loop', category: 'brain', icon: Brain },
  { command: 'brain.graph_build', description: 'Update knowledge graph', category: 'brain', icon: Brain },
  { command: 'dream.cycle', description: 'Trigger Dream-Eater consumption', category: 'dream', icon: Sparkles },
  { command: 'dream.mutate', description: 'Trigger mutation/evolution', category: 'dream', icon: Sparkles },
  { command: 'dream.reflect', description: 'Dream reflection cycle', category: 'dream', icon: Sparkles },
  { command: 'system.heal', description: 'Self-heal all modules', category: 'system', icon: Shield },
  { command: 'system.heal brain', description: 'Heal brain module only', category: 'system', icon: Shield },
  { command: 'system.status', description: 'Show system status', category: 'system', icon: Eye },
  { command: 'nexus.test', description: 'Test provider routing', category: 'nexus', icon: Zap },
  { command: 'help', description: 'Show available commands', category: 'meta', icon: Terminal },
  { command: 'clear', description: 'Clear command history', category: 'meta', icon: Terminal },
  { command: 'whoami', description: 'Display substrate identity', category: 'meta', icon: Cpu },
];

interface EnhancedTerminalProps {
  enabled: boolean;
  className?: string;
  fullHeight?: boolean;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function EnhancedTerminal({ enabled, className, fullHeight = false }: EnhancedTerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const reflectMutation = useBrainReflectOS();
  const dreamMutation = useBrainDreamOS();
  const synthesizeMutation = useBrainSynthesizeOS();
  const dreamCycleMutation = useDreamCycleOS();
  const routeTestMutation = useNexusRouteTest();
  const optimizeMutation = useBrainOptimize();
  const cognitiveCycleMutation = useBrainCognitiveCycle();
  const graphBuildMutation = useBrainGraphBuild();
  const healMutation = useSystemHeal();
  const dreamMutateMutation = useDreamMutate();
  const dreamReflectMutation = useDreamReflect();

  // Boot animation
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < BOOT_MESSAGES.length) {
        setBootLines(prev => [...prev, BOOT_MESSAGES[idx]]);
        idx++;
      } else {
        setBootComplete(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, bootLines]);

  const addResult = useCallback((command: string, status: 'pending' | 'success' | 'error', output?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setHistory(prev => [...prev, { id, command, status, output, timestamp: new Date() }]);
    return id;
  }, []);

  const updateResult = useCallback((id: string, status: 'success' | 'error', output: string) => {
    setHistory(prev => prev.map(r => 
      r.id === id ? { ...r, status, output } : r
    ));
  }, []);

  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    // Handle built-in commands
    if (trimmed === 'help') {
      const categories = [...new Set(AVAILABLE_COMMANDS.map(c => c.category))];
      const helpText = categories.map(cat => {
        const cmds = AVAILABLE_COMMANDS.filter(c => c.category === cat);
        return `┌─ ${cat.toUpperCase()} ─────────────────────────────\n${cmds.map(c => `│ ${c.command.padEnd(22)} ∷ ${c.description}`).join('\n')}\n└──────────────────────────────────────────`;
      }).join('\n\n');
      addResult('help', 'success', helpText);
      return;
    }

    if (trimmed === 'whoami') {
      const identity = `
┌─ SUBSTRATE IDENTITY ─────────────────────────
│ 
│  ██████╗ ███████╗     Cognitive Orchestration
│  ██╔═══╝ ██╔════╝     Substrate v2026.01
│  ██║     ███████╗     
│  ██║     ╚════██║     Environment: Lovable Cloud
│  ██████╗ ███████║     Status: OPERATIONAL
│  ╚═════╝ ╚══════╝     
│ 
│  promptfluid® — where machines learn to dream
│  
│  Modules: Brain, Decode, Defense, Nexus, Vision
│  Mode: ${enabled ? 'OPERATOR' : 'READ-ONLY'}
│  
└──────────────────────────────────────────────
`;
      addResult('whoami', 'success', identity);
      return;
    }

    if (trimmed === 'clear') {
      setHistory([]);
      toast.success('Terminal cleared');
      return;
    }

    if (!enabled) {
      addResult(trimmed, 'error', `▓ ACCESS DENIED: Operator privileges required\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}`);
      return;
    }

    // Execute substrate commands
    const resultId = addResult(trimmed, 'pending', getRandomItem(PERSONALITY_RESPONSES.thinking));

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
      } else {
        updateResult(resultId, 'error', `▓ UNKNOWN COMMAND: ${trimmed}\n  Type 'help' for available commands`);
        return;
      }

      if (result?.success) {
        const output = `◉ ${getRandomItem(PERSONALITY_RESPONSES.success)}\n\n${JSON.stringify(result.data || result, null, 2)}`;
        updateResult(resultId, 'success', output);
      } else {
        updateResult(resultId, 'error', `▓ ${result?.error || 'Command failed'}`);
      }
    } catch (error) {
      updateResult(resultId, 'error', `▓ EXCEPTION: ${error instanceof Error ? error.message : 'Unknown error'}\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}`);
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
    <div 
      className={cn(
        "border border-border/50 rounded-xl bg-black/80 backdrop-blur-md overflow-hidden font-mono text-sm",
        "shadow-[0_0_30px_rgba(6,182,212,0.1)]",
        fullHeight ? "h-full flex flex-col" : "",
        className
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-muted/30 via-muted/20 to-transparent border-b border-border/40">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/90 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
          <span className="w-3 h-3 rounded-full bg-amber-500/90 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-muted-foreground">substrate://terminal</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] h-5",
            enabled 
              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
              : "border-amber-500/50 text-amber-400 bg-amber-500/10"
          )}
        >
          {enabled ? 'OPERATOR' : 'READ-ONLY'}
        </Badge>
      </div>

      {/* Command Output */}
      <ScrollArea className={cn("flex-1", fullHeight ? "min-h-0" : "h-80")} ref={scrollRef}>
        <div className="p-4 space-y-2">
          {/* Boot Animation */}
          {bootLines.map((line, idx) => (
            <div 
              key={idx} 
              className={cn(
                "text-xs",
                line.startsWith('▓') ? "text-cyan-400 font-bold" : 
                line.startsWith('◉') ? "text-emerald-400" :
                line.startsWith('─') ? "text-border" :
                "text-muted-foreground"
              )}
            >
              {line}
            </div>
          ))}

          {/* Cursor blink after boot */}
          {bootComplete && history.length === 0 && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <span className="w-2 h-4 bg-cyan-400 animate-pulse" />
              <span>{getRandomItem(PERSONALITY_RESPONSES.greeting)}</span>
            </div>
          )}

          {/* Command History */}
          {history.map((result) => (
            <div key={result.id} className="space-y-1">
              {/* Command Line */}
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-cyan-400">{result.command}</span>
                <span className="text-[10px] text-muted-foreground/50">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {/* Output */}
              <div className={cn(
                "pl-5 text-xs leading-relaxed",
                result.status === 'pending' ? "text-amber-400/80" :
                result.status === 'success' ? "text-emerald-400/90" :
                "text-red-400/90"
              )}>
                {result.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="animate-pulse">{result.output || 'Executing...'}</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    )}
                    <pre className="whitespace-pre-wrap break-all font-mono">{result.output}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Line */}
      <form onSubmit={handleSubmit} className="border-t border-border/40 bg-black/50">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={enabled ? "enter command..." : "operator access required"}
            disabled={!enabled && input !== 'help' && input !== 'clear' && input !== 'whoami'}
            className="border-0 bg-transparent h-8 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 text-foreground"
          />
        </div>
      </form>
    </div>
  );
}
