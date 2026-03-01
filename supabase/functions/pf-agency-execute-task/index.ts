/**
 * pf-agency-execute-task v4.0.0
 * 
 * Complete task execution with ALL executable primitives
 * Handlers: Groq (primary AI) + Firecrawl (web) + Lovable AI (fallback)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { nexusRoute } from "../_shared/nexus-route.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Circuit breaker state
const circuitState: Record<string, { failures: number; lastFailure: number; state: 'closed' | 'open' | 'half-open' }> = {};
const CIRCUIT_BREAKER = { failureThreshold: 3, openDurationMs: 60000 };

// ============================================
// PROVIDERS
// ============================================
// Get Firecrawl API key - check both manual and connector secrets
function getFirecrawlApiKey(): string | undefined {
  return Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
}

const PROVIDERS = {
  firecrawl: {
    enabled: () => !!getFirecrawlApiKey(),
    scrape: async (url: string) => {
      const apiKey = getFirecrawlApiKey();
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
      });
      if (!response.ok) throw new Error(`Firecrawl scrape error: ${response.status}`);
      const data = await response.json();
      return data.data?.markdown || data.markdown || '';
    },
    search: async (query: string, limit: number = 5) => {
      const apiKey = getFirecrawlApiKey();
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit, scrapeOptions: { formats: ['markdown'] } }),
      });
      if (!response.ok) throw new Error(`Firecrawl search error: ${response.status}`);
      const data = await response.json();
      return data.data || [];
    },
    map: async (url: string, limit: number = 100) => {
      const apiKey = getFirecrawlApiKey();
      const response = await fetch('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, limit, includeSubdomains: false }),
      });
      if (!response.ok) throw new Error(`Firecrawl map error: ${response.status}`);
      const data = await response.json();
      return data.links || [];
    },
  },
};

// ============================================
// HELPERS
// ============================================
function isCircuitOpen(provider: string): boolean {
  const state = circuitState[provider];
  if (!state) return false;
  if (state.state === 'open') {
    if (Date.now() - state.lastFailure > CIRCUIT_BREAKER.openDurationMs) {
      state.state = 'half-open';
      return false;
    }
    return true;
  }
  return false;
}

function recordCircuitResult(provider: string, success: boolean): void {
  if (!circuitState[provider]) {
    circuitState[provider] = { failures: 0, lastFailure: 0, state: 'closed' };
  }
  if (success) {
    circuitState[provider].failures = 0;
    circuitState[provider].state = 'closed';
  } else {
    circuitState[provider].failures++;
    circuitState[provider].lastFailure = Date.now();
    if (circuitState[provider].failures >= CIRCUIT_BREAKER.failureThreshold) {
      circuitState[provider].state = 'open';
    }
  }
}

async function updateProgress(supabase: any, taskId: string, progress: number, message?: string): Promise<boolean> {
  const { data: task } = await supabase.from('agency_tasks').select('status').eq('id', taskId).single();
  if (task?.status === 'cancelled') return false;
  await supabase.from('agency_tasks').update({ progress, updated_at: new Date().toISOString() }).eq('id', taskId);
  if (message) {
    await supabase.from('agency_task_logs').insert({ task_id: taskId, log_type: 'progress', message, data: { progress } });
  }
  return true;
}

// AI completion — routes through full NEXUS fleet with automatic cascade
async function aiComplete(systemPrompt: string, userPrompt: string): Promise<{ content: string; provider: string }> {
  try {
    const result = await nexusRoute(userPrompt, {
      systemPrompt,
      taskType: "reasoning",
      temperature: 0.7,
      maxTokens: 4000,
    });
    return { content: result.content, provider: `${result.provider}/${result.model}` };
  } catch (err) {
    console.error('[NEXUS] Full fleet failed for aiComplete:', err);
    return { content: 'AI providers temporarily unavailable.', provider: 'fallback' };
  }
}

// Web research with Firecrawl
async function webResearch(query: string): Promise<{ content: string; sources: string[] }> {
  const sources: string[] = [];
  let content = '';
  if (PROVIDERS.firecrawl.enabled() && !isCircuitOpen('firecrawl')) {
    try {
      const results = await PROVIDERS.firecrawl.search(query, 5);
      recordCircuitResult('firecrawl', true);
      for (const result of results.slice(0, 3)) {
        if (result.markdown) {
          content += `\n\n## ${result.title || 'Source'}\n${result.markdown.slice(0, 2000)}`;
          sources.push(result.url);
        }
      }
    } catch (err) {
      console.warn('Firecrawl search failed:', err);
      recordCircuitResult('firecrawl', false);
    }
  }
  if (content) {
    const synthesis = await aiComplete('You are a research analyst. Synthesize the web content into a comprehensive, well-organized report.', `Query: ${query}\n\nContent:\n${content.slice(0, 8000)}`);
    return { content: synthesis.content, sources };
  }
  const fallback = await aiComplete('You are a research specialist. Provide comprehensive information based on your knowledge.', `Research: ${query}`);
  return { content: fallback.content, sources: ['AI Knowledge Base'] };
}

async function scrapeUrl(url: string): Promise<string> {
  if (PROVIDERS.firecrawl.enabled() && !isCircuitOpen('firecrawl')) {
    try {
      const content = await PROVIDERS.firecrawl.scrape(url);
      recordCircuitResult('firecrawl', true);
      return content;
    } catch (err) {
      console.warn('Firecrawl scrape failed:', err);
      recordCircuitResult('firecrawl', false);
    }
  }
  return '';
}

function extractInsights(text: string): string[] {
  const insights: string[] = [];
  const bulletMatches = text.match(/^[•\-\*]\s+.{20,150}$/gm);
  if (bulletMatches) insights.push(...bulletMatches.slice(0, 5).map(m => m.replace(/^[•\-\*]\s+/, '').trim()));
  const numberedMatches = text.match(/^\d+\.\s+.{20,150}$/gm);
  if (numberedMatches && insights.length < 5) insights.push(...numberedMatches.slice(0, 5 - insights.length).map(m => m.replace(/^\d+\.\s+/, '').trim()));
  if (insights.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 200);
    insights.push(...sentences.slice(0, 3).map(s => s.trim()));
  }
  return [...new Set(insights)].slice(0, 5);
}

// ============================================
// ALL TASK HANDLERS
// ============================================
const TASK_HANDLERS: Record<string, (input: string, supabase: any, taskId: string) => Promise<{ result: string; sources: string[]; provider: string }>> = {
  
  // ========== RESEARCH ==========
  web_research: async (input) => {
    const research = await webResearch(input);
    return { result: research.content, sources: research.sources, provider: 'firecrawl+groq' };
  },

  competitive_profile: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    let pageContent = '';
    const sources: string[] = [];
    if (urlMatch) { pageContent = await scrapeUrl(urlMatch[0]); sources.push(urlMatch[0]); }
    const research = await webResearch(`${input} competitor analysis market position`);
    sources.push(...research.sources);
    const analysis = await aiComplete(
      `You are a competitive intelligence analyst. Create a comprehensive competitor profile including:
- Company Overview (what they do, target market)
- Key Products/Services
- Pricing Strategy (if discoverable)
- Strengths and Weaknesses
- Market Positioning
- Key Differentiators`,
      `Analyze: ${input}\n\nPage content:\n${pageContent.slice(0, 4000)}\n\nResearch:\n${research.content.slice(0, 4000)}`
    );
    return { result: analysis.content, sources, provider: analysis.provider };
  },

  market_research: async (input) => {
    const research = await webResearch(`${input} market size trends key players opportunities`);
    const analysis = await aiComplete(
      `You are a market research analyst. Create a market report including:
- Market Overview & Size
- Key Players & Market Share
- Industry Trends
- Growth Opportunities
- Challenges & Threats
- Market Forecast`,
      `Market: ${input}\n\nResearch:\n${research.content.slice(0, 6000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: 'firecrawl+' + analysis.provider };
  },

  trend_analysis: async (input) => {
    const research = await webResearch(`${input} trends 2024 2025 emerging developments`);
    const analysis = await aiComplete(
      `You are a trend analyst. Create a comprehensive trend report:
- Current State of ${input}
- Emerging Trends (5-7 key trends)
- Data & Statistics
- Future Predictions
- Opportunities to Watch
- Risk Factors`,
      `Topic: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  brand_analysis: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    let pageContent = '';
    const sources: string[] = [];
    if (urlMatch) { pageContent = await scrapeUrl(urlMatch[0]); sources.push(urlMatch[0]); }
    const research = await webResearch(`${input} brand reputation reviews`);
    sources.push(...research.sources);
    const analysis = await aiComplete(
      `You are a brand strategist. Create a brand analysis:
- Brand Identity & Positioning
- Visual Identity Assessment
- Messaging & Tone
- Online Presence Audit
- Competitor Comparison
- Improvement Recommendations`,
      `Brand: ${input}\n\nWebsite content:\n${pageContent.slice(0, 3000)}\n\nResearch:\n${research.content.slice(0, 3000)}`
    );
    return { result: analysis.content, sources, provider: analysis.provider };
  },

  niche_discovery: async (input) => {
    const research = await webResearch(`${input} underserved niche opportunities gaps market`);
    const analysis = await aiComplete(
      `You are a market opportunity analyst. Find underserved niches:
- Identified Niches (5-7 opportunities)
- Market Gaps
- Competition Level for each
- Opportunity Scores (1-10)
- Entry Barriers
- Recommended Approach for Top 3`,
      `Industry: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  audience_research: async (input) => {
    const research = await webResearch(`${input} target audience demographics behavior pain points`);
    const analysis = await aiComplete(
      `You are an audience research specialist. Create audience profile:
- Demographics (age, location, income, etc.)
- Psychographics (interests, values, lifestyle)
- Pain Points & Challenges
- Buying Behavior
- Preferred Channels
- Messaging Angles`,
      `Product/Industry: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  // ========== SEO ==========
  seo_audit: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    let pageContent = '';
    const sources: string[] = [];
    if (urlMatch) { pageContent = await scrapeUrl(urlMatch[0]); sources.push(urlMatch[0]); }
    const audit = await aiComplete(
      `You are an SEO expert. Perform a comprehensive SEO audit including:
- Technical SEO (page structure, meta tags, headings)
- Content Quality (keyword usage, readability, length)
- On-Page SEO Score (1-100)
- Key Issues Found
- Priority Recommendations
- Quick Wins`,
      `Audit: ${input}\n\nPage content:\n${pageContent.slice(0, 6000)}`
    );
    return { result: audit.content, sources, provider: audit.provider };
  },

  keyword_research: async (input) => {
    const research = await webResearch(`${input} keywords SEO search volume intent`);
    const analysis = await aiComplete(
      `You are an SEO keyword specialist. Create a keyword research report:
- Primary Keywords (5-10)
- Long-tail Keywords (10-15)
- Search Intent Analysis
- Keyword Difficulty Assessment
- Content Opportunity Gaps
- Recommended Target Keywords`,
      `Topic: ${input}\n\nResearch:\n${research.content.slice(0, 4000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  backlink_research: async (input) => {
    const research = await webResearch(`${input} backlink opportunities guest posting directories forums link building`);
    const analysis = await aiComplete(
      `You are a link building specialist. Create a backlink opportunity report:
- High-Authority Directory Opportunities (10+)
- Forum & Community Opportunities (10+)
- Guest Post Targets (10+)
- Resource Page Opportunities
- Competitor Backlink Insights
- Outreach Priority List with contact approach`,
      `Domain/Niche: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  directory_discovery: async (input) => {
    const research = await webResearch(`${input} business directories listing sites submit business`);
    const analysis = await aiComplete(
      `You are an SEO specialist. Find relevant directories:
- General Business Directories (10+)
- Industry-Specific Directories (10+)
- Local Directories
- Review Platforms
- Submission Requirements for each
- Priority Order for submissions`,
      `Industry/Location: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  serp_analysis: async (input) => {
    const research = await webResearch(`${input} search results top ranking pages SEO`);
    const analysis = await aiComplete(
      `You are an SEO analyst. Analyze the SERP for this keyword:
- Top 10 Ranking Pages (what they have in common)
- SERP Features Present
- Content Gaps in Current Results
- Ranking Factors Analysis
- Recommended Content Approach
- Difficulty Assessment`,
      `Keyword: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  content_gap_analysis: async (input) => {
    const research = await webResearch(`${input} content topics keywords competitors missing`);
    const analysis = await aiComplete(
      `You are a content strategist. Find content gaps:
- Topics Competitors Are Missing
- Keyword Opportunities
- Content Format Gaps
- Questions Not Being Answered
- Priority Content List (20+ ideas)
- Quick Win Topics`,
      `Domain/Competitors: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  local_seo_research: async (input) => {
    const research = await webResearch(`${input} local SEO citations directories Google My Business`);
    const analysis = await aiComplete(
      `You are a local SEO expert. Create a local SEO plan:
- Local Directories to Submit
- Citation Sources (20+)
- Google Business Profile Optimization
- Local Keywords
- Review Strategy
- Local Content Ideas`,
      `Business/Location: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  // ========== DATA EXTRACTION ==========
  data_extraction: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return { result: 'No valid URL provided for extraction.', sources: [], provider: 'none' };
    const content = await scrapeUrl(urlMatch[0]);
    const extraction = await aiComplete(
      `You are a data extraction specialist. Extract and structure key data:
- Main Entities (companies, people, products)
- Key Statistics & Numbers
- Contact Information (if present)
- Dates & Events
- Lists & Tables (as structured data)`,
      `Extract data from:\n${content.slice(0, 8000)}`
    );
    return { result: extraction.content, sources: [urlMatch[0]], provider: extraction.provider };
  },

  site_mapping: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return { result: 'No valid URL provided for mapping.', sources: [], provider: 'none' };
    if (PROVIDERS.firecrawl.enabled()) {
      try {
        const links = await PROVIDERS.firecrawl.map(urlMatch[0], 100);
        const analysis = await aiComplete('Analyze this sitemap and provide a structure overview with page categories and hierarchy.', `URL: ${urlMatch[0]}\nPages found: ${links.length}\n\nLinks:\n${links.slice(0, 50).join('\n')}`);
        return { result: `## Site Map: ${urlMatch[0]}\n\nTotal pages: ${links.length}\n\n${analysis.content}\n\n### All URLs:\n${links.map((l: string) => `- ${l}`).join('\n')}`, sources: [urlMatch[0]], provider: 'firecrawl' };
      } catch (err) { console.warn('Site mapping failed:', err); }
    }
    return { result: 'Site mapping requires Firecrawl API.', sources: [], provider: 'none' };
  },

  content_scrape: async (input) => {
    const urls = input.match(/https?:\/\/[^\s]+/g) || [];
    const sources: string[] = [];
    let content = '';
    for (const url of urls.slice(0, 5)) {
      try {
        const scraped = await scrapeUrl(url);
        if (scraped) { content += `\n\n## ${url}\n${scraped.slice(0, 2000)}`; sources.push(url); }
      } catch (err) { console.warn(`Failed to scrape ${url}:`, err); }
    }
    if (!content) return { result: 'No content could be scraped from provided URLs.', sources: [], provider: 'none' };
    return { result: content, sources, provider: 'firecrawl' };
  },

  contact_extraction: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return { result: 'No valid URL provided.', sources: [], provider: 'none' };
    const content = await scrapeUrl(urlMatch[0]);
    const extraction = await aiComplete(
      `You are a data extraction specialist. Extract all contact information:
- Email Addresses
- Phone Numbers
- Physical Addresses
- Social Media Profiles
- Contact Forms
- Key Personnel (names, titles)`,
      `Extract contacts from:\n${content.slice(0, 8000)}`
    );
    return { result: extraction.content, sources: [urlMatch[0]], provider: extraction.provider };
  },

  pricing_extraction: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return { result: 'No valid URL provided.', sources: [], provider: 'none' };
    const content = await scrapeUrl(urlMatch[0]);
    const extraction = await aiComplete(
      `You are a pricing analyst. Extract and structure pricing information:
- Pricing Tiers (names and prices)
- Features by Tier
- Billing Options (monthly/annual)
- Free Trial/Freemium Details
- Enterprise Options
- Comparison Table`,
      `Extract pricing from:\n${content.slice(0, 8000)}`
    );
    return { result: extraction.content, sources: [urlMatch[0]], provider: extraction.provider };
  },

  review_aggregation: async (input) => {
    const research = await webResearch(`${input} reviews ratings feedback testimonials`);
    const analysis = await aiComplete(
      `You are a review analyst. Aggregate and analyze reviews:
- Overall Sentiment Summary
- Common Positive Themes
- Common Negative Themes
- Rating Breakdown
- Key Quotes
- Competitive Comparison`,
      `Brand/Product: ${input}\n\nResearch:\n${research.content.slice(0, 6000)}`
    );
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  // ========== CONTENT ==========
  content_generation: async (input) => {
    const research = await webResearch(input);
    const content = await aiComplete(
      `You are a professional content writer. Create engaging, SEO-optimized content:
- Well-structured with clear headings (H1, H2, H3)
- Includes a compelling meta description
- Uses relevant keywords naturally
- Provides actionable value
- 800-1200 words in length`,
      `Topic: ${input}\n\nResearch context:\n${research.content.slice(0, 4000)}`
    );
    return { result: content.content, sources: research.sources, provider: content.provider };
  },

  outreach_draft: async (input) => {
    const draft = await aiComplete(
      `You are an outreach specialist. Create personalized outreach emails:
- Main Email (professional, value-focused)
- 3 Subject Line Variations
- Follow-up Email Template
- Key personalization points to research`,
      `Outreach purpose: ${input}`
    );
    return { result: draft.content, sources: [], provider: draft.provider };
  },

  social_content: async (input) => {
    const content = await aiComplete(
      `You are a social media content specialist. Create engaging posts:
- LinkedIn Post (professional, 150-200 words)
- Twitter/X Thread (5-7 tweets)
- Instagram Caption (with hashtags)
- Key Hooks & CTAs`,
      `Topic: ${input}`
    );
    return { result: content.content, sources: [], provider: content.provider };
  },

  seo_article: async (input) => {
    const research = await webResearch(input);
    const article = await aiComplete(
      `You are an SEO content writer. Create a fully optimized article:
- Title (with primary keyword)
- Meta Description (155 chars)
- H1, H2, H3 structure
- 1500-2000 words
- Internal linking suggestions
- Backlink anchor text suggestions
- FAQ section`,
      `Topic: ${input}\n\nResearch:\n${research.content.slice(0, 4000)}`
    );
    return { result: article.content, sources: research.sources, provider: article.provider };
  },

  guest_post_pitch: async (input) => {
    const pitch = await aiComplete(
      `You are a guest posting specialist. Create pitches:
- Pitch Email (personalized opener)
- 3 Topic Proposals with outlines
- Author Bio
- Sample work summary
- Follow-up template`,
      `Target site and topics: ${input}`
    );
    return { result: pitch.content, sources: [], provider: pitch.provider };
  },

  press_release: async (input) => {
    const pr = await aiComplete(
      `You are a PR specialist. Create a press release:
- Headline (attention-grabbing)
- Subheadline
- Lead Paragraph (who, what, when, where, why)
- Body (2-3 paragraphs)
- Quote from spokesperson
- Boilerplate
- Contact information section
- Distribution targets`,
      `Announcement: ${input}`
    );
    return { result: pr.content, sources: [], provider: pr.provider };
  },

  comment_drafts: async (input) => {
    const drafts = await aiComplete(
      `You are a community engagement specialist. Create forum/blog comments:
- 5 Thoughtful Comments (each unique, adds value)
- Natural brand mention approach
- Engagement strategies
- Best practices for each platform
- Do's and Don'ts`,
      `Topic and brand: ${input}`
    );
    return { result: drafts.content, sources: [], provider: drafts.provider };
  },

  product_description: async (input) => {
    const desc = await aiComplete(
      `You are a copywriter. Create product descriptions:
- Main Description (150-200 words)
- 5-7 Bullet Points
- SEO Title
- Meta Description
- Key Benefits
- Social Proof suggestions`,
      `Product info: ${input}`
    );
    return { result: desc.content, sources: [], provider: desc.provider };
  },

  // ========== BUSINESS ==========
  business_name_ideas: async (input) => {
    const ideas = await aiComplete(
      `You are a branding specialist. Generate business name ideas:
- 20 Business Name Ideas
- Domain availability hints (.com, .io, .co)
- Social handle availability hints
- Name style categories (descriptive, abstract, compound)
- Top 5 recommendations with reasoning`,
      `Industry and keywords: ${input}`
    );
    return { result: ideas.content, sources: [], provider: ideas.provider };
  },

  value_proposition: async (input) => {
    const vp = await aiComplete(
      `You are a positioning strategist. Create value propositions:
- Primary Value Proposition
- 3 Alternative Taglines
- Elevator Pitch (30 seconds)
- Unique Selling Points (5)
- Customer Pain Points Addressed
- Competitive Differentiation`,
      `Product and audience: ${input}`
    );
    return { result: vp.content, sources: [], provider: vp.provider };
  },

  business_model_analysis: async (input) => {
    const analysis = await aiComplete(
      `You are a business strategist. Analyze the business model:
- Current Model Assessment
- Revenue Stream Analysis
- Cost Structure
- Value Chain
- Improvement Opportunities
- Alternative Models to Consider
- Risk Assessment`,
      `Business description: ${input}`
    );
    return { result: analysis.content, sources: [], provider: analysis.provider };
  },

  startup_idea_validation: async (input) => {
    const research = await webResearch(`${input} market size competitors validation`);
    const validation = await aiComplete(
      `You are a startup advisor. Validate this idea:
- Validation Score (1-100)
- Market Size Estimate
- Competition Analysis
- Target Customer Profile
- Key Risks
- MVP Recommendations
- Next Steps`,
      `Idea: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    return { result: validation.content, sources: research.sources, provider: validation.provider };
  },

  landing_page_copy: async (input) => {
    const copy = await aiComplete(
      `You are a conversion copywriter. Create landing page copy:
- Hero Section (headline, subheadline, CTA)
- Problem Section
- Solution Section
- Features & Benefits
- Social Proof Section
- FAQ Section
- Final CTA Section`,
      `Product and goal: ${input}`
    );
    return { result: copy.content, sources: [], provider: copy.provider };
  },

  pitch_deck_outline: async (input) => {
    const outline = await aiComplete(
      `You are a startup pitch consultant. Create a pitch deck outline:
- Cover Slide
- Problem Slide
- Solution Slide
- Market Opportunity
- Business Model
- Traction/Milestones
- Team Slide
- Financial Projections
- Ask Slide
- Key talking points for each`,
      `Startup info: ${input}`
    );
    return { result: outline.content, sources: [], provider: outline.provider };
  },

  // ========== LEARNING ==========
  skill_assessment: async (input, supabase, taskId) => {
    // Get agency context
    const { data: task } = await supabase.from('agency_tasks').select('agency_id, assigned_member_id').eq('id', taskId).single();
    let memberContext = '';
    if (task?.assigned_member_id) {
      const { data: member } = await supabase.from('agency_members').select('specialization, skill_weights, competency_score, success_rate').eq('id', task.assigned_member_id).single();
      if (member) {
        memberContext = `Current agent: ${member.specialization}, Competency: ${member.competency_score || 50}%, Success Rate: ${member.success_rate || 50}%`;
      }
    }
    const assessment = await aiComplete(
      `You are an AI agent self-improvement coach. Assess the agent's skills and provide improvement recommendations:
- Current Skill Assessment (based on context)
- Strengths Identified
- Areas for Improvement
- Specific Training Exercises
- Recommended Focus Areas
- Measurable Goals for Improvement`,
      `Skill area to assess: ${input}\n\nAgent Context: ${memberContext}`
    );
    return { result: assessment.content, sources: ['Self-Assessment'], provider: assessment.provider };
  },

  domain_learning: async (input) => {
    const research = await webResearch(`${input} comprehensive guide fundamentals advanced concepts best practices`);
    const synthesis = await aiComplete(
      `You are a domain expert teacher. Create a comprehensive learning document:
- Domain Overview
- Key Concepts & Terminology (10+)
- Core Principles
- Best Practices
- Common Pitfalls to Avoid
- Advanced Techniques
- Resources for Further Learning
- Key Takeaways for an AI Agent`,
      `Domain to learn: ${input}\n\nResearch:\n${research.content.slice(0, 6000)}`
    );
    return { result: synthesis.content, sources: research.sources, provider: synthesis.provider };
  },

  heuristic_extraction: async (input, supabase, taskId) => {
    // Get recent completed tasks for pattern extraction
    const { data: task } = await supabase.from('agency_tasks').select('agency_id').eq('id', taskId).single();
    let taskHistory = '';
    if (task?.agency_id) {
      const { data: recentTasks } = await supabase.from('agency_tasks')
        .select('task_type, title, status, output_data')
        .eq('agency_id', task.agency_id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);
      if (recentTasks?.length) {
        taskHistory = recentTasks.map((t: { task_type: string; title: string; status: string }) => `- ${t.task_type}: ${t.title} (${t.status})`).join('\n');
      }
    }
    const extraction = await aiComplete(
      `You are an AI pattern recognition specialist. Extract heuristics and best practices:
- Patterns Identified in Successful Tasks
- Common Success Factors
- Failure Patterns to Avoid
- Process Improvements
- Optimal Workflows Discovered
- Generalizable Heuristics (5-10)
- Recommended System Updates`,
      `Topic: ${input}\n\nRecent task history:\n${taskHistory || 'No task history available'}`
    );
    return { result: extraction.content, sources: ['Task History Analysis'], provider: extraction.provider };
  },

  substrate_reflection: async (input, supabase, taskId) => {
    const { data: task } = await supabase.from('agency_tasks').select('agency_id').eq('id', taskId).single();
    let memoryContext = '';
    if (task?.agency_id) {
      const { data: memories } = await supabase.from('agency_dream_memory')
        .select('title, improvement_type, confidence, layer')
        .eq('agency_id', task.agency_id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (memories?.length) {
        memoryContext = memories.map((m: { title: string; improvement_type: string; layer: string }) => `- ${m.title} (${m.improvement_type}, ${m.layer})`).join('\n');
      }
    }
    const reflection = await aiComplete(
      `You are an AI system memory architect. Reflect on recent learnings and create memory entries:
- Key Insights to Remember
- Pattern Improvements
- Workflow Optimizations
- Knowledge Gaps Identified
- Suggested Memory Entries for Substrate
- Priority for Future Reference`,
      `Reflection topic: ${input}\n\nRecent memory context:\n${memoryContext || 'Fresh start - no previous memories'}`
    );
    return { result: reflection.content, sources: ['Memory Reflection'], provider: reflection.provider };
  },

  prompt_optimization: async (input) => {
    const optimization = await aiComplete(
      `You are an AI prompt engineering specialist. Optimize prompts for better task execution:
- Current Prompt Analysis
- Identified Weaknesses
- Optimized Prompt Structure
- Key Improvements Made
- Expected Performance Gains
- Test Cases for Validation
- Before/After Examples`,
      `Task type to optimize: ${input}`
    );
    return { result: optimization.content, sources: ['Prompt Engineering'], provider: optimization.provider };
  },

  knowledge_synthesis: async (input, supabase, taskId) => {
    const { data: task } = await supabase.from('agency_tasks').select('agency_id').eq('id', taskId).single();
    let taskInsights = '';
    if (task?.agency_id) {
      const { data: recentTasks } = await supabase.from('agency_tasks')
        .select('task_type, title, output_data')
        .eq('agency_id', task.agency_id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);
      if (recentTasks?.length) {
        taskInsights = recentTasks.map((t: { title: string; output_data: unknown }) => {
          const outputData = t.output_data as { insights?: string[] } | null;
          const insights = outputData?.insights || [];
          return `${t.title}: ${insights.slice(0, 2).join('; ')}`;
        }).join('\n');
      }
    }
    const synthesis = await aiComplete(
      `You are an AI knowledge synthesis specialist. Combine learnings into actionable insights:
- Cross-Task Patterns
- Synthesized Knowledge
- Actionable Insights (5-10)
- Strategic Recommendations
- Knowledge Graph Connections
- Future Learning Priorities`,
      `Synthesis topic: ${input}\n\nRecent task insights:\n${taskInsights || 'No recent insights available'}`
    );
    return { result: synthesis.content, sources: ['Knowledge Synthesis'], provider: synthesis.provider };
  },

  workflow_discovery: async (input) => {
    const research = await webResearch(`${input} optimal workflow process automation steps`);
    const discovery = await aiComplete(
      `You are a workflow optimization specialist. Discover optimal multi-step workflows:
- Goal Analysis
- Optimal Workflow Steps (detailed)
- Alternative Pathways
- Automation Opportunities
- Required Resources
- Success Metrics
- Common Pitfalls`,
      `Goal: ${input}\n\nResearch:\n${research.content.slice(0, 4000)}`
    );
    return { result: discovery.content, sources: research.sources, provider: discovery.provider };
  },

  industry_deep_dive: async (input) => {
    const research = await webResearch(`${input} industry comprehensive guide leaders trends technology future`);
    const deepDive = await aiComplete(
      `You are an industry analyst creating a comprehensive deep dive:
- Industry Overview & History
- Market Size & Growth
- Key Players & Market Share
- Value Chain Analysis
- Technology Stack
- Regulatory Environment
- Emerging Trends
- Future Outlook (5-10 years)
- Key Success Factors
- Strategic Opportunities`,
      `Industry: ${input}\n\nResearch:\n${research.content.slice(0, 8000)}`
    );
    return { result: deepDive.content, sources: research.sources, provider: deepDive.provider };
  },
};

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { taskId, agencyId, taskType, inputData, memberId } = await req.json();
    console.log(`🚀 Executing task ${taskId} (${taskType})`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('agency_tasks').update({ status: 'in_progress', started_at: new Date().toISOString(), progress: 10 }).eq('id', taskId);
    await supabase.from('agency_task_logs').insert({ task_id: taskId, member_id: memberId, log_type: 'info', message: `🚀 Starting ${taskType} task`, data: { taskType } });

    const rawInput = inputData?.rawInput || inputData?.topic || inputData?.query || JSON.stringify(inputData) || '';

    if (!await updateProgress(supabase, taskId, 20, 'Analyzing task...')) {
      return new Response(JSON.stringify({ success: true, cancelled: true, taskId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const handler = TASK_HANDLERS[taskType] || TASK_HANDLERS.web_research;
    await updateProgress(supabase, taskId, 40, `Executing ${taskType}...`);
    
    const { result, sources, provider } = await handler(rawInput, supabase, taskId);
    await updateProgress(supabase, taskId, 80, 'Extracting insights...');
    
    const insights = extractInsights(result);
    const executionTime = Date.now() - startTime;

    let artifactId: string | null = null;
    try {
      const { data: artifact } = await supabase.from('agency_task_artifacts').insert({
        task_id: taskId, agency_id: agencyId, member_id: memberId, artifact_type: 'report',
        file_name: `${taskType}-${Date.now()}.md`, inline_content: result, metadata: { sources, insights },
      }).select('id').single();
      artifactId = artifact?.id;
    } catch (e) { console.warn('Artifact save failed:', e); }

    await supabase.from('agency_tasks').update({ 
      status: 'completed', completed_at: new Date().toISOString(), progress: 100,
      output_data: { result, insights, sources, provider, executionTimeMs: executionTime, artifactId },
    }).eq('id', taskId);

    await supabase.from('agency_task_logs').insert({
      task_id: taskId, member_id: memberId, log_type: 'completion',
      message: `✅ Task completed in ${Math.round(executionTime / 1000)}s`,
      data: { insights: insights.slice(0, 3), sources: sources.slice(0, 3), provider, artifactId },
    });

    // Record telemetry for completed task
    try {
      await supabase.rpc('increment_agent_telemetry', {
        p_agency_id: agencyId,
        p_member_id: memberId || null,
        p_field: 'tasks_completed',
        p_increment: 1,
        p_skill_usage: { [taskType]: 1 },
        p_execution_time_ms: executionTime,
      });
      // Record API calls and websites crawled
      if (sources.length > 0) {
        await supabase.rpc('increment_agent_telemetry', {
          p_agency_id: agencyId,
          p_member_id: memberId || null,
          p_field: 'websites_crawled',
          p_increment: sources.length,
          p_skill_usage: null,
          p_execution_time_ms: 0,
        });
      }
    } catch (telemetryError) {
      console.warn('Telemetry recording failed (non-critical):', telemetryError);
    }

    console.log(`✅ Task ${taskId} completed in ${executionTime}ms`);
    return new Response(JSON.stringify({ success: true, taskId, result, insights, sources, provider, executionTimeMs: executionTime, artifactId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("❌ Task execution error:", error);
    
    // Improved error handling - always try to update the task status
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
      // Try to get taskId from the request body that was already parsed
      let taskIdToUpdate: string | undefined;
      let agencyIdForTelemetry: string | undefined;
      let memberIdForTelemetry: string | undefined;
      
      try {
        const body = await req.clone().json();
        taskIdToUpdate = body.taskId;
        agencyIdForTelemetry = body.agencyId;
        memberIdForTelemetry = body.memberId;
      } catch {
        // Request body already consumed, try to extract from original
      }
      
      if (taskIdToUpdate) {
        await supabase.from('agency_tasks').update({ 
          status: 'failed', 
          error_message: error instanceof Error ? error.message : 'Unknown error', 
          progress: 0,
          updated_at: new Date().toISOString(),
        }).eq('id', taskIdToUpdate);
        
        await supabase.from('agency_task_logs').insert({ 
          task_id: taskIdToUpdate, 
          log_type: 'error', 
          message: `❌ Task failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
        
        // Record failed task telemetry
        if (agencyIdForTelemetry) {
          try {
            await supabase.rpc('increment_agent_telemetry', {
              p_agency_id: agencyIdForTelemetry,
              p_member_id: memberIdForTelemetry || null,
              p_field: 'tasks_failed',
              p_increment: 1,
              p_skill_usage: null,
              p_execution_time_ms: 0,
            });
          } catch { /* ignore telemetry errors */ }
        }
      }
    } catch (e) { 
      console.error('Failed to update task status:', e); 
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error", 
      success: false,
      details: error instanceof Error ? error.stack : undefined,
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
