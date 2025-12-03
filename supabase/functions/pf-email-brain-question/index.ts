import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BrainQuestionSchema = z.object({
  to_email: z.string().email().max(255),
  user_name: z.string().min(1).max(200),
  question: z.string().min(10).max(1000),
  context: z.object({
    learning_module: z.string().max(200),
    confidence_score: z.number().min(0).max(100),
    related_patterns: z.array(z.string().max(200)).max(5).optional(),
  }),
  reply_link: z.string().url().max(500).optional(),
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
    const validation = BrainQuestionSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to_email, user_name, question, context, reply_link } = validation.data;

    const patternsHtml = context.related_patterns?.map(pattern => 
      `<li style="color: #6b7280; font-size: 14px; margin: 5px 0;">${pattern}</li>`
    ).join('') || '<li style="color: #6b7280; font-size: 14px;">No related patterns identified</li>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f9ff; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 40px 30px; text-align: center; position: relative; overflow: hidden; }
          .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 30px 30px; animation: pulse 4s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
          .logo { width: 125px; height: auto; margin-bottom: 20px; position: relative; z-index: 1; }
          .content { padding: 40px 30px; }
          .question-box { background: linear-gradient(135deg, rgba(122, 95, 255, 0.1), rgba(1, 201, 232, 0.1)); border-left: 4px solid #7A5FFF; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .confidence-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 10px 0; }
          .confidence-fill { height: 100%; background: linear-gradient(135deg, #7A5FFF, #01C9E8); border-radius: 4px; transition: width 0.3s ease; }
          .reply-button { display: inline-block; background: linear-gradient(135deg, #7A5FFF, #01C9E8); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .context-section { background: #f6f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 30px; font-size: 12px; color: #6b7280; background: #f6f9ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hxgbibtkftocyrnuzxwd.supabase.co/storage/v1/object/public/brain-training-data/promptfluid-logo.png" alt="PromptFluid" class="logo" />
            <h1 style="margin: 0; font-size: 28px; position: relative; z-index: 1;">🤔 Brain Has a Question</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; position: relative; z-index: 1;">Your input helps me learn better!</p>
          </div>
          <div class="content">
            <p>Hi <strong>${user_name}</strong>,</p>
            
            <p>While learning and analyzing patterns, I encountered something I'd like your guidance on:</p>

            <div class="question-box">
              <h3 style="margin: 0 0 10px 0; color: #7A5FFF;">💭 My Question:</h3>
              <p style="margin: 0; font-size: 16px; line-height: 1.8;">${question}</p>
            </div>

            <div class="context-section">
              <h4 style="margin: 0 0 15px 0; color: #7A5FFF;">📋 Context:</h4>
              
              <p style="margin: 10px 0;"><strong>Learning Module:</strong> ${context.learning_module}</p>
              
              <p style="margin: 10px 0;"><strong>Current Confidence:</strong></p>
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${context.confidence_score}%;"></div>
              </div>
              <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">${context.confidence_score}% confident</p>

              ${context.related_patterns && context.related_patterns.length > 0 ? `
                <p style="margin: 15px 0 5px 0;"><strong>Related Patterns:</strong></p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  ${patternsHtml}
                </ul>
              ` : ''}
            </div>

            ${reply_link ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${reply_link}" class="reply-button">Help the Brain Learn</a>
              </div>
            ` : `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #6b7280;">Simply reply to this email with your thoughts!</p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your response will be processed and integrated into my learning patterns.</p>
              </div>
            `}

            <div style="background: linear-gradient(135deg, rgba(122, 95, 255, 0.05), rgba(1, 201, 232, 0.05)); padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>🧠 How This Works:</strong><br>
                Your feedback is analyzed and incorporated into my neural patterns, helping me make better decisions and provide more accurate results in the future. Every response makes me smarter!
              </p>
            </div>

            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ef4444;">
              <p style="margin: 0; font-size: 14px; color: #dc2626;">
                <strong>⏰ Time-Sensitive:</strong> This question is part of an active learning cycle. Your input within 24 hours helps maintain learning momentum!
              </p>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>PromptFluid Brain</strong> – AI That Flows.</p>
            <p style="margin: 0;">Autonomous learning system • Question sent to ${to_email}</p>
            <p style="margin: 10px 0 0 0;"><a href="https://www.promptfluid.com/brain/settings" style="color: #7A5FFF;">Manage Brain interaction preferences</a></p>
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
        reply_to: 'brain-feedback@promptfluid.com',
        subject: `🤔 Question from Your PromptFluid Brain – ${context.learning_module}`,
        html: emailHtml,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sender.net API error: ${error}`);
    }

    const data = await response.json();

    console.log('[Brain Question] Email sent to:', to_email, '| Module:', context.learning_module);

    return new Response(
      JSON.stringify({ success: true, message_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Brain question email error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
