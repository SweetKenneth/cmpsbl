import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Search, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResearchQuery {
  id: string;
  query: string;
  status: string;
  result: string | null;
  metadata: any;
  created_at: string;
}

export function ResearchQueryManager() {
  const { toast } = useToast();
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [newQuery, setNewQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuery = async () => {
    if (!newQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a research query",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('learning_queries')
        .insert({
          query: newQuery,
          status: 'pending',
          metadata: { manual: true, added_at: new Date().toISOString() }
        });

      if (error) throw error;

      toast({
        title: "Query Added",
        description: "Research query queued successfully"
      });

      setNewQuery('');
      fetchQueries();
    } catch (error) {
      console.error('Error adding query:', error);
      toast({
        title: "Error",
        description: "Failed to add query",
        variant: "destructive"
      });
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_queries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Query Deleted",
        description: "Research query removed"
      });

      fetchQueries();
    } catch (error) {
      console.error('Error deleting query:', error);
      toast({
        title: "Error",
        description: "Failed to delete query",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-neon-green';
      case 'running': return 'text-neon-blue';
      case 'failed': return 'text-destructive';
      default: return 'text-neon-amber';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add New Query */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter research topic..."
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addQuery()}
          className="flex-1"
        />
        <Button onClick={addQuery} className="bg-primary/20 hover:bg-primary/30 border border-primary/50">
          <Plus className="w-4 h-4 mr-2" />
          Add Query
        </Button>
      </div>

      {/* Query List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {queries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No research queries yet. Add one above!</p>
          </div>
        ) : (
          queries.map((query) => (
            <div
              key={query.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{query.query}</div>
                {query.result && (
                  <div className="text-xs text-muted-foreground mb-1 truncate">
                    {query.result.substring(0, 100)}...
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={`${getStatusColor(query.status)} font-medium`}>
                    {query.status}
                  </span>
                  <span>{new Date(query.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteQuery(query.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {queries.filter(q => q.status === 'pending').length} pending • {' '}
        {queries.filter(q => q.status === 'completed').length} completed
      </div>
    </div>
  );
}