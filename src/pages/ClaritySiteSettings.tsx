import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SiteConfig {
  id: string;
  site_url: string;
  site_name: string;
  auto_fix_enabled: boolean;
  agent_enabled: boolean;
  subscription_tier: string;
  created_at: string;
}

export default function ClaritySiteSettings() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSite();
  }, [siteId]);

  const loadSite = async () => {
    try {
      const { data, error } = await supabase
        .from('pf_clarity_sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (error) throw error;
      setSite(data);
    } catch (error: any) {
      toast({
        title: 'Error loading site',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!site) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pf_clarity_sites')
        .update({
          site_name: site.site_name,
          auto_fix_enabled: site.auto_fix_enabled,
          agent_enabled: site.agent_enabled,
        })
        .eq('id', site.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Site configuration updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Site not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/clarity/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold mb-8">Site Settings</h1>

        <Card className="p-6 space-y-6">
          <div>
            <Label className="text-base font-semibold mb-4 block">Site URL</Label>
            <Input value={site.site_url} disabled className="bg-muted" />
            <p className="text-sm text-muted-foreground mt-2">
              URL cannot be changed after registration
            </p>
          </div>

          <div className="border-t pt-6">
            <Label htmlFor="site-name" className="text-base font-semibold mb-4 block">
              Site Name
            </Label>
            <Input
              id="site-name"
              value={site.site_name}
              onChange={(e) => setSite({ ...site, site_name: e.target.value })}
              placeholder="My Website"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Friendly name for your site
            </p>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="agent" className="text-base font-semibold">
                  Universal Agent Enabled
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable real-time accessibility monitoring on your site
                </p>
              </div>
              <Switch
                id="agent"
                checked={site.agent_enabled}
                onCheckedChange={(checked) => setSite({ ...site, agent_enabled: checked })}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-fix" className="text-base font-semibold">
                  Auto-Fix Enabled
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically apply fixes to detected issues when possible
                </p>
              </div>
              <Switch
                id="auto-fix"
                checked={site.auto_fix_enabled}
                onCheckedChange={(checked) => setSite({ ...site, auto_fix_enabled: checked })}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <Label className="text-base font-semibold mb-4 block">Subscription Tier</Label>
            <div className="flex items-center gap-2">
              <Badge className="capitalize">{site.subscription_tier}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Upgrade for more scans and advanced features
            </p>
          </div>

          <div className="border-t pt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/clarity/dashboard')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
