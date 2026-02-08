import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, Code, Bug, FileText, Search, Gauge, 
  Send, Copy, CheckCircle2, Loader2, Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      toast.info('Using offline analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
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
            }}
            className="gap-2"
          >
            {tool.icon}
            {tool.name}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentTool.icon}
              {currentTool.name}
              <Badge variant="secondary" className="ml-auto">Powered by Nexus</Badge>
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
                className="min-h-[100px]"
              />
            </div>

            {currentTool.showCodeInput && (
              <div>
                <label className="text-sm font-medium mb-2 block">Code (optional)</label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your code here..."
                  className="font-mono text-sm min-h-[120px] bg-muted/30"
                />
              </div>
            )}

            {currentTool.showErrorInput && (
              <div>
                <label className="text-sm font-medium mb-2 block">Error Message (optional)</label>
                <Textarea
                  value={error}
                  onChange={(e) => setError(e.target.value)}
                  placeholder="Paste error message or stack trace..."
                  className="font-mono text-sm min-h-[80px] bg-destructive/5"
                />
              </div>
            )}

            <Button onClick={runTool} disabled={isLoading} className="w-full">
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
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI Response
              </CardTitle>
              {responseTime && (
                <Badge variant="outline">{responseTime}ms</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <ScrollArea className="h-[400px] rounded-lg border p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyResult} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Response
                  </Button>
                  <Button variant="outline" onClick={() => setResult('')}>
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-center">
                  {isLoading ? 'Nexus is analyzing your request...' : 'Run a tool to see AI-powered results'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
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
  const responses: Record<ToolType, string> = {
    code_assistant: `## SDK Code Pattern

Based on: "${context.slice(0, 100)}..."

\`\`\`typescript
import { substrate } from '@cmpsbl/substrate';

const client = substrate.init({
  apiKey: process.env.CMPSBL_API_KEY
});

// Your implementation
const result = await client.brain.remember({
  content: "Your content here",
  importance: 0.8
});
\`\`\`

**Next Steps:**
1. Replace placeholder values
2. Add error handling
3. Test in sandbox environment`,

    debugger: `## Debug Analysis

**Issue Context:** ${context.slice(0, 100)}...

**Likely Causes:**
1. API key validation failure
2. Rate limit exceeded
3. Network connectivity issue

**Suggested Fix:**
\`\`\`typescript
try {
  const result = await client.brain.recall(query);
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    await sleep(1000);
    return retry();
  }
  throw error;
}
\`\`\``,

    doc_generator: `## Generated Documentation

\`\`\`typescript
/**
 * ${context.slice(0, 50)}...
 * 
 * @description Substrate SDK integration
 * @param options - Configuration object
 * @returns Promise<Result>
 * @throws {SubstrateError} On operation failure
 * 
 * @example
 * const result = await operation(options);
 */
\`\`\``,

    query_builder: `## Generated SDK Code

Request: "${context}"

\`\`\`typescript
import { substrate } from '@cmpsbl/substrate';

const client = substrate.init({ apiKey: process.env.CMPSBL_API_KEY });

// ${context}
const result = await client.brain.recall({
  query: "${context}",
  limit: 10
});

console.log(\`Found \${result.length} memories\`);
\`\`\``,

    performance_advisor: `## Performance Analysis

**Analyzed Code:** ${code ? 'Provided' : 'Not provided'}

**Recommendations:**

1. **Batch Operations** - Group multiple memory calls
   - Impact: 40% latency reduction

2. **Local Caching** - Cache frequent queries
   - Impact: 60% fewer API calls

3. **Importance Tuning** - Adjust scores for retention
   - Impact: 30% storage optimization

4. **Context Windows** - Use semantic chunking
   - Impact: 25% token savings`
  };

  return responses[tool] || 'Tool response not available offline.';
}

export default AIToolsSuite;
