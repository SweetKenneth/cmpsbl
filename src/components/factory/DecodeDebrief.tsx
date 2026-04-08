/**
 * DecodeDebrief — Interactive guided tour of refurbishment results
 * DECODE has FULL CONTEXT: original code, refurbished code, applied primitives, and scan results.
 * Answers questions as if it performed the refurbishment itself.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronRight, Sparkles, Shield, Zap, CheckCircle2, FileText, Send, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { RestorationReport } from '@/lib/factory/restoration-docs';
import type { ScanResult } from '@/lib/factory/scan-team';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

interface DebriefMessage {
  id: string;
  role: 'decode' | 'system' | 'user';
  content: string;
  icon?: React.ElementType;
  highlight?: boolean;
}

/** Map ALL 40 primitive names to rich, actionable descriptions */
const PRIMITIVE_DESCRIPTIONS: Record<string, string> = {
  // ═══ 12 ORGANS ═══
  BRAIN: "Continuous learning patterns have been wired in. Your system can now accumulate operational insights over time, improving its own decision-making without external AI dependencies. Use `cmpsbl brain --status` to view accumulated knowledge.",
  MEMORY: "Persistent state management is now active. MEMORY ensures your application retains context across sessions, crashes, and restarts. Use `cmpsbl memory --snapshot` to inspect current state.",
  IDENTITY: "Identity resolution and access control are embedded. Every request is now validated against a multi-factor identity chain. This prevents unauthorized access and enables session binding across distributed services.",
  CONSCIENCE: "Ethical decision boundaries are now enforced. CONSCIENCE intercepts operations that exceed configurable thresholds (default: 30% block, 60% review) and logs reasoning chains for audit compliance.",
  COMPASS: "Navigation and module discovery are now automated. COMPASS maps your codebase's dependency graph and provides real-time navigation hints, helping new developers onboard faster and reducing wrong-path errors.",
  REFLEX: "Fast reflexive fallback paths are now active. When primary operations fail, REFLEX triggers sub-millisecond fallback routines instead of waiting for timeout. This cuts your error response time by 60-80%.",
  ECHO: "Structured echo patterns replace scattered logging. Every significant event is now captured with context, timestamps, and causal chains — making debugging a 5-minute task instead of a 5-hour one.",
  OBSERVER: "Observable state transitions are now instrumented. OBSERVER emits structured events on every state change, enabling real-time debugging dashboards and post-mortem analysis without modifying your code.",
  LINGUA: "Structured language interpretation is active. LINGUA parses and normalizes text inputs, handling edge cases like encoding mismatches, locale-specific formatting, and ambiguous string operations.",
  HARVEST: "Dead code detection and pruning recommendations are now available. HARVEST identified unreachable paths, unused exports, and orphaned modules. Run `cmpsbl harvest --report` to see what can be safely removed.",
  PHANTOM: "Phantom testing capabilities are integrated. PHANTOM generates synthetic traffic that mirrors real user patterns, letting you stress-test your system without impacting production users.",
  NERVE: "Reliable signal propagation is now active across your event-driven components. NERVE ensures that events are delivered exactly once, in order, even during partial failures or network partitions.",

  // ═══ 12 LAYERS ═══
  DEFENSE: "Device fingerprinting and request origin validation are now active. This hardens your security protocols by identifying suspicious access patterns and blocking unauthorized requests before they reach your logic.",
  GOVERNANCE: "Policy enforcement is now embedded in your code. Every operation is checked against configurable governance rules, ensuring compliance boundaries are never violated — even under heavy load.",
  EVOLUTION: "Managed evolution cycles are now tracking your technical debt. EVOLUTION monitors TODO/FIXME markers, deprecated APIs, and structural drift — then generates prioritized remediation plans.",
  SHADOW: "Shadow testing and canary analysis are active. SHADOW can mirror production traffic to test environments, comparing outputs without affecting real users. Use `cmpsbl shadow --compare` to run A/B infrastructure tests.",
  ORACLE: "Predictive analysis is now part of your system. ORACLE identifies failure patterns before they cascade, giving you early warnings about architectural drift or resource exhaustion up to 60 seconds in advance.",
  SOVEREIGN: "Cross-jurisdictional policy management is embedded. SOVEREIGN resolves authority conflicts between competing access policies and enforces hierarchical permission delegation across your service boundaries.",
  TREATY: "API contract enforcement is now active. TREATY validates every request and response against defined schemas, catching contract violations before they reach consumers. Breaking changes trigger automatic alerts.",
  RELAY: "Intelligent message routing is now in place. RELAY directs async communications to optimal paths based on current load, retry history, and endpoint health — reducing failed deliveries by up to 90%.",
  SANDBOX: "Sandboxed execution contexts are now available. Untrusted operations run in isolated environments with restricted system access. Any attempt at privilege escalation is automatically terminated.",
  SIMULATE: "Simulation capabilities are embedded. SIMULATE lets you test architectural changes, configuration updates, and deployment strategies against historical traffic patterns before going live.",
  FORGE: "Build pipeline hardening is active. FORGE validates transformation outputs, enforces hash-chain integrity for build artifacts, and prevents tampered code from entering your production pipeline.",
  IMMUNITY: "Dependency immunity is now protecting your import chains. IMMUNITY monitors for cascading failures from third-party dependencies and automatically isolates compromised packages.",

  // ═══ 8 ENGINES ═══
  FAILSAFE: "You can now backup and restore any version of your system. Use `cmpsbl backup` to create a snapshot and `cmpsbl restore <id>` to roll back. Circuit breakers handle automatic recovery during runtime failures.",
  BEACON: "Real-time health monitoring is now active. BEACON emits structured health signals you can observe with `cmpsbl health` or integrate into your existing monitoring stack (Datadog, Grafana, Prometheus).",
  AUTOMATON: "Automated workflow execution is now available. Repetitive operational tasks — cron jobs, scheduled maintenance, data cleanup — can be delegated to AUTOMATON for deterministic, unattended execution.",
  CORTEX: "Advanced reasoning and decision-routing capabilities are integrated. CORTEX handles complex multi-step operations that require contextual awareness across your codebase, reducing decision latency by 40%.",
  NEXUS: "Intelligent routing is active. NEXUS directs operations to the optimal execution path based on real-time system state — load, latency, error rates — improving throughput and reducing bottlenecks.",
  ARCHITECT: "Structural blueprinting has been applied. Your codebase now has a documented architecture map that ARCHITECT uses to prevent structural regressions during future changes. Run `cmpsbl architect --blueprint` to view.",
  ENCODE: "Your code's behavioral signatures have been mapped and documented. ENCODE extracted intent patterns so every function's purpose is traceable — useful for onboarding, auditing, and automated patching.",
  ENGINEER: "Dependency resolution and structural repair have been applied. ENGINEER identified fragile dependency chains and reinforced them with fallback paths, version pinning, and isolation boundaries.",

  // ═══ 8 AGENTS ═══
  PRIMITIVE: "Base-level operational capabilities are reinforced. PRIMITIVE provides the foundational execution layer that all other primitives build upon — think of it as the kernel of your hardened system.",
  WRAITH: "Stealth operations are active. WRAITH handles sensitive operations (secrets rotation, credential management, audit-sensitive flows) with minimal footprint and end-to-end encryption.",
  OBSIDIAN: "Hardened persistence is now part of your system. OBSIDIAN ensures critical data survives catastrophic failures through redundant storage patterns, integrity verification, and automatic recovery.",
  MONOLITH: "Unified execution coordination is active. MONOLITH orchestrates complex multi-primitive operations as single atomic transactions, preventing partial-failure states that corrupt your data.",
  RAPTOR: "High-speed scanning and threat detection are integrated. RAPTOR performs continuous perimeter analysis at sub-millisecond intervals, identifying and flagging anomalies before they become breaches.",
  DECODE: "Intent interpretation is now embedded. DECODE resolves ambiguous user inputs through contextual analysis and confidence scoring, reducing misrouted operations and improving user experience.",
  SENTINEL: "Continuous validation is enforced at all system boundaries. SENTINEL guards every entry point — APIs, webhooks, internal calls — against malformed, unauthorized, or suspicious payloads.",
  ATLAS: "System-wide mapping and navigation are active. ATLAS maintains a real-time topology of your entire architecture, enabling any component to discover and communicate with any other without hardcoded paths.",
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
    content: `Ascension complete. I've analyzed your code, applied the primitives you selected, and prepared your hardened package. Let me walk you through exactly what changed. ✨`,
    icon: MessageSquare,
  });

  // CJPI Score
  const cert = report.cjpiCertificate;
  msgs.push({
    id: 'cjpi',
    role: 'decode',
    content: `Your code scored **CJPI ${cert.score}** — placing it in the **${cert.tier}** tier. ${cert.score >= 94 ? "That's exceptional." : cert.score >= 80 ? "Solid foundation." : "Room to grow."} Your fingerprint ID is \`${cert.fingerprint}\` — save this to pull up your ascension anytime.`,
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
      content: `**${primitive.name}** has been applied. ${description}`,
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
    content: `Your export includes: LICENSE, dual-layer source (original + ascended), pipeline details, vulnerability assessment, test harness config, CJPI certificate, error codes, and a README. Everything you need to verify and maintain independently. 📋`,
    icon: FileText,
  });

  // Interactive closing
  msgs.push({
    id: 'close',
    role: 'decode',
    content: `That covers all the upgrades. Do you have any questions about what was changed, how to use the new capabilities, or anything else before you download? I have full context on your code and every primitive that was applied. 💬`,
    icon: CheckCircle2,
    highlight: true,
  });

  return msgs;
}

