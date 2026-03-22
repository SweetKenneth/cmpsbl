/**
 * Governor Self-Mint Dialog — Admin-only agency creation without payment
 * Auto-generates slug from agency name for hosted deployments
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Shield, Lock, Loader2, Check, Users, Mail, Link as LinkIcon, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { isValidEmail } from '@/utils/validators';
import { cn } from '@/lib/utils';
import { generateSlug, getAgencyPortalUrl } from '@/lib/agency/slugUtils';
import type { AgencyMember, DreamPoolMode } from '@/lib/agency/agencyTypes';

interface GovernorSelfMintDialogProps {
  agencyName: string;
  members: AgencyMember[];
  dreamPoolMode: DreamPoolMode;
  cohesionRating: number;
  templateId?: string | null;
  onComplete?: (agencyId: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

type DeploymentType = 'standalone' | 'embedded' | 'hosted';

export function GovernorSelfMintDialog({
  agencyName,
  members,
  dreamPoolMode,
  cohesionRating,
  templateId,
  onComplete,
  disabled,
  children,
}: GovernorSelfMintDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  
  // Credentials
  const [userEmail, setUserEmail] = useState('');
  
  // Deployment
  const [deploymentType, setDeploymentType] = useState<DeploymentType>('hosted');
  
  // Business Profile
  const [companyName, setCompanyName] = useState('');
  const [businessDomain, setBusinessDomain] = useState('');

  const copyPortalUrl = () => {
    if (deployedUrl) {
      navigator.clipboard.writeText(deployedUrl);
      toast.success('URL copied to clipboard');
    }
  };

  const resetForm = () => {
    setUserEmail('');
    setCompanyName('');
    setBusinessDomain('');
    setDeployedUrl(null);
  };

  const handleSelfMint = async () => {
    if (!agencyName.trim()) {
      toast.error('Agency name is required');
      return;
    }
    
    if (!userEmail || !isValidEmail(userEmail)) {
      toast.error('Valid email is required');
      return;
    }
    
    
    setLoading(true);
    
    try {
      // Get the current Governor's session first (before any auth changes)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('You must be logged in as a Governor to self-mint');
      }
      
      const governorId = currentUser.id;
      
      // Auto-generate unique slug from agency name with uniqueness check
      let agencySlug = generateSlug(agencyName);
      
      // Check if slug exists and make it unique
      const { data: existingSlug } = await supabase
        .from('agencies')
        .select('slug')
        .eq('slug', agencySlug)
        .maybeSingle();
        
      if (existingSlug) {
        agencySlug = `${agencySlug}-${Date.now().toString(36)}`;
      }
      
      const portalUrl = getAgencyPortalUrl(agencySlug);
      
      // For RLS to work, set owner_id to the current user (Governor) who is making the insert
      
      // 2. Create the agency record (status = deployed, since Governor is self-minting)
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          owner_id: governorId,
          name: agencyName,
          slug: agencySlug,
          template_id: templateId,
          dream_pool_mode: dreamPoolMode,
          cohesion_rating: cohesionRating,
          status: 'deployed',
          deployment_type: deploymentType,
          deployment_domain: deploymentType === 'hosted' ? portalUrl : null,
          business_profile: {
            companyName: companyName || agencyName,
            domain: businessDomain || null,
            ownerEmail: userEmail,
          },
          metadata: {
            target_owner_email: userEmail,
            created_by_governor: governorId,
          },
        })
        .select()
        .single();

      if (agencyError) throw agencyError;

      // 3. Insert members
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
        
        // Set leader ID on agency
        const leaderMember = members.find(m => m.role === 'leader');
        if (leaderMember) {
          const { data: insertedMembers } = await supabase
            .from('agency_members')
            .select('id')
            .eq('agency_id', agency.id)
            .eq('is_leader', true)
            .single();
            
          if (insertedMembers) {
            await supabase
              .from('agencies')
              .update({ leader_id: insertedMembers.id })
              .eq('id', agency.id);
          }
        }
      }

      // 4. Create a purchase record (free, governor-minted)
      await supabase
        .from('agency_purchases')
        .insert({
          user_id: governorId,
          agency_id: agency?.id,
          base_price_cents: 0,
          additional_cognitives: Math.max(0, members.filter(m => m.role === 'specialist').length),
          additional_price_cents: 0,
          total_price_cents: 0,
          status: 'completed',
          purchase_email: userEmail,
          onboarding_completed: true,
          metadata: {
            governor_minted: true,
            minted_by: governorId,
            minted_at: new Date().toISOString(),
            target_owner_email: userEmail,
          },
        });
      
      // Store deployed URL for success UI
      if (deploymentType === 'hosted') {
        setDeployedUrl(portalUrl);
        toast.success(`Agency "${agencyName}" deployed successfully!`, {
          description: `Portal ready at ${portalUrl}`,
        });
      } else {
        toast.success(`Agency "${agencyName}" deployed!`, {
          description: `Owner credentials: ${userEmail}`,
        });
        setOpen(false);
        resetForm();
        onComplete?.(agency?.id);
      }
      
    } catch (error) {
      console.error('Self-mint error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint agency');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleDone = () => {
    handleClose();
    onComplete?.('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-black/95 border-neon-magenta/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-neon-magenta" />
            Governor Self-Mint
          </DialogTitle>
          <DialogDescription>
            Deploy this agency directly without payment. Set owner credentials below.
          </DialogDescription>
        </DialogHeader>

        {/* Success State */}
        {deployedUrl ? (
          <div className="space-y-4 py-4">
            <div className="space-y-3 p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
              <div className="flex items-center gap-2 text-neon-green">
                <Check className="w-5 h-5" />
                <span className="font-medium">Agency Deployed!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your agency is now live and accessible at:
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-neon-green flex-1 truncate bg-black/30 px-3 py-2 rounded">
                  {deployedUrl}
                </code>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyPortalUrl}
                  className="shrink-0 gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline"
                  className="flex-1" 
                  onClick={() => window.open(deployedUrl, '_blank')}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Open Portal
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleDone}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-5 py-4">
              {/* Agency Summary */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neon-magenta" />
                  <span className="font-medium">{agencyName || 'Unnamed Agency'}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-neon-magenta/50 text-neon-magenta">
                  {members.length} cognitives
                </Badge>
              </div>

              {/* Owner Credentials */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="w-4 h-4 text-neon-cyan" />
                  Owner Credentials
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="owner@company.com"
                      className="pl-10 bg-black/30"
                    />
                  </div>
                </div>
                
                <p className="text-[10px] text-muted-foreground">
                  Owner will receive access instructions via this email.
                </p>
              </div>

              {/* Deployment Type */}
              <div className="space-y-3">
                <Label>Deployment Type</Label>
                <RadioGroup 
                  value={deploymentType} 
                  onValueChange={(v) => setDeploymentType(v as DeploymentType)}
                  className="grid grid-cols-3 gap-2"
                >
                  {(['standalone', 'embedded', 'hosted'] as const).map((type) => (
                    <label
                      key={type}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all",
                        "text-xs capitalize",
                        deploymentType === type
                          ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                          : "border-border/30 hover:border-border/50"
                      )}
                    >
                      <RadioGroupItem value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Hosted deployment info */}
              {deploymentType === 'hosted' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                  <LinkIcon className="w-4 h-4 text-neon-cyan shrink-0" />
                  <div className="text-xs text-neon-cyan">
                    A unique portal URL will be auto-generated from your agency name.
                  </div>
                </div>
              )}

              {/* Business Profile */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Optional"
                    className="bg-black/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bizDomain">Business Domain</Label>
                  <Input
                    id="bizDomain"
                    value={businessDomain}
                    onChange={(e) => setBusinessDomain(e.target.value)}
                    placeholder="example.com"
                    className="bg-black/30"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSelfMint}
                disabled={loading || !agencyName.trim() || !userEmail}
                className="gap-2 bg-gradient-to-r from-neon-magenta to-neon-purple hover:from-neon-magenta hover:to-neon-purple"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Deploy Agency (Free)
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}