/**
 * Enhanced Terminal v2026
 * Full-featured terminal with comprehensive commands, autocomplete,
 * larger viewport, and real substrate integration
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Terminal, ChevronRight, Loader2, CheckCircle2, XCircle, Download, Maximize2, Minimize2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  CommandResult, 
  TerminalTheme, 
  BOOT_MESSAGES, 
  PERSONALITY_RESPONSES, 
  getRandomItem 
} from './terminal/TerminalTypes';
import { ALL_COMMANDS, searchCommands, type CommandDefinition } from './terminal/TerminalCommands';
import { executeCommand, type ExecutionResult } from './terminal/TerminalExecutor';

interface EnhancedTerminalProps {
  enabled: boolean;
  className?: string;
  fullHeight?: boolean;
}

export function EnhancedTerminal({ enabled, className, fullHeight = false }: EnhancedTerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<CommandDefinition[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [theme, setTheme] = useState<TerminalTheme>('dark');
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionStats, setSessionStats] = useState({ commands: 0, success: 0, errors: 0 });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, bootLines]);

  // Update suggestions on input change
  useEffect(() => {
    if (input.trim()) {
      const results = searchCommands(input);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const addResult = useCallback((command: string, status: 'pending' | 'success' | 'error', output?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setHistory(prev => [...prev, { id, command, status, output, timestamp: new Date() }]);
    return id;
  }, []);

  const updateResult = useCallback((id: string, status: 'success' | 'error', output: string, duration?: number) => {
    setHistory(prev => prev.map(r => 
      r.id === id ? { ...r, status, output, duration } : r
    ));
  }, []);

  const handleExecute = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add to command history
    setCommandHistory(prev => [...prev.filter(c => c !== trimmed), trimmed].slice(-50));
    setHistoryIndex(-1);

    // Update session stats
    setSessionStats(prev => ({ ...prev, commands: prev.commands + 1 }));

    const startTime = Date.now();
    const resultId = addResult(trimmed, 'pending', getRandomItem(PERSONALITY_RESPONSES.thinking));

    const result = await executeCommand(trimmed, enabled);
    const duration = Date.now() - startTime;

    // Handle special outputs
    if (result.output === '__CLEAR__') {
      setHistory([]);
      toast.success('Terminal cleared');
      return;
    }

    if (result.output === '__HISTORY__') {
      const historyOutput = commandHistory.length > 0
        ? `\n┌─ COMMAND HISTORY ────────────────────────────────────────\n│\n${commandHistory.map((c, i) => `│  ${(i + 1).toString().padStart(3)} │ ${c}`).join('\n')}\n│\n└──────────────────────────────────────────────────────────`
        : '◉ No command history yet.';
      updateResult(resultId, 'success', historyOutput, duration);
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    if (result.output === '__EXPORT__') {
      const exportData = history.map(h => ({
        command: h.command,
        status: h.status,
        timestamp: h.timestamp.toISOString(),
        output: h.output,
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `substrate-terminal-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      updateResult(resultId, 'success', '◉ Session exported successfully.', duration);
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    if (result.output.startsWith('__THEME__')) {
      const newTheme = result.output.replace('__THEME__', '');
      if (newTheme === 'toggle') {
        setTheme(prev => prev === 'dark' ? 'matrix' : prev === 'matrix' ? 'light' : 'dark');
      } else if (['dark', 'light', 'matrix'].includes(newTheme)) {
        setTheme(newTheme as TerminalTheme);
      }
      updateResult(resultId, 'success', `◉ Theme set to: ${newTheme === 'toggle' ? theme : newTheme}`, duration);
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    // Normal result
    updateResult(resultId, result.success ? 'success' : 'error', result.output, duration);
    setSessionStats(prev => ({
      ...prev,
      success: result.success ? prev.success + 1 : prev.success,
      errors: result.success ? prev.errors : prev.errors + 1,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSuggestions && suggestions[selectedSuggestion]) {
      setInput(suggestions[selectedSuggestion].command);
      setShowSuggestions(false);
    } else {
      handleExecute(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Suggestions navigation
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setInput(suggestions[selectedSuggestion].command + ' ');
        setShowSuggestions(false);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Command history navigation
    if (e.key === 'ArrowUp' && !showSuggestions) {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(newIndex);
      if (commandHistory[commandHistory.length - 1 - newIndex]) {
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown' && !showSuggestions) {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setInput('');
      } else if (commandHistory[commandHistory.length - 1 - newIndex]) {
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    }

    // Shortcuts
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
      toast.success('Terminal cleared');
    }
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setInput('');
    }
  };

  // Theme classes
  const themeClasses = useMemo(() => ({
    dark: {
      bg: 'bg-black/90',
      text: 'text-foreground',
      accent: 'text-cyan-400',
      success: 'text-emerald-400',
      error: 'text-red-400',
      border: 'border-border/50',
    },
    light: {
      bg: 'bg-white/90',
      text: 'text-gray-900',
      accent: 'text-blue-600',
      success: 'text-green-600',
      error: 'text-red-600',
      border: 'border-gray-300',
    },
    matrix: {
      bg: 'bg-black',
      text: 'text-green-400',
      accent: 'text-green-300',
      success: 'text-green-500',
      error: 'text-red-500',
      border: 'border-green-500/30',
    },
  }), []);

  const currentTheme = themeClasses[theme];

  return (
    <div 
      className={cn(
        "border rounded-xl overflow-hidden font-mono text-sm",
        "shadow-[0_0_40px_rgba(6,182,212,0.15)]",
        "transition-all duration-300",
        currentTheme.bg,
        currentTheme.border,
        isExpanded ? "fixed inset-4 z-50" : "",
        fullHeight ? "h-full flex flex-col" : "",
        className
      )}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Terminal Header */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 border-b",
        "bg-gradient-to-r from-muted/40 via-muted/20 to-transparent",
        currentTheme.border
      )}>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/90 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
          <span className="w-3 h-3 rounded-full bg-amber-500/90 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-2">
          <Terminal className={cn("w-4 h-4", currentTheme.accent)} />
          <span className="text-xs text-muted-foreground">substrate://terminal</span>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{sessionStats.commands} cmds</span>
          <span className="text-emerald-400">{sessionStats.success} ✓</span>
          <span className="text-red-400">{sessionStats.errors} ✗</span>
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
          {enabled ? 'OPERATOR' : 'OBSERVER'}
        </Badge>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => {
              const exportData = history.map(h => ({
                command: h.command,
                status: h.status,
                timestamp: h.timestamp.toISOString(),
              }));
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `terminal-${Date.now()}.json`;
              a.click();
            }}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          {isExpanded && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Command Output */}
      <ScrollArea 
        className={cn(
          "flex-1 overflow-auto",
          isExpanded ? "h-[calc(100vh-140px)]" : fullHeight ? "min-h-0" : "h-[500px]"
        )} 
        ref={scrollRef}
      >
        <div className="p-4 space-y-2">
          {/* Boot Animation */}
          {bootLines.map((line, idx) => (
            <div 
              key={idx} 
              className={cn(
                "text-xs",
                line.startsWith('▓') ? cn("font-bold", currentTheme.accent) : 
                line.startsWith('◉') ? currentTheme.success :
                line.startsWith('─') ? "text-border" :
                "text-muted-foreground"
              )}
            >
              {line}
            </div>
          ))}

          {/* Ready indicator after boot */}
          {bootComplete && history.length === 0 && (
            <div className={cn("flex items-center gap-1 text-xs", "text-muted-foreground")}>
              <span className={cn("w-2 h-4 animate-pulse", theme === 'matrix' ? 'bg-green-400' : 'bg-cyan-400')} />
              <span>{getRandomItem(PERSONALITY_RESPONSES.greeting)}</span>
            </div>
          )}

          {/* Command History */}
          {history.map((result) => (
            <div key={result.id} className="space-y-1">
              {/* Command Line */}
              <div className="flex items-center gap-2">
                <ChevronRight className={cn("w-3 h-3 shrink-0", currentTheme.accent)} />
                <span className={currentTheme.accent}>{result.command}</span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto flex items-center gap-2">
                  {result.duration !== undefined && (
                    <span className="text-muted-foreground/70">{result.duration}ms</span>
                  )}
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {/* Output */}
              <div className={cn(
                "pl-5 text-xs leading-relaxed",
                result.status === 'pending' ? "text-amber-400/80" :
                result.status === 'success' ? currentTheme.success :
                currentTheme.error
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
                    <pre className="whitespace-pre-wrap break-all font-mono overflow-x-auto">{result.output}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={cn(
          "border-t px-4 py-2 space-y-1 max-h-48 overflow-y-auto",
          currentTheme.border,
          "bg-black/80"
        )}>
          <div className="text-[10px] text-muted-foreground mb-1">
            Tab to complete • ↑↓ to navigate • Esc to close
          </div>
          {suggestions.map((cmd, idx) => (
            <div
              key={cmd.command}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer transition-colors",
                idx === selectedSuggestion 
                  ? "bg-cyan-500/20 text-cyan-400" 
                  : "hover:bg-muted/30 text-muted-foreground"
              )}
              onClick={() => {
                setInput(cmd.command + ' ');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              <cmd.icon className="w-3 h-3 shrink-0" />
              <span className="font-medium">{cmd.command}</span>
              <span className="text-muted-foreground/70 text-[10px]">∷</span>
              <span className="text-muted-foreground/70 truncate flex-1">{cmd.description}</span>
              {cmd.requiresOperator && (
                <Badge variant="outline" className="text-[8px] h-4 border-amber-500/30 text-amber-400">
                  ⚡
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Line */}
      <form onSubmit={handleSubmit} className={cn("border-t bg-black/60", currentTheme.border)}>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-1">
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse shadow-[0_0_6px]",
              theme === 'matrix' ? 'bg-green-400 shadow-green-400/80' : 'bg-cyan-400 shadow-cyan-400/80'
            )} />
            <Terminal className={cn("w-4 h-4", currentTheme.accent)} />
          </div>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input.trim() && setSuggestions(searchCommands(input))}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={enabled ? "enter command... (Tab for autocomplete)" : "observer mode — read-only commands only"}
            className={cn(
              "border-0 bg-transparent h-8 px-0 focus-visible:ring-0",
              "placeholder:text-muted-foreground/40",
              currentTheme.text
            )}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <kbd className="px-1 py-0.5 rounded bg-muted/30">↑↓</kbd>
            <span>history</span>
          </div>
        </div>
      </form>
    </div>
  );
}
