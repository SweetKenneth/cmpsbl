import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Palette, Save } from 'lucide-react';

export default function ClarityWhitelabel() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data, error } = await supabase.functions.invoke('pf-clarity-whitelabel', {
      body: { action: 'get_config' },
    });

    if (!error && data.success) {
      setConfig(data.config || {});
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('pf-clarity-whitelabel', {
      body: {
        action: 'update_config',
        ...config,
      },
    });

    setLoading(false);

    if (error || !data.success) {
      toast({ title: 'Error saving configuration', description: error?.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'White-label configuration saved' });
  };

  const updateField = (field: string, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">White-Label Configuration</h1>
        <Palette className="h-8 w-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Brand Name</Label>
            <Input
              value={config?.brand_name || ''}
              onChange={(e) => updateField('brand_name', e.target.value)}
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <Label>Logo URL</Label>
            <Input
              value={config?.logo_url || ''}
              onChange={(e) => updateField('logo_url', e.target.value)}
              placeholder="https://yoursite.com/logo.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config?.primary_color || '#7A5FFF'}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={config?.primary_color || '#7A5FFF'}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config?.secondary_color || '#01C9E8'}
                  onChange={(e) => updateField('secondary_color', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={config?.secondary_color || '#01C9E8'}
                  onChange={(e) => updateField('secondary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Custom Domain</Label>
            <Input
              value={config?.custom_domain || ''}
              onChange={(e) => updateField('custom_domain', e.target.value)}
              placeholder="clarity.yourdomain.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Contact support to configure DNS settings
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>From Name</Label>
            <Input
              value={config?.email_from_name || ''}
              onChange={(e) => updateField('email_from_name', e.target.value)}
              placeholder="Your Company"
            />
          </div>

          <div>
            <Label>From Email Address</Label>
            <Input
              type="email"
              value={config?.email_from_address || ''}
              onChange={(e) => updateField('email_from_address', e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Footer Text</Label>
          <Textarea
            value={config?.report_footer_text || ''}
            onChange={(e) => updateField('report_footer_text', e.target.value)}
            placeholder="Generated by Your Company | Powered by WCAG Compliance Tools"
            rows={3}
          />
        </CardContent>
      </Card>

      <Button onClick={saveConfig} disabled={loading} size="lg">
        <Save className="mr-2 h-4 w-4" />
        Save Configuration
      </Button>
    </div>
  );
}
