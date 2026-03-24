/**
 * Interactive Memory Playground
 * Real backend demo for testing the Substrate API without signup
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Search, Trash2, Activity, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PlaygroundResult {
  success: boolean;
  [key: string]: unknown;
}

export function InteractivePlayground() {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  
  // Store form
  const [storeContent, setStoreContent] = useState('');
  const [storeImportant, setStoreImportant] = useState(false);
  
  // Recall form
  const [recallQuery, setRecallQuery] = useState('');
  
  // Forget form
  const [forgetId, setForgetId] = useState('');

  const executeAction = async (action: string, payload: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('memory-playground', {
        body: { action, ...payload }
      });
      
      if (error) throw error;
      setResult(data);
      
      if (data.success) {
        toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed';
      toast.error(message);
      setResult({ success: false, error: message });
    } finally {
      setLoading(false);
    }
  };

  const handleStore = () => {
    if (!storeContent.trim()) {
      toast.error('Please enter some content to store');
      return;
    }
    executeAction('store', { 
      content: storeContent, 
      metadata: { important: storeImportant } 
    });
  };

  const handleRecall = () => {
    if (!recallQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    executeAction('recall', { query: recallQuery });
  };

  const handleForget = () => {
    if (!forgetId.trim()) {
      toast.error('Please enter a memory ID');
      return;
    }
    executeAction('forget', { memoryId: forgetId });
  };

  const handleStatus = () => {
    executeAction('status', {});
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Memory Playground</CardTitle>
              <p className="text-xs text-muted-foreground">Live backend • No signup required</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3 text-neon-green" />
            Live
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none border-b border-border/50 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="store" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
            >
              <Zap className="w-4 h-4 mr-2" />
              Store
            </TabsTrigger>
            <TabsTrigger 
              value="recall"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
            >
              <Search className="w-4 h-4 mr-2" />
              Recall
            </TabsTrigger>
            <TabsTrigger 
              value="forget"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Forget
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4 space-y-4">
            <TabsContent value="store" className="m-0 space-y-3">
              <Textarea
                placeholder="Enter content to store in memory..."
                value={storeContent}
                onChange={(e) => setStoreContent(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={storeImportant}
                    onChange={(e) => setStoreImportant(e.target.checked)}
                    className="rounded"
                  />
                  Mark as important
                </label>
                <Button onClick={handleStore} disabled={loading} size="sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  Store Memory
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="recall" className="m-0 space-y-3">
              <Input
                placeholder="Search query (e.g., 'important', 'code')"
                value={recallQuery}
                onChange={(e) => setRecallQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRecall()}
              />
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handleStatus}>
                  <Activity className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
                <Button onClick={handleRecall} disabled={loading} size="sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Search Memories
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="forget" className="m-0 space-y-3">
              <Input
                placeholder="Memory ID to forget"
                value={forgetId}
                onChange={(e) => setForgetId(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleForget} disabled={loading} variant="destructive" size="sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Forget Memory
                </Button>
              </div>
            </TabsContent>
            
            {/* Results Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-lg border p-4 text-sm",
                  result.success 
                    ? "bg-neon-green/5 border-neon-green/20" 
                    : "bg-destructive/5 border-destructive/20"
                )}
              >
                <div className="flex items-center gap-2 mb-2 text-xs font-medium">
                  {result.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-neon-green">Success</span>
                    </>
                  ) : (
                    <>
                      <span className="text-destructive">Error</span>
                    </>
                  )}
                </div>
                <pre className="overflow-x-auto text-xs text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </motion.div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
