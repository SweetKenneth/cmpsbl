import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Eye, Activity, BarChart3, Settings, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.08 },
});

const features = [
  { icon: Activity, title: "Real-Time System Health", description: "Monitor uptime, response times, and error rates across all modules with instant alerting for critical issues." },
  { icon: BarChart3, title: "Advanced Analytics", description: "Visualize trends, track KPIs, and generate custom reports to understand system performance at a glance." },
  { icon: Shield, title: "Security Monitoring", description: "Track bot detections, threat levels, and security events in real-time with automated response workflows." },
  { icon: Zap, title: "Performance Metrics", description: "Monitor API latency, throughput, and resource utilization to maintain optimal system performance." },
  { icon: Settings, title: "Unified Control", description: "Manage settings, configurations, and deployments across all modules from a single interface." },
  { icon: CheckCircle, title: "Compliance Tracking", description: "Track accessibility scores, security audits, and compliance status with automated reporting." },
];

const benefits = [
  "Reduce incident response time by 70% with real-time alerting",
  "Make data-driven decisions with comprehensive analytics and reporting",
  "Maintain 99.9% uptime with proactive monitoring and health checks",
  "Simplify operations with unified control across all AI modules",
  "Ensure compliance with automated tracking and audit trails",
  "Scale confidently with enterprise-grade monitoring infrastructure",
];

export default function VisionInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Vision Dashboard — Real-Time AI System Monitoring & Analytics | CMPSBL"
        description="Centralized control panel for monitoring AI performance, system health, and security metrics in real-time. Part of CMPSBL's 21-module cognitive substrate."
        canonical="https://cmpsbl.com/products/vision"
        keywords={['real-time monitoring dashboard', 'AI system analytics', 'performance monitoring software', 'system health dashboard', 'centralized control panel', 'business intelligence platform', 'real-time metrics tracking', 'operational dashboard', 'monitoring and alerting system', 'data visualization dashboard']}
      />

      <PublicNav />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
          animate={{ x: [60, -60, 60], y: [-30, 30, -30] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%)" }}
          animate={{ x: [-40, 40, -40], y: [20, -20, 20] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Vision Dashboard</span>
            </div>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-6xl font-bold mb-6">
            See Everything.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Control Everything.
            </span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your centralized command center for monitoring AI systems, tracking performance metrics, 
            and maintaining operational excellence across your entire ecosystem.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="group">
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Schedule Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div key={index} {...stagger(index)}>
              <Card className="p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4 shadow-md shadow-primary/20">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center mb-12">
            Why Teams Choose Vision Dashboard
          </motion.h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div key={index} {...stagger(index)} className="flex items-start gap-3 glass p-4 rounded-lg hover:border-primary/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl border border-primary/10">
          <h2 className="text-3xl font-bold mb-4">Ready to Gain Full Visibility?</h2>
          <p className="text-muted-foreground mb-6">
            Start monitoring your AI systems with Vision Dashboard today.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="group">
            Get Started Now
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
