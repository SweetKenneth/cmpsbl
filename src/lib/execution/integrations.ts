/**
 * Integration Library — Pre-configured API Skillboard
 * Free integrations for agent execution
 */

export type IntegrationStatus = 'available' | 'requires_key' | 'rate_limited' | 'unavailable';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'search' | 'knowledge' | 'code' | 'news' | 'social' | 'government' | 'audit' | 'research';
  status: IntegrationStatus;
  requiresApiKey: boolean;
  rateLimitPerHour?: number;
  baseUrl?: string;
  scrapeMethod?: 'api' | 'firecrawl' | 'hybrid';
  endpoints: IntegrationEndpoint[];
}

export interface IntegrationEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  params?: Record<string, string>;
  outputFormat: 'json' | 'html' | 'markdown';
}

// Pre-configured free integrations
export const INTEGRATIONS: Record<string, Integration> = {
  // Search
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    description: 'Privacy-focused web search',
    category: 'search',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 100,
    baseUrl: 'https://html.duckduckgo.com/html/',
    scrapeMethod: 'firecrawl',
    endpoints: [
      { id: 'search', name: 'Web Search', method: 'GET', path: '/', params: { q: 'query' }, outputFormat: 'html' },
    ],
  },

  // Knowledge
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    description: 'Free encyclopedia API',
    category: 'knowledge',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 200,
    baseUrl: 'https://en.wikipedia.org/api/rest_v1',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'summary', name: 'Page Summary', method: 'GET', path: '/page/summary/{title}', outputFormat: 'json' },
      { id: 'search', name: 'Search', method: 'GET', path: '/page/title/{query}', outputFormat: 'json' },
    ],
  },

  openlibrary: {
    id: 'openlibrary',
    name: 'Open Library',
    description: 'Free book catalog',
    category: 'knowledge',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 100,
    baseUrl: 'https://openlibrary.org',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'search', name: 'Book Search', method: 'GET', path: '/search.json', params: { q: 'query' }, outputFormat: 'json' },
      { id: 'work', name: 'Work Details', method: 'GET', path: '/works/{id}.json', outputFormat: 'json' },
    ],
  },

  // Research
  arxiv: {
    id: 'arxiv',
    name: 'arXiv',
    description: 'Scientific paper repository',
    category: 'research',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 60,
    baseUrl: 'http://export.arxiv.org/api',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'query', name: 'Paper Search', method: 'GET', path: '/query', params: { search_query: 'query' }, outputFormat: 'json' },
    ],
  },

  // Code
  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Public repository access (unauthenticated)',
    category: 'code',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 60,
    baseUrl: 'https://api.github.com',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'repos', name: 'Search Repos', method: 'GET', path: '/search/repositories', params: { q: 'query' }, outputFormat: 'json' },
      { id: 'code', name: 'Search Code', method: 'GET', path: '/search/code', params: { q: 'query' }, outputFormat: 'json' },
      { id: 'readme', name: 'Get README', method: 'GET', path: '/repos/{owner}/{repo}/readme', outputFormat: 'json' },
    ],
  },

  stackoverflow: {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    description: 'Programming Q&A via scrape',
    category: 'code',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 30,
    baseUrl: 'https://stackoverflow.com',
    scrapeMethod: 'firecrawl',
    endpoints: [
      { id: 'search', name: 'Search Questions', method: 'GET', path: '/search', params: { q: 'query' }, outputFormat: 'html' },
    ],
  },

  // News
  newsapi: {
    id: 'newsapi',
    name: 'NewsAPI',
    description: 'News headlines search',
    category: 'news',
    status: 'requires_key',
    requiresApiKey: true,
    rateLimitPerHour: 100,
    baseUrl: 'https://newsapi.org/v2',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'headlines', name: 'Top Headlines', method: 'GET', path: '/top-headlines', outputFormat: 'json' },
      { id: 'everything', name: 'Search News', method: 'GET', path: '/everything', params: { q: 'query' }, outputFormat: 'json' },
    ],
  },

  hackernews: {
    id: 'hackernews',
    name: 'Hacker News',
    description: 'Tech news aggregator',
    category: 'news',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 200,
    baseUrl: 'https://hacker-news.firebaseio.com/v0',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'top', name: 'Top Stories', method: 'GET', path: '/topstories.json', outputFormat: 'json' },
      { id: 'item', name: 'Story Details', method: 'GET', path: '/item/{id}.json', outputFormat: 'json' },
    ],
  },

  // Social
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    description: 'Subreddit scraping',
    category: 'social',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 30,
    baseUrl: 'https://www.reddit.com',
    scrapeMethod: 'firecrawl',
    endpoints: [
      { id: 'subreddit', name: 'Subreddit Posts', method: 'GET', path: '/r/{subreddit}.json', outputFormat: 'json' },
      { id: 'search', name: 'Search Reddit', method: 'GET', path: '/search.json', params: { q: 'query' }, outputFormat: 'json' },
    ],
  },

  // Government/Regulatory
  sec_edgar: {
    id: 'sec_edgar',
    name: 'SEC EDGAR',
    description: 'SEC filings database',
    category: 'government',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 100,
    baseUrl: 'https://www.sec.gov/cgi-bin',
    scrapeMethod: 'hybrid',
    endpoints: [
      { id: 'search', name: 'Company Search', method: 'GET', path: '/browse-edgar', params: { company: 'name' }, outputFormat: 'html' },
    ],
  },

  fda_openfda: {
    id: 'fda_openfda',
    name: 'FDA OpenFDA',
    description: 'FDA drug/device data',
    category: 'government',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 240,
    baseUrl: 'https://api.fda.gov',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'drugs', name: 'Drug Search', method: 'GET', path: '/drug/label.json', params: { search: 'query' }, outputFormat: 'json' },
      { id: 'recalls', name: 'Recalls', method: 'GET', path: '/drug/enforcement.json', outputFormat: 'json' },
    ],
  },

  fcc: {
    id: 'fcc',
    name: 'FCC',
    description: 'FCC public data',
    category: 'government',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 60,
    baseUrl: 'https://opendata.fcc.gov/api',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'broadband', name: 'Broadband Data', method: 'GET', path: '/views/metadata/v1', outputFormat: 'json' },
    ],
  },

  // Audit
  lighthouse: {
    id: 'lighthouse',
    name: 'Lighthouse CI',
    description: 'Website performance audits',
    category: 'audit',
    status: 'available',
    requiresApiKey: false,
    scrapeMethod: 'firecrawl',
    endpoints: [
      { id: 'audit', name: 'Page Audit', method: 'POST', path: '/audit', outputFormat: 'json' },
    ],
  },

  // Optional/Heavy
  commoncrawl: {
    id: 'commoncrawl',
    name: 'Common Crawl',
    description: 'Web archive (large datasets)',
    category: 'research',
    status: 'available',
    requiresApiKey: false,
    rateLimitPerHour: 10,
    baseUrl: 'https://index.commoncrawl.org',
    scrapeMethod: 'api',
    endpoints: [
      { id: 'search', name: 'URL Search', method: 'GET', path: '/CC-MAIN-2024-10-index', params: { url: 'domain' }, outputFormat: 'json' },
    ],
  },
};