/** Context-aware Q&A that uses actual refurbishment data */
function getContextualResponse(
  question: string,
  report: RestorationReport,
  scanResult: ScanResult | null,
  originalCode: string,
  refurbishedCode: string,
  selectedPrimitives: PrimitiveRecommendation[],
): string {
  const q = question.toLowerCase();
  const fingerprint = report.cjpiCertificate.fingerprint;
  const primNames = selectedPrimitives.map(p => p.name);

  // Questions about what changed / what was upgraded
  if (/what.*change|what.*upgrade|what.*different|what.*happen|what.*did you do/i.test(q)) {
    const primList = primNames.join(', ');
    const vulnCount = report.vulnerabilityAssessment.length;
    return `I applied ${primNames.length} primitives to your code: ${primList}. The scan team identified ${vulnCount} issues — ${report.vulnerabilityAssessment.filter(v => v.severity === 'critical').length} critical and ${report.vulnerabilityAssessment.filter(v => v.severity === 'warning').length} warnings — all of which have been addressed. Your CJPI score is ${report.cjpiCertificate.score} (${report.cjpiCertificate.tier} tier). The ascended code includes guard activations for each primitive, meaning they're actively protecting your runtime.`;
  }

  // Questions about a specific primitive
  for (const prim of primNames) {
    const re = new RegExp(prim, 'i');
    if (re.test(q)) {
      const desc = getCapabilityDescription(prim);
      return `${prim} was one of the primitives applied to your code. ${desc}`;
    }
  }

  // Testing
  if (/test|verify|harness|validate/i.test(q)) {
    return `To verify all changes: run \`${report.testingGuide.installCommand}\` then \`${report.testingGuide.testCommand}\`. Each primitive's hardening is validated independently — green means active, red means review that section. The test harness config is included in your export as \`test-harness.config.json\`.`;
  }

  // Export / download / zip
  if (/export|download|zip|package/i.test(q)) {
    return `Your export package includes: the original source, the ascended (hardened) source with primitive guard activations, a LICENSE file, pipeline details, vulnerability assessment, test harness config, CJPI certificate, error codes, primitive manifest, and a README with quick-start instructions. Click "Export Ascended Code" to download the ZIP.`;
  }

  // Fingerprint / return / support
  if (/fingerprint|return|come back|support|lookup|pull up/i.test(q)) {
    return `Your fingerprint ID is \`${fingerprint}\`. Save it — you can return to cmpsbl.com anytime and provide this ID to DECODE. I'll pull up your full refurbishment history including the original code, what was applied, your CJPI score, and every primitive's contribution. It's your permanent reference for this refurbishment.`;
  }

  // CJPI / score / tier
  if (/cjpi|score|tier|rating/i.test(q)) {
    const cert = report.cjpiCertificate;
    return `Your code scored CJPI ${cert.score}, placing it in the ${cert.tier} tier. The score reflects structural integrity, vulnerability coverage, and primitive depth. Your certificate serial is \`${cert.serialNumber}\`. The full certificate with primitive chain is included in your export.`;
  }

  // Security
  if (/security|defense|safe|protect|fingerprint.*device/i.test(q)) {
    const hasDefense = primNames.some(n => n.toUpperCase() === 'DEFENSE');
    if (hasDefense) {
      return `DEFENSE is active on your code. It provides device fingerprinting, request origin validation, and suspicious pattern detection. Unauthorized requests are blocked before reaching your application logic. You can customize the allowlist in your DEFENSE config.`;
    }
    return `Security hardening was applied through the primitives you selected (${primNames.join(', ')}). Each one adds a layer of protection. For dedicated device-level security, the DEFENSE primitive would add fingerprinting — you can add it in a future refurbishment.`;
  }

  // Backup / restore
  if (/backup|restore|rollback|failsafe|recover/i.test(q)) {
    const hasFailsafe = primNames.some(n => n.toUpperCase() === 'FAILSAFE');
    if (hasFailsafe) {
      return `FAILSAFE is active. You now have full version control: \`cmpsbl backup\` creates a snapshot, \`cmpsbl restore <id>\` rolls back. Circuit breakers handle automatic recovery during runtime failures. Your backup history is maintained independently of your deployment pipeline.`;
    }
    return `Your current refurbishment doesn't include FAILSAFE. To add backup/restore capabilities with circuit breakers, you can run another refurbishment and select the FAILSAFE primitive.`;
  }

  // Documentation
  if (/doc|documentation|readme/i.test(q)) {
    return `Your export includes comprehensive documentation: pipeline-details.md (every step of the refurbishment), new-capabilities.md (what you can now do), testing-guide.md (verification steps), error-codes.md (runtime error handling), vulnerability-assessment.md (what was found and fixed), primitive-manifest.md (what was applied), cjpi-certificate.json, and a README.md with quick-start instructions.`;
  }

  // Code / source / original
  if (/code|source|original|refurbished|dual.?layer/i.test(q)) {
    return `Your export contains dual-layer source: \`src/original-source.txt\` (your unchanged code) and \`src/ascended-source.ts\` (hardened code with @cmpsbl/runtime imports and primitive guard activations). The ascended version wraps your original logic — nothing was removed, only reinforced.`;
  }

  // Price / plan
  if (/price|cost|plan|subscribe|pay/i.test(q)) {
    return `Exporting requires an active subscription. Studio ($29), Creator ($79), or Architect ($249) — all include unlimited refurbishments. Visit the Plans section below to get started.`;
  }

  // Fallback — still contextual
  return `That's a good question. I have full context on your refurbishment — ${primNames.length} primitives applied (${primNames.join(', ')}), CJPI ${report.cjpiCertificate.score}, ${report.vulnerabilityAssessment.length} issues addressed. Could you rephrase or ask about a specific primitive, the export contents, testing, or your CJPI score? I'm here until you're ready to download.`;
}

