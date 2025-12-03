import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Issue {
  id: string;
  wcag_criterion: string;
  wcag_level: string;
  issue_type: string;
  severity: string;
  element_selector: string;
  issue_description: string;
  auto_fix_attempted: boolean;
  auto_fix_successful: boolean;
  status: string;
  created_at: string;
}

interface Scan {
  id: string;
  site_id: string;
  status: string;
  compliance_score: number;
  issues_found: number;
  issues_critical: number;
  started_at: string;
  completed_at: string;
  pf_clarity_sites: {
    site_url: string;
  };
}

export default function ClarityScanDetails() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scan, setScan] = useState<Scan | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixingIssues, setFixingIssues] = useState(false);

  useEffect(() => {
    loadScanDetails();
  }, [scanId]);

  const loadScanDetails = async () => {
    try {
      const { data: scanData, error: scanError } = await supabase
        .from('pf_clarity_scans')
        .select('*, pf_clarity_sites(site_url)')
        .eq('id', scanId)
        .single();

      if (scanError) throw scanError;
      setScan(scanData);

      const { data: issuesData, error: issuesError } = await supabase
        .from('pf_clarity_issues')
        .select('*')
        .eq('scan_id', scanId)
        .order('severity', { ascending: false });

      if (issuesError) throw issuesError;
      setIssues(issuesData || []);
    } catch (error: any) {
      toast({
        title: 'Error loading scan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFix = async () => {
    setFixingIssues(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-clarity-batch-autofix', {
        body: { scan_id: scanId },
      });

      if (error) throw error;

      toast({
        title: 'Auto-fix completed',
        description: `Fixed ${data.fixed} issues, ${data.failed} failed`,
      });

      loadScanDetails();
    } catch (error: any) {
      toast({
        title: 'Auto-fix failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setFixingIssues(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'serious': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      case 'minor': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive text-destructive-foreground';
      case 'auto_fixed': return 'bg-primary text-primary-foreground';
      case 'pending_review': return 'bg-yellow-500 text-black';
      case 'dismissed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Scan not found</p>
      </div>
    );
  }

  const autoFixableCount = issues.filter(i => !i.auto_fix_attempted && i.status === 'open').length;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/clarity/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{scan.pf_clarity_sites.site_url}</h1>
          <p className="text-muted-foreground">
            Scan completed {new Date(scan.completed_at).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Compliance Score</h3>
            <p className="text-3xl font-bold text-primary">{Math.round(scan.compliance_score)}%</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Issues</h3>
            <p className="text-3xl font-bold">{scan.issues_found}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Critical Issues</h3>
            <p className="text-3xl font-bold text-destructive">{scan.issues_critical}</p>
          </Card>
        </div>

        {autoFixableCount > 0 && (
          <Card className="p-6 mb-8 bg-primary/5 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Auto-Fix Available</h3>
                <p className="text-sm text-muted-foreground">
                  {autoFixableCount} issues can be automatically fixed
                </p>
              </div>
              <Button onClick={handleAutoFix} disabled={fixingIssues}>
                {fixingIssues ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
                    Auto-Fix Now
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Issues Found</h2>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No issues found!</p>
                <p className="text-muted-foreground">Your site is fully compliant</p>
              </div>
            ) : (
              issues.map((issue) => (
                <Card key={issue.id} className="p-4 border-l-4" style={{
                  borderLeftColor: issue.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                   issue.severity === 'serious' ? '#f97316' :
                                   issue.severity === 'moderate' ? '#eab308' : '#3b82f6'
                }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{issue.issue_type}</h3>
                        <p className="text-sm text-muted-foreground">WCAG {issue.wcag_criterion} (Level {issue.wcag_level})</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                      {!issue.auto_fix_attempted && issue.status === 'open' && (
                        <Badge className="bg-primary text-primary-foreground">
                          Auto-fixable
                        </Badge>
                      )}
                      {issue.auto_fix_successful && (
                        <Badge className="bg-green-500 text-white">
                          Fixed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-2">{issue.issue_description}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                    {issue.element_selector}
                  </code>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