// Get available integrations by category
export function getIntegrationsByCategory(category: Integration['category']): Integration[] {
  return Object.values(INTEGRATIONS).filter(i => i.category === category);
}

// Get all free (no API key) integrations
export function getFreeIntegrations(): Integration[] {
  return Object.values(INTEGRATIONS).filter(i => !i.requiresApiKey);
}

// Check if integration is usable
export function isIntegrationAvailable(integrationId: string): boolean {
  const integration = INTEGRATIONS[integrationId];
  if (!integration) return false;
  return integration.status === 'available' && !integration.requiresApiKey;
}

// Build request URL for an endpoint
export function buildIntegrationUrl(
  integrationId: string,
  endpointId: string,
  params: Record<string, string> = {}
): string | null {
  const integration = INTEGRATIONS[integrationId];
  if (!integration) return null;

  const endpoint = integration.endpoints.find(e => e.id === endpointId);
  if (!endpoint) return null;

  let url = `${integration.baseUrl}${endpoint.path}`;

  // Replace path params
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  }

  // Add query params
  const queryParams = new URLSearchParams();
  if (endpoint.params) {
    for (const [paramKey, paramName] of Object.entries(endpoint.params)) {
      if (params[paramName]) {
        queryParams.set(paramKey, params[paramName]);
      }
    }
  }

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

// Integration categories for UI
export const INTEGRATION_CATEGORIES = [
  { id: 'search', name: 'Search', icon: '🔍' },
  { id: 'knowledge', name: 'Knowledge', icon: '📚' },
  { id: 'code', name: 'Code', icon: '💻' },
  { id: 'news', name: 'News', icon: '📰' },
  { id: 'social', name: 'Social', icon: '💬' },
  { id: 'government', name: 'Government', icon: '🏛️' },
  { id: 'audit', name: 'Audit', icon: '📊' },
  { id: 'research', name: 'Research', icon: '🔬' },
] as const;
