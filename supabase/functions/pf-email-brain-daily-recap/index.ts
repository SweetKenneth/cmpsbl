import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DailyRecapSchema = z.object({
  to_email: z.string().email().max(255),
  user_name: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  insights: z.array(z.object({
    title: z.string().max(200),
    description: z.string().max(500),
    category: z.string().max(100),
  })).max(10),
  stats: z.object({
    total_ai_calls: z.number().int().nonnegative(),
    patterns_learned: z.number().int().nonnegative(),
    efficiency_score: z.number().min(0).max(100),
    cost_saved: z.number().nonnegative(),
  }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const senderApiKey = Deno.env.get('SENDER_API_KEY');
    if (!senderApiKey) {
      throw new Error('SENDER_API_KEY not configured');
    }

    const body = await req.json();
    const validation = DailyRecapSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to_email, user_name, date, insights, stats } = validation.data;

    const insightsHtml = insights.map(insight => `
      <div style="background: white; border-left: 4px solid #7A5FFF; padding: 15px; margin: 15px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: inline-block; background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-bottom: 8px;">${insight.category.toUpperCase()}</div>
        <h4 style="margin: 8px 0; color: #7A5FFF;">${insight.title}</h4>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">${insight.description}</p>
      </div>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f9ff; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 40px 30px; text-align: center; }
          .logo { width: 125px; height: auto; margin-bottom: 20px; }
          .content { padding: 40px 30px; background: #f6f9ff; }
          .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .stat-value { font-size: 32px; font-weight: bold; color: #7A5FFF; margin: 10px 0; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 30px; font-size: 12px; color: #6b7280; background: #f6f9ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hxgbibtkftocyrnuzxwd.supabase.co/storage/v1/object/public/brain-training-data/promptfluid-logo.png" alt="PromptFluid" class="logo" />
            <h1 style="margin: 0; font-size: 28px;">🧠 Daily Brain Recap</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <p style="background: white; padding: 20px; border-radius: 8px; margin: 0 0 20px 0;">Hi <strong>${user_name}</strong>,<br><br>Here's what your PromptFluid Brain learned today!</p>

            <h3 style="color: #7A5FFF; margin-top: 30px;">📊 Today's Performance</h3>
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-label">AI Calls</div>
                <div class="stat-value">${stats.total_ai_calls.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Patterns Learned</div>
                <div class="stat-value">${stats.patterns_learned}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Efficiency Score</div>
                <div class="stat-value">${stats.efficiency_score}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Cost Saved</div>
                <div class="stat-value">$${stats.cost_saved.toFixed(2)}</div>
              </div>
            </div>

            <h3 style="color: #7A5FFF; margin-top: 30px;">💡 Key Insights</h3>
            ${insightsHtml}

            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #6b7280;">Want to dive deeper into your AI analytics?</p>
              <a href="https://www.promptfluid.com/dashboard/brain" class="cta-button">View Full Brain Dashboard</a>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>💬 Have feedback for the Brain?</strong><br>
                Your insights help the Brain learn better. Reply to this email with suggestions!
              </p>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>PromptFluid Brain</strong> – AI That Flows.</p>
            <p style="margin: 0;">Daily recap sent to ${to_email}</p>
            <p style="margin: 10px 0 0 0;"><a href="https://www.promptfluid.com/settings/notifications" style="color: #7A5FFF;">Manage email preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.sender.net/v2/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${senderApiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: 'brain@promptfluid.com',
          name: 'PromptFluid Brain'
        },
        to: [{ email: to_email }],
        subject: `🧠 Your Daily Brain Recap – ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        html: emailHtml,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sender.net API error: ${error}`);
    }

    const data = await response.json();

    console.log('[Daily Recap] Email sent to:', to_email);

    return new Response(
      JSON.stringify({ success: true, message_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Daily recap email error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
