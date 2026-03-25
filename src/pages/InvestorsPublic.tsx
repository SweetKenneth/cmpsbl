/**
 * CMPSBL® — Investor Relations
 * CMPSBL® — Investor Relations
 */

import { TrendingUp, DollarSign, Users, Rocket, FileText, BarChart, Award, Target, Brain, Download, Loader2, Shield, Eye, Server, Sparkles, Zap, Globe, Code, Layers, CheckCircle2 } from "lucide-react";
import { useMetric } from "@/stores/publicMetricsStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { downloadInvestorDeck } from "@/lib/investor-deck-generator";
import { downloadUserGuide } from "@/lib/user-guide-generator";

const WORLD_FIRSTS = [
  { title: "Autonomous AI Dream State", desc: "First AI to enter a background processing state for memory consolidation", badge: "Zenodo Verified" },
  { title: "Self-Improving Bounded Agent", desc: "First verifiable self-improving AI with cryptographic evolution stamps", badge: "SEBA" },
  { title: "40-Module Platform", desc: "First AI infrastructure with 40 modules across 12 groups and hot-swappable security layers", badge: "Production" },
  { title: "Capability Crystallization", desc: "First emergent capability discovery with autonomous cross-system composition", badge: "50 Crystallized" },
  { title: "Natural Language → Code", desc: "First governed natural-language-to-code execution with safety gates", badge: "ENCODE Agent" },
  { title: "Graduated Autonomy Framework", desc: "First mastery-based AI code execution (Novice → Master)", badge: "ENCODE Agent" },
  { title: "Continuous Learning", desc: "First 24/7 server-side autonomous learning independent of browser sessions", badge: "CLM" },
  { title: "Universal Memory Routing", desc: "First automatic memory routing from BRAIN Organ to all systems via relevance scoring", badge: "CLM" },
  { title: "Memory Temperature Tiering", desc: "First hot/warm/cold memory tiering with staleness detection", badge: "MEMORY Organ" },
  { title: "Actor Reputation Scoring", desc: "First AI identity system with 5-tier trust scores and cross-agency portability", badge: "IDENTITY Organ" },
  { title: "Multi-Provider Fleet Routing", desc: "First health-weighted routing with task-type-to-provider affinity mapping", badge: "NEXUS Organ" },
  { title: "AI Governance Namespace", desc: "First published namespace standard (AIGVRN v1.0) for AI governance terminology", badge: "Zenodo" },
  { title: "Predictive Cost Forecasting", desc: "First linear regression cost forecasting with per-capability attribution for AI ops", badge: "ECONOMY Engine" },
  { title: "Cascade Failure Prevention", desc: "First proactive cascade failure detection across system dependency graphs", badge: "RIPPLE Organ" },
];

