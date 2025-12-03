/**
 * Cascade v4.0.0 - Human Feedback Adapter
 * Captures admin corrections and learns from tone/edits
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { 
      user_id, 
      original_output_id, 
      original_text, 
      correction, 
      feedback_type = 'correction' 
    } = await req.json();

    if (!correction || !original_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📝 Processing human feedback from ${user_id}`);

    // Calculate edit distance
    const editDistance = levenshteinDistance(original_text, correction);
    const maxLen = Math.max(original_text.length, correction.length);
    const similarity = 1 - (editDistance / maxLen);

    // Simple tone analysis (positive words = higher score)
    const positiveWords = ['good', 'better', 'improve', 'excellent', 'clear', 'helpful'];
    const negativeWords = ['bad', 'wrong', 'unclear', 'confusing', 'incorrect'];
    
    const correctionLower = correction.toLowerCase();
    const positiveCount = positiveWords.filter(w => correctionLower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => correctionLower.includes(w)).length;
    const toneScore = Math.max(0, Math.min(1, 0.5 + (positiveCount - negativeCount) * 0.1));

    // Store feedback
    const { data: feedback, error } = await sb
      .from('human_feedback')
      .insert({
        user_id,
        original_output_id,
        correction,
        tone_score: toneScore,
        edit_distance: editDistance,
        feedback_type
      })
      .select()
      .single();

    if (error) throw error;

    // Queue for training if substantial correction
    if (similarity < 0.8) {
      await sb.from('brain_events').insert({
        event_type: 'feedback_training_queued',
        module: 'feedback_adapter',
        data: {
          feedback_id: feedback.id,
          similarity,
          tone_score: toneScore,
          priority: 'high'
        },
        outcome: 'queued'
      });
      console.log(`🔄 Queued for retraining (similarity: ${similarity.toFixed(2)})`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        feedback_id: feedback.id,
        similarity,
        tone_score: toneScore,
        queued_for_training: similarity < 0.8
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Feedback processing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
