/**
 * Bot Runtime Dialog
 * Test run interface for cognitive bots
 */

import { useState } from 'react';
import { Loader2, Play, Terminal, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BotRuntimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
  botName: string;
  botVersion: string;
}

interface RuntimeResponse {
  success: boolean;
  bot: {
    id: string;
    name: string;
    version: string;
    type: string;
  };
  query: string;
  response: string;
  timestamp: string;
  runtime_ms: number;
}

export function BotRuntimeDialog({
  open,
  onOpenChange,
  botId,
  botName,
  botVersion,
}: BotRuntimeDialogProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RuntimeResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!query.trim()) {
      toast.error('Enter a query');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('pf-forge-run', {
        body: { bot_id: botId, query: query.trim() },
      });

      if (error) throw error;
      setResult(data);
    } catch (err) {
      console.error('Runtime error:', err);
      toast.error('Failed to execute bot');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Runtime Stub
          </DialogTitle>
          <DialogDescription>
            Test <strong>{botName}</strong> v{botVersion}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Query Input */}
          <div className="space-y-2">
            <Label htmlFor="query">Query</Label>
            <div className="flex gap-2">
              <Input
                id="query"
                placeholder="Enter your query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                disabled={loading}
              />
              <Button onClick={handleRun} disabled={loading || !query.trim()}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Response</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {result.runtime_ms}ms
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={copyResult}>
                    {copied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-64 rounded-lg border bg-muted/30 p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}

          {/* API Example */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-muted-foreground">cURL Example</Label>
            <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto">
{`curl -X POST \\
  '${window.location.origin}/functions/v1/pf-forge-run' \\
  -H 'Authorization: Bearer YOUR_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{"bot_id":"${botId}","query":"your query"}'`}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
