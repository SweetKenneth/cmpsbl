import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PasswordResetSchema = z.object({
  to_email: z.string().email().max(255),
  user_name: z.string().min(1).max(200),
  reset_link: z.string().url().max(500),
  expires_in_minutes: z.number().optional().default(60),
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
    const validation = PasswordResetSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to_email, user_name, reset_link, expires_in_minutes } = validation.data;

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
          .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .reset-button { display: inline-block; background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .security-note { background: #f6f9ff; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 30px; font-size: 12px; color: #6b7280; background: #f6f9ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hxgbibtkftocyrnuzxwd.supabase.co/storage/v1/object/public/brain-training-data/promptfluid-logo.png" alt="PromptFluid" class="logo" />
            <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">AI That Flows.</p>
          </div>
          <div class="content">
            <p>Hi <strong>${user_name}</strong>,</p>
            
            <p>We received a request to reset your PromptFluid account password. Click the button below to create a new password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${reset_link}" class="reset-button">Reset Password</a>
            </div>

            <div class="alert-box">
              <p style="margin: 0; font-size: 14px;"><strong>⏱️ This link expires in ${expires_in_minutes} minutes.</strong></p>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7A5FFF; font-size: 12px;">${reset_link}</p>

            <div class="security-note">
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>🔒 Security Tips:</strong></p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #6b7280;">
                <li>Never share your password with anyone</li>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication if available</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #fee2e2; border-radius: 8px; border: 1px solid #fecaca;">
              <p style="margin: 0; font-size: 14px; color: #dc2626;">
                <strong>⚠️ Didn't request this?</strong><br>
                If you didn't request a password reset, your account may be at risk. Contact our security team immediately at <a href="mailto:security@promptfluid.com" style="color: #dc2626;">security@promptfluid.com</a>
              </p>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>PromptFluid</strong> – AI That Flows.</p>
            <p style="margin: 0;">This is a security notification. Please do not reply to this email.</p>
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
          email: 'security@promptfluid.com',
          name: 'PromptFluid Security'
        },
        to: [{ email: to_email }],
        subject: '🔒 Reset Your PromptFluid Password',
        html: emailHtml,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sender.net API error: ${error}`);
    }

    const data = await response.json();

    console.log('[Password Reset] Email sent to:', to_email);

    return new Response(
      JSON.stringify({ success: true, message_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Password reset email error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
