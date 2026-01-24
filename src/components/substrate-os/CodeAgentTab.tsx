/**
 * CodeAgent Tab — Self-Evolution Coding Interface
 * v4.0.0 — With discussion mode, approval gates, and file context reading
 * Provides chat interface to the Substrate Coder + Sandbox validation preview
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Code, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, 
  Terminal, Zap, Bot, FileCode, Play, RefreshCw, Copy, Check,
  Heart, ShieldCheck, Activity, Eye, Brain, Cog, Rocket,
  MessageSquare, HelpCircle, FileText, Shield, Undo2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  generateCode, 
  validateCode as validateCodeWithResilience, 
  executeInSandbox,
  getCodeAgentHealth,
  resetService,
  rollbackLastChange,
  learnFromOutcome,
  type CodeResult 
} from '@/lib/codeagent/executor';
import { getHealingActions, getOverallHealth } from '@/lib/codeagent/circuit-breaker';
import { 
  executeWorkflow, 
  getWorkflowProgress, 
  getWorkflowState, 
  resetWorkflow,
  type WorkflowStage,
  type WorkflowExecutionResult
} from '@/lib/codeagent/workflow';
import { getShadowModeStatus } from '@/lib/codeagent/shadow-mode';
import {
  startDiscussion,
  answerQuestion,
  approveGate,
  getDiscussionState,
  resetDiscussion,
  type ClarifyingQuestion,
  type ImpactPreview,
  type ApprovalGate,
  type DiscussionStep
} from '@/lib/codeagent/discussion';
import { gatherContextForChange, summarizeContext } from '@/lib/codeagent/file-context';
import { getRecentChanges, type ChangeRecord } from '@/lib/codeagent/rollback';

interface Message {
  id: string;
  role: 'user' | 'agent' | 'system' | 'question' | 'preview' | 'approval';
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
    question?: ClarifyingQuestion;
    preview?: ImpactPreview;
    gate?: ApprovalGate;
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
  const [activeTab, setActiveTab] = useState<'chat' | 'preview' | 'health' | 'history'>('chat');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [agentHealth, setAgentHealth] = useState(getCodeAgentHealth());
  const [overallHealth, setOverallHealth] = useState(getOverallHealth());
  const [workflowProgress, setWorkflowProgress] = useState<{
    stage: WorkflowStage;
    stageProgress: number;
    overallProgress: number;
    completedStages: WorkflowStage[];
  } | null>(null);
  const [shadowMode, setShadowMode] = useState(getShadowModeStatus());
  const [discussionMode, setDiscussionMode] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<ClarifyingQuestion | null>(null);
  const [pendingApproval, setPendingApproval] = useState<ApprovalGate | null>(null);
  const [changeHistory, setChangeHistory] = useState<ChangeRecord[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
    refreshHealth();
    setShadowMode(getShadowModeStatus());
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Refresh health periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshHealth();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshHealth = useCallback(() => {
    setAgentHealth(getCodeAgentHealth());
    setOverallHealth(getOverallHealth());
  }, []);

  async function fetchStatus() {
    try {
      const [coderRes, sandboxRes] = await Promise.all([
        supabase.functions.invoke('pf-substrate-coder', { body: { action: 'status' } }).catch(() => ({ data: null })),
        supabase.functions.invoke('pf-substrate-sandbox', { body: { action: 'status' } }).catch(() => ({ data: null })),
      ]);

      if (coderRes.data?.success) setCoderStatus(coderRes.data);
      if (sandboxRes.data?.success) setSandboxStatus(sandboxRes.data);
      
      refreshHealth();
    } catch (error) {
      console.error('Failed to fetch status:', error);
      // Don't fail - we have fallbacks
      toast.error('Status fetch failed', { description: 'Using cached status' });
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
      
      // Command: status/health check
      if (lowerInput.includes('status') || lowerInput.includes('health')) {
        await fetchStatus();
        const health = getCodeAgentHealth();
        const overall = getOverallHealth();
        
        addAgentMessage(
          `**🔧 CodeAgent Health Report**\n\n` +
          `**Services**\n` +
          `- Coder: ${health.coder.state === 'closed' ? '✅' : '⚠️'} ${health.coder.healthScore}% (${health.coder.state})\n` +
          `- Sandbox: ${health.sandbox.state === 'closed' ? '✅' : '⚠️'} ${health.sandbox.healthScore}% (${health.sandbox.state})\n` +
          `- Brain: ${health.brain.state === 'closed' ? '✅' : '⚠️'} ${health.brain.healthScore}% (${health.brain.state})\n\n` +
          `**Overall**: ${overall.averageScore}% — ${overall.healthy} healthy, ${overall.degraded} degraded, ${overall.down} down\n\n` +
          `**Coder Details**\n` +
          `- Version: ${coderStatus?.version || 'unknown'}\n` +
          `- Patterns Learned: ${coderStatus?.learned_patterns || 0}\n` +
          `- Generated Today: ${coderStatus?.generated_today || 0}`
        );
        return;
      } 
      
      // Command: reset circuit
      if (lowerInput.includes('reset') && (lowerInput.includes('circuit') || lowerInput.includes('coder') || lowerInput.includes('sandbox'))) {
        if (lowerInput.includes('coder')) {
          resetService('coder');
          toast.success('Coder circuit reset');
          addAgentMessage('🔄 **Circuit Reset**\nCoder service circuit has been manually reset.');
        } else if (lowerInput.includes('sandbox')) {
          resetService('sandbox');
          toast.success('Sandbox circuit reset');
          addAgentMessage('🔄 **Circuit Reset**\nSandbox service circuit has been manually reset.');
        } else {
          resetService('coder');
          resetService('sandbox');
          resetService('brain');
          toast.success('All circuits reset');
          addAgentMessage('🔄 **All Circuits Reset**\nAll service circuits have been manually reset.');
        }
        refreshHealth();
        return;
      }
      
      // Command: rollback
      if (lowerInput.includes('rollback') || lowerInput.includes('undo')) {
        const result = await rollbackLastChange();
        addAgentMessage(
          result.success 
            ? `✅ **Rollback Successful**\n${result.message}`
            : `❌ **Rollback Failed**\n${result.message}`,
          undefined,
          result.success ? 'agent' : 'system'
        );
        return;
      }
      
      // Command: validate current code
      if (lowerInput.includes('validate') && currentCode) {
        const result = await validateCodeWithResilience(currentCode);
        setValidationResult({ valid: result.valid, issues: result.issues });
        addAgentMessage(result.valid 
          ? '✅ **Validation Passed**\nThe code passes all static analysis checks.' 
          : `❌ **Validation Failed**\nIssues found:\n${result.issues.map(i => `- ${i}`).join('\n')}`);
        return;
      }

      // Command: show history
      if (lowerInput.includes('history') || lowerInput.includes('changes')) {
        const history = getRecentChanges(10);
        setChangeHistory(history);
        setActiveTab('history');
        addAgentMessage(
          `📜 **Change History**\n\n` +
          `Found ${history.length} recent changes. Switch to the History tab to view details.`
        );
        return;
      }

      // Handle discussion mode responses
      if (discussionMode) {
        if (pendingQuestion) {
          // Answer the pending question
          const step = answerQuestion(pendingQuestion.id, input);
          handleDiscussionStep(step);
          return;
        }
        if (pendingApproval) {
          // Handle approval response
          if (['yes', 'approve', 'proceed', 'ok', 'y'].includes(lowerInput.trim())) {
            const step = approveGate(pendingApproval.id);
            handleDiscussionStep(step);
          } else {
            resetDiscussion();
            setDiscussionMode(false);
            setPendingQuestion(null);
            setPendingApproval(null);
            addAgentMessage('❌ **Change cancelled.** Let me know when you want to try again.');
          }
          return;
        }
      }
      
      // Default: Start discussion mode for clarity before coding
      setDiscussionMode(true);
      const step = startDiscussion(input);
      handleDiscussionStep(step);
      
    } catch (error) {
      console.error('CodeAgent error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      addAgentMessage(
        `❌ **Error**\n${errorMessage}\n\n` +
        `💡 **Recovery Options:**\n` +
        `- Type "status" to check service health\n` +
        `- Type "reset circuit" to reset all circuits\n` +
        `- Wait 60 seconds for automatic recovery`,
        undefined,
        'system'
      );
      
      refreshHealth();
    } finally {
      setIsLoading(false);
    }
  }

  function handleDiscussionStep(step: DiscussionStep) {
    setIsLoading(false);
    
    switch (step.type) {
      case 'question':
        setPendingQuestion(step.content as ClarifyingQuestion);
        setPendingApproval(null);
        addAgentMessage(step.message, { question: step.content as ClarifyingQuestion }, 'question');
        break;
        
      case 'preview':
        setPendingQuestion(null);
        const preview = step.content as ImpactPreview;
        addAgentMessage(step.message, { preview }, 'preview');
        // Auto-approve for low complexity
        if (preview.estimatedComplexity === 'low') {
          const state = getDiscussionState();
          if (state.approvalGates.length > 0) {
            const nextStep = approveGate(state.approvalGates[0].id);
            handleDiscussionStep(nextStep);
          }
        }
        break;
        
      case 'approval':
        setPendingQuestion(null);
        setPendingApproval(step.content as ApprovalGate);
        addAgentMessage(step.message, { gate: step.content as ApprovalGate }, 'approval');
        break;
        
      case 'proceed':
        setPendingQuestion(null);
        setPendingApproval(null);
        setDiscussionMode(false);
        resetDiscussion();
        
        // Now execute the workflow with gathered context
        addAgentMessage(step.message);
        executeCodeGeneration();
        break;
    }
  }

  async function executeCodeGeneration() {
    setIsLoading(true);
    const state = getDiscussionState();
    const ctx = state.context as any;
    
    const module = ctx.module || ctx.analysis?.module || 'system';
    const changeType = ctx.changeType || ctx.analysis?.changeType || 'edge_function';
    const description = ctx.additionalDetails 
      ? `${ctx.originalInput}. ${ctx.additionalDetails}`
      : ctx.originalInput || '';

    // Gather file context first (Read before Write)
    const fileContexts = gatherContextForChange(module, changeType);
    const contextSummary = summarizeContext(fileContexts);
    
    addAgentMessage(
      `📖 **Reading File Context**\n\n${contextSummary}\n\n🔄 Starting code generation...`,
      undefined,
      'system'
    );
      
      // Start workflow progress tracking
      const progressInterval = setInterval(() => {
        const progress = getWorkflowProgress();
        setWorkflowProgress(progress);
      }, 100);
      
      try {
        const result: WorkflowExecutionResult = await executeWorkflow({
          description,
          module,
          changeType,
        });
        
        clearInterval(progressInterval);
        setWorkflowProgress(null);
        
        // Remove the processing message
        setMessages(prev => prev.slice(0, -1));

        if (result.success && result.code) {
          setCurrentCode(result.code);
          setValidationResult(result.validation ? { 
            valid: result.validation.passed, 
            issues: result.validation.issues 
          } : null);
          setChangeHistory(getRecentChanges(10));

          const confidencePercent = result.confidence ? (result.confidence * 100).toFixed(0) : 'N/A';
          const validationStatus = result.validation?.passed 
            ? '✅ Validation passed — ready to apply' 
            : `⚠️ Validation issues: ${result.validation?.issues?.join(', ') || 'Unknown'}`;

          // Format completed stages
          const stagesFormatted = result.stagesCompleted.map(s => {
            const icons: Record<string, string> = {
              reading: '📖',
              thinking: '🧠',
              writing: '✍️',
              confirming: '✅',
              submitting: '🚀'
            };
            return `${icons[s] || '•'} ${s.charAt(0).toUpperCase() + s.slice(1)}`;
          }).join(' → ');

          addAgentMessage(
            `**✅ Code Generated Successfully**\n\n` +
            `**Workflow:** ${stagesFormatted}\n\n` +
            `\`\`\`typescript\n${result.code.substring(0, 600)}${result.code.length > 600 ? '\n// ... (truncated)' : ''}\n\`\`\`\n\n` +
            `---\n` +
            `📁 **File:** \`${result.filePath || 'N/A'}\`\n` +
            `🔧 **Operation:** ${result.operation || 'create'}\n` +
            `📊 **Confidence:** ${confidencePercent}%\n` +
            `⏱️ **Duration:** ${result.duration}ms\n` +
            (result.rollbackId ? `🔄 **Rollback ID:** \`${result.rollbackId.slice(0, 8)}...\`\n` : '') +
            `\n${validationStatus}\n\n` +
            `💡 *Type "apply" to deploy this change, or "rollback" to undo.*`,
            {
              provider: 'workflow-engine',
              model: 'shadow-v2',
              latency_ms: result.duration,
              generated_code: result.code,
              file_path: result.filePath,
              confidence: result.confidence,
              validation: result.validation ? { valid: result.validation.passed, issues: result.validation.issues } : undefined,
            }
          );

          setActiveTab('preview');
          
          // Learn from successful generation
          if (result.code && result.validation?.passed) {
            learnFromOutcome(result.code, 'success').catch(console.error);
          }
          
          toast.success('Code generated successfully', {
            description: `${result.stagesCompleted.length} workflow stages completed`
          });
        } else {
          // Handle failure with detailed diagnostics
          addAgentMessage(
            `❌ **Workflow Failed at Stage: ${result.stage}**\n\n` +
            `**Error:** ${result.message}\n\n` +
            `**Stages Completed:** ${result.stagesCompleted.join(' → ') || 'None'}\n\n` +
            `**Duration:** ${result.duration}ms\n\n` +
            `💡 **Recovery Options:**\n` +
            `- Type "status" to check service health\n` +
            `- Type "reset circuit" to reset all circuits\n` +
            `- Try a simpler request first`,
            undefined,
            'system'
          );
          
          toast.error('Code generation failed', { description: result.message });
          refreshHealth();
        }
      } catch (error) {
        clearInterval(progressInterval);
        setWorkflowProgress(null);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addAgentMessage(
          `❌ **Error**\n${errorMessage}\n\n` +
          `💡 **Recovery Options:**\n` +
          `- Type "status" to check service health`,
          undefined,
          'system'
        );
      } finally {
        setIsLoading(false);
      }
  }

  function addAgentMessage(content: string, metadata?: Message['metadata'], role: Message['role'] = 'agent') {
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
                v2.0.0
              </Badge>
              {discussionMode && (
                <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Discussion
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              discuss → read → think → write → confirm → submit
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
                          : msg.role === 'question'
                          ? "bg-cyan-500/10 border border-cyan-500/20"
                          : msg.role === 'preview'
                          ? "bg-blue-500/10 border border-blue-500/20"
                          : msg.role === 'approval'
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-white/5 border border-white/10 mr-8"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <Terminal className="w-3 h-3 text-violet-400" />
                        ) : msg.role === 'system' ? (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        ) : msg.role === 'question' ? (
                          <HelpCircle className="w-3 h-3 text-cyan-400" />
                        ) : msg.role === 'preview' ? (
                          <FileText className="w-3 h-3 text-blue-400" />
                        ) : msg.role === 'approval' ? (
                          <Shield className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Bot className="w-3 h-3 text-cyan-400" />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {msg.role === 'user' ? 'You' : 
                           msg.role === 'system' ? 'System' : 
                           msg.role === 'question' ? 'Clarification' :
                           msg.role === 'preview' ? 'Impact Preview' :
                           msg.role === 'approval' ? 'Approval Required' :
                           'CodeAgent'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-foreground/90">{msg.content}</pre>
                      </div>
                      
                      {/* Question options UI */}
                      {msg.role === 'question' && msg.metadata?.question?.options && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.metadata.question.options.map((opt) => (
                            <Button
                              key={opt}
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 border-cyan-500/30 hover:bg-cyan-500/20"
                              onClick={() => {
                                setInput(opt);
                              }}
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Approval buttons UI */}
                      {msg.role === 'approval' && msg.metadata?.gate && !msg.metadata.gate.approved && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                            onClick={() => setInput('yes')}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                            onClick={() => setInput('no')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      
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

      {/* Change History Panel */}
      {changeHistory.length > 0 && (
        <Card className="mt-6 border-blue-500/20 bg-black/40 backdrop-blur-xl">
          <CardHeader className="border-b border-white/10 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Undo2 className="w-4 h-4 text-blue-400" />
                Change History — Rollback UI
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChangeHistory(getRecentChanges(10))}
                className="h-7 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[200px]">
              <div className="divide-y divide-white/5">
                {changeHistory.map((change) => (
                  <div key={change.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px]",
                          change.status === 'applied' ? "border-emerald-500/40 text-emerald-400" :
                          change.status === 'rolled_back' ? "border-amber-500/40 text-amber-400" :
                          change.status === 'failed' ? "border-red-500/40 text-red-400" :
                          "border-blue-500/40 text-blue-400"
                        )}
                      >
                        {change.status}
                      </Badge>
                      <div>
                        <p className="text-xs font-medium">{change.description.slice(0, 50)}...</p>
                        <p className="text-[10px] text-muted-foreground">
                          {change.module} • {change.changeType} • {change.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {change.status === 'applied' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-amber-400 hover:bg-amber-500/20"
                        onClick={async () => {
                          const result = await rollbackLastChange();
                          if (result.success) {
                            toast.success('Rolled back successfully');
                            setChangeHistory(getRecentChanges(10));
                          } else {
                            toast.error(result.message);
                          }
                        }}
                      >
                        <Undo2 className="w-3 h-3 mr-1" />
                        Rollback
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Learning Notice */}
      <Card className="mt-6 border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-400 mb-1">v2.0 — Discussion-First Workflow</p>
              <p className="text-xs text-muted-foreground">
                CodeAgent now asks clarifying questions before coding, shows impact previews,
                reads file context, and requires approval for complex changes. Each successful
                pattern is reinforced in Brain memory for continuous improvement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
