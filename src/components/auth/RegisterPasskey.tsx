/**
 * RegisterPasskey — Prompt authenticated users to register Face ID
 * Shows after email verification if they started from the signup flow,
 * or can be triggered manually from settings.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, X, CheckCircle } from 'lucide-react';
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
    
    // Check if there's a pending passkey registration from signup
    const pendingEmail = localStorage.getItem('cmpsbl_pending_passkey_email');
    if (pendingEmail && pendingEmail === user.email) {
      isPlatformAuthenticatorAvailable().then(available => {
        if (available) setShow(true);
      });
    }
  }, [user, session]);

  const handleRegister = useCallback(async () => {
    if (!user || !session) return;
    setLoading(true);
    
    try {
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
      const result = await registerPasskey(user.id, displayName);
      
      if (result.success && result.credential) {
        // Store credential server-side via edge function
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
          toast.error('Face ID registered locally but server sync failed. Try again later.');
        } else {
          toast.success('Face ID registered — next time, just look at your phone to sign in.');
          setDone(true);
          localStorage.removeItem('cmpsbl_pending_passkey_email');
          
          // Auto-hide after 3 seconds
          setTimeout(() => setShow(false), 3000);
        }
      }
    } catch (err) {
      console.error('Passkey registration error:', err);
      toast.error('Face ID registration failed');
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.removeItem('cmpsbl_pending_passkey_email');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ paddingTop: 'env(safe-area-inset-top, 20px)', paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={handleDismiss} />
          <Card className="relative border-primary/30 bg-card/95 backdrop-blur-xl shadow-xl w-full max-w-md">
            <CardHeader className="pb-2 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base flex items-center gap-2">
                {done ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Fingerprint className="h-5 w-5 text-primary" />}
                {done ? 'Face ID Registered' : 'Enable Face ID Sign-In'}
              </CardTitle>
              <CardDescription className="text-xs">
                {done 
                  ? 'Next time, just use Face ID — no email needed.'
                  : 'Sign in instantly with Face ID. No passwords, no emails.'}
              </CardDescription>
            </CardHeader>
            {!done && (
              <CardContent className="pt-0 pb-4">
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full gap-2"
                  size="sm"
                >
                  <Fingerprint className="h-4 w-4" />
                  {loading ? 'Registering...' : 'Register Face ID'}
                </Button>
              </CardContent>
            )}
          </Card>
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
      {registered ? 'Face ID Registered ✓' : loading ? 'Registering...' : 'Register Face ID'}
    </Button>
  );
}
