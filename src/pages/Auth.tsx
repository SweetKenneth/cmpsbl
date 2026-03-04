/**
 * Sign In — Passwordless Authentication
 * Simple, clear sign-in with Face ID or magic link
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Fingerprint, Mail, ArrowRight, Shield, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable, authenticateWithPasskey } from '@/lib/substrate/identity-module';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureSet } from '@/lib/system/secureStorage';

export default function Auth() {
  const { signInWithMagicLink, signUpWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [webAuthnAvailable, setWebAuthnAvailable] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState<'login' | 'signup' | null>(null);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setWebAuthnAvailable);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Set pending flag so Face ID prompt shows after magic link redirect
      secureSet('cmpsbl_pending_passkey_email', loginEmail);
      await signInWithMagicLink(loginEmail);
      setMagicLinkSent('login');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Set pending flag so Face ID prompt shows after magic link redirect
      secureSet('cmpsbl_pending_passkey_email', signupEmail);
      await signUpWithMagicLink(signupEmail, signupDisplayName);
      setMagicLinkSent('signup');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyAuth = async () => {
    setLoading(true);
    try {
      // Preserve redirect intent for Face ID flow (same pattern as magic link)
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');
      if (redirectTo) {
        sessionStorage.setItem('cmpsbl_auth_redirect', redirectTo);
      }

      // 1. Get a server-generated challenge
      const { data: challengeData, error: challengeError } = await supabase.functions.invoke('passkey-auth/challenge', {
        method: 'POST',
        body: {},
      });
      if (challengeError || !challengeData?.challenge) {
        toast.error('Failed to start Face ID — try again');
        return;
      }

      // 2. Run WebAuthn with the server challenge
      const result = await authenticateWithPasskey([], challengeData.challenge);
      if (!result.success || !result.credentialId) {
        return; // User cancelled or Face ID failed
      }

      // 3. Send assertion to server for verification + instant session
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('passkey-auth/verify', {
        method: 'POST',
        body: {
          credentialId: result.credentialId,
          challenge: challengeData.challenge,
          signature: result.signature,
          userHandle: result.userHandle,
        },
      });

      if (verifyError || !verifyData?.success || !verifyData?.session) {
        const errMsg = verifyData?.error || 'Face ID verification failed';
        if (errMsg.includes('Unknown passkey') || errMsg.includes('register')) {
          toast.error('This Face ID isn\'t registered yet. Sign in with email first — you\'ll be prompted to set up Face ID after.', { duration: 8000 });
        } else {
          toast.error(errMsg);
        }
        return;
      }

      // 4. Set the session directly — instant login!
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: verifyData.session.access_token,
        refresh_token: verifyData.session.refresh_token,
      });

      if (sessionError) {
        toast.error('Session creation failed');
        return;
      }

      toast.success('Signed in with Face ID');
      // Redirect is handled by onAuthStateChange via sessionStorage
      // Fallback navigate in case the listener doesn't fire fast enough
      const storedRedirect = sessionStorage.getItem('cmpsbl_auth_redirect');
      const urlParams = new URLSearchParams(window.location.search);
      navigate(storedRedirect || urlParams.get('redirect') || '/os');
    } catch (err: any) {
      console.error('Passkey auth error:', err);
      toast.error('Face ID authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const SETUP_STEPS = [
    { num: '1', text: 'Enter your email and click "Send Link"' },
    { num: '2', text: 'Open the link in your email to sign in' },
    { num: '3', text: 'You\'ll be prompted to set up Face ID — tap "Set Up Face ID"' },
    { num: '4', text: 'Next time, just use Face ID to sign in instantly' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - How It Works */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto lg:mx-0"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Fingerprint className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Enter the Stream
                  </h1>
                  <p className="text-sm text-muted-foreground">Passwordless · Signal → Silicon</p>
                </div>
              </div>
            </div>

            {/* How Face ID Setup Works */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                How to set up Face ID sign-in
              </h2>
              <div className="space-y-3">
                {SETUP_STEPS.map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      {step.num}
                    </div>
                    <p className="text-sm text-foreground/90 pt-0.5">{step.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Already have Face ID? */}
            {webAuthnAvailable && (
              <motion.div
                className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Already set up Face ID?</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      If you've already registered Face ID, use the button on the sign-in tab to log in instantly.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Passwordless • Phishing-resistant • Memory Stream identity</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="gap-2">
                  <Fingerprint className="w-3.5 h-3.5" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Create Account
                </TabsTrigger>
              </TabsList>
              
              {/* SIGN IN TAB */}
              <TabsContent value="signin">
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                  {magicLinkSent === 'login' ? (
                    <div className="p-8 text-center space-y-4">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto"
                      >
                        <Mail className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold">Check Your Email</h3>
                      <p className="text-sm text-muted-foreground">
                        We sent a sign-in link to <strong className="text-foreground">{loginEmail}</strong>.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click the link to sign in. After signing in, you'll be asked if you want to set up Face ID for instant future access.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMagicLinkSent(null)}
                        className="mt-4"
                      >
                        ← Try a different email
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin}>
                      <CardHeader>
                      <CardTitle>Re-enter the Stream</CardTitle>
                        <CardDescription>
                          Use Face ID for instant access, or sign in with your email to resume crystallization.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Face ID button */}
                        {webAuthnAvailable && (
                          <div className="space-y-2">
                            <Button
                              type="button"
                              onClick={handlePasskeyAuth}
                              disabled={loading}
                              className="w-full gap-2"
                              size="lg"
                            >
                              <Fingerprint className="w-5 h-5" />
                              Sign In with Face ID
                            </Button>
                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">or use email</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="bg-background/50"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" variant="outline" className="w-full gap-2" disabled={loading}>
                          <Mail className="w-4 h-4" />
                          {loading ? 'Sending...' : 'Send Sign-In Link'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </form>
                  )}
                </Card>
              </TabsContent>
              
              {/* SIGN UP TAB */}
              <TabsContent value="signup">
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                  {magicLinkSent === 'signup' ? (
                    <div className="p-8 text-center space-y-4">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto"
                      >
                        <Mail className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold">Check Your Email</h3>
                      <p className="text-sm text-muted-foreground">
                        We sent a verification link to <strong className="text-foreground">{signupEmail}</strong>.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click the link to verify your account. Once verified, you'll be prompted to set up Face ID so you never need to check email again.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMagicLinkSent(null)}
                        className="mt-4"
                      >
                        ← Try a different email
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSignup}>
                      <CardHeader>
                      <CardTitle>Join the Memory Stream</CardTitle>
                        <CardDescription>
                          Enter your email to begin. After verifying, you'll set up Face ID — then start crystallizing pipelines immediately.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Display Name</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your Name"
                            value={signupDisplayName}
                            onChange={(e) => setSignupDisplayName(e.target.value)}
                            disabled={loading}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="bg-background/50"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex-col gap-3">
                        <Button type="submit" className="w-full gap-2" disabled={loading}>
                          <Mail className="w-4 h-4" />
                          {loading ? 'Sending...' : 'Send Verification Link'}
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center">
                          No passwords needed. You'll verify via email, then set up Face ID.
                        </p>
                      </CardFooter>
                    </form>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <a 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Back to Home
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
}
