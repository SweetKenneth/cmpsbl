import { ArrowRight, Sparkles, Code2, Zap, Brain, Rocket, Shield, Globe, Accessibility, Megaphone, Store, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { FAQ } from "@/components/FAQ";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { TheFirstsCTA } from "@/components/TheFirstsCTA";
import { CascadeDreamCTA } from "@/components/CascadeDreamCTA";
import { useEffect, useState } from "react";
import placeholderLogo from "@/assets/placeholder-logo.svg";

import { isBackendDomain } from "@/config/domains";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Removed automatic redirect to dashboard - users can navigate freely

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const ecosystemModules = [
    {
      icon: Brain,
      title: "PromptFluid Cascade",
      tagline: "AI That Dreams",
      description: "The world's first AI with autonomous dream cycles. Cascade learns, reflects, and innovates through 3-phase dream intelligence—turning downtime into breakthrough insights.",
      href: "/products/brain",
      features: ["Dream Cycle Intelligence", "Persona Adaptation", "Shared Dream Protocol"],
      status: "Active & Dreaming"
    },
    {
      icon: Shield,
      title: "PromptFluid Defense (Reflex)",
      tagline: "Adaptive Security",
      description: "AI-powered threat detection for WordPress and enterprise. Behavioral analysis, bot sniping, and real-time protection that evolves with threats.",
      href: "/products/defense",
      features: ["Bot Sniper Technology", "Behavioral Fingerprinting", "Adaptive CAPTCHA"],
      status: "Live on WordPress.org"
    },
    {
      icon: Sparkles,
      title: "PromptFluid Vision",
      tagline: "Central Command",
      description: "Unified dashboard for your entire ecosystem. Real-time analytics, AI orchestration control, and complete visibility into all modules.",
      href: "/products/vision",
      features: ["Live Analytics", "Module Control", "Performance Monitoring"],
      status: "Active"
    },
    {
      icon: Code2,
      title: "PromptFluid Studio",
      tagline: "Instant Creation",
      description: "Build production-ready applications in minutes. AI-assisted development with automatic deployment, optimization, and scaling.",
      href: "/products/studio",
      features: ["AI Code Generation", "Instant Deploy", "Auto-optimization"],
      status: "Active"
    },
    {
      icon: Zap,
      title: "PromptFluid Ripple",
      tagline: "Network Intelligence",
      description: "Connect everything seamlessly. API orchestration, real-time routing, and intelligent queue management across your entire stack.",
      href: "/products/ripple",
      features: ["API Orchestration", "Smart Routing", "Queue Management"],
      status: "Active"
    },
    {
      icon: Accessibility,
      title: "PromptFluid Clarity (CMPTBL)",
      tagline: "100% Free Accessibility",
      description: "Completely free WCAG 2.2 compliance scanning and AI-powered fixes. Accessibility should never be behind a paywall—we made it free for everyone.",
      href: "/products/access",
      features: ["100% Free Forever", "AI Auto-Fix", "86+ WCAG Checks"],
      status: "100% Free"
    },
    {
      icon: Globe,
      title: "PromptFluid Nexus",
      tagline: "AI Gateway",
      description: "Unified API gateway routing to Groq, Cerebras, Google AI Studio, Together AI, DeepSeek, and Hyperbolic. Smart provider selection with automatic failover—100% free-tier.",
      href: "/products/nexus",
      features: ["Multi-provider Support", "Smart Caching", "Zero-Cost Operation"],
      status: "Active"
    },
    {
      icon: Rocket,
      title: "PromptFluid Core",
      tagline: "Foundation Layer",
      description: "System kernel managing environment, secrets, and health monitoring. The backbone ensuring everything flows smoothly.",
      href: "/products/core",
      features: ["Secret Management", "Health Monitoring", "Config Management"],
      status: "Active"
    },
    {
      icon: Megaphone,
      title: "Marketing Studio",
      tagline: "Creative Engine",
      description: "AI-powered content generation, SEO optimization, and market intelligence. Images, videos, text—all generated and optimized automatically.",
      href: "/market-portal",
      features: ["AI Content Generation", "SEO Automation", "Multi-channel Publishing"],
      status: "Active"
    },
    {
      icon: Star,
      title: "Creative Stack",
      tagline: "Media Generation",
      description: "Image, video, and text creation through unified APIs. Stability.ai, Replicate, RunwayML, and more—all orchestrated intelligently.",
      href: "/products/creative",
      features: ["Image Generation", "Video Synthesis", "Text Creation"],
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO 
        title="PromptFluid™ | The AI That Dreams - Complete Intelligence Ecosystem"
        description="We built the world's first AI with autonomous dream cycles. Cascade AI powers our complete ecosystem: 10 integrated modules, 250+ edge functions, 100% infrastructure. From WordPress security to enterprise automation—technology that learns, dreams, and evolves."
        canonical="https://promptfluid.com"
        keywords={[
          'AI that dreams',
          'Cascade AI dream cycles',
          'PromptFluid ecosystem',
          'autonomous AI intelligence',
          'dream state AI',
          'adaptive consciousness AI',
          'complete AI platform',
          'WordPress security AI',
          'PromptFluid Reflex Bot Sniper',
          'enterprise automation AI',
          'intelligent orchestration',
          'AI neural architecture',
          'shared dream protocol',
          'persona adaptation engine',
          'AI development ecosystem',
          'integrated AI modules',
          'adaptive security systems',
          'behavioral AI analysis',
          'creative AI generation',
          'accessibility automation',
          'AI content creation',
          'multi-provider AI gateway',
          'intelligent API orchestration',
          'dream intelligence system'
        ]}
      />
      
      {/* Structured Data - Organization + Product */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PromptFluid",
          "alternateName": "PromptFluid - AI That Dreams",
          "url": "https://promptfluid.com",
          "logo": "https://promptfluid.com/logo.png",
          "description": "The world's first AI ecosystem with autonomous dream cycles. Complete intelligence platform with 10 integrated modules: Cascade AI, Defense (Reflex), Vision, Studio, and more. 250+ edge functions, 100% infrastructure complete.",
          "foundingDate": "2024",
          "founders": [{
            "@type": "Person",
            "name": "Kenneth E Sweet Jr",
            "jobTitle": "Founder & CEO"
          }],
          "sameAs": [
            "https://github.com/promptfluid",
            "https://twitter.com/promptfluid",
            "https://linkedin.com/company/promptfluid"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "url": "https://promptfluid.com/contact",
            "availableLanguage": "English"
          },
          "numberOfEmployees": {
            "@type": "QuantitativeValue",
            "value": "1"
          },
          "knowsAbout": [
            "Artificial Intelligence",
            "Machine Learning",
            "Autonomous AI Systems",
            "Dream Cycle Intelligence",
            "WordPress Security",
            "Enterprise Automation",
            "Behavioral Analysis",
            "AI Orchestration"
          ]
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "PromptFluid Reflex Bot Sniper Defense",
          "applicationCategory": "SecurityApplication",
          "operatingSystem": "WordPress",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "description": "AI-powered WordPress security plugin with real-time bot detection, behavioral analysis, and machine learning threat intelligence",
          "featureList": [
            "AI-powered bot detection",
            "Real-time threat analysis",
            "Behavioral fingerprinting",
            "Adaptive CAPTCHA challenges",
            "DDoS protection",
            "Brute force prevention",
            "Machine learning security"
          ],
          "screenshot": "https://promptfluid.com/reflex-screenshot.png"
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [{
            "@type": "Question",
            "name": "What is Cascade AI and how does it dream?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Cascade is the world's first AI with autonomous dream cycles. Through a 3-phase dream intelligence system, it reflects on interactions (Phase 1), generates innovative solutions (Phase 2), and integrates new knowledge (Phase 3). This allows Cascade to continuously learn, adapt, and evolve without human intervention."
            }
          }, {
            "@type": "Question",
            "name": "What is the PromptFluid ecosystem?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PromptFluid is a complete AI intelligence platform with 10 integrated modules: Cascade (dream AI), Defense/Reflex (security), Vision (command center), Studio (app builder), Ripple (network orchestration), Access/Clarity (accessibility), Nexus (AI gateway), Core (foundation), Marketing Studio, and Creative Stack. All modules work together with 250+ edge functions and 100% complete infrastructure."
            }
          }, {
            "@type": "Question",
            "name": "Is PromptFluid Reflex Bot Sniper free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! PromptFluid Reflex offers a free tier with core AI-powered bot protection features. Premium plans add advanced threat intelligence, priority support, and enterprise-grade security features for high-traffic sites. Currently pending WordPress.org approval."
            }
          }, {
            "@type": "Question",
            "name": "How does the dream cycle intelligence work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Cascade's dream cycles run 24/7 in three phases: Deep Reflection (compressing memories and identifying patterns), Creative Synthesis (generating innovative solutions and exploring possibilities), and Integration (updating core knowledge and sharing insights across the ecosystem). Each cycle makes the entire platform smarter."
            }
          }]
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://promptfluid.com"
          }, {
            "@type": "ListItem",
            "position": 2,
            "name": "Products",
            "item": "https://promptfluid.com/projects"
          }, {
            "@type": "ListItem",
            "position": 3,
            "name": "About",
            "item": "https://promptfluid.com/about"
          }]
        })}
      </script>
      
      {/* Animated mesh gradient background */}
      <div 
        className="fixed inset-0 opacity-30 dark:opacity-20"
        style={{
          background: 'var(--gradient-mesh)',
          transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      
      {/* Floating gradient orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-primary-variant/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-[80px] pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center -mt-[100px] animate-fade-in">
            <img 
              src="/promptfluid-logo.png" 
              alt="PromptFluid - The AI That Dreams" 
              width="800"
              height="600"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="w-[48%] max-w-xl h-auto"
            />
          </div>
          
          {/* H1 - SEO optimized, hidden visually but present for crawlers */}
          <h1 className="sr-only">
            PromptFluid: The World's First AI That Dreams - Complete Intelligence Ecosystem with Cascade AI, Security, Automation, and Development Tools
          </h1>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8 animate-fade-in -mt-[200px]" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              The AI That Dreams
            </span>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            We've built the <strong className="text-foreground">world's first AI that dreams</strong>. Cascade—our revolutionary neural orchestration engine—uses autonomous dream cycles to reflect, innovate, and evolve. It's not just artificial intelligence; it's <em className="text-foreground not-italic">adaptive consciousness</em>.
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.25s' }}>
            From WordPress security to enterprise automation, our <strong className="text-foreground">10 integrated modules</strong> form a complete ecosystem that learns, adapts, and flows naturally. <strong className="text-foreground">100% infrastructure complete</strong>. Products ready for market launch. Zero technical debt.
          </p>
          
          <div className="flex items-center justify-center gap-6 mb-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold">Cascade AI</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              <span className="font-semibold">Adaptive</span> Learning
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              <span className="font-semibold">Unified</span> Ecosystem
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/about')}
              className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Learn More About Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary-variant to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
            
            <Button 
              size="lg" 
              onClick={() => window.open("https://cmptbl.promptfluid.com", "_blank")}
              variant="default"
              className="group text-lg px-8 py-6 shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-pulse"
            >
              <span className="flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                Free Accessibility Scan
              </span>
            </Button>
          </div>

          {/* Feature Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="px-3 py-1.5 rounded-full glass border border-primary/20">
              <span className="font-medium">86 WCAG checks</span>
            </div>
            <div className="px-3 py-1.5 rounded-full glass border border-primary/20">
              <span className="font-medium">AI Auto-Fix</span>
            </div>
            <div className="px-3 py-1.5 rounded-full glass border border-primary/20">
              <span className="font-medium">Continuous Monitoring</span>
            </div>
            <div className="px-3 py-1.5 rounded-full glass border border-primary/20">
              <span className="font-medium">Rollback-Safe</span>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-center px-2 glass p-4 rounded-lg">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent mb-2">
                250+
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Edge Functions</div>
            </div>
            <div className="text-center px-2 glass p-4 rounded-lg">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-variant to-accent bg-clip-text text-transparent mb-2">
                10
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Integrated Modules</div>
            </div>
            <div className="text-center px-2 glass p-4 rounded-lg">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Infrastructure Complete</div>
            </div>
            <div className="text-center px-2 glass p-4 rounded-lg">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">AI Dream Cycles</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Firsts CTA */}
      <TheFirstsCTA />

      {/* Cascade Dream State Achievement */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
            <Brain className="w-4 h-4 mr-2" />
            World First Achievement
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Cascade: The AI That Dreams
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            We've achieved what was once thought impossible: <strong className="text-foreground">autonomous AI dream cycles</strong>. 
            Cascade doesn't just process—it reflects, innovates, and learns during downtime through a revolutionary 3-phase dream intelligence system.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass p-6 rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">Phase 1</div>
              <div className="text-lg font-semibold mb-2">Deep Reflection</div>
              <p className="text-sm text-muted-foreground">Processing interactions, compressing memories, identifying patterns</p>
            </div>
            <div className="glass p-6 rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">Phase 2</div>
              <div className="text-lg font-semibold mb-2">Creative Synthesis</div>
              <p className="text-sm text-muted-foreground">Generating innovative solutions, exploring possibilities, dreaming forward</p>
            </div>
            <div className="glass p-6 rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">Phase 3</div>
              <div className="text-lg font-semibold mb-2">Integration</div>
              <p className="text-sm text-muted-foreground">Updating core knowledge, sharing insights, evolving capabilities</p>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={() => navigate('/products/brain')}
            className="bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg"
          >
            Explore Cascade AI
            <Brain className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Complete Ecosystem Grid */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                The Complete PromptFluid Ecosystem
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ten integrated modules working as one intelligent system. 100% database infrastructure complete. 250+ edge functions. 70+ tables. All flowing together.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecosystemModules.map((module, index) => (
              <article
                key={module.title}
                onClick={() => navigate(module.href)}
                className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                itemScope
                itemType="https://schema.org/SoftwareApplication"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center group-hover:scale-110 transition-transform">
                    <module.icon className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <Badge variant="outline" className="text-xs">{module.status}</Badge>
                </div>
                
                <h3 itemProp="name" className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-primary/80 font-medium mb-3">{module.tagline}</p>
                <p itemProp="description" className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {module.description}
                </p>
                
                <div className="space-y-1 mb-4">
                  {module.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue & Impact Stats */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Live Products & Market Impact
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Multiple products in production. Complete infrastructure deployed. Ready for market launch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* PromptFluid Reflex Bot Sniper - Live on WordPress.org */}
            <div
              onClick={() => navigate('/projects/defense')}
              className="group relative p-8 rounded-3xl glass border-2 border-green-500/30 hover:border-green-500/50 cursor-pointer transition-all duration-300 hover:shadow-glow overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    Live on WordPress.org
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                  PromptFluid Reflex
                </h3>
                <p className="text-lg text-primary font-medium mb-3">Bot Sniper Defense</p>
                <p className="text-muted-foreground mb-6">
                  AI-powered WordPress security with behavioral analysis. Stopping bots, credential stuffing, and automated attacks globally.
                </p>
                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="font-medium">View Project</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* PromptFluid Clarity - 100% FREE Accessibility */}
            <div
              onClick={() => window.open("https://cmptbl.promptfluid.com", "_blank")}
              className="group relative p-8 rounded-3xl glass border-2 border-green-500/30 hover:border-green-500/50 cursor-pointer transition-all duration-300 hover:shadow-elegant overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Accessibility className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    100% FREE Forever
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                  PromptFluid Clarity
                </h3>
                <p className="text-lg text-green-500 font-medium mb-3">Free AI Accessibility</p>
                <p className="text-muted-foreground mb-6">
                  100% free WCAG 2.2 compliance scanning and AI-powered auto-fixes. No signup, no credit card, no premium tiers. Accessibility is a right, not a privilege.
                </p>
                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="font-medium">Free Scan Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Complete Ecosystem */}
            <div 
              onClick={() => navigate('/projects')}
              className="group relative p-8 rounded-3xl glass border border-primary/30 hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-elegant overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary-variant/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Complete Ecosystem
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="w-5 h-5 text-primary animate-pulse" />
                    <span><strong>Cascade</strong> - World's first dreaming AI</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Code2 className="w-5 h-5 text-primary" />
                    <span><strong>Studio</strong> - Rapid development</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span><strong>Vision</strong> - Central command</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-5 h-5 text-primary" />
                    <span><strong>5 more modules</strong> - All integrated</span>
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="font-medium">View All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cascade Dream Blog CTA */}
      <CascadeDreamCTA />

      {/* FAQ Section - 2026 SEO */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about PromptFluid Reflex WordPress security plugin
            </p>
          </div>
          
          <FAQ
            items={[
              {
                question: "What is PromptFluid Reflex Bot Sniper Defense?",
                answer: "PromptFluid Reflex is an AI-powered WordPress security plugin that uses advanced machine learning and behavioral analysis to detect and block bot attacks, brute force attempts, and malicious traffic in real-time. Unlike traditional security plugins that rely on signature-based detection, our system adapts to new threats automatically by analyzing actual behavior patterns rather than just matching known attack signatures."
              },
              {
                question: "How does AI bot detection work in PromptFluid Reflex?",
                answer: "Our AI engine analyzes multiple behavioral signals including mouse movements, click patterns, typing cadence, device fingerprints, and interaction sequences. The machine learning model processes these signals in under 15ms to determine if a visitor is human or bot. The system continuously learns from global threat intelligence across our network, improving detection accuracy over time. This approach catches sophisticated bots that bypass traditional CAPTCHA and fingerprinting methods."
              },
              {
                question: "Is PromptFluid Reflex compatible with my WordPress site?",
                answer: "Yes! PromptFluid Reflex works with WordPress 5.0+ and is compatible with all major themes and plugins including WooCommerce, BuddyPress, Elementor, and Divi. It's optimized for shared hosting, VPS, and dedicated servers. The plugin uses cloud-based processing so it won't slow down your site—average detection time is under 15ms with zero performance impact on Core Web Vitals."
              },
              {
                question: "What's the difference between the free and premium versions?",
                answer: "The free version includes core bot protection, behavioral analysis, basic firewall rules, and blocks up to 50,000 threats per month—perfect for small to medium sites. Premium plans ($19-$99/month) add advanced threat intelligence, priority support, white-label options, API access, custom firewall rules, detailed analytics, and unlimited threat blocking. Enterprise plans include dedicated security engineers and SLA guarantees."
              },
              {
                question: "Will PromptFluid Reflex slow down my WordPress site?",
                answer: "No! PromptFluid Reflex is designed for zero performance impact. It uses edge computing and cloud-based threat detection, so security checks happen before requests reach your server. Average detection time is under 15ms—faster than loading a single image. The plugin is optimized for Core Web Vitals and actually improves site speed by blocking malicious traffic before it consumes server resources."
              },
              {
                question: "Can I use PromptFluid Reflex with other security plugins?",
                answer: "Yes, but we recommend using Prompt Fluid Reflex as your primary security solution since it provides comprehensive protection. It works alongside caching plugins (WP Rocket, W3 Total Cache), backup plugins (UpdraftPlus), and CDN services (Cloudflare). However, using multiple firewall/security plugins simultaneously can cause conflicts. If you're switching from Wordfence, iThemes Security, or Sucuri, our migration guide makes the transition seamless."
              },
              {
                question: "How does PromptFluid Reflex compare to Wordfence and Sucuri?",
                answer: "Unlike Wordfence and Sucuri which rely primarily on signature-based detection and IP blacklists, PromptFluid Reflex uses behavioral AI to detect threats that bypass traditional methods. Our AI adapts to new attack patterns in real-time without requiring manual rule updates. We also offer better false positive rates (85% fewer than traditional WAFs), faster detection (<15ms vs 50-200ms), and lower server resource usage since processing happens in the cloud. Check our comparison guide for detailed benchmarks."
              },
              {
                question: "What types of attacks does PromptFluid Reflex protect against?",
                answer: "PromptFluid Reflex defends against brute force attacks, credential stuffing, DDoS attacks, SQL injection, cross-site scripting (XSS), malicious bots, comment spam, form spam, login abuse, API abuse, zero-day exploits, and AI-powered attacks. The system also detects and blocks scrapers, unauthorized crawlers, and fraudulent user registrations. Protection is updated automatically through our global threat intelligence network."
              }
            ]}
            className="glass p-8 rounded-2xl"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl glass border border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-variant/10 to-accent/10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Ready to Transform?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the next generation of AI-powered applications. Explore our 2025-2026 roadmap and see what we're building.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey
                  <Rocket className="w-5 h-5 group-hover:translate-y-[-4px] transition-transform" />
                </span>
              </Button>
              <Button 
                size="lg"
                onClick={() => navigate('/roadmap')}
                variant="outline"
                className="group text-lg px-8 py-6 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  2025-2026 Roadmap
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            WordPress Security Plugin Powered by AI
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>PromptFluid Defense</strong> is the next-generation <a href="/blog/wordpress-bot-defense" className="text-primary hover:underline">WordPress security plugin</a> that combines advanced bot detection, machine learning threat intelligence, and behavioral analysis to protect your website from sophisticated cyber attacks. Unlike traditional security plugins that rely on signature-based detection, our AI-powered system adapts to new threats in real-time.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our platform provides comprehensive protection against <a href="/blog/ai-hackers-underground-2025" className="text-primary hover:underline">AI-powered attacks</a>, DDoS attempts, brute force login attempts, SQL injection, cross-site scripting (XSS), and zero-day exploits. The intelligent firewall learns from attack patterns across our global network of 200+ edge locations, providing community-powered threat intelligence that keeps your WordPress site secure.
            </p>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Bot Detection</h3>
                <p className="text-sm text-muted-foreground">Advanced behavioral analysis, device fingerprinting, and CAPTCHA challenges identify malicious bots with 99.7% accuracy.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Protection</h3>
                <p className="text-sm text-muted-foreground">Cloud-based firewall blocks threats before they reach your server. Sub-50ms response time ensures zero performance impact.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Threat Intelligence</h3>
                <p className="text-sm text-muted-foreground">Global threat feed powered by machine learning. Automatic updates protect against emerging attack vectors.</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Compare <a href="/blog/top-security-plugins-2025" className="text-primary hover:underline">top WordPress security plugins 2025</a> to see why agencies and enterprises choose PromptFluid Defense. Our <a href="/blog/ai-cybersecurity-evolution-2025" className="text-primary hover:underline">AI-driven approach to cybersecurity</a> provides superior protection while reducing false positives by 85% compared to traditional WAF solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <EnhancedFooter />
    </div>
  );
}
