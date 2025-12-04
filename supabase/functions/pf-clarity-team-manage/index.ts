import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...body } = await req.json();

    switch (action) {
      case 'create_team': {
        const { name, plan_tier } = body;
        const { data, error } = await supabase
          .from('pf_clarity_teams')
          .insert({ name, plan_tier: plan_tier || 'free', owner_id: user.id })
          .select()
          .single();

        if (error) throw error;

        // Add owner as team member
        await supabase
          .from('pf_clarity_team_members')
          .insert({ team_id: data.id, user_id: user.id, role: 'owner' });

        return new Response(JSON.stringify({ success: true, team: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'invite_member': {
        const { team_id, email, role } = body;

        // Verify user has permission to invite
        const { data: member } = await supabase
          .from('pf_clarity_team_members')
          .select('role')
          .eq('team_id', team_id)
          .eq('user_id', user.id)
          .single();

        if (!member || !['owner', 'admin'].includes(member.role)) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('pf_clarity_team_invites')
          .insert({ team_id, email, role: role || 'member', created_by: user.id })
          .select()
          .single();

        if (error) throw error;

        // TODO: Send invite email via Resend
        console.log(`Invite created for ${email} to join team ${team_id}`);

        return new Response(JSON.stringify({ success: true, invite: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'accept_invite': {
        const { invite_token } = body;

        // Get invite
        const { data: invite, error: inviteError } = await supabase
          .from('pf_clarity_team_invites')
          .select('*')
          .eq('invite_token', invite_token)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (inviteError || !invite) {
          return new Response(JSON.stringify({ error: 'Invalid or expired invite' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Add member
        const { data, error } = await supabase
          .from('pf_clarity_team_members')
          .insert({ team_id: invite.team_id, user_id: user.id, role: invite.role })
          .select()
          .single();

        if (error) throw error;

        // Delete invite
        await supabase
          .from('pf_clarity_team_invites')
          .delete()
          .eq('id', invite.id);

        return new Response(JSON.stringify({ success: true, membership: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'remove_member': {
        const { team_id, member_user_id } = body;

        // Verify user has permission
        const { data: requester } = await supabase
          .from('pf_clarity_team_members')
          .select('role')
          .eq('team_id', team_id)
          .eq('user_id', user.id)
          .single();

        if (!requester || !['owner', 'admin'].includes(requester.role)) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('pf_clarity_team_members')
          .delete()
          .eq('team_id', team_id)
          .eq('user_id', member_user_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_member_role': {
        const { team_id, member_user_id, new_role } = body;

        // Verify user is owner
        const { data: owner } = await supabase
          .from('pf_clarity_teams')
          .select('owner_id')
          .eq('id', team_id)
          .single();

        if (!owner || owner.owner_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Only team owners can change roles' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('pf_clarity_team_members')
          .update({ role: new_role })
          .eq('team_id', team_id)
          .eq('user_id', member_user_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Team management error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
