/**
 * PromptFluid Clarity WordPress Plugin Update Info
 * Provides plugin update information for WordPress auto-update system
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PluginInfoSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z").optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = PluginInfoSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { version, slug } = validation.data;

    const latestVersion = "3.0.0";
    const hasUpdate = version !== latestVersion;

    const response = {
      name: "PromptFluid Clarity – AI Accessibility Scanner",
      slug: "promptfluid-clarity",
      version: latestVersion,
      author: "PromptFluid",
      author_profile: "https://www.promptfluid.com",
      requires: "5.8",
      tested: "6.4",
      requires_php: "7.4",
      download_link: "https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-clarity-generate-zip",
      sections: {
        description: "AI-powered WCAG 2.2 accessibility scanner with automated fixes powered by PromptFluid Brain. Seamlessly integrates with the PromptFluid ecosystem (Vision, Nexus, Access) for comprehensive accessibility management.",
        changelog: `
          <h3>3.0.0 - PromptFluid Clarity Launch</h3>
          <ul>
            <li><strong>Rebranded as PromptFluid Clarity</strong> - Complete integration with PromptFluid ecosystem</li>
            <li><strong>PromptFluid Brain Integration</strong> - AI-powered fix suggestions and learning</li>
            <li><strong>Enhanced UI/UX</strong> - Fluid gradient design matching PromptFluid brand</li>
            <li><strong>Nexus Integration</strong> - Creative generation for alt text and image fixes</li>
            <li><strong>Vision Dashboard Link</strong> - Direct integration with PromptFluid Vision</li>
            <li><strong>Access Integration</strong> - Unified licensing and billing through PromptFluid Access</li>
            <li><strong>Improved Setup Wizard</strong> - Streamlined onboarding experience</li>
            <li><strong>Real-time Monitoring</strong> - Continuous compliance tracking</li>
          </ul>
          <h3>2.0.2 - CMPTBL Beta (Legacy)</h3>
          <ul>
            <li>Added setup wizard with API key integration</li>
            <li>Integrated Stripe payment processing</li>
            <li>Added 7-day free trial</li>
            <li>Early adopter special pricing</li>
            <li>Auto-update functionality</li>
            <li>Enhanced license management</li>
          </ul>
        `
      },
      banners: {
        low: "https://www.promptfluid.com/images/clarity-banner-772x250.png",
        high: "https://www.promptfluid.com/images/clarity-banner-1544x500.png"
      },
      icons: {
        "1x": "https://www.promptfluid.com/images/clarity-icon-128x128.png",
        "2x": "https://www.promptfluid.com/images/clarity-icon-256x256.png"
      }
    };

    if (hasUpdate) {
      return new Response(JSON.stringify({
        ...response,
        new_version: latestVersion,
        package: response.download_link,
        upgrade_notice: "v3.0.0 available! PromptFluid Clarity brings full ecosystem integration with Brain AI, Vision dashboard, and Nexus creative generation. Major upgrade with enhanced accessibility scanning and automated fixes."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
