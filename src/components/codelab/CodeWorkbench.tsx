/**
 * Surface B — Code Editor Workbench
 * JSON request builder, response inspector, console, history
 * Now with Display Dialect support for legacy code skins
 */

import { useState, useEffect } from "react";
import { secureGet, secureSet, secureRemove } from "@/lib/system/secureStorage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Play, Trash2, Clock, Copy, Check, Download, 
  Loader2, Terminal, ChevronRight, Save, FolderOpen, Eye, Settings2
} from "lucide-react";
import { substrate, SubstrateModule } from "@/lib/substrate";
import { toast } from "sonner";
import { useObsMode } from "@/lib/ui/obsfunction-mode";
import { renderDialect } from "@/lib/ui/dialect-render";
import { DIALECT_LABELS } from "@/lib/ui/display-dialect";
import { DialectSelector } from "./DialectSelector";

interface HistoryItem {
  id: string;
  timestamp: string;
  request: { module: string; action: string; payload?: Record<string, unknown> };
  response: unknown;
  latency: number;
  success: boolean;
}

interface SavedScript {
  name: string;
  request: string;
}

const STORAGE_KEY = "codelab-history";
const SCRIPTS_KEY = "codelab-scripts";

const defaultRequest = {
  module: "vision",
  action: "pulse",
  payload: {}
};

