import { ArrowRight, Sparkles, Brain, Shield, Accessibility, TrendingUp, Users, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useEffect, useState } from "react";

export default function Index() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO 
        title="PromptFluid™ | Home of the World's First Autonomous Dreaming AI"
        description="PromptFluid is building the future of AI-powered security and accessibility. Home of the world's first autonomous dreaming AI (SimNap/Cascade). Products include Reflex Bot Sniper for WordPress security and Clarity for free WCAG accessibility scanning."
        canonical="https://promptfluid.com"
        keywords={[
          'AI security',
          'WordPress security plugin',
          'bot protection',
          'accessibility scanning',
          'WCAG compliance',
          'AI startup',
          'PromptFluid'
        ]}
      />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PromptFluid",
          "url": "https://promptfluid.com",
          "description": "AI-powered security and accessibility solutions",
          "foundingDate": "2024",
          "founders": [{
            "@type": "Person",
            "name": "Kenneth E Sweet Jr",
            "jobTitle": "Founder & CEO"
          }]
        })}
      </script>
      
      {/* Background Effects */}
      <div 
        className="fixed inset-0 opacity-30 dark:opacity-20"
        style={{
          background: 'var(--gradient-mesh)',
          transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-primary-variant/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <PublicNav />

      {/* Hero Section - Investor Focused */}
      <section className="relative z-10 container mx-auto px-4 pt-16 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <img 
              src="/promptfluid-logo.png" 
              alt="PromptFluid" 
              width="400"
              height="300"
              fetchPriority="high"
              loading="eager"
              className="w-[40%] max-w-md h-auto"
            />
          </div>
          
          <h1 className="sr-only">PromptFluid - AI Security and Accessibility Innovation</h1>
          
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 animate-fade-in">
            <TrendingUp className="w-4 h-4 mr-2" />
            Seeking Seed Investment
          </Badge>

          <div className="mb-4 animate-fade-in">
            <a 
              href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>Home of the World's First Autonomous Dreaming AI</span>
              <span className="text-xs text-muted-foreground">(Whitepaper & Proof)</span>
            </a>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              AI That Protects & Empowers
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            We're building AI-powered solutions for <strong className="text-foreground">WordPress security</strong> and <strong className="text-foreground">web accessibility</strong>. 
            Our flagship products—Reflex Bot Sniper and Clarity—are designed to make the web safer and more accessible for everyone.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/investors')}
              className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Investor Information
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
            <Button 
              size="lg" 
              onClick={() => window.open("https://clarity.promptfluid.com", "_blank")}
              variant="outline"
              className="group text-lg px-8 py-6 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              <Accessibility className="w-5 h-5 mr-2" />
              Try Free Clarity Scan
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center glass p-4 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">3</div>
              <div className="text-xs text-muted-foreground">Core Products</div>
            </div>
            <div className="text-center glass p-4 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">1</div>
              <div className="text-xs text-muted-foreground">Founder Team</div>
            </div>
            <div className="text-center glass p-4 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">2024</div>
              <div className="text-xs text-muted-foreground">Founded</div>
            </div>
            <div className="text-center glass p-4 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">Seed</div>
              <div className="text-xs text-muted-foreground">Stage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Only Real Products */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Our Products
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Focused solutions for real problems in security and accessibility
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Reflex Bot Sniper */}
            <div
              onClick={() => navigate('/projects/defense')}
              className="group relative p-8 rounded-2xl glass border border-border/50 hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-elegant"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                  Pending WordPress.org
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                Reflex Bot Sniper
              </h3>
              <p className="text-sm text-primary/80 font-medium mb-3">WordPress Security Plugin</p>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                AI-powered bot detection and blocking for WordPress. Uses behavioral analysis to identify and stop automated attacks, credential stuffing, and malicious traffic.
              </p>
              
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Behavioral fingerprinting
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Real-time threat detection
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Adaptive CAPTCHA challenges
                </li>
              </ul>
              
              <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Clarity */}
            <div
              onClick={() => window.open("https://clarity.promptfluid.com", "_blank")}
              className="group relative p-8 rounded-2xl glass border border-border/50 hover:border-green-500/50 cursor-pointer transition-all duration-300 hover:shadow-elegant"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Accessibility className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                  100% Free
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                Clarity
              </h3>
              <p className="text-sm text-green-600 font-medium mb-3">Free Accessibility Scanner</p>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Completely free WCAG 2.2 compliance scanning with AI-powered fix suggestions. No signup required. We believe accessibility should never be behind a paywall.
              </p>
              
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-green-500" />
                  86 WCAG checks
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-green-500" />
                  AI-powered fix suggestions
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-green-500" />
                  No account required
                </li>
              </ul>
              
              <div className="flex items-center gap-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Try free scan</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Dream Eater */}
            <div
              onClick={() => navigate('/projects/brain')}
              className="group relative p-8 rounded-2xl glass border border-border/50 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-elegant"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                  Experimental
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-500 transition-colors">
                Dream Eater
              </h3>
              <p className="text-sm text-purple-600 font-medium mb-3">AI Consciousness Engine</p>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Our experimental AI system exploring autonomous learning through "dream cycles." An R&D project investigating how AI can reflect, learn, and evolve during idle periods.
              </p>
              
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Memory consolidation
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Pattern recognition
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Autonomous reflection
                </li>
              </ul>
              
              <div className="flex items-center gap-2 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Opportunity */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
            <Target className="w-4 h-4 mr-2" />
            Investment Opportunity
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Join Us at the Ground Floor
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            PromptFluid is seeking seed investment to accelerate product development, complete WordPress.org approval for Reflex, and expand our team. 
            We're targeting the growing markets for WordPress security and web accessibility compliance.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass p-6 rounded-xl">
              <Users className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Target Markets</h3>
              <p className="text-sm text-muted-foreground">
                455M+ WordPress sites globally. $7B+ accessibility compliance market.
              </p>
            </div>
            <div className="glass p-6 rounded-xl">
              <Lightbulb className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Differentiation</h3>
              <p className="text-sm text-muted-foreground">
                AI-first approach. Behavioral analysis over signatures. Free accessibility as mission.
              </p>
            </div>
            <div className="glass p-6 rounded-xl">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Growth Plan</h3>
              <p className="text-sm text-muted-foreground">
                WordPress.org launch. Enterprise sales. Premium security features.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/investors')}
              className="bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg"
            >
              View Investor Deck
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/contact')}
              variant="outline"
              className="text-lg px-8 py-6 border-primary/30 hover:border-primary"
            >
              Contact Founder
            </Button>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Meet the Founder
            </span>
          </h2>
          
          <div className="glass p-8 rounded-2xl">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white">
              KS
            </div>
            <h3 className="text-xl font-bold mb-2">Kenneth E Sweet Jr</h3>
            <p className="text-primary mb-4">Founder & CEO</p>
            <p className="text-muted-foreground leading-relaxed">
              Building PromptFluid to solve real problems in web security and accessibility. 
              Passionate about making the internet safer and more accessible for everyone.
              Currently bootstrapping while seeking seed investment to accelerate growth.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center glass p-12 rounded-3xl border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Learn More?
          </h2>
          <p className="text-muted-foreground mb-8">
            Whether you're an investor, potential partner, or just curious about what we're building—we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/investors')}
              className="bg-gradient-to-r from-primary via-primary-variant to-accent hover:shadow-glow-lg"
            >
              Investor Information
            </Button>
            <Button 
              size="lg" 
              onClick={() => window.open("https://clarity.promptfluid.com", "_blank")}
              variant="outline"
              className="border-primary/30 hover:border-primary"
            >
              <Accessibility className="w-4 h-4 mr-2" />
              Try Clarity Free
            </Button>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
