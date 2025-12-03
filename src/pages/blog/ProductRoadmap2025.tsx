import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/blog/product-roadmap-2025.jpg";

const ProductRoadmap2025 = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="PromptFluid Product Roadmap 2025-2026 | Upcoming AI Features & Timeline"
        description="Explore PromptFluid's comprehensive product roadmap for 2025-2026. Discover upcoming features, release timelines, and innovations in adaptive AI, security, accessibility, and automation."
        canonical="https://www.promptfluid.com/blog/product-roadmap-2025"
        keywords={[
          "AI product roadmap",
          "PromptFluid features",
          "AI platform development",
          "upcoming AI tools",
          "AI innovation timeline",
          "enterprise AI roadmap",
          "AI security features",
          "AI automation tools"
        ]}
        type="article"
        publishedTime="2025-01-31"
      />

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <header className="mb-12">
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
            <img 
              src={heroImage} 
              alt="Product roadmap timeline for 2025 showing futuristic feature releases, innovation pipeline, and upcoming integrations with modern tech planning interface"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            PromptFluid Product Roadmap 2025-2026
          </h1>
          <p className="text-xl text-muted-foreground">
            A transparent look at upcoming features, release timelines, and our vision for the future of adaptive AI platforms
          </p>
          
          <AuthorBio publishDate="2025-11-01" readTime="18 min read" />
        </header>

        <section className="prose prose-lg max-w-none mb-12">
          <p className="lead text-xl mb-8">
            PromptFluid is building the future of intelligent, secure, and adaptive AI platforms. This roadmap provides visibility into our development priorities, estimated timelines, and the strategic thinking behind each initiative. We update this quarterly as priorities evolve and new opportunities emerge.
          </p>

          <Card className="p-6 mb-8 bg-primary/10 border-primary/20">
            <h3 className="text-xl font-semibold mb-3">Roadmap Philosophy</h3>
            <p className="mb-0">
              We prioritize features based on customer impact, technical feasibility, and strategic positioning. Timelines are estimates that may shift based on market feedback and engineering realities. We believe in transparency about what we're building and why.
            </p>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Q1 2025: Foundation and Market Entry</h2>
          <p className="mb-6">
            The first quarter focuses on solidifying core platform capabilities and launching our initial market entry through WordPress security.
          </p>

          <div className="space-y-6 mb-8">
            <Card className="p-6 bg-card/50 border-l-4 border-l-primary">
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">PromptFluid Defense WordPress Plugin</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Status: Private Beta (February 2025)</span>
                  </div>
                  <p className="mb-3">
                    First public product release targeting the WordPress security market. Behavioral bot detection, real-time threat intelligence, and adaptive challenge systems.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>AI-powered bot behavior analysis</li>
                    <li>Device fingerprinting and reputation tracking</li>
                    <li>Automated security rule generation</li>
                    <li>Real-time threat intelligence dashboard</li>
                    <li>Zero-friction user verification</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-primary">
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Multi-Model Orchestration Core</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Status: Internal Testing (March 2025)</span>
                  </div>
                  <p className="mb-3">
                    Intelligent routing layer that distributes AI tasks across OpenAI, Anthropic, Groq, and specialized models based on performance and cost optimization.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Dynamic provider selection with automatic failover</li>
                    <li>Real-time cost tracking and optimization</li>
                    <li>Response caching and deduplication</li>
                    <li>Performance monitoring and analytics</li>
                    <li>Custom routing rules per use case</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-primary">
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">PromptFluid Brain Learning Core</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Status: Active Development (March 2025)</span>
                  </div>
                  <p className="mb-3">
                    Autonomous learning system that captures organizational intelligence from every AI interaction, continuously improving performance and efficiency.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Prompt evolution and optimization</li>
                    <li>Pattern recognition for routing decisions</li>
                    <li>Failure analysis and prevention</li>
                    <li>Knowledge base accumulation</li>
                    <li>Custom directive management</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">Q2 2025: Platform Expansion</h2>
          <p className="mb-6">
            Second quarter emphasizes building out developer tools and expanding security capabilities beyond WordPress into universal protection.
          </p>

          <div className="space-y-6 mb-8">
            <Card className="p-6 bg-card/50 border-l-4 border-l-primary-glow">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-primary-glow flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">PromptFluid Studio (MVP)</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: April-May 2025</span>
                  </div>
                  <p className="mb-3">
                    AI-powered application builder that generates production-ready code with integrated security, accessibility, and intelligence from the start.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Initial Capabilities:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Natural language to React component generation</li>
                    <li>Integrated PromptFluid Brain recommendations</li>
                    <li>Automated CMPTBL accessibility compliance</li>
                    <li>One-click Vercel/Railway deployment</li>
                    <li>Built-in Defense security scanning</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-primary-glow">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-primary-glow flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Universal Defense SDK</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: May 2025</span>
                  </div>
                  <p className="mb-3">
                    JavaScript/TypeScript SDK that brings PromptFluid Defense capabilities to any web application or API, beyond WordPress.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Framework Support:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>React, Vue, Angular, Svelte integration</li>
                    <li>Next.js and Express.js middleware</li>
                    <li>API gateway protection modules</li>
                    <li>WebSocket security monitoring</li>
                    <li>Mobile app (React Native) support</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-primary-glow">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-primary-glow flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">CMPTBL Automated Accessibility</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: June 2025</span>
                  </div>
                  <p className="mb-3">
                    AI-driven accessibility scanning and remediation that ensures WCAG 2.1 AA compliance automatically across web properties.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Core Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Automated alt text generation for images</li>
                    <li>Semantic structure analysis and recommendations</li>
                    <li>Keyboard navigation verification</li>
                    <li>Screen reader compatibility testing</li>
                    <li>Continuous compliance monitoring</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">Q3 2025: Marketing Intelligence & Content Automation</h2>
          <p className="mb-6">
            Third quarter introduces marketing-focused AI capabilities that leverage the underlying platform intelligence for content generation and campaign optimization.
          </p>

          <div className="space-y-6 mb-8">
            <Card className="p-6 bg-card/50 border-l-4 border-l-muted">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">PromptFluid Marketing Studio</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: July-August 2025</span>
                  </div>
                  <p className="mb-3">
                    AI marketing platform that generates campaigns, content, and strategies while learning from performance data to continuously improve results.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Planned Capabilities:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Multi-channel campaign generation</li>
                    <li>SEO-optimized content creation</li>
                    <li>Audience analysis and targeting</li>
                    <li>Competitor intelligence gathering</li>
                    <li>A/B testing automation</li>
                    <li>Performance prediction modeling</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-muted">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Creative Generation Pipeline</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: September 2025</span>
                  </div>
                  <p className="mb-3">
                    Integrated image, video, and multimedia generation with intelligent routing across Stability.ai, Replicate, RunwayML, and other specialized providers.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Planned Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Text-to-image with style learning</li>
                    <li>Video generation and editing</li>
                    <li>Brand consistency enforcement</li>
                    <li>Asset library with AI tagging</li>
                    <li>Cost optimization across providers</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-muted">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">SEO Intelligence Engine</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: September 2025</span>
                  </div>
                  <p className="mb-3">
                    Automated SEO optimization that analyzes pages, identifies opportunities, generates optimized content, and tracks ranking performance.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Core Capabilities:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Technical SEO auditing and fixes</li>
                    <li>Keyword research and opportunity identification</li>
                    <li>Content gap analysis</li>
                    <li>Pillar/cluster architecture generation</li>
                    <li>Internal linking optimization</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">Q4 2025: Enterprise Features & Vertical Solutions</h2>
          <p className="mb-6">
            Fourth quarter focuses on enterprise-grade capabilities and building vertical-specific solutions for high-value markets.
          </p>

          <div className="space-y-6 mb-8">
            <Card className="p-6 bg-card/50 border-l-4 border-l-muted">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">PromptFluid Vision (Enhanced Dashboard)</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: October 2025</span>
                  </div>
                  <p className="mb-3">
                    Centralized command center providing visibility into all PromptFluid services, usage analytics, cost optimization, and system health monitoring.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Planned Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Real-time system telemetry and alerts</li>
                    <li>Cost analysis and budget forecasting</li>
                    <li>Team collaboration and permissions</li>
                    <li>Audit logging and compliance reporting</li>
                    <li>Custom dashboards and widgets</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-muted">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">PromptFluid Access (Identity & Billing)</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: November 2025</span>
                  </div>
                  <p className="mb-3">
                    Unified authentication, licensing, and billing system with support for team management, usage-based pricing, and enterprise licensing.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Core Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>SSO and multi-factor authentication</li>
                    <li>Role-based access control (RBAC)</li>
                    <li>Usage metering and billing automation</li>
                    <li>License management and enforcement</li>
                    <li>Payment deferral and credit system</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-l-4 border-l-muted">
              <div className="flex items-start gap-4 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Healthcare & Finance Compliance Packages</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated: December 2025</span>
                  </div>
                  <p className="mb-3">
                    Industry-specific configurations ensuring HIPAA, SOC 2, and financial services regulatory compliance for AI deployments.
                  </p>
                  <h4 className="font-semibold text-sm mb-2">Planned Capabilities:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>HIPAA-compliant data handling and logging</li>
                    <li>SOC 2 Type II audit preparation tools</li>
                    <li>PCI DSS compliance for payment processing</li>
                    <li>Automated compliance documentation</li>
                    <li>Data residency and encryption controls</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">2026 Strategic Initiatives</h2>
          <p className="mb-6">
            Looking further ahead, 2026 focuses on ecosystem expansion, advanced AI capabilities, and establishing PromptFluid as the standard platform for adaptive intelligence.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Advanced Brain Capabilities</h3>
          <p className="mb-4">
            Evolution of the Brain into a sophisticated reasoning system capable of complex multi-step planning, autonomous decision-making, and proactive optimization without human intervention.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Multi-agent collaboration for complex problem-solving</li>
            <li>Predictive routing based on anticipated workload patterns</li>
            <li>Automatic prompt engineering and optimization</li>
            <li>Cross-organization learning (privacy-preserving)</li>
            <li>Causal inference for understanding what drives outcomes</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Edge Deployment Options</h3>
          <p className="mb-4">
            Support for running PromptFluid components on-premises or in private cloud environments for organizations with strict data sovereignty requirements.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Self-hosted Brain instances with cloud synchronization</li>
            <li>Local model inference for latency-sensitive applications</li>
            <li>Air-gapped deployment support for classified environments</li>
            <li>Hybrid architectures mixing cloud and local processing</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Developer Marketplace</h3>
          <p className="mb-4">
            Open platform enabling third-party developers to build and sell extensions, integrations, and specialized capabilities on top of PromptFluid infrastructure.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Plugin architecture for extending core capabilities</li>
            <li>Revenue sharing for marketplace contributors</li>
            <li>Pre-built integrations with popular SaaS platforms</li>
            <li>Custom model hosting and fine-tuning marketplace</li>
            <li>Specialized vertical solutions (legal, medical, financial)</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Advanced Security Research</h3>
          <p className="mb-4">
            Investment in cutting-edge security research to stay ahead of emerging AI threats and adversarial techniques.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Adversarial ML detection and mitigation</li>
            <li>Model extraction protection</li>
            <li>Privacy-preserving federated learning</li>
            <li>Quantum-resistant encryption preparation</li>
            <li>AI red team tooling and testing frameworks</li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">What Won't Change</h2>
          <p className="mb-6">
            While our capabilities will expand dramatically, certain core principles remain constant regardless of roadmap evolution:
          </p>

          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Immutable Principles</h3>
            <ul className="space-y-3">
              <li><strong className="text-primary">Security First:</strong> Protection and threat detection will always be foundational, never bolted on</li>
              <li><strong className="text-primary">Provider Independence:</strong> We'll never lock users into single AI providers or create artificial switching costs</li>
              <li><strong className="text-primary">Transparent Learning:</strong> Organizations own their data and intelligence; we never train on customer information</li>
              <li><strong className="text-primary">Inclusive Design:</strong> Accessibility remains core to every product, not an optional feature</li>
              <li><strong className="text-primary">Open Integration:</strong> APIs and extension points enable customization without forking</li>
            </ul>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">How We Prioritize</h2>
          <p className="mb-6">
            Feature prioritization balances multiple factors to ensure we're building what matters most:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-card/50">
              <h3 className="text-lg font-semibold mb-3">Customer Impact</h3>
              <p className="text-sm mb-2">
                How many users benefit and how significantly? Features that unblock large customer segments or solve critical pain points get priority.
              </p>
            </Card>
            <Card className="p-6 bg-card/50">
              <h3 className="text-lg font-semibold mb-3">Strategic Value</h3>
              <p className="text-sm mb-2">
                Does this capability strengthen competitive positioning, enable new markets, or create sustainable advantages? Strategic initiatives may justify longer timelines.
              </p>
            </Card>
            <Card className="p-6 bg-card/50">
              <h3 className="text-lg font-semibold mb-3">Technical Feasibility</h3>
              <p className="text-sm mb-2">
                Can we build this reliably with acceptable quality? Ambitious features require proof-of-concept validation before roadmap commitment.
              </p>
            </Card>
            <Card className="p-6 bg-card/50">
              <h3 className="text-lg font-semibold mb-3">Resource Efficiency</h3>
              <p className="text-sm mb-2">
                What's the return on engineering investment? Small teams must focus ruthlessly on high-leverage opportunities that compound value.
              </p>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6">Get Involved</h2>
          <p className="mb-6">
            This roadmap evolves based on customer feedback and market dynamics. We actively seek input from users, partners, and the broader community to ensure we're solving real problems effectively.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-semibold mb-4">Beta Program</h3>
              <p className="mb-4">
                Get early access to upcoming features and help shape development through hands-on testing and feedback.
              </p>
              <Link to="/contact">
                <Button className="w-full">Join Beta Program</Button>
              </Link>
            </Card>
            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-semibold mb-4">Feature Requests</h3>
              <p className="mb-4">
                Share your use cases and requirements to influence roadmap priorities and ensure we're building what you need.
              </p>
              <Link to="/contact">
                <Button variant="outline" className="w-full">Submit Request</Button>
              </Link>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20 mt-12">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="mb-6">
              We publish quarterly roadmap updates and monthly development progress reports. Follow our blog or subscribe for notifications when new capabilities launch.
            </p>
            <div className="flex gap-4">
              <Link to="/blog/promptfluid-market-disruptor">
                <Button size="lg">Why PromptFluid</Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">Contact Us</Button>
              </Link>
            </div>
          </Card>
        </section>

        <footer className="mt-16 pt-8 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Related Articles</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/blog/promptfluid-market-disruptor" className="text-primary hover:underline">
                    Why PromptFluid is a Market Disruptor
                  </Link>
                </li>
                <li>
                  <Link to="/blog/ai-platform-comparison-2025" className="text-primary hover:underline">
                    AI Platform Comparison 2025
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/solutions" className="text-primary hover:underline">
                    All Solutions
                  </Link>
                </li>
                <li>
                  <Link to="/products/defense" className="text-primary hover:underline">
                    PromptFluid Defense
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/contact" className="text-primary hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-primary hover:underline">
                    Back to Home
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ProductRoadmap2025;