export function CodeWorkbench() {
  const [request, setRequest] = useState(JSON.stringify(defaultRequest, null, 2));
  const [response, setResponse] = useState<unknown>(null);
  const [executing, setExecuting] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [console, setConsole] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedModule, setSelectedModule] = useState<SubstrateModule>("vision");
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [showDialectSettings, setShowDialectSettings] = useState(false);
  
  // Display dialect state
  const { enabled: obsEnabled, dialect } = useObsMode();
  // Load history and scripts from secure storage
  useEffect(() => {
    try {
      const saved = secureGet<HistoryItem[]>(STORAGE_KEY);
      if (saved) setHistory(saved);
    } catch { /* Storage unavailable — start fresh */ }
    try {
      const scripts = secureGet<SavedScript[]>(SCRIPTS_KEY);
      if (scripts) setSavedScripts(scripts);
    } catch { /* Storage unavailable — start fresh */ }
  }, []);

  // Save history to secure storage
  useEffect(() => {
    secureSet(STORAGE_KEY, history.slice(0, 50));
  }, [history]);

  const log = (message: string) => {
    setConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const executeRequest = async () => {
    setExecuting(true);
    setResponse(null);
    log("Executing request...");

    try {
      const parsed = JSON.parse(request);
      const startTime = performance.now();
      
      log(`→ ${parsed.module}.${parsed.action}`);
      
      let result;
      try {
        result = await substrate.invoke({
          module: parsed.module,
          action: parsed.action,
          payload: parsed.payload,
        });
      } catch (invokeError) {
        // Handle network errors gracefully
        const errorMessage = invokeError instanceof Error ? invokeError.message : 'Unknown network error';
        log(`✗ Network error: ${errorMessage}`);
        
        // Create a graceful fallback response
        result = {
          success: false,
          module: parsed.module,
          action: parsed.action,
          error: `Network error: ${errorMessage}. The substrate may be temporarily unavailable. Please try again.`,
          timestamp: new Date().toISOString(),
          _fallback: true,
        };
        
        toast.error("Connection failed - using fallback response");
      }
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setLatency(duration);
      setResponse(result);
      
      log(`← Response received in ${duration}ms`);
      
      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        request: parsed,
        response: result,
        latency: duration,
        success: result.success,
      };
      setHistory(prev => [historyItem, ...prev]);
      
      if (result.success) {
        toast.success(`Executed in ${duration}ms`);
      } else if (!result._fallback) {
        // Only show error toast if it's not already handled by fallback
        toast.error(result.error || "Request failed");
        log(`✗ Error: ${result.error}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log(`✗ Parse error: ${errorMsg}`);
      toast.error("Invalid JSON - please check your request format");
      
      // Set a helpful response for parse errors
      setResponse({
        success: false,
        error: `JSON Parse Error: ${errorMsg}`,
        hint: "Make sure your request is valid JSON with 'module', 'action', and optional 'payload' fields.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setExecuting(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setRequest(JSON.stringify(item.request, null, 2));
    setResponse(item.response);
    setLatency(item.latency);
    log(`Loaded request from history`);
  };

  const clearHistory = () => {
    setHistory([]);
    secureRemove(STORAGE_KEY);
    log("History cleared");
    toast.success("History cleared");
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadResponse = () => {
    if (response) {
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `substrate-response-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      log("Response downloaded");
    }
  };

  const saveScript = () => {
    const name = prompt("Script name:");
    if (name) {
      const newScripts = [...savedScripts, { name, request }];
      setSavedScripts(newScripts);
      secureSet(SCRIPTS_KEY, newScripts);
      toast.success("Script saved");
      log(`Script "${name}" saved`);
    }
  };

  const loadScript = (script: SavedScript) => {
    setRequest(script.request);
    log(`Loaded script "${script.name}"`);
  };

  const updateModuleInRequest = (module: SubstrateModule) => {
    setSelectedModule(module);
    try {
      const parsed = JSON.parse(request);
      parsed.module = module;
      setRequest(JSON.stringify(parsed, null, 2));
    } catch { /* Invalid JSON in request field — ignore */ }
  };

  return (
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
      {/* Request Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Select value={selectedModule} onValueChange={(v) => updateModuleInRequest(v as SubstrateModule)}>
              <SelectTrigger className="w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["core", "ripple", "access", "brain", "decode", "dream", "defense", "nexus", "vision", "system", "evolution", "integration"].map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">{m.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={executeRequest} disabled={executing} className="gap-2">
              {executing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Execute
            </Button>
            
            <Button variant="outline" size="icon" onClick={saveScript} title="Save Script">
              <Save className="w-4 h-4" />
            </Button>
            
            {savedScripts.length > 0 && (
              <Select onValueChange={(name) => {
                const script = savedScripts.find(s => s.name === name);
                if (script) loadScript(script);
              }}>
                <SelectTrigger className="w-32 text-sm">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <span>Load</span>
                </SelectTrigger>
                <SelectContent>
                  {savedScripts.map((s) => (
                    <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {latency !== null && (
              <Badge variant="outline" className="ml-auto">
                <Clock className="w-3 h-3 mr-1" />
                {latency}ms
              </Badge>
            )}
            
            {/* Dialect Settings Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowDialectSettings(!showDialectSettings)}
              title="Display Dialect Settings"
              className={showDialectSettings ? "bg-muted" : ""}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Dialect Settings Panel */}
          {showDialectSettings && (
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Code Display Dialect</span>
                <DialectSelector compact />
                <span className="text-xs text-muted-foreground ml-auto">
                  Display only · Copy always returns raw code
                </span>
              </div>
            </div>
          )}
          
          <div className="font-mono">
            <label className="text-xs text-muted-foreground mb-1 block">Request JSON</label>
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="font-mono text-sm min-h-[200px] lg:min-h-[250px] bg-muted/30"
              placeholder='{ "module": "vision", "action": "pulse" }'
            />
          </div>
        </Card>

        {/* Response */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-muted-foreground">Response</label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={copyResponse} disabled={!response}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadResponse} disabled={!response}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[200px] lg:h-[300px]">
            <pre className="font-mono text-xs sm:text-sm bg-muted/30 p-4 rounded-lg whitespace-pre-wrap break-all">
              {response ? JSON.stringify(response, null, 2) : "// Response will appear here"}
            </pre>
          </ScrollArea>
        </Card>

        {/* Console */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Terminal className="w-4 h-4" />
              Console
            </div>
            <Button variant="ghost" size="sm" onClick={() => setConsole([])}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="font-mono text-xs space-y-1">
              {console.length === 0 ? (
                <span className="text-muted-foreground">// Console output...</span>
              ) : (
                console.map((line, i) => (
                  <div key={i} className={line.includes("✗") ? "text-red-500" : line.includes("←") ? "text-green-500" : "text-muted-foreground"}>
                    {line}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* History Sidebar */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Request History</h3>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="h-[400px] lg:h-[600px]">
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No history yet. Execute a request to see it here.
                </p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${item.success ? "border-green-500/50 text-green-500" : "border-red-500/50 text-red-500"}`}
                      >
                        {item.request.module}
                      </Badge>
                      <span className="text-xs font-mono">{item.request.action}</span>
                      <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.latency}ms
                      <span className="ml-auto">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
