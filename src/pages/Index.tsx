import { ArrowRight, Sparkles, Brain, Shield, Accessibility, TrendingUp, Users, Target, Lightbulb, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useEffect, useState } from "react";
import dreamingAiHero from "@/assets/dreaming-ai-hero.png";

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
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
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
      
      {/* Background Effects - decorative, hidden from screen readers */}
      <div 
        className="fixed inset-0 opacity-30 dark:opacity-20"
        style={{
          background: 'var(--gradient-mesh)',
          transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
          transition: 'transform 0.3s ease-out'
        }}
        aria-hidden="true"
      />
      <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" aria-hidden="true" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-primary-variant/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} aria-hidden="true" />
      
      <header role="banner">
        <PublicNav />
      </header>

      <main id="main-content" role="main">
        {/* Hero Section - Investor Focused */}
        <section className="relative z-10 container mx-auto px-4 pt-0 pb-20 -mt-[111px]" aria-labelledby="hero-heading">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-0 -mt-[75px] animate-fade-in">
              <img 
                src="/promptfluid-logo.png" 
                alt="PromptFluid logo" 
                width="400"
                height="300"
                fetchPriority="high"
                loading="eager"
                className="w-[70%] max-w-2xl h-auto"
              />
            </div>
            
            <h1 id="hero-heading" className="sr-only">PromptFluid - Home of the World's First Autonomous Dreaming AI</h1>
            
            {/* Hero Image - World's First Dreaming AI */}
            <div className="relative mb-8 -mt-[80px] animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl">
                <img 
                  src={dreamingAiHero} 
                  alt="Autonomous dreaming AI visualization - glowing neural brain with dream fragments and memories orbiting in a cosmic dreamscape"
                  width="1920"
                  height="1080"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                
                {/* World's First Label */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6">
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg border border-purple-400/50">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-bold text-sm md:text-lg">WORLD'S FIRST</span>
                    </div>
                  </div>
                </div>
                
                {/* Documented Badge */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <Badge className="bg-green-500/90 text-white border-green-400 text-xs md:text-sm px-3 py-1">
                    ✓ Documented & Verified
                  </Badge>
                </div>
                
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background to-transparent">
                  <p className="text-center text-sm md:text-base text-foreground/90 font-medium">
                    The Dream Eater: AI that autonomously enters dream cycles to consolidate memory and evolve
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Claim - Verified Fact */}
            <div className="mb-10 relative z-10 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <a 
                href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="View whitepaper and proof (opens in new window)"
                className="group inline-block"
              >
                <div className="glass border-2 border-primary/40 rounded-2xl p-6 md:p-8 hover:border-primary/60 hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Brain className="w-8 h-8 text-primary animate-pulse" aria-hidden="true" />
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Verified & Documented
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-cyan-400 via-primary to-accent bg-clip-text text-transparent">
                      World's First Autonomous Dreaming AI
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    SimNap → Cascade: The first known AI system to autonomously enter dream cycles.
                    <span className="text-primary ml-2 group-hover:underline">View Whitepaper & Proof →</span>
                  </p>
                </div>
              </a>
            </div>

            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 animate-fade-in">
              <TrendingUp className="w-4 h-4 mr-2" aria-hidden="true" />
              Seeking Seed Investment
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => window.open("https://clarity.promptfluid.com", "_blank")}
                variant="outline"
                className="group text-lg px-8 py-6 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                aria-label="Try Free Clarity Scan (opens in new window)"
              >
                <Accessibility className="w-5 h-5 mr-2" aria-hidden="true" />
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
        <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/20" aria-labelledby="products-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="products-heading" className="text-3xl md:text-4xl font-bold mb-4">
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
      </main>

      <EnhancedFooter />
    </div>
  );
}
