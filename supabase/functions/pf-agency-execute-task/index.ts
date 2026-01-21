import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Research domains with actual capabilities
const RESEARCH_CAPABILITIES: Record<string, { searchUrl: string; parseHint: string }> = {
  perplexity: { searchUrl: 'https://www.perplexity.ai/search?q=', parseHint: 'AI research answers' },
  github: { searchUrl: 'https://github.com/search?q=', parseHint: 'code repositories' },
  stackoverflow: { searchUrl: 'https://stackoverflow.com/search?q=', parseHint: 'programming Q&A' },
  npmjs: { searchUrl: 'https://www.npmjs.com/search?q=', parseHint: 'npm packages' },
  wikipedia: { searchUrl: 'https://en.wikipedia.org/wiki/Special:Search?search=', parseHint: 'encyclopedia' },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, agencyId, taskType, inputData, memberId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Update task to in_progress
    await supabase
      .from('agency_tasks')
      .update({ 
        status: 'in_progress', 
        started_at: new Date().toISOString(),
        progress: 10 
      })
      .eq('id', taskId);

    // Add initial log
    await supabase.from('agency_task_logs').insert({
      task_id: taskId,
      member_id: memberId,
      log_type: 'info',
      message: `Starting ${taskType} task execution`,
      data: { inputData },
    });

    // Build task-specific prompt
    let systemPrompt = '';
    let userPrompt = inputData?.rawInput || inputData?.topic || '';

    switch (taskType) {
      case 'research':
        systemPrompt = `You are a research specialist. Conduct thorough research and provide comprehensive findings with key insights, sources, and actionable recommendations. Format your response professionally with sections.`;
        userPrompt = `Research the following topic thoroughly: ${userPrompt}`;
        break;

      case 'seo_scan':
        systemPrompt = `You are an SEO specialist. Analyze URLs and websites for SEO best practices, providing specific recommendations for improvement. Cover meta tags, content structure, performance hints, and keyword optimization.`;
        userPrompt = `Perform an SEO analysis for: ${userPrompt}. Provide specific, actionable recommendations.`;
        break;

      case 'code_study':
        systemPrompt = `You are a senior software engineer. Analyze code patterns, architecture decisions, and provide insights about code quality, best practices, and improvement suggestions.`;
        userPrompt = `Study and analyze the following code/repository: ${userPrompt}`;
        break;

      case 'company_research':
        systemPrompt = `You are a business intelligence analyst. Research companies to provide competitive intelligence including their products, market position, recent news, funding, and strategic insights.`;
        userPrompt = `Conduct company research on: ${userPrompt}`;
        break;

      case 'content_creation':
        systemPrompt = `You are a professional content writer. Create engaging, well-structured content that is optimized for the target audience and platform.`;
        userPrompt = `Create content for: ${userPrompt}`;
        break;

      case 'analysis':
        systemPrompt = `You are a data analyst. Analyze information and provide clear insights, patterns, trends, and actionable recommendations based on the data.`;
        userPrompt = `Analyze the following: ${userPrompt}`;
        break;

      case 'audit':
        systemPrompt = `You are a compliance and quality auditor. Perform thorough audits identifying issues, risks, and providing prioritized recommendations for improvement.`;
        userPrompt = `Conduct an audit of: ${userPrompt}`;
        break;

      default:
        systemPrompt = `You are a helpful AI assistant specialized in completing tasks efficiently and thoroughly.`;
    }

    // Update progress
    await supabase
      .from('agency_tasks')
      .update({ progress: 30 })
      .eq('id', taskId);

    // Execute AI call
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2048,
      }),
    });

    // Update progress
    await supabase
      .from('agency_tasks')
      .update({ progress: 70 })
      .eq('id', taskId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      // Mark task as failed
      await supabase
        .from('agency_tasks')
        .update({ 
          status: 'failed', 
          error_message: `AI error: ${response.status}`,
          progress: 0 
        })
        .eq('id', taskId);

      await supabase.from('agency_task_logs').insert({
        task_id: taskId,
        log_type: 'error',
        message: `Task failed: AI gateway error ${response.status}`,
      });

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const result = aiData.choices?.[0]?.message?.content || "Task completed but no output generated.";

    // Extract key insights (simple parsing)
    const insights = extractInsights(result);

    // Complete the task
    await supabase
      .from('agency_tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100,
        output_data: {
          result,
          insights,
          model: 'google/gemini-3-flash-preview',
          completedAt: new Date().toISOString(),
        },
      })
      .eq('id', taskId);

    // Add completion log with insights
    await supabase.from('agency_task_logs').insert({
      task_id: taskId,
      member_id: memberId,
      log_type: 'completion',
      message: 'Task completed successfully',
      data: { insights, wordCount: result.split(/\s+/).length },
    });

    // Add insight logs
    for (const insight of insights.slice(0, 3)) {
      await supabase.from('agency_task_logs').insert({
        task_id: taskId,
        member_id: memberId,
        log_type: 'insight',
        message: insight,
        data: {},
      });
    }

    // If shared learning is enabled, store in dream pool
    const { data: settings } = await supabase
      .from('agency_settings')
      .select('shared_learning_enabled')
      .eq('agency_id', agencyId)
      .single();

    if (settings?.shared_learning_enabled) {
      // Store learning in dream pool for shared memory
      await supabase.from('agency_dream_pool').insert({
        agency_id: agencyId,
        contributor_id: memberId,
        dream_type: 'learning',
        dream_content: `[${taskType}] ${insights.slice(0, 2).join(' | ')}`,
        sentiment_score: 0.8, // Positive learning
        tags: [taskType, 'task_completion'],
        visibility: 'team',
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      taskId,
      result,
      insights,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Task execution error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper to extract key insights from AI response
function extractInsights(text: string): string[] {
  const insights: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletMatches = text.match(/^[•\-\*]\s+.+$/gm);
  if (bulletMatches) {
    insights.push(...bulletMatches.slice(0, 5).map(m => m.replace(/^[•\-\*]\s+/, '')));
  }
  
  // Look for numbered points
  const numberedMatches = text.match(/^\d+\.\s+.+$/gm);
  if (numberedMatches && insights.length < 5) {
    insights.push(...numberedMatches.slice(0, 5 - insights.length).map(m => m.replace(/^\d+\.\s+/, '')));
  }
  
  // If no structured content, take first sentences
  if (insights.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    insights.push(...sentences.slice(0, 3).map(s => s.trim()));
  }
  
  return insights;
}
