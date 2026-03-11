/**
 * Free API Adapters — Connect to publicly available APIs
 * These adapters enable real-world data without paid subscriptions
 */

export interface ApiAdapterResult {
  success: boolean;
  data: any;
  source: string;
  cached?: boolean;
  error?: string;
}

export interface ApiAdapter {
  id: string;
  name: string;
  description: string;
  category: string;
  rateLimit: { requests: number; windowMs: number };
  fetch: (params: Record<string, any>) => Promise<ApiAdapterResult>;
}

// Simple in-memory cache for rate limiting
const requestLog: Record<string, number[]> = {};

function checkRateLimit(adapterId: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now();
  const log = requestLog[adapterId] || [];
  const recentRequests = log.filter(t => now - t < limit.windowMs);
  requestLog[adapterId] = recentRequests;
  
  if (recentRequests.length >= limit.requests) {
    return false; // Rate limited
  }
  
  requestLog[adapterId].push(now);
  return true;
}

// ============================================================================
// FREE API ADAPTERS
// ============================================================================

export const FREE_API_ADAPTERS: Record<string, ApiAdapter> = {
  // Hacker News API - Fully public JSON
  hn_api: {
    id: 'hn_api',
    name: 'Hacker News',
    description: 'Tech news and discussions from Hacker News',
    category: 'tech_news',
    rateLimit: { requests: 30, windowMs: 60000 },
    fetch: async (params) => {
      if (!checkRateLimit('hn_api', { requests: 30, windowMs: 60000 })) {
        return { success: false, data: null, source: 'hn_api', error: 'Rate limited' };
      }
      
      try {
        const { type = 'topstories', limit = 10 } = params;
        const endpoints: Record<string, string> = {
          topstories: 'https://hacker-news.firebaseio.com/v0/topstories.json',
          newstories: 'https://hacker-news.firebaseio.com/v0/newstories.json',
          beststories: 'https://hacker-news.firebaseio.com/v0/beststories.json',
        };
        
        const response = await fetch(endpoints[type] || endpoints.topstories);
        const ids = await response.json();
        
        // Fetch story details for top N
        const stories = await Promise.all(
          ids.slice(0, limit).map(async (id: number) => {
            const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            return storyRes.json();
          })
        );
        
        return { success: true, data: stories, source: 'hn_api' };
      } catch (error) {
        return { success: false, data: null, source: 'hn_api', error: String(error) };
      }
    },
  },
  
  // Wikipedia API - Public knowledge
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    description: 'Encyclopedia summaries and knowledge extraction',
    category: 'knowledge',
    rateLimit: { requests: 50, windowMs: 60000 },
    fetch: async (params) => {
      if (!checkRateLimit('wikipedia', { requests: 50, windowMs: 60000 })) {
        return { success: false, data: null, source: 'wikipedia', error: 'Rate limited' };
      }
      
      try {
        const { query, sentences = 5 } = params;
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'AgencyBot/1.0 (research)' },
        });
        
        if (!response.ok) {
          throw new Error(`Wikipedia returned ${response.status}`);
        }
        
        const data = await response.json();
        return {
          success: true,
          data: {
            title: data.title,
            extract: data.extract,
            description: data.description,
            thumbnail: data.thumbnail?.source,
            url: data.content_urls?.desktop?.page,
          },
          source: 'wikipedia',
        };
      } catch (error) {
        return { success: false, data: null, source: 'wikipedia', error: String(error) };
      }
    },
  },
  
  // Reddit API - Public JSON endpoints
  reddit_api: {
    id: 'reddit_api',
    name: 'Reddit',
    description: 'Subreddit posts and discussions',
    category: 'social',
    rateLimit: { requests: 20, windowMs: 60000 },
    fetch: async (params) => {
      if (!checkRateLimit('reddit_api', { requests: 20, windowMs: 60000 })) {
        return { success: false, data: null, source: 'reddit_api', error: 'Rate limited' };
      }
      
      try {
        const { subreddit = 'all', sort = 'hot', limit = 10 } = params;
        const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'AgencyBot/1.0 (research)' },
        });
        
        if (!response.ok) {
          throw new Error(`Reddit returned ${response.status}`);
        }
        
        const data = await response.json();
        const posts = data.data.children.map((child: any) => ({
          title: child.data.title,
          author: child.data.author,
          score: child.data.score,
          url: child.data.url,
          selftext: child.data.selftext?.slice(0, 500),
          permalink: `https://reddit.com${child.data.permalink}`,
          created: new Date(child.data.created_utc * 1000).toISOString(),
        }));
        
        return { success: true, data: posts, source: 'reddit_api' };
      } catch (error) {
        return { success: false, data: null, source: 'reddit_api', error: String(error) };
      }
    },
  },
  
  // IPInfo - Basic geo/ASN (free tier)
  ipinfo: {
    id: 'ipinfo',
    name: 'IP Info',
    description: 'IP geolocation and ASN information',
    category: 'networking',
    rateLimit: { requests: 50, windowMs: 86400000 }, // 50/day free
    fetch: async (params) => {
      if (!checkRateLimit('ipinfo', { requests: 50, windowMs: 86400000 })) {
        return { success: false, data: null, source: 'ipinfo', error: 'Rate limited' };
      }
      
      try {
        const { ip } = params;
        const url = ip ? `https://ipinfo.io/${ip}/json` : 'https://ipinfo.io/json';
        const response = await fetch(url);
        const data = await response.json();
        
        return { success: true, data, source: 'ipinfo' };
      } catch (error) {
        return { success: false, data: null, source: 'ipinfo', error: String(error) };
      }
    },
  },
  
  // Open Library - Book/author info
  openlibrary: {
    id: 'openlibrary',
    name: 'Open Library',
    description: 'Book and author information',
    category: 'knowledge',
    rateLimit: { requests: 100, windowMs: 60000 },
    fetch: async (params) => {
      if (!checkRateLimit('openlibrary', { requests: 100, windowMs: 60000 })) {
        return { success: false, data: null, source: 'openlibrary', error: 'Rate limited' };
      }
      
      try {
        const { query, type = 'search' } = params;
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
        const response = await fetch(url);
        const data = await response.json();
        
        const books = data.docs?.slice(0, 10).map((doc: any) => ({
          title: doc.title,
          author: doc.author_name?.[0],
          year: doc.first_publish_year,
          subjects: doc.subject?.slice(0, 5),
          cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
        }));
        
        return { success: true, data: books, source: 'openlibrary' };
      } catch (error) {
        return { success: false, data: null, source: 'openlibrary', error: String(error) };
      }
    },
  },
  
  // SEC EDGAR - Financial filings
  sec_edgar: {
    id: 'sec_edgar',
    name: 'SEC EDGAR',
    description: 'Public company filings and financial data',
    category: 'finance',
    rateLimit: { requests: 10, windowMs: 60000 },
    fetch: async (params) => {
      if (!checkRateLimit('sec_edgar', { requests: 10, windowMs: 60000 })) {
        return { success: false, data: null, source: 'sec_edgar', error: 'Rate limited' };
      }
      
      try {
        const { cik, ticker } = params;
        // Company search by ticker
        const searchUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker || cik}&type=10-K&dateb=&owner=include&count=5&output=atom`;
        const response = await fetch(searchUrl, {
          headers: { 'User-Agent': 'AgencyBot/1.0 (research@example.com)' },
        });
        
        const text = await response.text();
        // Parse basic info from response
        return {
          success: true,
          data: { rawResponse: text.slice(0, 2000), query: ticker || cik },
          source: 'sec_edgar',
        };
      } catch (error) {
        return { success: false, data: null, source: 'sec_edgar', error: String(error) };
      }
    },
  },
  
  // YouTube Transcript (via third-party)
  youtube_transcript: {
    id: 'youtube_transcript',
    name: 'YouTube Transcript',
    description: 'Extract video transcripts',
    category: 'content',
    rateLimit: { requests: 20, windowMs: 60000 },
    fetch: async (params) => {
      // YouTube transcript extraction requires server-side processing
      // Graceful degradation: returns structured error with remediation path
      return {
        success: false,
        data: null,
        source: 'youtube_transcript',
        error: 'YouTube transcript extraction requires a backend function. Use agency task delegation instead.',
      };
    },
  },
  
  // Generic HTTP Fetch
  fetch: {
    id: 'fetch',
    name: 'HTTP Fetch',
    description: 'Generic HTTP request',
    category: 'utility',
    rateLimit: { requests: 100, windowMs: 60000 },
    fetch: async (params) => {
      if (!checkRateLimit('fetch', { requests: 100, windowMs: 60000 })) {
        return { success: false, data: null, source: 'fetch', error: 'Rate limited' };
      }
      
      try {
        const { url, method = 'GET', headers = {} } = params;
        const response = await fetch(url, { method, headers });
        const contentType = response.headers.get('content-type') || '';
        
        let data;
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        return { success: true, data, source: 'fetch' };
      } catch (error) {
        return { success: false, data: null, source: 'fetch', error: String(error) };
      }
    },
  },
};

export type FreeApiAdapterId = keyof typeof FREE_API_ADAPTERS;

/**
 * Execute an API adapter
 */
export async function executeAdapter(
  adapterId: string,
  params: Record<string, any>
): Promise<ApiAdapterResult> {
  const adapter = FREE_API_ADAPTERS[adapterId];
  if (!adapter) {
    return { success: false, data: null, source: adapterId, error: 'Unknown adapter' };
  }
  
  return adapter.fetch(params);
}

/**
 * Get all available adapters
 */
export function getAvailableAdapters(): ApiAdapter[] {
  return Object.values(FREE_API_ADAPTERS);
}
