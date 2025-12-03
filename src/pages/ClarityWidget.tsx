import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Code, Eye, Settings } from 'lucide-react';

export default function ClarityWidget() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [widget, setWidget] = useState<any>(null);
  const [config, setConfig] = useState({
    features: { tts: true, contrast: true, font_size: true, keyboard_nav: true },
    position: 'bottom-right',
    theme: 'light',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadWidget();
    }
  }, [selectedSite]);

  const loadSites = async () => {
    const { data } = await supabase
      .from('pf_clarity_sites')
      .select('*')
      .order('created_at', { ascending: false });
    setSites(data || []);
  };

  const loadWidget = async () => {
    const { data } = await supabase
      .from('pf_clarity_widgets')
      .select('*')
      .eq('site_id', selectedSite)
      .single();

    if (data) {
      setWidget(data);
      setConfig({
        features: (data.features || { tts: true, contrast: true, font_size: true, keyboard_nav: true }) as { tts: boolean; contrast: boolean; font_size: boolean; keyboard_nav: boolean; },
        position: data.position,
        theme: data.theme,
      });
    }
  };

  const saveWidget = async () => {
    const widgetKey = widget?.widget_key || `widget_${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase
      .from('pf_clarity_widgets')
      .upsert({
        id: widget?.id,
        site_id: selectedSite,
        widget_key: widgetKey,
        ...config,
      });

    if (error) {
      toast({ title: 'Error saving widget', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Widget configuration saved' });
    loadWidget();
  };

  const embedCode = widget ? `<!-- PromptFluid Accessibility Widget -->
<script src="https://clarity.promptfluid.com/widget.js"></script>
<script>
  PFClarity.init({
    widgetKey: '${widget.widget_key}',
    position: '${config.position}',
    theme: '${config.theme}'
  });
</script>` : '';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accessibility Widget</h1>
        <Eye className="h-8 w-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Site</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.site_url}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSite && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Widget Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Features</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Text-to-Speech</Label>
                    <Switch
                      checked={config.features.tts}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, features: { ...config.features, tts: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Contrast Adjustment</Label>
                    <Switch
                      checked={config.features.contrast}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, features: { ...config.features, contrast: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Font Size Controls</Label>
                    <Switch
                      checked={config.features.font_size}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, features: { ...config.features, font_size: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Keyboard Navigation</Label>
                    <Switch
                      checked={config.features.keyboard_nav}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, features: { ...config.features, keyboard_nav: checked } })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Position</Label>
                <Select value={config.position} onValueChange={(value) => setConfig({ ...config, position: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Theme</Label>
                <Select value={config.theme} onValueChange={(value) => setConfig({ ...config, theme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={saveWidget}>Save Configuration</Button>
            </CardContent>
          </Card>

          {widget && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Embed Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={embedCode} readOnly rows={8} className="font-mono text-sm" />
                <Button
                  className="mt-4"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    toast({ title: 'Embed code copied to clipboard' });
                  }}
                >
                  Copy Embed Code
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
