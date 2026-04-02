/**
 * DecodeDebrief — Interactive guided tour of refurbishment results
 * DECODE walks user through findings conversationally after Ascension completes
 * Includes rich primitive descriptions and interactive Q&A at the end
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronRight, Sparkles, Shield, Zap, CheckCircle2, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDecodeStore } from '@/stores/decodeStore';
import type { RestorationReport } from '@/lib/factory/restoration-docs';
import type { ScanResult } from '@/lib/factory/scan-team';

interface DebriefMessage {
  id: string;
  role: 'decode' | 'system' | 'user';
  content: string;
  icon?: React.ElementType;
  highlight?: boolean;
}

/** Map primitive names to rich, actionable descriptions */
const PRIMITIVE_DESCRIPTIONS: Record<string, string> = {
  FAILSAFE: "You can now backup and restore any version of your system. Use `cmpsbl backup` to create a snapshot and `cmpsbl restore <id>` to roll back. Automatic recovery via circuit breakers is also active.",
  DEFENSE: "Device fingerprinting and request origin validation are now active. This hardens your security protocols by identifying suspicious access patterns and blocking unauthorized requests before they reach your logic.",
  GOVERNANCE: "Policy enforcement is now embedded in your code. Every operation is checked against configurable governance rules, ensuring compliance boundaries are never violated — even under heavy load.",
  BEACON: "Real-time health monitoring is now active. BEACON emits structured health signals you can observe with `cmpsbl health` or integrate into your existing monitoring stack (Datadog, Grafana, etc.).",
  ENCODE: "Your code's intent has been mapped and documented. ENCODE extracted behavioral signatures so every function's purpose is traceable — useful for onboarding new developers or auditing logic.",
  ORACLE: "Predictive analysis is now part of your system. ORACLE identifies failure patterns before they cascade, giving you early warnings about architectural drift or resource exhaustion.",
  ENGINEER: "Dependency resolution and structural repair have been applied. ENGINEER identified fragile dependency chains and reinforced them with fallback paths and version pinning.",
  BRAIN: "Continuous learning patterns have been wired in. Your system can now accumulate operational insights over time, improving its own decision-making without external AI dependencies.",
  CORTEX: "Advanced reasoning and decision-routing capabilities are now integrated. CORTEX handles complex multi-step operations that require contextual awareness across your codebase.",
  NEXUS: "Intelligent routing is active. NEXUS directs operations to the optimal execution path based on real-time system state, reducing latency and improving throughput.",
  ARCHITECT: "Structural blueprinting has been applied. Your codebase now has a documented architecture map that ARCHITECT uses to prevent structural regressions during future changes.",
  AUTOMATON: "Automated workflow execution is now available. Repetitive operational tasks can be delegated to AUTOMATON, which handles them deterministically without human intervention.",
  MEDIC: "Structural repair capabilities are embedded. MEDIC continuously monitors code integrity and can self-heal minor issues like corrupted state or orphaned connections.",
  WRAITH: "Stealth operations are active. WRAITH handles sensitive operations with minimal footprint, ensuring audit trails exist without exposing operational details to unauthorized observers.",
  OBSIDIAN: "Hardened persistence is now part of your system. OBSIDIAN ensures critical data survives even catastrophic failures through redundant storage patterns and integrity verification.",
  MONOLITH: "Unified execution coordination is active. MONOLITH orchestrates complex multi-primitive operations as single atomic transactions, preventing partial-failure states.",
  RAPTOR: "High-speed scanning and threat detection are integrated. RAPTOR performs continuous perimeter analysis, identifying and flagging anomalies in real-time.",
  PRIMITIVE: "Base-level operational capabilities are reinforced. PRIMITIVE provides the foundational execution layer that all other primitives build upon.",
};

function getCapabilityDescription(primitiveName: string): string {
  const upper = primitiveName.toUpperCase();
  return PRIMITIVE_DESCRIPTIONS[upper] ?? `${primitiveName} has been applied to strengthen your system's ${primitiveName.toLowerCase()}-level capabilities. Check the documentation for specific usage patterns.`;
}

