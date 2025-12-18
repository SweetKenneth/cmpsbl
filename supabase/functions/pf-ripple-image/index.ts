import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Image generation requires Lovable AI which uses paid credits
  // This feature is currently disabled for the free tier
  return new Response(
    JSON.stringify({ 
      error: 'Image generation requires Lovable AI credits. Please upgrade to use this feature.',
      success: false 
    }),
    { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});