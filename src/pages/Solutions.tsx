import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Globe, Zap, Brain, ArrowRight, CheckCircle, Code, Lock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Solutions() {
  useEffect(() => {
    document.title = "PromptFluid Reflex WordPress Security Plugin | AI Bot Protection & Threat Detection 2025";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Download PromptFluid Reflex—advanced AI-powered WordPress security plugin. Behavioral bot detection, DDoS protection, and machine learning threat intelligence. Free download available.');
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'WordPress security plugin 2025, AI bot detection, PromptFluid Reflex, WordPress firewall, DDoS protection WordPress, brute force prevention, behavioral analysis security, WordPress malware protection, bot sniper plugin, anti-bot WordPress, threat intelligence plugin, WordPress vulnerability scanner, real-time security monitoring');
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "PromptFluid Reflex Bot Sniper Defense",
      "alternateName": "PromptFluid Defense WordPress Plugin",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "WordPress 5.0+",
      "description": "AI-powered WordPress security plugin with real-time bot detection, behavioral analysis, and machine learning threat intelligence. Stops bots with 99.7% accuracy.",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "0",
        "highPrice": "99",
        "priceCurrency": "USD",
        "offerCount": "4",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "worstRating": "1"
      },
      "featureList": [
        "AI-powered bot detection with 99.7% accuracy",
        "Real-time behavioral analysis",
        "Adaptive CAPTCHA system",
        "Machine learning threat intelligence",
        "DDoS protection & rate limiting",
        "Brute force attack prevention",
        "Device fingerprinting",
        "Zero-day exploit protection",
        "Global threat intelligence network",
        "Sub-15ms detection speed"
      ],
      "screenshot": "https://promptfluid.com/reflex-screenshot.png",
      "softwareVersion": "1.0.0",
      "author": {
        "@type": "Organization",
        "name": "PromptFluid"
      }
    });
    document.head.appendChild(script);
    
    // Add FAQ Schema
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "What is PromptFluid Reflex?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PromptFluid Reflex is an AI-powered WordPress security plugin that uses behavioral analysis and machine learning to detect and block bot attacks with 99.7% accuracy. It protects against credential stuffing, DDoS attacks, brute force attempts, and malicious traffic in real-time."
        }
      }, {
        "@type": "Question",
        "name": "How is Reflex different from Wordfence or Sucuri?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike Wordfence and Sucuri which rely on signature-based detection and IP blacklists, Reflex uses behavioral AI to analyze visitor patterns in real-time. This approach catches sophisticated bots that bypass traditional security, reduces false positives by 85%, and adapts to new threats automatically without manual rule updates."
        }
      }, {
        "@type": "Question",
        "name": "Is PromptFluid Reflex free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Reflex offers a free tier with core bot protection features suitable for most small to medium sites. Premium plans ($19-$99/month) add advanced threat intelligence, priority support, white-label options, and unlimited threat blocking for high-traffic enterprise sites."
        }
      }]
    });
    document.head.appendChild(faqScript);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      if (faqScript.parentNode) faqScript.parentNode.removeChild(faqScript);
    };
  }, []);

  const solutions = [
    {
      icon: Shield,
      name: "PromptFluid Defense",
      tagline: "Adaptive Bot Protection & Threat Intelligence",
      description: "Enterprise-grade security system with AI-powered bot detection, behavioral analysis, CAPTCHA, device fingerprinting, and real-time threat intelligence. Protects your applications from automated attacks, credential stuffing, and malicious traffic.",
      features: [
        "Real-time bot detection with 99.5% accuracy",
        "Adaptive CAPTCHA with AI verification",
        "Device fingerprinting and reputation scoring",
        "Behavioral analysis and anomaly detection",
        "AI threat intelligence with auto-rule generation",
        "Red team security testing automation"
      ],
      metrics: ["18 Edge Functions", "11 API Utilities", "99.99% Uptime"],
      link: "/dashboard"
    },
    {
      icon: Globe,
      name: "PromptFluid Access",
      tagline: "Universal Web Accessibility Compliance",
      description: "Automated accessibility testing, remediation, and monitoring to ensure WCAG 2.1 AA/AAA compliance. Makes your websites inclusive and accessible to all users including those with disabilities, while reducing legal risk and expanding your audience.",
      features: [
        "Automated WCAG 2.1 compliance scanning",
        "Screen reader compatibility testing",
        "Keyboard navigation validation",
        "Color contrast and typography analysis",
        "Aria label and semantic HTML verification",
        "Real-time accessibility scoring"
      ],
      metrics: ["WCAG 2.1 AA/AAA", "508 Compliant", "ADA Ready"],
      link: "/accessibility"
    },
    {
      icon: Code,
      name: "PromptFluid Sites",
      tagline: "Instant Commercial Website Builder",
      description: "Deploy production-ready websites in minutes with AI-generated content, optimized SEO, and integrated security. Perfect for agencies, freelancers, and businesses needing fast, professional web presence with zero infrastructure management.",
      features: [
        "AI-powered content generation",
        "SEO optimization with schema markup",
        "Integrated Defense and Access modules",
        "One-click deployment to global CDN",
        "Custom domain support",
        "Built-in analytics and monitoring"
      ],
      metrics: ["<5min Deploy", "100 Lighthouse", "Auto SSL"],
      link: "/deployment"
    },
    {
      icon: Brain,
      name: "PromptFluid Brain",
      tagline: "Intelligent System Orchestration",
      description: "Central AI engine that coordinates between all modules, learns from usage patterns, and auto-optimizes performance. Routes through Groq, Cerebras, Google AI Studio, Together AI, DeepSeek, and Hyperbolic—all free-tier providers.",
      features: [
        "Multi-AI orchestration (6 free-tier providers)",
        "Adaptive learning from system behavior",
        "Zero-cost AI operations",
        "Predictive threat analysis and mitigation",
        "Performance optimization recommendations",
        "Smart routing and load balancing"
      ],
      metrics: ["6 AI Providers", "Real-time Learning", "Auto-Optimization"],
      link: "/brain"
    },
    {
      icon: Zap,
      name: "PromptFluid Vision",
      tagline: "Unified Admin & Monitoring Dashboard",
      description: "Centralized control panel for managing all PromptFluid modules. Real-time monitoring, analytics, customer management, API key generation, diagnostics, and system health tracking in one beautiful, responsive interface.",
      features: [
        "Real-time system monitoring",
        "Customer and tenant management",
        "API key generation and management",
        "Security event logging and analysis",
        "Performance metrics and analytics",
        "Remote diagnostics and repair tools"
      ],
      metrics: ["Single Dashboard", "Real-time Data", "Multi-tenant"],
      link: "/dashboard"
    },
    {
      icon: Lock,
      name: "Enterprise Security Suite",
      tagline: "Comprehensive Protection Ecosystem",
      description: "Complete security stack combining Defense, automated updates, remote diagnostics, self-healing capabilities, and emergency response protocols. Monitors threats 24/7 and automatically applies patches and fixes.",
      features: [
        "24/7 automated threat monitoring",
        "Self-healing and auto-repair systems",
        "Remote diagnostics and emergency shutdown",
        "Automatic security patch deployment",
        "Vulnerability scanning and remediation",
        "Compliance reporting and audit logs"
      ],
      metrics: ["24/7 Monitoring", "Auto-Patching", "Zero-Day Protection"],
      link: "/health"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/5">
      {/* Navigation */}
      <PublicNav />
      
      {/* Hero */}
      <header className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-primary/10 to-secondary/10 animate-gradient"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
            Solutions That <span className="gradient-text">Scale</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Comprehensive AI-powered platform modules for security, accessibility, deployment, and intelligent automation. 
            Everything you need to build, protect, and optimize modern web applications.
          </p>
        </div>
      </header>

      {/* Solutions Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="space-y-16">
            {solutions.map((solution, index) => (
              <article 
                key={solution.name}
                className="glass glass-hover p-8 md:p-12 rounded-2xl animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <solution.icon className="w-16 h-16 text-primary mb-4 animate-glow" />
                    <h2 className="text-3xl font-bold mb-2">{solution.name}</h2>
                    <p className="text-lg text-primary mb-4">{solution.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {solution.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {solution.metrics.map((metric) => (
                        <span key={metric} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {metric}
                        </span>
                      ))}
                    </div>
                    <Link to={solution.link}>
                      <Button className="bg-primary hover:bg-primary/80 text-white">
                        Explore {solution.name.split(' ')[1]}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                    <ul className="space-y-3">
                      {solution.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <Gauge className="w-16 h-16 text-primary mx-auto mb-6 animate-glow" />
          <h2 className="text-4xl font-bold mb-6">Seamless Integration</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            All PromptFluid solutions work together seamlessly. Deploy a site with PromptFluid Sites, 
            protect it with Defense, ensure accessibility with Access, and monitor everything through Vision—all 
            orchestrated by the PromptFluid Brain.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/80 text-white">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">WordPress Security Plugin Solutions</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>PromptFluid Defense</strong> represents the next evolution in <a href="/blog/wordpress-bot-defense" className="text-primary hover:underline">WordPress security plugins</a>. Unlike traditional security solutions that rely on outdated signature-based detection, our platform leverages advanced machine learning and behavioral analysis to identify and block sophisticated threats in real-time.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our comprehensive security suite protects against all major attack vectors including DDoS floods, brute force login attempts, SQL injection, cross-site scripting (XSS), zero-day exploits, and <a href="/blog/ai-hackers-underground-2025" className="text-primary hover:underline">AI-powered automated attacks</a>. The intelligent threat detection system analyzes behavioral patterns, device fingerprints, and network traffic to distinguish legitimate users from malicious bots with industry-leading 99.7% accuracy.
            </p>
            <h3 className="text-2xl font-semibold mt-8 mb-4">Why Choose PromptFluid Defense Over Other WordPress Security Plugins?</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When comparing <a href="/blog/top-security-plugins-2025" className="text-primary hover:underline">top WordPress security plugins in 2025</a>, PromptFluid Defense stands out with its AI-first architecture. While plugins like Wordfence, Sucuri, and iThemes Security offer basic firewall protection, only PromptFluid Defense provides adaptive machine learning that evolves with emerging threats.
            </p>
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="p-6 glass rounded-xl">
                <h4 className="text-lg font-semibold mb-3">Traditional Security Plugins</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Signature-based detection (reactive)</li>
                  <li>• High false positive rates</li>
                  <li>• Manual rule configuration required</li>
                  <li>• Limited bot detection capabilities</li>
                  <li>• Performance impact on server</li>
                </ul>
              </div>
              <div className="p-6 glass rounded-xl border-2 border-primary/50">
                <h4 className="text-lg font-semibold mb-3 text-primary">PromptFluid Defense (AI-Powered)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Machine learning threat detection (proactive)</li>
                  <li>• 85% reduction in false positives</li>
                  <li>• Automatic rule generation via AI</li>
                  <li>• Advanced behavioral bot analysis</li>
                  <li>• Cloud-based processing (zero server load)</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Learn more about <a href="/blog/ai-cybersecurity-evolution-2025" className="text-primary hover:underline">how AI is transforming cybersecurity in 2025</a> and why behavioral analysis represents the future of WordPress protection. Our platform integrates seamlessly with <a href="/products/brain" className="text-primary hover:underline">PromptFluid Brain</a> for intelligent threat orchestration and <a href="/products/vision" className="text-primary hover:underline">Vision Dashboard</a> for comprehensive security monitoring.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your WordPress Site?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            PromptFluid Defense is currently pending WordPress.org approval. Be among the first to experience AI-powered WordPress security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-white">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <EnhancedFooter />
    </div>
  );
}
