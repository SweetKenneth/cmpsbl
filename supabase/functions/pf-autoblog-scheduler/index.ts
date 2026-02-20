/**
 * AutoBlog Autonomous Scheduler
 * Runs every hour to check if posts should be generated and published
 * 
 * Schedule: 0 * * * * (every hour at minute 0)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Autonomous posting configuration
const AUTO_CONFIG = {
  TARGET_POSTS_PER_WEEK: 5,
  MAX_POSTS_PER_DAY: 3,
  OPTIMAL_HOURS_UTC: [9, 14, 17, 20],
  COOLDOWN_HOURS: 4,
  MIN_CONFIDENCE: 0.75,
  WEEKEND_REDUCTION: 0.5,
};

// Deep topic templates for insightful content
const TOPIC_TEMPLATES = [
  {
    category: 'cognitiveArchitecture',
    topic: 'Memory Tiering: How AI Systems Decide What to Remember',
    hook: 'Your brain forgets 90% of what it experiences. AI systems face the same challenge.',
  },
  {
    category: 'evolutionPatterns',
    topic: 'The Evolution Cycle: How Autonomous Systems Upgrade Themselves',
    hook: 'Every 24 hours, this system decides what version of itself it should become.',
  },
  {
    category: 'practicalInsights',
    topic: 'Why Rate Limiting Matters More Than Raw Speed',
    hook: 'The fastest system isn\'t always the most capable.',
  },
  {
    category: 'researchFrontiers',
    topic: 'Emergent Behavior: When Systems Do Things We Didn\'t Program',
    hook: 'The most interesting behaviors are the ones we didn\'t explicitly code.',
  },
  {
    category: 'developerGuides',
    topic: 'Building on the Substrate: A Developer\'s Introduction',
    hook: 'Want to extend this cognitive system? Here\'s the architecture you need to understand.',
  },
  {
    category: 'cognitiveArchitecture',
    topic: 'Knowledge Graphs Are Not Databases: Emergent Structure in AI Memory',
    hook: 'Traditional databases store facts. Knowledge graphs store relationships.',
  },
  {
    category: 'evolutionPatterns',
    topic: 'Shadow Testing: How We Prove Changes Work Before Deploying',
    hook: 'Production is not a testing environment.',
  },
  {
    category: 'practicalInsights',
    topic: 'Observability in Autonomous Systems: Watching the Watcher',
    hook: 'If an AI makes a decision and no one monitors it, did it really decide?',
  },
  // Wave 2 — fresh topics
  {
    category: 'cognitiveArchitecture',
    topic: 'Circuit Breakers in Cognitive Systems: Graceful Degradation by Design',
    hook: 'The best systems know when to stop trying.',
  },
  {
    category: 'evolutionPatterns',
    topic: 'Confidence Scoring: How AI Measures Its Own Certainty',
    hook: 'An AI that doesn\'t know what it doesn\'t know is a dangerous AI.',
  },
  {
    category: 'practicalInsights',
    topic: 'The Cost of Intelligence: Token Economics in Production AI',
    hook: 'Every API call has a price. Here\'s how we optimize for value, not volume.',
  },
  {
    category: 'researchFrontiers',
    topic: 'Multi-Agent Coordination: When AI Systems Collaborate',
    hook: 'One agent is powerful. A coordinated team of agents is transformative.',
  },
  {
    category: 'developerGuides',
    topic: 'Terminal-First Architecture: Why CLI Beats GUI for System Control',
    hook: 'Point-and-click is intuitive. Command-line is powerful.',
  },
  {
    category: 'cognitiveArchitecture',
    topic: 'Dream Cycles: Offline Learning in Autonomous Systems',
    hook: 'Your brain consolidates memories while you sleep. AI systems can do the same.',
  },
  {
    category: 'evolutionPatterns',
    topic: 'Rollback Authority: The Safety Net for Autonomous Change',
    hook: 'Every autonomous system needs an undo button.',
  },
  {
    category: 'practicalInsights',
    topic: 'Defense in Depth: Layered Security for AI Platforms',
    hook: 'No single security measure is sufficient. Layers win.',
  },
  {
    category: 'researchFrontiers',
    topic: 'Composable Intelligence: Building Complex Behaviors from Simple Primitives',
    hook: 'The most sophisticated behaviors emerge from the simplest building blocks.',
  },
  {
    category: 'developerGuides',
    topic: 'Event-Driven AI: Reactive Architectures for Real-Time Systems',
    hook: 'Polling is dead. Events are the nervous system of modern AI.',
  },
  {
    category: 'cognitiveArchitecture',
    topic: 'Attention Mechanisms in Production: Focusing AI on What Matters',
    hook: 'The hardest problem isn\'t processing information—it\'s deciding what to ignore.',
  },
  {
    category: 'practicalInsights',
    topic: 'Audit Trails for Autonomous Decisions: Accountability at Machine Speed',
    hook: 'If you can\'t explain why a decision was made, you can\'t trust the system that made it.',
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 AutoBlog Autonomous Scheduler starting...');

    // 1. Check if autoblog is enabled
    const { data: settings } = await sb
      .from('autoblog_settings')
      .select('*')
      .limit(1)
      .single();

    if (!settings?.enabled) {
      console.log('❌ AutoBlog disabled');
      return new Response(
        JSON.stringify({ ok: true, message: 'AutoBlog disabled', action: 'skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check circuit breaker
    if (settings.circuit_state === 'open') {
      console.log('⚡ Circuit breaker open, skipping');
      return new Response(
        JSON.stringify({ ok: true, message: 'Circuit open', action: 'skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Count posts today
    const today = new Date().toISOString().slice(0, 10);
    const { count: postsToday } = await sb
      .from('auto_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', `${today}T00:00:00Z`);

    if ((postsToday || 0) >= AUTO_CONFIG.MAX_POSTS_PER_DAY) {
      console.log(`📊 Daily limit reached (${postsToday}/${AUTO_CONFIG.MAX_POSTS_PER_DAY})`);
      return new Response(
        JSON.stringify({ ok: true, message: 'Daily limit reached', action: 'skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check if optimal posting time
    const hour = new Date().getUTCHours();
    const dayOfWeek = new Date().getUTCDay();
    const isOptimalTime = AUTO_CONFIG.OPTIMAL_HOURS_UTC.includes(hour);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 5. Count posts this week
    const weekStart = new Date();
    weekStart.setUTCDate(weekStart.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const { count: postsThisWeek } = await sb
      .from('auto_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', weekStart.toISOString());

    // 6. Check last post time for cooldown
    const { data: lastPost } = await sb
      .from('auto_blog_posts')
      .select('published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (lastPost?.published_at) {
      const hoursSincePost = (Date.now() - new Date(lastPost.published_at).getTime()) / (1000 * 60 * 60);
      if (hoursSincePost < AUTO_CONFIG.COOLDOWN_HOURS) {
        console.log(`⏳ Cooldown active (${hoursSincePost.toFixed(1)}h since last post)`);
        return new Response(
          JSON.stringify({ ok: true, message: 'Cooldown active', action: 'skip' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 7. Decide whether to post
    const needMorePosts = (postsThisWeek || 0) < AUTO_CONFIG.TARGET_POSTS_PER_WEEK;
    const behindSchedule = (postsThisWeek || 0) < Math.floor((dayOfWeek / 7) * AUTO_CONFIG.TARGET_POSTS_PER_WEEK);

    if (!isOptimalTime && !behindSchedule) {
      console.log(`⏰ Not optimal time (${hour}:00 UTC) and on track`);
      return new Response(
        JSON.stringify({ ok: true, message: 'Not posting time', action: 'skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Weekend reduction
    if (isWeekend && Math.random() > AUTO_CONFIG.WEEKEND_REDUCTION && !behindSchedule) {
      console.log('🌴 Weekend reduction active');
      return new Response(
        JSON.stringify({ ok: true, message: 'Weekend reduction', action: 'skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Conditions met for posting');

    // 8. Get recent titles to avoid duplicates
    const { data: recentPosts } = await sb
      .from('auto_blog_posts')
      .select('title, topic_seed')
      .order('published_at', { ascending: false })
      .limit(15);

    const recentTopics = (recentPosts || []).map(p => p.topic_seed?.toLowerCase() || p.title.toLowerCase());

    // 9. Pick a fresh topic
    const freshTopics = TOPIC_TEMPLATES.filter(t => 
      !recentTopics.some(recent => 
        recent.includes(t.topic.toLowerCase().split(':')[0].trim())
      )
    );

    if (freshTopics.length === 0) {
      console.log('🔄 All topics recently covered, waiting');
      return new Response(
        JSON.stringify({ ok: true, message: 'No fresh topics', action: 'skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const selectedTopic = freshTopics[Math.floor(Math.random() * freshTopics.length)];
    console.log(`📝 Selected topic: ${selectedTopic.topic}`);

    // 10. Generate content
    const content = await generateContent(sb, selectedTopic);
    if (!content) {
      console.log('❌ Content generation failed');
      return new Response(
        JSON.stringify({ ok: false, message: 'Content generation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 11. Publish
    const slug = content.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60) + '-' + Date.now().toString(36);

    const { data: post, error: postError } = await sb
      .from('auto_blog_posts')
      .insert({
        title: content.title,
        slug,
        content: content.body,
        excerpt: content.body.substring(0, 200).replace(/[#*`]/g, '') + '...',
        category: getCategoryFromType(selectedTopic.category),
        status: 'published',
        published_at: new Date().toISOString(),
        topic_seed: selectedTopic.topic,
      })
      .select()
      .single();

    if (postError) {
      console.error('❌ Publish error:', postError);
      await logEvent(sb, 'auto_publish_failed', { error: postError.message });
      return new Response(
        JSON.stringify({ ok: false, error: postError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`✅ Published: ${post.title}`);

    // 12. Log success
    await logEvent(sb, 'auto_published', {
      post_id: post.id,
      title: post.title,
      category: selectedTopic.category,
      posts_today: (postsToday || 0) + 1,
      posts_this_week: (postsThisWeek || 0) + 1,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        action: 'published',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
        },
        stats: {
          posts_today: (postsToday || 0) + 1,
          posts_this_week: (postsThisWeek || 0) + 1,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateContent(
  sb: ReturnType<typeof createClient>,
  template: typeof TOPIC_TEMPLATES[0]
): Promise<{ title: string; body: string } | null> {
  try {
    // Get brain context
    const { count: memoryCount } = await sb
      .from('brain_memory_hot')
      .select('*', { count: 'exact', head: true });

    const { count: evolutionCount } = await sb
      .from('evolution_runs')
      .select('*', { count: 'exact', head: true })
      .eq('phase', 'verified');

    // Build rich content
    const title = `🧠 ${template.topic}`;
    const body = `## ${template.hook}

This isn't theoretical—it's the reality of building cognitive systems that need to think, learn, and improve autonomously.

### The Core Challenge

Every ${template.category === 'cognitiveArchitecture' ? 'cognitive system' : 'autonomous system'} faces fundamental tradeoffs between capability and stability, speed and accuracy, learning and exploitation.

### What We've Learned

Building the cognitive substrate has taught us:

1. **Constraints enable creativity** — Bounded modification is safer than unbounded freedom
2. **Observability is non-negotiable** — You can't improve what you can't measure  
3. **Emergence requires governance** — Novel behaviors need human review protocols
4. **Confidence gates matter** — Not every improvement should auto-apply

### The Implementation

The substrate currently maintains **${memoryCount || 0} active memories** and has completed **${evolutionCount || 0} verified evolution cycles**.

Query the system:
\`\`\`
brain.status        # Memory distribution
evolve.receipts     # Audit trail
system.health       # Global metrics
\`\`\`

### Why This Matters

${template.topic.split(':')[0]} isn't just an academic exercise—it's the foundation of systems that can:

- **Self-improve** without waiting for manual updates
- **Self-heal** when things go wrong
- **Self-optimize** based on usage patterns
- **Self-govern** according to defined policies

### Looking Forward

The frontier of cognitive architecture is about building systems that are:
- **Capable** but constrained
- **Autonomous** but auditable
- **Learning** but stable

---

*This post was generated autonomously by the substrate's AutoBlog engine, reflecting on its own architecture.*

**Classification**: ${getCategoryLabel(template.category)}  
**Audience**: Developers, Researchers, AI Enthusiasts`;

    return { title, body };
  } catch (error) {
    console.error('Content generation error:', error);
    return null;
  }
}

function getCategoryFromType(category: string): string {
  const mapping: Record<string, string> = {
    'cognitiveArchitecture': 'insight',
    'evolutionPatterns': 'changelog',
    'practicalInsights': 'insight',
    'researchFrontiers': 'research',
    'developerGuides': 'release',
  };
  return mapping[category] || 'general';
}

function getCategoryLabel(category: string): string {
  const mapping: Record<string, string> = {
    'cognitiveArchitecture': 'Architecture Deep-Dive',
    'evolutionPatterns': 'Evolution Engineering',
    'practicalInsights': 'Production Insights',
    'researchFrontiers': 'Research Frontier',
    'developerGuides': 'Developer Guide',
  };
  return mapping[category] || 'System Log';
}

async function logEvent(
  sb: ReturnType<typeof createClient>,
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await sb.from('brain_events').insert({
      module: 'autoblog',
      event_type: eventType,
      data,
      outcome: 'completed',
    });
  } catch (e) {
    console.error('Failed to log event:', e);
  }
}
