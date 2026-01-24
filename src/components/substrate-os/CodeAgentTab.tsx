/**
 * CodeAgent Tab — Self-Evolution Coding Interface
 * Provides chat interface to the Substrate Coder + Sandbox validation preview
 */

import { useState, useRef, useEffect } from 'react';
import { 
  Code, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, 
  Terminal, Zap, Bot, FileCode, Play, RefreshCw, Copy, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    provider?: string;
    model?: string;
    latency_ms?: number;
    generated_code?: string;
    file_path?: string;
    confidence?: number;
    validation?: {
      valid: boolean;
      issues: string[];
    };
  };
}

interface CoderStatus {
  version: string;
  free_tier_router: string;
  learned_patterns: number;
  generated_today: number;
  rate_limits: Record<string, string>;
}

interface SandboxStatus {
  version: string;
  mode: string;
  capabilities: string[];
  status: string;
}

export function CodeAgentTab({ enabled }: { enabled: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coderStatus, setCoderStatus] = useState<CoderStatus | null>(null);
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchStatus() {
    try {
      const [coderRes, sandboxRes] = await Promise.all([
        supabase.functions.invoke('pf-substrate-coder', { body: { action: 'status' } }),
        supabase.functions.invoke('pf-substrate-sandbox', { body: { action: 'status' } }),
      ]);

      if (coderRes.data?.success) setCoderStatus(coderRes.data);
      if (sandboxRes.data?.success) setSandboxStatus(sandboxRes.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Parse the request to determine action
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('status') || lowerInput.includes('health')) {
        // Status check
        await fetchStatus();
        addAgentMessage(`**Coder Status**\n- Version: ${coderStatus?.version || 'unknown'}\n- Patterns Learned: ${coderStatus?.learned_patterns || 0}\n- Generated Today: ${coderStatus?.generated_today || 0}\n\n**Sandbox Status**\n- Version: ${sandboxStatus?.version || 'unknown'}\n- Mode: ${sandboxStatus?.mode || 'unknown'}\n- Status: ${sandboxStatus?.status || 'unknown'}`);
      } else if (lowerInput.includes('validate') && currentCode) {
        // Validate current code
        const result = await validateCode(currentCode);
        setValidationResult(result);
        addAgentMessage(result.valid 
          ? '✅ **Validation Passed**\nThe code passes all static analysis checks.' 
          : `❌ **Validation Failed**\nIssues found:\n${result.issues.map(i => `- ${i}`).join('\n')}`);
      } else {
        // Generate code
        const improvement = parseImprovementRequest(input);
        const response = await supabase.functions.invoke('pf-substrate-coder', {
          body: {
            action: 'generate',
            improvement,
          },
        });

        if (response.data?.success) {
          const generated = response.data.generated;
          setCurrentCode(generated.code);
          
          // Auto-validate
          const validation = await validateCode(generated.code);
          setValidationResult(validation);

          addAgentMessage(
            `**Generated Code**\n\`\`\`typescript\n${generated.code.substring(0, 500)}${generated.code.length > 500 ? '\n// ... (truncated)' : ''}\n\`\`\`\n\n` +
            `- **File:** \`${generated.file_path}\`\n` +
            `- **Operation:** ${generated.operation}\n` +
            `- **Confidence:** ${(generated.confidence * 100).toFixed(0)}%\n` +
            `- **Provider:** ${response.data.provider}\n` +
            `- **Latency:** ${response.data.latency_ms}ms\n\n` +
            (validation.valid ? '✅ Passes validation' : `⚠️ Validation issues: ${validation.issues.join(', ')}`),
            {
              provider: response.data.provider,
              model: response.data.model,
              latency_ms: response.data.latency_ms,
              generated_code: generated.code,
              file_path: generated.file_path,
              confidence: generated.confidence,
              validation,
            }
          );

          setActiveTab('preview');
        } else {
          addAgentMessage(`❌ **Generation Failed**\n${response.data?.error || 'Unknown error'}`, undefined, 'system');
        }
      }
    } catch (error) {
      console.error('CodeAgent error:', error);
      addAgentMessage(`❌ **Error**\n${error instanceof Error ? error.message : 'Unknown error'}`, undefined, 'system');
    } finally {
      setIsLoading(false);
    }
  }

  function addAgentMessage(content: string, metadata?: Message['metadata'], role: 'agent' | 'system' = 'agent') {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      metadata,
    }]);
  }

  async function validateCode(code: string): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const response = await supabase.functions.invoke('pf-substrate-sandbox', {
        body: {
          action: 'validate',
          code,
          language: 'typescript',
        },
      });

      return {
        valid: response.data?.success ?? false,
        issues: response.data?.issues || [],
      };
    } catch {
      return { valid: false, issues: ['Validation service unavailable'] };
    }
  }

  function parseImprovementRequest(input: string): { module: string; change_type: string; description: string } {
    // Simple parsing - extract module and change type from input
    const modules = ['brain', 'defense', 'nexus', 'vision', 'dream', 'system', 'core', 'ripple', 'access', 'decode', 'modernizer', 'integration'];
    const foundModule = modules.find(m => input.toLowerCase().includes(m)) || 'system';
    
    const changeTypes = ['edge_function', 'config_update', 'prompt_refinement', 'rate_limit', 'rls_policy'];
    const foundType = changeTypes.find(t => input.toLowerCase().includes(t.replace('_', ' '))) || 'edge_function';

    return {
      module: foundModule,
      change_type: foundType,
      description: input,
    };
  }

  async function handleCopyCode() {
    if (!currentCode) return;
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRunSandbox() {
    if (!currentCode) return;
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('pf-substrate-sandbox', {
        body: {
          action: 'execute',
          code: currentCode,
          language: 'typescript',
        },
      });

      if (response.data?.success) {
        toast.success('Code validated successfully');
        addAgentMessage(`✅ **Sandbox Validation**\n${response.data.output}\n\nComplexity: ${response.data.analysis?.complexity || 'unknown'}`);
      } else {
        toast.error('Validation failed');
        addAgentMessage(`❌ **Sandbox Validation Failed**\n${response.data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Sandbox error');
    } finally {
      setIsLoading(false);
    }
  }

  if (!enabled) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Card className="border-dashed border-amber-500/30 bg-white/5">
          <CardContent className="py-12 text-center">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">CodeAgent requires Operator privileges</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/40 flex items-center justify-center">
            <Code className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              CodeAgent
              <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-400 bg-violet-500/10">
                v{coderStatus?.version || '1.1.0'}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              self-evolution coding • {coderStatus?.learned_patterns || 0} patterns learned
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
            <Zap className="w-3 h-3 mr-1" />
            Free-Tier Router {coderStatus?.free_tier_router || ''}
          </Badge>
          <Button variant="ghost" size="icon" onClick={fetchStatus} className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="border-violet-500/20 bg-white/5">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Patterns</p>
            <p className="text-2xl font-bold text-violet-400">{coderStatus?.learned_patterns || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-cyan-500/20 bg-white/5">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Generated Today</p>
            <p className="text-2xl font-bold text-cyan-400">{coderStatus?.generated_today || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-white/5">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sandbox</p>
            <p className="text-sm font-mono text-emerald-400 flex items-center gap-1">
              {sandboxStatus?.status === 'ready' ? (
                <><CheckCircle2 className="w-3 h-3" /> Ready</>
              ) : (
                <><AlertTriangle className="w-3 h-3" /> Offline</>
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-white/5">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mode</p>
            <p className="text-sm font-mono text-amber-400">{sandboxStatus?.mode || 'validation'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chat Panel */}
        <Card className="border-violet-500/20 bg-black/40 backdrop-blur-xl">
          <CardHeader className="border-b border-white/10 py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-400" />
              Agent Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[500px]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="space-y-3">
                    <Bot className="w-10 h-10 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Describe what you want to build or improve.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Add rate limiting to Brain', 'Create a health check function', 'Improve error handling'].map(example => (
                        <button
                          key={example}
                          onClick={() => setInput(example)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded-lg p-3 text-sm",
                        msg.role === 'user' 
                          ? "bg-violet-500/10 border border-violet-500/20 ml-8" 
                          : msg.role === 'system'
                          ? "bg-amber-500/10 border border-amber-500/20"
                          : "bg-white/5 border border-white/10 mr-8"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <Terminal className="w-3 h-3 text-violet-400" />
                        ) : msg.role === 'system' ? (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Bot className="w-3 h-3 text-cyan-400" />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'CodeAgent'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-foreground/90">{msg.content}</pre>
                      </div>
                      {msg.metadata?.provider && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="h-4 text-[9px]">{msg.metadata.provider}</Badge>
                          <span>{msg.metadata.latency_ms}ms</span>
                          {msg.metadata.confidence && (
                            <span>{(msg.metadata.confidence * 100).toFixed(0)}% conf</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe a code change or improvement..."
                  className="min-h-[60px] resize-none bg-white/5 border-white/10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-violet-500/20 border border-violet-500/40 text-violet-400 hover:bg-violet-500/30"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-xl">
          <CardHeader className="border-b border-white/10 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Code Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  disabled={!currentCode}
                  className="h-7 px-2 text-xs"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRunSandbox}
                  disabled={!currentCode || isLoading}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <Play className="w-3 h-3" />
                  Validate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[500px] flex flex-col">
            {/* Validation Status */}
            {validationResult && (
              <div className={cn(
                "px-4 py-2 border-b flex items-center gap-2 text-xs",
                validationResult.valid 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}>
                {validationResult.valid ? (
                  <><CheckCircle2 className="w-3 h-3" /> Validation passed</>
                ) : (
                  <><XCircle className="w-3 h-3" /> {validationResult.issues.length} issues found</>
                )}
              </div>
            )}

            {/* Code Display */}
            <ScrollArea className="flex-1">
              {currentCode ? (
                <pre className="p-4 text-xs font-mono text-foreground/90 whitespace-pre-wrap">
                  <code>{currentCode}</code>
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <div className="space-y-3">
                    <FileCode className="w-10 h-10 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Generated code will appear here
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      The sandbox validates code before it can be applied
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Issues List */}
            {validationResult && !validationResult.valid && validationResult.issues.length > 0 && (
              <div className="border-t border-white/10 p-3 bg-red-500/5">
                <p className="text-xs font-medium text-red-400 mb-2">Issues:</p>
                <ul className="space-y-1">
                  {validationResult.issues.map((issue, idx) => (
                    <li key={idx} className="text-xs text-red-300/80 flex items-start gap-2">
                      <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Notice */}
      <Card className="mt-6 border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-400 mb-1">Brain Learning Active</p>
              <p className="text-xs text-muted-foreground">
                Every LLM call through the Free-Tier Router is captured and stored in Brain memory. 
                Successful code patterns are reinforced; failed patterns are deprioritized. 
                The CodeAgent learns from each interaction to improve future code generation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
