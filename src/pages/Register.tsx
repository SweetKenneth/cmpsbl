/**
 * Observer Registration — Email Intake Only
 * Simple registration form for observer tier
 * No login, no dashboard — just email capture
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Eye, Mail, CheckCircle, ArrowLeft, Send } from "lucide-react";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email must be less than 255 characters" })
});

export default function Register() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create mailto link submission (no backend needed)
      const subject = encodeURIComponent("Observer Registration — CMPSBL Substrate");
      const body = encodeURIComponent(`New Observer Registration\n\nEmail: ${email}\nTimestamp: ${new Date().toISOString()}\n\nThis is an automated registration from the CMPSBL website observer intake form.`);
      
      // Open mail client
      window.location.href = `mailto:Dev@CMPSBL.com?subject=${subject}&body=${body}`;
      
      // Show success after brief delay
      setTimeout(() => {
        setIsSubmitted(true);
        setIsSubmitting(false);
      }, 500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>Registration Received | promptfluid®</title>
        </Helmet>

        <PublicNav />

        <main className="flex-1 container mx-auto px-4 py-12 max-w-xl flex items-center justify-center">
          <Card className="w-full border-primary/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold mb-3">Thank You</h1>
              <p className="text-muted-foreground mb-6">
                We've received your registration. We'll be in touch soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/insights">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Insights
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/foundations">
                    Browse Documentation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Register as Observer | promptfluid®</title>
        <meta name="description" content="Register for observer-level access to CMPSBL Substrate OS documentation and standards materials." />
      </Helmet>

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
        {/* Back Link */}
        <Link 
          to="/insights" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Substrate Insights
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">Observer Registration</span>
          </div>
          <h1 className="text-3xl font-light mb-3">
            Register as Observer
          </h1>
          <p className="text-muted-foreground">
            Join the observer list for CMPSBL v6.0.0 updates and documentation access.
          </p>
        </div>

        {/* Registration Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email Registration
            </CardTitle>
            <CardDescription>
              Enter your email to register for observer access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={error ? "border-destructive" : ""}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p id="email-error" className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Register
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            Observer registration provides access to documentation and standards materials. 
            No account creation required.
          </p>
        </div>

        {/* What You Get */}
        <Card className="mt-8 bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">What Observers Access</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Full FNDTN v6.0.0 documentation library (26 documents)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>21-module architecture reference materials</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>AI Governance Namespace and LLMS.txt standards</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Updates on new documentation releases</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <EnhancedFooter />
    </div>
  );
}
