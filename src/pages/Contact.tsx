import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Send, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImage from "@/assets/hero/neon-data-center.jpg";
import accessibilityImage from "@/assets/hero/neon-dream-cosmos.jpg";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', company: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contact CMPSBL® | Get in Touch"
        description="Contact CMPSBL for licensing arrangements, enterprise partnerships, or substrate inquiries. Founder-led support for all inquiries."
        canonical="https://cmpsbl.com/contact"
        keywords={['contact CMPSBL', 'licensing', 'enterprise partnerships', 'cognitive infrastructure']}
      />
      
      <PublicNav />
      
      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Collaborative team working together in modern tech workspace"
          className="absolute inset-0 w-full h-[50vh] object-cover"
        />
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-16 max-w-4xl">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          
          <Badge variant="outline" className="mb-6 border-primary/30 bg-background/80 text-primary">
            <Mail className="w-3 h-3 mr-2" />
            Get in Touch
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground [text-shadow:_0_2px_20px_hsl(var(--background))]">
            Licensing & Partnerships
          </h1>
          <p className="text-xl text-foreground/90 max-w-3xl [text-shadow:_0_2px_10px_hsl(var(--background))]">
            Inquire about licensing arrangements, enterprise partnerships, or CMPSBL® substrate access.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-8">
                <Mail className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-4 text-foreground">Contact Us</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-2">Phone:</p>
                    <a href="tel:+17603584324" className="text-primary hover:underline text-lg font-medium block">
                      (760) FLUID-AI
                    </a>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-2">Email:</p>
                    <a href="mailto:Dev@CMPSBL.com" className="text-primary hover:underline text-lg font-medium">
                      Dev@CMPSBL.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-8">
                <MessageSquare className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Answers</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Response time: Within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Founder-led support for all inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Technical docs available on request</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-8">
                <h3 className="text-xl font-bold mb-4 text-foreground">Connect With Us</h3>
                <div className="space-y-2">
                  <a href="https://x.com/kennethesweetjr?s=21" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    Twitter/X
                  </a>
                  <a href="https://www.linkedin.com/in/kennethesweetjr?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    LinkedIn
                  </a>
                  <a href="https://github.com/SweetKenneth" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-2 text-foreground">
                    Company
                  </label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company name (optional)"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your needs..."
                    className="w-full min-h-[150px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <img 
          src={accessibilityImage}
          alt="Accessibility technology interface with universal design elements"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      </section>

      {/* Applied Engagements */}
      <section className="py-16 px-4 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                Q1 2026
              </Badge>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Applied Engagements</h2>
              <p className="text-muted-foreground mb-4">
                Applied engagements are scoped, research-first, and selective. If your problem 
                touches long-horizon or uncertainty-critical systems, we may be interested.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Research-driven approach with documented outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Focus on uncertainty-critical and long-horizon systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Selective intake — not all inquiries result in engagement</span>
                </li>
              </ul>
            </div>
            <div className="md:w-64">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Inquire About Engagements</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use the contact form to describe your challenge.
                </p>
                <a href="#contact-form" className="text-primary hover:underline text-sm">
                  Scroll to form →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Enterprise Solutions</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Need custom integrations, dedicated support, or investment discussions? Our team is ready.
          </p>
          <Link to="/investors">
            <Button size="lg" variant="outline">
              Investor Information
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
