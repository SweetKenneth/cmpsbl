import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Scan, CheckCircle, AlertTriangle, Download, Zap, Shield, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!url || !url.startsWith("http")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    setScanning(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("pf-clarity-universal-scan", {
        body: { site_url: url, public_mode: true }
      });

      if (error) throw error;

      setResults(data);
      setShowEmailPrompt(true);
      toast({
        title: "Scan Complete",
        description: `Found ${data.total_issues || 0} accessibility issues`,
      });
    } catch (error: any) {
      toast({
        title: "Scan Failed",
        description: error.message || "Unable to complete scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const sendFollowupEmail = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("pf-clarity-send-followup", {
        body: {
          site_url: url,
          user_email: email,
          scan_id: results?.scan_id,
          compliance_score: results?.compliance_score || 0,
          total_issues: results?.total_issues || 0,
          fixable_issues: results?.auto_fixable || 0,
          critical_issues: results?.critical_issues || 0,
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent!",
        description: "Check your inbox for detailed results and upgrade options",
      });
      setShowEmailPrompt(false);
    } catch (error: any) {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const downloadManual = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("pf-clarity-manual", {
        body: { format: "pdf" }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "PromptFluid-Clarity-User-Manual.pdf";
      link.click();
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download manual. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Free WCAG Accessibility Scanner | PromptFluid Clarity — AI-Powered Site Audit"
        description="Free accessibility scanner with AI-powered auto-fix capabilities. Scan any website for WCAG 2.2 AA/AAA compliance, get personalized email reports, and unlock instant code repairs. No overlays—real accessibility fixes."
        canonical="https://promptfluid.com/scan"
        keywords={[
          'free accessibility scanner',
          'WCAG 2.2 compliance checker',
          'automated accessibility fixes',
          'AI accessibility audit',
          'website accessibility test',
          'WCAG AA compliance',
          'accessibility repair tool',
          'free WCAG scanner',
          'accessibility email report',
          'automated compliance testing',
          'ADA compliance checker',
          'auto accessibility fix'
        ]}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 shadow-glow" variant="default">
              <Zap className="w-3 h-3 mr-1" />
              Free AI-Powered Scanner
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Run a Free Accessibility Scan
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Instant WCAG compliance check for any website. AI-powered scanning across 86 accessibility criteria with auto-fix recommendations.
            </p>

            {/* Feature Strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">86 WCAG Checks</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium">AI Auto-Fix</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Continuous Monitoring</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Rollback-Safe</span>
              </div>
            </div>

            {/* Scanner Form */}
            <Card className="p-8 glass border-primary/20 shadow-glow max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 text-lg"
                  disabled={scanning}
                />
                <Button 
                  size="lg" 
                  onClick={handleScan}
                  disabled={scanning}
                  className="shadow-glow hover:shadow-glow-lg whitespace-nowrap"
                >
                  {scanning ? (
                    <>
                      <Scan className="w-5 h-5 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5 mr-2" />
                      Run Free Scan
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                No signup required • Instant results • WCAG 2.2 compliant
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {results && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Scan Results</h2>
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
                  <span className="text-4xl font-bold text-white">
                    {results.compliance_score || 0}%
                  </span>
                </div>
                <p className="text-lg text-muted-foreground">
                  Compliance Score
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 rounded-lg glass">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {results.total_issues || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Issues</div>
                </div>
                <div className="text-center p-4 rounded-lg glass">
                  <div className="text-3xl font-bold text-destructive mb-2">
                    {results.critical_issues || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Critical Issues</div>
                </div>
                <div className="text-center p-4 rounded-lg glass">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {results.auto_fixable || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Auto-Fixable</div>
                </div>
              </div>

              {/* Email Prompt Section */}
              {showEmailPrompt && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Get Detailed Results + Upgrade Options</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter your email to receive a full accessibility report with personalized fix recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={sendFollowupEmail} className="shadow-glow">
                      Send Report
                    </Button>
                  </div>
                </div>
              )}

              {/* CTA Section */}
              <div className="text-center border-t pt-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Fix These Issues?</h3>
                <p className="text-muted-foreground mb-6">
                  Install Clarity and automatically fix accessibility issues across your entire site.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate("/auth")} className="shadow-glow">
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/projects/clarity")}>
                    Learn More
                  </Button>
                  <Button size="lg" variant="ghost" onClick={downloadManual}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Manual
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How Clarity Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              From free scan to permanent accessibility compliance in three simple steps.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Scan Instantly</h3>
                <p className="text-muted-foreground">
                  Enter any website URL. Clarity analyzes your entire site for WCAG 2.2 AA/AAA compliance in seconds—no signup required.
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Email Report</h3>
                <p className="text-muted-foreground">
                  Receive a personalized email with your compliance score, top 3 critical issues, and count of auto-fixable problems—delivered instantly.
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Upgrade & Auto-Fix</h3>
                <p className="text-muted-foreground">
                  Unlock AI-powered code repairs, continuous monitoring, and rollback protection. Choose monthly ($49) or one-time fix ($199).
                </p>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">What Makes Clarity Different?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Real Code Fixes</h4>
                    <p className="text-sm text-muted-foreground">No overlays or widgets—Clarity repairs your actual source code for permanent accessibility.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">AI-Powered Intelligence</h4>
                    <p className="text-sm text-muted-foreground">Contextual alt text generation, semantic HTML structure, and ARIA label optimization powered by Brain.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Instant Rollback</h4>
                    <p className="text-sm text-muted-foreground">One-click restore if any automated fix breaks your design or functionality.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">WordPress Integration</h4>
                    <p className="text-sm text-muted-foreground">Native plugin for WordPress sites with dashboard integration and scheduled scanning.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
