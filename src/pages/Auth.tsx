/**
 * Observer Mode Authentication
 * Unique landing for substrate observers with 24/7 CLM status
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Brain, Activity, Sparkles, Radio, Cpu, 
  Shield, Layers, BarChart3, Lock, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';

// Animated background particles
function ObserverParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-500/30"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: 0
          }}
          animate={{ 
            y: [null, '-20%'],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

// CLM Status Indicator
function CLMStatusBadge() {
  const [pulse, setPulse] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30"
      animate={{ scale: pulse ? 1 : 1.02 }}
      transition={{ duration: 0.5 }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-xs font-mono text-emerald-400">24/7 CLM ACTIVE</span>
    </motion.div>
  );
}

// Observer capabilities list
const OBSERVER_CAPABILITIES = [
  {
    icon: BarChart3,
    title: 'Dashboard Telemetry',
    description: 'View real-time system health, module status, and performance metrics',
    path: '/os'
  },
  {
    icon: Brain,
    title: 'Watch AI Learn',
    description: '14 modules continuously self-improve through autonomous learning cycles',
  },
  {
    icon: Activity,
    title: 'System Intelligence Feed',
    description: 'See live improvement requests, KPIs, and reflections from every module',
    path: '/system-feed'
  },
  {
    icon: Layers,
    title: 'Module Health',
    description: 'Monitor Brain, Defense, Nexus, Dream, Vision, and 9 more core modules',
  },
];

// Module icons animation
function ModuleIconsStrip() {
  const modules = [Brain, Shield, Radio, Cpu, Eye, Sparkles];
  
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {modules.map((Icon, i) => (
        <motion.div
          key={i}
          className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.1, borderColor: 'rgb(var(--primary))' }}
        >
          <Icon className="w-4 h-4 text-primary/70" />
        </motion.div>
      ))}
    </div>
  );
}

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupDisplayName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <PublicNav />
      
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[120px]" />
        </div>
        <ObserverParticles />

      {/* Left Panel - Observer Mode Info */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto lg:mx-0"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-primary/10 to-fuchsia-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Eye className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-400 via-primary to-fuchsia-400 bg-clip-text text-transparent">
                    Observer Mode
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground font-mono">substrate visibility layer</p>
              </div>
            </div>
            <CLMStatusBadge />
          </div>

          {/* Description */}
          <div className="mb-8 space-y-4">
            <p className="text-lg text-foreground/90">
              Watch the substrate think, learn, and evolve in real-time.
            </p>
            <p className="text-muted-foreground">
              As an observer, you gain read-only access to the cognitive substrate's 
              autonomous learning system. No interaction required—just observe 14 modules 
              continuously improving themselves.
            </p>
          </div>

          {/* Module icons */}
          <ModuleIconsStrip />

          {/* Capabilities */}
          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Observer Access Includes
            </h3>
            <div className="grid gap-3">
              {OBSERVER_CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <cap.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{cap.title}</h4>
                    <p className="text-xs text-muted-foreground">{cap.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Observer notice */}
          <motion.div
            className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-amber-200/90 font-medium">Read-Only Access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Observers cannot interact with controls, execute commands, or modify settings. 
                  Upgrade to Operator or Governor access for full system control.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="gap-2">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2">
                <Eye className="w-3.5 h-3.5" />
                Become Observer
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to continue observing the substrate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="bg-background/50"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-xl">
                <form onSubmit={handleSignup}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle>Become an Observer</CardTitle>
                        <CardDescription>
                          Join the substrate visibility layer
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* What you get */}
                    <div className="bg-gradient-to-r from-cyan-500/5 to-fuchsia-500/5 rounded-lg p-4 border border-cyan-500/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium">What you'll see:</span>
                      </div>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          <span>Live <strong className="text-foreground">/os</strong> dashboard with system health</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                          <span>14 modules learning autonomously 24/7</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>System Intelligence Feed at <strong className="text-foreground">/system-feed</strong></span>
                        </li>
                      </ul>
                    </div>

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
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        At least 6 characters
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-3">
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      <Eye className="w-4 h-4" />
                      {loading ? 'Creating account...' : 'Start Observing'}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      By signing up, you'll be granted Observer role with read-only access
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <a 
                href="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to Home
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <a href="/system-feed" className="text-muted-foreground hover:text-primary transition-colors">
                System Feed
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="/library" className="text-muted-foreground hover:text-primary transition-colors">
                Docs
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </a>
            </div>
            <p className="text-center text-[10px] text-muted-foreground font-mono">
              CMPSBL substrate • observer layer v7.0.0
            </p>
          </div>
        </motion.div>
      </div>
      </div>
      <EnhancedFooter />
    </div>
  );
}
