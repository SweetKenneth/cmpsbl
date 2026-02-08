import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Trash2, Database, Save, RotateCcw, Terminal, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
  const [newMemoryImportance, setNewMemoryImportance] = useState(0.7);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  }, []);

  const runCode = async () => {
    setIsRunning(true);
    addLog('Executing code...');
    
    await new Promise(r => setTimeout(r, 500));
    
    // Parse and simulate code execution
    if (code.includes('remember')) {
      const newMem: MemoryItem = {
        id: `mem_${Math.random().toString(36).slice(2, 8)}`,
        content: newMemoryContent || 'Simulated memory content',
        importance: newMemoryImportance,
        created_at: new Date().toISOString()
      };
      setMemories(prev => [newMem, ...prev]);
      addLog(`✓ Memory stored: ${newMem.id}`);
      addLog(`  Content: "${newMem.content.slice(0, 50)}..."`);
    } else if (code.includes('recall')) {
      addLog(`✓ Retrieved ${memories.length} memories`);
      memories.slice(0, 3).forEach(m => {
        addLog(`  [${m.importance.toFixed(2)}] ${m.content.slice(0, 40)}...`);
      });
    } else if (code.includes('forget')) {
      if (memories.length > 0) {
        const removed = memories[0];
        setMemories(prev => prev.slice(1));
        addLog(`✓ Memory ${removed.id} forgotten`);
      } else {
        addLog('⚠ No memories to forget');
      }
    } else if (code.includes('buildContext')) {
      const tokenEstimate = memories.reduce((sum, m) => sum + m.content.length / 4, 0);
      addLog(`✓ Context built: ~${Math.round(tokenEstimate)} tokens`);
      addLog(`  Using ${memories.length} memories`);
    } else {
      addLog('✓ Code executed');
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
      importance: newMemoryImportance,
      created_at: new Date().toISOString()
    };
    setMemories(prev => [newMem, ...prev]);
    setNewMemoryContent('');
    addLog(`✓ Manual memory added: ${newMem.id}`);
    toast.success('Memory stored!');
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    addLog(`✓ Deleted memory: ${id}`);
  };

  const clearAll = () => {
    setMemories([]);
    setLogs(['// Sandbox reset']);
    toast.success('Sandbox cleared');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Code Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Sandbox Code Editor
              </CardTitle>
              <div className="flex gap-2">
                {Object.entries(SAMPLE_TEMPLATES).map(([key, _]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCode(SAMPLE_TEMPLATES[key as keyof typeof SAMPLE_TEMPLATES])}
                    className="text-xs"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm min-h-[200px] bg-muted/30"
              placeholder="// Write your substrate SDK code here..."
            />
            
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
              <CardTitle className="text-sm">Console Output</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px] bg-black/90 rounded-lg p-4">
              <div className="font-mono text-sm text-green-400 space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className={log.startsWith('⚠') ? 'text-yellow-400' : ''}>
                    {log}
                  </div>
                ))}
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
                <Database className="w-5 h-5" />
                Memory State
              </CardTitle>
              <Badge variant="secondary">{memories.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Add Memory */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <Input
                placeholder="Memory content..."
                value={newMemoryContent}
                onChange={(e) => setNewMemoryContent(e.target.value)}
                className="text-sm"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newMemoryImportance}
                  onChange={(e) => setNewMemoryImportance(parseFloat(e.target.value))}
                  className="w-20 text-sm"
                />
                <span className="text-xs text-muted-foreground">importance</span>
                <Button size="sm" onClick={addManualMemory} className="ml-auto">
                  <Save className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Memory List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {memories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No memories stored
                  </div>
                ) : (
                  memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs text-muted-foreground">{mem.id}</code>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                mem.importance >= 0.8 ? 'border-green-500 text-green-500' :
                                mem.importance >= 0.5 ? 'border-yellow-500 text-yellow-500' :
                                'border-muted-foreground'
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteMemory(mem.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <Button variant="outline" className="w-full" onClick={clearAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Sandbox
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
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