export default function InvestorsPublic() {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadingGuide, setDownloadingGuide] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const modulesCount = useMetric('modulesCount');
  const layersCount = useMetric('layersCount');
  const stierPipelinesCount = useMetric('stierPipelinesCount');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadDeck = () => {
    setDownloading(true);
    try {
      downloadInvestorDeck();
      toast.success("Investor deck downloaded", { description: "Open the HTML file in any browser to view." });
    } catch (err) {
      console.error('Error generating deck:', err);
      toast.error("Failed to generate investor deck");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadGuide = () => {
    setDownloadingGuide(true);
    try {
      downloadUserGuide();
      toast.success("User guide downloaded", { description: "Open the HTML file in any browser to view." });
    } catch (err) {
      console.error('Error generating guide:', err);
      toast.error("Failed to generate user guide");
    } finally {
      setDownloadingGuide(false);
    }
  };

  const metrics = [
    { icon: Layers, label: "Primitives", value: "40", color: "text-primary" },
    { icon: Zap, label: "Crystallized Capabilities", value: String(stierPipelinesCount), color: "text-neon-green" },
    { icon: Award, label: "World Firsts", value: "14", color: "text-neon-amber" },
    { icon: Globe, label: "Capabilities", value: "675+", color: "text-neon-purple" }
  ];

  const products = [
    { icon: Brain, name: "BRAIN Organ", subtitle: "Persistent Memory", description: "Multi-tier memory architecture with autonomous learning, staleness detection, and hot/warm/cold tiering." },
    { icon: Eye, name: "VISION Agent", subtitle: "Monitoring", description: "Real-time introspection, metrics collection, and system-wide transparency across all 40 modules." },
    { icon: Shield, name: "DEFENSE Layer", subtitle: "Security", description: "Bot protection, threat detection, and governance guardrails — outermost security layer." },
    { icon: Server, name: "NEXUS Organ", subtitle: "Multi-Provider Routing", description: "Health-weighted routing across 5+ providers with task-type affinity mapping." },
    { icon: Code, name: "ENCODE Agent", subtitle: "Governed Execution", description: "Natural-language-to-code with graduated autonomy (Novice → Master) safety thresholds." },
    { icon: Sparkles, name: "INTENT Layer", subtitle: "Capability Discovery", description: "Systems advertise, compose, and discover cross-system capabilities autonomously." },
  ];

  const highlights = [
    { icon: Rocket, title: "Platform Infrastructure", description: `40 modules across 12 groups with 675+ capabilities. Self-improving architecture with cryptographic verification.` },
    { icon: DollarSign, title: "Revenue Model", description: "Tiered SaaS (Free → $79/mo) + self-hosted licensing + capability marketplace + engine licensing. 90%+ gross margins." },
    { icon: BarChart, title: "Compounding Moat", description: "Self-improvement + accumulated capabilities + deep modular architecture = a technical gap that widens daily." },
    { icon: FileText, title: "Documented IP", description: "14 documented world firsts with Zenodo DOI deposits. AI Governance Reference Namespace (AIGVRN v1.0) published." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Investors — Seed Round Open | CMPSBL®"
        description="Invest in CMPSBL: 14 documented world firsts, 90%+ gross margins, and a compounding technical moat. AI platform with Zenodo-verified IP. Seed round now open."
        canonical="https://cmpsbl.com/investors"
        keywords={['CMPSBL investment', 'AI seed round', 'AI startup funding', 'AI platform investment']}
      />
      
      <PublicNav />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-neon-purple/5 blur-[100px]" />
      </div>

      {/* Hero */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <TrendingUp className="w-3 h-3 mr-2" />
            Seed Round Open
          </Badge>
          
          <div className="text-xs font-mono text-muted-foreground/60 uppercase tracking-[0.3em] mb-4">CMPSBL · Investor Relations</div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground mb-6">
            Seeking <span className="font-medium text-primary">Seed Investment</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Building CMPSBL — the composable AI platform where raw signals become production-ready software. 
            40 modules across 12 groups, 675+ capabilities, and 14 documented world firsts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg"
              onClick={handleDownloadDeck}
              disabled={downloading}
              className="bg-gradient-to-r from-primary to-neon-purple hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {downloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
              {downloading ? "Generating..." : "Download Investor Deck"}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleDownloadGuide}
              disabled={downloadingGuide}
            >
              {downloadingGuide ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
              {downloadingGuide ? "Generating..." : "Download User Guide"}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:Dev@CMPSBL.com'}
            >
              Contact Founder
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className={`relative z-10 border-y border-border/30 bg-card/30 backdrop-blur-sm transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <metric.icon className={`w-8 h-8 mx-auto mb-3 ${metric.color}`} />
                <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground font-mono tabular-nums">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Firsts */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-7 h-7 text-neon-amber" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">14 Documented World Firsts</h2>
        </div>
        <p className="text-muted-foreground mb-8 text-sm italic max-w-3xl">
          To the best of our knowledge, the following are industry firsts achieved by CMPSBL® through the Memory Stream substrate. We welcome any evidence of prior art.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {WORLD_FIRSTS.map((wf, i) => (
            <Card key={i} className="p-5 bg-card/60 backdrop-blur border-border/50 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 group">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                  <h3 className="text-sm font-semibold text-foreground">{wf.title}</h3>
                </div>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 shrink-0 border-primary/30 text-primary">
                  {wf.badge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{wf.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Zenodo */}
      <section className={`relative z-10 container mx-auto px-6 py-8 transition-all duration-1000 delay-350 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <a 
          href="https://zenodo.org/records/18234910?token=eyJhbGciOiJIUzUxMiJ9.eyJpZCI6IjkxZDYzZjFlLWM2NTctNDAzNi04ZWE4LTIzNWNiMDljMGQ2NyIsImRhdGEiOnt9LCJyYW5kb20iOiIzZTlkMjA5MzQ0ZGFkNDI2ZTZlMTkwMWYxMzFmOTczYSJ9.H3FugoEHTR2ilPEtZEr-kqRiTgW0FeUDXOrcEE92lek4FK0_h0dNUyJWvtxW-KCHuIEeiqbN5Zot8EqEvXq5gQ" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block max-w-4xl"
        >
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-8 hover:border-primary/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <Badge className="bg-neon-green/10 text-neon-green border-neon-green/30">Zenodo DOI Verified</Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">World's First Autonomous Dreaming AI</h2>
            <p className="text-muted-foreground">
              SimNap → Cascade architecture with DOI deposit: 10.5281/zenodo.18234910
              <span className="text-primary ml-2 group-hover:underline">View on Zenodo →</span>
            </p>
          </div>
        </a>
      </section>

      {/* Product Portfolio */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 delay-400 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-foreground">The Memory Stream</h2>
        <p className="text-muted-foreground mb-10 text-lg max-w-2xl">
          40 primitives across 4 categories. A continuous substrate of evolving software — production-ready cognitive infrastructure.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card key={index} className="p-6 bg-card/60 backdrop-blur border-border/50 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <product.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-foreground">{product.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{product.subtitle}</p>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Investment Highlights */}
      <section className={`relative z-10 py-16 transition-all duration-1000 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-12 text-foreground">Investment Highlights</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {highlights.map((highlight, index) => (
              <Card key={index} className="p-6 bg-card/60 backdrop-blur border-border/50 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <highlight.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{highlight.title}</h3>
                <p className="text-muted-foreground">{highlight.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Publication */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 delay-550 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Card className="p-8 bg-card/60 backdrop-blur border-border/50 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <Badge className="bg-primary/10 text-primary border-primary/30">January 2026</Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
            Memory Stream Publication & Research Artifact
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            In January 2026, the CMPSBL Memory Stream was formally published as a research artifact 
            and indexed under a persistent DOI — positioning it as a standards-bearing cognitive 
            architecture suitable for enterprise, interoperability frameworks, and academic collaboration.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/publication')}>View DOI</Button>
            <Button variant="outline" onClick={() => navigate('/substrate')}>Technical Spec</Button>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className={`relative z-10 container mx-auto px-6 py-20 transition-all duration-1000 delay-600 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-foreground">Ready to Explore the Stream?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            Download our investor deck, the user guide, or reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleDownloadDeck}
              disabled={downloading}
              className="bg-gradient-to-r from-primary to-neon-purple hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {downloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
              {downloading ? "Generating..." : "Download Investor Deck"}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:Dev@CMPSBL.com'}
            >
              Email Founder
            </Button>
          </div>
        </div>
      </section>

      <RelatedCapabilities />
      <PageSEOBlock path="/investors" title="Investor Overview" faq={[
        { question: "What market does CMPSBL address?", answer: "CMPSBL targets the AI infrastructure market — the operating system layer between foundation models and applications. This is the fastest-growing segment of AI, projected to exceed $100B by 2028." },
        { question: "What is CMPSBL's business model?", answer: "Usage-based SaaS with tiered plans. Free Builder tier drives adoption, with Studio, Creator, and Architect tiers for scaling. Enterprise custom deployments available." },
      ]} />
      <EnhancedFooter />
    </div>
  );
}
