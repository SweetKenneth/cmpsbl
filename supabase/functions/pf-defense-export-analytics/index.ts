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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { format = 'json', dataType = 'events', startDate, endDate } = await req.json();

    let data: any[] = [];

    // Fetch requested data type
    switch (dataType) {
      case 'events':
        const eventsQuery = supabase
          .from('defense_events')
          .select('*')
          .order('created_at', { ascending: false });

        if (startDate) eventsQuery.gte('created_at', startDate);
        if (endDate) eventsQuery.lte('created_at', endDate);

        const { data: events, error: eventsError } = await eventsQuery;
        if (eventsError) throw eventsError;
        data = events || [];
        break;

      case 'analytics':
        // Get aggregated analytics
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('defense_events')
          .select('action, risk_score, created_at, ip');

        if (analyticsError) throw analyticsError;
        
        // Aggregate by hour
        const hourlyStats = new Map();
        (analyticsData || []).forEach(event => {
          const hour = new Date(event.created_at).toISOString().slice(0, 13);
          if (!hourlyStats.has(hour)) {
            hourlyStats.set(hour, { total: 0, blocked: 0, challenged: 0, allowed: 0 });
          }
          const stats = hourlyStats.get(hour);
          stats.total++;
          if (event.action === 'block') stats.blocked++;
          else if (event.action === 'challenge') stats.challenged++;
          else stats.allowed++;
        });

        data = Array.from(hourlyStats.entries()).map(([hour, stats]) => ({
          timestamp: hour,
          ...stats
        }));
        break;

      default:
        throw new Error('Invalid data type');
    }

    // Format output
    if (format === 'csv') {
      if (data.length === 0) {
        return new Response('No data available', {
          headers: { ...corsHeaders, 'Content-Type': 'text/csv' }
        });
      }

      // Generate CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
            if (Array.isArray(value)) return `"${value.join('; ')}"`;
            if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
            return value;
          }).join(',')
        )
      ];

      return new Response(csvRows.join('\n'), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="promptfluid-defense-${dataType}-${Date.now()}.csv"`
        }
      });
    }

    // JSON format (default)
    return new Response(
      JSON.stringify({
        data,
        meta: {
          count: data.length,
          dataType,
          format,
          exportedAt: new Date().toISOString(),
          startDate,
          endDate
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in export-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});