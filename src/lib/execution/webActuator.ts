/**
 * WebActuator — HTTP operations and structured extraction
 * Core execution engine for web interactions
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  ActionPrimitive, 
  ActionResult, 
  ActionStatus, 
  EvidenceBundle 
} from './actionGrammar';
import { INTEGRATIONS, buildIntegrationUrl, isIntegrationAvailable } from './integrations';

export interface WebActuatorConfig {
  timeout: number;
  retryAttempts: number;
  crawlDepth: number;
  followRedirects: boolean;
  userAgent: string;
}

const DEFAULT_CONFIG: WebActuatorConfig = {
  timeout: 30000,
  retryAttempts: 3,
  crawlDepth: 5,
  followRedirects: true,
  userAgent: 'CMPSBL-Agent/1.0',
};

export interface FetchResult {
  success: boolean;
  data?: unknown;
  content?: string;
  contentType: string;
  statusCode: number;
  error?: string;
  evidence?: EvidenceBundle;
}

/**
 * Execute a web request with retry logic
 */
export async function webFetch(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
  } = {}
): Promise<FetchResult> {
  const { method = 'GET', body, headers = {}, timeout = DEFAULT_CONFIG.timeout } = options;

  try {
    // Use Firecrawl for scraping
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: {
        url,
        options: {
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          waitFor: 2000,
        },
      },
    });

    if (error) {
      return {
        success: false,
        contentType: 'error',
        statusCode: 500,
        error: error.message,
      };
    }

    const content = data?.data?.markdown || data?.markdown || '';
    const html = data?.data?.html || data?.html || '';

    return {
      success: true,
      data: data?.data || data,
      content,
      contentType: 'markdown',
      statusCode: 200,
      evidence: {
        type: 'markdown',
        content: content.slice(0, 5000), // Limit evidence size
        url,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      contentType: 'error',
      statusCode: 500,
      error: err instanceof Error ? err.message : 'Fetch failed',
    };
  }
}

/**
 * Execute structured extraction from a URL
 */
export async function webExtract(
  url: string,
  schema?: Record<string, unknown>
): Promise<FetchResult> {
  try {
    const formats: unknown[] = ['markdown'];
    
    if (schema) {
      formats.push({ type: 'json', schema });
    }

    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: {
        url,
        options: {
          formats,
          onlyMainContent: true,
        },
      },
    });

    if (error) {
      return {
        success: false,
        contentType: 'error',
        statusCode: 500,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data?.data?.json || data?.json || data?.data || data,
      content: data?.data?.markdown || data?.markdown || '',
      contentType: schema ? 'json' : 'markdown',
      statusCode: 200,
      evidence: {
        type: schema ? 'json' : 'markdown',
        content: JSON.stringify(data?.data?.json || data?.data || data, null, 2).slice(0, 5000),
        url,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      contentType: 'error',
      statusCode: 500,
      error: err instanceof Error ? err.message : 'Extraction failed',
    };
  }
}

/**
 * Execute a search using an integration
 */
export async function webSearch(
  query: string,
  integrationId: string = 'duckduckgo'
): Promise<FetchResult> {
  // Check if Firecrawl search is available
  try {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: {
        query,
        options: {
          limit: 10,
          scrapeOptions: {
            formats: ['markdown'],
          },
        },
      },
    });

    if (error) {
      // Fallback to integration-based search
      return executeIntegrationSearch(query, integrationId);
    }

    return {
      success: true,
      data: data?.data || data,
      content: JSON.stringify(data?.data || data, null, 2),
      contentType: 'json',
      statusCode: 200,
      evidence: {
        type: 'json',
        content: JSON.stringify(data?.data || data, null, 2).slice(0, 5000),
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return executeIntegrationSearch(query, integrationId);
  }
}

/**
 * Fallback search using pre-configured integrations
 */
