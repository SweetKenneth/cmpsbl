/**
 * PromptFluid Modernizer React Build
 * Phase 5: Converts static HTML to React components
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_id } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: job } = await supabase
      .from('modernizer_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (!job) throw new Error('Job not found');

    const htmlContent = job.rebuilt_files?.files?.[0]?.content || '';
    if (!htmlContent) throw new Error('No HTML content found');

    const systemPrompt = `You are a React component architect. Convert HTML to production-grade React + TypeScript + Tailwind components.

CRITICAL REQUIREMENTS:
- Generate complete, valid React component files
- Use TypeScript with proper types
- Use Tailwind CSS for all styling
- Create modular, reusable components
- Follow React best practices (hooks, composition)
- Export components properly
- No external dependencies beyond React and Tailwind`;

    const prompt = `Convert this HTML to React components:

${htmlContent.substring(0, 10000)}

Generate a complete React project structure with:
1. App.tsx - Main app component
2. components/ - Modular UI components
3. All components properly typed with TypeScript
4. Tailwind classes for styling

Return as JSON array of files:
[
  { "path": "src/App.tsx", "content": "..." },
  { "path": "src/components/Header.tsx", "content": "..." }
]

Return ONLY valid JSON, no explanations.`;

    console.log('🔄 Converting to React components...');
    
    const aiResult = await callFreeTierAI(prompt, {
      maxTokens: 12000,
      temperature: 0.3,
      systemPrompt
    });

    let reactFiles;
    try {
      const cleaned = aiResult.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      reactFiles = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      throw new Error('Invalid React component generation');
    }

    await supabase
      .from('modernizer_jobs')
      .update({ 
        react_files: { files: reactFiles },
        build_type: 'react'
      })
      .eq('id', job_id);

    console.log(`✅ Generated ${reactFiles.length} React components`);

    return new Response(JSON.stringify({ 
      success: true, 
      files: reactFiles,
      count: reactFiles.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('React build error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
