import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AlertEmailSchema = z.object({
  defense_event: z.object({
    ip: z.string().max(45),
    user_agent: z.string().max(500),
    endpoint: z.string().max(500),
    risk_score: z.number().min(0).max(100),
    action: z.enum(['allow', 'block', 'challenge']),
    reason: z.string().max(1000),
    created_at: z.string()
  }),
  alert_email: z.string().email().max(255)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const body = await req.json();
    const validation = AlertEmailSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { defense_event, alert_email } = validation.data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .logo { width: 125px; height: auto; margin-bottom: 20px; }
          .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #F6F9FF; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .metric { display: inline-block; margin: 10px 15px 10px 0; }
          .metric-label { font-size: 12px; color: #6b7280; }
          .metric-value { font-size: 24px; font-weight: bold; color: #ef4444; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hxgbibtkftocyrnuzxwd.supabase.co/storage/v1/object/public/brain-training-data/promptfluid-logo.png" alt="PromptFluid" class="logo" />
            <h1 style="margin: 0;">🛡️ Defense Alert</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Threat Detection System</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin-top: 0; color: #dc2626;">⚠️ Critical Threat Detected</h2>
              <p>Unusual activity detected requiring immediate attention.</p>
            </div>

            <h3>Detection Details:</h3>
            <div class="metric">
              <div class="metric-label">Risk Score</div>
              <div class="metric-value">${defense_event.risk_score}/100</div>
            </div>
            <div class="metric">
              <div class="metric-label">Risk Level</div>
              <div class="metric-value" style="color: ${defense_event.risk_score > 90 ? '#dc2626' : '#f59e0b'};">
                ${defense_event.risk_score > 90 ? 'CRITICAL' : 'HIGH'}
              </div>
            </div>

            <h3>Event Information:</h3>
            <ul>
              <li><strong>IP Address:</strong> ${defense_event.ip}</li>
              <li><strong>User Agent:</strong> ${defense_event.user_agent}</li>
              <li><strong>Endpoint:</strong> ${defense_event.endpoint}</li>
              <li><strong>Detection Time:</strong> ${new Date(defense_event.created_at).toLocaleString()}</li>
              <li><strong>Action Taken:</strong> ${defense_event.action.toUpperCase()}</li>
            </ul>

            <h3>Detection Reason:</h3>
            <p>${defense_event.reason}</p>

            <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 6px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Next Steps:</strong><br>
                Review the Defense dashboard for detailed analysis and consider adjusting threat rules if needed.
              </p>
            </div>
          </div>
          <div class="footer">
            <p>PromptFluid Defense - AI That Flows.</p>
            <p>Automated alert from PromptFluid Threat Detection System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const senderApiKey = Deno.env.get('SENDER_API_KEY');
    if (!senderApiKey) {
      throw new Error('SENDER_API_KEY not configured');
    }

    const response = await fetch('https://api.sender.net/v2/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${senderApiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: 'defense@promptfluid.com',
          name: 'PromptFluid Defense'
        },
        to: [{ email: alert_email }],
        subject: `🛡️ Defense Alert: Risk Score ${defense_event.risk_score} – ${defense_event.action.toUpperCase()}`,
        html: emailHtml,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sender.net API error: ${error}`);
    }

    const data = await response.json();

    console.log('[Defense Alert] Email sent successfully to:', alert_email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: data.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email alert error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});