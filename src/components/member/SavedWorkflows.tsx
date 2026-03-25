/**
 * Saved Workflows — Save and replay intent chains as one-click presets (Creator+)
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Workflow, Plus, Play, Trash2, Clock, Zap, ChevronRight, Sparkles,
} from 'lucide-react';

interface SavedWorkflow {
  id: string;
  name: string;
  description: string | null;
  intent_chain: Array<{ intentType: string; sourceModule: string; input?: Record<string, unknown> }>;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
}

const PRESET_WORKFLOWS = [
  {
    name: 'Research → Summarize → Export',
    description: 'Run deep research, summarize findings, and export as PDF',
    intent_chain: [
      { intentType: 'research', sourceModule: 'HARVEST' },
      { intentType: 'summarize', sourceModule: 'BRAIN' },
      { intentType: 'export', sourceModule: 'ENCODE' },
    ],
  },
  {
    name: 'Analyze → Classify → Store',
    description: 'Analyze input data, classify patterns, and store to memory',
    intent_chain: [
      { intentType: 'analysis', sourceModule: 'BRAIN' },
      { intentType: 'classify', sourceModule: 'DECODE' },
      { intentType: 'memorize', sourceModule: 'MEMORY' },
    ],
  },
  {
    name: 'Scan → Score → Alert',
    description: 'Run accessibility scan, score results, and trigger alerts',
    intent_chain: [
      { intentType: 'scan', sourceModule: 'CONSCIENCE' },
      { intentType: 'score', sourceModule: 'ORACLE' },
      { intentType: 'alert', sourceModule: 'NERVE' },
    ],
  },
];

export function SavedWorkflows({ tier }: { tier: string }) {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('saved_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setWorkflows(data.map(d => ({ ...d, intent_chain: d.intent_chain as unknown as SavedWorkflow['intent_chain'] })));
    };
    load();
  }, [user]);

  const handleSavePreset = async (preset: typeof PRESET_WORKFLOWS[0]) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('saved_workflows')
      .insert({
        user_id: user.id,
        name: preset.name,
        description: preset.description,
        intent_chain: preset.intent_chain,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to save workflow');
      return;
    }
    if (data) {
      setWorkflows(prev => [{ ...data, intent_chain: data.intent_chain as unknown as SavedWorkflow['intent_chain'] }, ...prev]);
      toast.success(`Saved "${preset.name}"`);
    }
  };

  const handleRun = async (wf: SavedWorkflow) => {
    toast.info(`Running "${wf.name}"...`, { description: `${wf.intent_chain.length} steps in chain` });
    // Update run count
    await supabase
      .from('saved_workflows')
      .update({ run_count: wf.run_count + 1, last_run_at: new Date().toISOString() })
      .eq('id', wf.id);
    setWorkflows(prev => prev.map(w =>
      w.id === wf.id ? { ...w, run_count: w.run_count + 1, last_run_at: new Date().toISOString() } : w
    ));
  };

  const handleDelete = async (id: string) => {
    await supabase.from('saved_workflows').delete().eq('id', id);
    setWorkflows(prev => prev.filter(w => w.id !== id));
    toast.success('Workflow removed');
  };

  const handleCreateCustom = async () => {
    if (!user || !newName.trim()) return;
    const { data, error } = await supabase
      .from('saved_workflows')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        description: 'Custom workflow',
        intent_chain: [{ intentType: 'analysis', sourceModule: 'BRAIN' }],
      })
      .select()
      .single();
    if (!error && data) {
      setWorkflows(prev => [{ ...data, intent_chain: data.intent_chain as unknown as SavedWorkflow['intent_chain'] }, ...prev]);
      setNewName('');
      setShowCreate(false);
      toast.success('Workflow created');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Saved Workflows</h2>
          <span className="text-xs text-muted-foreground">({workflows.length})</span>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-3.5 h-3.5" /> New
        </Button>
      </div>

      {/* Create new */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2"
        >
          <Input
            placeholder="Workflow name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1"
            onKeyDown={e => e.key === 'Enter' && handleCreateCustom()}
          />
          <Button size="sm" onClick={handleCreateCustom} disabled={!newName.trim()}>Create</Button>
        </motion.div>
      )}

      {/* Preset templates */}
      {workflows.length === 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Start with a preset or create your own:</p>
          {PRESET_WORKFLOWS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => handleSavePreset(p)}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {p.intent_chain.length} steps <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Saved workflows */}
      <div className="space-y-3">
        {workflows.map((wf, i) => (
          <motion.div
            key={wf.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Workflow className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-sm font-bold break-words">{wf.name}</h3>
                </div>
                {wf.description && (
                  <p className="text-[11px] text-muted-foreground mb-2 pl-6">{wf.description}</p>
                )}
                <div className="flex items-center gap-3 pl-6 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {wf.intent_chain.length} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" /> {wf.run_count} runs
                  </span>
                  {wf.last_run_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(wf.last_run_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="default" className="h-8 gap-1 text-xs" onClick={() => handleRun(wf)}>
                  <Play className="w-3 h-3" /> Run
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(wf.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
