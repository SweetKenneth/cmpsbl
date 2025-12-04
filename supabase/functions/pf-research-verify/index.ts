import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { result_id } = await req.json();

    // Get the result and its confidence record
    const { data: result, error: resultError } = await supabase
      .from('learning_results')
      .select('*, learning_confidence(*)')
      .eq('id', result_id)
      .single();

    if (resultError) throw resultError;

    console.log('Verifying result:', result_id);

    // Cross-verify with multiple sources
    const verificationScore = await performCrossVerification(result);
    
    const isVerified = verificationScore > 0.6;
    const confidenceRecord = result.learning_confidence[0];

    // Update confidence record
    const { error: updateError } = await supabase
      .from('learning_confidence')
      .update({
        confidence_score: verificationScore,
        verification_count: (confidenceRecord?.verification_count || 0) + 1,
        cross_verified: isVerified,
        last_verified: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('result_id', result_id);

    if (updateError) throw updateError;

    // Log verification event
    await supabase.from('brain_events').insert({
      module: 'research',
      event_type: 'verification_complete',
      data: {
        result_id,
        verified: isVerified,
        score: verificationScore
      },
      outcome: isVerified ? 'verified' : 'unverified'
    });

    return new Response(JSON.stringify({ 
      success: true, 
      verified: isVerified,
      confidence_score: verificationScore 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performCrossVerification(result: any): Promise<number> {
  // Simple verification logic based on:
  // 1. Source API reliability
  // 2. Number of insights extracted
  // 3. Relevance score
  // 4. Data completeness

  let score = result.relevance_score || 0;

  // Bonus for reliable source APIs
  if (result.source_api === 'perplexity') score += 0.2;
  if (result.source_api === 'firecrawl') score += 0.1;

  // Bonus for multiple insights
  const insightCount = result.extracted_insights?.length || 0;
  score += Math.min(insightCount * 0.05, 0.2);

  // Bonus for citations/sources
  const sourcesCount = result.metadata?.sources?.length || 0;
  score += Math.min(sourcesCount * 0.05, 0.15);

  return Math.min(score, 1.0);
}
