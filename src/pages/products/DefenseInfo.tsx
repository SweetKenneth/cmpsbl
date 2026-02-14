/**
 * Defense Info — Security Module Product Page
 * v9.3.0 ARCHITECT Epoch — Part of 21-module substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Scan, Brain, AlertTriangle, Lock, Target, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function DefenseInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Defense Module — AI-Powered Threat Detection & Security | CMPSBL"
        description="Enterprise security powered by AI behavioral analysis. Part of CMPSBL's 21-module cognitive substrate with real-time threat detection and adaptive learning."
        canonical="https://cmpsbl.com/products/defense"
        keywords={['AI threat detection', 'behavioral security analysis', 'cognitive security module', 'CMPSBL Defense', 'enterprise AI security', 'adaptive threat protection', 'bot detection AI', 'real-time threat intelligence', 'security orchestration', 'AI cybersecurity platform']}
      />

      <PublicNav />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-32 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
          animate={{ x: [-30, 30, -30], y: [-15, 15, -15] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Defense Module</span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-6xl font-bold mb-6">
            Adaptive Security.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enterprise-grade protection that learns from every threat. Part of CMPSBL's 21-module cognitive 
            substrate with behavioral intelligence that adapts in real-time.
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
      <section className="container mx-auto px-4 py-20 flex-1 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Scan, title: "Behavioral Analysis", description: "Track interaction patterns to distinguish real users from sophisticated bots using AI-powered analysis." },
            { icon: Brain, title: "Adaptive Learning", description: "Machine learning models that evolve with new threats, getting smarter with every detection." },
            { icon: Target, title: "Device Fingerprinting", description: "Create unique device signatures to track and block malicious actors across sessions." },
            { icon: AlertTriangle, title: "Threat Intelligence", description: "Real-time threat scoring and risk assessment with automated response workflows." },
            { icon: Lock, title: "Red Team Testing", description: "Built-in penetration testing to validate your security posture and find vulnerabilities." },
            { icon: Shield, title: "Intelligent CAPTCHA", description: "Smart CAPTCHA deployment only when needed, keeping the user experience smooth." }
          ].map((feature, index) => (
            <motion.div key={index} {...stagger(index * 0.08)}>
              <Card className="p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { label: "AI Analysis Engine", value: "Behavioral", gradient: "from-primary to-primary-variant" },
              { label: "Threat Detection", value: "Real-Time", gradient: "from-primary-variant to-accent" },
              { label: "Automated Protection", value: "24/7", gradient: "from-accent to-primary" },
            ].map((stat, i) => (
              <motion.div key={i} {...stagger(i * 0.1)}>
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center mb-12">
            Protect Your Business From Modern Threats
          </motion.h2>
          <div className="space-y-4">
            {[
              "Detect bots through behavioral analysis, not just IP blocking",
              "Prevent account takeover attempts and credential stuffing attacks",
              "Stop web scraping and data harvesting in real-time",
              "Reduce fraud with AI that learns actual user behavior patterns",
              "Eliminate fake account creation and spam submissions",
              "Maintain performance with lightweight, optimized detection"
            ].map((benefit, index) => (
              <motion.div key={index} {...stagger(index * 0.06)} className="flex items-start gap-3 glass p-4 rounded-xl hover:border-primary/20 border border-transparent transition-colors">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl border border-primary/10">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Application?</h2>
          <p className="text-muted-foreground mb-6">
            Protect your infrastructure with CMPSBL's Defense module today.
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
