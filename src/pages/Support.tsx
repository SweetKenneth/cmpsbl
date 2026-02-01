/**
 * Support — Evolving AI Support Bot
 * v1.0.0 — Memory-backed, governed support system
 */

import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SupportBotPanel } from "@/components/substrate/SupportBotPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Sparkles, MessageCircle } from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Support — Evolving AI Assistant | promptfluid®</title>
        <meta 
          name="description" 
          content="Get help from our evolving AI support system. Memory-backed, governed assistance that learns from verified resolutions." 
        />
      </Helmet>

      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-12 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Evolving Support System
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                How can we help?
              </h1>
              <p className="text-lg text-muted-foreground">
                Our AI support assistant learns from verified resolutions while maintaining 
                strict governance. When uncertain, it escalates instead of guessing.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm">
                <Brain className="w-4 h-4 text-primary" />
                <span>Memory-Backed</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span>Governed Responses</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Escalation-First</span>
              </div>
            </div>
          </div>
        </section>

        {/* Support Bot */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <SupportBotPanel />
          </div>
        </section>

        {/* Additional Resources */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Additional Resources</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Documentation</CardTitle>
                  <CardDescription className="text-sm">
                    Browse the complete FNDTN v7 library
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/library" className="text-primary text-sm font-medium hover:underline">
                    View Library →
                  </a>
                </CardContent>
              </Card>
              
              <Card className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Contact Us</CardTitle>
                  <CardDescription className="text-sm">
                    Reach our team directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/contact" className="text-primary text-sm font-medium hover:underline">
                    Get in Touch →
                  </a>
                </CardContent>
              </Card>
              
              <Card className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Evolution Log</CardTitle>
                  <CardDescription className="text-sm">
                    See what's changed recently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/changelog" className="text-primary text-sm font-medium hover:underline">
                    View Changelog →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
