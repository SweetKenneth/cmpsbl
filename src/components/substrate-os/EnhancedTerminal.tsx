/**
 * Enhanced Terminal
 * Space Age Bio-Hacking Neural Interface Terminal
 * Full-featured terminal with comprehensive commands, autocomplete,
 * aliases, macros, scheduling, watch mode, audit trail, and smart suggestions
 * 
 * Features:
 * - 500+ terminal commands across 40 Matrix Nodes
 * - 675+ capabilities across 40 nodes
 * - Improved visual feedback for command execution
 * - Better animation states for results
 * - Enhanced mobile responsiveness with word-wrap fixes
 * - Syntax highlighting for output
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Terminal, ChevronRight, Loader2, CheckCircle2, XCircle, Download, Maximize2, Minimize2, X, Sparkles, Dna, Zap, Activity, Brain, Copy, Check, Pin, ArrowDownToLine, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import '@/styles/terminal-biohack.css';
import { 
  CommandResult, 
  TerminalTheme, 
  BOOT_MESSAGES, 
  PERSONALITY_RESPONSES, 
  getRandomItem 
} from './terminal/TerminalTypes';
import { ALL_COMMANDS, searchCommands, type CommandDefinition } from './terminal/TerminalCommands';
import { executeCommand, type ExecutionResult } from './terminal/TerminalExecutor';
import { useUserRole } from '@/hooks/useUserRole';
import { resolveAlias } from './terminal/useTerminalAliases';
import { getMacro } from './terminal/useTerminalMacros';
import { scheduleCommand, parseDelay, formatScheduleConfirmation } from './terminal/useTerminalScheduler';
import { useTerminalWatch, formatWatchListOutput } from './terminal/useTerminalWatch';
import { recordAuditEntry, exportAuditLog } from './terminal/useTerminalAudit';
import { generateSmartSuggestions, getSuggestionDefinition, type SmartSuggestion } from './terminal/useSmartSuggestions';
import { getBootMessages } from './terminal/TerminalBootScreen';
import { secureGet, secureSet } from '@/lib/system/secureStorage';

interface EnhancedTerminalProps {
  enabled: boolean;
  className?: string;
  fullHeight?: boolean;
}

// Persistent command history helpers
const HISTORY_STORAGE_KEY = 'substrate-terminal-history';
const MAX_PERSISTED_HISTORY = 200;

function loadPersistedHistory(): string[] {
  try {
    return secureGet<string[]>(HISTORY_STORAGE_KEY) || [];
  } catch { /* Storage unavailable — start fresh */ return []; }
}

function persistHistory(history: string[]) {
  try {
    secureSet(HISTORY_STORAGE_KEY, history.slice(-MAX_PERSISTED_HISTORY));
  } catch { /* Quota exceeded — non-critical */ }
}

