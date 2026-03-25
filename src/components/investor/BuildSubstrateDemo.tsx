/**
 * Build With the Substrate Demo — Tier 1.4
 * Guided Build Panel: Generate → Capabilities → Run → Export → Standalone
 * Visual wrapper — no CLI, no terminal, no typing.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Package, Cpu, Play, Download, Globe,
  CheckCircle, ChevronDown, Brain, Shield, Sparkles, Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { num: 1 as Step, label: "Generate", icon: <Cpu className="w-3.5 h-3.5" /> },
  { num: 2 as Step, label: "Capabilities", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { num: 3 as Step, label: "Run", icon: <Play className="w-3.5 h-3.5" /> },
  { num: 4 as Step, label: "Export", icon: <Download className="w-3.5 h-3.5" /> },
  { num: 5 as Step, label: "Standalone", icon: <Globe className="w-3.5 h-3.5" /> },
];

const CAPABILITIES = [
  { name: "Memory", desc: "Persists data across runs — remembers previous sessions", icon: <Brain className="w-4 h-4" />, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { name: "DREAM", desc: "Learns from usage patterns — improves over time", icon: <Sparkles className="w-4 h-4" />, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  { name: "DEFENSE", desc: "Built-in threat detection — safe by default", icon: <Shield className="w-4 h-4" />, color: "text-green-500 bg-green-500/10 border-green-500/20" },
];

const EXPORT_FILES = [
  { name: "src/", type: "folder", desc: "Application source code" },
  { name: "runtime/", type: "folder", desc: "CMPSBL mini-runtime (standalone)" },
  { name: "config.cmpsbl.json", type: "file", desc: "Capability configuration" },
  { name: "package.json", type: "file", desc: "Dependencies & scripts" },
  { name: "README.md", type: "file", desc: "Setup & usage docs" },
];

const CLI_EXAMPLES = [
  { cmd: "cmpsbl init my-app --template smart-tool", desc: "Scaffold a new app" },
  { cmd: "cmpsbl capabilities add DREAM DEFENSE", desc: "Wire capabilities" },
  { cmd: "cmpsbl export --target standalone", desc: "Export for deployment" },
];

const CONVERSATION = [
  { role: "user" as const, text: "What's the weather in Tokyo?" },
  { role: "app" as const, text: "It's 22°C and partly cloudy in Tokyo. I'll remember you're interested in Tokyo weather." },
  { role: "user" as const, text: "And New York?" },
  { role: "app" as const, text: "New York is 18°C with light rain. I've noted both cities — I'll prioritize Tokyo and New York in future weather checks." },
];

interface BuildSubstrateDemoProps {
  onBack: () => void;
}

export const BuildSubstrateDemo = ({ onBack }: BuildSubstrateDemoProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [conversationIdx, setConversationIdx] = useState(0);
  const [showCli, setShowCli] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setCurrentStep(2);
    }, 1800);
  }, []);

  const handleRun = () => {
    if (conversationIdx < CONVERSATION.length) {
      const timer = setInterval(() => {
        setConversationIdx((prev) => {
          if (prev >= CONVERSATION.length - 1) {
            clearInterval(timer);
            return CONVERSATION.length;
          }
          return prev + 1;
        });
      }, 900);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Showcase
        </button>
        <span className="text-[10px] font-mono text-muted-foreground">TIER 1 · PLATFORM</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Build With the Substrate</h1>
              <p className="text-xs text-muted-foreground">Software creation with intelligence built in</p>
            </div>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-1">
              <button
                onClick={() => generated && setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap ${
                  currentStep === s.num
                    ? "bg-primary/10 border border-primary/20 text-primary"
                    : currentStep > s.num || (s.num === 1 && generated)
                    ? "bg-green-500/5 border border-green-500/20 text-green-600 dark:text-green-400"
                    : "bg-muted border border-border text-muted-foreground"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
              {i < STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Generate */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 text-center space-y-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 1 — Generate App</p>
                <h3 className="text-lg font-semibold text-foreground">One click. Instant app.</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a working application with memory, learning, and security already wired in.
                </p>

                {generating ? (
                  <div className="space-y-3 py-4">
                    <Progress value={75} className="h-2 max-w-xs mx-auto" />
                    <p className="text-xs font-mono text-muted-foreground animate-pulse">Scaffolding smart-weather-tool…</p>
                  </div>
                ) : generated ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">smart-weather-tool generated</span>
                  </div>
                ) : (
                  <Button size="lg" className="gap-2" onClick={handleGenerate}>
                    <Cpu className="w-4 h-4" />
                    Generate Example App
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Capabilities */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 2 — Built-In Capabilities</p>
              <p className="text-sm text-muted-foreground">
                No setup required. These capabilities are already wired into the generated app:
              </p>
              <div className="space-y-3">
                {CAPABILITIES.map((cap, i) => (
                  <motion.div
                    key={cap.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-xl border p-4 flex items-start gap-3 ${cap.color}`}
                  >
                    <div className="mt-0.5">{cap.icon}</div>
                    <div>
                      <h4 className="text-sm font-semibold">{cap.name}</h4>
                      <p className="text-xs opacity-80">{cap.desc}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 shrink-0 ml-auto mt-0.5" />
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="gap-1.5" onClick={() => setCurrentStep(3)}>
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Run */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 3 — Run the App</p>
              <p className="text-sm text-muted-foreground">
                Watch the app respond <span className="font-semibold text-foreground">and remember</span>. The second question proves persistence.
              </p>

              {/* Conversation */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border bg-muted/30">
                  <span className="text-[10px] font-mono text-muted-foreground">smart-weather-tool · running</span>
                </div>
                <div className="p-4 space-y-3 min-h-[200px]">
                  {CONVERSATION.slice(0, conversationIdx + 1).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border border-border text-foreground"
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {conversationIdx === 0 && (
                    <div className="text-center pt-6">
                      <Button size="sm" className="gap-1.5" onClick={handleRun}>
                        <Play className="w-3.5 h-3.5" />
                        Run Conversation
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {conversationIdx >= CONVERSATION.length - 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                  <Button size="sm" className="gap-1.5" onClick={() => setCurrentStep(4)}>
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Export */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 4 — Export</p>
              <p className="text-sm text-muted-foreground">
                The complete app — code, runtime, and config — packaged as a downloadable ZIP.
              </p>

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">smart-weather-tool.zip</span>
                  <span className="text-[10px] font-mono text-muted-foreground">~2.4 MB</span>
                </div>
                <div className="p-4 space-y-1.5">
                  {EXPORT_FILES.map((f) => (
                    <div key={f.name} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{f.type === "folder" ? "📁" : "📄"}</span>
                        <span className="text-xs font-mono text-foreground">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Download ZIP
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => setCurrentStep(5)}>
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Standalone */}
          {currentStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 5 — Runs Anywhere</p>

              <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-6 text-center space-y-4">
                <Globe className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-lg font-bold text-foreground">
                  This runs outside CMPSBL
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No dependency on the full system. The exported app includes a self-contained runtime
                  with memory, learning, and security — ready to deploy on any platform.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {["Vercel", "AWS", "Docker", "Bare metal"].map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Under the Hood — CLI (collapsed) */}
        <div className="space-y-2">
          <button
            onClick={() => setShowCli(!showCli)}
            className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <Terminal className="w-3 h-3" />
            Powered by CMPSBL CLI (60+ commands)
            <ChevronDown className={`w-3 h-3 transition-transform ${showCli ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showCli && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  {CLI_EXAMPLES.map((ex) => (
                    <div key={ex.cmd} className="flex flex-col gap-0.5 py-1.5 border-b border-border last:border-0">
                      <code className="text-[11px] font-mono text-foreground">$ {ex.cmd}</code>
                      <span className="text-[10px] text-muted-foreground">{ex.desc}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground pt-1">
                    Static examples — the CLI powers what you see above.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Why It Matters + Business Value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              This bridges "impressive system" to "investable platform." Developers build apps
              with intelligence already built in — memory, learning, and security are not bolted on.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Platform economics. Every app built on the substrate is recurring revenue.
              Every export proves independence — no vendor lock-in.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
