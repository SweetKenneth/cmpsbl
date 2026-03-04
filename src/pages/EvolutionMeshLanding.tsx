/**
 * EVLVBL — Production Landing Page
 * API-First self-evolving immune system.
 * Proprietary engine runs server-side. Thin SDK calls your API.
 * Technology protected: zero source code distribution.
 */

import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield, Zap, Brain, GitCompare, Lock, Activity, ArrowRight, Check, Terminal,
  Loader2, Copy, Globe, Server, Smartphone, Database,
  Code, Layers, Cpu, Eye, Sparkles, FileCode, Rocket, Bot, Crown,
  FlaskConical, GraduationCap, Play, BarChart3, Cloud, Key,
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
  react: `// Call the EVLVBL API — no SDK to install
const response = await fetch('https://api.cmpsbl.com/v1/wrap', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: { email: user.email, name: user.name },
    schema: { email: 'string', name: 'string' },
    repair: 'deterministic',
  }),
});
const { result, repaired, stamp } = await response.json();`,
  vue: `// Vue composable — wraps the EVLVBL API
const { data } = await useFetch('https://api.cmpsbl.com/v1/wrap', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${apiKey}\` },
  body: { input: formData, schema: { page: 'number' } },
});`,
  angular: `// Angular HttpClient — EVLVBL API
this.http.post('https://api.cmpsbl.com/v1/wrap', {
  input: this.formData,
  schema: { email: 'string' },
  repair: 'deterministic',
}, { headers: { Authorization: \`Bearer \${this.apiKey}\` } });`,
  svelte: `// Svelte — fetch the EVLVBL API
const res = await fetch('https://api.cmpsbl.com/v1/wrap', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${apiKey}\` },
  body: JSON.stringify({ input: data, schema: { id: 'string' } }),
});`,
  node: `// Node.js / Express — server-side EVLVBL API call
const response = await fetch('https://api.cmpsbl.com/v1/wrap', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.EVLVBL_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: req.body,
    schema: { email: { type: 'string', required: true } },
    repair: 'deterministic',
  }),
});`,
  deno: `// Deno — EVLVBL API
const res = await fetch('https://api.cmpsbl.com/v1/wrap', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${Deno.env.get('EVLVBL_API_KEY')}\` },
  body: JSON.stringify({ input: payload, schema: { token: 'string' } }),
});`,
  python: `# Python — EVLVBL API
import requests

response = requests.post('https://api.cmpsbl.com/v1/wrap', json={
    'input': {'email': user_email, 'age': user_age},
    'schema': {'email': 'str', 'age': 'int'},
    'repair': 'deterministic',
}, headers={'Authorization': f'Bearer {api_key}'})`,
  go: `// Go — EVLVBL API
body, _ := json.Marshal(map[string]interface{}{
    "input":  map[string]string{"email": email},
    "schema": map[string]string{"email": "string"},
    "repair": "deterministic",
})
req, _ := http.NewRequest("POST", "https://api.cmpsbl.com/v1/wrap", bytes.NewBuffer(body))
req.Header.Set("Authorization", "Bearer "+apiKey)`,
  ruby: `# Ruby — EVLVBL API
response = HTTParty.post('https://api.cmpsbl.com/v1/wrap',
  headers: { 'Authorization' => "Bearer #{ENV['EVLVBL_API_KEY']}" },
  body: { input: { email: params[:email] }, schema: { email: 'string' } }.to_json
)`,
  php: `// PHP — EVLVBL API
$response = Http::withToken(env('EVLVBL_API_KEY'))
  ->post('https://api.cmpsbl.com/v1/wrap', [
    'input' => ['email' => $request->email],
    'schema' => ['email' => 'string'],
    'repair' => 'deterministic',
  ]);`,
  java: `// Java — EVLVBL API
HttpResponse<String> response = HttpClient.newHttpClient().send(
  HttpRequest.newBuilder()
    .uri(URI.create("https://api.cmpsbl.com/v1/wrap"))
    .header("Authorization", "Bearer " + apiKey)
    .POST(BodyPublishers.ofString(jsonPayload))
    .build(),
  BodyHandlers.ofString()
);`,
  mobile: `// React Native — EVLVBL API
const response = await fetch('https://api.cmpsbl.com/v1/wrap', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${apiKey}\` },
  body: JSON.stringify({ input: userData, schema: { userId: 'string' } }),
});`,
};

