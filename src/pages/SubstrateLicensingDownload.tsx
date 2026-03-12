/**
 * Licensing Page — Self-hosted substrate licensing
 * Separate from Pricing (which covers building on the master substrate)
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download, ExternalLink, CheckCircle2, ArrowRight, Mail, Phone,
  Building2, Sparkles, Crown, Layers, Server, Shield, Code, Lock
} from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/config/licensing-products";
import { Link } from "react-router-dom";

const LICENSE_TIERS = [
  {
    name: "Builder",
    price: "$0",
    period: "/mo",
    icon: Layers,
    gradient: "from-slate-500 to-zinc-500",
    cta: "Get Started",
    ctaAction: "/start-here",
    popular: false,
    comingSoon: false,
    features: [
      "3 Capability Slots · 5 Vault · 3 Pulls/day",
      "Full baseline runtime",
      "30 free templates",
      "Persistent Memory (project-scoped)",
      "Community support",
    ],
    limitations: ["No CLM", "No cross-project learning"],
  },
  {
    name: "Creator",
    price: "$29",
    period: "/mo",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
    cta: "Subscribe",
    ctaAction: "/upgrade",
    popular: true,
    comingSoon: false,
    features: [
      "Everything in Builder",
      "6 Capability Slots · 25 Vault · 6 Pulls/day",
      "Expanded memory depth",
      "Executable capabilities + capability pack export",
      "Priority routing",
      "Email support",
    ],
    limitations: ["Single-project scope"],
  },
  {
    name: "Architect",
    price: "$79",
    period: "/mo",
    icon: Crown,
    gradient: "from-amber-500 to-orange-500",
    cta: "Subscribe",
    ctaAction: "/upgrade",
    popular: false,
    comingSoon: false,
    features: [
      "Everything in Creator",
      "12 Capability Slots · Unlimited Vault · 12 Pulls/day",
      "Dedicated memory partitions",
      "Self-hosted deployment (LNCHBL)",
      "Full governance authority + custom memory slots",
      "Compliance & audit exports",
      "Organization workspaces",
      "Dedicated support channel",
    ],
    limitations: [],
  },
];

export default function SubstrateLicensingDownload() {
  return (
    <>
      <SEO
        title="Licensing | CMPSBL — Deploy Your Own Substrate"
        description="License the CMPSBL substrate for your own infrastructure. Free download at LNCHBL.com with upgrade tiers for advanced cognitive capabilities."
        keywords={["CMPSBL licensing", "substrate license", "self-hosted AI", "cognitive infrastructure license", "LNCHBL"]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30">
                <Server className="w-4 h-4 mr-2 inline text-primary" />
                Self-Hosted Substrate
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Deploy on Your Infrastructure
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-4">
                Run the full CMPSBL substrate on your own servers.
                Download the LNCHBL distribution and deploy cognitive infrastructure in minutes.
              </p>
              <p className="text-lg text-muted-foreground">
                Free tier available. Upgrade for advanced cognitive capabilities.
              </p>
            </div>
          </div>
        </section>

        {/* Difference callout */}
        <section className="py-8 border-y border-border/50 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-center">
              <Card className="flex-1 border-primary/30">
                <CardContent className="p-6 text-center">
                  <Server className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Licensing <Badge variant="outline" className="ml-2">You're here</Badge></h3>
                  <p className="text-sm text-muted-foreground">
                    Download and run the substrate on <strong>your own infrastructure</strong>. You control the deployment, data, and scaling.
                  </p>
                </CardContent>
              </Card>
              <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
              <Card className="flex-1">
                <CardContent className="p-6 text-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <p className="text-sm text-muted-foreground">
                    Build on our <strong>master substrate</strong> with all infrastructure managed for you.{" "}
                    <Link to="/upgrade" className="text-primary hover:underline">View pricing →</Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* License Tiers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {LICENSE_TIERS.map((tier) => {
                const Icon = tier.icon;
                return (
                  <Card
                    key={tier.name}
                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      tier.popular ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                        Most Popular
                      </div>
                    )}
                    <div className={`h-2 bg-gradient-to-r ${tier.gradient}`} />
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tier.gradient} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <span className="text-3xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground text-sm">{tier.period}</span>
                      </div>

                      <ul className="space-y-2.5">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {tier.limitations.map((limit, i) => (
                          <li key={`limit-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground/60">
                            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                            {limit}
                          </li>
                        ))}
                      </ul>

                      {tier.comingSoon ? (
                        <Button
                          className="w-full gap-2 opacity-60 cursor-not-allowed"
                          variant="outline"
                          disabled
                        >
                          <Lock className="w-4 h-4" />
                          Coming Soon
                        </Button>
                      ) : (
                        <Button
                          className="w-full gap-2"
                          variant={tier.popular ? 'default' : 'outline'}
                          asChild
                        >
                          <a href={tier.ctaAction} target={tier.ctaAction.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                            {tier.cta}
                            {tier.ctaAction.startsWith('http') && <ExternalLink className="w-4 h-4" />}
                            {!tier.ctaAction.startsWith('http') && <ArrowRight className="w-4 h-4" />}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Black-Box Artifacts */}
        <section className="py-16 border-t border-border/50 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Black-Box Protected Artifacts</h2>
              <p className="text-muted-foreground">
                Experience Apex Discoveries are delivered as sealed artifacts — you get the full power without exposing the underlying architecture. Your data stays local. Your execution stays private.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: "Sealed Runtime", desc: "Full execution capability with zero source visibility — power without the blueprint." },
                { icon: Code, title: "Local Execution", desc: "Everything runs on your infrastructure. No internet dependency, no data leaves your servers." },
                { icon: Lock, title: "IP Protection", desc: "No config exposure, no export, no cloning. Your competitive advantage stays sealed." },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={i} className="bg-card/50">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">Enterprise Licensing</h2>
              <p className="text-muted-foreground">
                Need source code access, air-gapped deployment, or compliance documentation?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <Mail className="w-4 h-4" />
                    {CONTACT_EMAIL}
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, '')}`}>
                    <Phone className="w-4 h-4" />
                    {CONTACT_PHONE}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </>
  );
}
