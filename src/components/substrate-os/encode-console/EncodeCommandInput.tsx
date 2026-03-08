/**
 * ENCODE Command Input — Structured command interface
 * Not a chatbot. Engineering commands only.
 */

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ENCODE_COMMANDS = [
  { cmd: '/analyze system', desc: 'Run full architecture audit' },
  { cmd: '/build <system>', desc: 'Generate new system scaffolding' },
  { cmd: '/modify <module>', desc: 'Propose modification to existing module' },
  { cmd: '/evolve <pipeline>', desc: 'Evolve a pipeline with learned patterns' },
  { cmd: '/instantiate <artifact>', desc: 'Create artifact from template' },
  { cmd: '/export <artifact>', desc: 'Package artifact for distribution' },
  { cmd: '/status', desc: 'ENCODE health & lock state' },
  { cmd: '/audit', desc: 'Run architecture snapshot' },
  { cmd: '/approve', desc: 'Approve pending execution plan' },
  { cmd: '/reject <reason>', desc: 'Reject pending plan with reason' },
  { cmd: '/clear', desc: 'Reset session' },
  { cmd: '/help', desc: 'Show available commands' },
];

interface EncodeCommandInputProps {
  onSubmit: (command: string) => void;
  disabled?: boolean;
  isLocked?: boolean;
}

export function EncodeCommandInput({ onSubmit, disabled, isLocked }: EncodeCommandInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value.startsWith('/')
    ? ENCODE_COMMANDS.filter(c => c.cmd.startsWith(value.toLowerCase()))
    : [];

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
    setShowSuggestions(false);
  }, [value, onSubmit]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Tab' && filtered.length === 1) {
      e.preventDefault();
      setValue(filtered[0].cmd);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      {/* Suggestions */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border/30 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {filtered.map(s => (
            <button
              key={s.cmd}
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors flex items-center justify-between gap-2"
              onClick={() => { setValue(s.cmd); setShowSuggestions(false); inputRef.current?.focus(); }}
            >
              <code className="text-primary font-mono">{s.cmd}</code>
              <span className="text-muted-foreground/60 text-[10px]">{s.desc}</span>
            </button>
          ))}
        </div>
      )}

      <div className={cn(
        "flex items-center gap-2 bg-card border border-border/30 rounded-lg px-3 py-2",
        isLocked && "border-destructive/30 bg-destructive/5"
      )}>
        <Terminal className="w-4 h-4 text-muted-foreground/50 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setShowSuggestions(e.target.value.startsWith('/')); }}
          onKeyDown={handleKeyDown}
          onFocus={() => value.startsWith('/') && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={isLocked ? 'EXECUTION LOCKED — run /audit first' : 'Enter command (/ for suggestions)'}
          disabled={disabled}
          className="flex-1 bg-transparent border-0 outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/40"
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="h-7 w-7 p-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export { ENCODE_COMMANDS };
