/**
 * Evolution Mesh — Production Landing Page
 * Self-learning immune system for any software.
 * Black-boxed SDK with install wizard, framework variants, vibe coder zone.
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, Zap, Brain, GitCompare, Lock, Activity, ArrowRight, Check, Terminal,
  Loader2, Download, Copy, Package, Globe, Server, Smartphone, Database,
  Code, Layers, Cpu, Eye, EyeOff, Sparkles, FileCode, Rocket,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  react: `import { EvolutionMesh } from '@cmpsbl/evolution-mesh/react';

// Wrap your API routes automatically
export default EvolutionMesh.protect(MyComponent, {
  schema: { email: 'string', name: 'string' }
});`,
  vue: `import { useEvolutionMesh } from '@cmpsbl/evolution-mesh/vue';

const { protect, health } = useEvolutionMesh();
const safeFetch = protect(fetchUsers, {
  schema: { page: 'number', limit: 'number' }
});`,
  angular: `import { EvolutionMeshModule } from '@cmpsbl/evolution-mesh/angular';

@NgModule({ imports: [EvolutionMeshModule.forRoot()] })
// All HTTP interceptors auto-protected`,
  svelte: `import { mesh } from '@cmpsbl/evolution-mesh/svelte';

const safeFetch = mesh(fetchData, {
  schema: { id: 'string', filters: 'object' }
});`,
  node: `import { wrap } from '@cmpsbl/evolution-mesh';

const safeHandler = wrap(myHandler, {
  schema: { email: { type: 'string', required: true } }
});

app.post('/api/users', safeHandler);`,
  deno: `import { wrap } from '@cmpsbl/evolution-mesh';

Deno.serve(wrap(handler, {
  schema: { token: 'string', payload: 'object' }
}));`,
  python: `from evolution_mesh import protect

@protect(schema={"email": "str", "age": "int"})
async def create_user(request):
    return {"status": "safe"}`,
  go: `import mesh "github.com/cmpsbl/evolution-mesh-go"

handler := mesh.Wrap(createUser, mesh.Schema{
    "email": mesh.String().Required(),
    "age":   mesh.Number().Min(0),
})`,
  ruby: `require 'evolution_mesh'

class UsersController < ApplicationController
  include EvolutionMesh::Protection

  protect :create, schema: {
    email: { type: :string, required: true }
  }
end`,
  php: `use CMPSBL\\EvolutionMesh\\Protect;

#[Protect(schema: ['email' => 'string', 'name' => 'string'])]
public function store(Request $request) {
    // Auto-validated, auto-repaired
}`,
  java: `import com.cmpsbl.evolutionmesh.Protect;

@Protect(schema = @Schema(fields = {
    @Field(name = "email", type = "string", required = true)
}))
public ResponseEntity<?> createUser(@RequestBody UserDTO dto) {}`,
  mobile: `import { useEvolutionMesh } from '@cmpsbl/evolution-mesh/react-native';

const { protect } = useEvolutionMesh();
const safeApiCall = protect(apiClient.post, {
  schema: { userId: 'string', data: 'object' }
});`,
};

// ─── Features ───────────────────────────────────────────────────────
const FEATURES = [
  { icon: Shield, title: 'Immune Wrapping', description: 'Wrap any function. Inputs validated, sanitized, and repaired automatically before execution.' },
  { icon: Zap, title: '29+ Repair Strategies', description: 'Deterministic, non-AI repairs: XSS stripping, SQL sanitization, type coercion, prototype pollution guard.' },
  { icon: Brain, title: 'Self-Learning Rules', description: 'Successful repairs become rules that propagate across functions. Your system learns from every failure.' },
  { icon: GitCompare, title: 'Shadow Mode', description: 'Test changes against real traffic without risk. Compare baseline vs candidate. Promote only what passes.' },
  { icon: Lock, title: 'Black-Box Architecture', description: 'Compiled and minified. Source maps excluded. Your competitive advantage stays protected.' },
  { icon: Activity, title: 'Real-Time Dashboard', description: 'Health metrics, repair analytics, learning curves, and alert feeds — all via encrypted telemetry.' },
  { icon: Eye, title: 'Archetype Classification', description: 'Inputs classified as injection attempts, empty shells, type mismatches — each handled differently.' },
  { icon: Layers, title: 'Cross-Function Learning', description: 'Rules learned in one function automatically propagate to compatible functions across your codebase.' },
  { icon: Package, title: 'Install Wizard', description: 'No npm required. Run the wizard, select your framework, and your codebase is wrapped in under 60 seconds.' },
];

// ─── Tiers ──────────────────────────────────────────────────────────
const TIERS = [
  {
    name: 'Open Source',
    price: '$0',
    period: 'forever',
    features: ['5 wrapped functions', 'Local telemetry only', 'CLI dashboard', 'Community support', 'All frameworks'],
    cta: 'Download Free',
    highlighted: false,
    tier: null as string | null,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['50 wrapped functions', '30-day telemetry retention', 'Full SaaS dashboard', 'Email support', 'Cross-function learning', 'Install wizard', 'All frameworks'],
    cta: 'Start Pro',
    highlighted: true,
    tier: 'pro',
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    features: ['250 wrapped functions', '90-day retention', 'SSO + team access', 'Priority support', 'Custom repair strategies', 'Install wizard', 'All frameworks'],
    cta: 'Start Team',
    highlighted: false,
    tier: 'team',
  },
  {
    name: 'Standalone',
    price: '$399',
    period: 'one-time',
    features: ['Unlimited wrapped functions', 'Lifetime license', 'Not tied to any substrate', 'Self-hosted dashboard', 'All updates included', 'Install wizard', 'All frameworks', 'Black-box protected'],
    cta: 'Buy Standalone',
    highlighted: false,
    tier: 'standalone',
    special: true,
  },
];

// ─── Vibe Coder Instructions ────────────────────────────────────────
const VIBE_CODER_INSTRUCTION = `# Evolution Mesh — Install Instructions

Drop this file into your AI coding agent (Cursor, Copilot, Lovable, etc.) and tell it:

"Install Evolution Mesh in my project. Wrap all API endpoints and async functions with immune defense."

## What it does:
1. Scans your project for all async functions and API routes
2. Wraps each one with the Evolution Mesh immune layer
3. Adds schema validation based on your existing types
4. Enables 29+ deterministic repair strategies
5. Activates cross-function self-learning rules
6. Starts encrypted telemetry reporting

## Quick Start:
\`\`\`
evolution-mesh init --framework=auto --wrap=all
\`\`\`

## Or manual wrap:
\`\`\`typescript
import { wrap } from '@cmpsbl/evolution-mesh';
const safe = wrap(myHandler, { schema: { email: 'string' } });
\`\`\`

## Black-Box Protected
This software is compiled and obfuscated. Source maps are not included.
Reverse engineering is prohibited under the CMPSBL Software License.

© CMPSBL — Evolution Mesh
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
        event_type: 'evolution_mesh_waitlist',
        source_operation: 'waitlist_signup',
        module: 'evolution-mesh',
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
    a.download = 'evolution-mesh-install.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded! Drop it into your AI coding agent.');
  };

  return (
    <>
      <Helmet>
        <title>Evolution Mesh — Self-Learning Immune System for Any Software</title>
        <meta name="description" content="Black-boxed resilience SDK that wraps your functions with immune defense, auto-repair, and self-learning rules. Works with React, Vue, Node.js, Python, Go, Ruby, PHP, Java, and more. Install in 60 seconds." />
        <meta name="keywords" content="software resilience, input validation, auto-repair, self-learning, immune system, API protection, XSS prevention, SQL injection, shadow testing, code defense, runtime protection" />
        <link rel="canonical" href="https://cmpsbl.com/evolution-mesh" />
        <meta property="og:title" content="Evolution Mesh — Your Code's Immune System" />
        <meta property="og:description" content="Drop-in resilience for any framework. 29+ repair strategies. Self-learning rules. Black-box protected." />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://cmpsbl.com/evolution-mesh" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Evolution Mesh — Self-Learning Software Immune System" />
        <meta name="twitter:description" content="Wrap your functions. Your software evolves its own defenses. Works with every framework." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Evolution Mesh",
          "description": "Self-learning immune system for software. Wraps functions with input validation, auto-repair, and cross-function learning.",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Cross-platform",
          "offers": [
            { "@type": "Offer", "price": "0", "priceCurrency": "USD", "name": "Open Source" },
            { "@type": "Offer", "price": "29", "priceCurrency": "USD", "name": "Pro", "billingIncrement": "P1M" },
            { "@type": "Offer", "price": "99", "priceCurrency": "USD", "name": "Team", "billingIncrement": "P1M" },
            { "@type": "Offer", "price": "399", "priceCurrency": "USD", "name": "Standalone Lifetime" },
          ],
          "publisher": { "@type": "Organization", "name": "CMPSBL", "url": "https://cmpsbl.com" },
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.06),transparent_40%)]" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-xs tracking-wider border-primary/30 text-primary">
                  WORKS WITH EVERY FRAMEWORK
                </Badge>
                <Badge variant="outline" className="text-xs tracking-wider border-muted-foreground/30 text-muted-foreground">
                  <Lock className="w-3 h-3 mr-1" /> BLACK-BOX PROTECTED
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                Your code's<br />
                <span className="text-primary">immune system.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Drop it in. Wrap your functions. Your software evolves its own defenses.<br className="hidden sm:block" />
                29+ repair strategies. Self-learning rules. Zero AI dependency.
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

              {/* Code snippet for selected framework */}
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
                <Button size="lg" onClick={() => handleCheckout('standalone')} disabled={checkoutLoading !== null} className="gap-2">
                  {checkoutLoading === 'standalone' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Get Standalone — $399
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('vibe-zone')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2">
                  <Rocket className="w-4 h-4" />
                  Vibe Coder? Instant Install
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ BLACK-BOX NOTICE ═══ */}
        <section className="border-y border-border/50 bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <EyeOff className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">Black-Box Protected Architecture</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Evolution Mesh ships compiled and minified. Source maps are excluded from distribution.
                  Internal repair strategies, learning algorithms, and telemetry protocols are trade secrets.
                  Your competitive advantage — and ours — stays protected.
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
                { step: '01', title: 'Install', desc: 'Run the wizard or drop a file into your AI agent. Auto-detects your framework.' },
                { step: '02', title: 'Wrap', desc: 'Every async function, API route, and endpoint gets immune defense automatically.' },
                { step: '03', title: 'Learn', desc: 'Successful repairs become rules. Rules propagate across your entire codebase.' },
                { step: '04', title: 'Evolve', desc: 'Shadow test changes safely. Promote only what passes every gate.' },
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
                  evolution-mesh-install.md
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={copyVibeCode} className="gap-1.5 text-xs">
                    {vibeCodeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {vibeCodeCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" onClick={downloadVibeFile} className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" />
                    Download File
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

        {/* ═══ PRICING ═══ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold">Simple Pricing</h2>
            <p className="text-muted-foreground mt-3">
              Every tier includes the install wizard, all frameworks, and black-box protection.
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
                    ? 'border-primary/40 bg-primary/[0.02]'
                    : 'border-border/50'
                }`}
              >
                {tier.highlighted && <Badge className="text-xs w-fit">Most Popular</Badge>}
                {tier.special && <Badge variant="outline" className="text-xs w-fit border-primary/40 text-primary">Lifetime License</Badge>}
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
                  className="w-full gap-2"
                  disabled={checkoutLoading !== null}
                  onClick={() => {
                    if (tier.tier) {
                      handleCheckout(tier.tier);
                    } else {
                      document.getElementById('vibe-zone')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {checkoutLoading === tier.tier ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* ═══ COMPETITIVE TABLE ═══ */}
        <section className="bg-muted/30 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How It Compares</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                    <th className="py-3 px-4 font-bold text-primary">Evolution Mesh</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Zod</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Istio</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Chaos Monkey</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Input validation', true, true, false, false],
                    ['Auto-repair', true, false, false, false],
                    ['Shadow testing', true, false, true, true],
                    ['Self-learning', true, false, false, false],
                    ['Governed promotion', true, false, false, false],
                    ['Framework-agnostic', true, true, false, false],
                    ['Zero config start', true, true, false, false],
                    ['Black-box protected', true, false, false, false],
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
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
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
        </section>

        {/* ═══ FOOTER CTA ═══ */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
            <h2 className="text-2xl font-bold">Software that defends itself.</h2>
            <p className="text-muted-foreground">
              Stop bolting resilience on after things break. Start with an immune system.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => handleCheckout('standalone')} disabled={checkoutLoading !== null} className="gap-2">
                {checkoutLoading === 'standalone' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Buy Standalone — $399
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
