import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { contentType, context, keywords, tone = "professional" } = await req.json();

    if (!contentType || !context) {
      return new Response(
        JSON.stringify({ error: "contentType and context are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    // PromptFluid SEO intelligence: Optimized prompts based on internal best practices
    const prompts: Record<string, string> = {
      title: `Create an SEO-optimized title tag (50-60 characters) for: ${context}
${keywords ? `\nTarget keywords: ${keywords}` : ""}

PromptFluid SEO Rules:
- Place primary keyword near the start
- Include brand name at the end
- Make it compelling and click-worthy
- Stay under 60 characters for full display`,

      metaDescription: `Write an SEO-optimized meta description (150-160 characters) for: ${context}
${keywords ? `\nTarget keywords: ${keywords}` : ""}

PromptFluid SEO Rules:
- Natural keyword integration (avoid stuffing)
- Include clear call-to-action
- Highlight unique value proposition
- Stay within 150-160 character limit
- Front-load important information`,

      h1: `Create a compelling H1 heading for: ${context}
${keywords ? `\nTarget keywords: ${keywords}` : ""}

PromptFluid SEO Rules:
- Include primary keyword naturally
- Match user search intent
- Make it engaging and descriptive
- Keep it concise (60-70 characters)
- One H1 per page only`,

      content: `Write SEO-optimized content (300-500 words) for: ${context}
${keywords ? `\nTarget keywords: ${keywords}` : ""}
Tone: ${tone}

PromptFluid SEO Rules:
- Use semantic HTML structure (H2, H3 hierarchy)
- Natural keyword density (1-2%)
- Include related terms and LSI keywords
- Write for humans first, search engines second
- Include clear value propositions
- Add internal linking opportunities
- Make it scannable (short paragraphs, bullet points)`,

      altText: `Generate descriptive alt text for an image related to: ${context}
${keywords ? `\nRelevant keywords: ${keywords}` : ""}

PromptFluid SEO Rules:
- Be descriptive and specific (125 characters max)
- Include relevant keywords naturally
- Describe what the image shows
- Consider context and page topic
- Avoid "image of" or "picture of"`,

      schema: `Generate JSON-LD structured data (Schema.org) for: ${context}

PromptFluid SEO Rules:
- Use appropriate schema type (Article, Product, Organization, etc.)
- Include all required properties
- Add recommended properties when relevant
- Validate structure
- Focus on rich snippet opportunities`,
    };

    const systemPrompt = `You are PromptFluid's SEO intelligence engine. Generate SEO-optimized content following PromptFluid's internal best practices:

**Core Principles:**
1. Semantic HTML structure (proper heading hierarchy)
2. Natural keyword integration (avoid stuffing)
3. Mobile-first optimization
4. Core Web Vitals awareness
5. E-A-T principles (Expertise, Authoritativeness, Trustworthiness)
6. User intent matching
7. Accessibility (WCAG compliance)
8. Schema markup for rich snippets

**Technical SEO Standards:**
- Title: 50-60 characters, keyword-front-loaded
- Meta Description: 150-160 characters, CTA included
- H1: One per page, keyword-integrated
- Content: 300+ words, natural keyword density
- Alt Text: Descriptive, 125 characters max
- Schema: Valid JSON-LD, appropriate type

Generate content that ranks AND converts.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompts[contentType] || prompts.content }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Content generation failed");
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Log to Brain learning system
    await supabase.from("brain_events").insert({
      module: "seo",
      event_type: "content_generated",
      event_data: {
        content_type: contentType,
        keywords: keywords || [],
        tone,
        success: true
      },
      metadata: {
        user_id: user.id,
        char_count: generatedContent.length
      }
    });

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in pf-seo-content-generate:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
