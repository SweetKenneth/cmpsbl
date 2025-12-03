import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Code, CheckCircle, Loader2, Copy } from 'lucide-react';

export default function ClarityFixSuggestions() {
  const { scanId } = useParams();
  const [issues, setIssues] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (scanId) {
      loadIssues();
    }
  }, [scanId]);

  const loadIssues = async () => {
    const { data } = await supabase
      .from('pf_clarity_issues')
      .select(`
        *,
        pf_clarity_fix_suggestions(*)
      `)
      .eq('scan_id', scanId)
      .order('severity', { ascending: false });

    setIssues(data || []);

    const sugMap: Record<string, any> = {};
    data?.forEach((issue: any) => {
      if (issue.pf_clarity_fix_suggestions?.length > 0) {
        sugMap[issue.id] = issue.pf_clarity_fix_suggestions[0];
      }
    });
    setSuggestions(sugMap);
  };

  const generateFix = async (issueId: string) => {
    setGenerating({ ...generating, [issueId]: true });

    const { data, error } = await supabase.functions.invoke('pf-clarity-fix-generator', {
      body: { action: 'generate_fix', issue_id: issueId },
    });

    setGenerating({ ...generating, [issueId]: false });

    if (error || !data.success) {
      toast({ title: 'Error generating fix', description: error?.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Fix suggestion generated' });
    loadIssues();
  };

  const generateAllFixes = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('pf-clarity-fix-generator', {
      body: { action: 'generate_scan_fixes', scan_id: scanId },
    });

    setLoading(false);

    if (error || !data.success) {
      toast({ title: 'Error generating fixes', description: error?.message, variant: 'destructive' });
      return;
    }

    toast({ title: `Generated ${data.generated} fix suggestions` });
    loadIssues();
  };

  const applyFix = async (suggestionId: string) => {
    const { error } = await supabase.functions.invoke('pf-clarity-fix-generator', {
      body: { action: 'apply_fix', suggestion_id: suggestionId },
    });

    if (error) {
      toast({ title: 'Error applying fix', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Fix marked as applied' });
    loadIssues();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code copied to clipboard' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fix Suggestions</h1>
        <Button onClick={generateAllFixes} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate All Fixes
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {issues.map((issue) => {
          const suggestion = suggestions[issue.id];
          const isGenerating = generating[issue.id];

          return (
            <Card key={issue.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {issue.issue_type.replace(/_/g, ' ').toUpperCase()}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {issue.severity}
                      </Badge>
                      {suggestion?.confidence_score && (
                        <Badge variant="outline">
                          {suggestion.confidence_score}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!suggestion && !isGenerating && (
                    <Button size="sm" onClick={() => generateFix(issue.id)}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Fix
                    </Button>
                  )}
                  {isGenerating && (
                    <Button size="sm" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{issue.description}</p>

                {suggestion && (
                  <>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Explanation:</p>
                      <p className="text-sm">{suggestion.explanation}</p>
                    </div>

                    {suggestion.suggested_code && (
                      <div className="relative">
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <pre>{suggestion.suggested_code}</pre>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(suggestion.suggested_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {suggestion.auto_applicable && !suggestion.applied && (
                        <Button onClick={() => applyFix(suggestion.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Applied
                        </Button>
                      )}
                      {suggestion.applied && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Applied
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        {issues.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No issues found for this scan.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
