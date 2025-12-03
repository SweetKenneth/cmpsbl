/**
 * PromptFluid Defense WordPress Plugin Update Info
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

    const latestVersion = "1.5.3";
    const hasUpdate = version !== latestVersion;

    const response = {
      name: "PromptFluid Reflex – Bot Sniper",
      slug: "promptfluid-reflex",
      version: latestVersion,
      author: "PromptFluid",
      author_profile: "https://www.promptfluid.com",
      requires: "5.8",
      tested: "6.4",
      requires_php: "7.4",
      download_link: "https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-wordpress-generate-zip",
      sections: {
        description: "AI-powered bot protection featuring Bot Sniper™ precision targeting. Stop credential stuffing, spam bots, and automated attacks with advanced behavioral analysis.",
        changelog: `
          <h3>1.5.3</h3>
          <ul>
            <li><strong>Premium Dashboard Experience</strong> - Complete UX overhaul with modern, fluid design</li>
            <li><strong>Installation Wizard</strong> - 5-step animated onboarding for first-time users</li>
            <li><strong>Toast Notifications</strong> - Real-time feedback for all user actions</li>
            <li><strong>Live Module Toggles</strong> - Instant enable/disable protection layers with visual feedback</li>
            <li><strong>Activity Feed</strong> - Real-time threat monitoring with live updates</li>
            <li><strong>Enhanced Security Score</strong> - Animated protection status indicators</li>
            <li><strong>Masked API Keys</strong> - Secure credential display with show/hide toggle</li>
            <li><strong>Smart Onboarding</strong> - Automatic wizard redirect on first install</li>
          </ul>
          <h3>1.5.2</h3>
          <ul>
            <li><strong>Critical Fix:</strong> Stripe checkout integration - upgrade buttons now properly redirect</li>
            <li>Hardcoded Supabase API configuration for reliable payment processing</li>
            <li>Enhanced error logging for payment system debugging</li>
            <li>All admin page references updated to 'promptfluid-reflex' naming</li>
          </ul>
          <h3>1.5.1</h3>
          <ul>
            <li>Updated readme.txt showcasing complete enterprise security suite</li>
            <li>Enhanced plugin description (WAF, File Integrity, Login Guard, Malware Scanner, DDoS protection)</li>
            <li>NEW: Enhanced main dashboard with real-time threat monitoring</li>
            <li>NEW: Interactive security module controls (enable/disable toggles)</li>
            <li>Improved tier breakdown (Lite/Pro/Complete features)</li>
          </ul>
          <h3>1.5.0</h3>
          <ul>
            <li>Introduced Bot Sniper™ precision targeting technology</li>
            <li>Enhanced behavioral analysis with 50+ signal monitoring</li>
            <li>Improved maintainability and error handling</li>
            <li>Performance improvements through streamlined architecture</li>
          </ul>
        `
      },
      banners: {
        low: "https://www.promptfluid.com/images/reflex-banner-772x250.png",
        high: "https://www.promptfluid.com/images/reflex-banner-1544x500.png"
      },
      icons: {
        "1x": "https://www.promptfluid.com/images/reflex-icon-128x128.png",
        "2x": "https://www.promptfluid.com/images/reflex-icon-256x256.png"
      }
    };

    if (hasUpdate) {
      return new Response(JSON.stringify({
        ...response,
        new_version: latestVersion,
        package: response.download_link,
        upgrade_notice: "v1.5.3 available! Premium dashboard experience with installation wizard, toast notifications, and live module toggles. Feels like 2026 software."
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
