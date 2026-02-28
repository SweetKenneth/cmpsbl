/**
 * AgentConnectGuide — API endpoints + copy-paste block for vibe coding agents
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, Zap, RotateCcw, FileSearch, Activity, Pause, Play, History, Settings2 } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface EndpointDef {
  method: "POST" | "GET";
  action: string;
  description: string;
  icon: React.ReactNode;
  body?: Record<string, unknown>;
  queryParams?: string;
}

const EVOLUTION_CONTROL_ENDPOINTS: EndpointDef[] = [
  {
    method: "POST",
    action: "export",
    description: "Capture pre-metrics and return a stamped evolution proposal JSON",
    icon: <FileSearch className="w-3.5 h-3.5" />,
    body: { action: "export" },
  },
  {
    method: "POST",
    action: "applied",
    description: "Post-scan after applying changes — computes delta, enforces completion gate, records receipt",
    icon: <Zap className="w-3.5 h-3.5" />,
    body: { action: "applied", run_id: "<run_id>", snapshot_id: "<snapshot_id>" },
  },
  {
    method: "POST",
    action: "restore",
    description: "Restore a tenant-scoped snapshot with automatic re-scan",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    body: { action: "restore", snapshot_id: "<snapshot_id>", tenant_id: "global" },
  },
  {
    method: "GET",
    action: "snapshots",
    description: "List all snapshots for a tenant",
    icon: <History className="w-3.5 h-3.5" />,
    queryParams: "action=snapshots&tenant_id=global",
  },
  {
    method: "GET",
    action: "entropy",
    description: "Get entropy trend data for a tenant",
    icon: <Activity className="w-3.5 h-3.5" />,
    queryParams: "action=entropy&tenant_id=global",
  },
];

const EVOLVE_ENDPOINTS: EndpointDef[] = [
  {
    method: "POST",
    action: "cycle",
    description: "Trigger a full evolution cycle — SCAN → GENERATE → SANDBOX → APPLY → LEARN",
    icon: <Zap className="w-3.5 h-3.5" />,
    body: { action: "cycle", scope: "all", max_improvements: 3, dry_run: true },
  },
  {
    method: "POST",
    action: "status",
    description: "Get current evolution system status",
    icon: <Activity className="w-3.5 h-3.5" />,
    body: { action: "status" },
  },
  {
    method: "POST",
    action: "history",
    description: "Get recent evolution cycle history",
    icon: <History className="w-3.5 h-3.5" />,
    body: { action: "history" },
  },
  {
    method: "POST",
    action: "config",
    description: "Get evolution configuration (thresholds, cooldowns, auto-apply level)",
    icon: <Settings2 className="w-3.5 h-3.5" />,
    body: { action: "config" },
  },
  {
    method: "POST",
    action: "pause",
    description: "Pause the evolution system",
    icon: <Pause className="w-3.5 h-3.5" />,
    body: { action: "pause" },
  },
  {
    method: "POST",
    action: "resume",
    description: "Resume the evolution system",
    icon: <Play className="w-3.5 h-3.5" />,
    body: { action: "resume" },
  },
];

function CopyBlock({ content, label }: { content: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted/80 border border-border/50 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {content}
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}

function EndpointRow({ ep }: { ep: EndpointDef }) {
  const url = ep.queryParams
    ? `${SUPABASE_URL}/functions/v1/${ep.method === "GET" && ep.queryParams ? "evolution-control" : "pf-substrate-evolve"}?${ep.queryParams}`
    : "";

  const curlCommand = ep.body
    ? `curl -X POST '${SUPABASE_URL}/functions/v1/${ep.action === "cycle" || ep.action === "status" || ep.action === "history" || ep.action === "config" || ep.action === "pause" || ep.action === "resume" ? "pf-substrate-evolve" : "evolution-control"}' \\
  -H 'Authorization: Bearer ${ANON_KEY}' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(ep.body)}'`
    : `curl '${SUPABASE_URL}/functions/v1/evolution-control?${ep.queryParams}' \\
  -H 'Authorization: Bearer ${ANON_KEY}'`;

  return (
    <div className="border border-border/40 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        {ep.icon}
        <Badge variant={ep.method === "POST" ? "default" : "secondary"} className="text-[10px] font-mono px-1.5 py-0">
          {ep.method}
        </Badge>
        <code className="text-xs font-mono text-foreground font-semibold">{ep.action}</code>
      </div>
      <p className="text-xs text-muted-foreground">{ep.description}</p>
      <CopyBlock content={curlCommand} label={`${ep.action} cURL`} />
    </div>
  );
}

const AGENT_PROMPT = `# CMPSBL EVOLUTION — Connect & Evolve

You are connecting to the CMPSBL Substrate's EVOLUTION system. This system provides autonomous self-improvement through a governed pipeline: SCAN → GENERATE → SANDBOX → APPLY → LEARN.

## Connection Details

Base URL: ${SUPABASE_URL}/functions/v1
Authorization: Bearer ${ANON_KEY}
Content-Type: application/json

## Available Endpoints

### 1. Evolution Orchestrator (pf-substrate-evolve)
POST ${SUPABASE_URL}/functions/v1/pf-substrate-evolve

Actions:
- { "action": "status" } → Check evolution system health & last cycle
- { "action": "cycle", "scope": "all", "dry_run": true } → Run a dry-run evolution cycle
- { "action": "cycle", "scope": "all", "dry_run": false } → Run a live evolution cycle (use with caution)
- { "action": "history" } → Get last 20 evolution cycles
- { "action": "config" } → Get thresholds, cooldowns, auto-apply settings
- { "action": "pause" } → Pause evolution
- { "action": "resume" } → Resume evolution

### 2. Evolution Control (evolution-control)
POST ${SUPABASE_URL}/functions/v1/evolution-control

Actions:
- { "action": "export" } → Capture pre-metrics, get stamped proposal JSON
- { "action": "applied", "run_id": "<id>", "snapshot_id": "<id>" } → Record post-apply delta
- { "action": "restore", "snapshot_id": "<id>", "tenant_id": "global" } → Rollback to snapshot

GET ${SUPABASE_URL}/functions/v1/evolution-control?action=snapshots&tenant_id=global
GET ${SUPABASE_URL}/functions/v1/evolution-control?action=entropy&tenant_id=global

## Workflow

1. Call \`status\` to check if evolution is enabled and healthy
2. Call \`export\` to capture a pre-metrics snapshot
3. Run a \`cycle\` with \`dry_run: true\` to preview improvements
4. If satisfied, run \`cycle\` with \`dry_run: false\` to apply
5. Call \`applied\` with the run_id and snapshot_id to record the delta
6. Check \`entropy\` trend to confirm improvement trajectory

## Safety Rules

- ALWAYS start with dry_run: true
- NEVER skip the export step (pre-metrics snapshot is required)
- Check the delta's net_improvement field before proceeding
- If health_delta is negative, STOP and call restore
- All headers must include Authorization: Bearer <anon_key>
`;

export function AgentConnectGuide() {
  return (
    <div className="space-y-6">
      {/* Agent Prompt Block */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Agent Connection Prompt</CardTitle>
          </div>
          <CardDescription>
            Copy this entire block and paste it into your vibe coding agent (Cursor, Windsurf, Cline, etc.) to connect it to your EVOLUTION system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CopyBlock content={AGENT_PROMPT} label="Agent prompt" />
        </CardContent>
      </Card>

      {/* Evolution Orchestrator Endpoints */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">EVOLUTION Orchestrator</CardTitle>
          </div>
          <CardDescription className="font-mono text-xs">
            POST {SUPABASE_URL}/functions/v1/pf-substrate-evolve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {EVOLVE_ENDPOINTS.map((ep) => (
            <EndpointRow key={ep.action} ep={ep} />
          ))}
        </CardContent>
      </Card>

      {/* Evolution Control Endpoints */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">EVOLUTION Control</CardTitle>
          </div>
          <CardDescription className="font-mono text-xs">
            {SUPABASE_URL}/functions/v1/evolution-control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {EVOLUTION_CONTROL_ENDPOINTS.map((ep) => (
            <EndpointRow key={ep.action} ep={ep} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