export function DecodeDebrief({
  report,
  scanResult,
  originalCode = '',
  refurbishedCode = '',
  selectedPrimitives = [],
}: {
  report: RestorationReport;
  scanResult: ScanResult | null;
  originalCode?: string;
  refurbishedCode?: string;
  selectedPrimitives?: PrimitiveRecommendation[];
}) {
  const baseMessages = buildDebriefMessages(report, scanResult);
  const [messages, setMessages] = useState<DebriefMessage[]>(baseMessages);
  const [visibleCount, setVisibleCount] = useState(1);
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isComplete = visibleCount >= baseMessages.length;

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

    const response = getContextualResponse(q, report, scanResult, originalCode, refurbishedCode, selectedPrimitives);
    const decodeMsg: DebriefMessage = {
      id: `decode-reply-${Date.now()}`,
      role: 'decode',
      content: response,
      icon: MessageSquare,
    };

    setMessages(prev => [...prev, userMsg, decodeMsg]);
    setVisibleCount(prev => prev + 2);
    setUserInput('');
  }, [userInput, report, scanResult, originalCode, refurbishedCode, selectedPrimitives]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  }, [handleAskQuestion]);

  const handleCopyFingerprint = useCallback(() => {
    navigator.clipboard.writeText(report.cjpiCertificate.fingerprint);
    toast.success('Fingerprint copied to clipboard');
  }, [report.cjpiCertificate.fingerprint]);

  return (
    <div className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border/20 bg-card/30">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">DECODE Debrief</h3>
          <p className="text-[10px] text-muted-foreground">Interactive walkthrough — I have full context on your refurbishment</p>
        </div>
        {/* Fingerprint badge */}
        <button
          onClick={handleCopyFingerprint}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
          title="Copy fingerprint ID"
        >
          <span className="text-[9px] font-mono text-primary">{report.cjpiCertificate.fingerprint.slice(0, 12)}…</span>
          <Copy className="w-3 h-3 text-primary/60" />
        </button>
        {!isComplete && (
          <div className="flex items-center gap-1.5">
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
              placeholder="Ask me anything about your refurbishment..."
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
          <p className="text-[10px] text-muted-foreground/50 text-center">
            I have full context on your code, the {selectedPrimitives.length} primitives applied, and every change made. Ask anything.
          </p>
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
