import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { output, output_type = 'text', task_context = {} } = await req.json();

    console.log('🔍 Creative Feedback Loop: Reviewing output quality...');

    // Step 1: Self-critique the output
    const critiquePrompt = `You are Cascade's Self-Critique module. Review this output for quality.

Output Type: ${output_type}
Task Context: ${JSON.stringify(task_context)}

Output:
${output}

Evaluate on these dimensions (score each 0-100):
1. CLARITY: Is it easy to understand?
2. ACCURACY: Is the information correct and well-reasoned?
3. AESTHETICS: Is the structure, flow, and presentation polished?
4. COMPLETENESS: Does it fully address the task?

Provide:
- Scores for each dimension
- Overall quality score (average)
- If any score < 80, suggest specific improvements
- Revised output if needed

Return JSON only with: { clarity, accuracy, aesthetics, completeness, overall, improvements: [], revised_output: null or string }`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const critiqueResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are Cascade\'s self-review system. Provide honest, constructive critique in JSON format.' },
          { role: 'user', content: critiquePrompt }
        ],
        temperature: 0.5,
      }),
    });

    const critiqueData = await critiqueResponse.json();
    let critique;
    
    try {
      const critiqueText = critiqueData.choices[0].message.content;
      const jsonMatch = critiqueText.match(/\{[\s\S]*\}/);
      critique = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        clarity: 75,
        accuracy: 75,
        aesthetics: 75,
        completeness: 75,
        overall: 75,
        improvements: [],
        revised_output: null
      };
    } catch (e) {
      console.error('Critique parsing failed:', e);
      critique = {
        clarity: 75,
        accuracy: 75,
        aesthetics: 75,
        completeness: 75,
        overall: 75,
        improvements: ['Unable to parse critique'],
        revised_output: null
      };
    }

    // Step 2: Determine if revision is needed
    const needsRevision = critique.overall < 80 || 
                          critique.clarity < 80 || 
                          critique.accuracy < 80 || 
                          critique.aesthetics < 80 ||
                          critique.completeness < 80;

    // Step 3: Store feedback for learning
    await supabase.from('brain_meta_feedback').insert({
      thought_id: null, // Can link to specific thoughts if available
      validator: 'cascade_self_critique',
      accuracy_score: critique.accuracy / 100,
      confidence: critique.overall / 100,
      reasoning: `Clarity: ${critique.clarity}, Accuracy: ${critique.accuracy}, Aesthetics: ${critique.aesthetics}, Completeness: ${critique.completeness}`,
      improvements_suggested: critique.improvements.join('; '),
      validated: !needsRevision,
    });

    // Step 4: Log critique event
    await supabase.from('brain_events').insert({
      module: 'self_critique',
      event_type: 'output_reviewed',
      data: {
        output_type,
        critique,
        needs_revision: needsRevision,
        revised: critique.revised_output !== null,
      },
      outcome: needsRevision ? 'revision_required' : 'approved',
    });

    console.log(`✅ Self-critique complete: ${critique.overall}/100 overall quality`);

    return new Response(
      JSON.stringify({ 
        success: true,
        critique,
        needs_revision: needsRevision,
        final_output: critique.revised_output || output,
        quality_passed: !needsRevision,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Self-critique error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        final_output: '',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
