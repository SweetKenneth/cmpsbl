/**
 * Agency Mint Page — Governor-only access
 * Main page for creating and managing agencies
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, ChevronLeft, Lock, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AgencyMintWizard } from '@/components/agency/AgencyMintWizard';
import { AgencyGallery } from '@/components/agency/AgencyGallery';
import { MintForgeToggle } from '@/components/navigation/MintForgeToggle';
import { cn } from '@/lib/utils';

export default function AgencyMint() {
  const { user, loading: authLoading } = useAuth();
  const { role, isGovernor, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create');

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center mx-auto animate-pulse">
            <Users className="w-8 h-8 text-fuchsia-400" />
          </div>
          <p className="text-sm text-muted-foreground font-mono animate-pulse">
            initializing agency mint...
          </p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-500/30 bg-black/40">
          <CardContent className="py-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to access the Agency Mint.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Governor access required
  if (!isGovernor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/30 bg-black/40">
          <CardContent className="py-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Governor Access Required</h2>
            <p className="text-sm text-muted-foreground mb-6">
              The Agency Mint is only available to Governors (admins).
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link to="/os">Back to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link to="/forge">Go to Forge</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Agency Mint — CMPSBL"
        description="Create and deploy AI agencies with specialized cognitive teams."
        canonical="https://cmpsbl.com/agency"
      />

      {/* Header */}
      <div className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/os">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <ChevronLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
                  <Users className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold">Agency Mint</h1>
                  <p className="text-[10px] text-muted-foreground">Governor Access</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MintForgeToggle />
              <Badge variant="outline" className="text-[10px] border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/10">
                GOVERNOR
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'gallery')}>
          <TabsList className="mb-6 bg-black/40 border border-border/30">
            <TabsTrigger 
              value="create" 
              className={cn(
                "gap-2 data-[state=active]:bg-fuchsia-500/20",
                "data-[state=active]:text-fuchsia-400"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Create Agency
            </TabsTrigger>
            <TabsTrigger 
              value="gallery"
              className={cn(
                "gap-2 data-[state=active]:bg-cyan-500/20",
                "data-[state=active]:text-cyan-400"
              )}
            >
              <Users className="w-4 h-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <AgencyMintWizard onComplete={() => setActiveTab('gallery')} />
          </TabsContent>

          <TabsContent value="gallery">
            <AgencyGallery />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground font-mono">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
          <span>CMPSBL® agency mint</span>
        </div>
      </footer>
    </div>
  );
}
