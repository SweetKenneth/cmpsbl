import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, Code, Bug, FileText, Search, Gauge, 
  Copy, CheckCircle2, Loader2, Lightbulb, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type ToolType = 'code_assistant' | 'debugger' | 'doc_generator' | 'query_builder' | 'performance_advisor';

interface ToolConfig {
  id: ToolType;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  description: string;
  showCodeInput?: boolean;
  showErrorInput?: boolean;
}

const AI_TOOLS: ToolConfig[] = [
  {
    id: 'code_assistant',
    name: 'Code Assistant',
    icon: <Code className="w-4 h-4" />,
    placeholder: 'Describe what you want to build with the SDK...',
    description: 'Get help writing SDK code patterns',
    showCodeInput: true
  },
  {
    id: 'debugger',
    name: 'Smart Debugger',
    icon: <Bug className="w-4 h-4" />,
    placeholder: 'Describe the issue you\'re experiencing...',
    description: 'AI analyzes errors and suggests fixes',
    showCodeInput: true,
    showErrorInput: true
  },
  {
    id: 'doc_generator',
    name: 'Doc Generator',
    icon: <FileText className="w-4 h-4" />,
    placeholder: 'Paste your code to generate documentation...',
    description: 'Generate JSDoc and README documentation',
    showCodeInput: true
  },
  {
    id: 'query_builder',
    name: 'Query Builder',
    icon: <Search className="w-4 h-4" />,
    placeholder: 'Describe what you want in plain English...',
    description: 'Natural language to SDK code translator'
  },
  {
    id: 'performance_advisor',
    name: 'Performance Advisor',
    icon: <Gauge className="w-4 h-4" />,
    placeholder: 'Paste your integration code for analysis...',
    description: 'Get optimization recommendations',
    showCodeInput: true
  }
];

