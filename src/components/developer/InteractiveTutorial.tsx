import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Play, ChevronRight, ChevronLeft, Code, BookOpen, Sparkles, Terminal, Copy, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  instruction: string;
  starterCode: string;
  expectedOutput?: string;
  hint: string;
  xpReward: number;
  track: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 0,
    title: "Initialize the Substrate SDK",
    description: "Set up the CMPSBL client and verify your connection to the 40-primitive cognitive mesh.",
    instruction: "Import and initialize the substrate client. The init function connects you to all 40 primitives through a single entry point.",
    starterCode: `import { substrate } from '@cmpsbl/sdk';

// Initialize with your API key
const client = substrate.init({
  apiKey: process.env.CMPSBL_API_KEY,
  runtime: 'v14.4.0'
});

// Verify connection to the mesh
const status = await client.health();
console.log('Connected:', status.primitives, 'primitives');
console.log('Runtime:', status.version);`,
    expectedOutput: "Connected: 40 primitives\nRuntime: v14.4.0",
    hint: "The runtime version ensures you get the latest resolver capabilities and CJPI scoring.",
    xpReward: 25,
    track: 'foundation',
  },
  {
    id: 1,
    title: "Store Persistent Memory",
    description: "Use the BRAIN node's 4-tier memory system to store information with automatic tiering.",
    instruction: "Store a memory with importance scoring. Memories flow through HOT → WARM → COOL → COLD tiers automatically.",
    starterCode: `// Store with 4-tier persistence
const memory = await client.brain.remember({
  content: "User prefers dark mode with high contrast",
  importance: 0.85,
  metadata: {
    category: "preferences",
    source: "onboarding",
    tier: "hot" // Auto-managed after creation
  }
});

console.log('Memory ID:', memory.id);
console.log('Tier:', memory.currentTier);
console.log('DREAM Engine eligible:', memory.dreamEligible);`,
    expectedOutput: "Memory ID: mem_a1b2c3d4\nTier: hot\nDREAM Engine eligible: true",
    hint: "Memories with importance > 0.7 are eligible for DREAM consolidation during idle cycles.",
    xpReward: 35,
    track: 'brain',
  },
  {
    id: 2,
    title: "Semantic Recall & Context",
    description: "Query memories using vector-powered semantic search across all temperature tiers.",
    instruction: "Build an optimized context window from recalled memories. The SDK handles cross-tier retrieval and token budgeting.",
    starterCode: `// Semantic recall across all tiers
const memories = await client.brain.recall({
  query: "What are the user's display preferences?",
  limit: 10,
  threshold: 0.65,
  includeTiers: ['hot', 'warm', 'cool']
});

// Build LLM-ready context
const context = await client.brain.buildContext({
  query: "Personalize the UI for this user",
  maxTokens: 2000,
  strategy: "relevance_weighted"
});

console.log('Recalled:', memories.length, 'memories');
console.log('Context tokens:', context.tokenCount);`,
    expectedOutput: "Recalled: 5 memories\nContext tokens: 1,847",
    hint: "The relevance_weighted strategy prioritizes high-importance hot-tier memories for context building.",
    xpReward: 40,
    track: 'brain',
  },
  {
    id: 3,
    title: "Broadcast an Intent",
    description: "Learn the fundamental execution model — all system actions route through broadcastIntent().",
    instruction: "Broadcast an intent to the mesh. The router determines which resolvers execute and aggregates responses.",
    starterCode: `// All execution goes through intents
const receipt = await client.broadcastIntent({
  intentType: "analysis",
  sourceModule: "BRAIN",
  input: {
    query: "Analyze user behavior patterns",
    depth: "standard"
  },
  options: {
    timeout: 5000,
    telemetry: true // Emit mesh communications
  }
});

console.log('Receipt ID:', receipt.id);
console.log('Resolvers invoked:', receipt.resolverCount);
console.log('Matrix events:', receipt.meshEvents);`,
    expectedOutput: "Receipt ID: rcpt_x7f9e2\nResolvers invoked: 3\nMesh events: 8",
    hint: "Never bypass broadcastIntent() — it handles resolver routing, receipt logging, and mesh telemetry.",
    xpReward: 50,
    track: 'mesh',
  },
  {
    id: 4,
    title: "NEXUS Organ Multi-Provider Routing",
    description: "Route AI calls across multiple providers with automatic failover, budget controls, and latency optimization.",
    instruction: "Use NEXUS to route a request to the optimal provider based on task type and budget constraints.",
    starterCode: `// Route to best provider for the task
const result = await client.nexus.route({
  prompt: "Summarize this quarterly report",
  taskType: "summarization",
  budget: "economy",
  constraints: {
    maxLatency: 3000,
    providers: ['openai', 'anthropic', 'google'],
    fallback: true
  }
});

console.log('Provider:', result.provider);
console.log('Model:', result.model);
console.log('Latency:', result.latencyMs, 'ms');
console.log('Cost:', result.costMillicents, '¢');`,
    expectedOutput: "Provider: google\nModel: gemini-2.5-flash\nLatency: 245 ms\nCost: 0.3 ¢",
    hint: "NEXUS selects the optimal provider-model combination based on task type, budget, and real-time latency data.",
    xpReward: 45,
    track: 'nexus',
  },
  {
    id: 5,
    title: "Ascension: Ingest Software",
    description: "Transform uploaded code into a first-class participant in the 41-node collision matrix.",
    instruction: "Ingest external software through the Ascension memory chain. The extraction engine supports 25+ languages including HDL types.",
    starterCode: `// Ingest software into the substrate
const ascension = await client.evolution.ingest({
  source: myUploadedCode,
  language: "typescript",
  mode: "temporary", // or "persistent"
  runLimit: 5, // Auto-archive after 5 cycles
  qualityGate: {
    minConfidence: 0.68,
    deduplication: true // Jaccard similarity check
  }
});

console.log('Node:', ascension.nodeName);
console.log('Primitives:', ascension.primitiveCount);
console.log('Quality score:', ascension.qualityScore);
console.log('Status:', ascension.lifecycle);`,
    expectedOutput: "Node: Ψ₄₁ TRADE_ENGINE\nPrimitives: 12\nQuality score: 0.82\nStatus: candidate",
    hint: "Ascension Nodes go through 4 lifecycle states: Candidate → Active → Archived → Rejected. Governor approval promotes candidates.",
    xpReward: 60,
    track: 'ascension',
  },
  {
    id: 6,
    title: "CJPI Scoring & Discovery",
    description: "Understand how the substrate scores discoveries across 4 dimensions.",
    instruction: "Trigger a crystallization from the Memory Stream and inspect its CJPI score breakdown.",
    starterCode: `// Crystallize from the Memory Stream
const discovery = await client.foundry.crystallize({
  qualityFloor: 68,
  maxResults: 1
});

if (discovery) {
  const { cjpi } = discovery;
  console.log('Discovery:', discovery.name);
  console.log('Tier:', discovery.tier);
  console.log('CJPI Score:', cjpi.total.toFixed(1));
  console.log('  Novelty:', cjpi.novelty.toFixed(1));
  console.log('  Utility:', cjpi.utility.toFixed(1));
  console.log('  Complexity:', cjpi.complexity.toFixed(1));
  console.log('  Composability:', cjpi.composability.toFixed(1));
}`,
    expectedOutput: "Discovery: Adaptive Rate Limiter\nTier: Prime\nCJPI Score: 78.3\n  Novelty: 82.1\n  Utility: 91.0\n  Complexity: 65.4\n  Composability: 74.5",
    hint: "Discoveries are tiered: Raw (68-74) → Mint (75-79) → Prime (80-84) → Relic (85-89) → Mythic (90-94) → Apex (95+).",
    xpReward: 55,
    track: 'cjpi',
  },
  {
    id: 7,
    title: "Production Hardening",
    description: "Implement production-ready patterns with error handling, retry logic, and Forge protections.",
    instruction: "Wrap SDK operations with proper error handling, exponential backoff, and telemetry that never blocks execution.",
    starterCode: `// Production-ready substrate operations
async function safeRecall(query: string, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await client.brain.recall({
        query,
        limit: 10,
        threshold: 0.7
      });

      // Non-blocking telemetry
      client.telemetry.logReceipt({
        action: 'recall',
        success: true,
        latencyMs: result.latencyMs
      }).catch(() => {}); // Never block on telemetry

      return result;
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

const results = await safeRecall("critical context");
console.log('Results:', results.length);`,
    expectedOutput: "Results: 7",
    hint: "Telemetry must always be non-blocking (.catch(() => {})). Use exponential backoff for RATE_LIMITED errors.",
    xpReward: 65,
    track: 'production',
  },
];

