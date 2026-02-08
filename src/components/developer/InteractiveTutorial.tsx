import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Play, ChevronRight, ChevronLeft, Code, BookOpen, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    setOutput('Running...\n');
    
    // Simulate code execution
    await new Promise(r => setTimeout(r, 800));
    
    const mockOutputs = [
      'SDK initialized!\n✓ Connection verified',
      'Memory stored: mem_a1b2c3d4\n✓ Indexed for retrieval',
      '[0.92] User prefers dark mode\n[0.78] Last login: 2 days ago',
      'Context tokens: 1,847\nMemories used: 12\n✓ Optimized for GPT-4',
      '✓ Recall successful\nResults: 3 memories retrieved'
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
      toast.success(`+${step.xpReward} XP earned!`);
    } catch (e) {
      // Continue even if tracking fails
    }

    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 500);
    } else {
      toast.success('🎉 Tutorial complete! You earned the SDK Basics badge.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
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
            <Badge variant="outline" className="text-lg px-4 py-2">
              {completedSteps.size}/{TUTORIAL_STEPS.length} Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2">
            {TUTORIAL_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  i === currentStep ? 'text-primary font-medium' : 
                  completedSteps.has(i) ? 'text-green-500' : 'text-muted-foreground'
                }`}
              >
                {completedSteps.has(i) ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Instructions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {currentStep + 1}
              </span>
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{step.description}</p>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">📋 Instructions</h4>
              <p className="text-sm">{step.instruction}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Hint
              </h4>
              <p className="text-sm text-muted-foreground">{step.hint}</p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Badge variant="secondary">+{step.xpReward} XP</Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentStep === TUTORIAL_STEPS.length - 1}
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Editor Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm min-h-[200px] bg-background"
              placeholder="Write your code here..."
            />

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

            {output && (
              <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="text-muted-foreground text-xs mb-2">// Output</div>
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InteractiveTutorial;
