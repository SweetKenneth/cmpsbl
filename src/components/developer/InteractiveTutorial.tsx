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
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 0,
    title: "Initialize the SDK",
    description: "Learn to set up the CMPSBL Substrate SDK in your project.",
    instruction: "Import and initialize the substrate client with your API key.",
    starterCode: `// Step 1: Import the SDK
import { substrate } from '@cmpsbl/substrate';

// Step 2: Initialize with your key
const client = substrate.init({
  apiKey: 'your_api_key_here'
});

console.log('SDK initialized!');`,
    hint: "The init function returns a configured client instance.",
    xpReward: 25
  },
  {
    id: 1,
    title: "Store Your First Memory",
    description: "Use brain.remember() to persist information.",
    instruction: "Store a piece of information with importance scoring.",
    starterCode: `// Store a memory with importance
const memory = await client.brain.remember({
  content: "User prefers dark mode",
  importance: 0.8,
  metadata: { category: "preferences" }
});

console.log('Memory stored:', memory.id);`,
    expectedOutput: "Memory stored: mem_...",
    hint: "Importance ranges from 0.0 to 1.0. Higher = longer retention.",
    xpReward: 30
  },
  {
    id: 2,
    title: "Recall Memories",
    description: "Retrieve relevant memories using semantic search.",
    instruction: "Query memories based on natural language.",
    starterCode: `// Recall memories matching a query
const memories = await client.brain.recall({
  query: "What are the user preferences?",
  limit: 5
});

memories.forEach(m => {
  console.log(\`[\${m.relevance}] \${m.content}\`);
});`,
    expectedOutput: "[0.92] User prefers dark mode",
    hint: "The recall function uses semantic similarity, not keyword matching.",
    xpReward: 35
  },
  {
    id: 3,
    title: "Context Window Management",
    description: "Optimize memory retrieval for LLM context windows.",
    instruction: "Build an optimized context from multiple memories.",
    starterCode: `// Build context for an LLM
const context = await client.brain.buildContext({
  query: "User preferences and history",
  maxTokens: 2000,
  strategy: "relevance_weighted"
});

console.log('Context tokens:', context.tokenCount);
console.log('Memories used:', context.memoryCount);`,
    hint: "Use maxTokens to fit within your model's context limit.",
    xpReward: 40
  },
  {
    id: 4,
    title: "Production Patterns",
    description: "Implement error handling and retry logic.",
    instruction: "Wrap operations with proper error handling.",
    starterCode: `// Production-ready memory operations
async function safeRecall(query: string) {
  try {
    return await client.brain.recall({ query, limit: 10 });
  } catch (error) {
    if (error.code === 'RATE_LIMITED') {
      await new Promise(r => setTimeout(r, 1000));
      return safeRecall(query); // Retry
    }
    throw error;
  }
}

const results = await safeRecall("important context");`,
    hint: "Always handle RATE_LIMITED errors with exponential backoff.",
    xpReward: 50
  }
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
    
    // Simulate code execution with realistic delays
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    
    const mockOutputs = [
      '✓ SDK initialized!\n✓ Connection verified\n✓ API key validated',
      '✓ Memory stored: mem_a1b2c3d4\n✓ Indexed for semantic retrieval\n✓ Importance: 0.8 (high retention)',
      '✓ Query executed in 23ms\n[0.92] User prefers dark mode\n[0.78] Last login: 2 days ago\n[0.65] Timezone: PST',
      '✓ Context optimized for GPT-4\n  Tokens used: 1,847 / 2,000\n  Memories included: 12\n  Relevance threshold: 0.70',
      '✓ Recall successful with retry logic\n  Attempts: 1\n  Results: 3 memories\n  Total time: 45ms'
    ];
    
    setOutput(mockOutputs[currentStep] || '✓ Code executed successfully');
    setIsRunning(false);
  };

  const completeStep = async () => {
    if (completedSteps.has(currentStep)) return;
    
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    // Award XP via backend
    try {
      await supabase.functions.invoke('developer-learning', {
        body: {
          action: 'award_xp',
          developer_id: developerId,
          skill_key: 'sdk_basics',
          xp_amount: step.xpReward
        }
      });
      toast.success(`+${step.xpReward} XP earned!`, {
        description: `Step ${currentStep + 1} completed`
      });
    } catch {
      // Continue even if tracking fails
      toast.success(`+${step.xpReward} XP earned!`);
    }

    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 600);
    } else {
      toast.success('🎉 Tutorial Complete!', {
        description: 'You earned the SDK Fundamentals badge'
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const resetCode = () => {
    setCode(step.starterCode);
    setOutput('');
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                SDK Fundamentals Tutorial
              </h2>
              <p className="text-sm text-muted-foreground">
                Master the CMPSBL Substrate SDK in 5 interactive steps
              </p>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2 border-primary/30">
              <span className="text-primary font-bold">{completedSteps.size}</span>
              <span className="text-muted-foreground">/{TUTORIAL_STEPS.length}</span>
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2 mb-4" />
          
          {/* Step indicators */}
          <div className="flex justify-between gap-1">
            {TUTORIAL_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-all ${
                  i === currentStep 
                    ? 'bg-primary/10' 
                    : completedSteps.has(i) 
                      ? 'hover:bg-muted/50' 
                      : 'hover:bg-muted/30 opacity-60'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  completedSteps.has(i) 
                    ? 'bg-primary text-primary-foreground' 
                    : i === currentStep 
                      ? 'bg-primary/20 text-primary border-2 border-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.has(i) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{i + 1}</span>
                  )}
                </div>
                <span className={`text-xs hidden sm:block truncate max-w-full ${
                  i === currentStep ? 'text-primary font-medium' : 
                  completedSteps.has(i) ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {s.title}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Instructions Panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                {currentStep + 1}
              </div>
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <Badge variant="secondary" className="mt-1">+{step.xpReward} XP</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <p className="text-muted-foreground">{step.description}</p>
            
            <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Instructions
              </h4>
              <p className="text-sm">{step.instruction}</p>
            </div>

            <div className="bg-accent/30 p-4 rounded-xl border border-accent/50">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-foreground" />
                Hint
              </h4>
              <p className="text-sm text-muted-foreground">{step.hint}</p>
            </div>

            {step.expectedOutput && (
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <h4 className="font-medium text-sm mb-2">Expected Output</h4>
                <code className="text-xs text-primary font-mono">{step.expectedOutput}</code>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 mt-auto">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentStep === TUTORIAL_STEPS.length - 1}
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Editor Panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Code Editor
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={resetCode} className="h-8 w-8">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="relative flex-1 min-h-[200px]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="absolute inset-0 w-full h-full font-mono text-sm p-4 bg-muted/30 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Write your code here..."
                spellCheck={false}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={runCode} disabled={isRunning} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button
                onClick={completeStep}
                variant={completedSteps.has(currentStep) ? 'secondary' : 'default'}
                className="flex-1"
                disabled={!output || completedSteps.has(currentStep)}
              >
                {completedSteps.has(currentStep) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark Complete'
                )}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {output && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border rounded-xl p-4 font-mono text-sm"
                >
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Console Output
                  </div>
                  <pre className="whitespace-pre-wrap text-primary">{output}</pre>
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