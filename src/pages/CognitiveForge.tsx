/**
 * Cognitive Forge v3.0.0 — D-Mode Manufacturing
 * Multi-class cognitive minting with export, deploy, and registry
 * Neon-styled CMPSBL World Engine aesthetic
 */

import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Loader2, Hammer, Bot, Sparkles, Terminal, 
  Grid, ArrowRight, Zap, Package, Rocket
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedBotBuilder } from '@/components/forge/EnhancedBotBuilder';
import { MintedBotsList } from '@/components/forge/MintedBotsList';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { MintForgeToggle } from '@/components/navigation/MintForgeToggle';
import { cn } from '@/lib/utils';

export default function CognitiveForge() {
  const { user, loading: authLoading } = useAuth();
  const { role, isOperator, isGovernor, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('build');

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-transparent border border-amber-500/40 flex items-center justify-center mx-auto">
              <Hammer className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-xl bg-amber-500/20 blur-xl animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-mono text-amber-400">cognitive forge</p>
            <p className="text-xs text-muted-foreground font-mono animate-pulse">
              initializing mint chamber...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Governor-only (CMPSBL internal feature)
  if (!isGovernor) {
    return (
      <div className="min-h-screen bg-background">
        <OSHeader userEmail={user?.email} role={role} />
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-md mx-auto border-amber-500/30 bg-black/40 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Hammer className="w-16 h-16 text-amber-500/50" />
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Governor Access Required</h2>
              <p className="text-sm text-muted-foreground">
                The Cognitive Forge is an internal CMPSBL tool. Cognitives are available for purchase at $39 each.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Cognitive Forge — CMPSBL"
        description="Mint cognitive research bots with configurable attributes."
        canonical="https://cmpsbl.com/forge"
      />

      <OSHeader userEmail={user?.email} role={role} />

      {/* Neon Background Effects - Hidden on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/3 rounded-full blur-[150px]" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl relative z-10">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-fuchsia-500/10 border border-amber-500/50 flex items-center justify-center">
                  <Hammer className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-fuchsia-500/20 rounded-xl blur-lg -z-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Cognitive Forge
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  D-Mode manufacturing • multi-class cognitives
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mint/Forge Toggle */}
              <MintForgeToggle />
              
              {/* Catalog Link */}
              <Link to="/forge/catalog">
                <Button 
                  variant="outline" 
                  className="gap-2 border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10 group"
                >
                  <Grid className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Catalog</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-400 gap-1.5">
              <Package className="w-3 h-3" />
              ZIP Export
            </Badge>
            <Badge variant="outline" className="border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400 gap-1.5">
              <Zap className="w-3 h-3" />
              5 Bot Classes
            </Badge>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 gap-1.5">
              <Rocket className="w-3 h-3" />
              Cognitive Registry
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-black/40 border border-border/50">
            <TabsTrigger 
              value="build" 
              className={cn(
                "gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20",
                "data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Build Bot
            </TabsTrigger>
            <TabsTrigger 
              value="bots" 
              className={cn(
                "gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20",
                "data-[state=active]:border-cyan-500/50 data-[state=active]:text-cyan-400"
              )}
            >
              <Bot className="w-4 h-4" />
              Minted Bots
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="mt-6">
            <EnhancedBotBuilder onSuccess={() => setActiveTab('bots')} />
          </TabsContent>

          <TabsContent value="bots" className="mt-6">
            <MintedBotsList />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-black/40 backdrop-blur-sm px-4 py-3">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>promptfluid® cognitive forge</span>
          </div>
          <div className="flex items-center gap-4">
            <span>D-Mode</span>
            <Link to="/forge/catalog" className="hover:text-amber-400 transition-colors">catalog</Link>
            <Link to="/os" className="hover:text-cyan-400 transition-colors">world engine</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
