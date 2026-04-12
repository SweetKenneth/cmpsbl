/**
 * ManaAttachPhase — Execute Layer 2 attachment and show live results
 * 
 * Uses the Ascension findings bridge for surgical capability mapping
 * instead of blanket rule application.
 */

import { useState, useEffect, useRef } from 'react';
import { Layers, CheckCircle2, Shield, Activity, Eye, Zap, Scale, AlertTriangle, Loader2, Lock, Timer, BarChart3, Search, FileCheck, Gauge, Bug, GitBranch, ShieldCheck, Gavel, UserCheck, Fingerprint, RotateCcw, Clock, Box, Umbrella, FileText, Camera, Microscope, Filter, EyeOff, Brain, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ManaCapability, ManaProof, ManaManifest } from '@/lib/mana/types';
import type { ManaMergeResult } from './ManaMergePhase';
import type { LexRuleConfig } from './LexRuleSelector';
import type { ManaUploadResult } from './ManaUploadPhase';

/** Get icon for a capability — uses family prefix matching for 92 capabilities */
function getCapabilityIcon(cap: ManaCapability): typeof Shield {
  if (cap.startsWith('defense') || cap.startsWith('input_sanitizer') || cap.startsWith('injection') || cap.startsWith('payload') || cap.startsWith('output_filter') || cap.startsWith('data_masker')) return Shield;
  if (cap.startsWith('beacon') || cap.startsWith('latency') || cap.startsWith('throughput') || cap.startsWith('system_telemetry')) return Activity;
  if (cap.startsWith('error')) return Bug;
  if (cap.startsWith('governance') || cap.startsWith('mutation') || cap.startsWith('policy') || cap.startsWith('conscience')) return Scale;
  if (cap.startsWith('consent') || cap.startsWith('identity')) return UserCheck;
  if (cap.startsWith('compliance') || cap.startsWith('treaty')) return Search;
  if (cap.startsWith('access') || cap.startsWith('sovereign')) return Lock;
  if (cap.startsWith('circuit') || cap.startsWith('reflex')) return Zap;
  if (cap.startsWith('retry')) return RotateCcw;
  if (cap.startsWith('timeout') || cap.startsWith('memory_ttl')) return Clock;
  if (cap.startsWith('bulkhead') || cap.startsWith('sandbox')) return Box;
  if (cap.startsWith('fallback') || cap.startsWith('immunity')) return Umbrella;
  if (cap.startsWith('audit') || cap.startsWith('forge')) return AlertTriangle;
  if (cap.startsWith('call_logger') || cap.startsWith('evolution')) return FileText;
  if (cap.startsWith('state_snapshot') || cap.startsWith('memory_state')) return Camera;
  if (cap.startsWith('forensic')) return Microscope;
  if (cap.startsWith('shadow') || cap.startsWith('phantom')) return Eye;
  if (cap.startsWith('drift') || cap.startsWith('anomaly') || cap.startsWith('oracle')) return TrendingDown;
  if (cap.startsWith('dream') || cap.startsWith('brain') || cap.startsWith('cortex') || cap.startsWith('compass')) return Brain;
  if (cap.startsWith('threat')) return Gauge;
  if (cap.startsWith('rate')) return Timer;
  if (cap.startsWith('dependency') || cap.startsWith('ripple') || cap.startsWith('atlas')) return GitBranch;
  if (cap.startsWith('nexus') || cap.startsWith('nerve') || cap.startsWith('relay')) return BarChart3;
  if (cap.startsWith('echo') || cap.startsWith('harvest')) return Fingerprint;
  if (cap.startsWith('lingua') || cap.startsWith('inclusive')) return FileCheck;
  if (cap.startsWith('vision') || cap.startsWith('medic')) return ShieldCheck;
  if (cap.startsWith('integration')) return Gavel;
  if (cap.startsWith('core')) return Layers;
  return Activity;
}

export interface AttachmentResult {
  manifest: ManaManifest;
  proof: ManaProof;
  hostName: string;
  hostLanguage: string;
  functionNames: string[];
  sourceContent: string;
  files: Array<{ name: string; content: string; language: string }>;
  mergeResult?: ManaMergeResult | null;
}

interface Props {
  upload: ManaUploadResult;
  rules: LexRuleConfig[];
  mergeResult?: ManaMergeResult | null;
  onComplete: (result: AttachmentResult) => void;
}

type Phase = 'idle' | 'scanning' | 'attaching' | 'proving' | 'complete';

