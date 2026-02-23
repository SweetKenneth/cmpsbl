/**
 * EVLVBL — Production Landing Page
 * Self-evolving immune system for any software.
 * Black-boxed SDK with install wizard, probes, learning tests, VOLVER agent.
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield, Zap, Brain, GitCompare, Lock, Activity, ArrowRight, Check, Terminal,
  Loader2, Download, Copy, Package, Globe, Server, Smartphone, Database,
  Code, Layers, Cpu, Eye, EyeOff, Sparkles, FileCode, Rocket, Bot, Crown,
  FlaskConical, GraduationCap, Play, BarChart3,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { shadow, type ShadowResult } from '@/packages/evolution-mesh/shadow/probe';
import { VOLVER_SKILLS, runVolverTask, getVolverSkillsSummary, type VolverSkillCategory } from '@/packages/evolution-mesh/agent/stubbed-encode';

// ─── Framework Configurations ───────────────────────────────────────
const FRAMEWORKS = [
  { id: 'react', name: 'React / Next.js', icon: Code, ext: '.tsx', color: 'text-cyan-400' },
  { id: 'vue', name: 'Vue / Nuxt', icon: Layers, ext: '.vue', color: 'text-emerald-400' },
  { id: 'angular', name: 'Angular', icon: Shield, ext: '.ts', color: 'text-red-400' },
  { id: 'svelte', name: 'Svelte / SvelteKit', icon: Zap, ext: '.svelte', color: 'text-orange-400' },
  { id: 'node', name: 'Node.js / Express', icon: Server, ext: '.ts', color: 'text-green-400' },
  { id: 'deno', name: 'Deno / Bun', icon: Terminal, ext: '.ts', color: 'text-yellow-400' },
  { id: 'python', name: 'Python / FastAPI', icon: FileCode, ext: '.py', color: 'text-blue-400' },
  { id: 'go', name: 'Go', icon: Cpu, ext: '.go', color: 'text-sky-400' },
  { id: 'ruby', name: 'Ruby / Rails', icon: Sparkles, ext: '.rb', color: 'text-rose-400' },
  { id: 'php', name: 'PHP / Laravel', icon: Globe, ext: '.php', color: 'text-indigo-400' },
  { id: 'java', name: 'Java / Spring', icon: Database, ext: '.java', color: 'text-amber-400' },
  { id: 'mobile', name: 'React Native / Flutter', icon: Smartphone, ext: '.ts', color: 'text-purple-400' },
] as const;

const FRAMEWORK_SNIPPETS: Record<string, string> = {
  react: `import { wrap } from '@evlvbl/sdk/react';

// Wrap your API routes automatically
export default wrap(MyComponent, {
  schema: { email: 'string', name: 'string' }
});`,
  vue: `import { useEvlvbl } from '@evlvbl/sdk/vue';

const { protect, health } = useEvlvbl();
const safeFetch = protect(fetchUsers, {
  schema: { page: 'number', limit: 'number' }
});`,
  angular: `import { EvlvblModule } from '@evlvbl/sdk/angular';

@NgModule({ imports: [EvlvblModule.forRoot()] })
// All HTTP interceptors auto-protected`,
  svelte: `import { mesh } from '@evlvbl/sdk/svelte';

const safeFetch = mesh(fetchData, {
  schema: { id: 'string', filters: 'object' }
});`,
  node: `import { wrap } from '@evlvbl/sdk';

const safeHandler = wrap(myHandler, {
  schema: { email: { type: 'string', required: true } }
});

app.post('/api/users', safeHandler);`,
  deno: `import { wrap } from '@evlvbl/sdk';

Deno.serve(wrap(handler, {
  schema: { token: 'string', payload: 'object' }
}));`,
  python: `from evlvbl import protect

@protect(schema={"email": "str", "age": "int"})
async def create_user(request):
    return {"status": "safe"}`,
  go: `import mesh "github.com/evlvbl/sdk-go"

handler := mesh.Wrap(createUser, mesh.Schema{
    "email": mesh.String().Required(),
    "age":   mesh.Number().Min(0),
})`,
  ruby: `require 'evlvbl'

class UsersController < ApplicationController
  include Evlvbl::Protection

  protect :create, schema: {
    email: { type: :string, required: true }
  }
end`,
  php: `use Evlvbl\\SDK\\Protect;

#[Protect(schema: ['email' => 'string', 'name' => 'string'])]
public function store(Request $request) {
    // Auto-validated, auto-repaired
}`,
  java: `import com.evlvbl.sdk.Protect;

@Protect(schema = @Schema(fields = {
    @Field(name = "email", type = "string", required = true)
}))
public ResponseEntity<?> createUser(@RequestBody UserDTO dto) {}`,
  mobile: `import { useEvlvbl } from '@evlvbl/sdk/react-native';

const { protect } = useEvlvbl();
const safeApiCall = protect(apiClient.post, {
  schema: { userId: 'string', data: 'object' }
});`,
};

// ─── Features ───────────────────────────────────────────────────────
const FEATURES = [
  { icon: Shield, title: 'Immune Wrapping', description: 'Wrap any function. Inputs validated, sanitized, and repaired automatically before execution.' },
  { icon: Zap, title: '29+ Repair Strategies', description: 'Deterministic, non-AI repairs: XSS stripping, SQL sanitization, type coercion, prototype pollution guard.' },
  { icon: Brain, title: 'Self-Learning Rules', description: 'Successful repairs become rules that propagate across functions. Your system learns from every failure.' },
  { icon: GitCompare, title: 'Shadow Probes', description: 'Test changes against real traffic without risk. Compare baseline vs candidate. Promote only what passes.' },
  { icon: Lock, title: 'Auditable Architecture', description: 'Fully readable source code. MIT-licensed core. Verify every line before deploying to production.' },
  { icon: Activity, title: 'Real-Time Dashboard', description: 'Health metrics, repair analytics, learning curves, and alert feeds — all via encrypted telemetry.' },
  { icon: Eye, title: 'Archetype Classification', description: 'Inputs classified as injection attempts, empty shells, type mismatches — each handled differently.' },
  { icon: Layers, title: 'Cross-Function Learning', description: 'Rules learned in one function automatically propagate to compatible functions across your codebase.' },
  { icon: Bot, title: 'VOLVER Agent', description: 'Built-in coding agent with 8 core skills. Analyzes, suggests, and repairs code — included with Standalone.' },
];

// ─── Tiers ──────────────────────────────────────────────────────────
const TIERS = [
  {
    name: 'Open Source',
    price: '$0',
    period: 'forever',
    features: ['5 wrapped functions', 'Local telemetry only', 'CLI dashboard', 'Community support', 'All 12 frameworks', 'Install wizard included', 'Full source code included'],
    cta: 'Download Free',
    highlighted: false,
    tier: null as string | null,
    badge: 'FREE FOREVER',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['50 wrapped functions', '30-day telemetry retention', 'Full SaaS dashboard', 'Shadow probes included', 'Cross-function learning', 'Learning tests (5/day)', 'All 12 frameworks'],
    cta: 'Start Pro',
    highlighted: true,
    tier: 'pro',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    features: ['250 wrapped functions', '90-day retention', 'SSO + team access', 'Unlimited shadow probes', 'Unlimited learning tests', 'Priority support', 'All 12 frameworks'],
    cta: 'Start Team',
    highlighted: false,
    tier: 'team',
    badge: null,
    badgeColor: '',
  },
  {
    name: 'Standalone',
    price: '$399',
    period: 'one-time',
    features: ['Unlimited wrapped functions', 'Lifetime license — yours forever', 'VOLVER coding agent included', 'Self-hosted dashboard', 'All future updates included', 'Unlimited probes & tests', 'All 12 frameworks', 'Full source code included'],
    cta: 'Buy Standalone License',
    highlighted: false,
    tier: 'standalone',
    badge: 'LIFETIME LICENSE',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    special: true,
  },
];

// ─── Vibe Coder Instructions (FREE version) ─────────────────────────
const VIBE_CODER_INSTRUCTION = `# EVLVBL — FREE Version Install Instructions
# Drop this file into your AI coding agent and tell it to install.

## IMPORTANT: This is the FREE Open Source version.
## Includes 5 wrapped functions, local telemetry, CLI dashboard.
## Upgrade to Pro ($29/mo), Team ($99/mo), or Standalone ($399 lifetime)
## at https://cmpsbl.com/evolution-mesh for more functions and features.

## What your AI agent should do:
1. Scan your project for async functions and API routes
2. Wrap up to 5 functions with the EVLVBL immune layer
3. Add schema validation based on your existing types
4. Enable 29+ deterministic repair strategies
5. Activate local telemetry tracking

## Quick Start:
\`\`\`
npx @evlvbl/sdk init --framework=auto --tier=free
\`\`\`

## Or manual wrap:
\`\`\`typescript
import { wrap } from '@evlvbl/sdk';
const safe = wrap(myHandler, { schema: { email: 'string' } });
\`\`\`

## Upgrade anytime:
\`\`\`
npx @evlvbl/sdk upgrade --tier=pro
\`\`\`

## Open Source — MIT Licensed
Full source code included. Inspect, audit, and verify every line.
No obfuscation. No hidden dependencies. Production-safe by design.

© CMPSBL — EVLVBL (Free Tier)
https://cmpsbl.com/evolution-mesh
`;

export default function EvolutionMeshLanding() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState('node');
  const [vibeCodeCopied, setVibeCodeCopied] = useState(false);
  const [searchParams] = useSearchParams();

  // Probe state
  const [probeInput, setProbeInput] = useState('{ "email": "test@example.com", "age": 25 }');
  const [probeResult, setProbeResult] = useState<ShadowResult | null>(null);
  const [probeRunning, setProbeRunning] = useState(false);

  // Learning test state
  const [learningTask, setLearningTask] = useState('Create a debounce hook');
  const [learningCategory, setLearningCategory] = useState<VolverSkillCategory>('react');
  const [learningResult, setLearningResult] = useState<ReturnType<typeof runVolverTask> | null>(null);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      toast.success('Purchase complete! Check your email for download and setup instructions.');
    } else if (checkout === 'canceled') {
      toast.info('Checkout canceled. No charges were made.');
    }
  }, [searchParams]);

  const handleWaitlist = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('brain_events').insert({
        event_type: 'evlvbl_waitlist',
        source_operation: 'waitlist_signup',
        module: 'evlvbl',
        data: { email, framework: selectedFramework },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("You're on the list!");
    } catch {
      toast.error('Failed to join. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (tier: string) => {
    setCheckoutLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-mesh-checkout', {
        body: { tier, framework: selectedFramework },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const copyVibeCode = () => {
    navigator.clipboard.writeText(VIBE_CODER_INSTRUCTION);
    setVibeCodeCopied(true);
    toast.success('Copied! Drop this into your AI coding agent.');
    setTimeout(() => setVibeCodeCopied(false), 3000);
  };

  const downloadVibeFile = () => {
    const blob = new Blob([VIBE_CODER_INSTRUCTION], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evlvbl-install.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Free version downloaded! Drop it into your AI coding agent.');
  };

  const downloadFreeVersion = () => {
    const blob = new Blob([VIBE_CODER_INSTRUCTION], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evlvbl-free.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Free version downloaded! Follow the install instructions inside.');
  };

  // Run a shadow probe demo
  const runProbe = async () => {
    setProbeRunning(true);
    try {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(probeInput);
      } catch {
        toast.error('Invalid JSON input');
        setProbeRunning(false);
        return;
      }

      const result = await shadow(
        async (input) => ({ status: 'ok', processed: Object.keys(input).length, validated: true }),
        async (input) => {
          // Simulated candidate with slight delay
          await new Promise(r => setTimeout(r, Math.random() * 200 + 50));
          return { status: 'ok', processed: Object.keys(input).length, validated: true, enhanced: true };
        },
        parsed,
      );
      setProbeResult(result);
      toast.success('Probe complete!');
    } catch {
      toast.error('Probe failed');
    } finally {
      setProbeRunning(false);
    }
  };

  // Run a learning test
  const runLearningTest = () => {
    const result = runVolverTask({
      description: learningTask,
      category: learningCategory,
    });
    setLearningResult(result);
    toast.success('Learning test complete!');
  };

  const volverSummary = getVolverSkillsSummary();

  return (
    <>
      <Helmet>
        <title>EVLVBL — Self-Evolving Immune System for Any Software | CMPSBL</title>
        <meta name="description" content="Open-source resilience SDK that wraps your functions with immune defense, auto-repair, and self-learning rules. Full source code included. Free download available. Works with 12+ frameworks." />
        <meta name="keywords" content="EVLVBL, software resilience, input validation, auto-repair, self-learning, immune system, API protection, shadow probes, learning tests, coding agent, open source SDK" />
        <link rel="canonical" href="https://cmpsbl.com/evolution-mesh" />
        <meta property="og:title" content="EVLVBL — Your Code Evolves Its Own Defenses" />
        <meta property="og:description" content="Drop-in resilience for any framework. 29+ repair strategies. Self-learning rules. Built-in coding agent. Open source & auditable." />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://cmpsbl.com/evolution-mesh" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EVLVBL — Self-Evolving Software Immune System" />
        <meta name="twitter:description" content="Wrap your functions. Your software evolves its own defenses. Open source. Full source code included. Free download." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EVLVBL",
          "description": "Open-source, fully auditable immune system for software. Wraps functions with input validation, auto-repair, and cross-function learning. Built-in VOLVER coding agent. Free tier available.",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Cross-platform",
          "offers": [
            { "@type": "Offer", "price": "0", "priceCurrency": "USD", "name": "Open Source — Free Forever" },
            { "@type": "Offer", "price": "29", "priceCurrency": "USD", "name": "Pro" },
            { "@type": "Offer", "price": "99", "priceCurrency": "USD", "name": "Team" },
            { "@type": "Offer", "price": "399", "priceCurrency": "USD", "name": "Standalone Lifetime License" },
          ],
          "publisher": { "@type": "Organization", "name": "CMPSBL", "url": "https://cmpsbl.com" },
        })}</script>
      </Helmet>

      <PublicNav />

      <div className="min-h-screen bg-background text-foreground">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(180_80%_50%/0.08),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(280_60%_50%/0.06),transparent_40%)]" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-xs tracking-wider border-emerald-500/30 text-emerald-600">
                  <Download className="w-3 h-3 mr-1" /> FREE DOWNLOAD
                </Badge>
                <Badge variant="outline" className="text-xs tracking-wider border-primary/30 text-primary">
                  12 FRAMEWORKS
                </Badge>
                <Badge variant="outline" className="text-xs tracking-wider border-cyan-500/30 text-cyan-600">
                  <Bot className="w-3 h-3 mr-1" /> CODING AGENT BUILT IN
                </Badge>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]">
                <span className="bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
                  EVLVBL
                </span>
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-foreground/90 -mt-2">
                Your code evolves its own defenses.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Drop it in. Wrap your functions. Run probes. Test learnings.
                <br className="hidden sm:block" />
                29+ repair strategies. Self-learning rules. Built-in coding agent.
              </p>

              {/* Framework selector chips */}
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {FRAMEWORKS.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      selectedFramework === fw.id
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {fw.name}
                  </button>
                ))}
              </div>

              {/* Code snippet */}
              <motion.div
                key={selectedFramework}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto"
              >
                <Card className="bg-foreground/[0.03] border-border/50 p-4 text-left font-mono text-sm relative">
                  <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{FRAMEWORKS.find(f => f.id === selectedFramework)?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(FRAMEWORK_SNIPPETS[selectedFramework] || '');
                        toast.success('Copied!');
                      }}
                      className="hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <pre className="text-xs sm:text-sm overflow-x-auto whitespace-pre text-foreground/80 leading-relaxed">
                    {FRAMEWORK_SNIPPETS[selectedFramework]}
                  </pre>
                </Card>
              </motion.div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button size="lg" onClick={downloadFreeVersion} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Download className="w-4 h-4" />
                  Download Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleCheckout('standalone')} disabled={checkoutLoading !== null} className="gap-2">
                  {checkoutLoading === 'standalone' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                  Standalone — $399
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Free: 5 wrapped functions · All frameworks · No credit card
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ LIVE PLAYGROUND: PROBES & LEARNING TESTS ═══ */}
        <section className="border-y border-primary/10 bg-primary/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <Badge className="text-xs mb-4 bg-cyan-500/10 text-cyan-600 border-cyan-500/20">TRY IT LIVE</Badge>
              <h2 className="text-2xl sm:text-4xl font-bold">Shadow Probes & Learning Tests</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Run probes against your functions and test the VOLVER coding agent — right here.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Shadow Probe */}
              <Card className="p-6 space-y-4 border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Shadow Probe</h3>
                    <p className="text-xs text-muted-foreground">Test inputs against baseline & candidate</p>
                  </div>
                </div>
                <Textarea
                  value={probeInput}
                  onChange={(e) => setProbeInput(e.target.value)}
                  className="font-mono text-xs h-24 resize-none"
                  placeholder='{ "email": "test@example.com" }'
                />
                <Button onClick={runProbe} disabled={probeRunning} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700">
                  {probeRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run Probe
                </Button>
                {probeResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant={probeResult.match ? 'default' : 'outline'} className="text-[10px]">
                        {probeResult.match ? '✓ Match' : '✗ Diverged'}
                      </Badge>
                      <span className="text-muted-foreground">
                        Baseline: {probeResult.durationMs.baseline}ms · Candidate: {probeResult.durationMs.candidate}ms
                      </span>
                    </div>
                    <pre className="bg-muted/50 p-2 rounded text-[10px] overflow-x-auto">
                      {JSON.stringify({ baseline: probeResult.baseline, candidate: probeResult.candidate }, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </Card>

              {/* Learning Test */}
              <Card className="p-6 space-y-4 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Learning Test</h3>
                    <p className="text-xs text-muted-foreground">Test VOLVER's coding skills (dry-run)</p>
                  </div>
                </div>
                <Input
                  value={learningTask}
                  onChange={(e) => setLearningTask(e.target.value)}
                  placeholder="Describe a coding task..."
                  className="text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {(['typescript', 'react', 'api', 'database', 'refactoring'] as VolverSkillCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setLearningCategory(cat)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all capitalize ${
                        learningCategory === cat
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border/50 text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <Button onClick={runLearningTest} className="w-full gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Run Learning Test
                </Button>
                {learningResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px]">
                        Confidence: {Math.round(learningResult.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {learningResult.skillsUsed.length} skills used
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">
                        DRY RUN
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{learningResult.suggestion}</p>
                  </motion.div>
                )}
              </Card>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              Pro users get 5 probes/day · Team & Standalone get unlimited · <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary hover:underline">See plans</button>
            </p>
          </div>
        </section>

        {/* ═══ FREE DOWNLOAD BANNER ═══ */}
        <section className="border-b border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="text-xs mb-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">FREE FOR EVERYONE</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Try it. No strings attached.</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The free Open Source version includes 5 wrapped functions, all 12 framework adapters,
                  the install wizard, and the full deterministic repair engine. Full source code included.
                </p>
                <ul className="space-y-2 mb-6">
                  {['5 wrapped functions', 'All 12 frameworks supported', 'Install wizard included', '29+ repair strategies', 'Local telemetry dashboard', 'Full source code — audit everything'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <Button onClick={downloadFreeVersion} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Download className="w-4 h-4" /> Download Free
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2">
                    <ArrowRight className="w-4 h-4" /> Compare Plans
                  </Button>
                </div>
              </div>
              <div className="text-center space-y-4">
                <div className="inline-block p-6 rounded-2xl bg-background border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">UPGRADE ANYTIME</p>
                  <div className="flex items-center gap-3">
                    <div className="text-center px-4">
                      <p className="text-2xl font-black text-emerald-600">Free</p>
                      <p className="text-[10px] text-muted-foreground">5 functions</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-center px-4">
                      <p className="text-2xl font-black text-primary">Pro</p>
                      <p className="text-[10px] text-muted-foreground">50 functions</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-center px-4">
                      <p className="text-2xl font-black text-amber-600">∞</p>
                      <p className="text-[10px] text-muted-foreground">Standalone</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3">Upgrade in-place with one command.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ OPEN SOURCE TRUST ═══ */}
        <section className="border-b border-border/50 bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Eye className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">Open Source — Fully Auditable</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  EVLVBL ships with full readable source code across all tiers. No obfuscation, no hidden payloads, no black boxes.
                  Inspect every repair strategy, every learning algorithm, every telemetry call before you deploy.
                  MIT-licensed core — fork it, audit it, trust it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold">Complete Resilience in One Package</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Every function wrapped. Every input validated. Every failure learned from.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 space-y-3 border-border/50 hover:border-primary/30 transition-colors h-full">
                  <f.icon className="w-7 h-7 text-primary" />
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="bg-muted/30 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Download', desc: 'Grab the free version or buy a license. Works with all 12 frameworks instantly.' },
                { step: '02', title: 'Install', desc: 'Run the wizard or drop the install file into your AI coding agent. Auto-detects your stack.' },
                { step: '03', title: 'Learn', desc: 'Successful repairs become rules. Rules propagate across your entire codebase automatically.' },
                { step: '04', title: 'Evolve', desc: 'Run probes. Test learnings. Promote only what passes every gate. Your code gets stronger.' },
              ].map((s) => (
                <div key={s.step} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto">
                    {s.step}
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FRAMEWORK GALLERY ═══ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold">Works With Every Stack</h2>
            <p className="text-muted-foreground mt-3">
              One install wizard. Automatic framework detection. Zero config required.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw.id}
                onClick={() => {
                  setSelectedFramework(fw.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-center space-y-2"
              >
                <fw.icon className={`w-8 h-8 mx-auto ${fw.color} group-hover:scale-110 transition-transform`} />
                <p className="text-xs font-medium text-foreground">{fw.name}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ═══ VIBE CODER ZONE ═══ */}
        <section id="vibe-zone" className="bg-primary/[0.03] border-y border-primary/10 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <Badge className="text-xs mb-4">FOR VIBE CODERS</Badge>
              <h2 className="text-2xl sm:text-4xl font-bold">Instant Install — No Terminal Required</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Using Cursor, Copilot, Windsurf, or any AI coding agent? Download this file, drop it in, and say
                <span className="text-primary font-medium"> "install this"</span>. Done.
              </p>
            </div>

            <Card className="p-6 space-y-4 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileCode className="w-4 h-4 text-primary" />
                  evlvbl-install.md
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">FREE</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={copyVibeCode} className="gap-1.5 text-xs">
                    {vibeCodeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {vibeCodeCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" onClick={downloadVibeFile} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700">
                    <Download className="w-3.5 h-3.5" />
                    Download Free
                  </Button>
                </div>
              </div>
              <Textarea
                readOnly
                value={VIBE_CODER_INSTRUCTION}
                className="font-mono text-xs h-48 resize-none bg-background/50"
              />
              <p className="text-xs text-muted-foreground text-center">
                Works with Cursor, GitHub Copilot, Windsurf, Cline, Aider, and any AI-powered IDE.
              </p>
            </Card>
          </div>
        </section>

        {/* ═══ VOLVER AGENT + STANDALONE UPSELL ═══ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-amber-500/20 bg-amber-500/[0.02] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold">Standalone License — Yours Forever</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The <strong>$399 Standalone</strong> license is not tied to any subscription or platform.
                You own it outright. Self-host the dashboard. Get every future update.
              </p>
              <ul className="space-y-2">
                {['Lifetime license — no recurring fees', 'Unlimited wrapped functions', 'Self-hosted telemetry dashboard', 'VOLVER coding agent included', 'Unlimited probes & learning tests'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-amber-600 shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Button onClick={() => handleCheckout('standalone')} disabled={checkoutLoading !== null} className="gap-2 w-full">
                {checkoutLoading === 'standalone' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                Buy Standalone — $399
              </Button>
            </Card>

            <Card className="p-8 border-primary/20 bg-primary/[0.02] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">VOLVER — Built-In Coding Agent</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                VOLVER is EVLVBL's built-in coding agent with <strong>{volverSummary.total} core skills</strong> across
                {' '}{volverSummary.categories.length} categories (avg proficiency: {volverSummary.avgProficiency}%).
                It analyzes, suggests, and repairs code — included with the Standalone license.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {VOLVER_SKILLS.slice(0, 6).map(skill => (
                  <div key={skill.id} className="flex items-center gap-2 text-xs">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                    <span className="text-muted-foreground truncate">{skill.name}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" asChild className="gap-2 w-full">
                <Link to="/composable-cognitives">
                  <Bot className="w-4 h-4" /> Browse Coding Agents
                </Link>
              </Button>
            </Card>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" className="bg-muted/30 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground mt-3">
                Every tier includes the install wizard, all 12 frameworks, and black-box protection.<br />
                <span className="text-emerald-600 font-medium">Start free. Upgrade when you're ready.</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIERS.map((tier) => (
                <Card
                  key={tier.name}
                  className={`p-6 space-y-4 flex flex-col ${
                    tier.highlighted
                      ? 'border-primary ring-1 ring-primary/20'
                      : tier.special
                      ? 'border-amber-500/40 bg-amber-500/[0.02]'
                      : 'border-border/50'
                  }`}
                >
                  {tier.badge && (
                    <Badge variant="outline" className={`text-xs w-fit ${tier.badgeColor}`}>
                      {tier.badge}
                    </Badge>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black">{tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={tier.highlighted || tier.special ? 'default' : 'outline'}
                    className={`w-full gap-2 ${!tier.tier ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                    disabled={checkoutLoading !== null}
                    onClick={() => {
                      if (tier.tier) {
                        handleCheckout(tier.tier);
                      } else {
                        downloadFreeVersion();
                      }
                    }}
                  >
                    {checkoutLoading === tier.tier ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                    ) : tier.tier ? (
                      tier.cta
                    ) : (
                      <><Download className="w-4 h-4" /> {tier.cta}</>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ COMPETITIVE TABLE ═══ */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How It Compares</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                    <th className="py-3 px-4 font-bold text-primary">EVLVBL</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Zod</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Istio</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Chaos Monkey</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Input validation', true, true, false, false],
                    ['Auto-repair', true, false, false, false],
                    ['Shadow probes', true, false, true, true],
                    ['Self-learning', true, false, false, false],
                    ['Learning tests', true, false, false, false],
                    ['Built-in coding agent', true, false, false, false],
                    ['Framework-agnostic', true, true, false, false],
                    ['Zero config start', true, true, false, false],
                    ['Open source & auditable', true, true, false, false],
                    ['Free tier available', true, true, false, false],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature as string} className="border-b border-border/50">
                      <td className="py-3 px-4 text-foreground">{feature as string}</td>
                      {(vals as boolean[]).map((v, i) => (
                        <td key={i} className="py-3 px-4 text-center">
                          {v ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-muted-foreground/40">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ WAITLIST + ENTERPRISE ═══ */}
        <section className="bg-muted/30 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold">Enterprise & Custom Deployments</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Need unlimited functions, self-hosted telemetry, or a custom integration? Let's talk.
              </p>
              {!submitted ? (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleWaitlist()}
                  />
                  <Button onClick={handleWaitlist} disabled={submitting} className="gap-2">
                    {submitting ? 'Joining...' : 'Get in Touch'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">We'll be in touch shortly.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══ FOOTER CTA ═══ */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
            <h2 className="text-2xl font-bold">Software that evolves itself.</h2>
            <p className="text-muted-foreground">
              Stop bolting resilience on after things break. Start with an immune system.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={downloadFreeVersion} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4" />
                Download Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleCheckout('standalone')} disabled={checkoutLoading !== null} className="gap-2">
                {checkoutLoading === 'standalone' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                Buy Standalone — $399
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Free · 5 wrapped functions · All frameworks · VOLVER agent · Open source
            </p>
          </div>
        </section>
      </div>

      <EnhancedFooter />
    </>
  );
}
