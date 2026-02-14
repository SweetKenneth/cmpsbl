/**
 * Composable Cognitives — Black-ops storefront
 * 5 paid ($39) + 1 free (Hybrid) downloadable cognitive agents
 */

import { useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Download, ExternalLink, Sparkles, Shield, Terminal, Code,
  Zap, CheckCircle, Mail, Phone, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { NameChooser } from "@/components/cognitives/NameChooser";
import { COGNITIVES_CATALOG, INSTALL_SNIPPETS, type CognitiveItem } from "@/lib/cognitives/catalog";
import { validateCognitiveName } from "@/lib/cognitives/nameGen";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Creature images
import researchImg from "@/assets/cognitives/research.png";
import codingImg from "@/assets/cognitives/coding.png";
import analystImg from "@/assets/cognitives/analyst.png";
import opsImg from "@/assets/cognitives/ops.png";
import writerImg from "@/assets/cognitives/writer.png";
import hybridImg from "@/assets/cognitives/hybrid.png";

const IMAGE_MAP: Record<string, string> = {
  research: researchImg,
  coding: codingImg,
  analyst: analystImg,
  ops: opsImg,
  writer: writerImg,
  hybrid: hybridImg,
};

const ACCENT_COLORS: Record<string, string> = {
  cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  purple: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  pink: "from-pink-500/20 to-pink-500/5 border-pink-500/30",
  gold: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
};

const ACCENT_TEXT: Record<string, string> = {
  cyan: "text-cyan-400",
  green: "text-emerald-400",
  purple: "text-violet-400",
  orange: "text-orange-400",
  pink: "text-pink-400",
  gold: "text-amber-400",
};

function CognitiveCard({ item, chosenName, onBuy }: { item: CognitiveItem; chosenName: string; onBuy: (sku: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      await onBuy(item.sku);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn(
        "relative overflow-hidden border bg-gradient-to-b transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group",
        ACCENT_COLORS[item.accentColor]
      )}>
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
        }} />

        <CardContent className="p-6 space-y-4 relative">
          {/* Header: Image + Title */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-background/50 border border-border/50 overflow-hidden shrink-0 p-1">
              <img src={IMAGE_MAP[item.imagePath]} alt={item.displayName} className="w-full h-full object-contain" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg">{item.displayName}</h3>
                <Badge variant="outline" className={cn("text-[10px] font-mono", ACCENT_TEXT[item.accentColor])}>
                  {item.className}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{item.tagline}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {item.isFree ? (
              <span className="text-2xl font-black text-amber-400">FREE</span>
            ) : (
              <span className="text-2xl font-black">$39</span>
            )}
            <span className="text-xs text-muted-foreground font-mono">/ one-time download</span>
          </div>

          {/* Capabilities */}
          <div className="space-y-1.5">
            {item.capabilities.slice(0, 3).map((cap, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", ACCENT_TEXT[item.accentColor])} />
                <span>{cap}</span>
              </div>
            ))}
          </div>

          {/* Expandable enhancements */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide" : "Show"} enhancements ({item.enhancements.length})
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                {item.enhancements.map((enh, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Sparkles className={cn("w-3 h-3 mt-0.5 shrink-0", ACCENT_TEXT[item.accentColor])} />
                    <span>{enh}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <Button
            onClick={handleBuy}
            disabled={loading}
            className="w-full gap-2 font-mono"
            variant={item.isFree ? "outline" : "default"}
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : item.isFree ? (
              <>
                <Download className="w-4 h-4" />
                Free Download
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Buy & Download — $39
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ComposableCognitives() {
  const [searchParams] = useSearchParams();
  const [chosenName, setChosenName] = useState("");
  const { user } = useAuth();
  const canceled = searchParams.get("canceled") === "1";

  const handleBuy = useCallback(async (sku: string) => {
    const validation = validateCognitiveName(chosenName);
    if (!validation.valid) {
      alert(validation.error || "Please enter a valid name");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("cognitives-checkout", {
        body: { sku, chosenName },
      });

      if (error) throw error;

      if (data?.free && data?.redirect) {
        window.location.href = data.redirect;
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again.");
    }
  }, [chosenName]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Composable Cognitives — CMPSBL®</title>
        <meta name="description" content="Own superpowered AI agents. Download once. Run anywhere. 5 specialized cognitives at $39 each + 1 free Hybrid." />
      </Helmet>

      <PublicNav />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Ambient grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="outline" className="font-mono text-xs tracking-widest border-primary/30">
              CLASSIFIED ASSETS • CMPSBL® SUBSTRATE
            </Badge>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              Composable{" "}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Cognitives
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Own superpowered agents. Download once. Run anywhere.
              <br />
              <span className="text-foreground font-medium">5 specialized cognitives at $39 each</span> + 1 free Hybrid.
            </p>

            {/* Name Chooser */}
            <div className="max-w-sm mx-auto">
              <NameChooser value={chosenName} onChange={setChosenName} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Canceled alert */}
      {canceled && (
        <div className="container mx-auto px-4 pb-6">
          <Alert className="max-w-2xl mx-auto border-orange-500/30 bg-orange-500/5">
            <AlertDescription>
              Checkout was canceled. No charge was made. You can try again anytime.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Cognitive Cards Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {COGNITIVES_CATALOG.map((item) => (
            <CognitiveCard
              key={item.sku}
              item={item}
              chosenName={chosenName}
              onBuy={handleBuy}
            />
          ))}
        </div>
      </section>

      {/* Install Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Install in 3 minutes</h2>
            <p className="text-sm text-muted-foreground">Every cognitive ships as a self-contained runtime. No cloud dependency.</p>
          </div>

          <Tabs defaultValue="node" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="node" className="font-mono text-xs"><Terminal className="w-3 h-3 mr-1" /> Node</TabsTrigger>
              <TabsTrigger value="http" className="font-mono text-xs"><Code className="w-3 h-3 mr-1" /> HTTP</TabsTrigger>
              <TabsTrigger value="langchain" className="font-mono text-xs">LangChain</TabsTrigger>
              <TabsTrigger value="crewai" className="font-mono text-xs">CrewAI</TabsTrigger>
            </TabsList>
            {Object.entries(INSTALL_SNIPPETS).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/50">
                  <code>{code}</code>
                </pre>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Licensing & Ownership */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">You Own It</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div className="space-y-3">
                  <h3 className="text-foreground font-semibold">Licensing</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> MIT License — use, modify, distribute</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> One-time purchase, no subscriptions</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> No runtime license checks after download</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> All processing runs locally in your environment</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-foreground font-semibold">Black-Box Enforcement</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> You own the artifact you buy (MIT)</li>
                    <li className="flex gap-2"><Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> Protected internals are compiled/bundled</li>
                    <li className="flex gap-2"><Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> APIs + configs are fully documented</li>
                    <li className="flex gap-2"><Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> No telemetry, no cloud callbacks</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support Panel */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-xl font-bold">Need Help?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:help@CMPSBL.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" /> help@CMPSBL.com
            </a>
            <span className="hidden sm:inline text-border">|</span>
            <a href="tel:+17603548324" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" /> (760) FLUID-AI
            </a>
            <span className="hidden sm:inline text-border">|</span>
            <Link to="/support" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
              <ExternalLink className="w-4 h-4" /> Support Page
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
