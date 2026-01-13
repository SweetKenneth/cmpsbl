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
import heroImage from "@/assets/hero/team-collaboration.jpg";
import accessibilityImage from "@/assets/hero/accessibility-technology.jpg";

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
        title="Contact PromptFluid | Get in Touch"
        description="Contact PromptFluid for support, enterprise inquiries, and partnership opportunities. Founder-led support for all inquiries."
        canonical="https://promptfluid.com/contact"
        keywords={['contact PromptFluid', 'AI support', 'enterprise inquiries', 'partnership']}
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
          
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
            <Mail className="w-3 h-3 mr-2" />
            Get in Touch
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Let's Connect
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Have questions about PromptFluid? Want to discuss investment or enterprise solutions? We're here to help.
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
                    <a href="tel:7603584324" className="text-primary hover:underline text-lg font-medium block">
                      (760) FLUID-AI
                    </a>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-2">Email:</p>
                    <a href="mailto:promptfluid@gmail.com" className="text-primary hover:underline text-lg font-medium">
                      promptfluid@gmail.com
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
                  <a href="https://twitter.com/promptfluid" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    Twitter/X
                  </a>
                  <a href="https://linkedin.com/company/promptfluid" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    LinkedIn
                  </a>
                  <a href="https://github.com/promptfluid" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
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
