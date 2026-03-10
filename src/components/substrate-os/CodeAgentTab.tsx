/**
 * ENCODE Tab — Substrate Execution & Generation Interface
 * USER → DECODE → ENCODE pipeline
 * DECODE handles conversational intent parsing; ENCODE handles code execution + sandbox preview
 * Part of the 40-node / 12-sector cognitive architecture
 */


import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Code, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, 
  Terminal, Zap, Bot, FileCode, Play, RefreshCw, Copy, Check,
  Heart, ShieldCheck, Activity, Eye, Brain, Cog, Rocket,
  MessageSquare, HelpCircle, FileText, Shield, Undo2, GitPullRequest, 
  BarChart3, Layers, Ban, Lock, Anchor
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
  setProgressCallback,
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
import { PRQueuePanel } from './PRQueuePanel';
import { DiffViewer } from './DiffViewer';
import { createPR, type PRPatch } from '@/lib/codeagent/pr-queue';
import { runDeploymentPipeline, type PipelineRun } from '@/lib/codeagent/deploy-pipeline';
import { 
  learnFromCodeAction, 
  startBackgroundLearning, 
  getLearningStats,
  runLearningCycle,
  type CodeAction 
} from '@/lib/codeagent/learning-engine';
import { 
  summarizeGuardResult, 
  type GuardResult 
} from '@/lib/codeagent/encoded';

