import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contact PromptFluid | WordPress Security Support & Enterprise Sales";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact PromptFluid for WordPress security plugin support, enterprise bot protection inquiries, and AI-powered threat detection solutions. Get in touch with our security experts for demos and technical assistance.');
    }
    
    // Add keywords meta
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'WordPress security contact, bot protection support, security plugin help, enterprise WordPress security, AI security demo, threat detection inquiries');
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact PromptFluid",
      "description": "Get in touch with PromptFluid for support and inquiries",
      "provider": {
        "@type": "Organization",
        "name": "PromptFluid",
        "contactPoint": {
          "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "PromptFluid@gmail.com"
        }
      }
    });
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      {/* Navigation */}
      <PublicNav />
      
      {/* Hero */}
      <header className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-gradient"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
            Let's <span className="gradient-text">Connect</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Have questions about PromptFluid? Want to discuss enterprise solutions? 
            We're here to help you transform your development workflow.
          </p>
        </div>
      </header>

      {/* Contact Form Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="glass glass-hover p-8 rounded-xl">
                <Mail className="w-12 h-12 text-primary mb-4 animate-glow" />
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-2">Phone:</p>
                    <a href="tel:7603584324" className="text-primary hover:underline text-lg font-medium block">
                      (760) 358-4324
                    </a>
                    <p className="text-muted-foreground text-sm">(760) FLUID-AI</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-2">
                      For all inquiries including support, sales, and partnerships:
                    </p>
                    <a href="mailto:PromptFluid@gmail.com" className="text-primary hover:underline text-lg font-medium">
                      PromptFluid@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="glass glass-hover p-8 rounded-xl">
                <MessageSquare className="w-12 h-12 text-primary mb-4 animate-glow" />
                <h2 className="text-2xl font-bold mb-4">Quick Answers</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Response time: Within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Support hours: 24/7 for enterprise customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Technical documentation: <a href="https://docs.promptfluid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">docs.promptfluid.com</a></span>
                  </li>
                </ul>
              </div>

              <div className="glass glass-hover p-8 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                <p className="text-muted-foreground mb-4">
                  Follow PromptFluid on social media for updates, insights, and community discussions:
                </p>
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
            <div className="glass glass-hover p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
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
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
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
                  <label htmlFor="company" className="block text-sm font-medium mb-2">
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
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
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
                  className="w-full bg-primary hover:bg-primary/80 text-white"
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

      {/* Enterprise CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Enterprise Solutions</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Need custom integrations, dedicated support, or on-premise deployment? 
            Our enterprise team is ready to build a solution that fits your organization.
          </p>
          <Link to="/solutions">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Explore Enterprise Options
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <EnhancedFooter />
    </div>
  );
}