function buildDebriefMessages(
  report: RestorationReport,
  scanResult: ScanResult | null,
): DebriefMessage[] {
  const msgs: DebriefMessage[] = [];

  msgs.push({
    id: 'intro',
    role: 'decode',
    content: `Refurbishment complete. Let me walk you through exactly what changed — and what you're getting back. ✨`,
    icon: MessageSquare,
  });

  // CJPI Score
  const cert = report.cjpiCertificate;
  msgs.push({
    id: 'cjpi',
    role: 'decode',
    content: `Your code scored **CJPI ${cert.score}** — placing it in the **${cert.tier}** tier. ${cert.score >= 94 ? "That's exceptional." : cert.score >= 80 ? "Solid foundation." : "Room to grow."} Certificate serial: \`${cert.serialNumber}\``,
    icon: Sparkles,
    highlight: cert.score >= 90,
  });

  // Vulnerabilities
  const critical = report.vulnerabilityAssessment.filter(v => v.severity === 'critical');
  const warnings = report.vulnerabilityAssessment.filter(v => v.severity === 'warning');
  if (critical.length > 0 || warnings.length > 0) {
    msgs.push({
      id: 'vulns',
      role: 'decode',
      content: `The scan team found **${critical.length} critical** and **${warnings.length} warning-level** issues. ${critical.length > 0 ? `Critical items — ${critical.map(c => `**${c.title}**`).join(', ')} — have been hardened.` : 'All warnings have been mitigated.'} 🛡️`,
      icon: Shield,
    });
  }

  // Individual primitive explanations with rich descriptions
  for (const primitive of report.primitiveManifest) {
    const description = getCapabilityDescription(primitive.name);
    msgs.push({
      id: `prim-${primitive.name}`,
      role: 'decode',
      content: `**${primitive.name}** has been added. ${description}`,
      icon: Zap,
    });
  }

  // New capabilities summary
  if (report.newCapabilities.length > 0) {
    const capList = report.newCapabilities.map(c => `• **${c.name}**: ${c.description}`).join('\n');
    msgs.push({
      id: 'caps',
      role: 'decode',
      content: `In total, your code now has ${report.newCapabilities.length} new capabilities:\n\n${capList}`,
      icon: Sparkles,
    });
  }

  // Documentation
  msgs.push({
    id: 'docs',
    role: 'decode',
    content: `Everything is documented — pipeline details, error codes, and a test harness config are included in your refurbishment report. You can verify every change independently with \`npx cmpsbl-test\`. 📋`,
    icon: FileText,
  });

  // Interactive closing — invitation to ask questions
  msgs.push({
    id: 'close',
    role: 'decode',
    content: `That covers all the upgrades. Do you have any questions before you download your refurbished code? If not, I'm always available via the floating icon on your screen. 💬`,
    icon: CheckCircle2,
    highlight: true,
  });

  return msgs;
}

/** Simple contextual Q&A responses for common debrief questions */
const QA_RESPONSES: [RegExp, string][] = [
  [/test|verify|harness/i, "You can verify all changes by running `npm install @cmpsbl/test-harness` followed by `npx cmpsbl-test --config ./restoration-report.json`. Each primitive's hardening is validated independently — green means active, red means review that section."],
  [/backup|restore|rollback|failsafe/i, "FAILSAFE gives you full version control over your system state. Run `cmpsbl backup` to create a snapshot, and `cmpsbl restore <id>` to roll back. Circuit breakers handle automatic recovery during runtime failures."],
  [/security|defense|fingerprint/i, "DEFENSE enables device fingerprinting and request origin validation. It identifies suspicious patterns and blocks unauthorized requests before they hit your application logic. Check your DEFENSE config for allowlist customization."],
  [/monitor|health|beacon/i, "BEACON emits structured health signals. Use `cmpsbl health` to check status, or pipe the signals into your existing monitoring (Datadog, Grafana, Prometheus). It runs continuously with near-zero overhead."],
  [/doc|documentation/i, "Your export includes: pipeline-details.md, new-capabilities.md, testing-guide.md, error-codes.md, and a CJPI certificate. Everything you need to understand, verify, and maintain the refurbished code."],
  [/price|cost|plan|subscribe/i, "Exporting your refurbished code requires an active subscription. Visit the Plans page to see available tiers — Studio, Creator, or Architect. All paid plans include a 7-day free trial."],
  [/how.*work|what.*happen/i, "The refurbishment process: your code was scanned by ENCODE, ORACLE, and ENGINEER to identify vulnerabilities and structural issues. Then the primitives you selected were applied to harden and enhance your code. The result is a production-ready package with documentation and tests."],
];