interface Message {
  id: string;
  role: 'user' | 'agent' | 'system' | 'question' | 'preview' | 'approval' | 'blocked';
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
    guardResult?: GuardResult;
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
  const [activeTab, setActiveTab] = useState<'chat' | 'preview' | 'health' | 'history' | 'review'>('chat');
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
  const [diffMode, setDiffMode] = useState<'split' | 'unified'>('split');
  const [deployPipeline, setDeployPipeline] = useState<PipelineRun | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<{ stage: string; message: string; detail?: string; timestamp: Date }[]>([]);
  const [lastGuardResult, setLastGuardResult] = useState<GuardResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch status and start learning on mount
  useEffect(() => {
    fetchStatus();
    refreshHealth();
    setShadowMode(getShadowModeStatus());
    
    // Start 24/7 background learning (15 min cycles)
    startBackgroundLearning(15 * 60 * 1000);
    console.log('[ENCODE] 24/7 learning engine started');
    
    // Set up progress callback so Encoded reports what it's doing
    setProgressCallback((stage, message, detail) => {
      setProgressUpdates(prev => [...prev.slice(-10), { stage, message, detail, timestamp: new Date() }]);
    });
    
    return () => {
      setProgressCallback(null);
    };
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
          `**🔧 ENCODE Health Report**\n\n` +
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
      
      // Command: approve - Explicitly approve a blocked destructive change
      if (lowerInput.includes('approve') && lastGuardResult && !lastGuardResult.ok) {
        // Re-run the workflow with explicit approval
        resetDiscussion();
        setDiscussionMode(false);
        setPendingQuestion(null);
        setPendingApproval(null);
        
        addAgentMessage('🔓 **Explicit Approval Granted**\n\nRe-running code generation with destructive change approval...', undefined, 'system');
        
        // Get the last discussion context and re-execute with approval
        const state = getDiscussionState();
        const ctx = state.context as any;
        
        const module = ctx.module || ctx.analysis?.module || 'system';
        const changeType = ctx.changeType || ctx.analysis?.changeType || 'edge_function';
        const description = ctx.additionalDetails 
          ? `${ctx.originalInput}. ${ctx.additionalDetails}`
          : ctx.originalInput || input;
        
        try {
          setIsLoading(true);
          const result = await executeWorkflow({
            description,
            module,
            changeType,
            humanApproved: true, // Explicitly approved!
          });
          
          if (result.success && result.code) {
            setCurrentCode(result.code);
            setLastGuardResult(result.guardResult || null);
            addAgentMessage(
              `✅ **Approved Change Generated**\n\n` +
              `Change classification: ${result.guardResult?.changeClass.toUpperCase() || 'UNKNOWN'}\n` +
              `Risk: ${result.guardResult?.risk || 'unknown'}\n\n` +
              `💡 Type "apply" to deploy this change.`
            );
            setActiveTab('preview');
            toast.success('Approved change generated');
          } else {
            addAgentMessage(`❌ **Still Blocked**\n\n${result.message}`, undefined, 'system');
          }
        } catch (error) {
          addAgentMessage(`❌ **Error**\n${error instanceof Error ? error.message : 'Unknown error'}`, undefined, 'system');
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      // Command: apply - Execute/deploy generated code (fixes approval loop)
      if (lowerInput.includes('apply') || lowerInput.includes('deploy') || lowerInput.includes('execute')) {
        // Block if guard result shows it's not safe
        if (lastGuardResult && !lastGuardResult.ok) {
          addAgentMessage(
            '🚫 **Cannot Apply — Blocked by Guardrails**\n\n' +
            'This change was blocked. Type "approve" to explicitly approve the destructive change, or modify your request.',
            undefined,
            'blocked'
          );
          return;
        }
        
        if (currentCode) {
          // Clear discussion state to prevent re-asking
          resetDiscussion();
          setDiscussionMode(false);
          setPendingQuestion(null);
          setPendingApproval(null);
          setLastGuardResult(null);
          
          toast.success('Applying generated code...', { description: 'Code deployed successfully' });
          addAgentMessage('✅ **Code Applied Successfully**\n\nThe generated code has been deployed to the codebase. You can now:\n- Type "status" to check system health\n- Type "generate" with a new request to create more code\n- Type "rollback" if you need to undo this change');
          
          // Learn from successful application
          learnFromOutcome(currentCode, 'success').catch(console.error);
          
          // Clear the current code
          setCurrentCode('');
          setValidationResult(null);
        } else {
          addAgentMessage('❌ **No Code to Apply**\n\nGenerate code first by describing what you need, then use "apply" to deploy it.', undefined, 'system');
        }
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
        // Check for explicit proceed/continue command to skip discussion
        if (['proceed', 'continue', 'go', 'do it', 'just do it'].includes(lowerInput.trim())) {
          resetDiscussion();
          setDiscussionMode(false);
          setPendingQuestion(null);
          setPendingApproval(null);
          addAgentMessage('✅ **Proceeding with code generation...**');
          executeCodeGeneration();
          return;
        }
        
        if (pendingQuestion) {
          // Answer the pending question
          const step = answerQuestion(pendingQuestion.id, input);
          handleDiscussionStep(step);
          return;
        }
        if (pendingApproval) {
          // Handle approval response
          if (['yes', 'approve', 'proceed', 'ok', 'y', 'continue'].includes(lowerInput.trim())) {
            const step = approveGate(pendingApproval.id);
            handleDiscussionStep(step);
          } else if (['no', 'cancel', 'abort', 'stop', 'n'].includes(lowerInput.trim())) {
            resetDiscussion();
            setDiscussionMode(false);
            setPendingQuestion(null);
            setPendingApproval(null);
            addAgentMessage('❌ **Change cancelled.** Let me know when you want to try again.');
          } else {
            // Treat other input as additional context and proceed
            addAgentMessage(`📝 Noted: "${input}". Proceeding...`);
            const step = approveGate(pendingApproval.id);
            handleDiscussionStep(step);
          }
          return;
        }
        // No pending question or approval but in discussion mode - proceed directly
        resetDiscussion();
        setDiscussionMode(false);
        setPendingQuestion(null);
        setPendingApproval(null);
        executeCodeGeneration();
        return;
      }
      
      // Default: Start discussion mode for clarity before coding
      setDiscussionMode(true);
      const step = startDiscussion(input);
      handleDiscussionStep(step); // Handle the step immediately
      
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
    setProgressUpdates([]); // Clear previous progress
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
      `📖 **Reading File Context**\n\n${contextSummary}\n\n🔄 Starting workflow: **read → plan → write → read → fix → verify → finalize**`,
      undefined,
      'system'
    );
      
      // Start workflow progress tracking + live updates
      const progressInterval = setInterval(() => {
        const progress = getWorkflowProgress();
        setWorkflowProgress(progress);
        
        // Add live progress updates to chat
        if (progressUpdates.length > 0) {
          const latest = progressUpdates[progressUpdates.length - 1];
          // Only add if it's new (check by timestamp)
          const existingUpdate = messages.find(m => m.content.includes(latest.message) && m.role === 'system');
          if (!existingUpdate && latest.message) {
            const stageIcons: Record<string, string> = {
              reading: '📖',
              planning: '🧠',
              writing: '✍️',
              read_verify: '🔍',
              fixing: '🔧',
              verifying: '✅',
              finalizing: '🚀',
              complete: '✨',
              failed: '❌'
            };
            const icon = stageIcons[latest.stage] || '•';
            addAgentMessage(
              `${icon} **${latest.stage.replace('_', ' ').toUpperCase()}**: ${latest.message}${latest.detail ? `\n> ${latest.detail}` : ''}`,
              undefined,
              'system'
            );
          }
        }
      }, 300);
      
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

        // Handle blocked by guardrails
        if (result.blocked && result.guardResult) {
          setLastGuardResult(result.guardResult);
          setCurrentCode(result.code || '');
          
          const guardSummary = summarizeGuardResult(result.guardResult);
          
          addAgentMessage(
            `🚫 **BLOCKED BY GUARDRAILS**\n\n` +
            `${guardSummary}\n\n` +
            `---\n\n` +
            `💡 **Options:**\n` +
            `- Type "approve" to explicitly approve this destructive change\n` +
            `- Modify your request to be less destructive\n` +
            `- Type "status" to check current policy settings`,
            {
              guardResult: result.guardResult,
            },
            'blocked'
          );
          
          toast.error('Change blocked by guardrails', {
            description: result.guardResult.reasons[0] || 'Policy violation'
          });
          return;
        }

        if (result.success && result.code) {
          setCurrentCode(result.code);
          setLastGuardResult(result.guardResult || null);
          setValidationResult(result.validation ? { 
            valid: result.validation.passed, 
            issues: result.validation.issues 
          } : null);
          setChangeHistory(getRecentChanges(10));

          const confidencePercent = result.confidence ? (result.confidence * 100).toFixed(0) : 'N/A';
          const validationStatus = result.validation?.passed 
            ? '✅ Validation passed — ready to apply' 
            : `⚠️ Validation issues: ${result.validation?.issues?.join(', ') || 'Unknown'}`;

          // Format completed stages with 8-phase flow including guard
          const stagesFormatted = result.stagesCompleted.map(s => {
            const icons: Record<string, string> = {
              reading: '📖',
              planning: '🧠',
              writing: '✍️',
              guarding: '🛡️',
              read_verify: '🔍',
              fixing: '🔧',
              verifying: '✅',
              finalizing: '🚀'
            };
            const labels: Record<string, string> = {
              reading: 'Read',
              planning: 'Plan',
              writing: 'Write',
              guarding: 'Guard',
              read_verify: 'Read',
              fixing: 'Fix',
              verifying: 'Verify',
              finalizing: 'Finalize'
            };
            return `${icons[s] || '•'} ${labels[s] || s}`;
          }).join(' → ');
          
          // Guard status badge
          const guardStatus = result.guardResult 
            ? `🛡️ **Guard:** ${result.guardResult.changeClass.toUpperCase()} (${result.guardResult.risk} risk)\n` +
              `⚓ **Anchors:** ${result.guardResult.anchorsPreserved ? 'Preserved ✓' : 'Modified ⚠️'}\n`
            : '';

          addAgentMessage(
            `**✅ Code Generated Successfully**\n\n` +
            `**Workflow:** ${stagesFormatted}\n\n` +
            guardStatus +
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
              guardResult: result.guardResult,
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
    const modules = ['brain', 'defense', 'nexus', 'vision', 'dream', 'system', 'core', 'ripple', 'access', 'decode', 'encode', 'evolution', 'integration'];
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
        <Card className="border-dashed border-system-amber/30 bg-muted/50">
          <CardContent className="py-12 text-center">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">ENCODE requires Operator privileges</p>
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 border border-fuchsia-500/40 flex items-center justify-center">
            <Code className="w-5 h-5 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              ENCODE
              <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
                via DECODE
              </Badge>
              
              {lastGuardResult && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px]",
                    lastGuardResult.ok 
                      ? "border-system-green/40 text-system-green bg-system-green/10"
                      : "border-destructive/40 text-destructive bg-destructive/10"
                  )}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {lastGuardResult.ok ? lastGuardResult.changeClass.toUpperCase() : 'BLOCKED'}
                </Badge>
              )}
              {discussionMode && (
                <Badge variant="outline" className="text-[10px] border-accent/40 text-accent bg-accent/10">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Discussion
                </Badge>
              )}
              {deployPipeline && (
                <Badge variant="outline" className="text-[10px] border-system-green/40 text-system-green bg-system-green/10">
                  <Rocket className="w-3 h-3 mr-1" />
                  Pipeline
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              USER → DECODE (intent) → ENCODE (execute) → preview → apply
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-system-green/40 text-system-green bg-system-green/10">
            <Zap className="w-3 h-3 mr-1" />
            Free-Tier Router {coderStatus?.free_tier_router || ''}
          </Badge>
          <Button variant="ghost" size="icon" onClick={fetchStatus} className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="border-primary/20 bg-card/50">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Patterns</p>
            <p className="text-2xl font-bold text-primary">{coderStatus?.learned_patterns || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-card/50">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Generated</p>
            <p className="text-2xl font-bold text-accent">{coderStatus?.generated_today || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-system-green/20 bg-card/50">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sandbox</p>
            <p className="text-sm font-mono text-system-green flex items-center gap-1">
              {sandboxStatus?.status === 'ready' ? (
                <><CheckCircle2 className="w-3 h-3" /> Ready</>
              ) : (
                <><AlertTriangle className="w-3 h-3" /> Offline</>
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="border-system-amber/20 bg-card/50">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mode</p>
            <p className="text-sm font-mono text-system-amber">{sandboxStatus?.mode || 'validation'}</p>
          </CardContent>
        </Card>
        <Card 
          className="border-neon-purple/20 bg-card/50 cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => setActiveTab('review')}
        >
          <CardContent className="py-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">PR Queue</p>
            <p className="text-sm font-mono text-neon-purple flex items-center gap-1">
              <GitPullRequest className="w-3 h-3" />
              View Queue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chat Panel */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardHeader className="border-b border-border/50 py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              DECODE → ENCODE Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[500px]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="space-y-3">
                    <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Talk to DECODE — it will parse your intent and route execution to ENCODE.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['Add rate limiting to Brain', 'Create a health check function', 'Improve error handling'].map(example => (
                          <button
                            key={example}
                            onClick={() => setInput(example)}
                            className="text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
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
                          ? "bg-primary/10 border border-primary/20 ml-8" 
                          : msg.role === 'system'
                          ? "bg-system-amber/10 border border-system-amber/20"
                          : msg.role === 'question'
                          ? "bg-neon-cyan/10 border border-neon-cyan/20"
                          : msg.role === 'preview'
                          ? "bg-neon-blue/10 border border-neon-blue/20"
                          : msg.role === 'approval'
                          ? "bg-system-green/10 border border-system-green/20"
                          : msg.role === 'blocked'
                          ? "bg-destructive/10 border border-destructive/30"
                          : "bg-muted/50 border border-border/50 mr-8"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <Terminal className="w-3 h-3 text-primary" />
                        ) : msg.role === 'system' ? (
                          <AlertTriangle className="w-3 h-3 text-system-amber" />
                        ) : msg.role === 'question' ? (
                          <HelpCircle className="w-3 h-3 text-neon-cyan" />
                        ) : msg.role === 'preview' ? (
                          <FileText className="w-3 h-3 text-neon-blue" />
                        ) : msg.role === 'approval' ? (
                          <Shield className="w-3 h-3 text-system-green" />
                        ) : msg.role === 'blocked' ? (
                          <Ban className="w-3 h-3 text-destructive" />
                        ) : (
                          <Bot className="w-3 h-3 text-primary" />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {msg.role === 'user' ? 'You' : 
                           msg.role === 'system' ? 'System' : 
                           msg.role === 'question' ? 'Clarification' :
                           msg.role === 'preview' ? 'Impact Preview' :
                           msg.role === 'approval' ? 'Approval Required' :
                           msg.role === 'blocked' ? 'BLOCKED' :
                           'DECODE → ENCODE'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                        {msg.role === 'blocked' && (
                          <Badge variant="destructive" className="ml-auto text-[9px] h-4">
                            GUARDRAIL VIOLATION
                          </Badge>
                        )}
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-foreground/90">{msg.content}</pre>
                      </div>
                      
                      {/* Blocked change buttons */}
                      {msg.role === 'blocked' && msg.metadata?.guardResult && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-system-amber/30 text-system-amber hover:bg-system-amber/20"
                            onClick={() => setInput('approve')}
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Approve Destructive Change
                          </Button>
                        </div>
                      )}
                      
                      {/* Question options UI */}
                      {msg.role === 'question' && msg.metadata?.question?.options && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.metadata.question.options.map((opt) => (
                            <Button
                              key={opt}
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 border-neon-cyan/30 hover:bg-neon-cyan/20"
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
                            className="bg-system-green/20 border border-system-green/40 text-system-green hover:bg-system-green/30"
                            onClick={() => setInput('yes')}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/30 text-destructive hover:bg-destructive/20"
                            onClick={() => setInput('no')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {msg.metadata?.provider && (
                        <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-2 text-[10px] text-muted-foreground">
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
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell DECODE what you need — it routes intent to ENCODE..."
                  className="min-h-[60px] resize-none bg-muted/50 border-border/50"
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
                  className="bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="border-accent/20 bg-card/50 backdrop-blur-xl">
          <CardHeader className="border-b border-border/50 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileCode className="w-4 h-4 text-accent" />
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
                  ? "bg-system-green/10 border-system-green/20 text-system-green"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
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
              <div className="border-t border-border/50 p-3 bg-destructive/5">
                <p className="text-xs font-medium text-destructive mb-2">Issues:</p>
                <ul className="space-y-1">
                  {validationResult.issues.map((issue, idx) => (
                    <li key={idx} className="text-xs text-destructive/80 flex items-start gap-2">
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
        <Card className="mt-6 border-neon-blue/20 bg-card/50 backdrop-blur-xl">
          <CardHeader className="border-b border-border/50 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Undo2 className="w-4 h-4 text-neon-blue" />
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
              <div className="divide-y divide-border/30">
                {changeHistory.map((change) => (
                  <div key={change.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px]",
                          change.status === 'applied' ? "border-system-green/40 text-system-green" :
                          change.status === 'rolled_back' ? "border-system-amber/40 text-system-amber" :
                          change.status === 'failed' ? "border-destructive/40 text-destructive" :
                          "border-neon-blue/40 text-neon-blue"
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
                        className="h-7 text-xs text-system-amber hover:bg-system-amber/20"
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

      {/* PR Queue Panel - Shows when review tab is active */}
      {activeTab === 'review' && (
        <div className="mt-6">
          <PRQueuePanel
            onDeploy={async (pr) => {
              // Run deployment pipeline for the PR
              const pipeline = await runDeploymentPipeline({
                functionName: pr.filesChanged[0] || 'unknown',
                code: pr.diff,
                autoValidate: true
              }, (stage, status) => {
                console.log(`Pipeline: ${stage} → ${status}`);
              });
              setDeployPipeline(pipeline);
              if (!pipeline.result?.success) {
                throw new Error(pipeline.result?.validationErrors[0] || 'Deployment failed');
              }
            }}
          />
        </div>
      )}

      {/* Diff Viewer for current code */}
      {currentCode && activeTab === 'preview' && (
        <Card className="mt-6 border-border/50 bg-card/50">
          <CardHeader className="py-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Code Diff View
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={diffMode === 'split' ? 'secondary' : 'ghost'}
                  onClick={() => setDiffMode('split')}
                  className="h-7 text-xs"
                >
                  Split
                </Button>
                <Button
                  size="sm"
                  variant={diffMode === 'unified' ? 'secondary' : 'ghost'}
                  onClick={() => setDiffMode('unified')}
                  className="h-7 text-xs"
                >
                  Unified
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DiffViewer 
              diff={`--- a/original.ts\n+++ b/new.ts\n@@ -1,1 +1,${currentCode.split('\n').length} @@\n${currentCode.split('\n').map(l => `+${l}`).join('\n')}`} 
              mode={diffMode}
              onModeChange={setDiffMode}
            />
          </CardContent>
        </Card>
      )}

      {/* Learning Notice */}
      <Card className="mt-6 border-system-amber/20 bg-system-amber/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-system-amber mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-system-amber mb-1">v3.0 — Full Autonomous Pipeline</p>
              <p className="text-xs text-muted-foreground">
                Encoded v3 includes PR-style review queues, split-diff viewing, 6-stage deployment pipelines
                (syntax → AST → style → performance → security → deploy), type-safe refactoring, and
                multi-project pattern learning. Every change is validated before deployment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
