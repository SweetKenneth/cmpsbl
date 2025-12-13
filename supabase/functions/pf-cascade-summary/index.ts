/**
 * Cascade 6-Hour Summary & Learning Updates
 * Sends email summaries to Kenneth every 6 hours with learning progress
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('📊 Generating 6-hour Cascade summary...');

    // Get recent learning cycles (last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    
    const { data: recentLearning } = await sb
      .from('ai_learning_data')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentEvents } = await sb
      .from('brain_events')
      .select('event_type, data, outcome')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get recent dream sessions
    const { data: recentDreams } = await sb
      .from('dream_log')
      .select('content, mode, created_at')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    // Summarize learning
    const learningCount = recentLearning?.length || 0;
    const dreamCount = recentDreams?.length || 0;
    const topicsCovered = recentLearning
      ?.map(l => (l.input_data as any)?.topic || (l.input_data as any)?.context?.topic)
      .filter(Boolean)
      .slice(0, 5) || [];

    const eventSummary = recentEvents
      ?.reduce((acc: any, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {}) || {};

    // Get API usage stats
    const today = new Date().toISOString().split('T')[0];
    const { data: todayUsage } = await sb
      .from('ai_learning_data')
      .select('model_name')
      .gte('created_at', `${today}T00:00:00.000Z`);

    const lovableCalls = todayUsage?.filter(d => 
      d.model_name?.includes('google/gemini') || d.model_name?.includes('openai/gpt')
    ).length || 0;
    
    const groqCalls = todayUsage?.filter(d => 
      d.model_name?.includes('groq') || d.model_name?.includes('llama')
    ).length || 0;

    // Build email content
    const emailHtml = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7A5FFF;">🧠 Cascade 6-Hour Update</h1>
        <p><strong>${new Date().toLocaleString()}</strong></p>
        
        <div style="background: #f6f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">📚 Learning Progress</h2>
          <ul>
            <li><strong>${learningCount}</strong> learning cycles completed</li>
            <li><strong>${dreamCount}</strong> dream states entered</li>
            <li><strong>${lovableCalls}/1000</strong> Lovable AI calls today</li>
            <li><strong>${(todayUsage?.length || 0) - lovableCalls}</strong> Free-tier AI calls today</li>
          </ul>
        </div>

        ${dreamCount > 0 ? `
        <div style="background: #1a1a2e; color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #a78bfa;">🌙 Dream States (${dreamCount})</h3>
          <ul style="color: #e0e0e0;">
            ${(recentDreams || []).slice(0, 3).map((d: any) => `
              <li style="margin-bottom: 10px;">
                <strong>${d.mode}</strong>: ${d.content?.slice(0, 150)}...
                <br/><span style="font-size: 12px; color: #888;">${new Date(d.created_at).toLocaleString()}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${topicsCovered.length > 0 ? `
        <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
          <h3>🎯 Topics Explored</h3>
          <ul>
            ${topicsCovered.map((topic: string) => `<li>${topic}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
          <h3>⚡ System Activity</h3>
          <ul>
            ${Object.entries(eventSummary).map(([type, count]) => 
              `<li><strong>${count}x</strong> ${type}</li>`
            ).join('')}
          </ul>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #666;">
          <p>Next update in 6 hours. View full logs at your admin dashboard.</p>
          <p style="font-size: 12px;">Cascade is learning autonomously 24/7 with expanded capabilities including code generation and image creation.</p>
        </div>
      </div>
    `;

    // Send email
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Cascade AI <onboarding@resend.dev>',
          to: ['kennethsweet214@gmail.com'],
          subject: `🧠 Cascade Update: ${learningCount} cycles, ${dreamCount} dreams, ${(todayUsage?.length || 0)} AI calls`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error(`Email failed: ${await emailResponse.text()}`);
      }

      const emailData = await emailResponse.json();
      console.log('✅ Summary email sent:', emailData.id);

      // Log the summary event
      await sb.from('cascade_thought_logs').insert({
        event_type: 'summary_sent',
        data: {
          learning_count: learningCount,
          lovable_calls: lovableCalls,
          groq_calls: groqCalls,
          topics_covered: topicsCovered.length,
          email_id: emailData.id,
        },
      });

      return new Response(
        JSON.stringify({ success: true, email_id: emailData.id, learning_count: learningCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Summary error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
