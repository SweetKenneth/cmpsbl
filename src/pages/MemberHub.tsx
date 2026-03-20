/**
 * Member Hub — Central page for paid member perks
 * Usage Dashboard, Saved Workflows, Priority Status, Exports, Referrals
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { cn } from '@/lib/utils';
import {
  Crown, BarChart3, Workflow, Zap, Download, Gift,
  Lock, ArrowRight, Shield,
} from 'lucide-react';

import { UsageDashboard } from '@/components/member/UsageDashboard';
import { SavedWorkflows } from '@/components/member/SavedWorkflows';
import { PriorityStatus } from '@/components/member/PriorityStatus';
import { ExportCenter } from '@/components/member/ExportCenter';
import { ReferralCenter } from '@/components/member/ReferralCenter';

const TABS = [
  { value: 'dashboard', label: 'Dashboard', icon: BarChart3, minTier: 'free' },
  { value: 'workflows', label: 'Workflows', icon: Workflow, minTier: 'creator' },
  { value: 'priority', label: 'Priority', icon: Zap, minTier: 'creator' },
  { value: 'exports', label: 'Exports', icon: Download, minTier: 'studio' },
  { value: 'referrals', label: 'Referrals', icon: Gift, minTier: 'creator' },
] as const;

const TIER_NAMES: Record<string, string> = {
  free: 'Builder', builder: 'Builder', starter: 'Builder',
  creator: 'Creator', studio: 'Studio',
  architect: 'Architect', pro: 'Architect',
  enterprise: 'Architect', governor: 'Governor',
};

const TIER_PRIORITY: Record<string, number> = {
  free: 0, builder: 0, starter: 0, creator: 1, studio: 2, architect: 3, pro: 3, enterprise: 4, governor: 5,
};

function canAccess(currentTier: string, minTier: string): boolean {
  return (TIER_PRIORITY[currentTier] ?? 0) >= (TIER_PRIORITY[minTier] ?? 0);
}

export default function MemberHub() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { tier } = useEngineSubscription();
  const [activeTab, setActiveTab] = useState('dashboard');

  const effectiveTier = tier || 'free';
  const tierName = TIER_NAMES[effectiveTier] || 'Builder';

  if (!user) {
    return (
      <>
        <PublicNav />
        <main className="min-h-screen pt-24 pb-24 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto px-4">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Member Area</h1>
            <p className="text-muted-foreground">Sign in to access your member dashboard, workflows, and perks.</p>
            <Button asChild>
              <Link to="/auth">Sign In <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </main>
        <EnhancedFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Member Hub — Your Dashboard & Perks | CMPSBL</title>
        <meta name="description" content="Access your usage dashboard, saved workflows, priority routing status, export center, and referral credits." />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 px-3 py-1">
              <Crown className="w-3 h-3 mr-1.5" />
              <span className="text-xs font-semibold">{tierName} Member</span>
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-3">
              Member{' '}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                Hub
              </span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your command center for usage metrics, workflows, and member perks.
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <TabsList className="h-12 p-1.5 bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl gap-1 shadow-lg overflow-x-auto no-scrollbar">
                {TABS.map(({ value, label, icon: Icon, minTier }) => {
                  const locked = !canAccess(effectiveTier, minTier);
                  return (
                    <TabsTrigger
                      key={value}
                      value={value}
                      disabled={locked}
                      className={cn(
                        "gap-1.5 px-3 sm:px-5 h-9 rounded-xl text-xs font-bold transition-all relative",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                        locked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {locked ? <Lock className="w-3 h-3" /> : <Icon className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </motion.div>

            <TabsContent value="dashboard">
              <UsageDashboard tier={effectiveTier} />
            </TabsContent>

            <TabsContent value="workflows">
              <SavedWorkflows tier={effectiveTier} />
            </TabsContent>

            <TabsContent value="priority">
              <PriorityStatus tier={effectiveTier} />
            </TabsContent>

            <TabsContent value="exports">
              <ExportCenter tier={effectiveTier} />
            </TabsContent>

            <TabsContent value="referrals">
              <ReferralCenter tier={effectiveTier} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}
