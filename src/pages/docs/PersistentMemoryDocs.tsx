import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, Zap, Code, CheckCircle, ArrowRight, Layers, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PersistentMemoryDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Clock className="w-3 h-3 mr-1" />
              Under 1 Hour Integration
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Add Persistent Memory to Your Agent
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              No rewrite. No vector DB setup. No prompt hacks. 
              Just drop-in memory that works.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="text-sm py-1 px-3">
                <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
                Works with vibe-coded agents
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
                Works with Node.js apps
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
                Works with React apps
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Why Agents Forget */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Why Agents Forget
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Every conversation with an AI agent starts fresh. Your agent doesn't remember:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Previous conversations and context
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  User preferences and patterns
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Learned behaviors from past interactions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  Domain knowledge accumulated over time
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* What Changes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            What Persistent Memory Changes
          </h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-foreground mb-4">
                With CMPSBL persistent memory, your agent automatically:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <strong>Recalls relevant context</strong> from past interactions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <strong>Learns patterns</strong> without manual configuration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <strong>Builds coherent identity</strong> across sessions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <strong>Stays bounded and safe</strong> with automatic decay
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* 3-Step Integration */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            3-Step Integration
          </h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="rounded-full w-8 h-8 flex items-center justify-center">1</Badge>
                  Install the Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">npm install @cmpsbl/memory</code>
                </pre>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="rounded-full w-8 h-8 flex items-center justify-center">2</Badge>
                  Wrap Your Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  agentId: 'my-support-agent',
  scope: 'project'  // or 'session'
});`}
                </pre>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="rounded-full w-8 h-8 flex items-center justify-center">3</Badge>
                  Use Memory-Aware Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Get context for any input
const context = await agent.getContext(userMessage);

// Context includes recalled memories
console.log(context.memories);     // ['Previous interaction...', ...]
console.log(context.confidence);   // 0.85
console.log(context.contextString); // Pre-built string for prompts

// Manually remember important information
await agent.remember('User prefers dark mode');`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* React Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            React Hook Example
          </h2>
          <Card>
            <CardContent className="pt-6">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { usePersistentAgent } from '@cmpsbl/memory';

function ChatComponent() {
  const { respond, remember, isLoading } = usePersistentAgent('my-agent');
  
  const handleSend = async (message: string) => {
    // Automatically recalls relevant memories
    const context = await respond(message);
    
    // Use context.contextString in your prompt
    const prompt = \`\${message}\${context.contextString}\`;
    
    // Call your LLM with memory-enriched prompt
    const response = await callYourLLM(prompt);
    
    // Optionally remember important outcomes
    if (response.includes('important')) {
      await remember(\`User learned: \${response}\`);
    }
  };
  
  return (
    <div>
      {isLoading && <Spinner />}
      {/* Your chat UI */}
    </div>
  );
}`}
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Node.js Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            Node.js / Agent Example
          </h2>
          <Card>
            <CardContent className="pt-6">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { withPersistentMemory } from '@cmpsbl/memory';
import OpenAI from 'openai';

const openai = new OpenAI();
const memory = withPersistentMemory({ agentId: 'support-bot' });

async function handleUserMessage(userMessage: string) {
  // 1. Get memory context
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
}`}
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* What's Included */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">What's Included for Free</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Automatic Recall
                </h3>
                <p className="text-sm text-muted-foreground">
                  Relevant memories are retrieved automatically based on semantic similarity.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Safe Defaults
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bounded storage and automatic decay prevent runaway memory growth.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Per-Agent Isolation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Each agent's memory is completely isolated from others.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Graceful Degradation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Memory failures never crash your app - they degrade silently.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Engine Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            What Requires Engines
          </h2>
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Advanced memory capabilities are available through Memory Engines:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground" />
                  <strong>Recall Optimization</strong> - Fine-tuned relevance scoring
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground" />
                  <strong>Long-Horizon Identity</strong> - Extended memory retention
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground" />
                  <strong>Cross-Agent Continuity</strong> - Shared memory across agents
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground" />
                  <strong>Memory Audits</strong> - Full history and versioning
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/engines">
                  <Button variant="outline">
                    Explore Memory Engines
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Link to="/capabilities">
                  <Button variant="outline" size="lg">
                    Explore Capabilities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PersistentMemoryDocs;
