/**
 * pf-agency-daily-brief v1.0.0
 * 
 * Generate and send daily agency briefs:
 * - Summarizes completed tasks
 * - Highlights key insights
 * - Reports on agent performance
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agencyId, recipientEmail } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Fetch today's task stats
    const { data: completedTasks } = await supabase
      .from('agency_tasks')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('status', 'completed')
      .gte('completed_at', todayStart.toISOString())
      .order('completed_at', { ascending: false });

    const { data: inProgressTasks } = await supabase
      .from('agency_tasks')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('status', 'in_progress');

    const { data: queuedTasks } = await supabase
      .from('agency_tasks')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('status', 'queued');

    // Aggregate insights from completed tasks
    const allInsights: string[] = [];
    for (const task of completedTasks || []) {
      const insights = task.output_data?.insights || [];
      allInsights.push(...insights.slice(0, 2));
    }

    // Get top insights using Groq
    let topInsights: string[] = allInsights.slice(0, 5);
    
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (GROQ_API_KEY && allInsights.length > 3) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'Summarize the following insights into 3-5 key takeaways. Be concise and actionable.' },
              { role: 'user', content: allInsights.join('\n') }
            ],
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const summary = data.choices?.[0]?.message?.content || '';
          // Extract bullet points
          const bulletMatches = summary.match(/^[•\-\*\d\.]\s*.{15,150}$/gm);
          if (bulletMatches) {
            topInsights = bulletMatches.slice(0, 5).map((m: string) => m.replace(/^[•\-\*\d\.]\s*/, '').trim());
          }
        }
      } catch (err) {
        console.warn('Failed to summarize insights:', err);
      }
    }

    // Fetch agency info
    const { data: agency } = await supabase
      .from('agencies')
      .select('name, owner_id')
      .eq('id', agencyId)
      .single();

    // Get owner email if not provided
    let emailTo = recipientEmail;
    if (!emailTo && agency?.owner_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(agency.owner_id);
      emailTo = userData?.user?.email;
    }

    if (!emailTo) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No recipient email available' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build brief data
    const briefData = {
      agencyName: agency?.name || 'Your Agency',
      date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      tasksCompleted: completedTasks?.length || 0,
      tasksInProgress: inProgressTasks?.length || 0,
      tasksQueued: queuedTasks?.length || 0,
      recentTasks: (completedTasks || []).slice(0, 5),
      topInsights,
    };

    // Queue the email
    await supabase.from('agency_email_queue').insert({
      agency_id: agencyId,
      recipient_email: emailTo,
      email_type: 'daily_brief',
      subject: `📋 Daily Brief: ${briefData.agencyName} - ${now.toLocaleDateString()}`,
      metadata: briefData,
      status: 'pending',
    });

    // Trigger email sending
    await supabase.functions.invoke('pf-agency-send-email', {}).catch(() => {});

    console.log(`📋 Daily brief queued for ${emailTo}`);

    return new Response(JSON.stringify({
      success: true,
      briefData,
      emailTo,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Daily brief error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
