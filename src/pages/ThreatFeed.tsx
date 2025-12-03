import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Globe, Activity } from "lucide-react";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface ThreatData {
  id: string;
  threat_type: string;
  threat_category: string;
  severity: "low" | "medium" | "high" | "critical";
  country_code?: string;
  detected_at: string;
  description?: string;
}

interface ThreatStats {
  total_threats: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export default function ThreatFeed() {
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreatData();
  }, []);

  const loadThreatData = async () => {
    try {
      // Load recent threats
      const { data: recentThreats } = await supabase
        .from("pf_global_threat_feed")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(100);

      if (recentThreats) {
        setThreats(recentThreats as ThreatData[]);
      }

      // Load statistics from view
      const { data: statsView } = await supabase
        .from("pf_threat_statistics")
        .select("*");

      if (statsView) {
        const aggregated: ThreatStats = {
          total_threats: 0,
          by_type: {},
          by_severity: {}
        };

        statsView.forEach((stat: any) => {
          const count = stat.count || 0;
          aggregated.by_type[stat.threat_type] = (aggregated.by_type[stat.threat_type] || 0) + count;
          aggregated.by_severity[stat.severity] = (aggregated.by_severity[stat.severity] || 0) + count;
          aggregated.total_threats += count;
        });

        setStats(aggregated);
      }
    } catch (error) {
      console.error("Error loading threat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "outline";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Global Threat Intelligence Feed | PromptFluid Defense"
        description="Real-time threat intelligence and bot attack patterns from the PromptFluid Defense network. Public API available for developers and security researchers."
        keywords={["threat intelligence", "bot attacks", "security feed", "API", "real-time threats", "cyber security"]}
      />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Global Threat Intelligence</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time bot attack patterns and threat data from the PromptFluid Defense network.
            Free public API for developers and security researchers.
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Threats</p>
                  <p className="text-3xl font-bold">{stats.total_threats.toLocaleString()}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-destructive">
                    {(stats.by_severity.critical || 0).toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-3xl font-bold text-destructive">
                    {(stats.by_severity.high || 0).toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Protected Sites</p>
                  <p className="text-3xl font-bold">10,247</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </div>
        )}

        {/* API Information */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Public API Access</h2>
          <p className="text-muted-foreground mb-6">
            Integrate real-time threat intelligence into your security workflows. Free for all developers.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="font-mono text-sm bg-background/80 p-4 rounded-lg">
              <div className="text-primary mb-2">GET /recent</div>
              <div className="text-muted-foreground">Latest threats</div>
            </div>
            <div className="font-mono text-sm bg-background/80 p-4 rounded-lg">
              <div className="text-primary mb-2">GET /stats</div>
              <div className="text-muted-foreground">Global statistics</div>
            </div>
            <div className="font-mono text-sm bg-background/80 p-4 rounded-lg">
              <div className="text-primary mb-2">GET /map</div>
              <div className="text-muted-foreground">Geographic distribution</div>
            </div>
            <div className="font-mono text-sm bg-background/80 p-4 rounded-lg">
              <div className="text-primary mb-2">GET /ip/{"{ip}"}</div>
              <div className="text-muted-foreground">IP reputation lookup</div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="font-mono text-sm mb-2">Base URL:</p>
            <code className="text-primary">
              https://api.promptfluid.com/pf-defense-threat-feed
            </code>
          </div>

          <div className="mt-4 p-6 border-2 border-destructive rounded-lg bg-destructive/10">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div className="space-y-2 text-xs">
                <p className="font-bold text-destructive text-sm">⚖️ LEGAL NOTICE - PRIVATE API ENDPOINT</p>
                <p className="text-muted-foreground">
                  This API endpoint and all associated services, domains, and subdomains located at PromptFluid.com are <strong>PRIVATE and PROPRIETARY</strong>.
                </p>
                <p className="text-muted-foreground">
                  Unauthorized access, use, scraping, reproduction, or distribution of this API or its data is <strong>STRICTLY PROHIBITED</strong> and constitutes a violation of federal and state laws including but not limited to the Computer Fraud and Abuse Act (18 U.S.C. § 1030).
                </p>
                <p className="font-semibold text-destructive">
                  Any unauthorized use will result in immediate legal action including civil damages and criminal prosecution to the fullest extent of the law.
                </p>
                <p className="text-muted-foreground">
                  <strong>PromptFluid™</strong> is a registered trademark (filed November 2025). All rights reserved.
                </p>
                <p className="text-muted-foreground">
                  All access is monitored and logged. IP addresses and request metadata are retained for legal purposes. This service operates under U.S. federal jurisdiction with additional state-level protections.
                </p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-destructive/20">
                  <strong>Authorized access inquiries:</strong> PromptFluid@gmail.com
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Threats */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Threats (Last 24 Hours)</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading threat intelligence...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {threats.map((threat) => (
                <Card key={threat.id} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getSeverityIcon(threat.severity)}
                        <Badge variant={getSeverityColor(threat.severity)}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <span className="font-semibold">{threat.threat_type}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{threat.threat_category}</span>
                      </div>
                      
                      {threat.description && (
                        <p className="text-muted-foreground mb-2">{threat.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(threat.detected_at).toLocaleString()}</span>
                        {threat.country_code && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {threat.country_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Want to Contribute?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Install PromptFluid Defense on your WordPress site and join the global defense network.
              Every installation makes the entire network smarter.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://www.promptfluid.com/products/defense"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get PromptFluid Defense
              </a>
              <a
                href="mailto:PromptFluid@gmail.com"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Contact Support
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
