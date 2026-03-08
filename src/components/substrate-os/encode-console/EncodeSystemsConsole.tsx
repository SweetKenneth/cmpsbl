/**
 * ENCODE Systems Engineer Console
 * Two-panel engineering interface: conversation stream + architecture awareness.
 * Command-driven. Not a chatbot.
 * Preserves DECODE → PLAN → APPROVAL → ENCODE governance pipeline.
 */

import { useState, useCallback, useMemo } from 'react';
import { Bot, Cpu, Shield, Terminal, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEncodeOrchestration } from '@/hooks/substrate/useEncodeOrchestration';
import { useEncode } from '@/hooks/substrate/useEncode';
import { navigateIntent, resolveAlias } from '@/lib/codeagent/encoded/substrate-navigator';
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

  const handleCommand = useCallback((input: string) => {
    const trimmed = input.trim();

    // /help
    if (trimmed === '/help') {
      addSystemMsg('info', ENCODE_COMMANDS.map(c => `${c.cmd}  —  ${c.desc}`).join('\n'));
      return;
    }

    // /status
    if (trimmed === '/status') {
      addSystemMsg('info', [
        `ENCODE Health: ${encode.health}%`,
        `Mode: ${orchestration.mode}`,
        `Locked: ${orchestration.isLocked}`,
        `Messages: ${orchestration.conversation.messages.length}`,
        `Queue: ${encode.queue.length} tasks`,
        `Patches: ${orchestration.patches.length}`,
      ].join('\n'));
      return;
    }

    // /clear
    if (trimmed === '/clear') {
      orchestration.clear();
      setSystemMessages([]);
      addSystemMsg('success', 'Session cleared.');
      return;
    }

    // /audit
    if (trimmed === '/audit' || trimmed === '/analyze system') {
      const snap = orchestration.runAudit();
      addSystemMsg('success', `Architecture snapshot captured: ${snap.module_registry.length} modules, ${snap.dependency_graph.length} edges.`);
      return;
    }

    // /approve
    if (trimmed === '/approve') {
      const result = orchestration.approve();
      if (result.success) {
        addSystemMsg('success', 'Execution approved. ENCODE may now generate code.');
      } else {
        addSystemMsg('error', `Approval failed: ${result.reason}`);
      }
      return;
    }

    // /reject <reason>
    if (trimmed.startsWith('/reject ')) {
      const reason = trimmed.slice(8).trim();
      addSystemMsg('warning', `Plan rejected: ${reason}`);
      return;
    }

    // /build, /modify, /evolve, /instantiate, /export — route through DECODE
    const engineeringCommands = ['/build', '/modify', '/evolve', '/instantiate', '/export'];
    const matchedCmd = engineeringCommands.find(c => trimmed.startsWith(c));

    if (matchedCmd) {
      const target = trimmed.slice(matchedCmd.length).trim();
      const intent = `${matchedCmd.slice(1)} ${target}`;

      // Semantic resolution
      const navigation = navigateIntent(target);
      if (navigation.modules.length > 0) {
        addSystemMsg('info', `Resolved: "${target}" → ${navigation.modules.map(m => m.id).join(', ')}\nFiles: ${navigation.targetFiles.slice(0, 3).join(', ')}`);
      }

      // Submit through governance pipeline
      const review = orchestration.submitIntent(intent);
      addSystemMsg('info', `Intent submitted. Risk: ${review.risk_assessment || 'unknown'}. ${review.clarification_questions.length} questions pending.`);
      return;
    }

    // Unknown command
    if (trimmed.startsWith('/')) {
      addSystemMsg('error', `Unknown command: "${trimmed}". Type /help for available commands.`);
      return;
    }

    // Non-command text — route as intent
    const review = orchestration.submitIntent(trimmed);
    addSystemMsg('info', `Intent submitted through DECODE pipeline.`);
  }, [orchestration, encode, addSystemMsg]);

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
