import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

const ClarityDashboard = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const loadDashboardData = async () => {
    try {
      const { data: sitesData } = await supabase
        .from("pf_clarity_sites")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: scansData } = await supabase
        .from("pf_clarity_scans")
        .select("*, pf_clarity_sites(site_name, site_url)")
        .order("created_at", { ascending: false })
        .limit(10);

      setSites(sitesData || []);
      setScans(scansData || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = async (siteId: string) => {
    try {
      const site = sites.find(s => s.id === siteId);
      if (!site) return;

      const { data: scan, error: scanError } = await supabase
        .from("pf_clarity_scans")
        .insert({
          site_id: siteId,
          scan_url: site.site_url,
          status: "queued",
          wcag_level: "AA",
        })
        .select()
        .single();

      if (scanError) throw scanError;

      // Trigger scan via edge function
      const { error: funcError } = await supabase.functions.invoke("pf-clarity-universal-scan", {
        body: {
          scan_id: scan.id,
          url: site.site_url,
          wcag_level: "AA",
          auto_fix: site.auto_fix_enabled,
        },
      });

      if (funcError) throw funcError;

      toast.success("Scan started successfully");
      loadDashboardData();
    } catch (error) {
      console.error("Error starting scan:", error);
      toast.error("Failed to start scan");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <SEO title="Clarity Dashboard - PromptFluid" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Clarity Dashboard</h1>
            <p className="text-muted-foreground">Manage your accessibility scans</p>
          </div>
          <Button onClick={() => navigate("/clarity/add-site")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Site
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <Shield className="w-8 h-8 text-primary mb-2" />
            <div className="text-2xl font-bold">{sites.length}</div>
            <div className="text-sm text-muted-foreground">Total Sites</div>
          </Card>
          <Card className="p-6">
            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {scans.filter(s => s.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Scans</div>
          </Card>
          <Card className="p-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">
              {scans.reduce((sum, s) => sum + (s.issues_pending_review || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Issues Pending Review</div>
          </Card>
          <Card className="p-6">
            <Clock className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">
              {scans.filter(s => s.status === "scanning" || s.status === "queued").length}
            </div>
            <div className="text-sm text-muted-foreground">Scans In Progress</div>
          </Card>
        </div>

        {/* Sites & Scans */}
        <Tabs defaultValue="sites" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="scans">Recent Scans</TabsTrigger>
          </TabsList>

          <TabsContent value="sites">
            <div className="grid gap-6">
              {sites.map((site) => (
                <Card key={site.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{site.site_name || site.site_url}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{site.site_url}</p>
                      <div className="flex gap-2">
                        <Badge variant={site.agent_enabled ? "default" : "secondary"}>
                          Agent: {site.agent_enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={site.auto_fix_enabled ? "default" : "secondary"}>
                          Auto-Fix: {site.auto_fix_enabled ? "On" : "Off"}
                        </Badge>
                        <Badge variant="outline">{site.subscription_tier}</Badge>
                      </div>
                    </div>
                    <Button onClick={() => handleNewScan(site.id)}>
                      Start Scan
                    </Button>
                  </div>
                </Card>
              ))}
              {sites.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No sites added yet</p>
                  <Button onClick={() => navigate("/clarity/add-site")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Site
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scans">
            <div className="grid gap-6">
              {scans.map((scan) => (
                <Card key={scan.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        {scan.pf_clarity_sites?.site_name || scan.scan_url}
                      </h3>
                      <p className="text-sm text-muted-foreground">{scan.scan_url}</p>
                    </div>
                    <Badge
                      variant={
                        scan.status === "completed"
                          ? "default"
                          : scan.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {scan.status}
                    </Badge>
                  </div>
                  {scan.status === "completed" && (
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-2xl font-bold">{scan.compliance_score}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">{scan.issues_critical}</div>
                        <div className="text-xs text-muted-foreground">Critical</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-500">
                          {scan.issues_auto_fixed}
                        </div>
                        <div className="text-xs text-muted-foreground">Auto-Fixed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-500">
                          {scan.issues_pending_review}
                        </div>
                        <div className="text-xs text-muted-foreground">Pending Review</div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClarityDashboard;
