/**
 * Persistent Memory Quickstart Docs
 * 
 * Technical integration guide fulfilling the "under an hour" promise.
 * Minimal, copy-paste friendly, focused on getting started fast.
 * Uses the real REST API gateway — not a hallucinated SDK.
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
        description="Add persistent memory to your agent or app in under an hour via the substrate REST API. Step-by-step integration guide."
        keywords={['AI memory integration', 'agent memory API', 'persistent memory quickstart', 'CMPSBL substrate API']}
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
                This guide shows how to add persistent memory to an existing agent or app via the substrate REST API.
                No rewrite. No vector DB setup. No prompt hacks.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Step 1: Get API Key */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold">Get Your API Key</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  Generate a developer API key from your CMPSBL account. All memory operations go through the unified substrate gateway.
                </p>
                <CodeBlock code={`// Generate your key at cmpsbl.com/api-access
const API_KEY = process.env.CMPSBL_API_KEY;
const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';`} />
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  No additional infrastructure required. No vector database setup.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Step 2: Store & Recall */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold">Store & Recall Memories</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="w-5 h-5" />
                  Store a Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock code={`// Store a memory via the substrate gateway
const response = await fetch(GATEWAY, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    module: 'MEMORY',
    action: 'store',
    input: {
      content: 'User prefers concise answers and dark mode',
      agentId: 'my-support-agent',
      metadata: { type: 'user_preference' }
    }
  })
});

const { memoryId, importanceScore, tier } = await response.json();`} />
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">What the MEMORY Organ does automatically:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Scores importance and assigns a memory tier (hot/warm/cold)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Deduplicates against existing memories (FNV-1a hashing)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Tags with emotional valence and semantic metadata
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Rebalances tiers automatically over time
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="w-5 h-5" />
                  Recall Context for Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`// Recall relevant memories for a user message
const recall = await fetch(GATEWAY, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    module: 'MEMORY',
    action: 'recall',
    input: {
      query: userMessage,
      agentId: 'my-support-agent'
    }
  })
});

const { results, contextString, totalFound } = await recall.json();

// Append context to your LLM prompt
const messages = [
  { role: 'system', content: 'You are a helpful support agent.' },
  { role: 'user', content: userMessage + contextString }
];

// Call your LLM as usual — OpenAI, Anthropic, Gemini, etc.
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages
});`} />
              </CardContent>
            </Card>
          </section>

          {/* Step 3: Full Integration Example */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                3
              </div>
              <h2 className="text-2xl font-bold">Full Integration Example</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5" />
                  Complete Agent with Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock code={`const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';
const API_KEY = process.env.CMPSBL_API_KEY;

async function handleUserMessage(userMessage: string) {
  // 1. Store the user input
  await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      module: 'MEMORY',
      action: 'store',
      input: { content: userMessage, agentId: 'my-agent' }
    })
  });

  // 2. Recall relevant context
  const recallRes = await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      module: 'MEMORY',
      action: 'recall',
      input: { query: userMessage, agentId: 'my-agent' }
    })
  });
  const { contextString } = await recallRes.json();

  // 3. Call your LLM with memory-enriched context
  const response = await callYourLLM(userMessage + contextString);
  return response;
}`} />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Works with any stack:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Any language with HTTP — Node.js, Python, Go, Rust
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Any agent framework — LangChain, CrewAI, AutoGen, custom
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Any LLM — OpenAI, Anthropic, Gemini, local models
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      Graceful degradation — if memory is unavailable, your agent keeps working
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* What's Included */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-neon-green" />
              What's included
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
                      <CheckCircle className="w-4 h-4 text-neon-green" />
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
              Advanced capabilities
            </h2>
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Advanced memory capabilities available on higher plans:
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
                  <CardTitle className="font-mono text-lg">POST /v1/substrate — MEMORY.store</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={`// Request
{
  "module": "MEMORY",
  "action": "store",
  "input": {
    "content": "string",      // Required: the memory content
    "agentId": "string",      // Required: unique agent identifier
    "metadata": {              // Optional
      "type": "user_input" | "manual_note" | "interaction",
      "tags": ["string"],
      "important": boolean
    }
  }
}

// Response
{
  "memoryId": "uuid",
  "importanceScore": 0.75,
  "tier": "hot" | "warm" | "cold"
}`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">POST /v1/substrate — MEMORY.recall</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={`// Request
{
  "module": "MEMORY",
  "action": "recall",
  "input": {
    "query": "string",        // Required: what to search for
    "agentId": "string",      // Required: unique agent identifier
    "limit": 5                 // Optional: max results (default 5)
  }
}

// Response
{
  "results": [
    {
      "id": "uuid",
      "content": "string",
      "relevanceScore": 0.92,
      "importanceScore": 0.75,
      "tier": "hot",
      "createdAt": "ISO-8601"
    }
  ],
  "totalFound": 3,
  "contextString": "[Recalled 3 memories]: ..."
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
                  Generate your API key and start integrating persistent memory today.
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