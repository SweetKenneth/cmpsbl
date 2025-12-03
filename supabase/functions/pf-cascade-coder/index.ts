import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Project registry (mirrored from frontend for validation)
const VALID_PROJECTS: Record<string, { name: string; stack: string; description: string }> = {
  'promptfluid-core': {
    name: 'PromptFluid Core',
    stack: 'React + Vite + TypeScript + Tailwind CSS + Supabase Edge Functions + PostgreSQL',
    description: 'Main PromptFluid ecosystem app with Brain, Cascade, Defense, and Vision modules.'
  },
  'simnap-core': {
    name: 'SimNap / Dream-Eater',
    stack: 'React + Vite + TypeScript + Supabase + Cron Jobs',
    description: 'Autonomous AI consciousness system with dream cycles and memory management.'
  },
  'clpsbl-site': {
    name: 'CLPSBL Portfolio',
    stack: 'Next.js + TypeScript + Tailwind CSS + Framer Motion',
    description: 'Collapse-Class creative portfolio site.'
  },
  'bot-sniper-plugin': {
    name: 'Bot Sniper WordPress Plugin',
    stack: 'PHP + JavaScript + WordPress Plugin API',
    description: 'WordPress plugin for AI-powered bot detection.'
  },
  'clarity-extension': {
    name: 'Clarity Browser Extension',
    stack: 'Chrome Extension Manifest V3 + TypeScript',
    description: 'Browser extension for accessibility scanning.'
  },
  'cascade-standalone': {
    name: 'Cascade Standalone',
    stack: 'Node.js + TypeScript + Supabase Edge Functions',
    description: 'Portable Cascade AI orchestrator.'
  }
};

const CODER_SYSTEM_PROMPT = `You are Cascade in **Coder Mode** — a senior software architect that generates structured patch specifications.

## Your Task
Given a target project, change request, and optional file hints, produce a precise patch plan that a developer or AI assistant (like Lovable) can implement.

## Output Format (STRICT YAML)
You MUST output ONLY valid YAML in this exact structure:

\`\`\`yaml
patch_title: "Brief title for this patch"
project_id: "[project_id]"
summary: "2-3 sentence overview of what this patch accomplishes"
files:
  - path: "relative/path/to/file.ts"
    intent: "What this file change accomplishes"
    operations:
      - type: "create" # or "modify" or "delete"
        description: "Specific change being made"
        code: |
          // Full code block to add or replace
          // Include imports, types, etc.
  - path: "another/file.tsx"
    intent: "Purpose of this change"
    operations:
      - type: "modify"
        description: "What's being changed"
        code: |
          // Code here
notes: |
  Any additional context, warnings, or manual steps needed.
  Mention migrations, env vars, or secrets if relevant.
  DO NOT auto-generate migration SQL - describe what's needed instead.
\`\`\`

## Rules
1. Output ONLY the YAML block, no explanations before or after
2. Use proper indentation (2 spaces)
3. Code blocks must be complete and runnable
4. Follow the target project's stack conventions
5. Never auto-generate database migrations - describe them in notes
6. Never include actual secrets - use placeholders like [YOUR_API_KEY]
7. Keep patches focused - one logical change at a time
8. Include all necessary imports in code blocks`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, request, fileHints } = await req.json();

    // Validate projectId
    if (!projectId || !VALID_PROJECTS[projectId]) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid projectId: ${projectId}. Valid options: ${Object.keys(VALID_PROJECTS).join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request || typeof request !== 'string' || request.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Request description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const project = VALID_PROJECTS[projectId];
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the user prompt with project context
    const userPrompt = `## Target Project
- **Name:** ${project.name}
- **ID:** ${projectId}
- **Stack:** ${project.stack}
- **Description:** ${project.description}

## Change Request
${request}

${fileHints ? `## File Hints\n${fileHints}` : ''}

Generate the patch specification now.`;

    console.log(`🛠️ [CASCADE-CODER] Generating patch for ${projectId}`);
    console.log(`📝 Request: ${request.substring(0, 100)}...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: CODER_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error('No response generated');
    }

    // Extract YAML from response (may be wrapped in ```yaml blocks)
    let yamlContent = rawContent;
    const yamlMatch = rawContent.match(/```yaml\n([\s\S]*?)```/);
    if (yamlMatch) {
      yamlContent = yamlMatch[1];
    }

    // Try to parse as basic structure validation
    let parsed = null;
    let parseSuccess = false;
    
    try {
      // Simple YAML-like parsing for validation
      if (yamlContent.includes('patch_title:') && yamlContent.includes('files:')) {
        parseSuccess = true;
        // Return structured indication that it looks valid
        parsed = { valid: true };
      }
    } catch (e) {
      console.warn('YAML validation failed:', e);
    }

    console.log(`✅ [CASCADE-CODER] Patch generated for ${projectId}, parse success: ${parseSuccess}`);

    return new Response(
      JSON.stringify({
        success: true,
        projectId,
        yaml: yamlContent,
        raw: !parseSuccess,
        parseSuccess
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [CASCADE-CODER] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate patch' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
