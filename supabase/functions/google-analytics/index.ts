import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { dateRange = '30d' } = await req.json();
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate date range
    const days = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch internal metrics
    const [usageLogs, brainMetrics, brainEvents, defenseEvents] = await Promise.all([
      supabase
        .from('ai_usage_log')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('brain_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('brain_events')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('defense_events')
        .select('*')
        .gte('detected_at', startDate.toISOString())
    ]);

    const logs = usageLogs.data || [];
    const metrics = brainMetrics.data || [];
    const events = brainEvents.data || [];
    const defense = defenseEvents.data || [];

    // Calculate summary
    const totalCalls = logs.length;
    const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
    const avgResponseTime = logs.length > 0
      ? Math.round(logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length)
      : 0;
    const successCount = logs.filter(log => log.success).length;
    const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 1000) / 10 : 100;

    // Build time series (last 7 days)
    const timeSeries = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logs.filter(log => log.created_at?.startsWith(dateStr));
      timeSeries.push({
        date: dateStr,
        views: dayLogs.length,
        users: new Set(dayLogs.map(log => log.provider)).size
      });
    }

    // Top categories
    const categoryCounts = new Map<string, number>();
    logs.forEach(log => {
      const cat = log.category || 'general';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });
    const topPages = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, views]) => ({ path: `/${path}`, views }));

    // Provider distribution
    const providerCounts = new Map<string, number>();
    logs.forEach(log => {
      const provider = log.provider || 'unknown';
      providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1);
    });
    const total = logs.length || 1;
    const devices = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };
    let idx = 0;
    providerCounts.forEach((count) => {
      const pct = Math.round((count / total) * 100);
      if (idx === 0) devices.desktop = pct;
      else if (idx === 1) devices.mobile = pct;
      else devices.tablet += pct;
      idx++;
    });

    const analyticsData = {
      summary: {
        users: totalCalls,
        pageViews: totalTokens,
        avgSessionDuration: avgResponseTime,
        bounceRate: 100 - successRate
      },
      timeSeries,
      topPages,
      devices,
      realtime: {
        activeUsers: events.filter(e => {
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
          return new Date(e.created_at) > fiveMinAgo;
        }).length,
        topActivePage: topPages[0]?.path || '/dashboard',
        topSource: Array.from(providerCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'internal'
      }
    };

    return new Response(
      JSON.stringify(analyticsData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Analytics function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
