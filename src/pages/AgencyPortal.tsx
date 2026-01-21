/**
 * Agency Portal — Public-facing agency interface
 * Hosts deployed agencies at /a/:slug
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Brain, MessageSquare, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AgencyChatInterface } from '@/components/agency/AgencyChatInterface';
import { SPECIALIZATIONS, DREAM_POOL_MODES } from '@/lib/agency/agencyTypes';
import { cn } from '@/lib/utils';

interface AgencyData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  dream_pool_mode: string;
  cohesion_rating: number;
  owner_id: string;
  business_profile: {
    companyName?: string;
    domain?: string;
  } | null;
}

interface AgencyMemberData {
  id: string;
  role: string;
  specialization: string;
  is_leader: boolean;
  skill_weights: Record<string, number>;
}

export default function AgencyPortal() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [members, setMembers] = useState<AgencyMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    async function loadAgency() {
      if (!slug) {
        setError('Agency not found');
        setLoading(false);
        return;
      }

      try {
        // Load agency by slug
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'deployed')
          .single();

        if (agencyError || !agencyData) {
          setError('Agency not found or not deployed');
          setLoading(false);
          return;
        }

        setAgency(agencyData as AgencyData);

        // Load members
        const { data: membersData } = await supabase
          .from('agency_members')
          .select('*')
          .eq('agency_id', agencyData.id)
          .order('sort_order');

        setMembers((membersData || []) as AgencyMemberData[]);
      } catch (err) {
        console.error('Error loading agency:', err);
        setError('Failed to load agency');
      } finally {
        setLoading(false);
      }
    }

    loadAgency();
  }, [slug]);

  // Check if user is the owner
  const isOwner = user?.id === agency?.owner_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-fuchsia-400" />
          <p className="text-sm text-muted-foreground font-mono">loading agency...</p>
        </div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/30 bg-black/40">
          <CardContent className="py-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Agency Not Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || 'This agency does not exist or is not publicly available.'}
            </p>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leader = members.find(m => m.is_leader);
  const specialists = members.filter(m => !m.is_leader);
  const dreamMode = DREAM_POOL_MODES.find(m => m.id === agency.dream_pool_mode);

  // If showing chat, render full-screen chat interface
  if (showChat) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title={`Chat with ${agency.name} — promptfluid®`}
          description={`Interact with ${agency.name} cognitive agency.`}
        />
        
        <header className="border-b border-border/40 bg-black/60 backdrop-blur-md sticky top-0 z-50">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowChat(false)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="h-4 w-px bg-border/50" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-fuchsia-400" />
                  </div>
                  <span className="font-semibold text-sm">{agency.name}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container max-w-4xl mx-auto px-4 py-4">
          <AgencyChatInterface
            agency={{
              id: agency.id,
              name: agency.name,
              description: agency.description || '',
              status: agency.status as 'deployed',
              dreamPoolMode: agency.dream_pool_mode as any,
              cohesionRating: agency.cohesion_rating,
              ownerId: agency.owner_id,
              deploymentType: 'hosted',
              businessProfile: agency.business_profile || {},
              members: members.map(m => ({
                id: m.id,
                role: m.role as 'leader' | 'specialist',
                specialization: m.specialization as any,
                skillWeights: m.skill_weights as any,
              })),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${agency.name} — promptfluid®`}
        description={`${agency.name} cognitive agency powered by promptfluid®`}
      />

      {/* Header */}
      <header className="border-b border-border/40 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 border border-fuchsia-500/40 flex items-center justify-center">
                <Users className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div>
                <h1 className="font-semibold">{agency.name}</h1>
                <p className="text-[10px] text-muted-foreground">
                  {agency.business_profile?.companyName || 'Cognitive Agency'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400">
                {agency.cohesion_rating}% Cohesion
              </Badge>
              {isOwner && (
                <Badge variant="outline" className="text-[10px] border-fuchsia-500/50 text-fuchsia-400">
                  Owner
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Team Overview */}
        <Card className="border-border/30 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              Team Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Leader */}
            {leader && (
              <div className="p-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-fuchsia-500/50 text-fuchsia-400">
                      Leader
                    </Badge>
                    <span className="font-medium">
                      {SPECIALIZATIONS.find(s => s.id === leader.specialization)?.name || leader.specialization}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {SPECIALIZATIONS.find(s => s.id === leader.specialization)?.description}
                </p>
              </div>
            )}

            {/* Specialists */}
            <div className="grid gap-3 sm:grid-cols-2">
              {specialists.map((member) => {
                const spec = SPECIALIZATIONS.find(s => s.id === member.specialization);
                return (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{spec?.name || member.specialization}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {spec?.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Memory Mode */}
            <div className="pt-4 border-t border-border/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Memory Mode:</span>
                <span className="font-medium">{dreamMode?.name || agency.dream_pool_mode}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat CTA */}
        <Button
          onClick={() => setShowChat(true)}
          size="lg"
          className="w-full h-14 text-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 gap-3"
        >
          <MessageSquare className="w-5 h-5" />
          Chat with {agency.name}
        </Button>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center">
        <p className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
          powered by promptfluid®
        </p>
      </footer>
    </div>
  );
}
