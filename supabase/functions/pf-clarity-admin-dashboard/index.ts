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

    // Verify user is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = await req.json();

    switch (action) {
      case 'get_stats': {
        // Get overall platform stats
        const [
          { count: totalUsers },
          { count: totalSites },
          { count: totalScans },
          { count: activeSubscriptions },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('pf_clarity_sites').select('*', { count: 'exact', head: true }),
          supabase.from('pf_clarity_scans').select('*', { count: 'exact', head: true }),
          supabase.from('pf_clarity_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        ]);

        // Get average compliance score
        const { data: scans } = await supabase
          .from('pf_clarity_scans')
          .select('compliance_score')
          .not('compliance_score', 'is', null);

        const avgScore = scans && scans.length > 0
          ? scans.reduce((sum, s) => sum + s.compliance_score, 0) / scans.length
          : 0;

        // Get revenue (would need to sum from Stripe or subscriptions table)
        const revenue = 0; // Placeholder

        return new Response(JSON.stringify({
          success: true,
          stats: {
            total_users: totalUsers || 0,
            total_sites: totalSites || 0,
            total_scans: totalScans || 0,
            active_subscriptions: activeSubscriptions || 0,
            avg_compliance_score: Math.round(avgScore * 100) / 100,
            revenue_usd: revenue,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_recent_activity': {
        // Get recent scans
        const { data: recentScans } = await supabase
          .from('pf_clarity_scans')
          .select('*, pf_clarity_sites(site_url)')
          .order('created_at', { ascending: false })
          .limit(10);

        // Get recent sites
        const { data: recentSites } = await supabase
          .from('pf_clarity_sites')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        return new Response(JSON.stringify({
          success: true,
          recent_scans: recentScans || [],
          recent_sites: recentSites || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_user_details': {
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        return new Response(JSON.stringify({
          success: true,
          users: users || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_daily_stats': {
        const today = new Date().toISOString().split('T')[0];

        // Calculate today's stats
        const [
          { count: totalUsers },
          { count: totalSites },
          { count: totalScans },
          { count: activeSubscriptions },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('pf_clarity_sites').select('*', { count: 'exact', head: true }),
          supabase.from('pf_clarity_scans').select('*', { count: 'exact', head: true }),
          supabase.from('pf_clarity_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        ]);

        const { data: scans } = await supabase
          .from('pf_clarity_scans')
          .select('compliance_score')
          .not('compliance_score', 'is', null);

        const avgScore = scans && scans.length > 0
          ? scans.reduce((sum, s) => sum + s.compliance_score, 0) / scans.length
          : 0;

        // Upsert daily stats
        await supabase
          .from('pf_clarity_admin_stats')
          .upsert({
            date: today,
            total_users: totalUsers || 0,
            total_sites: totalSites || 0,
            total_scans: totalScans || 0,
            active_subscriptions: activeSubscriptions || 0,
            avg_compliance_score: Math.round(avgScore * 100) / 100,
            revenue_usd: 0,
          }, { onConflict: 'date' });

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
    console.error('Admin dashboard error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
