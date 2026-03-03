import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { Eye, BarChart3, Activity, Shield, ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

const VisionModuleGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="VISION: AI System Dashboard & Analytics"
        description="Centralized monitoring for all substrate execution surfaces — real-time AI performance analytics, system health, and operations."
        type="article"
        publishedTime="2025-09-20"
        keywords={['AI dashboard', 'system monitoring', 'AI analytics', 'VISION module', 'cognitive substrate monitoring']}
      />
      
      <PublicNav />

      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            VISION Module: Your AI Operations Command Center
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Explore VISION, the unified dashboard that provides real-time visibility into every component of the CMPSBL World Engine with powerful analytics and centralized control.
          </p>

          <AuthorBio publishDate="2025-09-20" readTime="10 min read" />
        </div>
      </section>

      <section className="relative w-full py-20 bg-gradient-to-b from-primary/5 via-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <Eye className="w-24 h-24 text-primary mx-auto mb-6" />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete visibility. Centralized control. Intelligent insights.
          </p>
        </div>
      </section>

      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Eye className="h-8 w-8 text-primary" />
              What is the VISION Module?
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                VISION serves as the control plane for the entire CMPSBL World Engine, providing a single interface to monitor, analyze, and manage all 37 matrix nodes across 11 sectors.
              </p>
              <p>
                Unlike fragmented monitoring tools that require jumping between multiple interfaces, VISION unifies operational visibility. One dashboard shows the complete state of your AI infrastructure.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Dashboard Features</h2>
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Activity className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Real-Time System Health</h3>
                    <p className="text-muted-foreground">
                      Monitor the operational status of every module at a glance. VISION displays uptime metrics, API response times, error rates, and queue depths with color-coded status indicators.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <BarChart3 className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">AI Performance Analytics</h3>
                    <p className="text-muted-foreground">
                      Track how providers perform across different task types. VISION shows which models deliver the best results, average response times, and quality scores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Security & Threat Intelligence</h3>
                    <p className="text-muted-foreground">
                      VISION integrates <Link to="/blog/cmpsbl-defense-ai-security" className="text-primary hover:underline">DEFENSE</Link> telemetry to display blocked threats, suspicious pattern detections, and behavioral analysis results directly in the dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Eye className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">BRAIN Console Integration</h3>
                    <p className="text-muted-foreground">
                      Access <Link to="/blog/cmpsbl-brain-adaptive-learning-core" className="text-primary hover:underline">BRAIN</Link> directly through VISION's integrated console. Upload knowledge files, review learning insights, and monitor the autonomy score.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "When everything connects through one interface, patterns become clear."
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Analytics That Drive Decisions</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>VISION doesn't just display metrics—it provides context and recommendations. When usage patterns shift unexpectedly, VISION identifies which endpoints or workflows drove the change.</p>
              <p>Historical trend analysis reveals patterns invisible in raw logs. VISION shows how system performance evolved over weeks and months, making it easy to assess the impact of BRAIN learning cycles.</p>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-4 text-foreground">Experience Unified Operations</h3>
            <p className="text-muted-foreground mb-6">See how VISION brings complete visibility and control to your AI infrastructure through one powerful dashboard.</p>
            <Link to="/modules" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Explore All Modules →
            </Link>
          </section>

          <section className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/blog/how-cmpsbl-works-substrate-ecosystem" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
                <h3 className="text-lg font-semibold mb-2 text-foreground">How the CMPSBL World Engine Works</h3>
                <p className="text-sm text-muted-foreground">Discover the complete architecture that VISION monitors and controls.</p>
              </Link>
              <Link to="/blog/cmpsbl-brain-adaptive-learning-core" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
                <h3 className="text-lg font-semibold mb-2 text-foreground">BRAIN: Adaptive Learning Core</h3>
                <p className="text-sm text-muted-foreground">Explore the learning core that powers VISION's intelligent insights.</p>
              </Link>
            </div>
          </section>
        </div>
      </article>
      <EnhancedFooter />
    </div>
  );
};

export default VisionModuleGuide;