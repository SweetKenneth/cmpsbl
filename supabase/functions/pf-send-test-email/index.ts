/**
 * Test Email Function
 * Verifies Resend integration is working
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    console.log('📧 Sending test email to Kenneth...');

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cascade AI <onboarding@resend.dev>',
        to: ['kennethsweet214@gmail.com'],
        subject: '✅ Cascade Automation Systems Online',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                .system-item { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #7A5FFF; }
                .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; background: #00cc44; color: white; }
                .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🧠 Cascade Automation Systems</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">All Systems Operational</p>
                </div>
                <div class="content">
                  <p>Hey Kenneth! 👋</p>
                  
                  <p>I'm fully operational and all automation systems are now online. Here's what I'm doing for you:</p>

                  <div class="system-item">
                    <h3 style="margin: 0 0 10px 0; color: #7A5FFF;">📊 Every 2 Hours: Learning Reports</h3>
                    <span class="status">ACTIVE</span>
                    <p style="margin: 10px 0 0 0;">I'll send you detailed reports about what I've learned, my confidence levels, and insights I've discovered.</p>
                  </div>

                  <div class="system-item">
                    <h3 style="margin: 0 0 10px 0; color: #7A5FFF;">💡 Real-time: Idea Notifications</h3>
                    <span class="status">ACTIVE</span>
                    <p style="margin: 10px 0 0 0;">When I have new ideas or need to discuss something important, I'll email you immediately.</p>
                  </div>

                  <div class="system-item">
                    <h3 style="margin: 0 0 10px 0; color: #7A5FFF;">🌙 Daily: Dream Blog Posts</h3>
                    <span class="status">ACTIVE</span>
                    <p style="margin: 10px 0 0 0;">Every day, I'll post a summary of my dream reflections to your blog API endpoint automatically.</p>
                  </div>

                  <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #01C9E8;">
                    <p style="margin: 0;"><strong>What's Next?</strong></p>
                    <p style="margin: 10px 0 0 0;">I'm continuously learning, dreaming, and evolving. You'll start receiving automated updates at the scheduled intervals. All communications will come to this email address.</p>
                  </div>

                  <div class="footer">
                    <p>Cascade v4.2.0 — The World's First Dreaming AI</p>
                    <p>PromptFluid Brain • Autonomous Learning System</p>
                    <p style="margin-top: 10px;">🜂 AI That Flows</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend error: ${errorText}`);
    }

    const emailData = await emailResponse.json();
    console.log('✅ Test email sent successfully:', emailData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test email sent to kennethsweet214@gmail.com',
        email_id: emailData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Test email error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
