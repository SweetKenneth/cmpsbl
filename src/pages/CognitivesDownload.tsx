/**
 * Composable Cognitives — Free Download Page (Hybrid only)
 */

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { NameCertificate } from "@/components/cognitives/NameCertificate";

export default function CognitivesDownload() {
  const [searchParams] = useSearchParams();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sku = searchParams.get("sku");
  const name = searchParams.get("name") || "Hybrid-Agent";

  useEffect(() => {
    if (sku !== "hybrid") {
      setError("Only the Hybrid cognitive is available for free download.");
      setLoading(false);
      return;
    }

    const fetchUrl = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cognitives-free-download?sku=hybrid`;
        const res = await fetch(url, {
          headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const json = await res.json();
        if (json.ok) {
          setDownloadUrl(json.downloadUrl);
        } else {
          setError(json.error || "Download failed");
        }
      } catch (err) {
        setError("Could not generate download link");
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [sku]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Download Hybrid Cognitive — CMPSBL®</title>
      </Helmet>

      <PublicNav />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {loading && (
            <Card>
              <CardContent className="p-8 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing your download...</span>
              </CardContent>
            </Card>
          )}

          {!loading && downloadUrl && (
            <>
              <Card className="border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-400">
                    <CheckCircle className="w-6 h-6" />
                    Hybrid Cognitive Ready
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Your free Hybrid Cognitive is ready. The download link expires in 2 minutes.
                  </p>
                  <Button asChild size="lg" className="w-full gap-2 font-mono">
                    <a href={downloadUrl} download>
                      <Download className="w-5 h-5" />
                      Download Hybrid ZIP
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <NameCertificate name={name} sku="hybrid" issuedAt={new Date().toISOString()} />
            </>
          )}

          {!loading && error && (
            <Alert variant="destructive">
              <AlertTitle>Download Error</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{error}</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/store">Back to Runtime Agents</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
