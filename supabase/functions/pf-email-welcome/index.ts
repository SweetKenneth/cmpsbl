import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WelcomeEmailSchema = z.object({
  to_email: z.string().email().max(255),
  user_name: z.string().min(1).max(200),
  plan_name: z.string().optional().default('Free'),
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
    const validation = WelcomeEmailSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to_email, user_name, plan_name } = validation.data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f9ff; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 40px 30px; text-align: center; }
          .logo { width: 125px; height: auto; margin-bottom: 20px; }
          .content { padding: 40px 30px; }
          .welcome-box { background: linear-gradient(135deg, rgba(122, 95, 255, 0.1), rgba(1, 201, 232, 0.1)); border-left: 4px solid #7A5FFF; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .feature { padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
          .feature:last-child { border-bottom: none; }
          .footer { text-align: center; padding: 30px; font-size: 12px; color: #6b7280; background: #f6f9ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hxgbibtkftocyrnuzxwd.supabase.co/storage/v1/object/public/brain-training-data/promptfluid-logo.png" alt="PromptFluid" class="logo" />
            <h1 style="margin: 0; font-size: 28px;">Welcome to PromptFluid!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">AI That Flows.</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2 style="margin-top: 0; color: #7A5FFF;">👋 Hey ${user_name}!</h2>
              <p style="margin-bottom: 0;">You're all set! Your PromptFluid ${plan_name} account is ready to revolutionize your AI workflow.</p>
            </div>

            <h3 style="color: #7A5FFF;">What's Next?</h3>
            
            <div class="feature">
              <strong>🧠 Explore the Brain</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Our adaptive AI orchestration learns and evolves with every interaction.</p>
            </div>
            
            <div class="feature">
              <strong>🛡️ Enable Defense</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Protect your applications with intelligent bot detection and threat prevention.</p>
            </div>
            
            <div class="feature">
              <strong>🎨 Build with Studio</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Create deployable React apps and websites autonomously.</p>
            </div>
            
            <div class="feature">
              <strong>🔗 Connect with Nexus</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Route AI tasks to the optimal provider (Groq, OpenAI, Anthropic, Perplexity).</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.promptfluid.com/dashboard" class="cta-button">Go to Dashboard</a>
            </div>

            <div style="background: #f6f9ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>Need Help?</strong><br>
                Check out our <a href="https://www.promptfluid.com/docs" style="color: #7A5FFF;">documentation</a> or reach out to our support team.
              </p>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>PromptFluid</strong> – AI That Flows.</p>
            <p style="margin: 0;">You're receiving this because you created a PromptFluid account.</p>
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
          email: 'hello@promptfluid.com',
          name: 'PromptFluid'
        },
        to: [{ email: to_email }],
        subject: `🎉 Welcome to PromptFluid, ${user_name}!`,
        html: emailHtml,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sender.net API error: ${error}`);
    }

    const data = await response.json();

    console.log('[Welcome Email] Sent successfully to:', to_email);

    return new Response(
      JSON.stringify({ success: true, message_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Welcome email error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
