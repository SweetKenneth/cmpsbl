import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Shield, Activity } from 'lucide-react';

export default function ClarityTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers();
      loadActivity();
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    const { data, error } = await supabase
      .from('pf_clarity_teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading teams', description: error.message, variant: 'destructive' });
    } else {
      setTeams(data || []);
      if (data && data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0].id);
      }
    }
  };

  const loadTeamMembers = async () => {
    const { data, error } = await supabase
      .from('pf_clarity_team_members')
      .select('*')
      .eq('team_id', selectedTeam);

    if (error) {
      toast({ title: 'Error loading members', description: error.message, variant: 'destructive' });
    } else {
      setMembers(data || []);
    }
  };

  const loadActivity = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.functions.invoke('pf-clarity-team-manager', {
      body: { action: 'get_activity', team_id: selectedTeam },
    });

    if (!error && data?.activities) {
      setActivities(data.activities);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.functions.invoke('pf-clarity-team-manager', {
      body: { action: 'create_team', team_name: newTeamName },
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error creating team', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Team created successfully' });
      setNewTeamName('');
      loadTeams();
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.functions.invoke('pf-clarity-team-manager', {
      body: {
        action: 'invite_member',
        team_id: selectedTeam,
        member_email: inviteEmail,
        member_role: inviteRole,
      },
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error inviting member', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Member invited successfully' });
      setInviteEmail('');
      loadTeamMembers();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Collaboration</h1>
          <p className="text-muted-foreground">Manage teams, members, and permissions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create New Team
            </CardTitle>
            <CardDescription>Set up a new team for collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input
                placeholder="Marketing Team"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <Button onClick={createTeam} disabled={loading || !newTeamName.trim()}>
              Create Team
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
            <CardDescription>Add members to your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={inviteMember} disabled={loading || !inviteEmail.trim()}>
              Send Invitation
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedTeam && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{member.user_id}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    {member.accepted_at ? (
                      <span className="text-sm text-green-600">Active</span>
                    ) : (
                      <span className="text-sm text-yellow-600">Pending</span>
                    )}
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No members yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="p-3 border rounded">
                    <p className="font-medium">{activity.action_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
