import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ReflexKeys = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const { toast } = useToast();

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data as boolean);
      }
    };

    checkAdmin();
  }, [user, navigate]);

  const handleGenerateKey = async () => {
    if (!siteName.trim() || !siteUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both site name and URL",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedKey(null);

    try {
      const { data, error } = await supabase.functions.invoke("pf-reflex-generate-unlimited-key", {
        body: { site_name: siteName, site_url: siteUrl },
      });

      if (error) throw error;

      if (data?.api_key) {
        setGeneratedKey(data.api_key);
        toast({
          title: "✨ Unlimited Key Generated",
          description: "Your admin testing key has been created with no limits!",
        });
      }
    } catch (error) {
      console.error("Error generating key:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate key",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // Loading state
  if (isAdmin === null) {
    return (
      <div className="container max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Access Denied:</strong> You must be an administrator to access this page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Reflex Admin Keys</h1>
          <p className="text-muted-foreground">Generate unlimited testing API keys for Reflex Bot Sniper</p>
        </div>
      </div>

      <Alert className="bg-primary/10 border-primary/20">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Admin Testing Keys:</strong> These keys have unlimited access with no rate limits, monthly fees, or expiration dates.
          Use only for internal testing and development.
        </AlertDescription>
      </Alert>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              placeholder="e.g., Testing Site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-url">Site URL</Label>
            <Input
              id="site-url"
              type="url"
              placeholder="https://example.com"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <Button 
            onClick={handleGenerateKey} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Key...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Generate Unlimited API Key
              </>
            )}
          </Button>
        </div>

        {generatedKey && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <Label>Your Unlimited API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                value={generatedKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyKey}
              >
                {copiedKey ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Save this key securely. It grants unlimited access to all Reflex features.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-3">Key Features</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong>Unlimited Access:</strong> No rate limits or monthly quotas</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong>Complete Tier:</strong> Access to all Pro and Complete features</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong>No Expiration:</strong> Keys never expire or require renewal</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong>No Billing:</strong> Zero monthly fees or upgrade prompts</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ReflexKeys;
