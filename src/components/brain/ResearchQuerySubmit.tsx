import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Sparkles } from 'lucide-react';

export function ResearchQuerySubmit() {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('5');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast.error('Please enter a research query');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('learning_queries')
        .insert({
          query: query,
          topic: 'User Priority Research',
          source: 'user',
          weight: 10 - parseInt(priority), // Convert priority 1-7 to weight (higher priority = higher weight)
          status: 'queued',
          context: {
            submitted_at: new Date().toISOString(),
            priority_level: parseInt(priority),
            user_submitted: true
          }
        });

      if (error) throw error;

      toast.success('Research query submitted! Brain will prioritize this.');
      setQuery('');
      setPriority('5');
    } catch (error) {
      console.error('Failed to submit query:', error);
      toast.error('Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Submit Priority Research Query</CardTitle>
        </div>
        <CardDescription>
          Brain will prioritize your queries over automated research. Max 900 calls/day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="What should the Brain research? (e.g., 'Latest AI security vulnerabilities in WordPress plugins')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          className="resize-none"
        />
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Priority Level</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">🔥 Critical (1)</SelectItem>
                <SelectItem value="3">⚡ High (3)</SelectItem>
                <SelectItem value="5">📌 Normal (5)</SelectItem>
                <SelectItem value="7">📋 Low (7)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !query.trim()}
            className="mt-6"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Query'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Brain runs with 10-15% inference drift and 10% autonomous deep dives
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
