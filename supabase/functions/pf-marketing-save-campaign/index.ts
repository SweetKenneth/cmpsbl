/**
 * PromptFluid Marketing Campaign Saver
 * Persist campaign data with user authentication
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      campaignName,
      strategy, 
      content, 
      imageData, 
      insights,
      variations,
      selectedVariant,
      platforms,
      budget,
      schedule
    } = await req.json();
    
    console.log('Saving campaign for user:', user.id);

    // Determine final messaging
    let finalMessaging = strategy?.messaging || {};
    let finalApproach = strategy?.emotionalTone || 'balanced';
    
    if (selectedVariant && selectedVariant !== 'original' && variations) {
      const variant = variations.variants.find((v: any) => v.id === selectedVariant);
      if (variant) {
        finalMessaging = variant.messaging;
        finalApproach = variant.approach;
      }
    }

    // Save campaign to database
    const { data: campaign, error: saveError } = await supabaseClient
      .from('marketing_campaigns')
      .insert({
        user_id: user.id,
        name: campaignName || 'Untitled Campaign',
        strategy: {
          ...strategy,
          messaging: finalMessaging,
          emotionalTone: finalApproach,
          platforms,
          budget,
          schedule
        },
        content: content || {},
        image_url: imageData?.url || null,
        insights: insights || {},
        variations: variations || {},
        selected_variant: selectedVariant || 'original',
        status: 'draft',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Campaign save error:', saveError);
      throw saveError;
    }

    // Log to Brain for learning
    await supabaseClient.from('brain_memory').insert({
      source: 'campaign_saved',
      content: `Campaign saved: ${campaignName || 'Untitled'}`,
      metadata: { 
        campaignId: campaign.id,
        userId: user.id,
        platforms,
        approach: finalApproach
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        campaign,
        message: 'Campaign saved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Save campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Save failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
