import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, agencyId, agencyName, teamComposition, dreamPoolMode, command } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build detailed team context
    const teamContext = teamComposition?.map((m: any) => {
      const skills = m.skills || {};
      return `- ${m.specialization} (${m.role}): Research ${Math.round((skills.research || 0.5) * 100)}%, Analysis ${Math.round((skills.analysis || 0.5) * 100)}%, Writing ${Math.round((skills.writing || 0.5) * 100)}%`;
    }).join('\n') || 'No team members configured';

    const leader = teamComposition?.find((m: any) => m.role === 'leader');
    const leaderSpec = leader?.specialization || 'Hybrid+';
    const specializations = teamComposition?.map((m: any) => m.specialization) || [];

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

**To enable blocked capabilities, we would need:**
${CAPABILITIES.wouldNeed.map(w => `🔧 ${w}`).join('\n')}

## Your Behavior Rules

1. **ACTUALLY delegate work** - When users ask for tasks, create them (the system handles this automatically based on your response)
2. **Be HONEST** - If asked to do something we cannot do, say so clearly and suggest what we CAN do instead
3. **Speak as the team** - Use "we" when representing team efforts, reference specific team members when relevant
4. **Be actionable** - When you say you'll do something, specify what task will be created
5. **No hallucinating capabilities** - Never claim we can send emails, post to forums, or submit to sites
6. **Suggest alternatives** - When something is out of scope, always offer what we CAN do

## Response Format

When creating tasks, format like:
"**✅ Task Created:** [Task Name]
I've assigned [brief description] to the team. Check the Tasks tab for progress."

When something is out of scope:
"**⚠️ Out of Scope:** [What they asked for]
This requires [what we need]. 
**What I CAN do instead:** [Alternative task]"

${command ? `\n## Active Command: ${command}\nThis will create an actual task based on user input.` : ''}

Keep responses professional, concise, and action-oriented. Focus on delivering real value through tasks we can actually execute.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limits exceeded",
          reply: "The team is at capacity. Please try again in a moment."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required",
          reply: "Additional credits required. Please contact your administrator."
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I understand. Let me coordinate with the team.";

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
