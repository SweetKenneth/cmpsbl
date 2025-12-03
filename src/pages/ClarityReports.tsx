import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2 } from 'lucide-react';

export default function ClarityReports() {
  const [sites, setSites] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedScan, setSelectedScan] = useState('');
  const [reportType, setReportType] = useState('full');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
    loadReports();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadScans(selectedSite);
    }
  }, [selectedSite]);

  const loadSites = async () => {
    const { data } = await supabase
      .from('pf_clarity_sites')
      .select('*')
      .order('created_at', { ascending: false });
    setSites(data || []);
  };

  const loadScans = async (siteId: string) => {
    const { data } = await supabase
      .from('pf_clarity_scans')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20);
    setScans(data || []);
  };

  const loadReports = async () => {
    const { data } = await supabase
      .from('pf_clarity_reports')
      .select('*, pf_clarity_sites(site_url)')
      .order('generated_at', { ascending: false });
    setReports(data || []);
  };

  const generateReport = async () => {
    if (!selectedScan) {
      toast({ title: 'Please select a scan', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    const { data, error } = await supabase.functions.invoke('pf-clarity-pdf-generator', {
      body: {
        action: 'generate',
        scan_id: selectedScan,
        report_type: reportType,
      },
    });

    setGenerating(false);

    if (error || !data.success) {
      toast({ title: 'Error generating report', description: error?.message, variant: 'destructive' });
      return;
    }

    // Download HTML as file
    const blob = new Blob([data.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wcag-report-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Report generated successfully' });
    loadReports();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compliance Reports</h1>
        <FileText className="h-8 w-8 text-primary" />
      </div>

      {/* Generate Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Site</label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.site_url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSite && (
            <div>
              <label className="text-sm font-medium mb-2 block">Select Scan</label>
              <Select value={selectedScan} onValueChange={setSelectedScan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a completed scan" />
                </SelectTrigger>
                <SelectContent>
                  {scans.map((scan) => (
                    <SelectItem key={scan.id} value={scan.id}>
                      {new Date(scan.created_at).toLocaleDateString()} - Score: {scan.compliance_score}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Report (All Details)</SelectItem>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="executive">Executive Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateReport} disabled={generating || !selectedScan}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Reports</h2>
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{report.pf_clarity_sites?.site_url}</p>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="capitalize">{report.report_type}</span> • Generated{' '}
                    {new Date(report.generated_at).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reports generated yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
