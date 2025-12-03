import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Chrome, Zap, History, Globe } from 'lucide-react';

export default function ClarityExtension() {
  const [quickScans, setQuickScans] = useState<any[]>([]);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuickScans();
    checkExtension();
  }, []);

  const loadQuickScans = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.functions.invoke('pf-clarity-extension-sync', {
      body: { action: 'get_quick_scans' },
    });

    if (!error && data?.scans) {
      setQuickScans(data.scans);
    }
  };

  const checkExtension = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Check via edge function instead of direct table query
    const { data, error } = await supabase.functions.invoke('pf-clarity-extension-sync', {
      body: { action: 'get_sites' },
    });

    if (data && data.sites) {
      setExtensionInstalled(data.sites.length > 0);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browser Extension</h1>
          <p className="text-muted-foreground">Scan any page instantly from your toolbar</p>
        </div>
      </div>

      {!extensionInstalled && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Install Extension
            </CardTitle>
            <CardDescription>Add Clarity to your browser for quick accessibility checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button className="justify-start gap-2" size="lg">
                <Chrome className="h-5 w-5" />
                Add to Chrome
              </Button>
              <Button className="justify-start gap-2" size="lg" variant="outline">
                <Globe className="h-5 w-5" />
                Add to Firefox
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Instant WCAG compliance checks</li>
                <li>• One-click screenshot capture</li>
                <li>• Quick fix suggestions</li>
                <li>• Sync with your dashboard</li>
                <li>• Offline capability</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {extensionInstalled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Zap className="h-5 w-5" />
              Extension Active
            </CardTitle>
            <CardDescription>Your browser extension is connected and ready</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="bg-muted p-4 rounded-lg flex-1">
                <p className="text-2xl font-bold">{quickScans.length}</p>
                <p className="text-sm text-muted-foreground">Quick Scans</p>
              </div>
              <div className="bg-muted p-4 rounded-lg flex-1">
                <p className="text-2xl font-bold">
                  {quickScans.reduce((sum, s) => sum + (s.issue_count || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Issues Found</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Quick Scan History
          </CardTitle>
          <CardDescription>Recent scans performed via extension</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {quickScans.map((scan) => (
              <div key={scan.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium truncate flex-1">{scan.url}</p>
                  <span className={`text-sm px-2 py-1 rounded ${
                    scan.compliance_score >= 80 ? 'bg-green-100 text-green-700' :
                    scan.compliance_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {scan.compliance_score}% compliant
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{scan.issue_count} issues</span>
                  <span>•</span>
                  <span>{new Date(scan.created_at).toLocaleString()}</span>
                  {scan.screenshot_url && (
                    <>
                      <span>•</span>
                      <a href={scan.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View screenshot
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
            {quickScans.length === 0 && (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No quick scans yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Install the extension and scan any page
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
