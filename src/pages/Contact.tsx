/**
 * Contact — CMPSBL Team
 * Rewritten in new theme style
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Send, CheckCircle, ArrowRight, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { DEPARTMENTS, COMPANY_PHONE, COMPANY_PHONE_TEL } from "@/data/team";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', company: '', department: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const targetEmail = formData.department || 'hello@CMPSBL.com';
    const subject = encodeURIComponent(`[CMPSBL Contact] from ${formData.name}${formData.company ? ` (${formData.company})` : ''}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company || 'N/A'}\nDepartment: ${formData.department || 'General'}\n\n${formData.message}`);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      toast({ title: "Opening email client", description: "Your default email app should open with the message pre-filled." });
      setIsSubmitting(false);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact CMPSBL — Get in Touch"
        description="Reach the CMPSBL team for partnerships, enterprise inquiries, support, or press. Departments include Sales, Engineering, Research, Security, and PR."
        canonical="https://cmpsbl.com/contact"
        keywords={['contact CMPSBL', 'AI partnership inquiry', 'enterprise AI contact', 'CMPSBL support', 'Dallas AI company contact']}
      />

      <PublicNav />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)" }} />
      </div>

      {/* Hero */}
      <section className="relative py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-3 sm:px-4 relative z-10 max-w-4xl">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Mail className="w-3 h-3 mr-2" />
              Get in Touch
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 text-foreground tracking-tight">
              Talk to the CMPSBL Team
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Enterprise partnerships, technical questions, research collaborations, or just want to learn more — our team responds to every message.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Departments */}
       <section className="py-12 sm:py-16 px-3 sm:px-4 relative z-10">
         <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Reach the Right Team</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Connect directly with the department that can help you most.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEPARTMENTS.map((dept, index) => (
               <motion.div key={dept.name} {...stagger(index * 0.06)}>
                 <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm glass-edge card-lift hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{dept.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                    <div className="space-y-2 text-sm">
                      <a href={`mailto:${dept.email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="w-3.5 h-3.5" />{dept.email}
                      </a>
                      <a href={COMPANY_PHONE_TEL} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Phone className="w-3.5 h-3.5" />{dept.phone}
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                      Lead: <span className="text-foreground">{dept.head}</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
       <section className="py-12 sm:py-16 px-3 sm:px-4 relative z-10">
         <div className="container mx-auto max-w-5xl">
           <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            <div className="space-y-6">
               <motion.div {...stagger(0)}>
                 <Card className="border-border/50 bg-card/50 backdrop-blur-sm glass-edge">
                   <CardContent className="p-5 sm:p-8">
                    <Mail className="w-10 h-10 text-primary mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">General Contact</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-muted-foreground mb-2">Main Line:</p>
                        <a href={COMPANY_PHONE_TEL} className="text-primary hover:underline text-lg font-medium block">{COMPANY_PHONE}</a>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2">General Inquiries:</p>
                        <a href="mailto:hello@CMPSBL.com" className="text-primary hover:underline text-lg font-medium">hello@CMPSBL.com</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...stagger(0.1)}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <MessageSquare className="w-10 h-10 text-primary mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">What to Expect</h2>
                    <ul className="space-y-3">
                      {["Response time: Within 24-48 hours", "Dedicated team support for all inquiries", "Technical docs and demos available on request"].map((text, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...stagger(0.2)}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-4 text-foreground">Connect With Us</h3>
                    <div className="space-y-3">
                      {[
                        { href: "https://x.com/cmpsbl", label: "Twitter / X", icon: "𝕏" },
                        { href: "https://www.linkedin.com/company/cmpsbl", label: "LinkedIn", icon: "in" },
                        { href: "https://github.com/cmpsbl", label: "GitHub", icon: "⌘" },
                      ].map((link) => (
                        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary/20 transition-colors">{link.icon}</span>
                          {link.label}
                          <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div {...stagger(0.1)} id="contact-form">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/[0.03]">
                <CardContent className="p-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">Name *</label>
                      <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">Email *</label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2 text-foreground">Company</label>
                      <Input id="company" name="company" type="text" value={formData.company} onChange={handleChange} placeholder="Your company name (optional)" />
                    </div>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium mb-2 text-foreground">Department</label>
                      <select id="department" name="department" value={formData.department} onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">General Inquiries</option>
                        {DEPARTMENTS.map(d => (<option key={d.email} value={d.email}>{d.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">Message *</label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us about your needs..." className="min-h-[150px]" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold shadow-lg shadow-primary/20">
                      {isSubmitting ? "Sending..." : (<>Send Message<Send className="w-4 h-4 ml-2" /></>)}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 px-4 relative z-10">
        <motion.div {...fadeUp} className="container mx-auto max-w-4xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Enterprise</Badge>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Custom Deployments</h2>
                <p className="text-muted-foreground mb-4">
                  Need self-hosted deployment via LNCHBL, custom compliance, or a substrate tailored to your organization?
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Self-hosted substrate deployment via LNCHBL", "Custom slot capacity beyond standard tiers", "Dedicated engineering support and SLA guarantees"].map((text, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-64 shrink-0">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Enterprise Sales</h3>
                  <a href="mailto:enterprise@CMPSBL.com" className="text-primary hover:underline text-sm block mb-3">enterprise@CMPSBL.com</a>
                  <a href="#contact-form" className="text-muted-foreground hover:text-primary text-sm">Or use the form above →</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
