/**
 * PasskeyButton — Passwordless Authentication Trigger
 *
 * 
 * Renders Face ID / Touch ID / Windows Hello prompt.
 * No password fields. No shared secrets. Hardware-bound only.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasskeyButtonProps {
  mode: 'register' | 'authenticate';
  onRegister?: () => Promise<void>;
  onAuthenticate?: () => Promise<void>;
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function PasskeyButton({
  mode,
  onRegister,
  onAuthenticate,
  disabled = false,
  className,
  size = 'default',
}: PasskeyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (mode === 'register' && onRegister) {
        await onRegister();
      } else if (mode === 'authenticate' && onAuthenticate) {
        await onAuthenticate();
      }
    } finally {
      setLoading(false);
    }
  };

  const Icon = mode === 'register' ? ShieldCheck : Fingerprint;
  const label = mode === 'register' ? 'Secure Sign Up' : 'Secure Sign In';

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      size={size}
      className={cn(
        'gap-2 font-semibold transition-all',
        mode === 'register'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'bg-accent text-accent-foreground hover:bg-accent/80',
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
