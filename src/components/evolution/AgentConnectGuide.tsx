/**
 * AgentConnectGuide — Unified /substrate endpoint + copy-paste block for AI agents
 * All operations route through the single pf-substrate gateway: { module, action, ...payload }
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, Zap, RotateCcw, FileSearch, Activity, Pause, Play, History, Settings2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ActionDef {
  module: string;
  action: string;
  description: string;
  icon: React.ReactNode;
  payload?: Record<string, unknown>;
  risk?: "low" | "medium" | "high";
}

const EVOLUTION_ACTIONS: ActionDef[] = [
  {
    module: "evolution",
    action: "status",
    description: "Check evolution system health & last cycle",
    icon: <Activity className="w-3.5 h-3.5" />,
    risk: "low",
  },
  {
    module: "evolution",
    action: "export",
    description: "Capture pre-metrics and return a stamped evolution proposal JSON",
    icon: <FileSearch className="w-3.5 h-3.5" />,
    risk: "low",
  },
  {
    module: "evolution",
    action: "cycle",
    description: "Run a full evolution cycle — SCAN → GENERATE → SANDBOX → APPLY → LEARN",
    icon: <Zap className="w-3.5 h-3.5" />,
    payload: { scope: "all", max_improvements: 3, dry_run: true },
    risk: "high",
  },
  {
    module: "evolution",
    action: "applied",
    description: "Post-scan after applying changes — computes delta, records receipt",
    icon: <Zap className="w-3.5 h-3.5" />,
    payload: { run_id: "<run_id>", snapshot_id: "<snapshot_id>" },
    risk: "medium",
  },
  {
    module: "evolution",
    action: "restore",
    description: "Restore a tenant-scoped snapshot with automatic re-scan",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    payload: { snapshot_id: "<snapshot_id>", tenant_id: "global" },
    risk: "high",
  },
  {
    module: "evolution",
    action: "history",
    description: "Get recent evolution cycle history",
    icon: <History className="w-3.5 h-3.5" />,
    risk: "low",
  },
  {
    module: "evolution",
    action: "config",
    description: "Get thresholds, cooldowns, auto-apply settings",
    icon: <Settings2 className="w-3.5 h-3.5" />,
    risk: "low",
  },
  {
    module: "evolution",
    action: "pause",
    description: "Pause the evolution system",
    icon: <Pause className="w-3.5 h-3.5" />,
    risk: "medium",
  },
  {
    module: "evolution",
    action: "resume",
    description: "Resume the evolution system",
    icon: <Play className="w-3.5 h-3.5" />,
    risk: "low",
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

function ActionRow({ def, token }: { def: ActionDef; token: string }) {
  const body: Record<string, unknown> = {
    module: def.module,
    action: def.action,
    ...(def.payload || {}),
  };

  const curlCommand = `curl -X POST '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pf-substrate' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(body, null, 2)}'`;

  return (
    <div className="border border-border/40 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        {def.icon}
        <Badge variant="default" className="text-[10px] font-mono px-1.5 py-0">POST</Badge>
        <code className="text-xs font-mono text-foreground font-semibold">{def.module}.{def.action}</code>
        {def.risk === "high" && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">caution</Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{def.description}</p>
      <CopyBlock content={curlCommand} label={`${def.action} cURL`} />
    </div>
  );
}

function buildAgentPrompt(baseUrl: string, token: string): string {
  return `# CMPSBL EVOLUTION — Connect & Evolve

You are connecting to the CMPSBL Substrate's EVOLUTION system.

## Single Gateway

ALL operations go through ONE endpoint:

POST ${baseUrl}/functions/v1/pf-substrate
Authorization: Bearer ${token}
Content-Type: application/json

Body: { "module": "<module>", "action": "<action>", ...payload }

## EVOLUTION Actions

| Action | Body | Description |
|--------|------|-------------|
| status | \`{ "module": "evolution", "action": "status" }\` | System health |
| export | \`{ "module": "evolution", "action": "export" }\` | Pre-metrics snapshot |
| cycle | \`{ "module": "evolution", "action": "cycle", "scope": "all", "dry_run": true }\` | Dry-run cycle |
| cycle | \`{ "module": "evolution", "action": "cycle", "scope": "all", "dry_run": false }\` | Live cycle |
| applied | \`{ "module": "evolution", "action": "applied", "run_id": "…", "snapshot_id": "…" }\` | Record delta |
| restore | \`{ "module": "evolution", "action": "restore", "snapshot_id": "…" }\` | Rollback |
| history | \`{ "module": "evolution", "action": "history" }\` | Recent cycles |
| config | \`{ "module": "evolution", "action": "config" }\` | Thresholds |
| pause | \`{ "module": "evolution", "action": "pause" }\` | Pause system |
| resume | \`{ "module": "evolution", "action": "resume" }\` | Resume system |

## Workflow

1. \`status\` → check health
2. \`export\` → capture pre-metrics snapshot
3. \`cycle\` with \`dry_run: true\` → preview improvements
4. If satisfied, \`cycle\` with \`dry_run: false\` → apply
5. \`applied\` with run_id + snapshot_id → record delta
6. Check \`history\` → confirm improvement

## Safety Rules

- ALWAYS start with dry_run: true
- NEVER skip export (pre-metrics required)
- If health_delta is negative, STOP and call restore
- Token above is YOUR personal JWT — do not share
`;
}

export function AgentConnectGuide() {
  const { session } = useAuth();
  const token = session?.access_token ?? "<your_jwt_token>";
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="space-y-6">
      {/* Auth notice */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Authenticated Session</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            All commands below use <strong>your personal JWT</strong> from this session. 
            The token auto-refreshes — copy a fresh prompt if your session expires.
            Everything routes through the single <code className="text-primary font-mono">pf-substrate</code> gateway.
          </p>
        </CardContent>
      </Card>

      {/* Agent Prompt Block */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Agent Connection Prompt</CardTitle>
          </div>
          <CardDescription>
            Copy this block into your AI coding agent (Cursor, Windsurf, Cline, etc.) — it contains your auth token and the unified substrate API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CopyBlock content={buildAgentPrompt(baseUrl, token)} label="Agent prompt" />
        </CardContent>
      </Card>

      {/* Individual Action Reference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">EVOLUTION Actions</CardTitle>
          </div>
          <CardDescription className="font-mono text-xs">
            POST {baseUrl}/functions/v1/pf-substrate → {`{ module: "evolution", action: "…" }`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {EVOLUTION_ACTIONS.map((def) => (
            <ActionRow key={`${def.module}.${def.action}`} def={def} token={token} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
