/**
 * AutoBlog Autonomous Scheduler v3.0
 * AI-powered, fully autonomous blog engine
 * 
 * - Uses Lovable AI for unique, deep content every post
 * - 100+ topic seeds across 12 categories
 * - Runs hourly via cron, posts 3-5x/day at optimal times
 * - Zero human intervention needed
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AUTO_CONFIG = {
  TARGET_POSTS_PER_WEEK: 21,       // 3/day average
  MAX_POSTS_PER_DAY: 5,
  OPTIMAL_HOURS_UTC: [6, 8, 10, 12, 14, 16, 18, 20],  // wide window
  COOLDOWN_HOURS: 2,               // reduced cooldown
  WEEKEND_REDUCTION: 0.7,          // still post weekends, just slightly less
};

// ═══════════════════════════════════════════════════════════════
// 100+ TOPIC SEEDS across 12 categories
// ═══════════════════════════════════════════════════════════════
const TOPIC_POOL: Array<{ category: string; topic: string; angle: string }> = [
  // ── Cognitive Architecture (15) ──
  { category: 'cognitive-architecture', topic: 'Memory Tiering in AI Systems', angle: 'How hot/warm/cold memory tiers solve the retention problem' },
  { category: 'cognitive-architecture', topic: 'Self-Improving AI Without Self-Destruction', angle: 'Bounded recursive enhancement and why constraints enable creativity' },
  { category: 'cognitive-architecture', topic: 'Knowledge Graphs vs Traditional Databases', angle: 'Why storing relationships changes everything for AI' },
  { category: 'cognitive-architecture', topic: 'Context Windows Are a Crutch', angle: 'Building AI with true persistent long-term memory' },
  { category: 'cognitive-architecture', topic: 'The Attention Economy Inside AI', angle: 'How cognitive systems prioritize competing demands' },
  { category: 'cognitive-architecture', topic: 'Circuit Breakers for Cognitive Systems', angle: 'Graceful degradation when AI subsystems fail' },
  { category: 'cognitive-architecture', topic: 'Dream Cycles: Offline Learning', angle: 'Why AI systems need downtime to consolidate knowledge' },
  { category: 'cognitive-architecture', topic: 'Semantic Compression in Memory Systems', angle: 'Reducing 10GB of memories to 500MB without losing meaning' },
  { category: 'cognitive-architecture', topic: 'The Multi-Bus Architecture Pattern', angle: 'How event buses create modular cognitive systems' },
  { category: 'cognitive-architecture', topic: 'Cognitive Load Balancing', angle: 'Distributing thinking across specialized subsystems' },
  { category: 'cognitive-architecture', topic: 'Hierarchical Memory Consolidation', angle: 'Learning from neuroscience for AI memory management' },
  { category: 'cognitive-architecture', topic: 'Reflexive vs Deliberative Processing', angle: 'When AI should think fast vs think deep' },
  { category: 'cognitive-architecture', topic: 'State Machines for Cognitive Workflows', angle: 'Deterministic coordination in non-deterministic AI systems' },
  { category: 'cognitive-architecture', topic: 'The Observer Pattern in AI Self-Monitoring', angle: 'How systems watch themselves without infinite regression' },
  { category: 'cognitive-architecture', topic: 'Cognitive Mesh Networks', angle: 'Distributed intelligence across interconnected AI nodes' },

  // ── Evolution & Self-Improvement (12) ──
  { category: 'evolution', topic: 'The 13-Step Evolution Loop', angle: 'How autonomous systems upgrade themselves safely' },
  { category: 'evolution', topic: 'Shadow Testing for AI Changes', angle: 'Proving changes work before deploying to production' },
  { category: 'evolution', topic: 'Version Control for Intelligence', angle: 'Git-like semantics for cognitive state management' },
  { category: 'evolution', topic: 'Confidence Scoring for Self-Modification', angle: 'How AI measures its own certainty before changing itself' },
  { category: 'evolution', topic: 'Rollback Authority in Autonomous Systems', angle: 'Every autonomous change needs an undo button' },
  { category: 'evolution', topic: 'The SEBA Pipeline', angle: 'Seven gates between proposal and production deployment' },
  { category: 'evolution', topic: 'Mutation Fitness Scoring', angle: 'How to rank proposed system changes by value and risk' },
  { category: 'evolution', topic: 'Canary Deployments for AI', angle: 'Graduated exposure for cognitive system updates' },
  { category: 'evolution', topic: 'Autonomous A/B Testing', angle: 'When AI systems design and run their own experiments' },
  { category: 'evolution', topic: 'Evolution Governance Constitutions', angle: 'Written rules that constrain what AI can change about itself' },
  { category: 'evolution', topic: 'The Wisdom of Not Changing', angle: 'Why the best improvement is sometimes no improvement' },
  { category: 'evolution', topic: 'DAG-Based Dependency Sequencing', angle: 'Ensuring mutations apply in the right order' },

  // ── Security & Defense (12) ──
  { category: 'security', topic: 'Prompt Injection Defense in 2026', angle: 'Multi-turn attacks are the new frontier of AI security' },
  { category: 'security', topic: 'Zero Trust for AI Modules', angle: 'Why every cognitive module needs its own identity' },
  { category: 'security', topic: 'Cryptographic Audit Chains', angle: 'Hash-chain integrity for AI decision accountability' },
  { category: 'security', topic: 'Bot Defense at Scale', angle: 'Real-time behavioral analysis vs signature-based detection' },
  { category: 'security', topic: 'Data Sovereignty in Multi-Tenant AI', angle: 'Preventing knowledge bleed between organizations' },
  { category: 'security', topic: 'Defense in Depth for AI Platforms', angle: 'Layered security from input sanitization to output filtering' },
  { category: 'security', topic: 'Threat Modeling for Autonomous Systems', angle: 'When the attacker surface includes the system itself' },
  { category: 'security', topic: 'AI-Powered Anomaly Detection', angle: 'Using AI to protect AI from adversarial inputs' },
  { category: 'security', topic: 'The OWASP Top 10 for LLM Applications', angle: 'Practical security checklist for AI-powered apps' },
  { category: 'security', topic: 'Rate Limiting as Security', angle: 'Why throttling is your first line of defense' },
  { category: 'security', topic: 'Securing Edge Functions', angle: 'Serverless security patterns for AI workloads' },
  { category: 'security', topic: 'Privacy-First AI Architecture', angle: 'Building intelligence without compromising user data' },

  // ── Developer Experience (10) ──
  { category: 'developer', topic: 'Terminal-First Architecture', angle: 'Why CLI beats GUI for system control in AI platforms' },
  { category: 'developer', topic: 'Building on a Cognitive Substrate', angle: 'A developer intro to extending AI operating systems' },
  { category: 'developer', topic: 'API Design for Cognitive Systems', angle: 'Intent-based APIs that express "what" not "how"' },
  { category: 'developer', topic: 'Adding Persistent Memory to Any Agent', angle: 'Three lines of code for cross-session memory' },
  { category: 'developer', topic: 'RAG Without Infrastructure Pain', angle: 'Semantic retrieval without managing vector databases' },
  { category: 'developer', topic: 'Event-Driven AI Architectures', angle: 'Reactive patterns for real-time cognitive systems' },
  { category: 'developer', topic: 'Testing Autonomous AI Systems', angle: 'How to write tests for non-deterministic behavior' },
  { category: 'developer', topic: 'Plugin Architectures for AI', angle: 'Extensibility patterns that maintain system integrity' },
  { category: 'developer', topic: 'Debugging AI Decisions', angle: 'Tools and patterns for understanding why AI did what it did' },
  { category: 'developer', topic: 'CI/CD for Cognitive Systems', angle: 'Continuous deployment when your codebase thinks for itself' },

  // ── Industry Analysis (10) ──
  { category: 'industry', topic: 'The AI Infrastructure Stack in 2026', angle: 'What matters and what is missing in the tooling landscape' },
  { category: 'industry', topic: 'Why AI Agents Will Replace Chatbots', angle: 'The autonomy spectrum from reactive to proactive' },
  { category: 'industry', topic: 'The Real Cost of Building AI Products', angle: 'Honest economics from a team running at near-zero inference cost' },
  { category: 'industry', topic: 'Open Source vs Proprietary AI Models', angle: 'Strategic decisions beyond technical performance' },
  { category: 'industry', topic: 'Enterprise AI Adoption Blockers', angle: 'What CTOs actually care about (hint: not model benchmarks)' },
  { category: 'industry', topic: 'The Memory Layer Gap in AI', angle: 'Why most AI apps still have amnesia and how to fix it' },
  { category: 'industry', topic: 'AI Pricing Models That Work', angle: 'Usage-based, subscription, or credit-based: what works for whom' },
  { category: 'industry', topic: 'The Rise of AI Operating Systems', angle: 'From single-model apps to multi-agent cognitive runtimes' },
  { category: 'industry', topic: 'Vertical AI vs Horizontal Platforms', angle: 'Where value accrues in the AI stack' },
  { category: 'industry', topic: 'AI Regulation Reality Check', angle: 'What the EU AI Act and US executive orders actually mean for builders' },

  // ── Accessibility (8) ──
  { category: 'accessibility', topic: 'AI-Powered Accessibility Scanning', angle: 'Automated WCAG 2.2 compliance detection and remediation' },
  { category: 'accessibility', topic: 'Making the Web Accessible with Automation', angle: 'Why accessibility should be a build step, not an afterthought' },
  { category: 'accessibility', topic: 'Screen Reader Optimization', angle: 'ARIA patterns that actually work in production' },
  { category: 'accessibility', topic: 'Color Contrast Beyond Compliance', angle: 'Design systems that are beautiful AND accessible' },
  { category: 'accessibility', topic: 'Keyboard Navigation Patterns', angle: 'Focus management in complex web applications' },
  { category: 'accessibility', topic: 'Accessibility Legislation in 2026', angle: 'ADA, EAA, and what they mean for digital products' },
  { category: 'accessibility', topic: 'Cognitive Accessibility', angle: 'Designing for neurodivergent users and cognitive load' },
  { category: 'accessibility', topic: 'Mobile Accessibility Gaps', angle: 'The touch-target and gesture problems nobody talks about' },

  // ── Multi-Agent Systems (8) ──
  { category: 'multi-agent', topic: 'Multi-Agent Task Decomposition', angle: 'Breaking complex work into agent-sized pieces' },
  { category: 'multi-agent', topic: 'Agent Communication Protocols', angle: 'How AI agents talk to each other effectively' },
  { category: 'multi-agent', topic: 'Consensus in AI Teams', angle: 'When multiple agents disagree, who wins and why' },
  { category: 'multi-agent', topic: 'The Agency Model', angle: 'Specialized cognitive workers for different business domains' },
  { category: 'multi-agent', topic: 'Agent Competency Scoring', angle: 'Measuring and improving individual agent performance' },
  { category: 'multi-agent', topic: 'Shared Learning Across Agents', angle: 'How one agent success improves the whole team' },
  { category: 'multi-agent', topic: 'Agent Orchestration Patterns', angle: 'Sequential, parallel, and hierarchical coordination' },
  { category: 'multi-agent', topic: 'The Economics of Multi-Agent Systems', angle: 'When adding agents helps vs when it hurts ROI' },

  // ── Observability & Telemetry (8) ──
  { category: 'observability', topic: 'Observability in Autonomous Systems', angle: 'Watching the watcher: monitoring AI that monitors itself' },
  { category: 'observability', topic: 'Telemetry Design for Cognitive Systems', angle: 'What to measure when your system thinks' },
  { category: 'observability', topic: 'The Dashboard Problem', angle: 'Too much data, too little insight in AI monitoring' },
  { category: 'observability', topic: 'Anomaly Detection in AI Workloads', angle: 'Finding problems before they find your users' },
  { category: 'observability', topic: 'Audit Trails for Autonomous Decisions', angle: 'Accountability at machine speed' },
  { category: 'observability', topic: 'Real-Time System Health Scoring', angle: 'Composite health metrics for complex AI platforms' },
  { category: 'observability', topic: 'Log Aggregation for Multi-Agent Systems', angle: 'Making sense of distributed AI execution traces' },
  { category: 'observability', topic: 'Performance Profiling AI Workloads', angle: 'Finding bottlenecks in cognitive processing pipelines' },

  // ── AI Ethics & Governance (8) ──
  { category: 'ethics', topic: 'Ethical Guardrails That Enable Innovation', angle: 'Safety constraints that enable creativity, not prevent it' },
  { category: 'ethics', topic: 'AI Transparency and Explainability', angle: 'Making autonomous decisions understandable to humans' },
  { category: 'ethics', topic: 'Consent Protocols for Autonomous AI', angle: 'When should AI ask permission before acting?' },
  { category: 'ethics', topic: 'Bias Detection in Production AI', angle: 'Runtime monitoring for fairness in AI outputs' },
  { category: 'ethics', topic: 'The Alignment Problem in Practice', angle: 'Real-world alignment challenges beyond theoretical concerns' },
  { category: 'ethics', topic: 'AI Governance Frameworks That Work', angle: 'From principles to enforceable runtime policies' },
  { category: 'ethics', topic: 'Responsible AI Scaling', angle: 'Growing AI capabilities without growing risks proportionally' },
  { category: 'ethics', topic: 'Human-AI Collaboration Models', angle: 'Finding the right balance of autonomy and oversight' },

  // ── Production Engineering (10) ──
  { category: 'production', topic: 'Zero-Downtime Migrations for AI', angle: 'Changing the engine on a moving car' },
  { category: 'production', topic: 'Cost Engineering for AI Systems', angle: 'Running enterprise AI on a bootstrap budget' },
  { category: 'production', topic: 'Caching Strategies for AI Workloads', angle: 'Eliminating 70% of API calls through intelligent caching' },
  { category: 'production', topic: 'Error Handling in AI Pipelines', angle: 'Graceful degradation when LLMs return garbage' },
  { category: 'production', topic: 'Database Optimization for AI Applications', angle: 'When your AI generates more data than your DB can handle' },
  { category: 'production', topic: 'Edge Computing for AI Inference', angle: 'Bringing intelligence closer to users' },
  { category: 'production', topic: 'Queue Architecture for AI Tasks', angle: 'Priority-based processing for heterogeneous AI workloads' },
  { category: 'production', topic: 'Scaling AI Without Scaling Costs', angle: 'Horizontal strategies that keep the bill flat' },
  { category: 'production', topic: 'Disaster Recovery for AI State', angle: 'When your AI forgets everything: backup and restore strategies' },
  { category: 'production', topic: 'Feature Flags for AI Capabilities', angle: 'Progressive rollout of intelligent features' },

  // ── Research Frontiers (9) ──
  { category: 'research', topic: 'Substrate Independence', angle: 'Building AI that outlives its hardware' },
  { category: 'research', topic: 'Emergent Behavior in AI Systems', angle: 'When systems do things we did not explicitly program' },
  { category: 'research', topic: 'Federated Intelligence', angle: 'Learning across boundaries without sharing data' },
  { category: 'research', topic: 'The Consciousness Spectrum', angle: 'Measuring self-awareness properties in AI systems' },
  { category: 'research', topic: 'Composable Intelligence', angle: 'Building complex behaviors from simple cognitive primitives' },
  { category: 'research', topic: 'Neuromorphic Computing for AI', angle: 'Brain-inspired hardware for cognitive workloads' },
  { category: 'research', topic: 'Artificial Curiosity', angle: 'Systems that seek out novel information autonomously' },
  { category: 'research', topic: 'Meta-Learning in Production', angle: 'AI that learns how to learn more efficiently' },
  { category: 'research', topic: 'Cognitive Architectures Beyond Transformers', angle: 'What comes after attention-based models' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 AutoBlog v3.0 Autonomous Scheduler starting...');

    // 1. Check if autoblog is enabled
    const { data: settings } = await sb
      .from('autoblog_settings')
      .select('*')
      .limit(1)
      .single();

    if (!settings?.enabled) {
      return jsonResponse({ ok: true, message: 'AutoBlog disabled', action: 'skip' });
    }

    // 2. Circuit breaker
    if (settings.circuit_state === 'open') {
      return jsonResponse({ ok: true, message: 'Circuit open', action: 'skip' });
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
      return jsonResponse({ ok: true, message: 'Daily limit', action: 'skip', postsToday });
    }

    // 4. Check optimal time
    const hour = new Date().getUTCHours();
    const dayOfWeek = new Date().getUTCDay();
    const isOptimalTime = AUTO_CONFIG.OPTIMAL_HOURS_UTC.includes(hour);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 5. Weekly count
    const weekStart = new Date();
    weekStart.setUTCDate(weekStart.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);

    const { count: postsThisWeek } = await sb
      .from('auto_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', weekStart.toISOString());

    // 6. Cooldown check
    const { data: lastPost } = await sb
      .from('auto_blog_posts')
      .select('published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (lastPost?.published_at) {
      const hoursSince = (Date.now() - new Date(lastPost.published_at).getTime()) / 3600000;
      if (hoursSince < AUTO_CONFIG.COOLDOWN_HOURS) {
        console.log(`⏳ Cooldown (${hoursSince.toFixed(1)}h since last)`);
        return jsonResponse({ ok: true, message: 'Cooldown', action: 'skip' });
      }
    }

    // 7. Posting decision
    const behindSchedule = (postsThisWeek || 0) < Math.floor((dayOfWeek / 7) * AUTO_CONFIG.TARGET_POSTS_PER_WEEK);
    if (!isOptimalTime && !behindSchedule) {
      return jsonResponse({ ok: true, message: 'Not optimal time', action: 'skip' });
    }
    if (isWeekend && Math.random() > AUTO_CONFIG.WEEKEND_REDUCTION && !behindSchedule) {
      return jsonResponse({ ok: true, message: 'Weekend reduction', action: 'skip' });
    }

    console.log('✅ Posting conditions met');

    // 8. Get recent titles to avoid duplicates
    const { data: recentPosts } = await sb
      .from('auto_blog_posts')
      .select('title, topic_seed')
      .order('published_at', { ascending: false })
      .limit(30);

    const recentSlugs = (recentPosts || []).map(p =>
      (p.topic_seed || p.title).toLowerCase()
    );

    // 9. Pick a fresh topic
    const freshTopics = TOPIC_POOL.filter(t =>
      !recentSlugs.some(r =>
        r.includes(t.topic.toLowerCase().split(':')[0].trim().substring(0, 20))
      )
    );

    if (freshTopics.length === 0) {
      console.log('🔄 All topics covered, cycling from pool');
      // If all covered, just pick random — content will still be unique via AI
    }

    const pool = freshTopics.length > 0 ? freshTopics : TOPIC_POOL;
    const selectedTopic = pool[Math.floor(Math.random() * pool.length)];
    console.log(`📝 Topic: ${selectedTopic.topic}`);

    // 10. Get live system stats for context
    const [brainStats, evolutionStats] = await Promise.all([
      sb.from('brain_memory_hot').select('*', { count: 'exact', head: true }),
      sb.from('evolution_runs').select('*', { count: 'exact', head: true }).eq('phase', 'verified'),
    ]);

    const systemContext = {
      memories: brainStats.count || 0,
      evolutions: evolutionStats.count || 0,
    };

    // 11. Generate content via AI or fallback
    let content: { title: string; body: string };

    if (lovableKey) {
      content = await generateWithAI(lovableKey, selectedTopic, systemContext);
    } else {
      content = generateFallbackContent(selectedTopic, systemContext);
    }

    // 12. Publish
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
        excerpt: content.body.substring(0, 250).replace(/[#*`\n]/g, ' ').trim() + '...',
        category: mapCategory(selectedTopic.category),
        status: 'published',
        published_at: new Date().toISOString(),
        topic_seed: selectedTopic.topic,
        word_count: content.body.split(/\s+/).length,
      })
      .select()
      .single();

    if (postError) {
      console.error('❌ Publish error:', postError);
      return jsonResponse({ ok: false, error: postError.message }, 500);
    }

    console.log(`✅ Published: ${post.title} (${content.body.split(/\s+/).length} words)`);

    // 13. Log
    await sb.from('brain_events').insert({
      module: 'autoblog',
      event_type: 'auto_published',
      data: {
        post_id: post.id,
        title: post.title,
        category: selectedTopic.category,
        posts_today: (postsToday || 0) + 1,
        posts_this_week: (postsThisWeek || 0) + 1,
        ai_generated: !!lovableKey,
        execution_ms: Date.now() - startMs,
      },
      outcome: 'completed',
    }).catch(() => {});

    return jsonResponse({
      ok: true,
      action: 'published',
      post: { id: post.id, title: post.title, slug: post.slug },
      stats: {
        posts_today: (postsToday || 0) + 1,
        posts_this_week: (postsThisWeek || 0) + 1,
        topics_remaining: freshTopics.length - 1,
        ai_generated: !!lovableKey,
        execution_ms: Date.now() - startMs,
      },
    });

  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return jsonResponse({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// AI Content Generation via Lovable AI Gateway
// ═══════════════════════════════════════════════════════════════
async function generateWithAI(
  apiKey: string,
  topic: { category: string; topic: string; angle: string },
  ctx: { memories: number; evolutions: number }
): Promise<{ title: string; body: string }> {
  try {
    const systemPrompt = `You are a senior technical writer at CMPSBL (pronounced "composable"), an AI operating system company. 
You write authoritative, insightful blog posts about AI infrastructure, cognitive architectures, and production AI systems.

STYLE:
- Write like a thoughtful engineer sharing hard-won lessons, not a marketer
- Be specific with numbers and concrete examples
- Use analogies that make complex concepts accessible
- Include code snippets or system commands where relevant
- Avoid buzzwords, hype, and generic AI platitudes
- Reference real patterns: circuit breakers, memory tiering, knowledge graphs, evolution pipelines
- 1500-2500 words, well-structured with H2/H3 headings
- End with actionable takeaways

CONTEXT: The CMPSBL substrate runs ${ctx.memories} active memories and ${ctx.evolutions} verified evolution cycles. It has 40 autonomous nodes, 12 sectors, and 940+ capabilities.`;

    const userPrompt = `Write a deep, original blog post about: "${topic.topic}"
Angle: ${topic.angle}
Category: ${topic.category}

Requirements:
1. Compelling title (no emoji, professional but engaging)
2. Opening hook that frames a real problem
3. Technical substance with specific patterns and trade-offs
4. At least one code snippet or system command example
5. Real-world production context (not theoretical)
6. Actionable conclusion

Format your response as:
TITLE: [your title]
---
[full markdown blog content]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error(`AI gateway error: ${response.status}`);
      throw new Error(`AI gateway ${response.status}`);
    }

    const data = await response.json();
    const fullContent = data.choices?.[0]?.message?.content || '';

    // Parse title and body
    const titleMatch = fullContent.match(/TITLE:\s*(.+)/);
    const parts = fullContent.split('---');
    const body = (parts.length > 1 ? parts.slice(1).join('---') : fullContent).trim();
    const title = titleMatch?.[1]?.trim() || topic.topic;

    if (body.length < 500) {
      throw new Error('Content too short');
    }

    // Append footer
    const footer = `\n\n---\n\n*This post was generated autonomously by the CMPSBL substrate's AutoBlog engine, drawing on live system data and real architectural patterns.*\n\n**Category**: ${mapCategoryLabel(topic.category)}  \n**Audience**: Engineers, Researchers, AI Practitioners`;

    return { title, body: body + footer };
  } catch (error) {
    console.error('AI generation failed, using fallback:', error);
    return generateFallbackContent(topic, ctx);
  }
}

// ═══════════════════════════════════════════════════════════════
// Fallback content when AI is unavailable
// ═══════════════════════════════════════════════════════════════
function generateFallbackContent(
  topic: { category: string; topic: string; angle: string },
  ctx: { memories: number; evolutions: number }
): { title: string; body: string } {
  const title = topic.topic;
  const body = `## ${topic.angle}

Building production AI systems requires solving problems that textbooks don't cover. ${topic.topic} is one of those problems—deceptively simple in theory, surprisingly complex in practice.

### The Core Challenge

Every autonomous system faces fundamental tradeoffs between capability and stability, speed and accuracy, learning and exploitation. The key insight: ${topic.angle.toLowerCase()}.

### What Production Teaches You

After running cognitive workloads 24/7 with ${ctx.memories} active memories and ${ctx.evolutions} verified evolution cycles, we've learned:

1. **Constraints enable creativity** — Bounded modification is safer than unbounded freedom
2. **Observability is non-negotiable** — You can't improve what you can't measure
3. **Emergence requires governance** — Novel behaviors need review protocols
4. **Confidence gates matter** — Not every improvement should auto-apply

### The Implementation

\`\`\`
# System commands
brain.status        # Memory distribution
evolve.receipts     # Audit trail
system.health       # Global metrics
\`\`\`

### Why This Matters

${topic.topic} isn't an academic exercise—it's the foundation of systems that self-improve, self-heal, self-optimize, and self-govern according to defined policies.

The frontier is building systems that are capable but constrained, autonomous but auditable, learning but stable.

---

*This post was generated autonomously by the CMPSBL substrate's AutoBlog engine.*

**Category**: ${mapCategoryLabel(topic.category)}  
**Audience**: Engineers, Researchers, AI Practitioners`;

  return { title, body };
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function mapCategory(cat: string): string {
  const m: Record<string, string> = {
    'cognitive-architecture': 'insight',
    'evolution': 'changelog',
    'security': 'insight',
    'developer': 'release',
    'industry': 'general',
    'accessibility': 'insight',
    'multi-agent': 'insight',
    'observability': 'insight',
    'ethics': 'general',
    'production': 'insight',
    'research': 'research',
  };
  return m[cat] || 'general';
}

function mapCategoryLabel(cat: string): string {
  const m: Record<string, string> = {
    'cognitive-architecture': 'Architecture Deep-Dive',
    'evolution': 'Evolution Engineering',
    'security': 'Security & Defense',
    'developer': 'Developer Guide',
    'industry': 'Industry Analysis',
    'accessibility': 'Accessibility',
    'multi-agent': 'Multi-Agent Systems',
    'observability': 'Observability',
    'ethics': 'AI Ethics & Governance',
    'production': 'Production Engineering',
    'research': 'Research Frontier',
  };
  return m[cat] || 'System Log';
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
