/**
 * Command Palette — Quick actions terminal-style
 * OS-like command interface for substrate operations
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

interface CommandResult {
  id: string;
  command: string;
  status: 'pending' | 'success' | 'error';
  output?: string;
  timestamp: Date;
}

const AVAILABLE_COMMANDS = [
  { command: 'brain.reflect', description: 'Synthesize memories into reflections' },
  { command: 'brain.dream', description: 'Process through dream cycle' },
  { command: 'brain.synthesize', description: 'Cross-domain synthesis' },
  { command: 'dream.cycle', description: 'Trigger Dream-Eater consumption' },
  { command: 'nexus.test', description: 'Test provider routing (add prompt after)' },
  { command: 'help', description: 'Show available commands' },
  { command: 'clear', description: 'Clear command history' },
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
      addResult('help', 'success', AVAILABLE_COMMANDS.map(c => 
        `  ${c.command.padEnd(20)} — ${c.description}`
      ).join('\n'));
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
      } else if (trimmed === 'dream.cycle') {
        result = await dreamCycleMutation.mutateAsync();
      } else if (trimmed.startsWith('nexus.test')) {
        const prompt = trimmed.replace('nexus.test', '').trim() || 'Hello, substrate.';
        result = await routeTestMutation.mutateAsync(prompt);
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
            substrate os v2026.01 — type 'help' for commands
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
