/**
 * Substrate Install Wizard — Complete restoration with customization
 * Guides users through industry selection, theme, branding, modules, AI providers, and quotas
 * v3.1 — Now with industry-optimized module presets
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Palette, Layout, Cpu, Key, Settings,
  ChevronRight, ChevronLeft, Check, Loader2, AlertTriangle,
  Building2, Image, Mail, Type, Gamepad2, Code, Briefcase, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WizardStep {
  id: string;
  title: string;
  icon: React.ElementType;
}

interface InstallConfig {
  industry: string;
  branding: {
    company_name: string;
    logo_url: string;
    tagline: string;
    support_email: string;
  };
  theme: string;
  layout: string;
  modules: Record<string, boolean>;
  ai_providers: Record<string, string>;
  quotas: {
    memory_hot_limit: number;
    memory_warm_limit: number;
    backup_retention_days: number;
    rate_limit_per_minute: number;
  };
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'industry', title: 'Industry', icon: Sparkles },
  { id: 'branding', title: 'Branding', icon: Building2 },
  { id: 'theme', title: 'Theme', icon: Palette },
  { id: 'layout', title: 'Layout', icon: Layout },
  { id: 'modules', title: 'Modules', icon: Cpu },
  { id: 'ai_providers', title: 'AI Keys', icon: Key },
  { id: 'quotas', title: 'Quotas', icon: Settings },
];

// Industry presets define which modules are enabled by default
const INDUSTRY_PRESETS = [
  {
    id: 'gaming',
    name: 'Video Game Development',
    icon: Gamepad2,
    description: 'NPC memory, dream cycles, world engines, and dialogue systems',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    enabledModules: ['core', 'ripple', 'access', 'brain', 'decode', 'dream', 'defense', 'system'],
    tagline: 'NPCs that remember and evolve',
  },
  {
    id: 'software',
    name: 'Software Development',
    icon: Code,
    description: 'RAG pipelines, AI agents, chatbots, and cognitive applications',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    enabledModules: ['core', 'ripple', 'access', 'brain', 'decode', 'nexus', 'defense', 'system'],
    tagline: 'Apps that think and learn',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Business',
    icon: Briefcase,
    description: 'Operations AI, institutional memory, workflow automation, LLM governance, and system integration',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    enabledModules: ['core', 'ripple', 'access', 'brain', 'vision', 'nexus', 'defense', 'system', 'evolution', 'integration'],
    tagline: 'Intelligence that scales',
  },
];

const THEMES = [
  { value: 'dark_professional', label: 'Dark Professional', emoji: '🌙', colors: ['#0a0a0f', '#06b6d4', '#22d3ee'] },
  { value: 'light_corporate', label: 'Light Corporate', emoji: '☀️', colors: ['#fafafa', '#3b82f6', '#60a5fa'] },
  { value: 'minimal_mono', label: 'Minimal Mono', emoji: '⚫', colors: ['#ffffff', '#171717', '#525252'] },
  { value: 'neon_cyber', label: 'Neon Cyber', emoji: '💜', colors: ['#1a1625', '#22c55e', '#a855f7'] },
];

const LAYOUTS = [
  { value: 'full_marketing', label: 'Full Marketing', description: 'Hero, features, modules, pricing, CTA' },
  { value: 'dashboard_only', label: 'Dashboard Only', description: 'Direct login, no marketing pages' },
  { value: 'minimal_landing', label: 'Minimal Landing', description: 'Simple hero with login CTA' },
];

const MODULES = [
  { key: 'core', name: 'Core Kernel', required: true, icon: '🔮', description: 'Scheduling & orchestration' },
  { key: 'ripple', name: 'Ripple Bus', required: true, icon: '🌊', description: 'Event messaging system' },
  { key: 'access', name: 'Access Layer', required: true, icon: '🔐', description: 'Identity & billing' },
  { key: 'brain', name: 'Brain', required: false, icon: '🧠', description: 'Persistent 3-tier memory' },
  { key: 'decode', name: 'Decode Chat', required: false, icon: '💬', description: 'Context-aware dialogue' },
  { key: 'defense', name: 'Defense', required: false, icon: '🛡️', description: 'Security & governance' },
  { key: 'nexus', name: 'Nexus Research', required: false, icon: '🔍', description: 'AI provider routing' },
  { key: 'vision', name: 'Vision', required: false, icon: '👁️', description: 'Analytics dashboard' },
  { key: 'dream', name: 'Dream', required: false, icon: '✨', description: 'Offline learning cycles' },
  { key: 'system', name: 'System', required: true, icon: '⚙️', description: 'Operations & backup' },
  { key: 'evolution', name: 'Evolution', required: false, icon: '🔄', description: 'Bounded self-evolution engine' },
  { key: 'integration', name: 'Integration', required: false, icon: '🔌', description: 'Enterprise adapters & LLM governance' },
];

const AI_PROVIDERS = [
  { key: 'GROQ_API_KEY', name: 'Groq', description: 'Fast inference' },
  { key: 'CEREBRAS_API_KEY', name: 'Cerebras', description: 'Ultra-fast Llama' },
  { key: 'DEEPSEEK_API_KEY', name: 'DeepSeek', description: 'Reasoning model' },
  { key: 'GOOGLE_AI_API_KEY', name: 'Google AI', description: 'Gemini models' },
  { key: 'OPENAI_API_KEY', name: 'OpenAI', description: 'GPT models' },
  { key: 'TOGETHER_API_KEY', name: 'Together AI', description: 'Open models' },
];

interface InstallWizardProps {
  packageData: any;
  onComplete: (config: InstallConfig) => void;
  onCancel: () => void;
}

export function InstallWizard({ packageData, onComplete, onCancel }: InstallWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  
  // Get initial modules based on default industry (gaming)
  const getDefaultModules = (industryId: string = 'gaming') => {
    const preset = INDUSTRY_PRESETS.find(p => p.id === industryId);
    const enabledModules = preset?.enabledModules || [];
    return Object.fromEntries(
      MODULES.map(m => [m.key, m.required || enabledModules.includes(m.key)])
    );
  };

  const [config, setConfig] = useState<InstallConfig>({
    industry: 'gaming',
    branding: {
      company_name: '',
      logo_url: '',
      tagline: '',
      support_email: '',
    },
    theme: 'dark_professional',
    layout: 'full_marketing',
    modules: getDefaultModules('gaming'),
    ai_providers: {},
    quotas: {
      memory_hot_limit: 1000,
      memory_warm_limit: 5000,
      backup_retention_days: 30,
      rate_limit_per_minute: 60,
    },
  });

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const step = WIZARD_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleInstall();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    // Simulate installation delay
    await new Promise(r => setTimeout(r, 2000));
    onComplete(config);
  };

  const updateBranding = (field: keyof InstallConfig['branding'], value: string) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
  };

  const toggleModule = (key: string) => {
    const module = MODULES.find(m => m.key === key);
    if (module?.required) return;
    setConfig(prev => ({
      ...prev,
      modules: { ...prev.modules, [key]: !prev.modules[key] }
    }));
  };

  const updateQuota = (field: keyof InstallConfig['quotas'], value: number) => {
    setConfig(prev => ({
      ...prev,
      quotas: { ...prev.quotas, [field]: value }
    }));
  };

  const updateApiKey = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      ai_providers: { ...prev.ai_providers, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-auto">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Package className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Substrate Installation Wizard</h1>
          <p className="text-muted-foreground text-sm">
            Configure your substrate in {WIZARD_STEPS.length} easy steps
          </p>
          {packageData?._manifest && (
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
              v{packageData._manifest.substrate_version} • {packageData._manifest.total_records?.toLocaleString()} records
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {WIZARD_STEPS.map((s, i) => (
              <div 
                key={s.id}
                className={cn(
                  "flex flex-col items-center gap-1 text-xs transition-colors",
                  i === currentStep ? "text-cyan-400" : i < currentStep ? "text-emerald-400" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
                  i === currentStep 
                    ? "border-cyan-500 bg-cyan-500/20" 
                    : i < currentStep 
                      ? "border-emerald-500 bg-emerald-500/20" 
                      : "border-white/10 bg-white/5"
                )}>
                  {i < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden sm:block">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <step.icon className="w-5 h-5 text-cyan-400" />
              {step.title}
            </CardTitle>
            <CardDescription>
              {step.id === 'branding' && 'Set your company identity'}
              {step.id === 'theme' && 'Choose your visual theme'}
              {step.id === 'layout' && 'Select your homepage layout'}
              {step.id === 'modules' && 'Activate substrate modules'}
              {step.id === 'ai_providers' && 'Configure AI API keys (optional)'}
              {step.id === 'quotas' && 'Set storage and rate limits'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Industry Step */}
                {step.id === 'industry' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Select your primary use case. This pre-configures the optimal modules for your industry.
                    </p>
                    <div className="grid gap-4">
                      {INDUSTRY_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              industry: preset.id,
                              modules: getDefaultModules(preset.id),
                              branding: {
                                ...prev.branding,
                                tagline: prev.branding.tagline || preset.tagline
                              }
                            }));
                          }}
                          className={cn(
                            "p-5 rounded-xl border text-left transition-all",
                            config.industry === preset.id
                              ? "border-primary bg-primary/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                              preset.color
                            )}>
                              <preset.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{preset.name}</span>
                                {config.industry === preset.id && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{preset.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {preset.enabledModules.slice(0, 5).map(mod => (
                                  <Badge key={mod} variant="outline" className="text-[10px]">
                                    {MODULES.find(m => m.key === mod)?.icon} {mod}
                                  </Badge>
                                ))}
                                {preset.enabledModules.length > 5 && (
                                  <Badge variant="outline" className="text-[10px]">
                                    +{preset.enabledModules.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branding Step */}
                {step.id === 'branding' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Company Name *
                        </Label>
                        <Input
                          value={config.branding.company_name}
                          onChange={(e) => updateBranding('company_name', e.target.value)}
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Logo URL
                        </Label>
                        <Input
                          value={config.branding.logo_url}
                          onChange={(e) => updateBranding('logo_url', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Tagline
                        </Label>
                        <Input
                          value={config.branding.tagline}
                          onChange={(e) => updateBranding('tagline', e.target.value)}
                          placeholder={INDUSTRY_PRESETS.find(p => p.id === config.industry)?.tagline || 'Your cognitive backbone'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Support Email
                        </Label>
                        <Input
                          type="email"
                          value={config.branding.support_email}
                          onChange={(e) => updateBranding('support_email', e.target.value)}
                          placeholder="support@acme.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Theme Step */}
                {step.id === 'theme' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setConfig(prev => ({ ...prev, theme: theme.value }))}
                        className={cn(
                          "p-4 rounded-lg border text-left transition-all",
                          config.theme === theme.value
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{theme.emoji}</span>
                          <span className="font-medium">{theme.label}</span>
                          {config.theme === theme.value && (
                            <Check className="w-4 h-4 text-cyan-400 ml-auto" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          {theme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border border-white/20"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Layout Step */}
                {step.id === 'layout' && (
                  <div className="space-y-4">
                    {LAYOUTS.map((layout) => (
                      <button
                        key={layout.value}
                        onClick={() => setConfig(prev => ({ ...prev, layout: layout.value }))}
                        className={cn(
                          "w-full p-4 rounded-lg border text-left transition-all",
                          config.layout === layout.value
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{layout.label}</p>
                            <p className="text-sm text-muted-foreground">{layout.description}</p>
                          </div>
                          {config.layout === layout.value && (
                            <Check className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Modules Step */}
                {step.id === 'modules' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {MODULES.map((module) => (
                      <div
                        key={module.key}
                        className={cn(
                          "p-3 rounded-lg border flex items-center justify-between",
                          module.required
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : config.modules[module.key]
                              ? "border-cyan-500/30 bg-cyan-500/5"
                              : "border-white/10 bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{module.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{module.name}</p>
                            {module.required && (
                              <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={config.modules[module.key]}
                          onCheckedChange={() => toggleModule(module.key)}
                          disabled={module.required}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Providers Step */}
                {step.id === 'ai_providers' && (
                  <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-400">API keys are optional</p>
                          <p className="text-muted-foreground text-xs">
                            You can configure these later in your project settings.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {AI_PROVIDERS.map((provider) => (
                        <div key={provider.key} className="space-y-1.5">
                          <Label className="text-sm">{provider.name} <span className="text-muted-foreground">— {provider.description}</span></Label>
                          <Input
                            type="password"
                            value={config.ai_providers[provider.key] || ''}
                            onChange={(e) => updateApiKey(provider.key, e.target.value)}
                            placeholder={`${provider.key}...`}
                            className="font-mono text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quotas Step */}
                {step.id === 'quotas' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Hot Memory Limit</Label>
                      <Input
                        type="number"
                        value={config.quotas.memory_hot_limit}
                        onChange={(e) => updateQuota('memory_hot_limit', parseInt(e.target.value) || 1000)}
                      />
                      <p className="text-xs text-muted-foreground">Maximum hot memory entries</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Warm Memory Limit</Label>
                      <Input
                        type="number"
                        value={config.quotas.memory_warm_limit}
                        onChange={(e) => updateQuota('memory_warm_limit', parseInt(e.target.value) || 5000)}
                      />
                      <p className="text-xs text-muted-foreground">Maximum warm memory entries</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Backup Retention (days)</Label>
                      <Input
                        type="number"
                        value={config.quotas.backup_retention_days}
                        onChange={(e) => updateQuota('backup_retention_days', parseInt(e.target.value) || 30)}
                      />
                      <p className="text-xs text-muted-foreground">How long to keep backups</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Rate Limit (req/min)</Label>
                      <Input
                        type="number"
                        value={config.quotas.rate_limit_per_minute}
                        onChange={(e) => updateQuota('rate_limit_per_minute', parseInt(e.target.value) || 60)}
                      />
                      <p className="text-xs text-muted-foreground">API requests per minute</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isInstalling || (step.id === 'branding' && !config.branding.company_name)}
            className="gap-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30"
          >
            {isInstalling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Installing...
              </>
            ) : currentStep === WIZARD_STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                Complete Installation
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
