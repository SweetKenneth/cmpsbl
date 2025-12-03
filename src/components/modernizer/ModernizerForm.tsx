import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';

export const ModernizerForm = ({ onJobCreated }: { onJobCreated: (jobId: string) => void }) => {
  const { toast } = useToast();
  const [sourceUrl, setSourceUrl] = useState('');
  const [theme, setTheme] = useState('minimal');
  const [improveContent, setImproveContent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to use the Modernizer',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('pf-modernizer-orchestrator', {
        body: { url: sourceUrl, theme, improve_content: improveContent }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: data.error === 'Limit reached' ? 'Usage Limit Reached' : 'Error',
          description: data.message || 'Failed to start modernization',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Modernization Started',
        description: 'Your website is being modernized. This may take 2-3 minutes.',
      });

      onJobCreated(data.job_id);
      setSourceUrl('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start modernization',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="url" className="text-base font-semibold">Website URL to Modernize</Label>
        <Input
          id="url"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://your-legacy-site.com"
          disabled={isLoading}
          required
          className="h-14 text-base border-2 focus:border-primary transition-colors"
        />
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <div className="w-1 h-1 rounded-full bg-primary mt-2" />
          <p>
            Our AI analyzes and rebuilds your site with modern HTML, CSS, and JavaScript.
            <strong className="text-foreground"> Preserves your content and brand</strong> while adding accessibility and SEO improvements.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
          <div className="flex-1">
            <Label htmlFor="improve-content" className="text-base font-semibold cursor-pointer">
              AI Content Improvement
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Enhance copy clarity, generate alt text, and optimize for SEO
            </p>
          </div>
          <input
            id="improve-content"
            type="checkbox"
            checked={improveContent}
            onChange={(e) => setImproveContent(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold">Design Theme</Label>
        <RadioGroup value={theme} onValueChange={setTheme} disabled={isLoading} className="grid grid-cols-3 gap-4">
          <div className="relative">
            <RadioGroupItem value="minimal" id="minimal" className="peer sr-only" />
            <Label
              htmlFor="minimal"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
            >
              <span className="text-sm font-medium">Minimal</span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem value="creative" id="creative" className="peer sr-only" />
            <Label
              htmlFor="creative"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
            >
              <span className="text-sm font-medium">Creative</span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem value="pro" id="pro" className="peer sr-only" />
            <Label
              htmlFor="pro"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
            >
              <span className="text-sm font-medium">Pro</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Modernizing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Start Modernization
          </>
        )}
      </Button>
    </form>
  );
};