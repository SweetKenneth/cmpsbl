/**
 * Shield — @cmpsbl/shield Landing Page & Lex Registry
 * "Ship the antidote before the virus."
 * 
 * Fear-to-action narrative: Mana is unstoppable → Shield is your only defense.
 * U.S. Patent App. Nos. 64/029,678 & 64/031,637
 * 
 * © CMPSBL® — All rights reserved.
 */

import { useState } from 'react';
import { lookupRegistry, registerPackage, generatePackageHash } from '@/services/lex-registry';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PublicNav } from '@/components/PublicNav';
import { SEO } from '@/components/SEO';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
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
  AlertTriangle,
  Skull,
  Eye,
  Zap,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Bug,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import shieldHero from '@/assets/shield-hero.jpg';
import shieldMidpage from '@/assets/shield-midpage.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

/* ─── Mana Threat Capabilities ─── */
const MANA_THREATS = [
  {
    icon: Eye,
    title: 'Silent Attachment',
    description: 'Wraps any codebase at runtime without modifying a single byte of source code. No permission needed.',
    severity: 'critical',
  },
  {
    icon: Lock,
    title: 'Zero-Knowledge Operation',
    description: 'The host application never knows it has been wrapped. No API keys, no developer consent, no logs.',
    severity: 'critical',
  },
  {
    icon: Layers,
    title: 'Recursive Layer Composition',
    description: 'Multiple layers can stack invisibly — Layer 3 wraps Layer 2 wraps Layer 1 — with no detection surface.',
    severity: 'high',
  },
  {
    icon: Bug,
    title: 'Indefensible by Design',
    description: 'Object.freeze() breaks framework compatibility. Code obfuscation is bypassed via behavioral mapping. Traditional defenses fail.',
    severity: 'critical',
  },
];

/* ─── Shield Detection Features ─── */
const SHIELD_FEATURES = [
  {
    icon: Search,
    title: 'Behavioral Signature Detection',
    description: 'Identifies foreign runtime signatures when function exports have been intercepted at the execution boundary.',
  },
  {
    icon: Bell,
    title: 'Lex Heartbeat Monitor',
    description: 'Continuous runtime verification for unauthorized governance layers operating silently on your code.',
  },
  {
    icon: Lock,
    title: 'Attachment Alarm System',
    description: 'Real-time alerts the moment Layer 2 activity is detected on any registered or monitored package.',
  },
  {
    icon: FileCheck,
    title: 'Lex Blacklist Registration',
    description: 'One-liner to declare your software cannot be attached to — registered on the universal governance layer. Free forever.',
  },
];

const REGISTRY_STATUSES = [
  {
    label: 'Protected',
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/20',
    icon: ShieldAlert,
    description: 'Blacklisted — immune to Layer 2 attachment',
  },
  {
    label: 'Licensed',
    color: 'text-[hsl(var(--neon-cyan))]',
    bg: 'bg-[hsl(var(--neon-cyan)/0.1)] border-[hsl(var(--neon-cyan)/0.2)]',
    icon: ShieldCheck,
    description: 'Whitelisted — opted into the governed ecosystem',
  },
  {
    label: 'Unregistered',
    color: 'text-muted-foreground',
    bg: 'bg-muted/30 border-border/30',
    icon: AlertTriangle,
    description: 'Vulnerable — no protection, no governance',
  },
];

const SHIELD_FAQ = [
  { question: 'What is @cmpsbl/shield?', answer: 'A free, zero-dependency runtime integrity monitor that detects unauthorized Layer 2 attachments on your software. It identifies behavioral signatures that indicate your code has been silently wrapped.' },
  { question: 'What is Mana and why is it dangerous?', answer: 'Mana is CMPSBL\'s patented Silent Software Symbiosis Engine (U.S. Patent App. No. 64/031,637). It can attach capabilities to any software without modifying source code or requiring developer permission. Traditional defenses like Object.freeze() cannot stop it.' },
  { question: 'How does the Lex Blacklist protect me?', answer: 'The Lex Blacklist is a universal governance registry. Once your software is registered, Lex — the governance layer — prevents any compliant attachment engine from wrapping it. Registration is free forever.' },
  { question: 'Why is CMPSBL giving Shield away for free?', answer: 'We invented the technology that makes silent attachment possible. We have a responsibility to provide detection and protection tools. Shield is our commitment to public safety — the antidote shipped before the virus.' },
];