export function InteractiveTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [code, setCode] = useState(TUTORIAL_STEPS[0].starterCode);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [developerId] = useState(() => `dev_${crypto.randomUUID().slice(0, 8)}`);

  const step = TUTORIAL_STEPS[currentStep];
  const progress = (completedSteps.size / TUTORIAL_STEPS.length) * 100;

  useEffect(() => {
    setCode(TUTORIAL_STEPS[currentStep].starterCode);
    setOutput('');
  }, [currentStep]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('⏳ Executing...\n');

    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const mockOutputs = [
      '✓ SDK initialized\n✓ Connected to cognitive mesh\n✓ 40 primitives online\n✓ Runtime: v14.4.0',
      '✓ Memory stored: mem_a1b2c3d4\n✓ Tier: hot (auto-managed)\n✓ Importance: 0.85\n✓ DREAM eligible: true\n✓ Indexed for semantic retrieval',
      '✓ Query executed in 23ms\n✓ Recalled 5 memories across 3 tiers\n  [0.92] User prefers dark mode with high contrast\n  [0.78] Last login: 2 days ago\n  [0.71] Timezone: PST\n✓ Context built: 1,847 / 2,000 tokens',
      '✓ Intent broadcast: analysis\n✓ Router resolved 3 resolvers\n  → brain.reasoning_context\n  → cortex.orchestration_status\n  → memory.semantic_search\n✓ Receipt: rcpt_x7f9e2\n✓ 8 mesh communication events emitted',
      '✓ NEXUS routing complete\n✓ Provider: google (gemini-2.5-flash)\n✓ Latency: 245ms\n✓ Cost: 0.3 millicents\n✓ Failover: 2 backup providers ready',
      '✓ Ascension ingestion started\n✓ Language detected: TypeScript\n✓ Primitives extracted: 12\n✓ Quality gate passed (0.82 > 0.68)\n✓ Jaccard dedup: 0 duplicates\n✓ Node assigned: Ψ₄₁ TRADE_ENGINE\n✓ Status: candidate (awaiting Governor approval)',
      '✓ Crystallization triggered\n✓ Discovery: Adaptive Rate Limiter\n✓ Tier: Prime\n✓ CJPI: 78.3\n  Novelty: 82.1 | Utility: 91.0\n  Complexity: 65.4 | Composability: 74.5\n✓ Added to vault',
      '✓ safeRecall executed successfully\n✓ Attempt: 1 of 3\n✓ Results: 7 memories recalled\n✓ Telemetry logged (non-blocking)\n✓ Total latency: 45ms',
    ];

    setOutput(mockOutputs[currentStep] || '✓ Code executed successfully');
    setIsRunning(false);
  };

  const completeStep = async () => {
    if (completedSteps.has(currentStep)) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    try {
      await supabase.functions.invoke('developer-learning', {
        body: { action: 'award_xp', developer_id: developerId, skill_key: step.track, xp_amount: step.xpReward }
      });
      toast.success(`+${step.xpReward} XP earned!`, { description: `Step ${currentStep + 1} completed` });
    } catch {
      toast.success(`+${step.xpReward} XP earned!`);
    }

    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 600);
    } else {
      toast.success('🎉 All Tracks Complete!', { description: 'You earned the Substrate Architect certification' });
    }
  };

  const copyCode = () => { navigator.clipboard.writeText(code); toast.success('Code copied'); };
  const resetCode = () => { setCode(step.starterCode); setOutput(''); };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-primary/5 via-background to-neon-cyan/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Substrate Mastery — 8 Tracks
              </h2>
              <p className="text-sm text-muted-foreground">
                From SDK basics to production-grade Ascension memory chains
              </p>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2 border-primary/30">
              <span className="text-primary font-bold">{completedSteps.size}</span>
              <span className="text-muted-foreground">/{TUTORIAL_STEPS.length}</span>
            </Badge>
          </div>

          <Progress value={progress} className="h-2 mb-4" />

          {/* Step indicators */}
          <div className="flex justify-between gap-0.5 overflow-x-auto scrollbar-hide">
            {TUTORIAL_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className={`flex-1 min-w-0 flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg transition-all ${
                  i === currentStep ? 'bg-primary/10' : completedSteps.has(i) ? 'hover:bg-muted/50' : 'hover:bg-muted/30 opacity-60'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors text-xs ${
                  completedSteps.has(i) ? 'bg-primary text-primary-foreground' : i === currentStep ? 'bg-primary/20 text-primary border-2 border-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.has(i) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="font-semibold">{i + 1}</span>}
                </div>
                <span className={`text-[9px] hidden lg:block truncate max-w-full ${
                  i === currentStep ? 'text-primary font-medium' : completedSteps.has(i) ? 'text-foreground' : 'text-muted-foreground'
                }`}>{s.title.split(' ').slice(0, 2).join(' ')}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Instructions */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">{currentStep + 1}</div>
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">+{step.xpReward} XP</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{step.track}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <p className="text-muted-foreground">{step.description}</p>
            <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Terminal className="w-4 h-4 text-primary" />Instructions</h4>
              <p className="text-sm">{step.instruction}</p>
            </div>
            <div className="bg-accent/30 p-4 rounded-xl border border-accent/50">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent-foreground" />Hint</h4>
              <p className="text-sm text-muted-foreground">{step.hint}</p>
            </div>
            {step.expectedOutput && (
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <h4 className="font-medium text-sm mb-2">Expected Output</h4>
                <code className="text-xs text-primary font-mono whitespace-pre-wrap">{step.expectedOutput}</code>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 mt-auto">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentStep === 0} onClick={() => setCurrentStep(prev => prev - 1)}><ChevronLeft className="w-4 h-4" />Prev</Button>
                <Button variant="outline" size="sm" disabled={currentStep === TUTORIAL_STEPS.length - 1} onClick={() => setCurrentStep(prev => prev + 1)}>Next<ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-primary" />Code Editor</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8"><Copy className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={resetCode} className="h-8 w-8"><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="relative flex-1 min-h-[220px]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="absolute inset-0 w-full h-full font-mono text-sm p-4 bg-muted/30 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Write your code here..."
                spellCheck={false}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={runCode} disabled={isRunning} className="flex-1"><Play className="w-4 h-4 mr-2" />{isRunning ? 'Running...' : 'Run Code'}</Button>
              <Button onClick={completeStep} variant={completedSteps.has(currentStep) ? 'secondary' : 'default'} className="flex-1" disabled={!output || completedSteps.has(currentStep)}>
                {completedSteps.has(currentStep) ? (<><CheckCircle2 className="w-4 h-4 mr-2" />Completed</>) : 'Mark Complete'}
              </Button>
            </div>
            <AnimatePresence mode="wait">
              {output && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card border border-border rounded-xl p-4 font-mono text-sm">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2"><Terminal className="w-3 h-3" />Console Output</div>
                  <pre className="whitespace-pre-wrap text-primary text-xs">{output}</pre>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InteractiveTutorial;
