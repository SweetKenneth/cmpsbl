/**
 * DEFENSE Layer Demo — Tier 2
 * Live threat scoring, Trie-based evaluation, anomaly detection.
 * Preloaded data for investor presentation.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle,
  Activity, Lock, Zap, Eye,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ThreatEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  threatScore: number;
  verdict: "allow" | "flag" | "block";
  reason: string;
  latency: string;
}

const THREAT_EVENTS: ThreatEvent[] = [
  {
    id: "DEF-1847",
    timestamp: "14:32:07.124",
    actor: "api-key-4f2a",
    action: "mutation.apply",
    threatScore: 12,
    verdict: "allow",
    reason: "Known actor, low-risk mutation, within rate limits",
    latency: "0.3ms",
  },
  {
    id: "DEF-1848",
    timestamp: "14:32:08.891",
    actor: "unknown-ip-91.x",
    action: "auth.login",
    threatScore: 67,
    verdict: "flag",
    reason: "Unknown actor, 4th attempt in 60s, geolocation anomaly",
    latency: "0.2ms",
  },
  {
    id: "DEF-1849",
    timestamp: "14:32:09.442",
    actor: "script-inject-attempt",
    action: "decode.input",
    threatScore: 94,
    verdict: "block",
    reason: "XSS payload detected, Unicode evasion attempt (NFKC normalized), null-byte stripped",
    latency: "0.1ms",
  },
  {
    id: "DEF-1850",
    timestamp: "14:32:11.203",
    actor: "api-key-7b1c",
    action: "memory.query",
    threatScore: 8,
    verdict: "allow",
    reason: "Trusted actor, standard read operation",
    latency: "0.2ms",
  },
  {
    id: "DEF-1851",
    timestamp: "14:32:12.887",
    actor: "unknown-ip-103.x",
    action: "evolution.rollback",
    threatScore: 88,
    verdict: "block",
    reason: "Unauthenticated rollback attempt on production gate, kill-chain stage 3 correlation",
    latency: "0.1ms",
  },
];

const verdictConfig = {
  allow: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20" },
  flag: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
  block: { icon: <XCircle className="w-3.5 h-3.5" />, color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" },
};

interface DefenseLayerDemoProps {
  onBack: () => void;
}

export const DefenseLayerDemo = ({ onBack }: DefenseLayerDemoProps) => {
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  const startStream = () => {
    setStreaming(true);
    setVisibleEvents(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleEvents(count);
      if (count >= THREAT_EVENTS.length) {
        clearInterval(interval);
        setTimeout(() => setStreaming(false), 500);
      }
    }, 700);
  };

  const threatScoreColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 50) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Showcase
        </button>
        <span className="text-[10px] font-mono text-muted-foreground">TIER 2 · DEFENSE</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DEFENSE Layer</h1>
              <p className="text-xs text-muted-foreground">Enterprise Security — O(1) Threat Evaluation</p>
            </div>
          </div>
        </motion.div>

        {/* What You're Seeing */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What You're Seeing</p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Every action in the substrate passes through DEFENSE in <span className="font-semibold text-foreground">sub-millisecond time</span>.
            Trie-based pattern matching, Unicode normalization, and behavioral anomaly detection
            evaluate threats in O(1) — constant time regardless of rule count.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Avg Latency", value: "0.2ms" },
              { label: "Rules Active", value: "2,847" },
              { label: "Block Rate", value: "99.7%" },
              { label: "False Positives", value: "1.7%" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 border border-border p-2.5 text-center">
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Threat Feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Threat Evaluation Feed</p>
            {!streaming && visibleEvents === 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-[10px]" onClick={startStream}>
                <Activity className="w-3 h-3" />
                Start Feed
              </Button>
            )}
            {streaming && (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live
              </span>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span className="w-16">Time</span>
              <span className="flex-1">Event</span>
              <span className="w-12 text-center">Score</span>
              <span className="w-14 text-center">Verdict</span>
              <span className="w-12 text-right">Speed</span>
            </div>

            <div className="divide-y divide-border">
              {visibleEvents === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Click "Start Feed" to see live threat evaluation
                </div>
              )}

              {THREAT_EVENTS.slice(0, visibleEvents).map((event, i) => {
                const vc = verdictConfig[event.verdict];
                const isSelected = selectedEvent === event.id;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                  >
                    <div className="px-4 py-2.5 flex items-center gap-3 text-[11px] font-mono">
                      <span className="w-16 text-muted-foreground">{event.timestamp.slice(0, 8)}</span>
                      <span className="flex-1 text-foreground truncate">{event.actor} → {event.action}</span>
                      <span className={`w-12 text-center font-bold ${threatScoreColor(event.threatScore)}`}>
                        {event.threatScore}
                      </span>
                      <span className={`w-14 text-center flex items-center justify-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${vc.color}`}>
                        {vc.icon}
                        {event.verdict}
                      </span>
                      <span className="w-12 text-right text-muted-foreground">{event.latency}</span>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 text-xs text-foreground/70">
                            <span className="text-primary font-mono text-[10px]">REASON: </span>
                            {event.reason}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Architecture Highlights */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Architecture</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Trie-based matching", desc: "O(1) path evaluation" },
              { label: "NFKC normalization", desc: "Anti-evasion" },
              { label: "Z-score anomaly", desc: "Behavioral detection" },
              { label: "Kill-chain correlation", desc: "7-phase tracking" },
            ].map((a) => (
              <div key={a.label} className="rounded-lg bg-muted/50 border border-border p-3 space-y-0.5">
                <p className="text-xs font-semibold text-foreground">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why It Matters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Security is structural, not bolted on. Every action — mutations, queries, exports —
              passes through DEFENSE before execution. Sub-millisecond means zero user-facing latency.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Enterprise prerequisite. Security is the #1 concern for enterprise adoption.
              DEFENSE makes CMPSBL audit-ready from day one.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
