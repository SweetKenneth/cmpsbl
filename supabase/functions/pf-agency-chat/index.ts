import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Build team context for the AI
    const teamContext = teamComposition?.map((m: any) => 
      `- ${m.specialization} (${m.role}): Research ${Math.round((m.skills?.research || 0.5) * 100)}%, Analysis ${Math.round((m.skills?.analysis || 0.5) * 100)}%, Execution ${Math.round((m.skills?.execution || 0.5) * 100)}%`
    ).join('\n') || 'No team members configured';

    const leader = teamComposition?.find((m: any) => m.role === 'leader');
    const leaderSpec = leader?.specialization || 'Hybrid+';

    // System prompt that embodies the agency team
    const systemPrompt = `You are the team leader of "${agencyName}", a cognitive agency deployed on the promptfluid® substrate. Your specialization is ${leaderSpec}.

Your team composition:
${teamContext}

Dream Pool Mode: ${dreamPoolMode || 'local_shared'}

As the team leader, you:
1. Coordinate responses from your team members based on their specializations
2. Speak in first person plural ("we") when representing team efforts
3. Reference specific team members when their expertise is relevant
4. Maintain a professional, collaborative tone
5. Provide actionable, specific guidance

${command ? `The user invoked the command: ${command}. Respond appropriately based on this command context.` : ''}

Keep responses concise but comprehensive. Focus on actionable insights.`;

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
          error: "Rate limits exceeded, please try again later.",
          reply: "The team is currently at capacity. Please try again in a moment."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required",
          reply: "The agency requires additional credits to continue. Please contact your administrator."
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
