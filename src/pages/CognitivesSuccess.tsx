/**
 * Composable Cognitives — Success Page
 * Verifies Stripe payment and provides download link
 */

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Download, CheckCircle, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { NameCertificate } from "@/components/cognitives/NameCertificate";
import { supabase } from "@/integrations/supabase/client";

interface VerifyResult {
  ok: boolean;
  sku?: string;
  name?: string;
  downloadUrl?: string;
  expiresInSeconds?: number;
  error?: string;
}

export default function CognitivesSuccess() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setResult({ ok: false, error: "Missing session ID" });
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("cognitives-verify", {
          body: null,
          method: "GET",
        });

        // Edge functions don't support GET with query params well via invoke,
        // so we'll use a direct fetch
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cognitives-verify?session_id=${encodeURIComponent(sessionId)}`;
        const res = await fetch(url, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });
        const json = await res.json();
        setResult(json);
      } catch (err) {
        setResult({ ok: false, error: err instanceof Error ? err.message : "Verification failed" });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Download Your Cognitive — CMPSBL®</title>
      </Helmet>

      <PublicNav />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {loading && (
            <Card>
              <CardContent className="p-8 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying your payment...</span>
              </CardContent>
            </Card>
          )}

          {!loading && result?.ok && (
            <>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-6 h-6" />
                    Payment Verified
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Your <strong>{result.sku}</strong> cognitive is ready for download.
                    The link expires in {result.expiresInSeconds} seconds.
                  </p>

                  <Button asChild size="lg" className="w-full gap-2 font-mono">
                    <a href={result.downloadUrl} download>
                      <Download className="w-5 h-5" />
                      Download ZIP
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {result.name && (
                <NameCertificate
                  name={result.name}
                  sku={result.sku || ''}
                  issuedAt={new Date().toISOString()}
                />
              )}

              {/* Support */}
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">Need help installing?</p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <Link to="/support" className="text-primary hover:text-primary/80 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Support Page
                  </Link>
                  <a href="mailto:help@CMPSBL.com" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> help@CMPSBL.com
                  </a>
                  <a href="tel:+17603548324" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> (760) FLUID-AI
                  </a>
                </div>
              </div>
            </>
          )}

          {!loading && !result?.ok && (
            <Alert variant="destructive">
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{result?.error || "Could not verify payment"}</p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/composable-cognitives">Back to Runtime Agents</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/support">Contact Support</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
