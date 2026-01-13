import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cascadeProjects, getProjectById } from "@/lib/cascade/projects";
import { logPatchGeneration } from "@/lib/cascade/coder-logs";
import { validatePatchYaml, extractFilePaths, type SandboxWarning } from "@/lib/cascade/sandbox";
import { toast } from "sonner";
import { 
  Code2, 
  ChevronDown, 
  Copy, 
  AlertTriangle, 
  Loader2, 
  FileCode, 
  Sparkles,
  ArrowLeft,
  History,
  Trash2,
  RotateCcw,
  FileText,
  ListTree,
  StickyNote,
  RefreshCw,
  AlertCircle,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/cascade-coder.css";

interface FileOperation {
  type: 'create' | 'modify' | 'delete';
  description: string;
  code?: string;
}

interface PatchFile {
  path: string;
  intent: string;
  operations: FileOperation[];
}

interface ParsedPatch {
  patch_title: string;
  project_id: string;
  summary: string;
  files: PatchFile[];
  notes?: string;
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  projectId: string;
  request: string;
  yaml: string;
  provider?: string;
}

const HISTORY_KEY = 'cascade-coder-history';
const MAX_HISTORY = 5;

export default function CascadeCoder() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [request, setRequest] = useState("");
  const [fileHints, setFileHints] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [yamlResponse, setYamlResponse] = useState<string | null>(null);
  const [parsedPatch, setParsedPatch] = useState<ParsedPatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sandboxWarnings, setSandboxWarnings] = useState<SandboxWarning[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Spotlight effect
  useEffect(() => {
    const container = containerRef.current;
    const spotlight = spotlightRef.current;
    if (!container || !spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlight.style.left = `${x}px`;
      spotlight.style.top = `${y}px`;
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const saveToHistory = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const restoreFromHistory = (entry: HistoryEntry) => {
    setSelectedProject(entry.projectId);
    setRequest(entry.request);
    setYamlResponse(entry.yaml);
    const parsed = parseYaml(entry.yaml);
    if (parsed) setParsedPatch(parsed);
    const validation = validatePatchYaml(entry.yaml);
    setSandboxWarnings(validation.warnings);
    setShowHistory(false);
    toast.success("Patch restored from history");
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    toast.success("Removed from history");
  };

  const handleSubmit = async (improveMode = false) => {
    if (!selectedProject || !request.trim()) {
      toast.error("Please select a project and describe your change");
      return;
    }

    setIsLoading(true);
    setError(null);
    setYamlResponse(null);
    setParsedPatch(null);
    setSandboxWarnings([]);
    setProvider(null);

    const startTime = Date.now();
    const finalRequest = improveMode 
      ? `${request.trim()}\n\nIMPROVEMENT REQUEST: Improve clarity, better file grouping, and cleaner code organization.`
      : request.trim();

    try {
      const { data, error: fnError } = await supabase.functions.invoke('pf-cascade-coder', {
        body: {
          projectId: selectedProject,
          request: finalRequest,
          fileHints: fileHints.trim() || undefined
        }
      });

      const responseTime = Date.now() - startTime;

      if (fnError) throw fnError;

      if (data.error) {
        setError(data.error);
        logPatchGeneration({
          projectId: selectedProject,
          requestLength: request.length,
          parseSuccess: false,
          responseTime,
          error: data.error
        });
        return;
      }

      setYamlResponse(data.yaml);
      setProvider(data.provider);
      
      // Validate with sandbox
      const validation = validatePatchYaml(data.yaml);
      setSandboxWarnings(validation.warnings);

      // Try to parse the YAML for structured display
      const parsed = parseYaml(data.yaml);
      if (parsed) {
        setParsedPatch(parsed);
      }

      // Save to history
      saveToHistory({
        projectId: selectedProject,
        request: request.trim(),
        yaml: data.yaml,
        provider: data.provider
      });

      logPatchGeneration({
        projectId: selectedProject,
        requestLength: request.length,
        parseSuccess: !!parsed,
        responseTime
      });

      toast.success(`Patch generated via ${data.provider || 'AI'}`);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      logPatchGeneration({
        projectId: selectedProject,
        requestLength: request.length,
        parseSuccess: false,
        error: errorMsg
      });
      toast.error("Failed to generate patch");
    } finally {
      setIsLoading(false);
    }
  };

  const parseYaml = (yaml: string): ParsedPatch | null => {
    try {
      const lines = yaml.split('\n');
      const result: Partial<ParsedPatch> = { files: [] };
      let currentFile: Partial<PatchFile> | null = null;
      let currentOp: Partial<FileOperation> | null = null;
      let inCode = false;
      let codeLines: string[] = [];
      let inNotes = false;
      let notesLines: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (inCode) {
          if (line.match(/^\s{6}\w/) || line.match(/^\s{4}-\s+type:/) || line.match(/^\s{2}-\s+path:/)) {
            if (currentOp) currentOp.code = codeLines.join('\n');
            inCode = false;
            codeLines = [];
            i--;
            continue;
          }
          codeLines.push(line.replace(/^\s{8}/, ''));
          continue;
        }

        if (inNotes) {
          if (!line.startsWith(' ') && trimmed !== '' && !line.startsWith('  ')) {
            result.notes = notesLines.join('\n');
            inNotes = false;
            i--;
            continue;
          }
          notesLines.push(trimmed);
          continue;
        }

        if (trimmed.startsWith('patch_title:')) {
          result.patch_title = trimmed.replace('patch_title:', '').trim().replace(/^["']|["']$/g, '');
        } else if (trimmed.startsWith('project_id:')) {
          result.project_id = trimmed.replace('project_id:', '').trim().replace(/^["']|["']$/g, '');
        } else if (trimmed.startsWith('summary:')) {
          result.summary = trimmed.replace('summary:', '').trim().replace(/^["']|["']$/g, '');
        } else if (trimmed.startsWith('notes:')) {
          inNotes = true;
          const inline = trimmed.replace('notes:', '').trim();
          if (inline && inline !== '|') notesLines.push(inline.replace(/^["']|["']$/g, ''));
        } else if (trimmed.startsWith('- path:')) {
          if (currentFile && currentFile.path) {
            if (currentOp && currentOp.type) {
              currentFile.operations = currentFile.operations || [];
              currentFile.operations.push(currentOp as FileOperation);
              currentOp = null;
            }
            result.files!.push(currentFile as PatchFile);
          }
          currentFile = {
            path: trimmed.replace('- path:', '').trim().replace(/^["']|["']$/g, ''),
            intent: '',
            operations: []
          };
        } else if (trimmed.startsWith('intent:') && currentFile) {
          currentFile.intent = trimmed.replace('intent:', '').trim().replace(/^["']|["']$/g, '');
        } else if (trimmed.startsWith('- type:')) {
          if (currentOp && currentOp.type && currentFile) {
            currentFile.operations = currentFile.operations || [];
            currentFile.operations.push(currentOp as FileOperation);
          }
          currentOp = {
            type: trimmed.replace('- type:', '').trim().replace(/^["']|["']$/g, '') as 'create' | 'modify' | 'delete',
            description: ''
          };
        } else if (trimmed.startsWith('description:') && currentOp) {
          currentOp.description = trimmed.replace('description:', '').trim().replace(/^["']|["']$/g, '');
        } else if (trimmed.startsWith('code:')) {
          inCode = true;
        }
      }

      if (inCode && currentOp) currentOp.code = codeLines.join('\n');
      if (inNotes) result.notes = notesLines.join('\n');
      if (currentOp && currentOp.type && currentFile) {
        currentFile.operations = currentFile.operations || [];
        currentFile.operations.push(currentOp as FileOperation);
      }
      if (currentFile && currentFile.path) result.files!.push(currentFile as PatchFile);

      if (result.patch_title && result.files && result.files.length > 0) {
        return result as ParsedPatch;
      }
      return null;
    } catch {
      return null;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const selectedProjectData = selectedProject ? getProjectById(selectedProject) : null;

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      <div ref={spotlightRef} className="cascade-spotlight" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/cascade">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            History ({history.length})
          </Button>
        </div>

        <div className="cascade-coder-header rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold cascade-gold-text">Cascade Coder</h1>
            <Badge variant="secondary">Labs</Badge>
            {provider && (
              <Badge variant="outline" className="ml-2 text-xs">
                via {provider}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Generate structured code patches using free-tier AI routing.
          </p>
        </div>

        {/* Warning Banner */}
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            Generated patches are suggestions. Review carefully before applying.
          </AlertDescription>
        </Alert>

        {/* Sandbox Warnings */}
        {sandboxWarnings.length > 0 && (
          <div className="mb-6 space-y-2">
            {sandboxWarnings.map((w, i) => (
              <Alert key={i} variant={w.type === 'error' ? 'destructive' : 'default'} 
                className={w.type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' : ''}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{w.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* History Drawer */}
        {showHistory && history.length > 0 && (
          <Card className="mb-6 cascade-result-enter">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Patches</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {history.map(entry => (
                  <div key={entry.id} className="cascade-history-card flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.request.slice(0, 60)}...</p>
                      <p className="text-xs text-muted-foreground">
                        {getProjectById(entry.projectId)?.name} • {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => restoreFromHistory(entry)}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteFromHistory(entry.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configure Patch</CardTitle>
                <CardDescription>Select a target project and describe your change.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cascadeProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col items-start">
                            <span>{project.name}</span>
                            <span className="text-xs text-muted-foreground">{project.stack}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProjectData && (
                    <p className="text-xs text-muted-foreground mt-1">{selectedProjectData.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">What do you want Cascade to build or fix?</label>
                  <Textarea
                    placeholder="e.g., Create a new /about page..."
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    File hints <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="e.g., src/pages/, src/components/ui/..."
                    value={fileHints}
                    onChange={(e) => setFileHints(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <Button 
                  onClick={() => handleSubmit(false)} 
                  disabled={isLoading || !selectedProject || !request.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating patch...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Patch
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6 cascade-result-panel">
            {!yamlResponse && !isLoading && !error && (
              <Card className="h-full min-h-[400px]">
                <CardHeader>
                  <CardTitle className="text-lg">How Cascade Coder Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
                    <div>
                      <p className="font-medium text-foreground">Select a Project</p>
                      <p className="text-sm">Choose from {cascadeProjects.length} registered projects.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
                    <div>
                      <p className="font-medium text-foreground">Describe Your Change</p>
                      <p className="text-sm">Be specific for better results.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</div>
                    <div>
                      <p className="font-medium text-foreground">Get a Structured Patch</p>
                      <p className="text-sm">YAML spec with file paths and code blocks.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">4</div>
                    <div>
                      <p className="font-medium text-foreground">Review & Apply</p>
                      <p className="text-sm">Copy and apply manually or automate.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Cascade is generating your patch...</p>
                  <p className="text-sm text-muted-foreground">
                    Target: <span className="font-medium">{selectedProjectData?.name}</span>
                  </p>
                </div>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {yamlResponse && (
              <Card className="cascade-result-enter">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{parsedPatch?.patch_title || 'Generated Patch'}</CardTitle>
                    {parsedPatch?.summary && (
                      <CardDescription className="mt-1">{parsedPatch.summary}</CardDescription>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(yamlResponse, 'Full patch')}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px] pr-4">
                    {parsedPatch ? (
                      <div className="space-y-4">
                        {/* Summary Section */}
                        {parsedPatch.summary && (
                          <div className="mb-4">
                            <div className="cascade-section-header">
                              <FileText className="h-4 w-4" />
                              <span>Summary</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{parsedPatch.summary}</p>
                          </div>
                        )}

                        {/* Files Section */}
                        <div className="cascade-section-header">
                          <ListTree className="h-4 w-4" />
                          <span>Files ({parsedPatch.files.length})</span>
                        </div>

                        {parsedPatch.files.map((file, fileIdx) => (
                          <Collapsible key={fileIdx} defaultOpen className={`cascade-file-block`}>
                            <Card className="border-dashed">
                              <CollapsibleTrigger className="w-full">
                                <CardHeader className="py-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileCode className="h-4 w-4 text-primary" />
                                      <code className="text-sm font-mono">{file.path}</code>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  {file.intent && (
                                    <p className="text-xs text-muted-foreground text-left mt-1">{file.intent}</p>
                                  )}
                                  {file.operations[0]?.type === 'create' && (
                                    <div className="cascade-file-warning">
                                      <AlertTriangle />
                                      <span>New file - will be created</span>
                                    </div>
                                  )}
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0 space-y-3">
                                  {file.operations.map((op, opIdx) => (
                                    <div key={opIdx} className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant={op.type === 'create' ? 'default' : op.type === 'delete' ? 'destructive' : 'secondary'}>
                                          {op.type}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">{op.description}</span>
                                      </div>
                                      {op.code && (
                                        <div className="relative">
                                          <pre className="cascade-yaml-block text-xs overflow-x-auto">
                                            <code>{op.code}</code>
                                          </pre>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 h-6 w-6 p-0"
                                            onClick={() => copyToClipboard(op.code!, `${file.path} code`)}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        ))}

                        {/* Notes Section */}
                        {parsedPatch.notes && (
                          <div className="mt-4">
                            <div className="cascade-section-header">
                              <StickyNote className="h-4 w-4" />
                              <span>Notes</span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedPatch.notes}</p>
                          </div>
                        )}

                        {/* Improve Button */}
                        <div className="pt-4 border-t">
                          <Button 
                            onClick={() => handleSubmit(true)}
                            disabled={isLoading}
                            className="w-full cascade-improve-btn"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate Again With Improvements
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Raw YAML output (parsing failed):</p>
                        <pre className="cascade-yaml-block text-xs overflow-x-auto whitespace-pre-wrap">
                          {yamlResponse}
                        </pre>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
