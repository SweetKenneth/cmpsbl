import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Send, CheckCircle, ArrowRight, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero/neon-data-center.jpg";
import accessibilityImage from "@/assets/hero/neon-dream-cosmos.jpg";
import { DEPARTMENTS, COMPANY_PHONE, COMPANY_PHONE_TEL } from "@/data/team";

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

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    department: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const targetEmail = formData.department || 'hello@CMPSBL.com';
    const subject = encodeURIComponent(`[CMPSBL Contact] from ${formData.name}${formData.company ? ` (${formData.company})` : ''}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company || 'N/A'}\nDepartment: ${formData.department || 'General'}\n\n${formData.message}`);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    setTimeout(() => {
      toast({
        title: "Opening email client",
        description: "Your default email app should open with the message pre-filled.",
      });
      setIsSubmitting(false);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      {/* Ambient glow — CSS only */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-2"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }}
        />
      </div>
      
      {/* Hero */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Collaborative team working together in modern tech workspace"
          className="absolute inset-0 w-full h-[50vh] object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-16 max-w-4xl">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-6 border-primary/30 bg-background/80 text-primary">
              <Mail className="w-3 h-3 mr-2" />
              Get in Touch
            </Badge>
          </motion.div>
          
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground [text-shadow:_0_2px_20px_hsl(var(--background))]">
            Talk to Us
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-3xl [text-shadow:_0_2px_10px_hsl(var(--background))]">
            Enterprise partnerships, technical questions, or just want to learn more — our team responds to every message.
          </motion.p>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Reach the Right Team</h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Connect directly with the department that can help you most.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept, index) => (
              <motion.div
                key={dept.name}
                {...stagger(index * 0.06)}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{dept.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                <div className="space-y-2 text-sm">
                  <a href={`mailto:${dept.email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="w-3.5 h-3.5" />
                    {dept.email}
                  </a>
                  <a href={COMPANY_PHONE_TEL} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {dept.phone}
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                  Lead: <span className="text-foreground">{dept.head}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <motion.div {...stagger(0)} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <Mail className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">General Contact</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-2">Main Line:</p>
                    <a href={COMPANY_PHONE_TEL} className="text-primary hover:underline text-lg font-medium block">
                      {COMPANY_PHONE}
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">General Inquiries:</p>
                    <a href="mailto:hello@CMPSBL.com" className="text-primary hover:underline text-lg font-medium">
                      hello@CMPSBL.com
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div {...stagger(0.1)} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <MessageSquare className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">What to Expect</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Response time: Within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Dedicated team support for all inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Technical docs and demos available on request</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div {...stagger(0.2)} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-foreground">Connect With Us</h3>
                <div className="space-y-2">
                  <a href="https://x.com/cmpsbl" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    Twitter/X
                  </a>
                  <a href="https://www.linkedin.com/company/cmpsbl" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    LinkedIn
                  </a>
                  <a href="https://github.com/cmpsbl" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    GitHub
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div {...stagger(0.1)} id="contact-form" className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">Name *</label>
                  <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Your name" className="w-full" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">Email *</label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" className="w-full" />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-2 text-foreground">Company</label>
                  <Input id="company" name="company" type="text" value={formData.company} onChange={handleChange} placeholder="Your company name (optional)" className="w-full" />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-2 text-foreground">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">General Inquiries</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d.email} value={d.email}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">Message *</label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us about your needs..." className="w-full min-h-[150px]" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
                  {isSubmitting ? "Sending..." : (<>Send Message<Send className="w-4 h-4 ml-2" /></>)}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[30vh] sm:h-[40vh] overflow-hidden">
        <img src={accessibilityImage} alt="Accessibility technology interface" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      </section>

      {/* Applied Engagements */}
      <motion.section {...fadeUp} className="py-16 px-4 bg-primary/5 border-y border-primary/20 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-5 sm:gap-8 items-start">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Enterprise</Badge>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Custom Deployments</h2>
              <p className="text-muted-foreground mb-4">
                Need self-hosted deployment, custom compliance, or a substrate tailored to your organization? 
                Our engineering team architects solutions for teams that demand full control.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Self-hosted substrate deployment via LNCHBL", "Custom slot capacity beyond standard tiers", "Dedicated engineering support and SLA guarantees"].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-64">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-2">Talk to Our Sales Team</h3>
                <p className="text-sm text-muted-foreground mb-4">Email sales@CMPSBL.com or use the form below</p>
                <a href="#contact-form" className="text-primary hover:underline text-sm">Go to contact form →</a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Enterprise CTA */}
      <section className="py-16 px-4 bg-muted/30 relative z-10">
        <motion.div {...fadeUp} className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Enterprise & Self-Hosted</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            Need dedicated infrastructure, compliance guarantees, or custom capacity? Let's talk.
          </p>
          <Link to="/enterprise">
            <Button size="lg" variant="outline">
              Enterprise Solutions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
