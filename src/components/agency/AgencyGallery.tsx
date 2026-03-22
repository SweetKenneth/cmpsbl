/**
 * Agency Gallery — Manage created agencies with chat access
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Users, Download, Copy, Trash2, Edit, MoreVertical, 
  ExternalLink, RefreshCw, Loader2, MessageCircle, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AgencyMemberCard } from './AgencyMemberCard';
import { AgencyChatInterface } from './AgencyChatInterface';
import type { Agency, AgencyMember } from '@/lib/agency/agencyTypes';
import { getDefaultSkillsForSpec, type Specialization } from '@/lib/agency/agencyTypes';

interface AgencyGalleryProps {
  onEdit?: (agencyId: string) => void;
}

export function AgencyGallery({ onEdit }: AgencyGalleryProps) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [chatAgency, setChatAgency] = useState<Agency | null>(null);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const { data: agenciesData, error } = await supabase
        .from('agencies')
        .select(`
          *,
          agency_members (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (agenciesData || []).map(a => ({
        id: a.id,
        ownerId: a.owner_id,
        name: a.name,
        description: a.description,
        templateId: a.template_id,
        leaderId: a.leader_id,
        dreamPoolMode: a.dream_pool_mode as Agency['dreamPoolMode'],
        cohesionRating: a.cohesion_rating || 80,
        status: a.status as Agency['status'],
        deploymentType: a.deployment_type as Agency['deploymentType'],
        deploymentDomain: a.deployment_domain,
        businessProfile: (a.business_profile as Agency['businessProfile']) || {},
        members: (Array.isArray(a.agency_members) ? a.agency_members : []).map((m: any) => {
          const spec = m.specialization as Specialization;
          const defaultSkills = getDefaultSkillsForSpec(spec);
          return {
            id: m.id,
            role: m.role as 'leader' | 'specialist',
            specialization: m.specialization,
            skillWeights: m.skill_weights || defaultSkills,
            cognitiveId: m.cognitive_id,
          };
        }),
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));

      setAgencies(mapped);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load agencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setAgencies(prev => prev.filter(a => a.id !== deleteId));
      toast.success('Agency deleted');
    } catch (error) {
      toast.error('Failed to delete agency');
    } finally {
      setDeleteId(null);
    }
  };

  const handleRename = async () => {
    if (!renameId || !newName.trim()) return;
    try {
      const { error } = await supabase
        .from('agencies')
        .update({ name: newName.trim() })
        .eq('id', renameId);

      if (error) throw error;
      
      setAgencies(prev => prev.map(a => 
        a.id === renameId ? { ...a, name: newName.trim() } : a
      ));
      toast.success('Agency renamed');
    } catch (error) {
      toast.error('Failed to rename agency');
    } finally {
      setRenameId(null);
      setNewName('');
    }
  };

  const handleDuplicate = async (agency: Agency) => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .insert({
          name: `${agency.name} (Copy)`,
          template_id: agency.templateId,
          dream_pool_mode: agency.dreamPoolMode,
          cohesion_rating: agency.cohesionRating,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      if (data && agency.members.length > 0) {
        await supabase
          .from('agency_members')
          .insert(agency.members.map((m, i) => ({
            agency_id: data.id,
            role: m.role,
            specialization: m.specialization,
            skill_weights: m.skillWeights,
            is_leader: m.role === 'leader',
            sort_order: i,
          })));
      }

      loadAgencies();
      toast.success('Agency duplicated');
    } catch (error) {
      toast.error('Failed to duplicate agency');
    }
  };

  const handleExport = async (agency: Agency) => {
    const exportData = {
      name: agency.name,
      version: '1.0.0',
      dreamPoolMode: agency.dreamPoolMode,
      cohesionRating: agency.cohesionRating,
      members: agency.members,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agency.name.toLowerCase().replace(/\s+/g, '-')}-agency.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Agency exported');
  };

  const statusColors: Record<Agency['status'], string> = {
    draft: 'border-neon-amber/50 text-neon-amber',
    purchased: 'border-neon-cyan/50 text-neon-cyan',
    deployed: 'border-neon-green/50 text-neon-green',
    archived: 'border-muted-foreground/50 text-muted-foreground',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (agencies.length === 0) {
    return (
      <Card className="border-border/30 bg-black/40 backdrop-blur-xl">
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No Agencies Yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first agency to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Agencies</h3>
        <Button variant="ghost" size="sm" onClick={loadAgencies} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {agencies.map((agency) => (
          <Card 
            key={agency.id} 
            className="border-border/30 bg-black/40 backdrop-blur-xl hover:border-neon-magenta/30 transition-all"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{agency.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn("text-[10px] h-5", statusColors[agency.status])}>
                      {agency.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {agency.members.length} cognitives
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setRenameId(agency.id); setNewName(agency.name); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(agency)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(agency)}>
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteId(agency.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {agency.members.slice(0, 5).map((m, i) => (
                  <AgencyMemberCard key={i} member={m} compact />
                ))}
                {agency.members.length > 5 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{agency.members.length - 5} more
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                <span className="text-xs text-muted-foreground">
                  Cohesion: {agency.cohesionRating}%
                </span>
                <div className="flex items-center gap-2">
                  {/* Chat Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 gap-1 text-xs hover:bg-neon-magenta/10 hover:text-neon-magenta"
                    onClick={() => setChatAgency(agency)}
                  >
                    <MessageCircle className="w-3 h-3" />
                    Chat
                  </Button>
                  {agency.status === 'deployed' && agency.deploymentDomain && (
                    <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" asChild>
                      <a href={`https://${agency.deploymentDomain}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agency?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The agency and all its members will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <AlertDialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Agency</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New agency name"
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chat Dialog */}
      <Dialog open={!!chatAgency} onOpenChange={() => setChatAgency(null)}>
        <DialogContent className="max-w-2xl h-[80vh] p-0 bg-background/95 backdrop-blur-xl border-neon-magenta/30">
          <DialogHeader className="sr-only">
            <DialogTitle>Chat with {chatAgency?.name}</DialogTitle>
          </DialogHeader>
          {chatAgency && (
            <AgencyChatInterface 
              agency={chatAgency} 
              className="h-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
