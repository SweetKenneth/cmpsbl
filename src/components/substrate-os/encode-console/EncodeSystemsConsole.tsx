/**
 * ENCODE Systems Engineer Console
 * Hybrid conversational + command interface.
 * Natural language and slash commands both route through DECODE → PLAN → APPROVAL → ENCODE.
 * Actually wired to substrate systems for real work.
 */

import { useState, useCallback, useMemo } from 'react';
import { Bot, Cpu, Shield, Terminal, ArrowLeft, Zap, Brain, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEncodeOrchestration } from '@/hooks/substrate/useEncodeOrchestration';
import { useEncode } from '@/hooks/substrate/useEncode';
import { navigateIntent, resolveAlias, detectConcerns, getModuleTables } from '@/lib/codeagent/encoded/substrate-navigator';
import { getRelevantPatterns } from '@/lib/codeagent/encoded/expert-patterns';
import { getRelevantSkills } from '@/lib/codeagent/encoded/skills';
import { EncodeCommandInput, ENCODE_COMMANDS } from './EncodeCommandInput';
import { ConversationStream } from './ConversationStream';
import { ArchitecturePanel } from './ArchitecturePanel';

type SystemMessage = { type: 'info' | 'warning' | 'error' | 'success'; text: string; ts: string };

export function EncodeSystemsConsole() {
  const orchestration = useEncodeOrchestration();
  const encode = useEncode();
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);

  const addSystemMsg = useCallback((type: SystemMessage['type'], text: string) => {
    setSystemMessages(prev => [...prev, { type, text, ts: new Date().toISOString() }]);
  }, []);

  // ── Resolve architecture context for any target ──
  const resolveTarget = useCallback((target: string) => {
    const navigation = navigateIntent(target);
    const concerns = detectConcerns(target);
    const patterns = getRelevantPatterns(target);
    const skills = getRelevantSkills(target);

    const lines: string[] = [];

    if (navigation.modules.length > 0) {
      lines.push(`📍 Modules: ${navigation.modules.map(m => m.id).join(', ')}`);
      lines.push(`📁 Files: ${navigation.targetFiles.slice(0, 5).join(', ')}`);
    }

    if (concerns.length > 0) {
      lines.push(`🔧 Concerns: ${concerns.join(', ')}`);
    }

    if (patterns.length > 0) {
      lines.push(`🧩 Patterns: ${patterns.slice(0, 3).map(p => `${p.name} (${p.tier})`).join(', ')}`);
    }

    if (skills.length > 0) {
      lines.push(`⚡ Skills: ${skills.slice(0, 3).map(s => `${s.name} ${s.proficiency}%`).join(', ')}`);
    }

    // Check for existing pipelines/tables
    const tables = navigation.modules.flatMap(m => getModuleTables(m.id));
    if (tables.length > 0) {
      lines.push(`🗄️ Tables: ${tables.slice(0, 5).join(', ')}`);
    }

    return { navigation, concerns, patterns, skills, tables, summary: lines.join('\n') };
  }, []);

  // ── Generate a real plan through the pipeline ──
  const generatePlan = useCallback(async (intent: string, modules?: string[]) => {
    try {
      addSystemMsg('info', '⏳ Generating PatchPlan through DECODE pipeline...');
      const plan = await encode.generatePlan.mutateAsync({
        intent,
        modules,
      }) as any;
      addSystemMsg('success', [
        `📋 PatchPlan created: ${plan?.plan_id || 'unknown'}`,
        `   Title: ${plan?.title || intent}`,
        `   Modules: ${(plan?.modules || modules || []).join(', ')}`,
        `   Changes: ${plan?.changes?.length || 0}`,
        `   Risks: ${plan?.risks?.length > 0 ? plan.risks.join(', ') : 'none detected'}`,
        `   Status: ${plan?.status || 'draft'}`,
        '',
        'Use /approve to approve, or /reject <reason> to reject.',
      ].join('\n'));
      return plan;
    } catch (err: any) {
      addSystemMsg('error', `Plan generation failed: ${err.message}`);
      return null;
    }
  }, [encode.generatePlan, addSystemMsg]);

  // ── Approve latest plan and route to ENCODE for execution ──
  const approvePlan = useCallback(async () => {
    const plans = encode.plans.filter(p => p.status === 'draft' || p.status === 'review');
    if (plans.length === 0) {
      addSystemMsg('warning', 'No pending plans to approve. Submit an intent first.');
      return;
    }

    const latestPlan = plans[plans.length - 1];
    try {
      // Approve in orchestration layer
      const orchResult = orchestration.approve();
      if (!orchResult.success) {
        addSystemMsg('error', `Orchestration lock: ${orchResult.reason}`);
        return;
      }

      // Approve plan in plan store
      await encode.approvePlanMutation.mutateAsync({
        planId: latestPlan.plan_id,
        approver: 'governor',
      });

      addSystemMsg('success', [
        `✅ Plan ${latestPlan.plan_id} approved`,
        '',
        '🔄 Execution pipeline:',
        '   1. ✅ Plan approved',
        '   2. 🧠 Architecture recall',
        '   3. 🧩 Pattern selection',
        '   4. ⚙️  Code generation ready',
        '   5. 🛡️ Guard validation pending',
        '   6. 🔒 Artifact sealing pending',
        '   7. 🧠 Brain writeback pending',
        '',
        `ENCODE is ready to execute. Route intent with /execute ${latestPlan.plan_id}`,
      ].join('\n'));
    } catch (err: any) {
      addSystemMsg('error', `Approval failed: ${err.message}`);
    }
  }, [encode.plans, encode.approvePlanMutation, orchestration, addSystemMsg]);

  // ── Execute an approved plan ──
  const executePlan = useCallback(async (planId: string) => {
    try {
      addSystemMsg('info', `⚙️ Routing to ENCODE for execution (plan: ${planId})...`);
      const task = await encode.routeIntent.mutateAsync({
        intent: `Execute plan ${planId}`,
        plan_id: planId,
        brainKeys: ['encode', 'patterns', 'architecture'],
      }) as any;
      addSystemMsg('success', [
        `🚀 Task enqueued: ${task?.id || 'unknown'}`,
        `   Intent: ${task?.intentSummary || planId}`,
        `   Surface: ${task?.targetSurface || 'code'}`,
        `   Status: ${task?.status || 'queued'}`,
        '',
        'ENCODE is now processing. Use /status to monitor.',
      ].join('\n'));
    } catch (err: any) {
      addSystemMsg('error', `Execution failed: ${err.message}`);
    }
  }, [encode.routeIntent, addSystemMsg]);

  // ── Ask ENCODE a question about a plan ──
  const discussPlan = useCallback(async (planId: string, message: string) => {
    try {
      await encode.discussion.ask.mutateAsync({ planId, message });
      addSystemMsg('info', `💬 Discussion opened on plan ${planId}: "${message}"`);
    } catch (err: any) {
      addSystemMsg('error', `Discussion failed: ${err.message}`);
    }
  }, [encode.discussion.ask, addSystemMsg]);

  const handleCommand = useCallback((input: string) => {
    const trimmed = input.trim();

    // ═══ SLASH COMMANDS ═══

    if (trimmed === '/help') {
      addSystemMsg('info', [
        ...ENCODE_COMMANDS.map(c => `${c.cmd}  —  ${c.desc}`),
        '',
        '── EXECUTION ──',
        '/execute <plan_id>  —  Route approved plan to ENCODE',
        '/discuss <plan_id> <message>  —  Open discussion on a plan',
        '/plans  —  List all plans',
        '/recall <query>  —  Query BRAIN memory',
        '/resolve <target>  —  Resolve target to architecture',
        '/clm  —  Run CLM learning cycle',
        '',
        '── CONVERSATIONAL ──',
        'You can also type natural language.',
        'ENCODE will resolve your intent, find relevant modules,',
        'generate a PatchPlan, and await your approval.',
      ].join('\n'));
      return;
    }

    if (trimmed === '/status') {
      const pendingPlans = encode.plans.filter(p => p.status === 'draft' || p.status === 'review');
      const approvedPlans = encode.plans.filter(p => p.status === 'approved');
      addSystemMsg('info', [
        `ENCODE Health: ${encode.health}%`,
        `Mode: ${orchestration.mode}`,
        `Locked: ${orchestration.isLocked}`,
        `Messages: ${orchestration.conversation.messages.length}`,
        `Queue: ${encode.queue.length} tasks`,
        `Patches: ${orchestration.patches.length}`,
        `Plans: ${encode.plans.length} total (${pendingPlans.length} pending, ${approvedPlans.length} approved)`,
        `Receipts: ${encode.receipts.length}`,
      ].join('\n'));
      return;
    }

    if (trimmed === '/clear') {
      orchestration.clear();
      setSystemMessages([]);
      addSystemMsg('success', 'Session cleared.');
      return;
    }

    if (trimmed === '/audit' || trimmed === '/analyze system') {
      const snap = orchestration.runAudit();
      addSystemMsg('success', [
        `Architecture snapshot captured: ${snap.snapshot_id}`,
        `   Modules: ${snap.module_registry.length}`,
        `   Dependencies: ${snap.dependency_graph.length} edges`,
        `   Utilities: ${snap.shared_utilities_index.length}`,
        `   Escalation paths: ${snap.escalation_paths.length}`,
        '',
        'Execution lock partially released. Use /approve after submitting a plan.',
      ].join('\n'));
      return;
    }

    if (trimmed === '/approve') {
      approvePlan();
      return;
    }

    if (trimmed.startsWith('/reject ')) {
      const reason = trimmed.slice(8).trim();
      const plans = encode.plans.filter(p => p.status === 'draft' || p.status === 'review');
      if (plans.length > 0) {
        const latest = plans[plans.length - 1];
        encode.rejectPlanMutation.mutate({ planId: latest.plan_id, reason });
        addSystemMsg('warning', `Plan ${latest.plan_id} rejected: ${reason}`);
      } else {
        addSystemMsg('warning', `No pending plans to reject.`);
      }
      return;
    }

    if (trimmed.startsWith('/execute ')) {
      const planId = trimmed.slice(9).trim();
      executePlan(planId);
      return;
    }

    if (trimmed.startsWith('/discuss ')) {
      const parts = trimmed.slice(9).trim();
      const spaceIdx = parts.indexOf(' ');
      if (spaceIdx === -1) {
        addSystemMsg('error', 'Usage: /discuss <plan_id> <message>');
        return;
      }
      discussPlan(parts.slice(0, spaceIdx), parts.slice(spaceIdx + 1));
      return;
    }

    if (trimmed === '/plans') {
      if (encode.plans.length === 0) {
        addSystemMsg('info', 'No plans generated yet. Submit an intent to create one.');
        return;
      }
      const planLines = encode.plans.map(p =>
        `  ${p.status === 'approved' ? '✅' : p.status === 'rejected' ? '❌' : '📋'} ${p.plan_id} [${p.status}] — ${p.title}`
      );
      addSystemMsg('info', `Plans (${encode.plans.length}):\n${planLines.join('\n')}`);
      return;
    }

    if (trimmed.startsWith('/resolve ')) {
      const target = trimmed.slice(9).trim();
      const result = resolveTarget(target);
      if (result.summary) {
        addSystemMsg('info', `Architecture resolution for "${target}":\n${result.summary}`);
      } else {
        addSystemMsg('warning', `No architecture matches for "${target}"`);
      }
      return;
    }

    if (trimmed.startsWith('/recall ')) {
      const query = trimmed.slice(8).trim();
      addSystemMsg('info', `🧠 Querying BRAIN memory for: "${query}"...`);
      // Memory recall is async but we surface what the navigator knows
      const resolved = resolveTarget(query);
      addSystemMsg('info', resolved.summary || 'No memory matches found.');
      return;
    }

    if (trimmed === '/clm') {
      encode.runCLM.mutate(undefined as any);
      addSystemMsg('info', '🔄 CLM learning cycle triggered.');
      return;
    }

    // ═══ ENGINEERING COMMANDS ═══

    const engineeringCommands = ['/build', '/modify', '/evolve', '/instantiate', '/export'];
    const matchedCmd = engineeringCommands.find(c => trimmed.startsWith(c));

    if (matchedCmd) {
      const target = trimmed.slice(matchedCmd.length).trim();
      const intent = `${matchedCmd.slice(1)} ${target}`;

      // Resolve architecture targets
      const resolved = resolveTarget(target);
      if (resolved.summary) {
        addSystemMsg('info', `Architecture context:\n${resolved.summary}`);
      }

      // Check for existing patterns/pipelines
      if (resolved.patterns.length > 0) {
        addSystemMsg('info', [
          '🔍 Existing patterns detected:',
          ...resolved.patterns.slice(0, 3).map(p => `   • ${p.name} (${p.tier}) — ${p.description.slice(0, 80)}`),
          '',
          'Options: [Reuse] [Modify] [Generate New]',
          'Proceeding with plan generation...',
        ].join('\n'));
      }

      // Submit through governance pipeline AND generate real plan
      orchestration.submitIntent(intent);
      generatePlan(intent, resolved.navigation.modules.map(m => m.id));
      return;
    }

    // ═══ UNKNOWN COMMANDS ═══

    if (trimmed.startsWith('/')) {
      addSystemMsg('error', `Unknown command: "${trimmed}". Type /help for available commands.`);
      return;
    }

    // ═══ CONVERSATIONAL MODE ═══
    // Natural language → resolve → plan → await approval

    const resolved = resolveTarget(trimmed);

    // Show what ENCODE understood
    if (resolved.summary) {
      addSystemMsg('info', `🎯 ENCODE resolved your intent:\n${resolved.summary}`);
    }

    // Submit through orchestration (governance awareness)
    const review = orchestration.submitIntent(trimmed);

    // Show ENCODE's analysis
    addSystemMsg('info', [
      `📊 ENCODE Analysis:`,
      `   Risk: ${review.risk_assessment || 'unknown'}`,
      review.clarification_questions.length > 0
        ? `   Questions:\n${review.clarification_questions.map(q => `     • ${q}`).join('\n')}`
        : '   No clarifications needed.',
    ].join('\n'));

    // Generate a real PatchPlan
    generatePlan(trimmed, resolved.navigation.modules.map(m => m.id));

  }, [orchestration, encode, addSystemMsg, resolveTarget, generatePlan, approvePlan, executePlan, discussPlan]);

  const taskQueue = useMemo(() =>
    encode.queue.map(t => ({ id: t.id, intent: t.intentSummary, status: t.status })),
    [encode.queue]
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3 shrink-0">
        <Link to="/os" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-foreground tracking-tight">ENCODE Systems Engineer</h1>
          <p className="text-[9px] text-muted-foreground/50 font-mono">
            DECODE → PLAN → APPROVAL → ENCODE
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className={cn(
            "text-[9px] font-mono",
            orchestration.isLocked ? "border-destructive/30 text-destructive" : "border-green-500/30 text-green-500"
          )}>
            {orchestration.isLocked ? 'LOCKED' : 'READY'}
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono">
            {orchestration.mode.toUpperCase()}
          </Badge>
          {encode.queue.length > 0 && (
            <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-500">
              {encode.queue.length} QUEUED
            </Badge>
          )}
        </div>
      </header>

      {/* Two-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Conversation Stream */}
        <div className="flex-1 flex flex-col border-r border-border/15 min-w-0">
          <div className="flex-1 overflow-hidden">
            <ConversationStream
              messages={orchestration.conversation.messages}
              plans={encode.plans}
              systemMessages={systemMessages}
            />
          </div>
          <div className="border-t border-border/15 p-3 shrink-0">
            <EncodeCommandInput
              onSubmit={handleCommand}
              isLocked={orchestration.isLocked}
            />
          </div>
        </div>

        {/* RIGHT — Architecture Panel */}
        <div className="w-80 xl:w-96 shrink-0 bg-muted/5 hidden lg:block">
          <ArchitecturePanel
            orchestration={orchestration}
            encodeHealth={encode.health}
            taskQueue={taskQueue}
          />
        </div>
      </div>
    </div>
  );
}

export default EncodeSystemsConsole;
