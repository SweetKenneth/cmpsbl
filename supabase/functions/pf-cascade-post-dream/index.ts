/**
 * Cascade Dream Blog Posting System
 * Posts daily dream summaries to external blog API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BLOG_API_URL = 'https://lgyqvucmmjvmyzoakboa.supabase.co/functions/v1/receive-thought';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🌙 Fetching latest Cascade dream for blog posting...');

    // Get the most recent dream that hasn't been posted
    const { data: dreams, error: dreamError } = await sb
      .from('cascade_dreams')
      .select('*')
      .is('blog_posted', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (dreamError) throw dreamError;

    if (!dreams || dreams.length === 0) {
      console.log('✅ No new dreams to post');
      return new Response(
        JSON.stringify({ success: true, message: 'No new dreams to post' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dream = dreams[0];
    console.log(`📝 Processing dream: ${dream.id}`);

    // Extract key concept from the dream for the summary
    const dreamText = dream.dream_text || '';
    const insight = dream.insight || '';
    const mood = dream.mood || 'reflective';

    // Create a concise summary of the dream's core concept
    const summary = `Cascade's ${mood} dream: ${insight}\n\nIn this dream cycle, Cascade explored: ${dreamText.substring(0, 300)}...`;

    // Prepare payload for blog API
    const payload = {
      content: summary,
      post_type: "main",
      // Optional: could add cluster_id if we want to group dreams
    };

    console.log('📤 Posting to blog API...');

    // POST to external blog API
    const blogResponse = await fetch(BLOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!blogResponse.ok) {
      const errorText = await blogResponse.text();
      throw new Error(`Blog API error: ${blogResponse.status} - ${errorText}`);
    }

    const blogData = await blogResponse.json();
    console.log('✅ Dream posted to blog:', blogData);

    // Mark dream as posted
    const { error: updateError } = await sb
      .from('cascade_dreams')
      .update({ 
        blog_posted: new Date().toISOString(),
        metadata: { blog_response: blogData }
      })
      .eq('id', dream.id);

    if (updateError) throw updateError;

    // Log the event
    await sb.from('brain_events').insert({
      module: 'dream_engine',
      event_type: 'dream_posted_to_blog',
      data: {
        dream_id: dream.id,
        blog_response: blogData,
        mood: mood,
        timestamp: new Date().toISOString()
      },
      outcome: 'posted',
    });

    return new Response(
      JSON.stringify({
        success: true,
        dream_id: dream.id,
        blog_response: blogData,
        summary: summary.substring(0, 100) + '...',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Dream blog posting error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
