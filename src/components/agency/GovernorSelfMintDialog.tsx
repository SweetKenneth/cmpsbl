/**
 * Governor Self-Mint Dialog — Admin-only agency creation without payment
 * Allows setting credentials and deploying directly
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Shield, Lock, Eye, EyeOff, Loader2, Check, Users, Mail } from 'lucide-react';
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
  
  // Credentials
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Deployment
  const [deploymentType, setDeploymentType] = useState<DeploymentType>('standalone');
  const [deploymentDomain, setDeploymentDomain] = useState('');
  
  // Business Profile
  const [companyName, setCompanyName] = useState('');
  const [businessDomain, setBusinessDomain] = useState('');

  const handleSelfMint = async () => {
    if (!agencyName.trim()) {
      toast.error('Agency name is required');
      return;
    }
    
    if (!userEmail || !isValidEmail(userEmail)) {
      toast.error('Valid email is required');
      return;
    }
    
    if (userPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // 1. Create user account for the agency owner
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
        options: {
          data: {
            agency_owner: true,
            created_by_governor: currentUser?.id,
          },
        },
      });
      
      if (signUpError) {
        // If user exists, we can still proceed with agency creation
        if (!signUpError.message.includes('already registered')) {
          throw signUpError;
        }
      }
      
      // 2. Create the agency record (status = deployed, since Governor is self-minting)
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          owner_id: newUser?.user?.id || currentUser?.id,
          name: agencyName,
          template_id: templateId,
          dream_pool_mode: dreamPoolMode,
          cohesion_rating: cohesionRating,
          status: 'deployed',
          deployment_type: deploymentType,
          deployment_domain: deploymentDomain || null,
          business_profile: {
            companyName: companyName || agencyName,
            domain: businessDomain || null,
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
          user_id: newUser?.user?.id || currentUser?.id,
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
            minted_by: currentUser?.id,
            minted_at: new Date().toISOString(),
          },
        });
      
      toast.success(`Agency "${agencyName}" deployed successfully!`, {
        description: `Credentials sent to ${userEmail}`,
      });
      
      setOpen(false);
      onComplete?.(agency?.id);
      
      // Reset form
      setUserEmail('');
      setUserPassword('');
      setCompanyName('');
      setBusinessDomain('');
      setDeploymentDomain('');
      
    } catch (error) {
      console.error('Self-mint error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint agency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-black/95 border-fuchsia-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-fuchsia-400" />
            Governor Self-Mint
          </DialogTitle>
          <DialogDescription>
            Deploy this agency directly without payment. Set owner credentials below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Agency Summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-fuchsia-400" />
              <span className="font-medium">{agencyName || 'Unnamed Agency'}</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-fuchsia-500/50 text-fuchsia-400">
              {members.length} cognitives
            </Badge>
          </div>

          {/* Owner Credentials */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="w-4 h-4 text-cyan-400" />
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="pl-10 pr-10 bg-black/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Owner will use these credentials to access the agency.
              </p>
            </div>
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
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-border/30 hover:border-border/50"
                  )}
                >
                  <RadioGroupItem value={type} className="sr-only" />
                  {type}
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Optional Domain */}
          {deploymentType === 'hosted' && (
            <div className="space-y-2">
              <Label htmlFor="domain">Deployment Domain</Label>
              <Input
                id="domain"
                value={deploymentDomain}
                onChange={(e) => setDeploymentDomain(e.target.value)}
                placeholder="agency.example.com"
                className="bg-black/30"
              />
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSelfMint}
            disabled={loading || !agencyName.trim() || !userEmail || userPassword.length < 8}
            className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500"
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
      </DialogContent>
    </Dialog>
  );
}
