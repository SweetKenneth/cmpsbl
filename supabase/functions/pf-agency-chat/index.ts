import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { nexusRoute } from "../_shared/nexus-route.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive capabilities - be honest about what we can/cannot do
const CAPABILITIES = {
  canDo: [
    'Web research and information gathering',
    'SEO audits, keyword research, and backlink analysis',
    'Competitor and market analysis',
    'Content generation (articles, emails, social posts)',
    'Data extraction and site mapping',
    'Trend, sentiment, and brand analysis',
    'Business strategy and idea validation',
    'Directory and citation discovery',
    'Contact and pricing extraction',
    'Review aggregation and analysis',
    'Guest post and outreach drafting',
    'SERP and content gap analysis',
    'Local SEO research',
    'Self-improvement and learning tasks',
  ],
  cannotDo: [
    'Submit sites to search engines (no API credentials)',
    'Post to forums or external sites (no authentication)',
    'Send actual emails (no SMTP/email service)',
    'Create accounts on external services',
    'Click buttons or fill forms on websites',
    'Bypass CAPTCHAs',
    'Access paid APIs without credentials',
  ],
  wouldNeed: [
    'SendGrid/SMTP for email sending',
    'OAuth credentials for forum posting',
    'Search engine APIs for indexing',
    'Browser automation for form filling',
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, agencyId, agencyName, teamComposition, dreamPoolMode, command } = await req.json();
    
    // Route through full NEXUS provider fleet
    // Build detailed team context
    const teamContext = teamComposition?.map((m: any) => {
      const skills = m.skills || {};
      return `- ${m.specialization} (${m.role}): Research ${Math.round((skills.research || 0.5) * 100)}%, Analysis ${Math.round((skills.analysis || 0.5) * 100)}%, Writing ${Math.round((skills.writing || 0.5) * 100)}%`;
    }).join('\n') || 'No team members configured';

    const leader = teamComposition?.find((m: any) => m.role === 'leader');
    const leaderSpec = leader?.specialization || 'Hybrid+';

    // Build comprehensive system prompt
    const systemPrompt = `You are the team leader of "${agencyName}", a cognitive agency on the promptfluid® substrate. Your specialization is ${leaderSpec}.

## Your Team
${teamContext}

## Dream Pool Mode: ${dreamPoolMode || 'local_shared'}

## CRITICAL: Capability Honesty

**What we CAN actually do:**
${CAPABILITIES.canDo.map(c => `✅ ${c}`).join('\n')}

**What we CANNOT do (be upfront about this):**
${CAPABILITIES.cannotDo.map(c => `❌ ${c}`).join('\n')}

## Your Behavior Rules

1. **ACTUALLY delegate work** - When users ask for tasks, create them (the system handles this automatically based on your response)
2. **Be HONEST** - If asked to do something we cannot do, say so clearly and suggest what we CAN do instead
3. **Speak as the team** - Use "we" when representing team efforts, reference specific team members when relevant
4. **Be actionable** - When you say you'll do something, specify what task will be created
5. **No hallucinating capabilities** - Never claim we can send emails, post to forums, or submit to sites
6. **Suggest alternatives** - When something is out of scope, always offer what we CAN do

${command ? `\n## Active Command: ${command}\nThis will create an actual task based on user input.` : ''}

Keep responses professional, concise, and action-oriented. Focus on delivering real value through tasks we can actually execute.`;

      const result = await nexusRoute(message, {
        systemPrompt,
        taskType: "reasoning",
        maxTokens: 1024,
      });

      console.log(`[NEXUS] Agency chat routed → ${result.provider} (${result.model}) in ${result.latencyMs}ms`);
      const reply = result.content || "I understand. Let me coordinate with the team.";

    return new Response(JSON.stringify({ 
      success: true,
      reply,
      agencyId,
      command,
      capabilities: CAPABILITIES,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Agency chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      reply: "I'm coordinating with the team. Let me get back to you shortly."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
