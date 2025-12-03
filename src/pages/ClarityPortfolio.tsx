import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { BarChart, TrendingUp, AlertCircle, CheckCircle2, Globe } from 'lucide-react';

export default function ClarityPortfolio() {
  const [overview, setOverview] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    const { data, error } = await supabase.functions.invoke('pf-clarity-portfolio-compare', {
      body: { action: 'get_portfolio_overview' },
    });

    if (error || !data.success) {
      toast({ title: 'Error loading portfolio', description: error?.message, variant: 'destructive' });
      return;
    }

    setOverview(data.overview);
    setSites(data.sites);
  };

  const compareSites = async () => {
    if (selectedSites.length < 2) {
      toast({ title: 'Select at least 2 sites to compare', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('pf-clarity-portfolio-compare', {
      body: { action: 'compare_sites', site_ids: selectedSites },
    });

    setLoading(false);

    if (error || !data.success) {
      toast({ title: 'Error comparing sites', description: error?.message, variant: 'destructive' });
      return;
    }

    setComparison(data.comparison);
  };

  const toggleSite = (siteId: string) => {
    setSelectedSites(prev =>
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Overview</h1>
        <Globe className="h-8 w-8 text-primary" />
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.total_sites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.avg_compliance_score}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.total_issues}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {overview.critical_issues} critical
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Above 80%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overview.sites_above_threshold}</div>
              <p className="text-sm text-muted-foreground mt-1">
                of {overview.total_sites} sites
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Site Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compare Sites</CardTitle>
            <Button onClick={compareSites} disabled={loading || selectedSites.length < 2}>
              <BarChart className="mr-2 h-4 w-4" />
              Compare Selected
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sites.map((site) => (
              <div key={site.site_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedSites.includes(site.site_id)}
                    onCheckedChange={() => toggleSite(site.site_id)}
                  />
                  <div>
                    <p className="font-medium">{site.site_url}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Score: {site.compliance_score}%</span>
                      <span>{site.total_issues} issues</span>
                      <span className="text-destructive">{site.critical_issues} critical</span>
                    </div>
                  </div>
                </div>
                {site.compliance_score >= 80 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Site</th>
                    <th className="text-center p-3">Score</th>
                    <th className="text-center p-3">Critical</th>
                    <th className="text-center p-3">Warning</th>
                    <th className="text-center p-3">Info</th>
                    <th className="text-center p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((site) => (
                    <tr key={site.site_id} className="border-b">
                      <td className="p-3">{site.site_url}</td>
                      <td className="text-center p-3 font-bold">{site.compliance_score}%</td>
                      <td className="text-center p-3 text-destructive">
                        {site.issues_by_severity.critical}
                      </td>
                      <td className="text-center p-3 text-amber-600">
                        {site.issues_by_severity.warning}
                      </td>
                      <td className="text-center p-3 text-blue-600">
                        {site.issues_by_severity.info}
                      </td>
                      <td className="text-center p-3">{site.total_issues}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
