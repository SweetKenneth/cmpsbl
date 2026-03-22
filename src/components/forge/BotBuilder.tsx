/**
 * Bot Builder Component
 * Form for configuring and minting cognitive bots
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Download, Github, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const BOT_TYPES = ['Research', 'Analyst', 'Planner', 'Strategist', 'Hybrid'] as const;
const MEMORY_MODES = ['Stateless', 'Episodic', 'Persistent'] as const;
const PROVIDERS = ['GPT', 'Groq', 'Claude', 'Cerebras', 'Deepseek', 'Mixtral'] as const;
const CAPABILITIES = [
  'Research / Web',
  'Summarize',
  'Compare Sources',
  'Write Reports',
  'Track Threads',
  'Build Knowledge Graph',
  'Continuous Learning',
  'Long-Term Retention',
] as const;

interface MintedBot {
  id: string;
  name: string;
  type: string;
  slug: string;
  exportPath: string;
}

interface BotBuilderProps {
  onSuccess?: () => void;
}

export function BotBuilder({ onSuccess }: BotBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [mintedBot, setMintedBot] = useState<MintedBot | null>(null);
  const [artifacts, setArtifacts] = useState<Record<string, string> | null>(null);

  // Form state
  const [botName, setBotName] = useState('');
  const [botType, setBotType] = useState<typeof BOT_TYPES[number]>('Research');
  const [memoryMode, setMemoryMode] = useState<typeof MEMORY_MODES[number]>('Episodic');
  const [providers, setProviders] = useState<string[]>(['Groq']);
  const [capabilities, setCapabilities] = useState<string[]>(['Research / Web', 'Summarize']);
  const [deliveryFormat, setDeliveryFormat] = useState<'Repo' | 'Download'>('Download');

  const toggleProvider = (provider: string) => {
    setProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const toggleCapability = (cap: string) => {
    setCapabilities(prev =>
      prev.includes(cap)
        ? prev.filter(c => c !== cap)
        : [...prev, cap]
    );
  };

  const handleMint = async () => {
    if (!botName.trim()) {
      toast.error('Bot name is required');
      return;
    }
    if (providers.length === 0) {
      toast.error('Select at least one provider');
      return;
    }
    if (capabilities.length === 0) {
      toast.error('Select at least one capability');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-forge-mint', {
        body: {
          bot_name: botName,
          bot_type: botType,
          memory_mode: memoryMode,
          provider_stack: providers,
          capabilities,
          delivery_format: deliveryFormat,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Minting failed');

      setMintedBot({
        id: data.data.bot.id,
        name: data.data.bot.name,
        type: data.data.bot.type,
        slug: data.data.bot.slug,
        exportPath: data.data.exportPath,
      });
      setArtifacts(data.data.artifacts);
      toast.success(`Bot "${botName}" minted successfully!`);
    } catch (err) {
      console.error('Mint error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to mint bot');
    } finally {
      setLoading(false);
    }
  };

  const downloadArtifacts = () => {
    if (!artifacts || !mintedBot) return;

    // Create a simple text file with all artifacts
    const content = Object.entries(artifacts)
      .map(([filename, code]) => `// ===== ${filename} =====\n\n${code}\n`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mintedBot.slug}-cognitive-bot.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Bot package downloaded');
  };

  const handleReset = () => {
    setMintedBot(null);
    setArtifacts(null);
    setBotName('');
    setProviders(['Groq']);
    setCapabilities(['Research / Web', 'Summarize']);
    onSuccess?.();
  };

  // Success screen
  if (mintedBot && artifacts) {
    return (
      <Card className="border-neon-green/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-neon-green" />
            <CardTitle className="text-lg">Bot Minted Successfully</CardTitle>
          </div>
          <CardDescription>
            Your cognitive bot is ready for deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bot Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{mintedBot.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <Badge variant="secondary">{mintedBot.type}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Slug</p>
              <code className="text-xs bg-background px-1 py-0.5 rounded">{mintedBot.slug}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Export Path</p>
              <code className="text-xs bg-background px-1 py-0.5 rounded break-all">{mintedBot.exportPath}</code>
            </div>
          </div>

          {/* Artifacts Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Generated Files</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(artifacts).map(filename => (
                <Badge key={filename} variant="outline" className="font-mono text-xs">
                  {filename}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadArtifacts} className="gap-2">
              <Download className="w-4 h-4" />
              Download Package
            </Button>
            <Button variant="outline" disabled className="gap-2">
              <Github className="w-4 h-4" />
              Push to Repo
              <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Build Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build a Cognitive Bot</CardTitle>
        <CardDescription>
          Configure attributes for your new research bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bot Name */}
        <div className="space-y-2">
          <Label htmlFor="botName">Bot Name *</Label>
          <Input
            id="botName"
            placeholder="e.g., MarketResearcher"
            value={botName}
            onChange={e => setBotName(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Bot Type */}
        <div className="space-y-2">
          <Label>Bot Type *</Label>
          <Select value={botType} onValueChange={(v) => setBotType(v as typeof BOT_TYPES[number])} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOT_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Memory Mode */}
        <div className="space-y-2">
          <Label>Memory Mode *</Label>
          <Select value={memoryMode} onValueChange={(v) => setMemoryMode(v as typeof MEMORY_MODES[number])} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMORY_MODES.map(mode => (
                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {memoryMode === 'Persistent' && (
            <Alert className="border-neon-amber/30">
              <AlertCircle className="h-4 w-4 text-neon-amber" />
              <AlertDescription className="text-xs">
                Persistent memory uses brain_memory tables. Ensure tables exist.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Provider Stack */}
        <div className="space-y-3">
          <Label>Provider Stack *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PROVIDERS.map(provider => (
              <div key={provider} className="flex items-center space-x-2">
                <Checkbox
                  id={`provider-${provider}`}
                  checked={providers.includes(provider)}
                  onCheckedChange={() => toggleProvider(provider)}
                  disabled={loading}
                />
                <label
                  htmlFor={`provider-${provider}`}
                  className="text-sm cursor-pointer"
                >
                  {provider}
                </label>
              </div>
            ))}
          </div>
          {providers.length === 0 && (
            <p className="text-xs text-destructive">Select at least one provider</p>
          )}
        </div>

        {/* Capabilities */}
        <div className="space-y-3">
          <Label>Capabilities *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAPABILITIES.map(cap => (
              <div key={cap} className="flex items-center space-x-2">
                <Checkbox
                  id={`cap-${cap}`}
                  checked={capabilities.includes(cap)}
                  onCheckedChange={() => toggleCapability(cap)}
                  disabled={loading}
                />
                <label
                  htmlFor={`cap-${cap}`}
                  className="text-sm cursor-pointer"
                >
                  {cap}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Format */}
        <div className="space-y-2">
          <Label>Delivery Format *</Label>
          <Select value={deliveryFormat} onValueChange={(v) => setDeliveryFormat(v as 'Repo' | 'Download')} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Download">Download Package</SelectItem>
              <SelectItem value="Repo">Push to GitHub Repo</SelectItem>
            </SelectContent>
          </Select>
          {deliveryFormat === 'Repo' && (
            <p className="text-xs text-muted-foreground">
              GitHub integration coming soon. Bot will be downloadable instead.
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleMint}
          disabled={loading || !botName.trim() || providers.length === 0 || capabilities.length === 0}
          className="w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Minting Bot...
            </>
          ) : (
            <>
              Mint Bot
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
