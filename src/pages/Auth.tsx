/**
 * Enter the Stream — Cinematic Passwordless Authentication
 * Memory Stream identity layer with crystallization effects
 */

import { useState, useEffect, lazy, Suspense } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
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
  const [crystallizing, setCrystallizing] = useState(false);
  
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
    setCrystallizing(true);
    try {
      secureSet('cmpsbl_pending_passkey_email', loginEmail);
      await signInWithMagicLink(loginEmail);
      setMagicLinkSent('login');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
      setTimeout(() => setCrystallizing(false), 1500);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCrystallizing(true);
    try {
      secureSet('cmpsbl_pending_passkey_email', signupEmail);
      await signUpWithMagicLink(signupEmail, signupDisplayName);
      setMagicLinkSent('signup');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
      setTimeout(() => setCrystallizing(false), 1500);
    }
  };

  const handlePasskeyAuth = async () => {
    setLoading(true);
    setCrystallizing(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');
      if (redirectTo) {
        sessionStorage.setItem('cmpsbl_auth_redirect', redirectTo);
      }

      const { data: challengeData, error: challengeError } = await supabase.functions.invoke('passkey-auth/challenge', {
        method: 'POST',
        body: {},
      });
      if (challengeError || !challengeData?.challenge) {
        toast.error('Failed to start Face ID — try again');
        return;
      }

      const result = await authenticateWithPasskey([], challengeData.challenge);
      if (!result.success || !result.credentialId) {
        return;
      }

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

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: verifyData.session.access_token,
        refresh_token: verifyData.session.refresh_token,
      });

      if (sessionError) {
        toast.error('Session creation failed');
        return;
      }

      toast.success('Signed in with Face ID');
      const storedRedirect = sessionStorage.getItem('cmpsbl_auth_redirect');
      const urlParams = new URLSearchParams(window.location.search);
      navigate(storedRedirect || urlParams.get('redirect') || '/os');
    } catch (err: any) {
      console.error('Passkey auth error:', err);
      toast.error('Face ID authentication failed');
    } finally {
      setLoading(false);
      setTimeout(() => setCrystallizing(false), 1500);
    }
  };

  const SETUP_STEPS = [
    { num: '1', text: 'Enter your email and click "Send Link"' },
    { num: '2', text: 'Open the link in your email to sign in' },
    { num: '3', text: 'You\'ll be prompted to set up Face ID — tap "Set Up Face ID"' },
    { num: '4', text: 'Next time, just use Face ID to sign in instantly' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <PublicNav />
      
      {/* Cinematic Background — CSS-only for performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        
        {/* Radial glow orbs — CSS animations */}
        <div
          className="absolute top-1/4 left-[16%] w-[500px] h-[500px] rounded-full animate-hero-orb-1"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-[16%] w-[400px] h-[400px] rounded-full animate-hero-orb-2"
          style={{ background: 'radial-gradient(circle, hsl(var(--neon-cyan) / 0.06) 0%, transparent 70%)' }}
        />
        
        {/* Flowing stream lines — CSS only */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px animate-auth-stream"
            style={{
              top: `${15 + i * 18}%`,
              left: 0,
              right: 0,
              background: `linear-gradient(90deg, transparent 0%, hsl(var(--primary) / ${0.1 + i * 0.05}) 30%, hsl(var(--neon-cyan) / ${0.15 + i * 0.03}) 50%, hsl(var(--primary) / ${0.1 + i * 0.05}) 70%, transparent 100%)`,
              animationDuration: `${10 + i * 3}s`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
        
        {/* Substrate grid */}
        <div className="absolute inset-0 substrate-grid-bg opacity-30" />
      </div>
      
      {/* Memory Stream top accent bar */}
      <div className="memory-stream-bar h-[2px] w-full relative z-10" />
      
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        {/* Left Panel - How It Works */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto lg:mx-0"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-signal-pulse"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Fingerprint className="w-7 h-7 text-primary" />
                </motion.div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Enter the Stream
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono">
                    Passwordless · <span className="memory-stream-gradient-text">Signal → Silicon</span>
                  </p>
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
                    className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm signal-border"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <motion.div 
                      className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 text-xs font-bold text-primary"
                      animate={{ boxShadow: ['0 0 0px hsl(var(--primary) / 0)', '0 0 12px hsl(var(--primary) / 0.3)', '0 0 0px hsl(var(--primary) / 0)'] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {step.num}
                    </motion.div>
                    <p className="text-sm text-foreground/90 pt-0.5">{step.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Already have Face ID? */}
            {webAuthnAvailable && (
              <motion.div
                className="p-4 rounded-xl bg-primary/5 border border-primary/20 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
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
              transition={{ delay: 0.9 }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Passwordless • Phishing-resistant • Memory Stream identity</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 150, damping: 20 }}
            className="w-full max-w-md"
          >
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 backdrop-blur-xl">
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
                <Card className="border-border/30 bg-card/60 backdrop-blur-xl signal-border overflow-hidden shadow-xl shadow-primary/[0.03] hover:shadow-2xl hover:shadow-primary/[0.05] transition-shadow duration-500">
                  {/* Card top accent */}
                  <div className="memory-stream-bar h-[1px] w-full" />
                  
                  <AnimatePresence mode="wait">
                    {magicLinkSent === 'login' ? (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-8 text-center space-y-4"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto animate-signal-pulse"
                        >
                          <Mail className="w-8 h-8 text-primary" />
                        </motion.div>
                        <h3 className="text-lg font-semibold">Signal Transmitted</h3>
                        <p className="text-sm text-muted-foreground">
                          We sent a sign-in link to <strong className="text-foreground">{loginEmail}</strong>.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click the link to enter the stream. After signing in, you'll be asked if you want to set up Face ID for instant future access.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMagicLinkSent(null)}
                          className="mt-4"
                        >
                          ← Try a different email
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleLogin}
                      >
                        <CardHeader>
                        <CardTitle>Re-enter the Stream</CardTitle>
                          <CardDescription>
                            Use Face ID for instant access, or sign in with your email to resume crystallization.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {webAuthnAvailable && (
                            <div className="space-y-2">
                              <Button
                                type="button"
                                onClick={handlePasskeyAuth}
                                disabled={loading}
                                className="w-full gap-2 relative overflow-hidden"
                                size="lg"
                              >
                                <Fingerprint className="w-5 h-5" />
                                Sign In with Face ID
                                {loading && (
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  />
                                )}
                              </Button>
                              <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                  <span className="bg-card/80 px-2 text-muted-foreground backdrop-blur-sm">or use email</span>
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
                              className="bg-background/30 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
                            />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button type="submit" variant="outline" className="w-full gap-2 relative overflow-hidden" disabled={loading}>
                            <Mail className="w-4 h-4" />
                            {loading ? 'Crystallizing...' : 'Send Sign-In Link'}
                            <ArrowRight className="w-4 h-4" />
                            {loading && (
                              <motion.div
                                className="absolute bottom-0 left-0 h-[2px] memory-stream-bar"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2 }}
                              />
                            )}
                          </Button>
                        </CardFooter>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </Card>
              </TabsContent>
              
              {/* SIGN UP TAB */}
              <TabsContent value="signup">
                <Card className="border-border/30 bg-card/60 backdrop-blur-xl signal-border overflow-hidden shadow-xl shadow-primary/[0.03] hover:shadow-2xl hover:shadow-primary/[0.05] transition-shadow duration-500">
                  <div className="memory-stream-bar h-[1px] w-full" />
                  
                  <AnimatePresence mode="wait">
                    {magicLinkSent === 'signup' ? (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-8 text-center space-y-4"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto animate-signal-pulse"
                        >
                          <Mail className="w-8 h-8 text-primary" />
                        </motion.div>
                        <h3 className="text-lg font-semibold">Signal Crystallizing</h3>
                        <p className="text-sm text-muted-foreground">
                          We sent a verification link to <strong className="text-foreground">{signupEmail}</strong>.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click the link to join the stream. Once verified, you'll set up Face ID so you never need to check email again.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMagicLinkSent(null)}
                          className="mt-4"
                        >
                          ← Try a different email
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSignup}
                      >
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
                              className="bg-background/30 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
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
                              className="bg-background/30 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-3">
                          <Button type="submit" className="w-full gap-2 relative overflow-hidden" disabled={loading}>
                            <Mail className="w-4 h-4" />
                            {loading ? 'Crystallizing...' : 'Send Verification Link'}
                            {loading && (
                              <motion.div
                                className="absolute bottom-0 left-0 h-[2px] memory-stream-bar"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2 }}
                              />
                            )}
                          </Button>
                          <p className="text-[10px] text-muted-foreground text-center">
                            No passwords needed. You'll verify via email, then set up Face ID.
                          </p>
                        </CardFooter>
                      </motion.form>
                    )}
                  </AnimatePresence>
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