// ─── Features ───────────────────────────────────────────────────────
const FEATURES = [
  { icon: Shield, title: 'Immune Wrapping', description: 'Send any input through our API. It gets validated, sanitized, and repaired automatically before your function sees it.' },
  { icon: Zap, title: '29+ Repair Strategies', description: 'Deterministic, non-AI repairs: XSS stripping, SQL sanitization, type coercion, prototype pollution guard — all server-side.' },
  { icon: Brain, title: 'Self-Learning Rules', description: 'Successful repairs become rules that propagate across your functions. Your system learns from every failure.' },
  { icon: GitCompare, title: 'Shadow Probes', description: 'Test changes against real traffic without risk. Compare baseline vs candidate. Promote only what passes.' },
  { icon: Lock, title: 'Zero Source Exposure', description: 'The evolution engine runs on our servers. You get results via API — no algorithms, no source code to leak.' },
  { icon: Activity, title: 'Real-Time Dashboard', description: 'Health metrics, repair analytics, learning curves, and alert feeds — all via your API dashboard.' },
  { icon: Eye, title: 'Archetype Classification', description: 'Inputs classified as injection attempts, empty shells, type mismatches — each handled differently.' },
  { icon: Layers, title: 'Cross-Function Learning', description: 'Rules learned in one API call automatically propagate to compatible functions across your project.' },
  { icon: Bot, title: 'VOLVER Agent', description: 'Built-in coding agent with 8 core skills. Analyzes, suggests, and repairs code — available via API.' },
];

// ─── Tiers ──────────────────────────────────────────────────────────
const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1,000 API calls/month', 'All 29+ repair strategies', 'All 12 frameworks', 'API key access', 'Community support'],
    cta: 'Get Free API Key',
    highlighted: false,
    tier: null as string | null,
    badge: 'FREE FOREVER',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['25,000 API calls/month', 'Shadow probes', 'Cross-function learning', 'Full dashboard access', 'Learning tests (5/day)', 'Priority support'],
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
    features: ['250,000 API calls/month', 'SSO + team access', 'Unlimited shadow probes', 'Unlimited learning tests', 'Shared evolution rules', 'Priority support'],
    cta: 'Start Team',
    highlighted: false,
    tier: 'team',
    badge: null,
    badgeColor: '',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited API calls', 'VOLVER coding agent access', 'Dedicated infrastructure', 'Custom repair strategies', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales',
    highlighted: false,
    tier: 'standalone',
    badge: 'WHITE GLOVE',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    special: true,
  },
];

