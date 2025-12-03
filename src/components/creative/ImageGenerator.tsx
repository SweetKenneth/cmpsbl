import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Copy } from 'lucide-react';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('default');
  const [resolution, setResolution] = useState('1024x1024');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please enter a description for your image',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-image', {
        body: { prompt, style, resolution }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: data.cached ? 'Image retrieved from cache' : 'Image generated',
        description: `Provider: ${data.provider || 'cached'} • Cost: $${(data.cost_cents / 100).toFixed(2)}`
      });
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.url);
    toast({ title: 'URL copied to clipboard' });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Image Description</Label>
          <Textarea
            id="prompt"
            placeholder="A serene mountain landscape at sunset with flowing rivers..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="photorealistic">Photorealistic</SelectItem>
                <SelectItem value="artistic">Artistic</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="3d">3D Render</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger id="resolution">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512x512">512x512</SelectItem>
                <SelectItem value="1024x1024">1024x1024</SelectItem>
                <SelectItem value="1024x768">1024x768</SelectItem>
                <SelectItem value="768x1024">768x1024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </Button>
      </Card>

      <Card className="p-6">
        {loading && (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={result.url}
                alt="Generated"
                className="w-full h-auto"
              />
              {result.cached && (
                <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Cached
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
              <Button
                onClick={() => window.open(result.url, '_blank')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Provider: <span className="text-foreground font-medium">{result.provider}</span></p>
              <p>Cost: <span className="text-foreground font-medium">${(result.cost_cents / 100).toFixed(2)}</span></p>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
            Your generated image will appear here
          </div>
        )}
      </Card>
    </div>
  );
}