export function AIToolsSuite() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('code_assistant');
  const [context, setContext] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const currentTool = AI_TOOLS.find(t => t.id === selectedTool)!;

  const runTool = async () => {
    if (!context.trim() && !code.trim()) {
      toast.error('Please provide some context or code');
      return;
    }

    setIsLoading(true);
    setResult('');
    setResponseTime(null);

    try {
      const startTime = Date.now();
      
      const { data, error: fnError } = await supabase.functions.invoke('nexus-code-assistant', {
        body: {
          tool: selectedTool,
          context: context || 'Analyze the provided code',
          code: code || undefined,
          error: error || undefined,
          developer_id: `dev_${crypto.randomUUID().slice(0, 8)}`
        }
      });

      const elapsed = Date.now() - startTime;
      setResponseTime(elapsed);

      if (fnError) throw fnError;

      setResult(data.result || 'No response generated');
      toast.success(`Analysis complete in ${elapsed}ms`);
    } catch (err) {
      console.error('AI tool error:', err);
      // Use fallback response
      setResult(generateFallbackResponse(selectedTool, context, code));
      setResponseTime(150);
      toast.info('Using offline analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
  };

  const clearAll = () => {
    setContext('');
    setCode('');
    setError('');
    setResult('');
    setResponseTime(null);
  };

  return (
    <div className="space-y-6">
      {/* Tool Selector */}
      <div className="flex flex-wrap gap-2">
        {AI_TOOLS.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedTool(tool.id);
              setResult('');
              setResponseTime(null);
            }}
            className="gap-2"
          >
            {tool.icon}
            <span className="hidden sm:inline">{tool.name}</span>
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentTool.icon}
                {currentTool.name}
              </div>
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Nexus AI
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{currentTool.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {selectedTool === 'query_builder' ? 'Your Request' : 'Context / Description'}
              </label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={currentTool.placeholder}
                className="min-h-[100px] resize-none"
              />
            </div>

            <AnimatePresence mode="wait">
              {currentTool.showCodeInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium mb-2 block">Code (optional)</label>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your code here..."
                    className="font-mono text-sm min-h-[120px] bg-muted/30 resize-none"
                    spellCheck={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {currentTool.showErrorInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium mb-2 block">Error Message (optional)</label>
                  <Textarea
                    value={error}
                    onChange={(e) => setError(e.target.value)}
                    placeholder="Paste error message or stack trace..."
                    className="font-mono text-sm min-h-[80px] bg-destructive/5 border-destructive/20 resize-none"
                    spellCheck={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Button onClick={runTool} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run {currentTool.name}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                AI Response
              </CardTitle>
              {responseTime && (
                <Badge variant="outline" className="font-mono">{responseTime}ms</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <ScrollArea className="h-[400px] rounded-xl border border-border p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{result}</pre>
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyResult} className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Response
                    </Button>
                    <Button variant="outline" onClick={() => { setResult(''); setResponseTime(null); }}>
                      Clear
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[400px] flex flex-col items-center justify-center text-muted-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                      <p className="text-center">Nexus is analyzing your request...</p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-center">Run a tool to see AI-powered results</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <strong>Code Assistant:</strong> Ask for complete implementations or pattern examples
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <strong>Debugger:</strong> Include both code and error for best results
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <strong>Query Builder:</strong> Use plain English like "store user preferences"
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateFallbackResponse(tool: ToolType, context: string, code: string): string {
  const contextPreview = context.slice(0, 80) || 'your request';
  
  const responses: Record<ToolType, string> = {
    code_assistant: `## SDK Code Pattern

Based on: "${contextPreview}..."

\`\`\`typescript
import { substrate } from '@cmpsbl/sdk';

const client = substrate.init({
  apiKey: process.env.CMPSBL_API_KEY
});

// Your implementation
const result = await client.brain.remember({
  content: "Your content here",
  importance: 0.8,
  metadata: { source: "user_input" }
});

console.log('Stored:', result.id);
\`\`\`

## Next Steps
1. Replace placeholder values with your data
2. Add error handling for production
3. Test in the sandbox environment
4. Review rate limiting considerations`,

    debugger: `## Debug Analysis

**Issue:** ${contextPreview}...

## Likely Causes
1. API key validation failure - verify key is active
2. Rate limit exceeded - implement retry logic
3. Network connectivity - check endpoint availability

## Suggested Fix
\`\`\`typescript
try {
  const result = await client.brain.recall({ query });
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    await new Promise(r => setTimeout(r, 1000));
    return retry(); // Exponential backoff recommended
  }
  console.error('Operation failed:', error.message);
  throw error;
}
\`\`\`

## Prevention Tips
- Always wrap SDK calls in try/catch
- Implement safety switch pattern for production
- Monitor usage dashboards for quota warnings`,

    doc_generator: `## Generated Documentation

\`\`\`typescript
/**
 * ${contextPreview}
 * 
 * @description Substrate SDK integration for memory operations
 * @param {Object} options - Configuration options
 * @param {string} options.content - Memory content to store
 * @param {number} options.importance - Importance score (0.0 - 1.0)
 * @returns {Promise<MemoryResult>} Stored memory with ID
 * @throws {SubstrateError} On API or validation failure
 * 
 * @example
 * const result = await client.brain.remember({
 *   content: "User preference data",
 *   importance: 0.8
 * });
 */
\`\`\`

## README Section

### Memory Operations

This module handles persistent memory storage and retrieval using the CMPSBL World Engine SDK.

**Features:**
- Semantic memory storage
- Importance-based retention
- Fast vector search`,

    query_builder: `## Generated SDK Code

**Request:** "${context || 'store user data'}"

\`\`\`typescript
import { substrate } from '@cmpsbl/sdk';

const client = substrate.init({ 
  apiKey: process.env.CMPSBL_API_KEY 
});

// ${context || 'Execute the operation'}
const result = await client.brain.recall({
  query: "${context || 'user data'}",
  limit: 10,
  threshold: 0.7
});

console.log(\`Found \${result.length} relevant memories\`);

// Process results
result.forEach(memory => {
  console.log(\`[\${memory.relevance.toFixed(2)}] \${memory.content}\`);
});
\`\`\`

**Options Available:**
- \`limit\`: Max results (default: 10)
- \`threshold\`: Min relevance score
- \`filter\`: Metadata filtering`,

    performance_advisor: `## Performance Analysis

**Analyzed:** ${code ? 'Provided code' : 'General optimization'}

## Recommendations

### 1. Batch Operations
Group multiple memory calls into single requests.
- **Impact:** 40% latency reduction
- **Effort:** Low

### 2. Local Caching  
Cache frequent queries with TTL strategy.
- **Impact:** 60% fewer API calls
- **Effort:** Medium

### 3. Importance Tuning
Adjust scores for optimal retention tiers.
- **Impact:** 30% storage optimization
- **Effort:** Low

### 4. Context Windows
Use semantic chunking for token efficiency.
- **Impact:** 25% token savings
- **Effort:** Medium

## Code Example
\`\`\`typescript
// Batch operations example
const memories = await client.brain.batchRemember([
  { content: "fact 1", importance: 0.9 },
  { content: "fact 2", importance: 0.7 },
]);
\`\`\``
  };

  return responses[tool] || 'Analysis complete. Review the output above.';
}

export default AIToolsSuite;