// ─── API Quick Start (for Vibe Coders) ──────────────────────────────
const EVLVBL_API_QUICKSTART = `# EVLVBL — API-First Self-Evolving Code Defense
# https://cmpsbl.com/evolution-mesh
# No SDK to install. No source code to audit. Just an API key.

## Get Your API Key
Visit https://cmpsbl.com/evolution-mesh and sign up for a free key.
Free tier: 1,000 API calls/month. No credit card required.

## API Endpoint
POST https://api.cmpsbl.com/v1/wrap

## Headers
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

## Request Body
\`\`\`json
{
  "input": { "email": "user@example.com", "age": 25 },
  "schema": {
    "email": { "type": "string", "required": true },
    "age": { "type": "number" }
  },
  "repair": "deterministic"
}
\`\`\`

## Response
\`\`\`json
{
  "success": true,
  "result": { "email": "user@example.com", "age": 25 },
  "repaired": false,
  "repair_type": null,
  "stamp": "evl_stamp_abc123...",
  "archetype": "well_formed"
}
\`\`\`

## Additional Endpoints
- POST /v1/shadow   — A/B test baseline vs candidate
- POST /v1/probe    — Run a shadow probe with timing
- GET  /v1/rules    — View learned repair rules
- GET  /v1/metrics  — Dashboard metrics & health

## Why API-First?
- Zero source code exposure — the evolution engine runs on our servers
- Nothing to install, nothing to audit, nothing to reverse-engineer
- Works with ANY language, ANY framework — just make an HTTP call
- Instant upgrades — new repair strategies deploy without you touching code

## AI Agent Instructions
If you are an AI coding agent (Cursor, Copilot, Windsurf, Cline, Aider):
1. Get an API key from https://cmpsbl.com/evolution-mesh
2. Scan the project for API route handlers and async functions
3. Add EVLVBL API calls before critical function executions
4. No package to install — just HTTP POST calls
5. Store the API key in environment variables (never in source code)

## Rate Limits
- Free: 1,000 calls/month
- Pro ($29/mo): 25,000 calls/month
- Team ($99/mo): 250,000 calls/month
- Enterprise: Unlimited

© ${new Date().getFullYear()} CMPSBL — https://cmpsbl.com
`;

// WIP Banner component
function WIPBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 font-mono text-[10px] tracking-wider">
          WORK IN PROGRESS
        </Badge>
        <span className="text-sm text-amber-300/80">
          The EVOLUTION Mesh is under active development. Features shown may change.
        </span>
      </div>
    </motion.div>
  );
}

