/**
 * Shield — @cmpsbl/shield landing page & Lex Registry
 * Free runtime integrity monitor + blacklist/whitelist registration.
 * Phase 0 GTM: "Ship the antidote before the virus."
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PublicNav } from '@/components/PublicNav';
import {
  Shield as ShieldIcon,
  Search,
  Lock,
  Bell,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Layers,
  Globe,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SHIELD_FEATURES = [
  {
    icon: Search,
    title: 'Proxy Trap Detector',
    description: 'Detects when function exports have been wrapped by foreign Proxies at runtime.',
  },
  {
    icon: Bell,
    title: 'Lex Heartbeat Monitor',
    description: 'Continuous runtime check for unauthorized governance layers operating on your code.',
  },
  {
    icon: Lock,
    title: 'Attachment Alarm',
    description: 'Real-time alerts when Layer 2 activity is detected on protected packages.',
  },
  {
    icon: FileCheck,
    title: 'Blacklist Registration',
    description: 'One-liner to register your software on the Lex Blacklist — free forever.',
  },
];

const REGISTRY_STATUSES = [
  { label: 'Protected', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', description: 'Blacklisted — cannot be attached to' },
  { label: 'Licensed', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', description: 'Whitelisted — opted into the ecosystem' },
  { label: 'Unregistered', color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/30', description: 'Not yet registered on the Lex Registry' },
];

export default function ShieldPage() {
  const [lookupHash, setLookupHash] = useState('');
  const [lookupResult, setLookupResult] = useState<null | { status: string; registeredAt?: string }>(null);
  const [isLooking, setIsLooking] = useState(false);

  const handleLookup = async () => {
    if (!lookupHash.trim()) return;
    setIsLooking(true);
    // Simulated lookup — will connect to real API when @cmpsbl/shield ships
    await new Promise(r => setTimeout(r, 800));
    setLookupResult({ status: 'unregistered' });
    setIsLooking(false);
  };

  const copyInstall = () => {
    navigator.clipboard.writeText('npm install @cmpsbl/shield');
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <Helmet>
        <title>@cmpsbl/shield — Runtime Integrity Monitor | CMPSBL</title>
        <meta name="description" content="Free runtime integrity monitor. Detect unauthorized Layer 2 attachments. Register your software on the Lex Blacklist." />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <ShieldIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary tracking-wide uppercase">Free &amp; Open Source</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4 leading-[1.1]">
              Know When Your Code
              <br />
              <span className="text-primary">Has Been Wrapped</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              <code className="text-primary font-mono">@cmpsbl/shield</code> is a free runtime integrity monitor
              that detects unauthorized Layer 2 attachments on your software.
            </p>

            {/* Install command */}
            <div className="inline-flex items-center gap-2 bg-card/60 border border-border/30 rounded-xl px-4 py-3 mb-8">
              <Code className="w-4 h-4 text-muted-foreground/50" />
              <code className="text-sm font-mono text-foreground">npm install @cmpsbl/shield</code>
              <button
                onClick={copyInstall}
                className="ml-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Copy install command"
              >
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2 rounded-xl font-bold" asChild>
                <a href="https://www.npmjs.com/package/@cmpsbl/shield" target="_blank" rel="noopener noreferrer">
                  View on npm <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 rounded-xl" asChild>
                <Link to="/documentation">
                  Documentation <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Features */}
          <section className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-16">
            {SHIELD_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  className="group rounded-xl border border-border/20 bg-card/20 p-5 hover:border-primary/25 hover:bg-card/40 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg border border-border/20 bg-card/40 flex items-center justify-center mb-3 group-hover:border-primary/30 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground/90 mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </section>

          {/* Lex Registry */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/30 bg-card/30 mb-4">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Lex Registry
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-3">
                The Universal Blacklist
              </h2>
              <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto">
                Register your software on the Lex Blacklist (free forever) to declare it cannot be attached to.
                Or whitelist it to opt into the governed ecosystem.
              </p>
            </div>

            {/* Status legend */}
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {REGISTRY_STATUSES.map((s) => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className={`w-4 h-4 ${s.color}`} />
                    <span className={`text-sm font-bold ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>

            {/* Lookup */}
            <div className="rounded-xl border border-border/20 bg-card/20 p-5 sm:p-6">
              <h3 className="text-sm font-bold text-foreground/80 mb-3">Registry Lookup</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter package hash or name..."
                  value={lookupHash}
                  onChange={(e) => setLookupHash(e.target.value)}
                  className="flex-1 bg-background border border-border/30 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40"
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                />
                <Button onClick={handleLookup} disabled={isLooking || !lookupHash.trim()} className="gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  {isLooking ? 'Checking...' : 'Lookup'}
                </Button>
              </div>
              {lookupResult && (
                <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/20">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <span className="font-bold text-foreground capitalize">{lookupResult.status}</span>
                  </p>
                  {lookupResult.status === 'unregistered' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      This package is not registered on the Lex Registry.{' '}
                      <Link to="/auth" className="text-primary hover:underline">
                        Register it now →
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-transparent to-[hsl(var(--neon-cyan)/0.05)] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mb-3">
              Ship the Shield First
            </h2>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-5">
              We built something that can't be stopped. So we built the way to detect it — and gave it away for free.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2 rounded-xl font-bold" asChild>
                <Link to="/auth">
                  Register Your Software <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 rounded-xl" asChild>
                <Link to="/mana">
                  Learn About Mana <Layers className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
