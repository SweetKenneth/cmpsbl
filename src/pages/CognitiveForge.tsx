/**
 * Cognitive Forge — Bot Minting Interface
 * Operator-only tool for creating cognitive research bots
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, Hammer, Download, Github, ChevronRight, Bot, Sparkles } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BotBuilder } from '@/components/forge/BotBuilder';
import { MintedBotsList } from '@/components/forge/MintedBotsList';
import { OSHeader } from '@/components/substrate-os/OSHeader';

export default function CognitiveForge() {
  const { user, loading: authLoading } = useAuth();
  const { role, isOperator, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('build');

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground font-mono">Loading Forge...</p>
        </div>
      </div>
    );
  }

  if (!isOperator) {
    return (
      <div className="min-h-screen bg-background">
        <OSHeader userEmail={user?.email} role={role} />
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-8">
              <Hammer className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">Operator Access Required</h2>
              <p className="text-sm text-muted-foreground">
                The Cognitive Forge is only available to Operators and Governors.
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
        title="Cognitive Forge — promptfluid®"
        description="Mint cognitive research bots with configurable attributes."
        canonical="https://promptfluid.com/forge"
      />

      <OSHeader userEmail={user?.email} role={role} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
              <Hammer className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cognitive Forge</h1>
              <p className="text-sm text-muted-foreground">Mint research bots on demand</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="build" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Build Bot
            </TabsTrigger>
            <TabsTrigger value="bots" className="gap-2">
              <Bot className="w-4 h-4" />
              Minted Bots
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build">
            <BotBuilder onSuccess={() => setActiveTab('bots')} />
          </TabsContent>

          <TabsContent value="bots">
            <MintedBotsList />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/30 bg-muted/10 px-4 py-2">
        <div className="container mx-auto max-w-5xl flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>promptfluid® cognitive forge</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
