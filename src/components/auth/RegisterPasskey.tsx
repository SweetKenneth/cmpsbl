/**
 * RegisterPasskey — Face ID setup prompt shown after magic link login
 * Automatically appears when user lands on /os after verifying email.
 * Also available as a standalone button for settings.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, X, CheckCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerPasskey, isPlatformAuthenticatorAvailable } from '@/lib/substrate/identity-module';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function RegisterPasskeyPrompt() {
  const { user, session } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user || !session) return;
    
    // Check if there's a pending passkey registration (set during login/signup)
    const pendingEmail = localStorage.getItem('cmpsbl_pending_passkey_email');
    
    // Show prompt if:
    // 1. There's a pending email that matches the logged-in user
    // 2. OR if user just logged in and hasn't registered a passkey yet
    const shouldPrompt = pendingEmail && pendingEmail === user.email;
    
    if (shouldPrompt) {
      // Small delay so the /os page renders first
      const timer = setTimeout(() => {
        isPlatformAuthenticatorAvailable().then(available => {
          if (available) {
            setShow(true);
          } else {
            // Clean up if device doesn't support it
            localStorage.removeItem('cmpsbl_pending_passkey_email');
          }
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
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
          localStorage.removeItem('cmpsbl_pending_passkey_email');
          
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
    localStorage.removeItem('cmpsbl_pending_passkey_email');
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
