import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RecommendationSchema = z.object({
  profileHash: z.string().regex(/^profile_\d+_[a-z0-9]+$/),
  currentUrl: z.string().url().max(2048).optional(),
  action: z.string().max(200).optional().default('suggest_fixes')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = RecommendationSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error?.errors || [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { profileHash, currentUrl, action } = validation.data;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user data
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('profile_hash', profileHash)
      .single();

    const { data: recentFixes } = await supabaseClient
      .from('page_fixes')
      .select('*')
      .eq('profile_hash', profileHash)
      .order('last_used_at', { ascending: false })
      .limit(10);

    const { data: bookmarks } = await supabaseClient
      .from('user_bookmarks')
      .select('*')
      .eq('profile_hash', profileHash)
      .order('visit_count', { ascending: false })
      .limit(5);

    const context = {
      profile: profile?.characteristics || {},
      commonFixes: profile?.common_fixes || [],
      recentActivity: recentFixes?.map(f => ({ url: f.site_url, fixes: f.fixes_applied })) || [],
      topSites: bookmarks?.map(b => b.site_url) || [],
      currentUrl
    };

    let prompt = '';
    if (action === 'suggest_fixes') {
      prompt = `Based on this accessibility profile, suggest 3-5 personalized improvements for ${currentUrl || 'this site'}:
Profile: ${JSON.stringify(context.profile)}
Common fixes: ${JSON.stringify(context.commonFixes)}
Recent activity: ${JSON.stringify(context.recentActivity.slice(0, 3))}

Format as JSON array: [{title, description, priority, category, reason}]`;
    } else if (action === 'analyze_patterns') {
      prompt = `Analyze accessibility usage patterns:
${JSON.stringify(context, null, 2)}

Provide: {needs: [], patterns: [], recommendations: [], suggestedSites: []}`;
    } else {
      prompt = `As an accessibility AI, provide guidance based on: ${JSON.stringify(context)}
Question: ${action}`;
    }

    const result = await callFreeTierAI(prompt, {
      systemPrompt: 'You are an accessibility AI providing personalized recommendations. Always respond with valid JSON when requested.',
      temperature: 0.6
    });

    let parsedRecommendation;
    try {
      parsedRecommendation = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      parsedRecommendation = { text: result.content };
    }

    if (profile) {
      await supabaseClient
        .from('user_profiles')
        .update({
          last_used_at: new Date().toISOString(),
          usage_count: (profile.usage_count || 0) + 1
        })
        .eq('profile_hash', profileHash);
    }

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: parsedRecommendation,
        provider: result.provider,
        context: {
          profileExists: !!profile,
          totalFixes: recentFixes?.length || 0,
          bookmarkCount: bookmarks?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Recommendations error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
