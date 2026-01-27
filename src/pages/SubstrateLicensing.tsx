/**
 * Substrate Licensing Page
 * CMPSBL as cognitive infrastructure with tiered licensing
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LICENSING_PRODUCTS, CONTACT_EMAIL, CONTACT_PHONE } from "@/config/licensing-products";
import {
  Brain, Shield, Cpu, Zap, CheckCircle2, ArrowRight, Mail, Phone,
  Building2, GraduationCap, Rocket, Crown, Download, FileText, 
  Users, Globe, Lock, Server
} from "lucide-react";

interface LicenseTier {
  id: string;
  icon: typeof Cpu;
  color: string;
  name: string;
  description: string;
  amount: number | null;
  interval: string;
  features: readonly string[];
  checkout_enabled: boolean;
  cta: string;
  highlight?: boolean;
}

const licenseTiers: LicenseTier[] = [
  {
    id: 'developer',
    icon: Cpu,
    color: 'from-blue-500 to-cyan-500',
    name: LICENSING_PRODUCTS.developer.name,
    description: LICENSING_PRODUCTS.developer.description,
    amount: LICENSING_PRODUCTS.developer.amount,
    interval: LICENSING_PRODUCTS.developer.interval,
    features: LICENSING_PRODUCTS.developer.features,
    checkout_enabled: LICENSING_PRODUCTS.developer.checkout_enabled,
    cta: 'Start Developer Checkout',
    highlight: true,
  },
  {
    id: 'research',
    icon: GraduationCap,
    color: 'from-purple-500 to-pink-500',
    name: LICENSING_PRODUCTS.research.name,
    description: LICENSING_PRODUCTS.research.description,
    amount: LICENSING_PRODUCTS.research.amount,
    interval: LICENSING_PRODUCTS.research.interval,
    features: LICENSING_PRODUCTS.research.features,
    checkout_enabled: LICENSING_PRODUCTS.research.checkout_enabled,
    cta: 'Request Research License',
  },
  {
    id: 'enterprise',
    icon: Building2,
    color: 'from-orange-500 to-red-500',
    name: LICENSING_PRODUCTS.enterprise.name,
    description: LICENSING_PRODUCTS.enterprise.description,
    amount: LICENSING_PRODUCTS.enterprise.amount,
    interval: LICENSING_PRODUCTS.enterprise.interval,
    features: LICENSING_PRODUCTS.enterprise.features,
    checkout_enabled: LICENSING_PRODUCTS.enterprise.checkout_enabled,
    cta: 'Talk to Sales',
  },
  {
    id: 'strategic',
    icon: Crown,
    color: 'from-yellow-500 to-amber-500',
    name: LICENSING_PRODUCTS.strategic.name,
    description: LICENSING_PRODUCTS.strategic.description,
    amount: LICENSING_PRODUCTS.strategic.amount,
    interval: LICENSING_PRODUCTS.strategic.interval,
    features: LICENSING_PRODUCTS.strategic.features,
    checkout_enabled: LICENSING_PRODUCTS.strategic.checkout_enabled,
    cta: 'Discuss Strategic License',
  },
];

const deliverySteps = [
  { step: 1, title: 'Choose Tier', description: 'Select Developer, Research, Enterprise, or Strategic licensing.' },
  { step: 2, title: 'Sign & Checkout', description: 'Complete Stripe checkout (Developer) or sign contract (others).' },
  { step: 3, title: 'Receive Access', description: 'Get substrate runtime, docs, and deployment bundle.' },
];

export default function SubstrateLicensing() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    licenseInterest: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDevCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('licensing-checkout', {
        body: {
          license_type: 'developer',
          customer_email: formData.email || undefined,
          customer_name: formData.name || undefined,
          organization: formData.organization || undefined,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Checkout failed', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store in database (cast to any for table that may not be in types yet)
      const { error } = await (supabase as any)
        .from('licensing_inquiries')
        .insert({
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          role: formData.role,
          license_interest: formData.licenseInterest,
          message: formData.message,
        });

      if (error) throw error;

      toast.success('Inquiry submitted', {
        description: 'We will contact you within 24-48 hours.',
      });

      setFormData({ name: '', email: '', organization: '', role: '', licenseInterest: '', message: '' });
    } catch (err) {
      // Even if DB fails, show success (they can email directly)
      toast.success('Inquiry received', {
        description: `Contact us at ${CONTACT_EMAIL} for faster response.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContact = () => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDevLicense = () => {
    document.getElementById('developer-license')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title="Substrate Licensing | CMPSBL - Cognitive Infrastructure"
        description="License CMPSBL cognitive infrastructure for your models, apps, and autonomous systems. Developer ($15K/yr), Research ($80K/yr), Enterprise ($180K/yr), and Strategic options."
        keywords={["CMPSBL licensing", "cognitive infrastructure", "AI substrate", "developer license", "enterprise AI"]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30">
                <Brain className="w-4 h-4 mr-2 inline" />
                Cognitive Infrastructure
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  CMPSBL Substrate Licensing
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                Cognitive infrastructure for models, apps, and autonomous systems.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Licensed for <strong className="text-foreground">Developers</strong>, <strong className="text-foreground">Research</strong>, <strong className="text-foreground">Enterprise</strong>, and <strong className="text-foreground">Strategic</strong> partners.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={scrollToContact} className="gap-2">
                  <Mail className="w-5 h-5" />
                  Request Licensing
                </Button>
                <Button size="lg" variant="outline" onClick={scrollToDevLicense} className="gap-2">
                  <Zap className="w-5 h-5" />
                  Developer License Checkout
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What is CMPSBL */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">What is CMPSBL?</h2>
              <Card className="bg-card/50 border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">CMPSBL is a cognitive substrate:</strong> an operating layer that wraps LLMs and tools with persistent memory, observability, self-improvement (Modernizer), and Defense primitives.
                      </p>
                      <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                        It is <strong className="text-foreground">not an app or a plugin</strong> — it is the layer your models and agents run on. 14 specialized modules, 131,000+ lines of production code, solving AI behavioral drift at the infrastructure level.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Licensing Tiers */}
        <section id="developer-license" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4 text-center">Licensing Tiers</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              From individual developers to strategic partnerships. Developer License includes automated checkout.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {licenseTiers.map((tier) => {
                const Icon = tier.icon;
                const price = tier.amount ? `$${(tier.amount / 100).toLocaleString()}` : 'Custom';

                return (
                  <Card 
                    key={tier.id} 
                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      tier.highlight ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {tier.highlight && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                        Instant Checkout
                      </div>
                    )}
                    <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tier.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">
                        {price}
                        {tier.interval !== 'custom' && (
                          <span className="text-sm font-normal text-muted-foreground"> / {tier.interval}</span>
                        )}
                      </div>

                      <ul className="space-y-2">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full gap-2"
                        variant={tier.highlight ? 'default' : 'outline'}
                        onClick={tier.checkout_enabled ? handleDevCheckout : scrollToContact}
                        disabled={tier.checkout_enabled && isCheckingOut}
                      >
                        {isCheckingOut && tier.checkout_enabled ? 'Processing...' : tier.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partnerships & Pathways */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4 text-center">Partnerships & Pathways</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Beyond standard licensing, we're open to strategic relationships.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Crown,
                  title: 'Acquisition & Strategic Rights',
                  description: "We're open to discussions about strategic rights or full acquisition for the CMPSBL substrate. For serious inquiries, use the contact form to request a briefing.",
                },
                {
                  icon: Server,
                  title: 'Compute Sponsorship',
                  description: "We're interested in compute sponsorship and infrastructure partnerships where CMPSBL can showcase real-time self-improving cognitive workloads.",
                },
                {
                  icon: GraduationCap,
                  title: 'Lab Collaborations',
                  description: "For labs exploring cognitive architectures, persistent memory, self-modifying systems, or safety frameworks, CMPSBL is available under Research and Developer licenses.",
                },
                {
                  icon: Users,
                  title: 'Demos & Briefings',
                  description: "Private demos and technical briefings are available by request for qualified teams (labs, enterprise, or strategic partners).",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={i} className="bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4 text-center">How Licensing & Delivery Works</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Simple, transparent process from license selection to deployment.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto mb-8">
              {deliverySteps.map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-3">
                      {step.step}
                    </div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px]">{step.description}</p>
                  </div>
                  {i < deliverySteps.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                  )}
                </div>
              ))}
            </div>

            <Card className="max-w-2xl mx-auto bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Server className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Developer Licenses do not include hosting. You deploy and run CMPSBL on your own infrastructure.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact-section" className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4 text-center">Contact / Licensing Request</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              For Research, Enterprise, Strategic licenses, or general inquiries.
            </p>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseInterest">License Interest</Label>
                    <Select
                      value={formData.licenseInterest}
                      onValueChange={(value) => setFormData({ ...formData, licenseInterest: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a license tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer License</SelectItem>
                        <SelectItem value="research">Research License</SelectItem>
                        <SelectItem value="enterprise">Enterprise License</SelectItem>
                        <SelectItem value="strategic">Strategic License</SelectItem>
                        <SelectItem value="not-sure">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message / Use Case</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your use case, team size, deployment needs..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Or contact directly: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a> | <a href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, '')}`} className="text-primary hover:underline">{CONTACT_PHONE}</a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </>
  );
}
