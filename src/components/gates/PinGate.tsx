/**
 * PinGate — 6-digit numeric PIN lock for hidden pages
 * Stores unlock state in sessionStorage (clears on tab close)
 */

import { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinGateProps {
  pin: string;
  storageKey: string;
  children: React.ReactNode;
}

export function PinGate({ pin, storageKey, children }: PinGateProps) {
  const [unlocked, setUnlocked] = useState(() =>
    sessionStorage.getItem(storageKey) === 'unlocked'
  );
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    setError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (next.every(d => d !== '')) {
      const attempt = next.join('');
      if (attempt === pin) {
        sessionStorage.setItem(storageKey, 'unlocked');
        setUnlocked(true);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setDigits(Array(6).fill(''));
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={cn(
        "w-full max-w-sm p-8 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm",
        "flex flex-col items-center gap-6",
        shake && "animate-shake"
      )}>
        <div className="w-14 h-14 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Restricted Access</h1>
          <p className="text-xs text-muted-foreground font-mono">Enter 6-digit PIN to continue</p>
        </div>

        <div className="flex gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={cn(
                "w-10 h-12 text-center text-lg font-mono rounded-lg border bg-background/80",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                "transition-colors",
                error ? "border-destructive/60 text-destructive" : "border-border/40 text-foreground"
              )}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-destructive font-mono">Invalid PIN. Try again.</p>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <ShieldCheck className="w-3 h-3" />
          <span>Session-locked • Clears on tab close</span>
        </div>
      </div>
    </div>
  );
}
