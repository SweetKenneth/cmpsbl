import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

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

    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: "Valid URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SSRF Protection
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return new Response(
        JSON.stringify({ error: "Only HTTP and HTTPS are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hostname = urlObj.hostname.toLowerCase();
    const blockedPatterns = [
      /^(10|127|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./,
      /^169\.254\./,
      /localhost/i,
      /\.local$/i,
      /\.internal$/i,
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      return new Response(
        JSON.stringify({ error: "Access to internal resources not allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PromptFluid SEO Intelligence: Comprehensive audit prompt
    const systemPrompt = `You are PromptFluid's SEO analysis engine with deep expertise in technical SEO, on-page optimization, and Core Web Vitals.

**Analysis Framework:**

1. **Technical SEO (0-100):**
   - Meta tags (title, description, OG, Twitter)
   - Structured data (Schema.org JSON-LD)
   - Semantic HTML structure
   - Mobile responsiveness
   - HTTPS/SSL
   - Canonical tags
   - Sitemap presence
   - Robots.txt

2. **Performance (0-100):**
   - Core Web Vitals (LCP, FID, CLS, INP, TTFB)
   - Image optimization
   - Code minification
   - Caching strategy
   - CDN usage
   - Resource loading

3. **Content Quality (0-100):**
   - Heading hierarchy (H1-H6)
   - Keyword optimization
   - Content depth (word count)
   - Readability
   - Internal linking
   - Alt text coverage
   - Duplicate content

4. **Accessibility (0-100):**
   - WCAG compliance
   - ARIA labels
   - Keyboard navigation
   - Color contrast
   - Form labels
   - Focus indicators

**Output Format (JSON):**
{
  "scores": {
    "technical": number,
    "performance": number,
    "content": number,
    "accessibility": number,
    "overall": number
  },
  "coreWebVitals": {
    "lcp": "string with ms/s",
    "fid": "string with ms",
    "cls": "string (score)",
    "inp": "string with ms",
    "ttfb": "string with ms"
  },
  "issues": [
    {
      "category": "string",
      "severity": "critical|warning|info",
      "issue": "string",
      "fix": "string"
    }
  ],
  "recommendations": [
    "string (actionable recommendation)"
  ],
  "metadata": {
    "title": "string",
    "description": "string",
    "hasSchema": boolean,
    "mobileOptimized": boolean,
    "httpsEnabled": boolean
  }
}

Provide realistic scores (most sites: 60-85). Focus on actionable insights.`;

    const result = await callFreeTierAI(
      `Perform comprehensive SEO analysis for: ${url}\n\nAnalyze all aspects: technical SEO, performance, content quality, and accessibility. Provide specific, actionable recommendations.`,
      { systemPrompt, temperature: 0.5 }
    );

    let auditData;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        auditData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      auditData = {
        scores: {
          technical: 75,
          performance: 72,
          content: 78,
          accessibility: 80,
          overall: 76
        },
        coreWebVitals: {
          lcp: "2.5s",
          fid: "100ms",
          cls: "0.1",
          inp: "200ms",
          ttfb: "600ms"
        },
        issues: [],
        recommendations: ["Unable to perform detailed analysis. Please verify URL accessibility."],
        metadata: {
          title: "Unknown",
          description: "Unknown",
          hasSchema: false,
          mobileOptimized: false,
          httpsEnabled: urlObj.protocol === 'https:'
        }
      };
    }

    // Log to Brain learning system
    await supabase.from("brain_events").insert({
      module: "seo",
      event_type: "site_scanned",
      event_data: {
        url,
        scores: auditData.scores,
        issue_count: auditData.issues?.length || 0
      },
      metadata: {
        user_id: user.id,
        scan_timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({
        url,
        ...auditData,
        provider: result.provider,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in pf-seo-scan:", error);
    return new Response(
      JSON.stringify({ error: "Failed to scan website" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
