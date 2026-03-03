/**
 * AutoBlog Site Scanner v1.0
 * Slow incremental site scanning for internal topic seeding.
 * Never generates drafts — only feeds topic seeds.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ScanResult {
  url: string;
  title: string;
  headers: string[];
  keywords: string[];
  scannedAt: string;
}

export interface SiteScanSummary {
  urlsScanned: number;
  seedsCreated: number;
  seedsUpdated: number;
}

/**
 * Extract keywords from text (simple TF heuristic).
 */
function extractKeywords(text: string, limit: number = 10): string[] {
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
    'can', 'had', 'her', 'was', 'one', 'our', 'out', 'with',
    'has', 'this', 'that', 'from', 'they', 'been', 'have',
    'will', 'each', 'make', 'like', 'into', 'just', 'also',
    'more', 'than', 'them', 'then', 'some', 'what', 'when',
    'your', 'which', 'their', 'about', 'would', 'there',
  ]);

  const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([w]) => w);
}

/**
 * Fetch and parse a page for topic signals.
 * Returns null if page can't be fetched or is a blog post.
 */
async function scanPage(url: string): Promise<ScanResult | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CMPSBL-SiteScanner/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Skip blog posts (heuristic: URL contains /blog/ or /post/)
    if (/\/(blog|post|article)\//i.test(url)) return null;

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract H2/H3 headers
    const headerRegex = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
    const headers: string[] = [];
    let match;
    while ((match = headerRegex.exec(html)) !== null && headers.length < 20) {
      headers.push(match[1].trim());
    }

    // Extract visible text (crude but sufficient for keyword extraction)
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const keywords = extractKeywords(`${title} ${headers.join(' ')} ${textContent}`);

    return {
      url,
      title,
      headers,
      keywords,
      scannedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Run an incremental site scan.
 * Scans max 5 URLs per run.
 * Never generates drafts — only creates/updates topic seeds.
 */
export async function runSiteScan(urls: string[]): Promise<SiteScanSummary> {
  const summary: SiteScanSummary = { urlsScanned: 0, seedsCreated: 0, seedsUpdated: 0 };
  const toScan = urls.slice(0, 5); // Max 5 per run

  for (const url of toScan) {
    const result = await scanPage(url);
    if (!result || result.keywords.length === 0) continue;
    summary.urlsScanned++;

    // Check if seed exists
    const { data: existing } = await supabase
      .from('autoblog_topic_seeds' as any)
      .select('id, keywords, weight, scan_count')
      .eq('url', url)
      .maybeSingle();

    if (existing) {
      const existingRecord = existing as any;
      // Merge keywords, increase weight if keywords repeat
      const existingKeywords: string[] = existingRecord.keywords || [];
      const repeats = result.keywords.filter(k => existingKeywords.includes(k)).length;
      const weightBoost = Math.min(0.05, repeats * 0.01);

      const mergedKeywords = [...new Set([...existingKeywords, ...result.keywords])].slice(0, 30);

      await supabase
        .from('autoblog_topic_seeds' as any)
        .update({
          keywords: mergedKeywords,
          weight: Math.min(1, (existingRecord.weight || 0.1) + weightBoost),
          last_scanned: new Date().toISOString(),
          scan_count: (existingRecord.scan_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRecord.id);

      summary.seedsUpdated++;
    } else {
      await supabase
        .from('autoblog_topic_seeds' as any)
        .insert({
          url,
          keywords: result.keywords,
          weight: 0.1,
          last_scanned: new Date().toISOString(),
          scan_count: 1,
        });
      summary.seedsCreated++;
    }
  }

  // Log scan event
  if (summary.urlsScanned > 0) {
    await supabase.from('brain_events').insert([{
      module: 'autoblog',
      event_type: 'site_scan_completed',
      data: summary,
      outcome: 'completed',
    }]);
  }

  return summary;
}

/**
 * Get topic seed alignment bonus for a draft.
 * Returns a small sourceStability boost (max +0.05) if draft keywords
 * align with high-weight topic seeds.
 */
export async function getTopicSeedAlignment(
  draftKeywords: string[],
): Promise<number> {
  try {
    const { data: seeds } = await supabase
      .from('autoblog_topic_seeds' as any)
      .select('keywords, weight')
      .gte('weight', 0.15)
      .order('weight', { ascending: false })
      .limit(20);

    if (!seeds || seeds.length === 0) return 0;

    let totalAlignment = 0;
    for (const seed of seeds as any[]) {
      const seedKeywords: string[] = seed.keywords || [];
      const overlap = draftKeywords.filter(k => seedKeywords.includes(k.toLowerCase())).length;
      if (overlap > 0) {
        totalAlignment += overlap * (seed.weight || 0.1);
      }
    }

    return Math.min(0.05, totalAlignment * 0.01);
  } catch {
    return 0;
  }
}
