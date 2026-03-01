import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { nexusRoute } from "../_shared/nexus-route.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Topic seeds for auto-generation - covers PromptFluid ecosystem
const TOPIC_SEEDS = [
  // Core Products
  { category: "security", topics: ["RCKBL bot defense updates", "WordPress security trends", "AI-powered threat detection", "Zero-trust architecture", "Real-time bot analysis"] },
  { category: "accessibility", topics: ["WCAG 2.2 compliance tips", "PTCHBL accessibility scanning", "Screen reader optimization", "Color contrast best practices", "Keyboard navigation patterns"] },
  { category: "ai-systems", topics: ["Cascade autonomous dreaming", "AI Nexus routing strategies", "Multi-provider AI orchestration", "Self-healing infrastructure", "Machine learning in production"] },
  { category: "infrastructure", topics: ["Edge function optimization", "Database performance tuning", "API gateway patterns", "Serverless architecture", "Cost optimization strategies"] },
  { category: "industry", topics: ["2025 AI trends", "Enterprise security landscape", "Accessibility legislation updates", "Web performance standards", "Developer experience evolution"] },
  { category: "tutorials", topics: ["Setting up bot defense", "Implementing accessibility fixes", "AI integration patterns", "WordPress plugin development", "React performance optimization"] },
  { category: "philosophy", topics: ["AI ethics in practice", "Building sustainable systems", "Autonomous vs supervised AI", "The future of human-AI collaboration", "Privacy-first design principles"] },
  { category: "case-studies", topics: ["How Cascade learns", "Bot defense in action", "Accessibility transformation stories", "AI cost reduction results", "Real-world security incidents"] },
];

// Generate random schedule for the week (3-5 posts)
function generateWeeklySchedule(): Date[] {
  const now = new Date();
  const schedules: Date[] = [];
  const postsThisWeek = 3 + Math.floor(Math.random() * 3); // 3-5 posts
  
  for (let i = 0; i < postsThisWeek; i++) {
    const dayOffset = Math.floor(Math.random() * 7);
    const hour = 6 + Math.floor(Math.random() * 14); // 6 AM to 8 PM
    const minute = Math.floor(Math.random() * 60);
    
    const postDate = new Date(now);
    postDate.setDate(postDate.getDate() + dayOffset);
    postDate.setHours(hour, minute, 0, 0);
    schedules.push(postDate);
  }
  
  return schedules.sort((a, b) => a.getTime() - b.getTime());
}

// Pick a random topic from seeds
function pickRandomTopic(): { category: string; topic: string } {
  const categoryIndex = Math.floor(Math.random() * TOPIC_SEEDS.length);
  const category = TOPIC_SEEDS[categoryIndex];
  const topicIndex = Math.floor(Math.random() * category.topics.length);
  
  return {
    category: category.category,
    topic: category.topics[topicIndex],
  };
}

