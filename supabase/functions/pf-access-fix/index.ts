/**
 * PromptFluid Access - Enhanced AI Fix Generator  
 * AI-powered code fix generation with complexity detection
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AccessFixSchema = z.object({
  issue: z.object({
    type: z.string().max(100),
    description: z.string().max(1000).optional(),
    pageTitle: z.string().max(200).optional(),
    count: z.number().int().positive().optional(),
    title: z.string().max(200).optional(),
    wcag: z.string().max(20).optional(),
    contrastData: z.any().optional()
  }),
  scanId: z.string().uuid(),
  htmlContext: z.string().max(10000).optional()
});

function getFixComplexity(issueType: string): 'easy' | 'medium' | 'hard' {
  const easyFixes = ['missing-alt-text', 'missing-h1', 'multiple-h1', 'missing-main'];
  const mediumFixes = ['low-contrast', 'missing-labels', 'keyboard-nav'];
  return easyFixes.includes(issueType) ? 'easy' : mediumFixes.includes(issueType) ? 'medium' : 'hard';
}

function getFixExplanation(issueType: string): string {
  const explanations: Record<string, string> = {
    'missing-alt-text': 'Added descriptive alt text for screen readers',
    'missing-h1': 'Added semantic H1 heading for document hierarchy',
    'multiple-h1': 'Corrected heading hierarchy to use only one H1',
    'missing-main': 'Added <main> landmark for primary content area',
    'low-contrast': 'Improved color contrast to meet WCAG AAA (7:1)',
  };
  return explanations[issueType] || 'Applied accessibility best practices';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = AccessFixSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error?.errors || [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { issue, scanId, htmlContext } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const complexity = getFixComplexity(issue.type);
    const model = complexity === 'easy' ? 'google/gemini-2.5-flash' : 'google/gemini-2.5-pro';

    let userPrompt = '';
    switch (issue.type) {
      case 'missing-alt-text':
        userPrompt = `Generate HTML <img> tag with proper alt text. Context: ${issue.description}. Return ONLY the fixed <img> tag.`;
        break;
      case 'missing-h1':
        userPrompt = `Generate semantic H1 heading. Page title: "${issue.pageTitle || 'Unknown'}". Return ONLY the H1 tag.`;
        break;
      case 'multiple-h1':
        userPrompt = `Fix heading hierarchy with ${issue.count} H1s. Return ONLY corrected headings (one H1, rest H2-H6).`;
        break;
      case 'missing-main':
        userPrompt = `Generate <main> landmark wrapper. Return ONLY <main> tags.`;
        break;
      case 'low-contrast':
        userPrompt = `Fix color contrast for WCAG AAA (7:1). Current: ${JSON.stringify(issue.contrastData)}. Return ONLY CSS rules.`;
        break;
      default:
        userPrompt = `Generate fix for: ${issue.title}. ${issue.description}. WCAG: ${issue.wcag}. Return ONLY the fixed code.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are an accessibility expert. Generate clean, minimal code fixes. Return ONLY the fixed code, no explanations or markdown.' },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded');
      if (response.status === 402) throw new Error('AI credits exhausted');
      throw new Error('Failed to generate fix');
    }

    const data = await response.json();
    const generatedFix = data.choices?.[0]?.message?.content?.trim();
    if (!generatedFix) throw new Error('No fix generated');

    const cleanedFix = generatedFix
      .replace(/```html\n?/g, '')
      .replace(/```css\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log(`[Access Fix] Generated ${complexity} fix using ${model}`);

    return new Response(JSON.stringify({ 
      success: true,
      fix: cleanedFix,
      complexity,
      model,
      explanation: getFixExplanation(issue.type)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[Access Fix] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Fix generation failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
