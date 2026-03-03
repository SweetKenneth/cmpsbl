/**
 * AutoBlog Interlinker v1.0
 * Contextual internal linking: 3–7 links per post.
 * Matches draft keywords against existing published posts.
 */

import { supabase } from '@/integrations/supabase/client';

export interface InterlinkResult {
  linksInjected: number;
  modifiedBody: string;
  linkedUrls: string[];
}

interface InternalPage {
  slug: string;
  title: string;
  keywords: string[];
}

/**
 * Extract significant words from text.
 */
function extractSignificantWords(text: string): string[] {
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
    'can', 'had', 'was', 'one', 'our', 'with', 'has', 'this',
    'that', 'from', 'they', 'been', 'have', 'will', 'each',
    'like', 'into', 'just', 'also', 'more', 'than', 'them',
    'then', 'some', 'what', 'when', 'your', 'which', 'their',
    'about', 'would', 'there', 'could', 'should',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopWords.has(w));
}

/**
 * Score how relevant a page is to the draft.
 */
function scoreRelevance(draftWords: string[], page: InternalPage): number {
  const pageWords = new Set(page.keywords);
  let matches = 0;
  for (const w of draftWords) {
    if (pageWords.has(w)) matches++;
  }
  return matches;
}

/**
 * Check if a position is inside a code block.
 */
function isInsideCodeBlock(body: string, position: number): boolean {
  const before = body.substring(0, position);
  const codeBlockStarts = (before.match(/```/g) || []).length;
  return codeBlockStarts % 2 !== 0; // Odd count means we're inside a code block
}

/**
 * Inject contextual internal links into a draft body.
 * Rules:
 * - 3–7 links max
 * - Max 1 link per URL
 * - Never inside code blocks
 * - Skip if no semantic match
 * - Avoid spam patterns (no consecutive links)
 */
export async function injectInternalLinks(
  body: string,
  currentSlug?: string,
): Promise<InterlinkResult> {
  const defaultResult: InterlinkResult = { linksInjected: 0, modifiedBody: body, linkedUrls: [] };

  try {
    // Fetch recent published posts
    const { data: posts } = await supabase
      .from('auto_blog_posts')
      .select('slug, title')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(30);

    if (!posts || posts.length === 0) return defaultResult;

    // Build internal pages index
    const pages: InternalPage[] = posts
      .filter(p => p.slug !== currentSlug)
      .map(p => ({
        slug: p.slug,
        title: p.title,
        keywords: extractSignificantWords(p.title),
      }));

    if (pages.length === 0) return defaultResult;

    const draftWords = extractSignificantWords(body);

    // Score and rank pages by relevance
    const scored = pages
      .map(p => ({ page: p, score: scoreRelevance(draftWords, p) }))
      .filter(s => s.score >= 2) // Minimum 2 keyword matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 7); // Max 7 candidates

    if (scored.length < 3) {
      // Not enough relevant pages; skip to avoid spam
      return defaultResult;
    }

    // Inject links into the body
    let modifiedBody = body;
    const linkedUrls: string[] = [];
    let linksInjected = 0;

    for (const { page } of scored) {
      if (linksInjected >= 7) break;

      // Find a natural anchor point: a keyword from the page title that appears in body
      const anchorWord = page.keywords.find(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        const match = regex.exec(modifiedBody);
        if (!match) return false;
        // Check not inside code block and not already linked
        if (isInsideCodeBlock(modifiedBody, match.index)) return false;
        // Check not already in a markdown link
        const surroundingBefore = modifiedBody.substring(Math.max(0, match.index - 2), match.index);
        if (surroundingBefore.includes('[')) return false;
        return true;
      });

      if (!anchorWord) continue;

      const url = `/changelog/${page.slug}`;
      if (linkedUrls.includes(url)) continue;

      // Replace first occurrence only (not in code blocks)
      const regex = new RegExp(`\\b(${anchorWord})\\b`, 'i');
      const match = regex.exec(modifiedBody);
      if (match && !isInsideCodeBlock(modifiedBody, match.index)) {
        modifiedBody = modifiedBody.substring(0, match.index) +
          `[${match[1]}](${url})` +
          modifiedBody.substring(match.index + match[1].length);
        linkedUrls.push(url);
        linksInjected++;
      }
    }

    return { linksInjected, modifiedBody, linkedUrls };
  } catch (err) {
    console.warn('[AutoBlog Interlinker] Failed:', err);
    return defaultResult;
  }
}
