/**
 * PromptFluid Access - Compliance Badge API
 * Generates and serves accessibility compliance badges
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const badgeId = pathParts[pathParts.length - 1];

    const score = parseInt(url.searchParams.get('score') || '85');
    const wcagLevel = url.searchParams.get('level') || 'AA';
    
    const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
    
    const badgeSvg = `
<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="80" rx="10" fill="${color}"/>
  <text x="100" y="30" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" font-weight="bold">
    PromptFluid Access
  </text>
  <text x="100" y="50" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">
    WCAG ${wcagLevel} Compliant
  </text>
  <text x="100" y="68" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">
    Score: ${score}%
  </text>
</svg>`;

    return new Response(badgeSvg, {
      headers: { ...corsHeaders, 'Content-Type': 'image/svg+xml' }
    });

  } catch (error) {
    console.error('[ACCESS-BADGE] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Badge generation failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
