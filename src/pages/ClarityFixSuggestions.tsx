import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Code, CheckCircle, Loader2, Copy, Download, Printer, FileText } from 'lucide-react';

export default function ClarityFixSuggestions() {
  const { scanId } = useParams();
  const [issues, setIssues] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

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

  const copyAllFixes = () => {
    const allFixes = issues
      .filter(issue => suggestions[issue.id]?.suggested_code)
      .map(issue => {
        const sug = suggestions[issue.id];
        return `/* Issue: ${issue.issue_type.replace(/_/g, ' ').toUpperCase()} */
/* Severity: ${issue.severity} */
/* ${issue.description} */

${sug.suggested_code}

/* ---------------------------------------- */`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(allFixes);
    toast({ title: 'All fixes copied to clipboard' });
  };

  const downloadFixes = () => {
    const content = issues
      .map(issue => {
        const sug = suggestions[issue.id];
        return `================================================================================
ISSUE: ${issue.issue_type.replace(/_/g, ' ').toUpperCase()}
Severity: ${issue.severity}
Element: ${issue.element_selector || 'N/A'}
--------------------------------------------------------------------------------
Description:
${issue.description}

${sug ? `Explanation:
${sug.explanation}

Suggested Fix:
\`\`\`
${sug.suggested_code || 'No code suggestion available'}
\`\`\`

Confidence: ${sug.confidence_score}%
` : 'No fix suggestion generated yet.'}
================================================================================
`;
      })
      .join('\n\n');

    const header = `CLARITY ACCESSIBILITY FIX REPORT
Scan ID: ${scanId}
Generated: ${new Date().toLocaleString()}
Total Issues: ${issues.length}
Issues with Fixes: ${Object.keys(suggestions).length}

================================================================================

`;

    const blob = new Blob([header + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarity-fixes-${scanId?.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Fixes downloaded as text file' });
  };

  const printFixes = () => {
    const printContent = `
      <html>
        <head>
          <title>Clarity Accessibility Fixes</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #7A5FFF; padding-bottom: 10px; }
            .issue { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid; }
            .issue-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .severity-critical { color: #dc2626; }
            .severity-warning { color: #f59e0b; }
            .severity-info { color: #3b82f6; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
            .explanation { background: #f0f9ff; padding: 10px; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Clarity Accessibility Fix Report</h1>
          <p>Scan ID: ${scanId}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Issues: ${issues.length} | Issues with Fixes: ${Object.keys(suggestions).length}</p>
          
          ${issues.map(issue => {
            const sug = suggestions[issue.id];
            return `
              <div class="issue">
                <div class="issue-header">
                  <strong>${issue.issue_type.replace(/_/g, ' ').toUpperCase()}</strong>
                  <span class="severity-${issue.severity}">${issue.severity.toUpperCase()}</span>
                </div>
                <p>${issue.description}</p>
                ${sug ? `
                  <div class="explanation">
                    <strong>Explanation:</strong> ${sug.explanation}
                  </div>
                  ${sug.suggested_code ? `
                    <strong>Suggested Fix:</strong>
                    <pre>${sug.suggested_code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                  ` : ''}
                ` : '<p><em>No fix suggestion generated</em></p>'}
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const hasSuggestions = Object.keys(suggestions).length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fix Suggestions</h1>
          <p className="text-muted-foreground mt-1">
            AI-generated accessibility fixes ready to copy and apply
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Export Actions */}
      {hasSuggestions && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Export Fixes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={copyAllFixes}>
                <Copy className="mr-2 h-4 w-4" />
                Copy All Code
              </Button>
              <Button variant="outline" onClick={downloadFixes}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button variant="outline" onClick={printFixes}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Export all {Object.keys(suggestions).length} fix suggestions for your development team
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4" ref={printRef}>
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