export function ManaAttachPhase({ upload, rules, mergeResult, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [result, setResult] = useState<AttachmentResult | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (line: string) => {
    setLogLines(prev => [...prev, `[${new Date().toISOString().slice(11, 23)}] ${line}`]);
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logLines]);

  const runAttachment = async () => {
    setPhase('scanning');
    setProgress(0);
    setLogLines([]);

    // Dynamic imports — findings bridge + engine
    const [mana, bridge] = await Promise.all([
      import('@/lib/mana/index'),
      import('@/lib/mana/findings-bridge'),
    ]);

    addLog('MANA ENGINE v2.0.0 — Initializing...');
    mana.reset();
    mana.configure({ telemetry: true, maxTelemetryEvents: 5000, dreamSynthesis: false, lexMode: 'permissive' });
    addLog('Lex Governor online. Mode: permissive.');

    // Register selected Lex rules
    const enabledRules = rules.filter(r => r.enabled);
    for (const rule of enabledRules) {
      addLog(`Lex rule registered: ${rule.label} (${rule.capability})`);
    }
    setProgress(15);
    await new Promise(r => setTimeout(r, 400));

    // Phase 1: SCAN — Ascension-grade function boundary detection via findings bridge
    setPhase('scanning');
    addLog(`Scanning host: ${upload.name} (${upload.language})`);
    addLog(`Source size: ${upload.sizeKb}KB · ${upload.fileCount} file(s)`);

    const boundaries = bridge.detectFunctionBoundaries(upload.sourceContent);
    const functionNames = boundaries.map(b => b.name);

    // Fallback for files with no detectable functions
    if (functionNames.length === 0) {
      functionNames.push('main', 'handler', 'process');
      addLog('No function boundaries detected — using default entry points');
    }

    addLog(`Discovered ${functionNames.length} function boundaries`);
    for (const b of boundaries.slice(0, 10)) {
      addLog(`  → ${b.name}() [line ${b.line}]`);
    }
    if (boundaries.length > 10) {
      addLog(`  ... +${boundaries.length - 10} more`);
    }
    setProgress(35);
    await new Promise(r => setTimeout(r, 500));

    // Phase 2: BUILD ATTACHMENT PLAN — surgical signal-matched mapping
    addLog('Building surgical attachment plan via Ascension findings bridge...');

    // Map enabled Lex rule capabilities → active primitives
    // Derive primitive from capability slug prefix
    const capToPrimitive = (cap: string): string => {
      const SLUG_MAP: Record<string, string> = {
        defense: 'DEFENSE', input_sanitizer: 'DEFENSE', threat: 'DEFENSE', rate: 'DEFENSE', payload: 'DEFENSE', injection: 'DEFENSE',
        beacon: 'BEACON', latency: 'BEACON', error: 'BEACON', throughput: 'BEACON', dependency: 'BEACON',
        governance: 'GOVERNANCE', mutation: 'GOVERNANCE', policy: 'GOVERNANCE', consent: 'GOVERNANCE', compliance: 'GOVERNANCE', access_controller: 'GOVERNANCE',
        circuit: 'FAILSAFE', retry: 'FAILSAFE', timeout: 'FAILSAFE', bulkhead: 'FAILSAFE', fallback: 'FAILSAFE',
        audit: 'AUDIT', call_logger: 'AUDIT', state_snapshot: 'AUDIT', forensic: 'AUDIT',
        shadow: 'SHADOW', output_filter: 'SHADOW', data_masker: 'SHADOW',
        dream: 'DREAM', anomaly: 'DREAM', drift: 'DREAM',
        memory: 'MEMORY', nexus: 'NEXUS', brain: 'BRAIN', oracle: 'ORACLE', cortex: 'CORTEX',
        echo: 'ECHO', harvest: 'HARVEST', phantom: 'PHANTOM', lingua: 'LINGUA', nerve: 'NERVE',
        compass: 'COMPASS', sandbox: 'SANDBOX', ripple: 'RIPPLE', identity: 'IDENTITY', vision: 'VISION',
        inclusive: 'INCLUSIVE', relay: 'RELAY', integration: 'INTEGRATION', atlas: 'ATLAS', medic: 'MEDIC',
        system: 'SYSTEM', immunity: 'IMMUNITY', reflex: 'REFLEX', evolution: 'EVOLUTION', treaty: 'TREATY',
        sovereign: 'SOVEREIGN', core: 'CORE', access: 'ACCESS', conscience: 'CONSCIENCE', forge: 'FORGE',
      };
      for (const [prefix, prim] of Object.entries(SLUG_MAP)) {
        if (cap.startsWith(prefix)) return prim;
      }
      return 'BEACON';
    };
    const activePrimitives = new Set(
      enabledRules.map(r => capToPrimitive(r.capability)).filter(Boolean)
    );

    const findings = bridge.buildAttachmentPlan(boundaries, activePrimitives);
    addLog(`Findings bridge produced ${findings.length} surgical attachment targets`);
    for (const f of findings.slice(0, 8)) {
      addLog(`  ⊕ ${f.functionName}() ← ${f.capability} [${f.primitive}] (${Math.round(f.confidence * 100)}%)`);
    }
    if (findings.length > 8) {
      addLog(`  ... +${findings.length - 8} more`);
    }
    setProgress(50);
    await new Promise(r => setTimeout(r, 300));

    // Build the host module mock for the engine
    const hostModule: Record<string, unknown> = {};
    for (const fn of functionNames) {
      hostModule[fn] = function (...args: unknown[]) { return args; };
    }

    // Phase 3: ATTACH — wrap function boundaries with Layer 2
    setPhase('attaching');
    addLog('Phase 3: ATTACH — Wrapping function boundaries with Layer 2...');

    const capabilities: Array<{ functionName: string; capability: ManaCapability; rulePayload?: unknown }> = [];

    // Use surgical findings from the bridge
    for (const finding of findings) {
      capabilities.push({
        functionName: finding.functionName,
        capability: finding.capability,
        rulePayload: finding.capability === 'shadow_rule'
          ? `🛑 MANA: ${finding.functionName} is under Lex governance.`
          : undefined,
      });
    }

    // If bridge produced no findings (generic code), apply enabled rules broadly
    if (findings.length === 0 && enabledRules.length > 0) {
      addLog('No signal-matched targets — applying blanket rules to all functions');
      for (const fn of functionNames) {
        for (const rule of enabledRules) {
          capabilities.push({
            functionName: fn,
            capability: rule.capability,
            rulePayload: rule.capability === 'shadow_rule' ? `🛑 MANA: ${fn} is under Lex governance.` : undefined,
          });
        }
      }
    }

    const manifest = await mana.attach(hostModule, capabilities, upload.sourceContent);
    addLog(`Attached ${manifest.attachmentPoints.length} attachment points across ${functionNames.length} functions`);
    addLog(`Layer depth: ${manifest.layerDepth}`);
    setProgress(65);

    // Log capability distribution
    const capCounts = new Map<string, number>();
    for (const p of manifest.attachmentPoints) {
      capCounts.set(p.capability, (capCounts.get(p.capability) ?? 0) + 1);
    }
    for (const [cap, count] of capCounts) {
      addLog(`  ${cap}: ${count} points active`);
    }
    await new Promise(r => setTimeout(r, 400));

    // Phase 4: PROOF — SHA-256 verification
    setPhase('proving');
    addLog('Phase 4: PROOF — Computing SHA-256 verification...');
    const proof = await mana.generateProof(upload.sourceContent);
    setProgress(90);

    addLog(`SHA-256 Before: ${proof.hostHashBefore.slice(0, 16)}...`);
    addLog(`SHA-256 After:  ${proof.hostHashAfter.slice(0, 16)}...`);
    addLog(proof.verified
      ? '✅ VERIFIED — Host source is byte-for-byte identical. Zero modification.'
      : '❌ MISMATCH — Integrity check failed.'
    );
    addLog(`Fingerprint: ${proof.fingerprintId}`);
    if (proof.parentLayerHash) {
      addLog(`Parent layer: ${proof.parentLayerHash.slice(0, 16)}... (depth ${proof.layerDepth})`);
    }

    await new Promise(r => setTimeout(r, 300));

    setProgress(100);
    setPhase('complete');
    addLog('═══════════════════════════════════════════');
    addLog('MANA ATTACHMENT COMPLETE');
    addLog(`Host: ${upload.name} · ${functionNames.length} functions · ${manifest.attachmentPoints.length} points`);
    addLog(`Proof: ${proof.verified ? 'VERIFIED' : 'FAILED'} · ${proof.fingerprintId}`);
    addLog('═══════════════════════════════════════════');

    // Log merged software if present
    if (mergeResult && mergeResult.totalMergedItems > 0) {
      addLog(`Layer 2 Merge: ${mergeResult.totalMergedItems} items embedded`);
      for (const cap of mergeResult.selectedCapabilities) {
        addLog(`  ⊕ ${cap.name} (${cap.category}) — ${cap.module}`);
      }
      for (const sw of mergeResult.mergedSoftware) {
        addLog(`  ⊕ ${sw.name} (${sw.language}) — ${(sw.content.length / 1024).toFixed(1)}KB`);
      }
    }

    const attachResult: AttachmentResult = {
      manifest,
      proof,
      hostName: upload.name,
      hostLanguage: upload.language,
      functionNames,
      sourceContent: upload.sourceContent,
      files: upload.files,
      mergeResult,
    };
    setResult(attachResult);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Layer 2 Attachment</h3>
        <p className="text-sm text-muted-foreground">
          Mana wraps <span className="font-semibold text-foreground">{upload.name}</span> at function boundaries.
          {' '}The host source stays byte-for-byte identical.
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border/30 bg-card/50 overflow-hidden">
        <div className="h-2 bg-muted/20">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan,190_100%_60%))]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Phase indicators */}
        <div className="grid grid-cols-4 gap-1 p-3">
          {(['scanning', 'attaching', 'proving', 'complete'] as const).map((p, i) => (
            <div key={p} className={cn(
              "text-center text-[10px] font-mono uppercase tracking-wider py-1 rounded",
              phase === p ? "text-primary font-bold bg-primary/10" :
              (['scanning', 'attaching', 'proving', 'complete'].indexOf(phase) > i) ? "text-primary/60" :
              "text-muted-foreground/40"
            )}>
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Log terminal */}
      <div
        ref={logRef}
        className="rounded-xl border border-border/30 bg-[hsl(222_47%_6%)] p-4 font-mono text-xs max-h-[300px] overflow-y-auto"
      >
        <AnimatePresence>
          {logLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "leading-relaxed",
                line.includes('✅') ? 'text-green-400' :
                line.includes('❌') ? 'text-red-400' :
                line.includes('═') ? 'text-primary' :
                line.includes('→') || line.includes('⊕') ? 'text-[hsl(var(--neon-cyan,190_100%_60%))]' :
                'text-white/70'
              )}
            >
              {line}
            </motion.p>
          ))}
        </AnimatePresence>
        {phase !== 'idle' && phase !== 'complete' && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
        )}
      </div>

      {/* Action */}
      {phase === 'idle' && (
        <Button onClick={runAttachment} className="w-full gap-2" size="lg">
          <Layers className="w-4 h-4" />
          Execute Layer 2 Attachment
        </Button>
      )}

      {phase !== 'idle' && phase !== 'complete' && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {phase === 'scanning' && 'Scanning function boundaries...'}
            {phase === 'attaching' && 'Attaching Layer 2 capabilities...'}
            {phase === 'proving' && 'Computing SHA-256 proof...'}
          </span>
        </div>
      )}

      {phase === 'complete' && result && (
        <div className="space-y-4">
          {/* Proof card */}
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl border",
            result.proof.verified
              ? "bg-green-500/5 border-green-500/20"
              : "bg-red-500/5 border-red-500/20"
          )}>
            <CheckCircle2 className={cn("w-6 h-6 shrink-0", result.proof.verified ? "text-green-500" : "text-red-500")} />
            <div className="flex-1">
              <p className="text-sm font-bold">
                {result.proof.verified ? 'Zero Modification Verified' : 'Integrity Check Failed'}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {result.proof.fingerprintId}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-card/50 border border-border/30">
              <p className="text-xl font-black text-primary">{result.functionNames.length}</p>
              <p className="text-[9px] font-mono text-muted-foreground uppercase">Functions</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card/50 border border-border/30">
              <p className="text-xl font-black text-[hsl(var(--neon-cyan,190_100%_60%))]">{result.manifest.attachmentPoints.length}</p>
              <p className="text-[9px] font-mono text-muted-foreground uppercase">Attach Points</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card/50 border border-border/30">
              <p className="text-xl font-black text-green-500">✓</p>
              <p className="text-[9px] font-mono text-muted-foreground uppercase">SHA-256</p>
            </div>
          </div>

          <Button onClick={() => onComplete(result)} className="w-full gap-2" size="lg">
            <CheckCircle2 className="w-4 h-4" />
            Proceed to Export Pack
          </Button>
        </div>
      )}
    </div>
  );
}
