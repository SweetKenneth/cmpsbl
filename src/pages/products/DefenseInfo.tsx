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

export default function DefenseInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Defense Module — AI-Powered Threat Detection & Security | CMPSBL"
        description="Enterprise security powered by AI behavioral analysis. Part of CMPSBL's 21-module cognitive substrate with real-time threat detection and adaptive learning."
        canonical="https://cmpsbl.com/products/defense"
        keywords={[
          'AI threat detection',
          'behavioral security analysis',
          'cognitive security module',
          'CMPSBL Defense',
          'enterprise AI security',
          'adaptive threat protection',
          'bot detection AI',
          'real-time threat intelligence',
          'security orchestration',
          'AI cybersecurity platform'
        ]}
      />

      <PublicNav />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Defense Module</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Adaptive Security.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enterprise-grade protection that learns from every threat. Part of CMPSBL's 21-module cognitive 
            substrate with behavioral intelligence that adapts in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="group">
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 flex-1">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Scan,
              title: "Behavioral Analysis",
              description: "Track interaction patterns to distinguish real users from sophisticated bots using AI-powered analysis."
            },
            {
              icon: Brain,
              title: "Adaptive Learning",
              description: "Machine learning models that evolve with new threats, getting smarter with every detection."
            },
            {
              icon: Target,
              title: "Device Fingerprinting",
              description: "Create unique device signatures to track and block malicious actors across sessions."
            },
            {
              icon: AlertTriangle,
              title: "Threat Intelligence",
              description: "Real-time threat scoring and risk assessment with automated response workflows."
            },
            {
              icon: Lock,
              title: "Red Team Testing",
              description: "Built-in penetration testing to validate your security posture and find vulnerabilities."
            },
            {
              icon: Shield,
              title: "Intelligent CAPTCHA",
              description: "Smart CAPTCHA deployment only when needed, keeping the user experience smooth."
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent mb-2">
                Behavioral
              </div>
              <div className="text-muted-foreground">AI Analysis Engine</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-variant to-accent bg-clip-text text-transparent mb-2">
                Real-Time
              </div>
              <div className="text-muted-foreground">Threat Detection</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-muted-foreground">Automated Protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Protect Your Business From Modern Threats
          </h2>
          <div className="space-y-6">
            {[
              "Detect bots through behavioral analysis, not just IP blocking",
              "Prevent account takeover attempts and credential stuffing attacks",
              "Stop web scraping and data harvesting in real-time",
              "Reduce fraud with AI that learns actual user behavior patterns",
              "Eliminate fake account creation and spam submissions",
              "Maintain performance with lightweight, optimized detection"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 glass p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Application?</h2>
          <p className="text-muted-foreground mb-6">
            Protect your infrastructure with CMPSBL's Defense module today.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="group">
            Get Started Now
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
