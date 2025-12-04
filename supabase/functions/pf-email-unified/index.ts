import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Service role authentication - only internal systems can call this
    const authHeader = req.headers.get('Authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (providedKey !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Service role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const { action, ...params } = await req.json();
    
    const result: any = {
      action,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    switch (action) {
      case 'brain_daily_recap':
        try {
          const { data: recap } = await supabase
            .from('brain_daily_reports')
            .select('*')
            .order('report_date', { ascending: false })
            .limit(1)
            .single();

          if (recap) {
            await resend.emails.send({
              from: 'PromptFluid Brain <brain@promptfluid.com>',
              to: [params.email],
              subject: `Brain Daily Recap - ${new Date().toLocaleDateString()}`,
              html: `
                <h1>Daily Brain Activity Recap</h1>
                <h2>Learning Activity</h2>
                <p>Queries completed: ${recap.learning_activity?.queries_completed || 0}</p>
                <p>New insights: ${recap.learning_activity?.new_insights || 0}</p>
                <h2>Key Findings</h2>
                <p>${recap.findings_summary || 'No findings today'}</p>
              `
            });
            result.sent = true;
          }
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'brain_question':
        try {
          await resend.emails.send({
            from: 'PromptFluid Brain <brain@promptfluid.com>',
            to: [params.email],
            subject: params.subject || 'Brain Has a Question',
            html: `
              <h1>Cascade Brain Question</h1>
              <p>${params.question}</p>
              <p><a href="${params.response_link}">Respond Here</a></p>
            `
          });
          result.sent = true;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'brain_report':
        try {
          const report = params.report || {};
          await resend.emails.send({
            from: 'PromptFluid Brain <brain@promptfluid.com>',
            to: [params.email],
            subject: params.subject || 'Brain Report',
            html: `
              <h1>Brain Report</h1>
              <p><strong>Period:</strong> ${report.period || 'N/A'}</p>
              <p><strong>Summary:</strong> ${report.summary || 'No summary available'}</p>
              <hr>
              <p>${report.content || ''}</p>
            `
          });
          result.sent = true;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'password_reset':
        try {
          await resend.emails.send({
            from: 'PromptFluid <noreply@promptfluid.com>',
            to: [params.email],
            subject: 'Password Reset Request',
            html: `
              <h1>Password Reset</h1>
              <p>Click the link below to reset your password:</p>
              <p><a href="${params.reset_link}">Reset Password</a></p>
              <p>This link expires in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `
          });
          result.sent = true;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'welcome':
        try {
          await resend.emails.send({
            from: 'PromptFluid <welcome@promptfluid.com>',
            to: [params.email],
            subject: 'Welcome to PromptFluid',
            html: `
              <h1>Welcome to PromptFluid! 🌊</h1>
              <p>Hi ${params.name || 'there'},</p>
              <p>We're excited to have you join the PromptFluid ecosystem.</p>
              <h2>Getting Started</h2>
              <ul>
                <li>Explore your dashboard</li>
                <li>Configure your first module</li>
                <li>Check out the documentation</li>
              </ul>
              <p><a href="${params.dashboard_link || 'https://www.promptfluid.com'}">Go to Dashboard</a></p>
            `
          });
          result.sent = true;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown email action: ${action}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Email unified error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
