import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { useThreatMetrics } from "@/hooks/admin/useThreatMetrics";
import { useDefenseRules } from "@/hooks/admin/useDefenseRules";
import { Shield, AlertTriangle, Ban, Eye, Activity, Plus, Power, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DefenseControlDashboard() {
  const { data: threats, isLoading } = useThreatMetrics();
  const { rules, toggleRule, createRule, blockIp } = useDefenseRules();
  const queryClient = useQueryClient();
  const [newRuleName, setNewRuleName] = useState("");
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleAction, setNewRuleAction] = useState("challenge");
  const [blockIpInput, setBlockIpInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('security-events-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pf_security_events' },
        (payload) => {
          const event = payload.new as any;
          if (event.action_taken === 'block') {
            toast.warning(`Threat blocked: ${event.event_type} from ${event.ip_address}`);
          }
          queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical": return "hsl(0, 84%, 60%)";
      case "high": return "hsl(25, 95%, 53%)";
      case "medium": return "hsl(48, 96%, 53%)";
      default: return "hsl(142, 76%, 46%)";
    }
  };

  const ipReputationData = [
    { name: "Trusted", value: threats?.ipReputation.trusted || 0, color: "hsl(142, 76%, 46%)" },
    { name: "Suspicious", value: threats?.ipReputation.suspicious || 0, color: "hsl(48, 96%, 53%)" },
    { name: "Blocked", value: threats?.ipReputation.blocked || 0, color: "hsl(0, 84%, 60%)" },
  ];

  const handleCreateRule = async () => {
    if (!newRuleName || !newRulePattern) {
      toast.error("Rule name and pattern required");
      return;
    }
    await createRule.mutateAsync({
      rule_name: newRuleName,
      pattern: newRulePattern,
      action: newRuleAction
    });
    setNewRuleName("");
    setNewRulePattern("");
    setDialogOpen(false);
  };

  const handleBlockIp = async () => {
    if (!blockIpInput) {
      toast.error("Enter an IP address");
      return;
    }
    await blockIp.mutateAsync({ ip: blockIpInput, reason: "Manual block from admin" });
    setBlockIpInput("");
  };

  const runFullScan = async () => {
    toast.info("Initiating full security scan...");
    try {
      await supabase.functions.invoke('pf-defense-full-scan');
      toast.success("Security scan completed");
      queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
    } catch (e) {
      toast.error("Scan failed");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Defense Shield Control</h1>
            <p className="text-muted-foreground">Real-time threat monitoring and protection</p>
          </div>
          <ActionButton icon={Shield} variant="primary" onClick={runFullScan}>
            Run Full Scan
          </ActionButton>
        </div>

        {/* Threat Level Indicator */}
        <Card className={`glass-card border-2 p-6 ${
          threats?.threatLevel === "critical" ? "border-red-500/50 bg-red-500/5" :
          threats?.threatLevel === "high" ? "border-orange-500/50 bg-orange-500/5" :
          threats?.threatLevel === "medium" ? "border-yellow-500/50 bg-yellow-500/5" :
          "border-green-500/50 bg-green-500/5"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                threats?.threatLevel === "critical" ? "bg-red-500/20 text-red-500" :
                threats?.threatLevel === "high" ? "bg-orange-500/20 text-orange-500" :
                threats?.threatLevel === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                "bg-green-500/20 text-green-500"
              } animate-pulse`}>
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold capitalize">{threats?.threatLevel || "Low"} Threat Level</h3>
                <p className="text-muted-foreground">Based on {threats?.eventsToday || 0} events today</p>
              </div>
            </div>
            <Badge variant={threats?.threatLevel === "low" ? "default" : "destructive"} className="text-lg px-4 py-2">
              {threats?.eventsBlocked || 0} Blocked
            </Badge>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Events Today" value={threats?.eventsToday || 0} icon={Activity} variant="default" loading={isLoading} />
          <StatCard title="Threats Blocked" value={threats?.eventsBlocked || 0} icon={Ban} variant="danger" loading={isLoading} />
          <StatCard title="Monitored IPs" value={(threats?.ipReputation.trusted || 0) + (threats?.ipReputation.suspicious || 0) + (threats?.ipReputation.blocked || 0)} icon={Eye} variant="default" loading={isLoading} />
          <StatCard title="Active Rules" value={threats?.activeRules || 0} icon={Shield} variant="success" loading={isLoading} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Block IP */}
          <Card className="glass-card border border-border/50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" /> Quick Block IP
            </h3>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter IP address" 
                value={blockIpInput} 
                onChange={(e) => setBlockIpInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="destructive" onClick={handleBlockIp} disabled={blockIp.isPending}>
                Block
              </Button>
            </div>
          </Card>

          {/* Add Rule */}
          <Card className="glass-card border border-border/50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-500" /> Add Defense Rule
            </h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Create New Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Defense Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Rule Name</Label>
                    <Input value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)} placeholder="e.g. Block Headless Browsers" />
                  </div>
                  <div>
                    <Label>Pattern (regex or string)</Label>
                    <Input value={newRulePattern} onChange={(e) => setNewRulePattern(e.target.value)} placeholder="e.g. HeadlessChrome" />
                  </div>
                  <div>
                    <Label>Action</Label>
                    <Select value={newRuleAction} onValueChange={setNewRuleAction}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monitor">Monitor</SelectItem>
                        <SelectItem value="challenge">Challenge</SelectItem>
                        <SelectItem value="block">Block</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateRule} disabled={createRule.isPending} className="w-full">
                    Create Rule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Top Threat Types</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={threats?.topThreats || []}>
                <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {threats?.topThreats.map((entry, index) => (
                    <Cell key={index} fill={getThreatColor(entry.severity)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-card border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">IP Reputation</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ipReputationData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} dataKey="value">
                  {ipReputationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Active Rules */}
        <Card className="glass-card border border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Active Defense Rules
          </h3>
          <div className="space-y-2">
            {rules.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No rules configured</p>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={rule.is_active} 
                      onCheckedChange={(checked) => toggleRule.mutate({ rule_id: rule.id, is_active: checked })}
                    />
                    <div>
                      <span className="font-medium text-sm">{rule.rule_name}</span>
                      <p className="text-xs text-muted-foreground">{rule.pattern}</p>
                    </div>
                  </div>
                  <Badge variant={rule.action === 'block' ? 'destructive' : rule.action === 'challenge' ? 'default' : 'secondary'}>
                    {rule.action}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Events */}
        <Card className="glass-card border border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Detection Events</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(threats?.recentEvents || []).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border border-border/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 ${event.threat_score >= 70 ? 'text-red-500' : event.threat_score >= 40 ? 'text-orange-500' : 'text-yellow-500'}`} />
                  <div>
                    <span className="font-medium text-sm">{event.type}</span>
                    <p className="text-xs text-muted-foreground">IP: {event.ip} | Score: {event.threat_score}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={event.action === "block" ? "destructive" : event.action === "challenge" ? "default" : "secondary"}>
                    {event.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
