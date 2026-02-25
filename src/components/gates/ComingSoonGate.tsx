/**
 * ComingSoonGate — Phase-gated landing page
 * Shows a polished "Coming Soon" teaser with optional waitlist signup
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Lock, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getGateInfo } from '@/config/gtm-phase';

export function ComingSoonGate() {
  const location = useLocation();
  const gate = getGateInfo(location.pathname);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [password, setPassword] = useState('');

  if (!gate) return null;

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('brain_events').insert({
        event_type: 'phase_waitlist',
        module: 'gtm_gate',
        data: { email, route: gate.path, phase: gate.unlocksAt, label: gate.label },
        source_operation: 'waitlist_signup',
      });
      
      if (error) throw error;
      setSubmitted(true);
      toast.success('You\'re on the list! We\'ll notify you when this launches.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'cmpsbl-internal-2026') {
      sessionStorage.setItem(`gate-${gate.path}`, 'unlocked');
      window.location.reload();
    } else {
      toast.error('Invalid access code.');
    }
  };

  // Check for session override
  if (sessionStorage.getItem(`gate-${gate.path}`) === 'unlocked') {
    return null;
  }

  const phaseLabels: Record<number, string> = {
    2: 'Platform Launch',
    3: 'Ecosystem Expansion',
    4: 'Full OS Release',
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        {/* Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full rounded-2xl border border-primary/20 bg-background">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            {phaseLabels[gate.unlocksAt] ?? 'Coming Soon'}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {gate.label}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            {gate.teaser}
          </p>
        </div>

        {/* Waitlist Form */}
        {gate.waitlist && !submitted && !passwordMode && (
          <form onSubmit={handleWaitlist} className="flex gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading} className="gap-2">
              <Bell className="w-4 h-4" />
              Notify Me
            </Button>
          </form>
        )}

        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 text-sm text-primary"
          >
            <Check className="w-4 h-4" />
            <span>You're on the waitlist. We'll be in touch.</span>
          </motion.div>
        )}

        {/* Password Override (hidden trigger) */}
        {passwordMode ? (
          <form onSubmit={handlePasswordSubmit} className="flex gap-2 max-w-sm mx-auto">
            <Input
              type="password"
              placeholder="Access code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              Unlock
            </Button>
          </form>
        ) : null}

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <button 
            onClick={() => setPasswordMode(!passwordMode)}
            className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors cursor-default"
          >
            ·
          </button>
        </div>
      </motion.div>
    </div>
  );
}