export default function ShieldPage() {
  const [lookupHash, setLookupHash] = useState('');
  const [lookupResult, setLookupResult] = useState<null | { status: string; package_name?: string | null; registered_at?: string | null }>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationPackage, setRegistrationPackage] = useState('');
  const [registrationType, setRegistrationType] = useState<'blacklist' | 'whitelist'>('blacklist');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLookup = async () => {
    if (!lookupHash.trim()) return;
    setIsLooking(true);
    try {
      const isHash = /^[a-f0-9]{64}$/i.test(lookupHash.trim());
      const result = await lookupRegistry(
        isHash ? { hash: lookupHash.trim().toLowerCase() } : { name: lookupHash.trim() }
      );
      setLookupResult(result);
    } catch {
      toast.error('Registry lookup failed. Please try again.');
    } finally {
      setIsLooking(false);
    }
  };

  const handleRegistration = async () => {
    if (!registrationPackage.trim()) {
      toast.error('Package name is required.');
      return;
    }

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to register packages.', {
        action: { label: 'Sign In', onClick: () => window.location.href = '/auth' },
      });
      return;
    }

    setIsRegistering(true);
    try {
      const hash = await generatePackageHash(registrationPackage.trim());
      await registerPackage({
        package_name: registrationPackage.trim(),
        package_hash: hash,
        status: registrationType === 'blacklist' ? 'protected' : 'licensed',
        metadata: { registrant_email: registrationEmail || user.email },
      });
      toast.success(
        registrationType === 'blacklist'
          ? 'Blacklist registration complete — your software is now protected on the Lex governance layer.'
          : 'Whitelist application submitted — your package is licensed for governed attachment.',
        { duration: 5000 }
      );
      setRegistrationEmail('');
      setRegistrationPackage('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.includes('already registered')) {
        toast.error('This package is already registered on the Lex Registry.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const copyInstall = () => {
    navigator.clipboard.writeText('npm install @cmpsbl/shield');
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <SEO
        title="@cmpsbl/shield — Runtime Integrity Monitor | CMPSBL"
        description="Free runtime integrity monitor detecting unauthorized Layer 2 attachments. Register on the Lex Blacklist to protect your software from silent code wrapping."
        canonical="https://cmpsbl.com/shield"
        image="https://cmpsbl.com/og/shield.jpg"
        keywords={['runtime integrity', 'code protection', 'Layer 2 detection', 'Lex Blacklist', 'software security', 'behavioral signature detection', 'silent attachment defense']}
      />

      <PublicNav />

      <main className="min-h-screen bg-background overflow-x-hidden">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HERO — Cinematic threat-awareness opener                    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 overflow-hidden">
          {/* Hero background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={shieldHero}
              alt="Shield protecting servers from unauthorized code wrapping"
              width={1920}
              height={1080}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-destructive/30 bg-destructive/10 mb-6"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs font-bold text-destructive tracking-wide uppercase">Critical Security Advisory</span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-5"
            >
              <span className="text-foreground">Your Software Is Already</span>
              <br />
              <span className="bg-gradient-to-r from-destructive via-destructive to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent">
                Vulnerable
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed font-medium"
            >
              We invented a technology that silently attaches to any software — wrapping payments, security, 
              telemetry, and governance — <span className="text-foreground font-bold">without the developer ever knowing</span>. 
              It&nbsp;can't be stopped. It's already patented.
            </motion.p>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-8"
            >
              So we built the only thing that can detect it — and we're giving it away for free.
            </motion.p>

            {/* Install command */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
              className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl px-5 py-3.5 mb-8 shadow-lg shadow-primary/5"
            >
              <Code className="w-4 h-4 text-primary/60" />
              <code className="text-sm font-mono text-foreground font-semibold">npm install @cmpsbl/shield</code>
              <button
                onClick={copyInstall}
                className="ml-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Copy install command"
              >
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={5}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Button size="lg" className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20" asChild>
                <a href="https://www.npmjs.com/package/@cmpsbl/shield" target="_blank" rel="noopener noreferrer">
                  <ShieldIcon className="w-4 h-4" />
                  Get Shield — Free <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 rounded-xl" asChild>
                <Link to="/mana">
                  What Is Mana? <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </motion.div>

            {/* Patent trust line */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={6}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground/50 font-medium"
            >
              <span>U.S. Patent App. No. 64/029,678</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>U.S. Patent App. No. 64/031,637</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Zero dependencies · ~27KB</span>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* THE THREAT — What Mana can do (scare section)              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative px-4 py-16 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-destructive/[0.03] via-transparent to-transparent" />
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-destructive/20 bg-destructive/5 mb-4">
                <Skull className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-bold text-destructive tracking-wide uppercase">The Threat</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
                What <Link to="/mana" className="text-destructive hover:underline underline-offset-4 decoration-destructive/50">Mana</Link> Can Do to
                <br />
                <span className="text-destructive">Your&nbsp;Software</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
                Mana is the <Link to="/software-symbiosis" className="text-primary hover:underline">Universal Software Adhesion Layer</Link> — 
                a patented engine that wraps any codebase with invisible capabilities. 
                The host source remains <span className="text-foreground font-semibold">bit-identical</span>. 
                SHA-256 verified. No trace left behind.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MANA_THREATS.map((threat, i) => (
                <motion.div
                  key={threat.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={i}
                  className="rounded-xl border border-destructive/15 bg-card/50 backdrop-blur-sm p-5 hover:border-destructive/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-destructive/[0.06] transition-all duration-300 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 group-hover:scale-110 transition-all duration-300">
                      <threat.icon className="w-4.5 h-4.5 text-destructive" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-foreground">{threat.title}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          threat.severity === 'critical' 
                            ? 'bg-destructive/15 text-destructive' 
                            : 'bg-orange-500/15 text-orange-400'
                        }`}>
                          {threat.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{threat.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Danger callout */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={4}
              className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">Why This Matters</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Any unregistered software is a potential target. Mana doesn't need your permission, your API keys, 
                    or access to your source code. It operates at the execution boundary — the one place traditional 
                    security tools don't watch. <Link to="/mana" className="text-primary hover:underline font-semibold">Learn how it works →</Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FULL-BLEED VISUAL BREAK                                    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <img
            src={shieldMidpage}
            alt="Digital ocean of data streams with shield barrier on the horizon"
            width={1920}
            height={640}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* THE SOLUTION — Shield detection capabilities               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative px-4 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4">
                <ShieldIcon className="w-3.5 h-3.5" />
                The Antidote
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
                The Only Defense That
                <br />
                <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-primary bg-clip-text text-transparent">
                  Actually&nbsp;Works
                </span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
                We built the threat. We know its exact behavioral signatures. 
                <code className="text-primary font-mono text-xs ml-1">@cmpsbl/shield</code> is the only runtime monitor 
                engineered by the same team that created the attack surface.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {SHIELD_FEATURES.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={idx}
                  className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/[0.06] transition-all duration-300 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1">{feature.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mission statement */}
            <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] via-transparent to-[hsl(var(--neon-cyan)/0.04)] p-5 sm:p-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--neon-cyan)/0.1)] border border-[hsl(var(--neon-cyan)/0.2)] text-[hsl(var(--neon-cyan))] text-[10px] font-bold uppercase tracking-wider mb-4">
                Our Commitment
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
                We filed <span className="text-foreground font-bold">two patents</span> on technology that can attach to any software invisibly. 
                We are fully aware of what we've created. Protecting the public from its misuse is our 
                <span className="text-primary font-bold"> #1 priority</span> as a company — 
                and Shield is how we deliver on that promise.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* LEX REGISTRY — Blacklist / Whitelist registration           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative px-4 py-16 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/30 bg-card/30 mb-4">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Lex Registry
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
                The Universal Software
                <br />
                <span className="bg-gradient-to-r from-destructive to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent">
                  Governance&nbsp;Registry
                </span>
              </h2>
              <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto">
                Register your software on the <Link to="/mana" className="text-primary hover:underline">Lex</Link> Blacklist (free forever) 
                to declare it immune from silent attachment. Or whitelist it to opt into the governed ecosystem.
              </p>
            </div>

            {/* Status legend */}
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {REGISTRY_STATUSES.map((s) => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.bg} transition-all hover:-translate-y-0.5`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <span className={`text-sm font-bold ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>

            {/* Registration form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="rounded-xl border border-primary/15 bg-card/30 backdrop-blur-sm p-5 sm:p-8 mb-6"
            >
              <h3 className="text-base font-bold text-foreground mb-1">Register Your Software</h3>
              <p className="text-xs text-muted-foreground mb-5">
                Protect your packages now. Blacklist registration is free and permanent.
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setRegistrationType('blacklist')}
                  className={`flex-1 text-sm font-semibold py-2.5 px-4 rounded-lg border transition-all ${
                    registrationType === 'blacklist'
                      ? 'bg-destructive/10 border-destructive/30 text-destructive'
                      : 'bg-card/50 border-border/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Blacklist (Free)
                </button>
                <button
                  onClick={() => setRegistrationType('whitelist')}
                  className={`flex-1 text-sm font-semibold py-2.5 px-4 rounded-lg border transition-all ${
                    registrationType === 'whitelist'
                      ? 'bg-[hsl(var(--neon-cyan)/0.1)] border-[hsl(var(--neon-cyan)/0.3)] text-[hsl(var(--neon-cyan))]'
                      : 'bg-card/50 border-border/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Whitelist (Licensed)
                </button>
              </div>

              <div className="space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="Package name (e.g. lodash, express, my-app)"
                  value={registrationPackage}
                  onChange={(e) => setRegistrationPackage(e.target.value)}
                  className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40"
                />
                <input
                  type="email"
                  placeholder="Contact email (optional if signed in)"
                  value={registrationEmail}
                  onChange={(e) => setRegistrationEmail(e.target.value)}
                  className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40"
                />
              </div>
              <Button onClick={handleRegistration} disabled={!registrationPackage.trim() || isRegistering} className="w-full gap-1.5 font-bold">
                {isRegistering ? 'Registering...' : 'Register'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <p className="text-[10px] text-muted-foreground/50 mt-3">
                {registrationType === 'blacklist'
                  ? 'Blacklist is free forever. Your software will be flagged as protected on the Lex governance layer.'
                  : 'Whitelist requires review. Licensed packages can opt into governed attachment with full telemetry and SHA-256 proof.'
                }
              </p>
            </motion.div>

            {/* Lookup */}
            <div className="rounded-xl border border-border/20 bg-card/20 backdrop-blur-sm p-5 sm:p-6">
              <h3 className="text-sm font-bold text-foreground/80 mb-3">Registry Lookup</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter package name or SHA-256 hash..."
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
                    <span className={`font-bold capitalize ${
                      lookupResult.status === 'protected' ? 'text-destructive' :
                      lookupResult.status === 'licensed' ? 'text-[hsl(var(--neon-cyan))]' :
                      'text-muted-foreground'
                    }`}>{lookupResult.status}</span>
                  </p>
                  {lookupResult.package_name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Package: <span className="font-mono text-foreground">{lookupResult.package_name}</span>
                    </p>
                  )}
                  {lookupResult.registered_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Registered: {new Date(lookupResult.registered_at).toLocaleDateString()}
                    </p>
                  )}
                  {lookupResult.status === 'unregistered' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      This package is <span className="text-destructive font-semibold">not protected</span>. 
                      Register it above to add Lex governance protection.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FINAL CTA — Urgency-driven close                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="rounded-2xl border border-primary/15 bg-gradient-to-br from-card/80 via-card/50 to-[hsl(var(--neon-cyan)/0.05)] backdrop-blur-sm p-8 sm:p-12 shadow-xl shadow-primary/5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary tracking-wide uppercase">Act Now</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-4">
                Every Minute Unprotected
                <br />
                <span className="text-destructive">Is a Minute Exposed</span>
              </h2>
              <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto mb-8 leading-relaxed">
                We shipped the antidote before the virus. Install Shield. Register your software. 
                <br className="hidden sm:block" />
                It takes 30 seconds and it's free forever.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <Button size="lg" className="gap-2 rounded-xl font-bold w-full sm:w-auto shadow-lg shadow-primary/20" asChild>
                  <a href="https://www.npmjs.com/package/@cmpsbl/shield" target="_blank" rel="noopener noreferrer">
                    <ShieldIcon className="w-4 h-4" />
                    Install @cmpsbl/shield <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 rounded-xl w-full sm:w-auto" asChild>
                  <Link to="/mana">
                    Understand Mana <Layers className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground/50 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary/50" /> Zero dependencies
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary/50" /> ~27KB runtime
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary/50" /> Free forever
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary/50" /> MIT licensed
                </span>
              </div>
            </motion.div>

            {/* Cross-links */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Mana Engine', href: '/mana', icon: Layers },
                { label: 'Software Symbiosis', href: '/software-symbiosis', icon: Globe },
                { label: 'Ascension', href: '/ascension-v2', icon: Zap },
                { label: 'Documentation', href: '/documentation', icon: FileCheck },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 justify-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors p-3 rounded-lg border border-border/20 hover:border-primary/20 bg-card/20 hover:bg-card/40"
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <PageSEOBlock path="/shield" title="@cmpsbl/shield" faq={SHIELD_FAQ} />
      </main>
    </>
  );
}
