/**
 * Proof Mode — Public Substrate Demo Surface
 * Read-only, rate-limited trial of the promptfluid® substrate
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, MessageSquare, Moon, Play, RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { substrate } from "@/lib/substrate";

// Types
type Scenario = "health" | "decode" | "dream";
type BannerType = "idle" | "success" | "error" | "limit";

interface StatusBanner {
  type: BannerType;
  message: string;
}

interface RateLimitData {
  runs: number;
  hourStart: number;
}

const RATE_LIMIT_KEY = "pf_proof_mode_session";
const MAX_RUNS_PER_HOUR = 10;

// Scenario configs
const scenarios = [
  {
    id: "health" as Scenario,
    label: "Substrate Health Ping",
    description: "Calls vision.health() and returns system health snapshot.",
    icon: Activity,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "decode" as Scenario,
    label: "Decode Demo",
    description: "Runs a decode.chat() call with a fixed substrate-interpretation prompt.",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "dream" as Scenario,
    label: "Dream-Eater Ping",
    description: "Feeds a canned dream snippet for acknowledgement only.",
    icon: Moon,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
];

// Error boundary fallback
function ProofModeFallback() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Proof Mode collapsed harder than intended.
          </h1>
          <p className="text-muted-foreground">
            If you're seeing this, the demo surface broke before the substrate did. Respect.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </main>
      <EnhancedFooter />
    </div>
  );
}

function ProofModeContent() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("health");
  const [runsThisSession, setRunsThisSession] = useState(0);
  const [lastRunAt, setLastRunAt] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [requestPayload, setRequestPayload] = useState<Record<string, unknown> | null>(null);
  const [responsePayload, setResponsePayload] = useState<Record<string, unknown> | null>(null);
  const [statusBanner, setStatusBanner] = useState<StatusBanner>({ type: "idle", message: "" });

  // Load rate limit data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        const data: RateLimitData = JSON.parse(stored);
        const now = Date.now();
        const hourAgo = now - 60 * 60 * 1000;
        
        // Reset if hour has passed
        if (data.hourStart < hourAgo) {
          localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ runs: 0, hourStart: now }));
          setRunsThisSession(0);
        } else {
          setRunsThisSession(data.runs);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Build request payload for scenario
  const buildPayload = useCallback((scenario: Scenario): Record<string, unknown> => {
    switch (scenario) {
      case "health":
        return {
          module: "vision",
          action: "health",
          payload: {},
        };
      case "decode":
        return {
          module: "decode",
          action: "chat",
          payload: {
            message: "In three sentences, interpret what the promptfluid® substrate does based on its own description.",
            session_id: "proof_demo",
          },
        };
      case "dream":
        return {
          module: "dream",
          action: "feed",
          payload: {
            dream_text: "I was walking through a corridor of routers, each humming with latent intent.",
            dream_type: "dream",
          },
        };
    }
  }, []);

  // Execute scenario
  const runScenario = async () => {
    // Rate limit check
    if (runsThisSession >= MAX_RUNS_PER_HOUR) {
      setStatusBanner({
        type: "limit",
        message: "Throttle engaged. Proof Mode is not a DDoS-as-a-service. Try again later.",
      });
      return;
    }

    setIsRunning(true);
    setStatusBanner({ type: "idle", message: "" });
    
    const payload = buildPayload(selectedScenario);
    setRequestPayload(payload);
    setResponsePayload(null);

    try {
      let response;
      
      // Try helpers first, fall back to invoke
      switch (selectedScenario) {
        case "health":
          response = await substrate.vision.health();
          break;
        case "decode":
          response = await substrate.decode.chat(
            "In three sentences, interpret what the promptfluid® substrate does based on its own description.",
            "proof_demo"
          );
          break;
        case "dream":
          // Dream module uses direct invoke
          response = await substrate.invoke({
            module: "dream",
            action: "feed",
            payload: {
              dream_text: "I was walking through a corridor of routers, each humming with latent intent.",
              dream_type: "dream",
            },
          });
          break;
      }

      setResponsePayload(response as Record<string, unknown>);
      
      // Set banner based on response
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          setStatusBanner({
            type: "success",
            message: "200 OK — substrate acknowledged your existence and replied like a civilized system.",
          });
        } else {
          setStatusBanner({
            type: "error",
            message: "200 OK, but success:false — spiritually a 500. The router delivered it; the brain shrugged.",
          });
        }
      }

      // Update rate limit
      const newRuns = runsThisSession + 1;
      setRunsThisSession(newRuns);
      setLastRunAt(Date.now());
      
      try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        const now = Date.now();
        let hourStart = now;
        
        if (stored) {
          const data: RateLimitData = JSON.parse(stored);
          const hourAgo = now - 60 * 60 * 1000;
          if (data.hourStart >= hourAgo) {
            hourStart = data.hourStart;
          }
        }
        
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ runs: newRuns, hourStart }));
      } catch {
        // Ignore localStorage errors
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setResponsePayload({ error: errorMessage });
      setStatusBanner({
        type: "error",
        message: "💥 Upstream failure. Either the router is sulking, the substrate rebooted, or the Dream-Eater chewed through a cable.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const remainingRuns = Math.max(0, MAX_RUNS_PER_HOUR - runsThisSession);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-border">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 text-xs tracking-wide">
                Trial Surface • Read-only • Rate-limited
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Proof Mode: Substrate Live Test
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                A public, read-only surface that proves the promptfluid® substrate is real, live, 
                and doing work — without giving the whole brain away.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Mode: Trial Surface • Scope: Read-only • No Agents • No Arbitrary Calls
              </p>
            </div>
          </div>
        </section>

        {/* Rate Limit Status */}
        <section className="py-4 border-b border-border bg-muted/30">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {remainingRuns} / {MAX_RUNS_PER_HOUR} runs remaining this hour
              </span>
              {remainingRuns <= 3 && remainingRuns > 0 && (
                <Badge variant="secondary" className="text-xs">Low</Badge>
              )}
              {remainingRuns === 0 && (
                <Badge variant="destructive" className="text-xs">Exhausted</Badge>
              )}
            </div>
          </div>
        </section>

        {/* Demo Cards */}
        <section className="py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
              Select a Demo Scenario
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                const isSelected = selectedScenario === scenario.id;
                
                return (
                  <motion.div
                    key={scenario.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all h-full ${
                        isSelected
                          ? `${scenario.borderColor} border-2 ${scenario.bgColor}`
                          : "border-border hover:border-border/80"
                      }`}
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${scenario.bgColor}`}>
                            <Icon className={`w-5 h-5 ${scenario.color}`} />
                          </div>
                          <CardTitle className="text-base">{scenario.label}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {scenario.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Run Button */}
            <div className="flex justify-center mb-8">
              <Button
                size="lg"
                onClick={runScenario}
                disabled={isRunning || remainingRuns === 0}
                className="min-w-[200px]"
              >
                {isRunning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Activity className="w-4 h-4" />
                    </motion.div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run {scenarios.find(s => s.id === selectedScenario)?.label}
                  </>
                )}
              </Button>
            </div>

            {/* Status Banner */}
            <AnimatePresence mode="wait">
              {statusBanner.type !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8"
                >
                  <div
                    className={`p-4 rounded-lg border flex items-start gap-3 ${
                      statusBanner.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : statusBanner.type === "limit"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {statusBanner.type === "success" ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : statusBanner.type === "limit" ? (
                      <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{statusBanner.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Request/Response Display */}
            {(requestPayload || responsePayload) && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Request */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Request Payload
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs text-foreground/80 overflow-x-auto p-3 bg-background rounded-lg border border-border">
                      {requestPayload ? JSON.stringify(requestPayload, null, 2) : "—"}
                    </pre>
                  </CardContent>
                </Card>

                {/* Response */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Response Payload
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs text-foreground/80 overflow-x-auto p-3 bg-background rounded-lg border border-border max-h-80 overflow-y-auto">
                      {responsePayload ? JSON.stringify(responsePayload, null, 2) : isRunning ? "Awaiting response..." : "—"}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 border-t border-border">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <p className="text-xs text-muted-foreground/60">
              Proof Mode is not a benchmarking tool. It's a witness surface.
            </p>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}

// Main export with error boundary
export default function ProofModePage() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return <ProofModeFallback />;
  }

  try {
    return <ProofModeContent />;
  } catch {
    return <ProofModeFallback />;
  }
}
