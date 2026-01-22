/**
 * Research Domain Targets v1.0
 * Curated lists of domains agents can use for various task types
 * All domains are publicly accessible and free to scrape for research
 */

export interface ResearchDomain {
  url: string;
  name: string;
  category: DomainCategory;
  purpose: string;
  canSubmit?: boolean; // If agents can submit content here
}

export type DomainCategory = 
  | 'tech_news'
  | 'forums'
  | 'directories'
  | 'social'
  | 'seo_tools'
  | 'research'
  | 'business'
  | 'content_platforms';

// ============ TECH NEWS & RESEARCH ============
export const TECH_NEWS_DOMAINS: ResearchDomain[] = [
  { url: 'https://news.ycombinator.com', name: 'Hacker News', category: 'tech_news', purpose: 'Tech trends, startup news, developer discussions' },
  { url: 'https://techcrunch.com', name: 'TechCrunch', category: 'tech_news', purpose: 'Startup funding, tech industry news' },
  { url: 'https://www.producthunt.com', name: 'Product Hunt', category: 'tech_news', purpose: 'New product launches, competitor discovery' },
  { url: 'https://www.indiehackers.com', name: 'Indie Hackers', category: 'tech_news', purpose: 'Bootstrapped business insights, revenue data' },
  { url: 'https://dev.to', name: 'DEV Community', category: 'tech_news', purpose: 'Developer content, tutorials, discussions' },
  { url: 'https://www.wired.com', name: 'Wired', category: 'tech_news', purpose: 'Tech trends, innovation stories' },
  { url: 'https://arstechnica.com', name: 'Ars Technica', category: 'tech_news', purpose: 'In-depth tech analysis' },
  { url: 'https://venturebeat.com', name: 'VentureBeat', category: 'tech_news', purpose: 'AI/ML news, enterprise tech' },
];

// ============ FORUMS & COMMUNITIES ============
export const FORUM_DOMAINS: ResearchDomain[] = [
  { url: 'https://www.reddit.com/r/seo', name: 'Reddit SEO', category: 'forums', purpose: 'SEO discussions, strategies, case studies', canSubmit: true },
  { url: 'https://www.reddit.com/r/marketing', name: 'Reddit Marketing', category: 'forums', purpose: 'Marketing strategies, growth tactics', canSubmit: true },
  { url: 'https://www.reddit.com/r/entrepreneur', name: 'Reddit Entrepreneur', category: 'forums', purpose: 'Business strategies, startup advice', canSubmit: true },
  { url: 'https://www.reddit.com/r/startups', name: 'Reddit Startups', category: 'forums', purpose: 'Startup community, founder insights', canSubmit: true },
  { url: 'https://www.reddit.com/r/webdev', name: 'Reddit WebDev', category: 'forums', purpose: 'Web development trends, tools', canSubmit: true },
  { url: 'https://www.reddit.com/r/SaaS', name: 'Reddit SaaS', category: 'forums', purpose: 'SaaS business discussions', canSubmit: true },
  { url: 'https://community.hubspot.com', name: 'HubSpot Community', category: 'forums', purpose: 'Marketing automation discussions' },
  { url: 'https://moz.com/community', name: 'Moz Community', category: 'forums', purpose: 'SEO Q&A, strategy discussions' },
  { url: 'https://www.blackhatworld.com', name: 'Black Hat World', category: 'forums', purpose: 'Marketing tactics, SEO techniques' },
  { url: 'https://www.warriorforum.com', name: 'Warrior Forum', category: 'forums', purpose: 'Internet marketing discussions' },
];

// ============ BUSINESS DIRECTORIES ============
export const DIRECTORY_DOMAINS: ResearchDomain[] = [
  { url: 'https://www.crunchbase.com', name: 'Crunchbase', category: 'directories', purpose: 'Company data, funding info, competitor research' },
  { url: 'https://www.g2.com', name: 'G2', category: 'directories', purpose: 'Software reviews, competitor analysis' },
  { url: 'https://www.capterra.com', name: 'Capterra', category: 'directories', purpose: 'Software comparisons, reviews' },
  { url: 'https://www.trustpilot.com', name: 'Trustpilot', category: 'directories', purpose: 'Business reviews, reputation research' },
  { url: 'https://clutch.co', name: 'Clutch', category: 'directories', purpose: 'B2B service providers, agency research' },
  { url: 'https://www.yelp.com', name: 'Yelp', category: 'directories', purpose: 'Local business reviews, competition' },
  { url: 'https://angel.co', name: 'AngelList', category: 'directories', purpose: 'Startup data, job market research' },
  { url: 'https://www.linkedin.com/company', name: 'LinkedIn Companies', category: 'directories', purpose: 'Company profiles, employee data' },
  { url: 'https://www.glassdoor.com', name: 'Glassdoor', category: 'directories', purpose: 'Company reviews, salary data' },
  { url: 'https://www.similarweb.com', name: 'SimilarWeb', category: 'directories', purpose: 'Traffic estimates, competitor analysis' },
];

