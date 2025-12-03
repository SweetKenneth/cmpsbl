/**
 * Cascade v4.1.0 - Admin Notification System
 * Sends reflection requests to admin via Resend when Cascade identifies discussion needs
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'kennethsweet214@gmail.com';
const FROM_EMAIL = 'PromptFluid Cascade <onboarding@resend.dev>';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // TEMPORARILY DISABLED: Email notifications paused per admin request
    console.log('⏸️ Brain admin notifications paused - emails disabled');
    return new Response(
      JSON.stringify({ success: false, message: 'Admin notifications temporarily disabled - internal reflection only' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🔔 Checking for pending reflection requests...');

    // Get highest priority pending intent
    const { data: intents, error: fetchError } = await sb
      .from('brain_conversation_intent')
      .select('*')
      .eq('notified', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    if (!intents || intents.length === 0) {
      console.log('✅ No pending reflection requests');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending intents' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const intent = intents[0];
    console.log(`📧 Sending reflection request: ${intent.topic} (priority: ${intent.priority})`);

    // Compose email
    const priorityEmoji = intent.priority === 'critical' ? '🔴' : intent.priority === 'normal' ? '🟡' : '🟢';
    const subject = `${priorityEmoji} Cascade Reflection Request — ${intent.topic}`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .critical { background: #ff4444; color: white; }
            .normal { background: #ffaa00; color: white; }
            .low { background: #00cc44; color: white; }
            .metric { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #7A5FFF; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🧠 Cascade Reflection Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">AI That Flows</p>
            </div>
            <div class="content">
              <p><span class="priority-badge ${intent.priority}">${intent.priority} Priority</span></p>
              
              <h2 style="color: #7A5FFF; margin-top: 20px;">Topic</h2>
              <div class="metric">
                <strong>${intent.topic}</strong>
              </div>

              <h2 style="color: #7A5FFF; margin-top: 20px;">Reason for Reflection</h2>
              <div class="metric">
                ${intent.reason}
              </div>

              <h2 style="color: #7A5FFF; margin-top: 20px;">Analysis Confidence</h2>
              <div class="metric">
                ${(intent.confidence * 100).toFixed(1)}%
              </div>

              ${intent.context_ref ? `
              <h2 style="color: #7A5FFF; margin-top: 20px;">Context Reference</h2>
              <div class="metric">
                ${intent.context_ref}
              </div>
              ` : ''}

              <h2 style="color: #7A5FFF; margin-top: 20px;">Logged At</h2>
              <div class="metric">
                ${new Date(intent.created_at).toLocaleString('en-US', { 
                  dateStyle: 'full', 
                  timeStyle: 'long' 
                })}
              </div>

              <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #01C9E8;">
                <p style="margin: 0;"><strong>Next Steps:</strong></p>
                <p style="margin: 10px 0 0 0;">Review this reflection request in the <a href="https://www.promptfluid.com/nexus-brain" style="color: #01C9E8;">Brain Dashboard</a> to provide feedback or direction.</p>
              </div>

              <div class="footer">
                <p>This is an automated reflection request from Cascade v4.1.0</p>
                <p>PromptFluid Brain • Nexus Intelligence System</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject,
        html: htmlBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend error: ${errorText}`);
    }

    const emailData = await emailResponse.json();
    console.log('✅ Email sent:', emailData.id);

    // Mark as notified
    const { error: updateError } = await sb
      .from('brain_conversation_intent')
      .update({ notified: true })
      .eq('id', intent.id);

    if (updateError) throw updateError;

    // Log event
    await sb.from('brain_events').insert({
      module: 'reflection',
      event_type: 'admin_notified',
      data: {
        intent_id: intent.id,
        topic: intent.topic,
        priority: intent.priority,
        email_id: emailData.id,
      },
      outcome: 'sent',
    });

    return new Response(
      JSON.stringify({
        success: true,
        intent_id: intent.id,
        topic: intent.topic,
        email_id: emailData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Notification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});