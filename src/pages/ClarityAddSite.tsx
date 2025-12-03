import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Globe, Key, Shield } from "lucide-react";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

const ClarityAddSite = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    site_url: "",
    site_name: "",
    agent_enabled: true,
    auto_fix_enabled: false,
    subscription_tier: "free",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        navigate("/auth");
        return;
      }

      // Validate URL
      let cleanUrl = formData.site_url.trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = "https://" + cleanUrl;
      }

      const { data: site, error: siteError } = await supabase
        .from("pf_clarity_sites")
        .insert({
          user_id: user.id,
          site_url: cleanUrl,
          site_name: formData.site_name || cleanUrl,
          agent_enabled: formData.agent_enabled,
          auto_fix_enabled: formData.auto_fix_enabled,
          subscription_tier: formData.subscription_tier,
        })
        .select()
        .single();

      if (siteError) throw siteError;

      // Create default agent config
      const { error: configError } = await supabase
        .from("pf_clarity_agent_config")
        .insert({
          site_id: site.id,
          config_version: "4.1.0",
          scan_on_load: true,
          auto_fix_enabled: formData.auto_fix_enabled,
          visual_indicators: true,
        });

      if (configError) throw configError;

      toast.success("Site added successfully!");
      navigate("/clarity/dashboard");
    } catch (error: any) {
      console.error("Error adding site:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("This site is already registered");
      } else {
        toast.error("Failed to add site");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <SEO title="Add Site - Clarity Dashboard" />

      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/clarity/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Add Your Site</h1>
          <p className="text-muted-foreground">
            Register your website to start scanning for accessibility issues
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Site URL */}
            <div className="space-y-2">
              <Label htmlFor="site_url" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website URL *
              </Label>
              <Input
                id="site_url"
                type="text"
                placeholder="https://example.com"
                value={formData.site_url}
                onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Full URL of your website including protocol
              </p>
            </div>

            {/* Site Name */}
            <div className="space-y-2">
              <Label htmlFor="site_name">
                Site Name (Optional)
              </Label>
              <Input
                id="site_name"
                type="text"
                placeholder="My Awesome Website"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Friendly name for dashboard display
              </p>
            </div>

            {/* Subscription Tier */}
            <div className="space-y-2">
              <Label htmlFor="subscription_tier">
                Subscription Plan
              </Label>
              <Select
                value={formData.subscription_tier}
                onValueChange={(value) => setFormData({ ...formData, subscription_tier: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (100 scans/month)</SelectItem>
                  <SelectItem value="starter">Starter ($19/mo)</SelectItem>
                  <SelectItem value="pro">Pro ($49/mo)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agent Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Agent Configuration
              </h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="agent_enabled">Enable Clarity Agent</Label>
                  <p className="text-xs text-muted-foreground">
                    Deploy universal JavaScript agent on your site
                  </p>
                </div>
                <Switch
                  id="agent_enabled"
                  checked={formData.agent_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agent_enabled: checked })
                  }
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_fix_enabled">Enable Auto-Fix</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically apply fixes for common issues
                  </p>
                </div>
                <Switch
                  id="auto_fix_enabled"
                  checked={formData.auto_fix_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_fix_enabled: checked })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {/* Installation Instructions */}
            {formData.agent_enabled && (
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Agent Installation</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  After creating your site, you'll receive an install key and script tag to add to
                  your website's <code className="text-xs bg-background px-1 py-0.5 rounded">
                    &lt;head&gt;
                  </code> section.
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Adding Site..." : "Add Site"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/clarity/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ClarityAddSite;