// ============ SEO & MARKETING RESEARCH ============
export const SEO_RESEARCH_DOMAINS: ResearchDomain[] = [
  { url: 'https://moz.com/blog', name: 'Moz Blog', category: 'seo_tools', purpose: 'SEO strategies, algorithm updates' },
  { url: 'https://ahrefs.com/blog', name: 'Ahrefs Blog', category: 'seo_tools', purpose: 'Link building, content strategies' },
  { url: 'https://www.semrush.com/blog', name: 'SEMrush Blog', category: 'seo_tools', purpose: 'SEO tools, marketing insights' },
  { url: 'https://backlinko.com/blog', name: 'Backlinko', category: 'seo_tools', purpose: 'Link building, SEO case studies' },
  { url: 'https://neilpatel.com/blog', name: 'Neil Patel Blog', category: 'seo_tools', purpose: 'Digital marketing, SEO tips' },
  { url: 'https://searchengineland.com', name: 'Search Engine Land', category: 'seo_tools', purpose: 'Search news, algorithm updates' },
  { url: 'https://www.searchenginejournal.com', name: 'Search Engine Journal', category: 'seo_tools', purpose: 'SEO news, guides' },
  { url: 'https://www.contentkingapp.com/blog', name: 'ContentKing Blog', category: 'seo_tools', purpose: 'Technical SEO insights' },
];

// ============ CONTENT PLATFORMS (for research) ============
export const CONTENT_DOMAINS: ResearchDomain[] = [
  { url: 'https://medium.com', name: 'Medium', category: 'content_platforms', purpose: 'Industry articles, thought leadership' },
  { url: 'https://substack.com', name: 'Substack', category: 'content_platforms', purpose: 'Newsletter content, industry insights' },
  { url: 'https://www.quora.com', name: 'Quora', category: 'content_platforms', purpose: 'Q&A research, topic exploration' },
  { url: 'https://hashnode.com', name: 'Hashnode', category: 'content_platforms', purpose: 'Developer blogs, tech content' },
  { url: 'https://www.youtube.com', name: 'YouTube', category: 'content_platforms', purpose: 'Video content research (metadata only)' },
];

// ============ MARKET RESEARCH ============
export const MARKET_RESEARCH_DOMAINS: ResearchDomain[] = [
  { url: 'https://www.statista.com', name: 'Statista', category: 'research', purpose: 'Statistics, market data' },
  { url: 'https://trends.google.com', name: 'Google Trends', category: 'research', purpose: 'Search trends, interest over time' },
  { url: 'https://www.ibisworld.com', name: 'IBISWorld', category: 'research', purpose: 'Industry reports, market analysis' },
  { url: 'https://www.forrester.com', name: 'Forrester', category: 'research', purpose: 'Tech research, market forecasts' },
  { url: 'https://www.gartner.com', name: 'Gartner', category: 'research', purpose: 'Tech research, hype cycles' },
];

// ============ AGGREGATED DOMAIN LISTS ============
export const ALL_RESEARCH_DOMAINS: ResearchDomain[] = [
  ...TECH_NEWS_DOMAINS,
  ...FORUM_DOMAINS,
  ...DIRECTORY_DOMAINS,
  ...SEO_RESEARCH_DOMAINS,
  ...CONTENT_DOMAINS,
  ...MARKET_RESEARCH_DOMAINS,
];

/**
 * Get domains for a specific task type
 */
export function getDomainsForTaskType(taskType: string): ResearchDomain[] {
  switch (taskType) {
    case 'web_research':
    case 'market_research':
      return [...TECH_NEWS_DOMAINS, ...MARKET_RESEARCH_DOMAINS, ...CONTENT_DOMAINS];
    case 'competitive_profile':
    case 'brand_analysis':
      return [...DIRECTORY_DOMAINS, ...TECH_NEWS_DOMAINS];
    case 'seo_audit':
    case 'keyword_research':
    case 'backlink_research':
      return [...SEO_RESEARCH_DOMAINS, ...FORUM_DOMAINS];
    case 'trend_analysis':
      return [...TECH_NEWS_DOMAINS, ...MARKET_RESEARCH_DOMAINS];
    case 'content_generation':
    case 'social_content':
      return [...CONTENT_DOMAINS, ...FORUM_DOMAINS];
    case 'outreach_draft':
      return [...FORUM_DOMAINS, ...DIRECTORY_DOMAINS];
    default:
      return ALL_RESEARCH_DOMAINS.slice(0, 10);
  }
}

/**
 * Get submittable domains (where agents could potentially post)
 */
export function getSubmittableDomains(): ResearchDomain[] {
  return ALL_RESEARCH_DOMAINS.filter(d => d.canSubmit);
}

/**
 * Get domains by category
 */
export function getDomainsByCategory(category: DomainCategory): ResearchDomain[] {
  return ALL_RESEARCH_DOMAINS.filter(d => d.category === category);
}

/**
 * Get a random selection of domains for research diversity
 */
export function getRandomDomains(count: number = 5): ResearchDomain[] {
  const shuffled = [...ALL_RESEARCH_DOMAINS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
