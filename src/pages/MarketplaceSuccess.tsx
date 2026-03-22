/**
 * Marketplace Success — Post-purchase license delivery with download protection
 */

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Key, Copy, Check, Download, 
  AlertCircle, Loader2, Sparkles, Shield, Lock
} from "lucide-react";

export default function MarketplaceSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const productType = searchParams.get('type');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [licenseData, setLicenseData] = useState<{
    license_key?: string;
    product_type?: string;
    template_name?: string;
    message?: string;
    already_fulfilled?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session ID");
      setLoading(false);
      return;
    }

    async function fulfillOrder() {
      try {
        const { data, error } = await supabase.functions.invoke('marketplace-fulfill', {
          body: { session_id: sessionId },
        });

        if (error) throw error;
        
        setLicenseData(data);
        
        if (data.license_key && !data.already_fulfilled) {
          toast.success("License key generated!");
        }
      } catch (err) {
        console.error("Fulfill error:", err);
        setError("Failed to retrieve license. Please contact support.");
      } finally {
        setLoading(false);
      }
    }

    fulfillOrder();
  }, [sessionId]);

  const copyLicenseKey = () => {
    if (licenseData?.license_key) {
      navigator.clipboard.writeText(licenseData.license_key);
      setCopied(true);
      toast.success("License key copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!licenseData?.license_key) {
      toast.error("No license key available");
      return;
    }

    setDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('marketplace-verify-license', {
        body: {
          action: 'download',
          license_key: licenseData.license_key,
        },
      });

      if (error) throw error;
      
      if (data?.download_url) {
        window.open(data.download_url, '_blank');
        toast.success("Download initiated!");
      } else {
        throw new Error("Download URL not available");
      }
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Download failed. Please try again or contact support.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <SEO
        title="Purchase Complete | CMPSBL Marketplace"
        description="Your CMPSBL purchase is complete. Access your license key and start building."
      />
      <div className="min-h-screen bg-background">
        <PublicNav />

        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <Card className="text-center p-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your license key...</p>
              </Card>
            ) : error ? (
              <Card className="text-center p-12 border-destructive/50">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button asChild>
                  <Link to="/store">Return to Explore</Link>
                </Button>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden">
                  {/* Success Header */}
                  <div className="bg-gradient-to-r from-system-green/20 to-primary/20 p-8 text-center border-b">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-system-green" />
                    </motion.div>
                    <h1 className="text-2xl font-bold mb-2">Purchase Complete!</h1>
                    <p className="text-muted-foreground">
                      {licenseData?.message || "Your license is ready to use."}
                    </p>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* License Key Display */}
                    {licenseData?.license_key && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium flex items-center gap-2">
                            <Key className="w-4 h-4 text-primary" />
                            Your License Key
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {productType === 'os' ? 'Substrate' : 'Template'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-4 rounded-lg bg-muted font-mono text-lg tracking-wider text-center">
                            {licenseData.license_key}
                          </code>
                          <Button variant="outline" size="icon" onClick={copyLicenseKey}>
                            {copied ? (
                              <Check className="w-4 h-4 text-system-green" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          Save this key! It can only be used for one installation.
                        </p>
                      </div>
                    )}

                    {/* Copy Protection Notice */}
                    <div className="p-4 rounded-lg bg-neon-amber/10 border border-neon-amber/20">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-neon-amber mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-neon-amber dark:text-neon-amber mb-1">Single-Install License Protection</p>
                          <p className="text-muted-foreground">
                            This license key is domain-bound and can only be activated once. 
                            Sharing or duplicate installations will invalidate the license.
                          </p>
                        </div>
                      </div>
                    </div>

                    {licenseData?.already_fulfilled && (
                      <div className="p-4 rounded-lg bg-muted border">
                        <p className="text-sm text-muted-foreground">
                          This order has already been fulfilled. Your license key was sent to your email.
                          If you can't find it, please contact support.
                        </p>
                      </div>
                    )}

                    {licenseData?.template_name && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm">
                          <strong>Template:</strong> {licenseData.template_name}
                        </p>
                      </div>
                    )}

                    {/* Download Button for OS */}
                    {productType === 'os' && licenseData?.license_key && (
                      <Button 
                        size="lg" 
                        className="w-full gap-2 bg-gradient-to-r from-primary to-neon-purple hover:from-primary/90 hover:to-neon-purple/90"
                        onClick={handleDownload}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        {downloading ? "Preparing Download..." : "Download World Engine Package"}
                      </Button>
                    )}

                    {/* Next Steps */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Next Steps</h4>
                      <div className="space-y-2">
                        {productType === 'os' ? (
                          <>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                              <span>Click the download button above to get the World Engine package</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                              <span>Run the installer and enter your license key when prompted</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                              <span>Configure your BYOK API keys in the admin panel</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-neon-amber/20 text-neon-amber flex items-center justify-center text-xs font-bold shrink-0">
                                <Lock className="w-3 h-3" />
                              </span>
                              <span className="text-muted-foreground">License activates on first run and binds to your domain</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                              <span>Copy the template code from the email or download</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                              <span>Add to your project and configure as needed</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                              <span>Check the documentation for customization options</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1 gap-2" asChild>
                        <Link to="/codelab">
                          <Sparkles className="w-4 h-4" />
                          Open CodeLab
                        </Link>
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2" asChild>
                        <Link to="/store">
                          Continue Browsing
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
}