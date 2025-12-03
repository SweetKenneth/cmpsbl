/**
 * PromptFluid Access - Vision Assist Chatbot
 * Real-time accessibility assistance for users with disabilities
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AssistSchema = z.object({
  message: z.string().min(1).max(2000),
  profileHash: z.string().max(64).optional(),
  pageUrl: z.string().url().max(2048).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(10000)
  })).max(50).optional()
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = AssistSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error?.errors || [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, profileHash, pageUrl, conversationHistory } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check for user profile context
    let userContext = "";
    if (profileHash) {
      const { data } = await supabase
        .from("access_profiles")
        .select("*")
        .eq("profile_hash", profileHash)
        .maybeSingle();

      if (data) {
        userContext = `User accessibility needs: ${JSON.stringify(data.accessibility_needs)}. Preferred adjustments: ${JSON.stringify(data.preferences)}.`;
      }
    }

    const systemPrompt = `You are PromptFluid Access AI, helping users with disabilities browse the web.

Your capabilities:
- Adjust font sizes, spacing, line height for readability
- Enable dyslexia-friendly fonts (OpenDyslexic)
- Enhance color contrast for vision impairments
- Generate alt text for missing image descriptions
- Simplify layouts and reduce clutter
- Apply colorblind filters
- Screen reader optimization
- Reduce motion for sensitivity

Be conversational and empathetic. When suggesting fixes:
1. Explain WHY it helps their needs
2. Offer to apply immediately
3. Remember preferences

Current context:
${userContext}
User viewing: ${pageUrl}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Log conversation
    await supabase.from('access_conversations').insert({
      profile_hash: profileHash,
      page_url: pageUrl,
      user_message: message,
      assistant_message: assistantMessage
    });

    return new Response(JSON.stringify({
      success: true,
      message: assistantMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[ACCESS-ASSIST] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Assist failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
