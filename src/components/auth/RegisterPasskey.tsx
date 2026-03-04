/**
 * RegisterPasskey — Face ID setup prompt shown after magic link login
 * Automatically appears when user lands on /os after verifying email.
 * Also available as a standalone button for settings.
 * 
 * Detection strategy (resilient to cross-browser magic link clicks):
 * 1. Primary: Check if user just arrived via magic link (URL hash or auth event)
 * 2. Secondary: Check localStorage flag (works when same browser)
 * 3. Server check: Only prompt if user has no passkeys registered
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, X, CheckCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerPasskey, isPlatformAuthenticatorAvailable } from '@/lib/substrate/identity-module';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureGet, secureRemove } from '@/lib/system/secureStorage';

/** Session key to prevent re-prompting within the same session */
const DISMISSED_KEY = 'cmpsbl_passkey_prompt_dismissed';

export function RegisterPasskeyPrompt() {
  const { user, session } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!user || !session) return;
    if (checkedRef.current) return;
    checkedRef.current = true;

    // Don't re-prompt if user already dismissed in this session
    if (sessionStorage.getItem(DISMISSED_KEY) === 'true') return;

    // Determine if this looks like a fresh sign-in (magic link landing)
    const hasPendingFlag = secureGet<string>('cmpsbl_pending_passkey_email') === user.email;
    const urlHash = window.location.hash || '';
    const isMagicLinkLanding = urlHash.includes('access_token') || urlHash.includes('type=magiclink') || urlHash.includes('type=signup');
    const justSignedIn = hasPendingFlag || isMagicLinkLanding;

    // If no signal of fresh sign-in, check if user signed in within last 60 seconds
    const sessionCreatedAt = session.expires_at 
      ? (session.expires_at * 1000) - (3600 * 1000) // expires_at minus 1 hour = created ~
      : 0;
    const isRecentSession = Date.now() - sessionCreatedAt < 120_000; // 2 min window

    if (!justSignedIn && !isRecentSession) return;

    // Check device support then check if user already has passkeys
    const timer = setTimeout(async () => {
      try {
        const available = await isPlatformAuthenticatorAvailable();
        if (!available) {
          secureRemove('cmpsbl_pending_passkey_email');
          return;
        }

        // Ask the server if user already has passkeys registered
        const { data, error } = await supabase.functions.invoke('passkey-auth/list', {
          method: 'POST',
          body: {},
        });

        // If server check fails, still show prompt (worst case user sees it with existing passkeys)
        const hasPasskeys = !error && data?.passkeys && data.passkeys.length > 0;
        
        if (!hasPasskeys) {
          setShow(true);
        } else {
          // User already has passkeys, clean up
          secureRemove('cmpsbl_pending_passkey_email');
        }
      } catch {
        // Fallback: show prompt anyway if we can't check
        const available = await isPlatformAuthenticatorAvailable().catch(() => false);
        if (available) setShow(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, session]);

  const handleRegister = useCallback(async () => {
    if (!user || !session) return;
    setLoading(true);
    
    try {
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
      const result = await registerPasskey(user.id, displayName);
      
      if (result.success && result.credential) {
        // Store credential server-side
        const { error } = await supabase.functions.invoke('passkey-auth/register', {
          method: 'POST',
          body: {
            credentialId: result.credential.credentialId,
            publicKey: result.credential.publicKey,
            deviceType: result.credential.deviceType,
            transports: result.credential.transports,
          },
        });

        if (error) {
          console.error('Server passkey registration error:', error);
          toast.error('Face ID saved locally but server sync failed. You can try again from settings.');
        } else {
          toast.success('Face ID set up! Next time, just use Face ID to sign in.');
          setDone(true);
          secureRemove('cmpsbl_pending_passkey_email');
          
          // Auto-hide after 4 seconds
          setTimeout(() => setShow(false), 4000);
        }
      }
    } catch (err) {
      console.error('Passkey registration error:', err);
      toast.error('Face ID setup failed — you can try again from settings.');
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  const handleSkip = () => {
    setShow(false);
    secureRemove('cmpsbl_pending_passkey_email');
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    toast.info('You can set up Face ID later from your settings.', { duration: 4000 });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[11000] flex items-center justify-center p-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={handleSkip} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Card className="relative border-primary/30 bg-card/95 backdrop-blur-xl shadow-2xl w-full max-w-sm">
              <CardHeader className="pb-3 relative text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7"
                  onClick={handleSkip}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Icon */}
                <div className="mx-auto mb-3">
                  {done ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center"
                    >
                      <CheckCircle className="h-8 w-8 text-accent-foreground" />
                    </motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Fingerprint className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>

                <CardTitle className="text-lg">
                  {done ? 'Face ID is ready!' : 'Set up Face ID?'}
                </CardTitle>
                <CardDescription className="text-sm">
                  {done 
                    ? 'Next time you sign in, just use Face ID — no email needed.'
                    : 'Sign in instantly next time with just your face. Takes 5 seconds.'}
                </CardDescription>
              </CardHeader>

              {!done && (
                <CardContent className="pt-0 pb-5 space-y-3">
                  {/* How it works mini explainer */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>Your device stores a secure key — we never see your face data</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Fingerprint className="h-5 w-5" />
                    {loading ? 'Setting up...' : 'Set Up Face ID'}
                  </Button>
                  
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    size="sm"
                  >
                    Skip for now
                  </Button>
                </CardContent>
              )}

              {done && (
                <CardContent className="pt-0 pb-5">
                  <Button
                    onClick={() => setShow(false)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Continue
                  </Button>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Standalone button for registering Face ID from settings/profile
 */
export function RegisterPasskeyButton() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setAvailable);
  }, []);

  const handleRegister = async () => {
    if (!user || !session) {
      toast.error('Sign in first to register Face ID');
      return;
    }
    setLoading(true);
    try {
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
      const result = await registerPasskey(user.id, displayName);
      
      if (result.success && result.credential) {
        const { error } = await supabase.functions.invoke('passkey-auth/register', {
          method: 'POST',
          body: {
            credentialId: result.credential.credentialId,
            publicKey: result.credential.publicKey,
            deviceType: result.credential.deviceType,
            transports: result.credential.transports,
          },
        });

        if (error) {
          toast.error('Server registration failed — try again');
        } else {
          toast.success('Face ID registered!');
          setRegistered(true);
        }
      }
    } catch {
      toast.error('Face ID registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!available) return null;

  return (
    <Button
      onClick={handleRegister}
      disabled={loading || registered}
      variant={registered ? 'outline' : 'default'}
      className="gap-2"
    >
      <Fingerprint className="h-4 w-4" />
      {registered ? 'Face ID Registered ✓' : loading ? 'Setting up...' : 'Set Up Face ID'}
    </Button>
  );
}
