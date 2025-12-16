import { Download, FileCheck, Shield, Zap, ExternalLink, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ClarityDownload() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // Call edge function to generate the ZIP
      const { data, error } = await supabase.functions.invoke('pf-clarity-package', {
        body: { version: '3.0.0' }
      });

      if (error) throw error;

      if (data?.download_url) {
        // Trigger download
        window.open(data.download_url, '_blank');
        toast({
          title: "Download Started",
          description: "PromptFluid Clarity v3.0.0 is downloading..."
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: "Failed to generate package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const installSteps = [
    {
      step: 1,
      title: "Download Plugin",
      description: "Click the download button above to get promptfluid-clarity.zip"
    },
    {
      step: 2,
      title: "Upload to WordPress",
      description: "Go to Plugins > Add New > Upload Plugin in your WordPress admin"
    },
    {
      step: 3,
      title: "Activate",
      description: "Activate the plugin and navigate to Clarity in the admin menu"
    },
    {
      step: 4,
      title: "Run First Scan",
      description: "Click 'Scan Site' to analyze your WordPress site for accessibility issues"
    }
  ];

  const requirements = [
    "WordPress 5.8 or higher",
    "PHP 7.4 or higher",
    "Modern browser (Chrome, Firefox, Safari, Edge)",
    "Active internet connection for AI features"
  ];

  return (
    <>
      <SEO
        title="Download PromptFluid Clarity | WordPress Accessibility Plugin"
        description="Download the free PromptFluid Clarity WordPress plugin. AI-powered WCAG 2.2 accessibility scanning and automated fixes for your WordPress site."
        canonical="https://promptfluid.com/downloads/clarity"
      />
      <div className="min-h-screen">
        <PublicNav />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Free WordPress Plugin</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                    Download Clarity
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8">
                  AI-powered WCAG 2.2 accessibility scanner for WordPress
                </p>

                <div className="flex flex-col items-center gap-4">
                  <Button 
                    size="lg"
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="shadow-glow hover:shadow-glow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Generating Package...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5" />
                        Download v3.0.0
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-4 h-4" />
                      Version 3.0.0
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      GPL v2 License
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-12">
                <div className="p-4 rounded-xl glass border border-border/50 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">Free</div>
                  <div className="text-xs text-muted-foreground">Forever</div>
                </div>
                <div className="p-4 rounded-xl glass border border-border/50 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">AI</div>
                  <div className="text-xs text-muted-foreground">Powered</div>
                </div>
                <div className="p-4 rounded-xl glass border border-border/50 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">WCAG 2.2</div>
                  <div className="text-xs text-muted-foreground">Compliant</div>
                </div>
              </div>
            </div>
          </section>

          {/* Installation Steps */}
          <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold mb-8 text-center">Installation Guide</h2>
              
              <div className="space-y-6">
                {installSteps.map((item) => (
                  <div key={item.step} className="flex gap-4 p-6 rounded-xl glass border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Requirements */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold mb-8 text-center">System Requirements</h2>
              
              <div className="p-8 rounded-xl glass border border-border/50">
                <ul className="grid md:grid-cols-2 gap-4">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Documentation Links */}
          <section className="py-16 px-4 bg-gradient-to-b from-muted/20 to-background">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold mb-8 text-center">Documentation & Support</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  to="/solutions"
                  className="p-6 rounded-xl glass border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <Code className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quick start guide and configuration
                  </p>
                  <span className="text-primary text-sm flex items-center gap-1">
                    View Solutions <ExternalLink className="w-4 h-4" />
                  </span>
                </Link>

                <Link
                  to="/products/clarity"
                  className="p-6 rounded-xl glass border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <Zap className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Features Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn about all features and capabilities
                  </p>
                  <span className="text-primary text-sm flex items-center gap-1">
                    View Features <ExternalLink className="w-4 h-4" />
                  </span>
                </Link>

                <Link
                  to="/contact"
                  className="p-6 rounded-xl glass border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <Shield className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Get Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Report issues and get help
                  </p>
                  <span className="text-primary text-sm flex items-center gap-1">
                    Contact Us <ExternalLink className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Download PromptFluid Clarity and make your WordPress site accessible to everyone
              </p>
              <Button 
                size="lg" 
                onClick={handleDownload}
                disabled={isGenerating}
                className="shadow-glow hover:shadow-glow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Now
                  </>
                )}
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