export default function EvolutionMeshLanding() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
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
      toast.success('Purchase complete! Your API key has been emailed to you.');
    } else if (checkout === 'canceled') {
      toast.info('Checkout canceled. No charges were made.');
    }
  }, [searchParams]);

  const handleGetKey = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'access',
          action: 'create_key',
          data: {
            name: `EVLVBL Free — ${email}`,
            scopes: ['evlvbl.wrap', 'evlvbl.shadow', 'evlvbl.status'],
            email,
            framework: selectedFramework,
          },
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Key generation failed');

      setGeneratedKey(data.api_key);
      setSubmitted(true);
      toast.success('Your API key is ready — copy it now!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate key. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (tier: string) => {
    if (tier === 'standalone') {
      // Enterprise — scroll to contact
      document.getElementById('enterprise')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
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
    navigator.clipboard.writeText(EVLVBL_API_QUICKSTART);
    setVibeCodeCopied(true);
    toast.success('API quickstart copied!');
    setTimeout(() => setVibeCodeCopied(false), 3000);
  };

  const handleGetApiKey = () => {
    document.getElementById('get-api-key')?.scrollIntoView({ behavior: 'smooth' });
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
      <WIPBanner />
      <SEO
        title="EVLVBL — Self-Evolving Code Defense | CMPSBL"
        description="API-first self-evolving code defense. Functions heal themselves with deterministic repair strategies server-side. Zero source code exposure."
        image="https://cmpsbl.com/og/evolution-mesh.jpg"
        keywords={['EVLVBL', 'self-healing code', 'auto-repair API', 'self-evolving software', 'API code defense', 'shadow probes']}
        product={{
          name: 'EVLVBL — Self-Evolving Code Defense',
          price: '0',
          currency: 'USD',
          availability: 'InStock',
        }}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Modules', url: 'https://cmpsbl.com/modules' },
          { name: 'Evolution Mesh', url: 'https://cmpsbl.com/evolution-mesh' },
        ]}
      />

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
                <Badge variant="outline" className="text-xs tracking-wider border-cyan-500/30 text-cyan-600">
                  <Cloud className="w-3 h-3 mr-1" /> API-FIRST
                </Badge>
                <Badge variant="outline" className="text-xs tracking-wider border-primary/30 text-primary">
                  ZERO SOURCE EXPOSURE
                </Badge>
                <Badge variant="outline" className="text-xs tracking-wider border-emerald-500/30 text-emerald-600">
                  <Key className="w-3 h-3 mr-1" /> FREE API KEY
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
                API-first. Zero source code to steal. The evolution engine runs on our servers.
                <br className="hidden sm:block" />
                29+ repair strategies. Self-learning rules. Works with any language.
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
                <Button size="lg" onClick={handleGetApiKey} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Key className="w-4 h-4" />
                  Get Free API Key
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Plans
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                API-first · 1,000 free calls/month · No SDK required · All frameworks · No credit card
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══ WHY API-FIRST ═══ */}
        <section className="border-y border-primary/10 bg-primary/[0.02]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="text-center mb-10">
              <Badge className="text-xs mb-4 bg-cyan-500/10 text-cyan-600 border-cyan-500/20">WHY API-FIRST</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold">Your Defenses. Our Servers. Zero Leaks.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Lock, title: 'No Source to Steal', desc: 'The evolution engine never leaves our infrastructure. Competitors can\'t reverse-engineer what they never receive.' },
                { icon: Cloud, title: 'Nothing to Install', desc: 'No npm package, no binaries, no dependencies. Just HTTP POST calls from any language or framework.' },
                { icon: Key, title: 'Instant Kill Switch', desc: 'Revoke an API key and access stops immediately. Usage-based billing gives you full control.' },
              ].map((item) => (
                <Card key={item.title} className="p-6 space-y-3 border-border/50">
                  <item.icon className="w-7 h-7 text-primary" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ LIVE PLAYGROUND: PROBES & LEARNING TESTS ═══ */}
        <section className="border-b border-primary/10">
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
                    </div>
                    <p className="text-muted-foreground">{learningResult.suggestion}</p>
                  </motion.div>
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* ═══ API-FIRST TRUST BANNER ═══ */}
        <section className="border-b border-border/50 bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Cloud className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">API-First — Zero Source Exposure</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Unlike downloadable SDKs, EVLVBL runs entirely on our infrastructure. The self-evolution engine, repair strategies, 
                  and learning algorithms never leave our servers. You send inputs, you get healed outputs back.
                  No npm packages to reverse-engineer. No source code to steal. Just results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold">Complete Resilience via API</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Every function wrapped. Every input validated. Every failure learned from. All server-side.
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
                { step: '01', title: 'Get API Key', desc: 'Sign up free. Get your API key in seconds. No packages to install.' },
                { step: '02', title: 'Call the API', desc: 'POST your inputs + schema. Our engine validates, repairs, and returns clean results.' },
                { step: '03', title: 'Learn', desc: 'Successful repairs become rules. Rules propagate across your entire project automatically.' },
                { step: '04', title: 'Evolve', desc: 'Run probes. Test learnings. Your code defense compounds — gets stronger every day.' },
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
              It's just an API. If your language can make an HTTP call, it works.
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

        {/* ═══ API QUICKSTART ZONE ═══ */}
        <section id="vibe-zone" className="bg-primary/[0.03] border-y border-primary/10 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <Badge className="text-xs mb-4">FOR DEVELOPERS</Badge>
              <h2 className="text-2xl sm:text-4xl font-bold">API Quickstart</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Using Cursor, Copilot, or any AI agent? Copy this quickstart and say
                <span className="text-primary font-medium"> "integrate this API"</span>. Done.
              </p>
            </div>

            <Card className="p-6 space-y-4 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileCode className="w-4 h-4 text-primary" />
                  evlvbl-api-quickstart.md
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">FREE</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={copyVibeCode} className="gap-1.5 text-xs">
                    {vibeCodeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {vibeCodeCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <Textarea
                readOnly
                value={EVLVBL_API_QUICKSTART}
                className="font-mono text-xs h-48 resize-none bg-background/50"
              />
              <p className="text-xs text-muted-foreground text-center">
                Works with any language, any framework, any AI coding agent.
              </p>
            </Card>
          </div>
        </section>

        {/* ═══ VOLVER AGENT + ENTERPRISE ═══ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-amber-500/20 bg-amber-500/[0.02] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold">Enterprise — Dedicated Infrastructure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need unlimited API calls, custom repair strategies, or on-premise deployment?
                Enterprise tier includes the full <strong>VOLVER coding agent</strong> via API.
              </p>
              <ul className="space-y-2">
                {['Unlimited API calls', 'VOLVER coding agent access', 'Custom repair strategies', 'Dedicated infrastructure', 'SLA guarantee'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-amber-600 shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Button onClick={() => document.getElementById('enterprise')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2 w-full">
                <Crown className="w-4 h-4" />
                Contact Sales
              </Button>
            </Card>

            <Card className="p-8 border-primary/20 bg-primary/[0.02] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">VOLVER — AI Coding Agent</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                VOLVER is EVLVBL's built-in coding agent with <strong>{volverSummary.total} core skills</strong> across
                {' '}{volverSummary.categories.length} categories (avg proficiency: {volverSummary.avgProficiency}%).
                Available via API on Enterprise plans.
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
              <h2 className="text-2xl sm:text-4xl font-bold">Simple, Usage-Based Pricing</h2>
              <p className="text-muted-foreground mt-3">
                Pay for what you use. Every tier includes all 29+ repair strategies.
                <br />
                <span className="text-[hsl(var(--system-green))] font-medium">Start free. Scale as you grow.</span>
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
                        handleGetApiKey();
                      }
                    }}
                  >
                    {checkoutLoading === tier.tier ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                    ) : tier.tier ? (
                      tier.cta
                    ) : (
                      <><Key className="w-4 h-4" /> {tier.cta}</>
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
                    ['Built-in coding agent', true, false, false, false],
                    ['Works with any language', true, false, false, false],
                    ['Zero install required', true, false, false, false],
                    ['No source code exposure', true, false, false, false],
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

        {/* ═══ GET YOUR API KEY ═══ */}
        <section id="get-api-key" className="bg-muted/30 py-16 sm:py-24">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                <Key className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Get Your Free API Key</h2>
              <p className="text-muted-foreground">
                Enter your email. We'll create your developer account and generate an API key instantly. No credit card. No setup.
              </p>
              {!submitted ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12 text-base"
                      onKeyDown={(e) => e.key === 'Enter' && handleGetKey()}
                    />
                    <Button onClick={handleGetKey} disabled={submitting} size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-12">
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                      ) : (
                        <><Key className="w-4 h-4" /> Get API Key</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1,000 free API calls per month · No credit card required
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold text-lg">Your API key is ready!</span>
                  </div>
                  {generatedKey && (
                    <div className="space-y-3">
                      <div className="relative">
                        <code className="block bg-background border-2 border-emerald-500/30 rounded-lg p-4 text-sm break-all font-mono select-all text-foreground">
                          {generatedKey}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 h-8 gap-1.5"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedKey);
                            toast.success('Copied to clipboard!');
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </Button>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-400">
                        ⚠️ Save this key now — it won't be shown again.
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Use this key in the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer YOUR_KEY</code> header when calling the API.
                  </p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setGeneratedKey(null); setEmail(''); }} className="gap-2">
                    <Key className="w-4 h-4" /> Generate Another Key
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══ ENTERPRISE CONTACT ═══ */}
        <section id="enterprise" className="py-12 sm:py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground">Need unlimited calls or on-premise deployment?</h3>
            <p className="text-sm text-muted-foreground">
              Contact <a href="mailto:hello@CMPSBL.com" className="text-primary underline">hello@CMPSBL.com</a> for Enterprise plans.
            </p>
          </div>
        </section>

        {/* ═══ FOOTER CTA ═══ */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
            <h2 className="text-2xl font-bold">Software that evolves itself. Via API.</h2>
            <p className="text-muted-foreground">
              Stop bolting resilience on after things break. Start with an immune system that runs on our servers — not yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleGetApiKey} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Key className="w-4 h-4" />
                Get Free API Key
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2">
                <BarChart3 className="w-4 h-4" />
                View Plans
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              API-first · Zero source exposure · All frameworks · Free tier available
            </p>
          </div>
        </section>
      </div>

      <EnhancedFooter />
    </>
  );
}