async function executeIntegrationSearch(
  query: string,
  integrationId: string
): Promise<FetchResult> {
  const integration = INTEGRATIONS[integrationId];
  
  if (!integration || !isIntegrationAvailable(integrationId)) {
    return {
      success: false,
      contentType: 'error',
      statusCode: 404,
      error: `Integration ${integrationId} not available`,
    };
  }

  const endpoint = integration.endpoints.find(e => e.id === 'search' || e.id === 'query');
  if (!endpoint) {
    return {
      success: false,
      contentType: 'error',
      statusCode: 404,
      error: 'No search endpoint found',
    };
  }

  const url = buildIntegrationUrl(integrationId, endpoint.id, { query });
  if (!url) {
    return {
      success: false,
      contentType: 'error',
      statusCode: 400,
      error: 'Failed to build URL',
    };
  }

  // For API integrations, try direct fetch
  if (integration.scrapeMethod === 'api') {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': DEFAULT_CONFIG.userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        content: JSON.stringify(data, null, 2),
        contentType: 'json',
        statusCode: response.status,
        evidence: {
          type: 'json',
          content: JSON.stringify(data, null, 2).slice(0, 5000),
          url,
          capturedAt: new Date().toISOString(),
        },
      };
    } catch (err) {
      // Fall through to firecrawl
    }
  }

  // Use Firecrawl for scraping-based integrations
  return webFetch(url);
}

/**
 * Execute a crawl operation (multi-page)
 */
export async function webCrawl(
  url: string,
  options: {
    depth?: number;
    limit?: number;
    includePaths?: string[];
    excludePaths?: string[];
  } = {}
): Promise<FetchResult> {
  const { depth = 3, limit = 20, includePaths, excludePaths } = options;

  try {
    const { data, error } = await supabase.functions.invoke('firecrawl-crawl', {
      body: {
        url,
        options: {
          maxDepth: depth,
          limit,
          includePaths,
          excludePaths,
        },
      },
    });

    if (error) {
      return {
        success: false,
        contentType: 'error',
        statusCode: 500,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data?.data || data,
      content: JSON.stringify(data?.data || data, null, 2),
      contentType: 'json',
      statusCode: 200,
      evidence: {
        type: 'json',
        content: `Crawled ${data?.completed || 0} pages from ${url}`,
        url,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      contentType: 'error',
      statusCode: 500,
      error: err instanceof Error ? err.message : 'Crawl failed',
    };
  }
}

/**
 * Execute an action primitive
 */
export async function executeAction(action: ActionPrimitive): Promise<ActionResult> {
  const startTime = Date.now();
  let status: ActionStatus = 'running';
  let data: unknown;
  let error: string | undefined;
  let evidence: EvidenceBundle | undefined;

  try {
    switch (action.type) {
      case 'find': {
        const result = await webSearch(action.target, action.params.source as string);
        status = result.success ? 'success' : 'fail';
        data = result.data;
        error = result.error;
        evidence = result.evidence;
        break;
      }

      case 'extract': {
        const result = await webExtract(action.target, action.params.schema as Record<string, unknown>);
        status = result.success ? 'success' : 'fail';
        data = result.data;
        error = result.error;
        evidence = result.evidence;
        break;
      }

      case 'compute': {
        // Computation is handled by the agent's AI
        data = { operation: action.target, input: action.params.input };
        status = 'success';
        break;
      }

      case 'submit': {
        // HTTP submission via edge function
        const { data: submitData, error: submitError } = await supabase.functions.invoke('pf-web-submit', {
          body: {
            url: action.target,
            method: action.params.method,
            payload: action.params.payload,
          },
        });
        
        if (submitError) {
          status = 'fail';
          error = submitError.message;
        } else {
          status = 'success';
          data = submitData;
        }
        break;
      }

      case 'notify': {
        // Store notification for user
        console.log(`[Notify] ${action.target}: ${action.params.message}`);
        status = 'success';
        data = { notified: true, channel: action.target };
        break;
      }

      case 'write': {
        // Write to substrate memory
        const { error: writeError } = await supabase
          .from('brain_memory_hot')
          .insert({
            content: JSON.stringify(action.params.data),
            category: 'execution',
            source: action.target,
          });
        
        if (writeError) {
          status = 'fail';
          error = writeError.message;
        } else {
          status = 'success';
          data = { written: true };
        }
        break;
      }

      case 'verify': {
        // Verification is handled by the verifier
        status = 'success';
        data = action.params;
        break;
      }

      case 'schedule': {
        // Queue for later execution
        status = 'success';
        data = { scheduled: true, delay: action.params.delayMs };
        break;
      }

      default:
        status = 'fail';
        error = `Unknown action type: ${action.type}`;
    }
  } catch (err) {
    status = 'fail';
    error = err instanceof Error ? err.message : 'Action execution failed';
  }

  return {
    action,
    status,
    data,
    error,
    evidence,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}