export function EnhancedTerminal({ enabled, className, fullHeight = false }: EnhancedTerminalProps) {
  const { role: userTier } = useUserRole();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>(() => loadPersistedHistory());
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<CommandDefinition[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [theme, setTheme] = useState<TerminalTheme>('biohack');
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionStats, setSessionStats] = useState({ commands: 0, success: 0, errors: 0 });
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reverseSearchMode, setReverseSearchMode] = useState(false);
  const [reverseSearchQuery, setReverseSearchQuery] = useState('');
  const [reverseSearchMatch, setReverseSearchMatch] = useState<string | null>(null);
  const [sessionStartTime] = useState(() => Date.now());
  const [pinnedResults, setPinnedResults] = useState<Set<string>>(() => new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Boot animation with viewport-aware messages + register terminal presence
  useEffect(() => {
    // Register that a terminal UI is present for conditional scanning
    import('@/lib/terminal/detect').then(m => m.registerTerminalPresence());
    
    // Use viewport-aware boot messages
    const bootMessages = getBootMessages(window.innerWidth);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < bootMessages.length) {
        setBootLines(prev => [...prev, bootMessages[idx]]);
        idx++;
      } else {
        setBootComplete(true);
        clearInterval(interval);
      }
    }, 60); // Slightly faster boot animation
    return () => clearInterval(interval);
  }, []);

  // Copy to clipboard handler
  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  // Auto-scroll to bottom (respects toggle)
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, bootLines, autoScroll]);

  // Session timer display
  const getSessionDuration = useCallback(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return m > 0 ? `${m}m${s.toString().padStart(2, '0')}s` : `${s}s`;
  }, [sessionStartTime]);
  const [sessionDuration, setSessionDuration] = useState('0s');
  useEffect(() => {
    const timer = setInterval(() => setSessionDuration(getSessionDuration()), 1000);
    return () => clearInterval(timer);
  }, [getSessionDuration]);

  // Reverse search through history
  useEffect(() => {
    if (reverseSearchMode && reverseSearchQuery) {
      const match = [...commandHistory].reverse().find(cmd => 
        cmd.toLowerCase().includes(reverseSearchQuery.toLowerCase())
      );
      setReverseSearchMatch(match || null);
    } else {
      setReverseSearchMatch(null);
    }
  }, [reverseSearchQuery, reverseSearchMode, commandHistory]);

  // Pin/unpin result
  const togglePin = useCallback((id: string) => {
    setPinnedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

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

  // Watch mode
  const { startWatch, stopWatch, stopAllWatches, getActiveSessions } = useTerminalWatch();

  const handleExecute = async (cmd: string) => {
    let trimmed = cmd.trim();
    if (!trimmed) return;

    // ── BASH-LIKE SHORTCUTS ──
    // !! — repeat last command
    if (trimmed === '!!') {
      if (commandHistory.length === 0) {
        addResult('!!', 'error', '▓ No command history');
        return;
      }
      trimmed = commandHistory[commandHistory.length - 1];
    }
    // !n — repeat nth command from history (1-indexed)
    const bangMatch = trimmed.match(/^!(\d+)$/);
    if (bangMatch) {
      const idx = parseInt(bangMatch[1]) - 1;
      if (idx >= 0 && idx < commandHistory.length) {
        trimmed = commandHistory[idx];
      } else {
        addResult(trimmed, 'error', `▓ History index out of range (1-${commandHistory.length})`);
        return;
      }
    }
    // !prefix — repeat last command starting with prefix
    const bangPrefixMatch = trimmed.match(/^!([a-zA-Z].*)$/);
    if (bangPrefixMatch && !trimmed.startsWith('!!')) {
      const prefix = bangPrefixMatch[1].toLowerCase();
      const match = [...commandHistory].reverse().find(c => c.toLowerCase().startsWith(prefix));
      if (match) {
        trimmed = match;
      } else {
        addResult(trimmed, 'error', `▓ No command starting with '${bangPrefixMatch[1]}' in history`);
        return;
      }
    }

    // ── GREP PIPE FILTER ──
    let grepFilter: string | null = null;
    const grepMatch = trimmed.match(/^(.+?)\s*\|\s*grep\s+(.+)$/i);
    if (grepMatch) {
      trimmed = grepMatch[1].trim();
      grepFilter = grepMatch[2].trim().replace(/^["']|["']$/g, '');
    }

    // Handle @macro shorthand syntax (e.g., @upgrade_prepare -> macro run upgrade_prepare)
    const macroShorthand = trimmed.startsWith('@') ? `macro run ${trimmed.slice(1)}` : trimmed;

    // Resolve alias before execution
    const resolvedCmd = resolveAlias(macroShorthand);

    // Add to command history (original input, not resolved)
    const newHistory = [...commandHistory.filter(c => c !== cmd.trim()), cmd.trim()].slice(-MAX_PERSISTED_HISTORY);
    setCommandHistory(newHistory);
    persistHistory(newHistory);
    setHistoryIndex(-1);

    // Update session stats
    setSessionStats(prev => ({ ...prev, commands: prev.commands + 1 }));

    const startTime = Date.now();
    const resultId = addResult(resolvedCmd + (grepFilter ? ` | grep ${grepFilter}` : ''), 'pending', getRandomItem(PERSONALITY_RESPONSES.thinking));

    const result = await executeCommand(resolvedCmd, enabled, userTier);
    const duration = Date.now() - startTime;

    // Record to audit log
    recordAuditEntry(resolvedCmd, result.success ? 'success' : 'error', result.output, duration);

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

    if (result.output === '__AUDIT_EXPORT__') {
      const auditJson = exportAuditLog();
      const blob = new Blob([auditJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `substrate-audit-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      updateResult(resultId, 'success', '◉ Audit log exported successfully.', duration);
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    if (result.output.startsWith('__THEME__')) {
      const newTheme = result.output.replace('__THEME__', '');
      let resolvedThemeName = newTheme;
      if (newTheme === 'toggle') {
        const THEME_ORDER: TerminalTheme[] = ['biohack', 'dark', 'matrix', 'light'];
        setTheme(prev => {
          const nextIdx = (THEME_ORDER.indexOf(prev) + 1) % THEME_ORDER.length;
          resolvedThemeName = THEME_ORDER[nextIdx];
          return THEME_ORDER[nextIdx];
        });
      } else if (['dark', 'light', 'matrix', 'biohack'].includes(newTheme)) {
        setTheme(newTheme as TerminalTheme);
      }
      // Use setTimeout(0) so the message reflects the new theme after state update
      setTimeout(() => {
        updateResult(resultId, 'success', `◉ Theme set to: ${resolvedThemeName}`, duration);
      }, 0);
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    // Handle macro execution
    if (result.output.startsWith('__MACRO_RUN__')) {
      const macroName = result.output.replace('__MACRO_RUN__', '');
      const macro = getMacro(macroName);
      if (macro) {
        updateResult(resultId, 'success', `◉ Executing macro: @${macroName} (${macro.commands.length} commands)`, duration);
        setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
        // Execute each command in sequence
        for (const macroCmd of macro.commands) {
          await handleExecute(macroCmd);
        }
        return;
      }
    }

    // Handle watch list
    if (result.output === '__WATCH_LIST__') {
      const sessions = getActiveSessions();
      updateResult(resultId, 'success', formatWatchListOutput(sessions), duration);
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    // Handle watch stop
    if (result.output.startsWith('__WATCH_STOP__')) {
      const target = result.output.replace('__WATCH_STOP__', '');
      if (target === 'all') {
        stopAllWatches();
        updateResult(resultId, 'success', '◉ All watch sessions stopped.', duration);
      } else {
        const sessions = getActiveSessions();
        const match = sessions.find(s => s.id.startsWith(target) || s.id.slice(0, 8) === target);
        if (match) {
          stopWatch(match.id);
          updateResult(resultId, 'success', `◉ Watch session stopped: ${match.id.slice(0, 12)}`, duration);
        } else {
          updateResult(resultId, 'error', `▓ ERROR: Watch session '${target}' not found`, duration);
        }
      }
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    // Handle watch start
    if (result.output.startsWith('__WATCH_START__')) {
      const parts = result.output.replace('__WATCH_START__', '').split('__');
      const interval = parts[0];
      const watchCmd = parts.slice(1).join('__');
      const seconds = parseDelay(interval);
      if (seconds) {
        const watchId = startWatch(watchCmd, seconds / 1000, async (cmd) => {
          const res = await executeCommand(cmd, enabled, userTier);
          return { success: res.success, output: res.output };
        });
        updateResult(resultId, 'success', `◉ Watch started: ${watchId.slice(0, 12)}\n  Command: ${watchCmd}\n  Interval: ${interval}\n  Use 'watch stop ${watchId.slice(0, 8)}' to stop`, duration);
      } else {
        updateResult(resultId, 'error', `▓ ERROR: Invalid interval: ${interval}`, duration);
      }
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    // Handle schedule
    if (result.output.startsWith('__SCHEDULE__')) {
      const parts = result.output.replace('__SCHEDULE__', '').split('__');
      const delay = parts[0];
      const schedCmd = parts.slice(1).join('__');
      try {
        const id = scheduleCommand(schedCmd, delay, async (cmd) => {
          const res = await executeCommand(cmd, enabled, userTier);
          addResult(cmd, res.success ? 'success' : 'error', `[Scheduled] ${res.output}`);
          return { success: res.success, output: res.output };
        });
        const delayMs = parseDelay(delay) || 5000;
        const executeAt = new Date(Date.now() + delayMs);
        updateResult(resultId, 'success', formatScheduleConfirmation(id, schedCmd, executeAt), duration);
      } catch (e) {
        updateResult(resultId, 'error', `▓ ERROR: ${e instanceof Error ? e.message : 'Schedule failed'}`, duration);
      }
      setSessionStats(prev => ({ ...prev, success: prev.success + 1 }));
      return;
    }

    // Normal result — apply grep filter if present
    let output = result.output;
    if (grepFilter && output) {
      const lines = output.split('\n');
      const filtered = lines.filter(line => line.toLowerCase().includes(grepFilter.toLowerCase()));
      output = filtered.length > 0
        ? `[grep: ${grepFilter}] ${filtered.length} matches\n${filtered.join('\n')}`
        : `[grep: ${grepFilter}] No matches found`;
    }
    updateResult(resultId, result.success ? 'success' : 'error', output, duration);
    setSessionStats(prev => ({
      ...prev,
      success: result.success ? prev.success + 1 : prev.success,
      errors: result.success ? prev.errors : prev.errors + 1,
    }));

    // Generate smart suggestions after successful execution
    if (result.success && !resolvedCmd.startsWith('__')) {
      const suggestions = generateSmartSuggestions(resolvedCmd, commandHistory);
      setSmartSuggestions(suggestions);
      setShowSmartSuggestions(suggestions.length > 0);
    } else {
      setShowSmartSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reverse search: accept match and execute
    if (reverseSearchMode) {
      setReverseSearchMode(false);
      if (reverseSearchMatch) {
        setInput('');
        handleExecute(reverseSearchMatch);
      }
      setReverseSearchQuery('');
      return;
    }
    if (showSuggestions && suggestions[selectedSuggestion]) {
      setInput(suggestions[selectedSuggestion].command);
      setShowSuggestions(false);
    } else {
      setShowSmartSuggestions(false);
      handleExecute(input);
      setInput('');
    }
  };

  // Execute a smart suggestion by number (1-4)
  const executeSmartSuggestion = useCallback((num: number) => {
    const suggestion = smartSuggestions[num - 1];
    if (suggestion) {
      setShowSmartSuggestions(false);
      handleExecute(suggestion.command);
    }
  }, [smartSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ── REVERSE SEARCH MODE ──
    if (reverseSearchMode) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setReverseSearchMode(false);
        setReverseSearchQuery('');
        return;
      }
      if (e.key === 'Enter') {
        // Submit handled by handleSubmit
        return;
      }
      if (e.key === 'Backspace') {
        setReverseSearchQuery(prev => prev.slice(0, -1));
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setReverseSearchQuery(prev => prev + e.key);
        return;
      }
      return;
    }

    // ── Ctrl+R: Enter reverse search ──
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      setReverseSearchMode(true);
      setReverseSearchQuery('');
      setShowSuggestions(false);
      setShowSmartSuggestions(false);
      return;
    }

    // ── F11: Toggle fullscreen ──
    if (e.key === 'F11') {
      e.preventDefault();
      setIsExpanded(prev => !prev);
      return;
    }

    // Smart suggestions: number keys 1-4 when visible and input is empty
    if (showSmartSuggestions && !input.trim() && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      const num = parseInt(e.key);
      if (num <= smartSuggestions.length) {
        executeSmartSuggestion(num);
        return;
      }
    }

    // Dismiss smart suggestions when typing
    if (showSmartSuggestions && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setShowSmartSuggestions(false);
    }

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
        setShowSmartSuggestions(false);
        return;
      }
    }

    // Escape to dismiss smart suggestions
    if (e.key === 'Escape' && showSmartSuggestions) {
      setShowSmartSuggestions(false);
      return;
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
      setShowSmartSuggestions(false);
      toast.success('Terminal cleared');
    }
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setInput('');
      setShowSmartSuggestions(false);
    }
  };

  // Theme classes - semantic tokens, improved light/dark contrast
  const themeClasses = useMemo(() => ({
    dark: {
      bg: 'bg-black/90',
      text: 'text-foreground',
      accent: 'text-neon-cyan',
      success: 'text-neon-green',
      error: 'text-destructive',
      border: 'border-border/50',
      input: 'text-foreground',
      placeholder: 'placeholder:text-muted-foreground/60',
      suggestion: 'text-foreground',
      suggestionMuted: 'text-muted-foreground',
    },
    light: {
      bg: 'bg-white',
      text: 'text-foreground',
      accent: 'text-primary',
      success: 'text-neon-green',
      error: 'text-destructive',
      border: 'border-border',
      input: 'text-foreground',
      placeholder: 'placeholder:text-muted-foreground',
      suggestion: 'text-foreground',
      suggestionMuted: 'text-muted-foreground',
    },
    matrix: {
      bg: 'bg-black',
      text: 'text-neon-green',
      accent: 'text-neon-green',
      success: 'text-neon-green',
      error: 'text-destructive',
      border: 'border-neon-green/30',
      input: 'text-neon-green',
      placeholder: 'placeholder:text-neon-green/50',
      suggestion: 'text-neon-green',
      suggestionMuted: 'text-neon-green/70',
    },
    biohack: {
      bg: 'biohack-terminal',
      text: 'text-neon-cyan/90',
      accent: 'biohack-command-text',
      success: 'biohack-output-success',
      error: 'biohack-output-error',
      border: 'border-neon-cyan/20',
      input: 'text-neon-cyan/90',
      placeholder: 'placeholder:text-muted-foreground/40',
      suggestion: 'text-neon-cyan',
      suggestionMuted: 'text-neon-blue/60',
    },
  }), []);

  const currentTheme = themeClasses[theme];

  const isBiohack = theme === 'biohack';
  const isLight = theme === 'light';

  return (
    <div 
      className={cn(
        "border rounded-xl overflow-hidden font-mono text-sm",
        "transition-all duration-300",
        isBiohack ? "biohack-terminal" : currentTheme.bg,
        isBiohack ? "" : "shadow-[0_0_40px_rgba(6,182,212,0.15)]",
        currentTheme.border,
        isExpanded ? "fixed inset-4 z-[60]" : "",
        fullHeight ? "h-full flex flex-col" : "",
        className
      )}
      style={{ backdropFilter: isBiohack ? undefined : 'blur(12px)' }}
    >
      {/* Terminal Header */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 border-b relative z-10",
        isBiohack ? "biohack-header" : "bg-gradient-to-r from-muted/40 via-muted/20 to-transparent",
        currentTheme.border
      )}>
        <div className="flex gap-1.5">
          {isBiohack ? (
            <>
              <div className="biohack-orb biohack-orb-red" />
              <div className="biohack-orb biohack-orb-amber" />
              <div className="biohack-orb biohack-orb-cyan" />
            </>
          ) : (
            <>
              <span className="w-3 h-3 rounded-full bg-destructive/90 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-neon-amber/90 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-neon-green/90 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            </>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-2">
          {isBiohack ? (
            <>
              <Dna className="w-4 h-4 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--neon-cyan)))' }} />
              <span className="biohack-title">stream://memory.crystallize</span>
              <Brain className="w-4 h-4 text-neon-purple" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--neon-purple)))' }} />
            </>
          ) : (
            <>
              <Terminal className={cn("w-4 h-4", currentTheme.accent)} />
              <span className="text-xs text-muted-foreground">stream://memory-terminal</span>
            </>
          )}
        </div>

        {/* Stats + Session Timer */}
        <div className={cn(
          "hidden sm:flex items-center gap-3 text-[10px]",
          isBiohack ? "" : "text-muted-foreground"
        )}>
          <span className={isBiohack ? "biohack-stat biohack-stat-cmds" : ""}>
            {sessionStats.commands} cmds
          </span>
          <span className={isBiohack ? "biohack-stat biohack-stat-success" : "text-neon-green"}>
            {sessionStats.success} ✓
          </span>
          <span className={isBiohack ? "biohack-stat biohack-stat-error" : "text-destructive"}>
            {sessionStats.errors} ✗
          </span>
          <span className={isBiohack ? "text-neon-blue/60" : "text-muted-foreground/60"}>
            {sessionDuration}
          </span>
          {getActiveSessions().length > 0 && (
            <span className={isBiohack ? "text-neon-purple" : "text-neon-amber"} title="Active watch sessions">
              ⟳ {getActiveSessions().length}
            </span>
          )}
        </div>

        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] h-5",
            isBiohack 
              ? enabled ? "biohack-badge-operator" : "biohack-badge-observer"
              : enabled 
                ? "border-neon-green/50 text-neon-green bg-neon-green/10" 
                : "border-neon-amber/50 text-neon-amber bg-neon-amber/10"
          )}
        >
          {isBiohack ? (
            <>
              {enabled ? <Zap className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
              {enabled ? 'NEURAL-LINK' : 'BIO-SCAN'}
            </>
          ) : (
            enabled ? 'OPERATOR' : 'OBSERVER'
          )}
        </Badge>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-6 w-6", autoScroll ? "text-foreground" : "text-muted-foreground/40")}
            onClick={() => setAutoScroll(prev => !prev)}
            title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            aria-label={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          >
            <ArrowDownToLine className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            aria-label="Export terminal history"
            onClick={() => {
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
              a.download = `terminal-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
            title="F11"
            aria-label={isExpanded ? 'Minimize terminal' : 'Maximize terminal'}
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          {isExpanded && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(false)}
              aria-label="Close expanded terminal"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Command Output */}
      <ScrollArea 
        className={cn(
          "flex-1 overflow-auto biohack-content relative z-10",
          isExpanded ? "h-[calc(100vh-140px)]" : fullHeight ? "min-h-0" : "h-[500px]"
        )} 
        ref={scrollRef}
      >
        <div className="p-4 space-y-2">
          {/* Boot Animation */}
          {bootLines.map((line, idx) => {
            const isHeader = line.includes('┏') || line.includes('┗') || line.includes('┃') || line.includes('╔') || line.includes('╚') || line.includes('║');
            const isStatus = line.includes('ONLINE') || line.includes('READY') || line.includes('100%');
            const isProgress = line.startsWith('  ▸');
            const isNodeLine = line.includes('◉');
            const isBorder = line.includes('┌') || line.includes('└') || line.includes('│') || line.includes('─');
            
            return (
              <div 
                key={idx} 
                className={cn(
                  "text-xs biohack-boot-line",
                  isBiohack ? (
                    isHeader ? "biohack-boot-header" : 
                    isStatus ? "biohack-boot-status" :
                    isProgress ? "biohack-boot-progress" :
                    isNodeLine ? "biohack-boot-module" :
                    isBorder ? "biohack-boot-divider" :
                    "text-neon-blue/60"
                  ) : (
                    isHeader ? cn("font-bold", currentTheme.accent) : 
                    isStatus ? currentTheme.success :
                    isNodeLine ? currentTheme.success :
                    isBorder ? "text-border" :
                    "text-muted-foreground"
                  )
                )}
              >
                {line}
              </div>
            );
          })}

          {/* Ready indicator after boot */}
          {bootComplete && history.length === 0 && (
            <div className={cn("flex items-center gap-2 text-xs", isBiohack ? "text-neon-cyan/70" : "text-muted-foreground")}>
              {isBiohack ? (
                <div className="biohack-cursor" />
              ) : (
                <span className={cn("w-2 h-4 animate-pulse", theme === 'matrix' ? 'bg-neon-green' : 'bg-neon-cyan')} />
              )}
              <span style={isBiohack ? { textShadow: '0 0 10px hsl(var(--neon-cyan) / 0.5)' } : undefined}>
                {getRandomItem(PERSONALITY_RESPONSES.greeting)}
              </span>
            </div>
          )}

          {/* Command History */}
          {history.map((result) => (
            <div 
              key={result.id} 
              className={cn(
                "space-y-1 transition-all duration-300",
                isBiohack && result.status === 'success' && "biohack-result-success",
                isBiohack && result.status === 'error' && "biohack-result-error",
                isBiohack && result.status === 'pending' && "biohack-result-pending"
              )}
            >
              {/* Command Line */}
              <div className={cn("flex items-center gap-2 group", isBiohack && "biohack-command")}>
                {!isBiohack && <ChevronRight className={cn("w-3 h-3 shrink-0", currentTheme.accent)} />}
                <span className={isBiohack ? "biohack-command-text" : currentTheme.accent}>{result.command}</span>
                
                {/* Copy button - visible on hover */}
                <button
                  onClick={() => handleCopy(result.output || '', result.id)}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10",
                    copiedId === result.id && "opacity-100"
                  )}
                  title="Copy output"
                >
                  {copiedId === result.id ? (
                    <Check className="w-3 h-3 text-neon-green" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
                {/* Pin button */}
                <button
                  onClick={() => togglePin(result.id)}
                  className={cn(
                    "transition-opacity p-1 rounded hover:bg-white/10",
                    pinnedResults.has(result.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  title={pinnedResults.has(result.id) ? "Unpin result" : "Pin result"}
                >
                  <Pin className={cn("w-3 h-3", pinnedResults.has(result.id) ? "text-neon-amber" : "text-muted-foreground")} />
                </button>
                
                <span className={cn(
                  "text-[10px] ml-auto flex items-center gap-2",
                  isBiohack ? "text-neon-blue/60" : "text-muted-foreground/50"
                )}>
                  {result.duration !== undefined && (
                    <span className={cn(
                      isBiohack ? "text-neon-purple" : "text-muted-foreground/70",
                      result.duration > 1000 && "text-neon-amber",
                      result.duration > 3000 && "text-destructive"
                    )}>
                      {result.duration < 1000 ? `${result.duration}ms` : `${(result.duration / 1000).toFixed(1)}s`}
                    </span>
                  )}
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {/* Output */}
              <div className={cn(
                "pl-5 text-xs leading-relaxed relative overflow-hidden",
                isBiohack ? (
                  result.status === 'pending' ? "biohack-output-pending" :
                  result.status === 'success' ? "biohack-output-success" :
                  "biohack-output-error"
                ) : (
                  result.status === 'pending' ? "text-neon-amber/80" :
                  result.status === 'success' ? currentTheme.success :
                  currentTheme.error
                )
              )}>
                {result.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className={cn("w-3 h-3 animate-spin", isBiohack && "biohack-loading-spinner")} />
                    <span className="animate-pulse">{result.output || 'Processing neural pathways...'}</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 min-w-0 w-full">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    )}
                    <pre className={cn(
                      "whitespace-pre-wrap font-mono min-w-0 flex-1",
                      "terminal-output",
                      // Mobile-first word wrapping - never break mid-word
                      "break-words [word-break:break-word] [overflow-wrap:anywhere]",
                      "[hyphens:none] [word-wrap:break-word]"
                    )} style={{ 
                      wordBreak: 'break-word', 
                      overflowWrap: 'anywhere',
                      hyphens: 'none',
                    }}>
                      {result.output}
                    </pre>
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
          "border-t px-4 py-2 space-y-1 max-h-48 overflow-y-auto relative z-10",
          currentTheme.border,
          isBiohack ? "biohack-suggestions" : isLight ? "bg-muted/30" : "bg-black/80"
        )}>
          <div className={cn(
            "text-[10px] mb-1",
            isBiohack ? "text-neon-blue/60" : isLight ? "text-muted-foreground" : "text-muted-foreground"
          )}>
            Tab to complete • ↑↓ to navigate • Esc to close
          </div>
          {suggestions.map((cmd, idx) => (
            <div
              key={cmd.command}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer transition-all",
                isBiohack ? (
                  idx === selectedSuggestion 
                    ? "biohack-suggestion-item biohack-suggestion-active"
                    : "biohack-suggestion-item"
                ) : isLight ? (
                  idx === selectedSuggestion 
                    ? "bg-neon-blue text-neon-blue" 
                    : "hover:bg-muted/40 text-foreground/80"
                ) : (
                  idx === selectedSuggestion 
                    ? "bg-neon-cyan/20 text-neon-cyan" 
                    : "hover:bg-muted/30 text-muted-foreground"
                )
              )}
              onClick={() => {
                setInput(cmd.command + ' ');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              <cmd.icon className="w-3 h-3 shrink-0" />
              <span className="font-medium">{cmd.command}</span>
              <span className={isBiohack ? "text-neon-purple/80 text-[10px]" : isLight ? "text-muted-foreground/50 text-[10px]" : "text-muted-foreground/70 text-[10px]"}>∷</span>
              <span className={cn(
                "truncate flex-1 text-[10px]",
                isBiohack ? "text-neon-blue/60" : isLight ? "text-muted-foreground/70" : "text-muted-foreground/70"
              )}>{cmd.description}</span>
              {cmd.requiresOperator && (
                <Badge variant="outline" className={cn(
                  "text-[8px] h-4",
                  isBiohack ? "border-neon-purple/40 text-neon-purple" : "border-neon-amber/30 text-neon-amber"
                )}>
                  ⚡
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Smart Suggestions - Context-aware next commands */}
      {showSmartSuggestions && smartSuggestions.length > 0 && !showSuggestions && (
        <div className={cn(
          "border-t px-4 py-2 space-y-1 relative z-10",
          currentTheme.border,
          isBiohack 
            ? "biohack-suggestions" 
            : isLight
              ? "bg-gradient-to-r from-neon-amber/50 via-white to-neon-blue/50"
              : "bg-gradient-to-r from-neon-amber/5 via-transparent to-neon-cyan/5"
        )}>
          <div className={cn(
            "flex items-center gap-2 text-[10px] mb-1.5",
            isBiohack ? "text-neon-purple" : isLight ? "text-muted-foreground" : "text-muted-foreground"
          )}>
            <Sparkles className={cn("w-3 h-3", isBiohack ? "text-neon-cyan" : isLight ? "text-neon-amber" : "text-neon-amber")} 
              style={isBiohack ? { filter: 'drop-shadow(0 0 5px hsl(var(--neon-cyan)))' } : undefined} />
            <span>{isBiohack ? 'Neural Pathways' : 'Smart Suggestions'}</span>
            <span className={isBiohack ? "text-neon-blue/60" : isLight ? "text-muted-foreground/70" : "text-muted-foreground/50"}>
              • Press 1-{smartSuggestions.length} to execute • Esc to dismiss
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {smartSuggestions.map((suggestion, idx) => {
              const def = getSuggestionDefinition(suggestion.command);
              const Icon = def?.icon || Terminal;
              return (
                <div
                  key={suggestion.command}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-all group",
                    isBiohack 
                      ? "biohack-suggestion-item hover:biohack-suggestion-active"
                      : isLight
                        ? "hover:bg-neon-blue hover:text-neon-blue bg-muted/40 text-foreground/80"
                        : "hover:bg-neon-cyan/20 hover:text-neon-cyan bg-muted/20 text-muted-foreground"
                  )}
                  onClick={() => executeSmartSuggestion(idx + 1)}
                >
                  <span className={cn(
                    "flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold",
                    isBiohack 
                      ? "biohack-suggestion-number text-neon-cyan/80"
                      : isLight
                        ? "bg-neon-blue text-neon-blue group-hover:bg-neon-blue"
                        : "bg-neon-cyan/20 text-neon-cyan group-hover:bg-neon-cyan/30"
                  )}>
                    {idx + 1}
                  </span>
                  <Icon className="w-3 h-3 shrink-0 opacity-70" />
                  <span className={cn("font-medium", isBiohack && "text-neon-cyan/80")}>
                    {suggestion.command}
                  </span>
                  <span className={cn(
                    "text-[10px] truncate flex-1 hidden sm:block",
                    isBiohack ? "text-neon-blue/60" : isLight ? "text-muted-foreground/70" : "text-muted-foreground/50"
                  )}>
                    → {suggestion.reason}
                  </span>
                  {def?.requiresOperator && (
                    <Badge variant="outline" className={cn(
                      "text-[8px] h-4",
                      isBiohack ? "border-neon-purple/40 text-neon-purple" : "border-neon-amber/30 text-neon-amber"
                    )}>
                      ⚡
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reverse Search Bar */}
      {reverseSearchMode && (
        <div className={cn(
          "border-t px-4 py-2",
          currentTheme.border,
          isBiohack ? "biohack-suggestions" : isLight ? "bg-neon-amber" : "bg-neon-amber/5"
        )}>
          <div className="flex items-center gap-2">
            <SearchIcon className={cn("w-3 h-3", isBiohack ? "text-neon-cyan" : "text-neon-amber")} />
            <span className={cn("text-xs", isBiohack ? "text-neon-blue/60" : "text-neon-amber")}>
              reverse-i-search: {reverseSearchQuery}
            </span>
            {reverseSearchMatch && (
              <code className={cn("text-xs ml-2", isBiohack ? "text-neon-cyan/80" : "text-foreground")}>
                {reverseSearchMatch}
              </code>
            )}
            <span className={cn("text-[10px] ml-auto", isBiohack ? "text-neon-purple/80" : "text-muted-foreground")}>
              Enter to execute • Esc to cancel
            </span>
          </div>
        </div>
      )}

      {/* Input Line */}
      <form onSubmit={handleSubmit} className={cn(
        "border-t relative z-10",
        currentTheme.border,
        isBiohack ? "biohack-input-area" : isLight ? "bg-muted/30" : "bg-black/60"
      )}>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            {isBiohack ? (
              <div className="biohack-cursor" />
            ) : (
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse shadow-[0_0_6px]",
                theme === 'matrix' ? 'bg-neon-green shadow-neon-green/80' : 
                isLight ? 'bg-neon-blue shadow-neon-blue/80' : 'bg-neon-cyan shadow-neon-cyan/80'
              )} />
            )}
            {isBiohack ? (
              <Dna className="w-4 h-4 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 5px hsl(var(--neon-cyan)))' }} />
            ) : (
              <Terminal className={cn("w-4 h-4", currentTheme.accent)} />
            )}
          </div>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input.trim() && setSuggestions(searchCommands(input))}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={enabled 
              ? (isBiohack ? "neural interface ready... (1-4 for pathways, Tab for autocomplete)" : "enter command... (1-4 for suggestions, Tab for autocomplete)") 
              : (isBiohack ? "bio-scan mode — read-only access" : "observer mode — read-only commands only")
            }
            className={cn(
              "border-0 bg-transparent h-8 px-0 focus-visible:ring-0",
              isBiohack 
                ? "biohack-input placeholder:text-muted-foreground/40" 
                : isLight 
                  ? "text-foreground placeholder:text-muted-foreground/70"
                  : "text-foreground placeholder:text-muted-foreground/40",
              currentTheme.text
            )}
            autoComplete="off"
            spellCheck={false}
          />
          <div className={cn(
            "hidden sm:flex items-center gap-1 text-[10px]",
            isBiohack ? "" : isLight ? "text-muted-foreground/70" : "text-muted-foreground/50"
          )}>
            {showSmartSuggestions && (
              <>
                <kbd className={isBiohack ? "biohack-kbd biohack-kbd-smart" : isLight ? "px-1 py-0.5 rounded bg-neon-amber text-neon-amber" : "px-1 py-0.5 rounded bg-neon-amber/20 text-neon-amber"}>
                  1-4
                </kbd>
                <span className={isBiohack ? "text-neon-purple" : isLight ? "text-neon-amber" : "text-neon-amber/70"}>
                  {isBiohack ? 'neural' : 'smart'}
                </span>
              </>
            )}
            <kbd className={isBiohack ? "biohack-kbd" : isLight ? "px-1 py-0.5 rounded bg-muted/50 text-foreground/80" : "px-1 py-0.5 rounded bg-muted/30"}>↑↓</kbd>
            <span className={isBiohack ? "text-neon-cyan" : isLight ? "text-muted-foreground" : ""}>history</span>
            <kbd className={isBiohack ? "biohack-kbd" : isLight ? "px-1 py-0.5 rounded bg-neon-blue text-neon-blue" : "px-1 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan"}>Ctrl+R</kbd>
            <span>search</span>
            <kbd className={isBiohack ? "biohack-kbd" : isLight ? "px-1 py-0.5 rounded bg-neon-purple text-neon-purple" : "px-1 py-0.5 rounded bg-neon-purple/20 text-neon-purple"}>F11</kbd>
            <span>fullscreen</span>
          </div>
        </div>
      </form>
    </div>
  );
}
