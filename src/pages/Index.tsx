/**
 * promptfluid® — The Cognitive Substrate OS
 * v2026.01 — Compose cognition as software
 */

import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Layers, Code2, Terminal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Index() {
  const [showInterface, setShowInterface] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowInterface(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="PromptFluid — The Cognitive Substrate OS"
        description="Compose cognition as software. Modules for memory, agents, governance, observability, and execution. Multi-model, multi-agent, governed substrate SDK."
        canonical="https://promptfluid.com"
        keywords={['cognitive substrate', 'substrate OS', 'AI modules', 'agents', 'memory', 'governance', 'observability', 'execution', 'SDK', 'composition']}
      />

      <PublicNav />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/3" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        
        {/* Hero Section */}
        <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6 leading-tight transition-all duration-700 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              The Cognitive{" "}
              <span className="font-medium bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Substrate OS
              </span>
            </h1>
            
            <p 
              className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-100 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              Compose cognition as software. Modules, memory, agents, governance, execution.
            </p>

            <div 
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-200 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <Button asChild size="lg" className="rounded-xl px-6 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 transition-opacity">
                <Link to="/dev-portal">
                  <Layers className="w-4 h-4 mr-2" />
                  Browse Modules
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
                <Link to="/docs">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read the Docs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Substrate Explanation */}
        <section className="py-16 md:py-24 px-4 border-t border-border/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-6">
              A Substrate for Cognition
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              PromptFluid exposes the execution layer for cognitive systems. Developers compose substrate modules—agents, memory, policy, observability, and consensus—into governed cognitive applications.
            </p>
          </div>
        </section>

        {/* Composition Model */}
        <section className="py-16 md:py-24 px-4 bg-card/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-6">
              Composition, Not App Builders
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              The substrate treats cognition as a graph of modules. No chatbots. No assistants. Software that reasons, remembers, and adapts.
            </p>
          </div>
        </section>

        {/* Modules Surface */}
        <section className="py-16 md:py-24 px-4 border-t border-border/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-4">
              Substrate Modules
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Prebuilt substrate modules for cognition. Import, compose, and execute with policy and observability.
            </p>
            <Button asChild size="lg" className="rounded-xl px-6 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 transition-opacity">
              <Link to="/dev-portal">
                <Layers className="w-4 h-4 mr-2" />
                View Modules
              </Link>
            </Button>
          </div>
        </section>

        {/* Code Surface */}
        <section className="py-16 md:py-24 px-4 bg-card/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
              <Code2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-6">
              Code-First Execution
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              Everything in the substrate is code-first. No black boxes. No prompt guesswork. Deterministic composition with developer control.
            </p>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
              <Link to="/dev-portal">
                <Terminal className="w-4 h-4 mr-2" />
                View Code
              </Link>
            </Button>
          </div>
        </section>

        {/* Developer Ingress */}
        <section className="py-16 md:py-24 px-4 border-t border-border/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-6">
              For Developers
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              Designed for developers building agents, substrates, orchestration layers, scientific cognition, and operational intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="outline" className="rounded-xl px-5">
                <Link to="/docs">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read the Docs
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-5">
                <Link to="/docs/setup">
                  <Terminal className="w-4 h-4 mr-2" />
                  Setup Guide
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-5">
                <Link to="/docs/api">
                  <Code2 className="w-4 h-4 mr-2" />
                  API Reference
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
}
