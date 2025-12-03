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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, team_id, team_name, member_email, member_role, site_id, permission_level, comment_text, issue_id } = await req.json();

    switch (action) {
      case 'create_team': {
        const { data: team, error } = await supabase
          .from('pf_clarity_teams')
          .insert({ owner_id: user.id, name: team_name })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, team }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'invite_member': {
        const { data: invitedUser } = await supabase.auth.admin.getUserByEmail(member_email);
        
        if (!invitedUser) {
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: member, error } = await supabase
          .from('pf_clarity_team_members')
          .insert({
            team_id,
            user_id: invitedUser.user.id,
            role: member_role,
            invited_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, member }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'grant_site_access': {
        const { data: access, error } = await supabase
          .from('pf_clarity_site_access')
          .insert({
            site_id,
            team_id,
            permission_level,
          })
          .select()
          .single();

        if (error) throw error;

        await supabase.from('pf_clarity_activity_feed').insert({
          site_id,
          user_id: user.id,
          action_type: 'access_granted',
          entity_type: 'team',
          entity_id: team_id,
        });

        return new Response(JSON.stringify({ success: true, access }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'add_comment': {
        const { data: comment, error } = await supabase
          .from('pf_clarity_comments')
          .insert({
            site_id,
            issue_id,
            user_id: user.id,
            comment_text,
          })
          .select()
          .single();

        if (error) throw error;

        await supabase.from('pf_clarity_activity_feed').insert({
          site_id,
          user_id: user.id,
          action_type: 'comment_added',
          entity_type: 'issue',
          entity_id: issue_id,
        });

        return new Response(JSON.stringify({ success: true, comment }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_activity': {
        const { data: activities, error } = await supabase
          .from('pf_clarity_activity_feed')
          .select('*')
          .eq('site_id', site_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, activities }), {
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
    console.error('Team manager error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
