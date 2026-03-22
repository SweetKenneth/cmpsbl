/**
 * Agency Mint Wizard — Multi-step agency creation flow
 * Now with Governor self-mint option (free deployment)
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  ChevronRight, ChevronLeft, Users, Sparkles, Brain, 
  ShoppingCart, Check, Crown, Plus, Loader2, Shield 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { AgencyTemplateCard } from './AgencyTemplateCard';
import { AgencyMemberCard } from './AgencyMemberCard';
import { GovernorSelfMintDialog } from './GovernorSelfMintDialog';
import { 
  SPECIALIZATIONS, DREAM_POOL_MODES, SKILL_DIMENSIONS, DEFAULT_SKILL_WEIGHTS,
  type AgencyMember, type AgencyTemplate, type DreamPoolMode, type SkillWeights,
  AGENCY_BASE_PRICE, COGNITIVE_PRICE, calculateTotalPrice, formatPrice,
  getDefaultSkillsForSpec,
} from '@/lib/agency/agencyTypes';

type Step = 'template' | 'leader' | 'specialists' | 'skills' | 'memory' | 'preview' | 'checkout';

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'template', label: 'Template', icon: Sparkles },
  { id: 'leader', label: 'Leader', icon: Crown },
  { id: 'specialists', label: 'Team', icon: Users },
  { id: 'skills', label: 'Skills', icon: Brain },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'preview', label: 'Preview', icon: Check },
  { id: 'checkout', label: 'Checkout', icon: ShoppingCart },
];

interface AgencyMintWizardProps {
  onComplete?: (agencyId: string) => void;
}

export function AgencyMintWizard({ onComplete }: AgencyMintWizardProps) {
  const { isGovernor } = useUserRole();
  const [step, setStep] = useState<Step>('template');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<AgencyTemplate[]>([]);
  
  // Agency configuration
  const [agencyName, setAgencyName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState<boolean | null>(null);
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [dreamPoolMode, setDreamPoolMode] = useState<DreamPoolMode>('local_shared');

  // Ensure member has complete skillWeights using specialization defaults
  const ensureCompleteSkillWeights = (member: Partial<AgencyMember>): AgencyMember => {
    const specId = member.specialization || 'Coding';
    const defaultSkills = getDefaultSkillsForSpec(specId as any);
    
    return {
      role: member.role || 'specialist',
      specialization: specId as any,
      skillWeights: {
        research: member.skillWeights?.research ?? defaultSkills.research,
        analysis: member.skillWeights?.analysis ?? defaultSkills.analysis,
        execution: member.skillWeights?.execution ?? defaultSkills.execution,
        creativity: member.skillWeights?.creativity ?? defaultSkills.creativity,
        communication: member.skillWeights?.communication ?? defaultSkills.communication,
        strategy: member.skillWeights?.strategy ?? defaultSkills.strategy,
        technical: member.skillWeights?.technical ?? defaultSkills.technical,
        coordination: member.skillWeights?.coordination ?? defaultSkills.coordination,
      },
      ...(member.id && { id: member.id }),
      ...(member.cognitiveId && { cognitiveId: member.cognitiveId }),
    };
  };

  // Load templates
  useEffect(() => {
    async function loadTemplates() {
      const { data, error } = await supabase
        .from('agency_templates')
        .select('*')
        .order('is_featured', { ascending: false });
      
      if (!error && data) {
        setTemplates(data.map(t => {
          // Parse and normalize members with complete skill weights
          const rawMembers = Array.isArray(t.default_members) ? t.default_members : [];
          const normalizedMembers = rawMembers.map((m: unknown) => 
            ensureCompleteSkillWeights(m as Partial<AgencyMember>)
          );
          
          return {
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: t.description || '',
            icon: t.icon || 'Users',
            basePriceCents: t.base_price_cents || 39500,
            defaultMembers: normalizedMembers,
            dreamPoolMode: (t.dream_pool_mode as DreamPoolMode) || 'local_shared',
            isFeatured: t.is_featured || false,
          };
        }));
      }
    }
    loadTemplates();
  }, []);

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === step);
  
  // Calculate additional cognitives (excluding leader)
  const additionalCognitives = Math.max(0, members.filter(m => m.role === 'specialist').length);
  const totalPrice = calculateTotalPrice(additionalCognitives);

  // Calculate cohesion rating
  const cohesionRating = Math.min(100, 60 + (members.length * 8) + (dreamPoolMode === 'full_mesh' ? 10 : 0));

  // Add leader (mandatory Hybrid)
  const addLeader = () => {
    const leader: AgencyMember = {
      role: 'leader',
      specialization: 'Hybrid',
      skillWeights: getDefaultSkillsForSpec('Hybrid'),
    };
    setMembers([leader]);
  };

  // Add specialist
  const addSpecialist = (specialization: typeof SPECIALIZATIONS[number]['id']) => {
    if (specialization === 'Hybrid') return; // Can't add another hybrid as specialist
    const specialist: AgencyMember = {
      role: 'specialist',
      specialization,
      skillWeights: getDefaultSkillsForSpec(specialization),
    };
    setMembers(prev => [...prev, specialist]);
  };

  // Remove specialist
  const removeSpecialist = (index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  // Update skills
  const updateMemberSkills = (index: number, skills: AgencyMember['skillWeights']) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, skillWeights: skills } : m));
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Ensure all members have complete skill weights
      const normalizedMembers = template.defaultMembers.map(m => ensureCompleteSkillWeights(m));
      setMembers(normalizedMembers);
      setDreamPoolMode(template.dreamPoolMode);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!agencyName.trim()) {
      toast.error('Please enter an agency name');
      return;
    }
    
    setLoading(true);
    try {
      // Create agency record first
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          owner_id: user?.id,
          name: agencyName,
          template_id: selectedTemplate,
          dream_pool_mode: dreamPoolMode,
          cohesion_rating: cohesionRating,
          status: 'draft',
        })
        .select()
        .single();

      if (agencyError) throw agencyError;

      // Insert members
      if (agency && members.length > 0) {
        const { error: membersError } = await supabase
          .from('agency_members')
          .insert(members.map((m, i) => ({
            agency_id: agency.id,
            role: m.role,
            specialization: m.specialization,
            skill_weights: m.skillWeights,
            is_leader: m.role === 'leader',
            sort_order: i,
          })));

        if (membersError) {
          console.error('Members error:', membersError);
        }
      }

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-agency-checkout',
        {
          body: {
            agencyId: agency?.id,
            additionalCognitives,
            email: user?.email,
          },
        }
      );

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        window.open(checkoutData.url, '_blank');
        toast.success('Redirecting to checkout...');
        onComplete?.(agency?.id);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout');
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const canGoNext = () => {
    switch (step) {
      case 'template': return useTemplate !== null && (useTemplate === false || selectedTemplate);
      case 'leader': return members.some(m => m.role === 'leader');
      case 'specialists': return true;
      case 'skills': return true;
      case 'memory': return dreamPoolMode;
      case 'preview': return agencyName.trim().length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].id);
    }
  };

  const goBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(STEPS[idx - 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isPast = i < currentStepIndex;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => isPast && setStep(s.id)}
                disabled={!isPast}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                  isActive && "bg-neon-magenta/20 text-neon-magenta",
                  isPast && "text-neon-green cursor-pointer hover:bg-neon-green/10",
                  !isActive && !isPast && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  isActive && "bg-neon-magenta/30 border border-neon-magenta/50",
                  isPast && "bg-neon-green/30 border border-neon-green/50",
                  !isActive && !isPast && "bg-muted/30 border border-border/30"
                )}>
                  {isPast ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className="text-xs hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="border-border/30 bg-black/40 backdrop-blur-xl">
        <CardContent className="p-6">
          {/* Step 1: Template Selection */}
          {step === 'template' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Your Starting Point</h3>
                <p className="text-sm text-muted-foreground">
                  Start from a template or build a custom agency from scratch.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant={useTemplate === true ? 'default' : 'outline'}
                  onClick={() => setUseTemplate(true)}
                  className={cn(
                    "flex-1 h-auto py-4",
                    useTemplate === true && "bg-neon-magenta/20 border-neon-magenta/50 text-neon-magenta"
                  )}
                >
                  <div className="text-center">
                    <Sparkles className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Use Template</div>
                    <div className="text-xs text-muted-foreground">Pre-built teams</div>
                  </div>
                </Button>
                <Button
                  variant={useTemplate === false ? 'default' : 'outline'}
                  onClick={() => { setUseTemplate(false); addLeader(); }}
                  className={cn(
                    "flex-1 h-auto py-4",
                    useTemplate === false && "bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan"
                  )}
                >
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Custom Build</div>
                    <div className="text-xs text-muted-foreground">From scratch</div>
                  </div>
                </Button>
              </div>

              {useTemplate && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {templates.map((template) => (
                    <AgencyTemplateCard
                      key={template.id}
                      template={template}
                      selected={selectedTemplate === template.id}
                      onSelect={() => handleTemplateSelect(template.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Leader Selection */}
          {step === 'leader' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Agency Leader</h3>
                <p className="text-sm text-muted-foreground">
                  Every agency requires a Hybrid leader to coordinate the team.
                </p>
              </div>

              {members.filter(m => m.role === 'leader').map((member, i) => (
                <AgencyMemberCard
                  key={i}
                  member={member}
                  showSkills
                  onUpdateSkills={(skills) => updateMemberSkills(i, skills)}
                />
              ))}

              {!members.some(m => m.role === 'leader') && (
                <Button onClick={addLeader} className="w-full gap-2">
                  <Crown className="w-4 h-4" />
                  Add Hybrid Leader
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Specialists */}
          {step === 'specialists' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Add Specialists</h3>
                <p className="text-sm text-muted-foreground">
                  Build your team with specialized cognitives. Each additional cognitive is {formatPrice(COGNITIVE_PRICE)}.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {SPECIALIZATIONS.filter(s => s.id !== 'Hybrid').map((spec) => {
                  const alreadyAdded = members.some(m => m.specialization === spec.id);
                  return (
                    <Button
                      key={spec.id}
                      variant="outline"
                      size="sm"
                      disabled={alreadyAdded}
                      onClick={() => addSpecialist(spec.id)}
                      className={cn(
                        "gap-1",
                        alreadyAdded && "opacity-50"
                      )}
                    >
                      <Plus className="w-3 h-3" />
                      {spec.name}
                    </Button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {members.map((member, i) => (
                  <AgencyMemberCard
                    key={i}
                    member={member}
                    onRemove={member.role !== 'leader' ? () => removeSpecialist(i) : undefined}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Skills */}
          {step === 'skills' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Configure Skills</h3>
                <p className="text-sm text-muted-foreground">
                  Fine-tune each cognitive's skill weights for optimal team performance.
                </p>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {members.map((member, i) => (
                    <AgencyMemberCard
                      key={i}
                      member={member}
                      showSkills
                      onUpdateSkills={(skills) => updateMemberSkills(i, skills)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Step 5: Memory Mode */}
          {step === 'memory' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Shared Dream Pool</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how your agency shares memory and insights.
                </p>
              </div>

              <RadioGroup value={dreamPoolMode} onValueChange={(v) => setDreamPoolMode(v as DreamPoolMode)}>
                <div className="grid gap-3">
                  {DREAM_POOL_MODES.map((mode) => (
                    <label
                      key={mode.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                        "backdrop-blur-xl bg-white/5",
                        dreamPoolMode === mode.id
                          ? "border-neon-cyan/50 bg-neon-cyan/10"
                          : "border-border/30 hover:border-border/50"
                      )}
                    >
                      <RadioGroupItem value={mode.id} className="mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">{mode.name}</div>
                        <div className="text-xs text-muted-foreground">{mode.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 6: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Agency Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Review your agency configuration before checkout.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Agency Name *</Label>
                  <Input
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g., Growth Division Alpha"
                    className="mt-1 bg-black/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-black/30 border border-border/20">
                  <div>
                    <p className="text-xs text-muted-foreground">Team Size</p>
                    <p className="text-lg font-semibold">{members.length} cognitives</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cohesion Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-neon-green">{cohesionRating}%</p>
                      <Badge variant="outline" className="text-[9px] border-neon-green/30 text-neon-green">
                        {cohesionRating >= 80 ? 'High' : cohesionRating >= 60 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Memory Mode</p>
                    <p className="text-sm font-medium">{DREAM_POOL_MODES.find(m => m.id === dreamPoolMode)?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leader</p>
                    <p className="text-sm font-medium">Hybrid+</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {members.map((m, i) => (
                    <AgencyMemberCard key={i} member={m} compact />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Checkout */}
          {step === 'checkout' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Checkout</h3>
                <p className="text-sm text-muted-foreground">
                  {isGovernor 
                    ? 'Choose to deploy for free or proceed with Stripe checkout.'
                    : 'Complete your purchase to deploy your agency.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-border/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Agency Base Package</span>
                  <span className="font-medium">{formatPrice(AGENCY_BASE_PRICE)}</span>
                </div>
                {additionalCognitives > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{additionalCognitives}x Additional Cognitives</span>
                    <span className="font-medium">{formatPrice(additionalCognitives * COGNITIVE_PRICE)}</span>
                  </div>
                )}
                <Separator className="bg-border/20" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-neon-magenta">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Governor Self-Mint Option */}
              {isGovernor && (
                <div className="p-4 rounded-xl bg-neon-magenta/10 border border-neon-magenta/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neon-magenta" />
                    <span className="font-medium text-neon-magenta">Governor Privilege</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    As a Governor, you can deploy this agency for free and set owner credentials directly.
                  </p>
                  <GovernorSelfMintDialog
                    agencyName={agencyName}
                    members={members}
                    dreamPoolMode={dreamPoolMode}
                    cohesionRating={cohesionRating}
                    templateId={selectedTemplate}
                    onComplete={(id) => onComplete?.(id)}
                    disabled={!agencyName.trim()}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/20"
                    >
                      <Shield className="w-4 h-4" />
                      Self-Mint (Free Deploy)
                    </Button>
                  </GovernorSelfMintDialog>
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>🔒 Secure checkout powered by Stripe</p>
                <p>One-time purchase • Lifetime access • Export anytime</p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading || !agencyName.trim()}
                className="w-full h-12 text-lg bg-gradient-to-r from-neon-magenta to-neon-purple hover:from-neon-magenta hover:to-neon-purple"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Purchase Agency — {formatPrice(totalPrice)}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {step !== 'checkout' && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={goNext}
            disabled={!canGoNext()}
            className="gap-2 bg-neon-magenta hover:bg-neon-magenta"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