// Generate blog post content using AI (free-tier router)
async function generateBlogPost(topic: string, category: string): Promise<{ title: string; content: string; slug: string; excerpt: string }> {
  const systemPrompt = `You are a technical content writer for PromptFluid, an AI infrastructure company. 
Write investor-facing, professional blog posts about AI, security, accessibility, and infrastructure.
Use the Earth theme aesthetic: grounded, breathable, warm earth tones in language.
Include practical insights and avoid hype. Be authentic and technical where appropriate.
Format in markdown with proper headings (H2, H3), bullet points, and code examples where relevant.
Keep posts between 1500-2500 words.
Always reference PromptFluid products naturally: RCKBL (bot defense), PTCHBL (accessibility), Cascade (autonomous AI), AI Nexus (API gateway).`;

  const userPrompt = `Write a comprehensive blog post about: "${topic}"
Category: ${category}
Include:
1. An engaging introduction with the problem/opportunity
2. Key insights with data-driven observations where possible
3. Practical takeaways for enterprise users
4. Natural mentions of how PromptFluid addresses these challenges
5. A forward-looking conclusion

Output format:
TITLE: [Blog post title]
SLUG: [url-friendly-slug]
EXCERPT: [2-3 sentence summary for meta description]
---
[Full blog post content in markdown]`;

  const result = await nexusRoute(userPrompt, {
    systemPrompt,
    taskType: "generation",
    temperature: 0.7,
    maxTokens: 4000,
  });

  const fullContent = result.content;
  const titleMatch = fullContent.match(/TITLE:\s*(.+)/);
  const slugMatch = fullContent.match(/SLUG:\s*(.+)/);
  const excerptMatch = fullContent.match(/EXCERPT:\s*(.+)/);
  const contentMatch = fullContent.split("---")[1]?.trim() || fullContent;
  
  return {
    title: titleMatch?.[1]?.trim() || topic,
    slug: slugMatch?.[1]?.trim() || topic.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    excerpt: excerptMatch?.[1]?.trim() || `Exploring ${topic} in the modern AI landscape.`,
    content: contentMatch,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action } = await req.json().catch(() => ({ action: "generate" }));

    if (action === "schedule") {
      // Generate and store weekly schedule
      const schedule = generateWeeklySchedule();
      const scheduleData = schedule.map((date) => {
        const { category, topic } = pickRandomTopic();
        return {
          scheduled_at: date.toISOString(),
          topic,
          category,
          status: "pending",
        };
      });

      const { error } = await supabase
        .from("auto_blog_schedule")
        .insert(scheduleData);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, scheduled: scheduleData.length, posts: scheduleData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "generate") {
      // Check for due posts
      const { data: duePosts, error: fetchError } = await supabase
        .from("auto_blog_schedule")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_at", new Date().toISOString())
        .limit(1);

      if (fetchError) throw fetchError;

      if (!duePosts || duePosts.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No posts due for generation" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const duePost = duePosts[0];

      // Mark as processing
      await supabase
        .from("auto_blog_schedule")
        .update({ status: "processing" })
        .eq("id", duePost.id);

      try {
        // Generate the blog post
        const blogPost = await generateBlogPost(duePost.topic, duePost.category);

        // Store the generated post
        const { error: insertError } = await supabase
          .from("auto_blog_posts")
          .insert({
            title: blogPost.title,
            slug: blogPost.slug,
            excerpt: blogPost.excerpt,
            content: blogPost.content,
            category: duePost.category,
            topic_seed: duePost.topic,
            status: "published",
            published_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        // Mark schedule as completed
        await supabase
          .from("auto_blog_schedule")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", duePost.id);

        return new Response(
          JSON.stringify({ success: true, post: blogPost }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (genError: unknown) {
        const errorMessage = genError instanceof Error ? genError.message : "Unknown error";
        // Self-healing: mark as failed and reschedule
        await supabase
          .from("auto_blog_schedule")
          .update({ 
            status: "failed", 
            error_message: errorMessage,
            retry_count: (duePost.retry_count || 0) + 1,
          })
          .eq("id", duePost.id);

        // If retries < 3, reschedule for later
        if ((duePost.retry_count || 0) < 3) {
          const retryDate = new Date();
          retryDate.setHours(retryDate.getHours() + 2);
          
          await supabase
            .from("auto_blog_schedule")
            .update({ 
              status: "pending",
              scheduled_at: retryDate.toISOString(),
            })
            .eq("id", duePost.id);
        }

        throw genError;
      }
    }

    if (action === "status") {
      // Get auto blog status
      const { data: pendingPosts } = await supabase
        .from("auto_blog_schedule")
        .select("*")
        .eq("status", "pending")
        .order("scheduled_at", { ascending: true });

      const { data: recentPosts } = await supabase
        .from("auto_blog_posts")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({ 
          success: true, 
          pending: pendingPosts?.length || 0,
          upcomingPosts: pendingPosts || [],
          recentPosts: recentPosts || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: schedule, generate, or status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Auto blog error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