function getQAResponse(question: string): string {
  for (const [pattern, response] of QA_RESPONSES) {
    if (pattern.test(question)) return response;
  }
  return "That's a great question. For detailed technical support, open DECODE from the floating icon — it has full context on your refurbishment and can dive deeper into any topic. You can also visit our support page at /support.";
}

export function DecodeDebrief({
  report,
  scanResult,
}: {
  report: RestorationReport;
  scanResult: ScanResult | null;
}) {
  const baseMessages = buildDebriefMessages(report, scanResult);
  const [messages, setMessages] = useState<DebriefMessage[]>(baseMessages);
  const [visibleCount, setVisibleCount] = useState(1);
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openDecode = useDecodeStore(s => s.open);

  const isComplete = visibleCount >= baseMessages.length;
  const isFullyRevealed = visibleCount >= messages.length;

  useEffect(() => {
    if (visibleCount < baseMessages.length) {
      const timer = setTimeout(() => {
        setVisibleCount(c => c + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, baseMessages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount, messages.length]);

  const handleAskQuestion = useCallback(() => {
    const q = userInput.trim();
    if (!q) return;

    const userMsg: DebriefMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
    };

    const response = getQAResponse(q);
    const decodeMsg: DebriefMessage = {
      id: `decode-reply-${Date.now()}`,
      role: 'decode',
      content: response,
      icon: MessageSquare,
    };

    setMessages(prev => [...prev, userMsg, decodeMsg]);
    setVisibleCount(prev => prev + 2);
    setUserInput('');
  }, [userInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  }, [handleAskQuestion]);

  return (
    <div className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border/20 bg-card/30">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">DECODE Debrief</h3>
          <p className="text-[10px] text-muted-foreground">Interactive walkthrough of your refurbishment results</p>
        </div>
        {!isComplete && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-medium">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-[600px] overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.slice(0, visibleCount).map((msg) => {
            const Icon = msg.icon || MessageSquare;
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-3 p-3 rounded-xl",
                  isUser
                    ? "bg-primary/10 border border-primary/20 ml-8"
                    : msg.highlight
                      ? "bg-primary/5 border border-primary/15"
                      : "bg-muted/20 border border-border/10"
                )}
              >
                {!isUser && (
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    msg.highlight ? "bg-primary/15" : "bg-muted/40"
                  )}>
                    <Icon className={cn("w-3.5 h-3.5", msg.highlight ? "text-primary" : "text-muted-foreground")} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {isUser && (
                    <p className="text-[10px] font-semibold text-primary mb-1">You</p>
                  )}
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                    {msg.content.split(/(\*\*[^*]+\*\*|\`[^`]+\`)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
                      }
                      if (part.startsWith('`') && part.endsWith('`')) {
                        return <code key={i} className="px-1 py-0.5 rounded bg-muted/50 text-[10px] font-mono">{part.slice(1, -1)}</code>;
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground/50">DECODE is reviewing...</span>
          </motion.div>
        )}
      </div>

      {/* Interactive Q&A input — shown after all base messages are revealed */}
      {isComplete && (
        <div className="px-4 py-3 border-t border-border/20 space-y-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask DECODE a question about your refurbishment..."
              className="flex-1 h-9 text-xs bg-muted/30 border-border/30"
            />
            <Button
              size="sm"
              className="h-9 px-3"
              onClick={handleAskQuestion}
              disabled={!userInput.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          <button
            onClick={() => openDecode("assistant")}
            className="w-full text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors text-center"
          >
            Or open DECODE in full view for deeper questions →
          </button>
        </div>
      )}

      {/* Skip */}
      {!isComplete && (
        <div className="px-4 py-3 border-t border-border/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 gap-1"
            onClick={() => setVisibleCount(baseMessages.length)}
          >
            Show all findings
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
