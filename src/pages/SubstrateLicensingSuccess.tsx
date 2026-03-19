/**
 * Licensing Success Page — Verify payment and show download access
 */

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2, Download, FileText, Book, Server,
  AlertCircle, Loader2, ArrowRight, Mail
} from "lucide-react";

interface LicenseInfo {
  type: string;
  email: string;
  status: string;
  expires_at: string | null;
  subscription_id?: string;
}

export default function SubstrateLicensingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID provided');
      return;
    }

    const verifyLicense = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('licensing-verify', {
          body: { session_id: sessionId },
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Verification failed');

        setLicense(data.license);
        setStatus('success');

        // Send tier upgrade email
        if (data.license?.email && tier) {
          supabase.functions.invoke('tier-upgrade-email', {
            body: {
              email: data.license.email,
              name: data.license.name || data.license.email?.split('@')[0],
              tier,
              previous_tier: 'builder',
            },
          }).catch(err => console.log('Upgrade email error:', err));
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to verify license');
      }
    };

    verifyLicense();
  }, [sessionId, tier]);

  return (
    <>
      <SEO
        title="License Activated | CMPSBL Substrate"
        description="Your CMPSBL Developer License has been activated."
      />

      <PublicNav />

      <main className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {status === 'loading' && (
              <Card className="text-center">
                <CardContent className="py-12">
                  <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                  <h2 className="text-xl font-semibold mb-2">Verifying License...</h2>
                  <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
                </CardContent>
              </Card>
            )}

            {status === 'error' && (
              <Card className="text-center border-destructive/50">
                <CardContent className="py-12">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
                  <p className="text-muted-foreground mb-6">{errorMessage}</p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/substrate/licensing">Back to Licensing</Link>
                    </Button>
                    <Button asChild>
                      <a href="mailto:support@cmpsbl.com">Contact Support</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {status === 'success' && license && (
              <>
                <Card className="mb-6 border-primary/50">
                  <CardContent className="py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Developer License Activated!</h1>
                    <p className="text-muted-foreground mb-4">
                      Welcome to the CMPSBL Substrate. Your license is now active.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Badge variant="secondary">{license.email}</Badge>
                      {license.expires_at && (
                        <Badge variant="outline">
                          Renews: {new Date(license.expires_at).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* License Terms Summary */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      License Terms Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>✓ Local deployment on your own infrastructure</p>
                    <p>✓ Full runtime, documentation, and restore pipeline access</p>
                    <p>✓ Internal use only — no redistribution or resale</p>
                    <p>✓ Single-seat license (additional seats require separate licenses)</p>
                    <p>✗ No multi-tenant hosting or OEM embedding (requires Enterprise License)</p>
                    <p className="pt-4 border-t border-border">
                      By completing checkout, you accepted the full <Link to="/substrate/licensing/terms" className="text-primary hover:underline">Developer License Agreement</Link>.
                    </p>
                  </CardContent>
                </Card>

                {/* Downloads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Your Downloads
                    </CardTitle>
                    <CardDescription>
                      Access your substrate bundle and documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { icon: Server, name: 'Substrate Runtime Bundle', desc: 'Reference implementation (zip)', action: 'Download' },
                      { icon: Book, name: 'Documentation & API Reference', desc: 'Complete docs package', action: 'Download' },
                      { icon: FileText, name: 'Backup/Restore Pipeline', desc: 'Portable backup example', action: 'Download' },
                      { icon: FileText, name: 'License Agreement (PDF)', desc: 'Your license terms', action: 'Download' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-primary/10">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            {item.action}
                          </Button>
                        </div>
                      );
                    })}

                    <p className="text-xs text-muted-foreground text-center pt-4">
                      Download links are also sent to <strong>{license.email}</strong>. Need help? <a href="mailto:support@cmpsbl.com" className="text-primary hover:underline">Contact support</a>.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-center mt-8">
                  <Button asChild className="gap-2">
                    <Link to="/os">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}
