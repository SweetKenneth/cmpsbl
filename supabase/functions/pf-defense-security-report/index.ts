import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { technicalDetails } = await req.json()
    
    const systemPrompt = `You are a professional security analyst creating threat intelligence reports for PromptFluid Defense. Your report must be:
- Professional and technically accurate
- Clear and actionable
- Include risk assessment, attack patterns, and mitigation strategies
- Use security industry terminology
- Structure with clear sections`

    const userPrompt = `Generate a comprehensive security threat report based on these technical findings:

${technicalDetails}

The report should include:
1. Executive Summary
2. Threat Classification and Severity
3. Attack Pattern Analysis
4. Technical Evidence
5. Impact Assessment
6. Recommended Actions
7. Detection Rules Generated

Format this as a professional security report for the PromptFluid Defense system.`

    const result = await callFreeTierAI(userPrompt, {
      systemPrompt,
      temperature: 0.3
    });

    const report = result.content;

    if (!report) throw new Error('No report generated')

    return new Response(
      JSON.stringify({ report, provider: result.provider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating security report:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
