import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Play, Trash2, Database, Save, RotateCcw, Terminal, Sparkles, Copy, Code } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryItem {
  id: string;
  content: string;
  importance: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

const SAMPLE_TEMPLATES = {
  remember: `// Store a memory
const result = await substrate.brain.remember({
  content: "User prefers concise answers",
  importance: 0.9,
  metadata: { category: "preference" }
});
console.log("Stored:", result.id);`,
  
  recall: `// Recall memories
const memories = await substrate.brain.recall({
  query: "What does the user prefer?",
  limit: 5
});
memories.forEach(m => console.log(m.content));`,
  
  context: `// Build LLM context
const context = await substrate.brain.buildContext({
  query: "Summarize user preferences",
  maxTokens: 2000
});
console.log("Context ready:", context.tokenCount, "tokens");`,
  
  forget: `// Remove a memory
await substrate.brain.forget("mem_abc123");
console.log("Memory forgotten");`
};

export function SandboxEnvironment() {
  const [code, setCode] = useState(SAMPLE_TEMPLATES.remember);
  const [memories, setMemories] = useState<MemoryItem[]>([
    { id: 'mem_001', content: 'Example memory: User likes dark mode', importance: 0.8, created_at: new Date().toISOString() },
    { id: 'mem_002', content: 'Example memory: Prefers TypeScript', importance: 0.9, created_at: new Date().toISOString() },
  ]);
  const [logs, setLogs] = useState<string[]>(['// Sandbox initialized', '// Type code and click Run']);
  const [isRunning, setIsRunning] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryImportance, setNewMemoryImportance] = useState([0.7]);

  const addLog = useCallback((msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const prefix = type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✗' : '>';
    setLogs(prev => [...prev, `${prefix} ${msg}`]);
  }, []);

  const runCode = async () => {
    setIsRunning(true);
    addLog('Executing code...', 'info');
    
    await new Promise(r => setTimeout(r, 500));
    
    // Parse and simulate code execution
    if (code.includes('remember')) {
      const newMem: MemoryItem = {
        id: `mem_${Math.random().toString(36).slice(2, 8)}`,
        content: newMemoryContent || 'Simulated memory content',
        importance: newMemoryImportance[0],
        created_at: new Date().toISOString()
      };
      setMemories(prev => [newMem, ...prev]);
      addLog(`Memory stored: ${newMem.id}`, 'success');
      addLog(`  Content: "${newMem.content.slice(0, 40)}..."`, 'info');
      addLog(`  Importance: ${(newMem.importance * 100).toFixed(0)}%`, 'info');
    } else if (code.includes('recall')) {
      addLog(`Retrieved ${memories.length} memories`, 'success');
      memories.slice(0, 3).forEach(m => {
        addLog(`  [${(m.importance * 100).toFixed(0)}%] ${m.content.slice(0, 35)}...`, 'info');
      });
    } else if (code.includes('forget')) {
      if (memories.length > 0) {
        const removed = memories[0];
        setMemories(prev => prev.slice(1));
        addLog(`Memory ${removed.id} forgotten`, 'success');
      } else {
        addLog('No memories to forget', 'warning');
      }
    } else if (code.includes('buildContext')) {
      const tokenEstimate = Math.round(memories.reduce((sum, m) => sum + m.content.length / 4, 0));
      addLog(`Context built successfully`, 'success');
      addLog(`  Tokens: ~${tokenEstimate}`, 'info');
      addLog(`  Memories used: ${memories.length}`, 'info');
    } else {
      addLog('Code executed', 'success');
    }
    
    setIsRunning(false);
  };

  const addManualMemory = () => {
    if (!newMemoryContent.trim()) {
      toast.error('Enter memory content');
      return;
    }
    
    const newMem: MemoryItem = {
      id: `mem_${Math.random().toString(36).slice(2, 8)}`,
      content: newMemoryContent,
      importance: newMemoryImportance[0],
      created_at: new Date().toISOString()
    };
    setMemories(prev => [newMem, ...prev]);
    setNewMemoryContent('');
    addLog(`Manual memory added: ${newMem.id}`, 'success');
    toast.success('Memory stored!');
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    addLog(`Deleted memory: ${id}`, 'success');
  };

  const clearAll = () => {
    setMemories([]);
    setLogs(['// Sandbox reset']);
    toast.success('Sandbox cleared');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Code Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Sandbox Code Editor
              </CardTitle>
              <div className="flex gap-1">
                {Object.entries(SAMPLE_TEMPLATES).map(([key]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCode(SAMPLE_TEMPLATES[key as keyof typeof SAMPLE_TEMPLATES])}
                    className="text-xs h-8 px-3 capitalize"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full font-mono text-sm min-h-[200px] p-4 bg-muted/30 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="// Write your substrate SDK code here..."
                spellCheck={false}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={copyCode}
                className="absolute top-2 right-2 h-8 w-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={runCode} disabled={isRunning} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button variant="outline" onClick={() => setCode('')}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Console Output */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                Console Output
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px] bg-card border border-border rounded-xl p-4">
              <div className="font-mono text-sm space-y-1">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.div
                      key={`${i}-${log.slice(0, 20)}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={
                        log.startsWith('✓') ? 'text-primary' :
                        log.startsWith('⚠') ? 'text-accent-foreground' :
                        log.startsWith('✗') ? 'text-destructive' :
                        'text-muted-foreground'
                      }
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Memory State Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Memory State
              </CardTitle>
              <Badge variant="secondary">{memories.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Add Memory */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
              <Input
                placeholder="Memory content..."
                value={newMemoryContent}
                onChange={(e) => setNewMemoryContent(e.target.value)}
                className="text-sm"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Importance</span>
                  <span className="font-medium">{(newMemoryImportance[0] * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={newMemoryImportance}
                  onValueChange={setNewMemoryImportance}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <Button size="sm" onClick={addManualMemory} className="w-full">
                <Save className="w-3 h-3 mr-2" />
                Add Memory
              </Button>
            </div>

            {/* Memory List */}
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {memories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No memories stored
                    </div>
                  ) : (
                    memories.map((mem) => (
                      <motion.div
                        key={mem.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className="p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group border border-border/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs text-muted-foreground font-mono">{mem.id}</code>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  mem.importance >= 0.8 ? 'border-primary text-primary' :
                                  mem.importance >= 0.5 ? 'border-accent text-accent-foreground' :
                                  'border-muted-foreground text-muted-foreground'
                                }`}
                              >
                                {(mem.importance * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-sm truncate">{mem.content}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={() => deleteMemory(mem.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <Button variant="outline" className="w-full" onClick={clearAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Sandbox
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h4 className="font-semibold mb-1">Risk-Free Environment</h4>
            <p className="text-sm text-muted-foreground">
              All data is local. Experiment freely without affecting production.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SandboxEnvironment;