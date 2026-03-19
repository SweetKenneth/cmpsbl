/**
 * Persistent Memory Quickstart Docs
 * 
 * Technical integration guide fulfilling the "under an hour" promise.
 * Minimal, copy-paste friendly, focused on getting started fast.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  Zap, 
  Code, 
  CheckCircle, 
  ArrowRight, 
  Layers, 
  Shield,
  Terminal,
  Copy,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};

const CodeBlock = ({ code, language = 'typescript' }: { code: string; language?: string }) => (
  <div className="relative group">
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
      <code>{code}</code>
    </pre>
    <button
      onClick={() => copyToClipboard(code)}
      className="absolute top-2 right-2 p-2 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copy code"
    >
      <Copy className="w-4 h-4" />
    </button>
  </div>
);

const PersistentMemoryDocs = () => {
  return (
    <>
      <SEO 
        title="Persistent Memory Quickstart | CMPSBL Docs"
        description="Add persistent memory to your agent or React app in under an hour. Step-by-step integration guide."
        keywords={['AI memory integration', 'agent memory SDK', 'React AI memory', 'persistent memory quickstart']}
      />
      <PublicNav />
      
      <div className="min-h-screen bg-background pt-20">
        {/* Navigation breadcrumb */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <Link 
              to="/persistent-memory" 
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Persistent Memory
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                <Clock className="w-3 h-3 mr-1" />
                Under 1 Hour Integration
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Persistent Memory Quickstart
              </h1>
              <p className="text-lg text-muted-foreground">
                This guide shows how to add persistent memory to an existing agent or React app in under an hour.
                No rewrite. No vector DB setup. No prompt hacks.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Step 1: Install */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold">Install the Package</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  Import the memory SDK directly from the substrate:
                </p>
                <CodeBlock code="import { withPersistentMemory } from '@cmpsbl/memory';" />
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  No additional infrastructure required. No vector database setup.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Step 2: Agent Wrapper */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold">Wrap Your Agent</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="w-5 h-5" />
                  Node.js / Server-side Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock code={`import { withPersistentMemory } from '@cmpsbl/memory';

// Create a memory-enabled agent
const agent = withPersistentMemory({
  agentId: 'my-support-agent',  // Unique identifier for this agent
  scope: 'project'               // 'project' = persistent, 'session' = temporary
});

// The wrapper provides:
// - agent.respond(input)     → Get response with automatic memory recall
// - agent.remember(note)     → Manually store important information
// - agent.getContext(input)  → Get memory context for custom integration`} />
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">What the wrapper does automatically:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Auto-extracts facts from user messages (names, preferences, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Recalls exact stored facts without hallucination
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Remembers previous workloads and task outcomes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Persists salient outcomes post-response
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="w-5 h-5" />
                  Full Integration Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`import { withPersistentMemory } from '@cmpsbl/memory';
import OpenAI from 'openai';

const openai = new OpenAI();
const memory = withPersistentMemory({ agentId: 'support-bot' });

async function handleUserMessage(userMessage: string) {
  // 1. Get memory context automatically
  //    Facts like "my name is Alex" are auto-extracted & stored
  const context = await memory.getContext(userMessage);
  
  // 2. Build memory-enriched prompt
  const messages = [
    { role: 'system', content: 'You are a helpful support agent.' },
    { role: 'user', content: userMessage + context.contextString }
  ];
  
  // 3. Call your LLM as usual
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages
  });
  
  // 4. Memory stores interactions automatically
  return response.choices[0].message.content;
}

// After completing a task, log the workload so the agent remembers
await memory.logWorkload('Resolved billing issue for user #42 — applied $10 credit');`} />
              </CardContent>
            </Card>
          </section>

          {/* Step 3: React Hook */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                3
              </div>
              <h2 className="text-2xl font-bold">React Hook (Optional)</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5" />
                  usePersistentAgent Hook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  For React apps, use the hook for seamless integration. No provider setup required.
                </p>
                <CodeBlock code={`import { usePersistentAgent } from '@cmpsbl/memory';

function ChatComponent() {
  const { respond, remember, isLoading, error } = usePersistentAgent('my-agent');
  
  const handleSend = async (message: string) => {
    // Automatically recalls relevant memories
    const context = await respond(message);
    
    // context.memories    → Array of relevant past memories
    // context.confidence  → Recall confidence (0-1)
    // context.contextString → Pre-built string for prompts
    
    // Use context in your LLM call
    const prompt = \`\${message}\${context.contextString}\`;
    const response = await callYourLLM(prompt);
    
    // Optionally remember important outcomes
    if (shouldRemember(response)) {
      await remember(\`Important: \${response}\`);
    }
    
    return response;
  };
  
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {/* Your chat UI */}
    </div>
  );
}`} />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Hook features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Works inside existing components
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      No provider boilerplate required
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Built-in loading and error states
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Graceful degradation on failures
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* What You Get Free */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              What you get for free
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Bounded Persistent Memory",
                  description: "Memory is automatically bounded to prevent runaway growth."
                },
                {
                  title: "Safe Recall Defaults",
                  description: "Semantic search returns relevant context without noise."
                },
                {
                  title: "Per-Agent Isolation",
                  description: "Each agent's memory is completely isolated from others."
                },
                {
                  title: "Graceful Degradation",
                  description: "Memory failures never crash your app — they degrade silently."
                }
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Engine Features */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              When engines are required
            </h2>
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Advanced memory capabilities are available through Memory Engines:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                    <div>
                      <strong className="text-foreground">Recall Optimization</strong>
                      <p className="text-sm">Fine-tuned relevance scoring for your domain</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                    <div>
                      <strong className="text-foreground">Long-Horizon Identity</strong>
                      <p className="text-sm">Extended memory retention beyond default windows</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                    <div>
                      <strong className="text-foreground">Cross-Agent Continuity</strong>
                      <p className="text-sm">Shared memory across multiple agents</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                    <div>
                      <strong className="text-foreground">Memory Audits</strong>
                      <p className="text-sm">Full history, versioning, and governance</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link to="/store?tab=plans">
                    <Button variant="outline">
                      View Pricing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* API Reference */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-primary" />
              API Reference
            </h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">withPersistentMemory(config)</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={`interface MemoryConfig {
  agentId: string;              // Required: Unique identifier
  scope?: 'session' | 'project'; // Default: 'project'
  handler?: (input, context) => Promise<string>; // Optional custom handler
}

// Returns
interface PersistentMemoryAgent {
  respond: (input: string) => Promise<string>;
  remember: (note: string) => Promise<void>;
  getContext: (input: string) => Promise<MemoryContext>;
  logWorkload: (summary: string) => Promise<void>;  // Track task outcomes
}`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">usePersistentAgent(agentId, scope?)</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={`// Returns
interface PersistentAgentResult {
  respond: (input: string) => Promise<MemoryContext>;
  remember: (note: string) => Promise<void>;
  logWorkload: (summary: string) => Promise<void>;  // Track task outcomes
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}

interface MemoryContext {
  memories: string[];     // Recalled memory contents
  confidence: number;     // Recall confidence (0-1)
  contextString: string;  // Pre-built string for prompts
}`} />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Add Memory?</h2>
                <p className="text-muted-foreground mb-6">
                  Start with the free tier. Upgrade when you need advanced features.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link to="/store">
                    <Button size="lg">
                      Explore Capabilities
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/store?tab=plans">
                    <Button variant="outline" size="lg">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
      
      <EnhancedFooter />
    </>
  );
};

export default PersistentMemoryDocs;
