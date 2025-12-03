import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Copy } from 'lucide-react';

export function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please enter a description for your video',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      toast({
        title: 'Video generation started',
        description: 'This may take several minutes...'
      });

      const { data, error } = await supabase.functions.invoke('pf-nexus-video', {
        body: { prompt, duration: parseInt(duration) }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: 'Video generated successfully',
        description: `Provider: ${data.provider} • Cost: $${(data.cost_cents / 100).toFixed(2)}`
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
          <Label htmlFor="video-prompt">Video Description</Label>
          <Textarea
            id="video-prompt"
            placeholder="A time-lapse of clouds moving over mountains, cinematic lighting..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 seconds</SelectItem>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium">Note:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Video generation takes 2-5 minutes</li>
            <li>Costs vary by provider ($2-5 per video)</li>
            <li>Results cached for instant reuse</li>
          </ul>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating... (this may take a few minutes)
            </>
          ) : (
            'Generate Video'
          )}
        </Button>
      </Card>

      <Card className="p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Generating video...</p>
              <p className="text-xs text-muted-foreground">This typically takes 2-5 minutes</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <video
                src={result.url}
                controls
                className="w-full h-auto"
              />
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
              <p>Job ID: <span className="text-foreground font-mono text-xs">{result.job_id}</span></p>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
            Your generated video will appear here
          </div>
        )}
      </Card>
    </div>
  );
}