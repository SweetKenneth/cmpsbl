/**
 * Dynamic RSS Feed Generator — Edge Function
 * Generates RSS XML from auto_blog_posts.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/rss+xml; charset=utf-8',
  'Cache-Control': 'public, max-age=1800, s-maxage=3600',
};

const SITE = 'https://cmpsbl.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: posts } = await supabase
      .from('auto_blog_posts')
      .select('title, slug, excerpt, published_at, category, author_name')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>CMPSBL — AI Infrastructure Insights</title>
    <description>Applied AI insights on autonomous systems, cognitive infrastructure, accessibility compliance, and enterprise AI.</description>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <copyright>© 2009-2026 CMPSBL®. All rights reserved.</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>CMPSBL Substrate</generator>
    <image>
      <url>${SITE}/logo.png</url>
      <title>CMPSBL</title>
      <link>${SITE}</link>
    </image>
`;

    if (posts) {
      for (const post of posts) {
        const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : now;
        xml += `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt || '')}</description>
      <category>${escapeXml(post.category || 'Technology')}</category>
      <dc:creator>${escapeXml(post.author_name || 'CMPSBL Research Team')}</dc:creator>
    </item>
`;
      }
    }

    xml += `  </channel>
</rss>`;

    return new Response(xml, { headers: corsHeaders });
  } catch {
    return new Response(`<?xml version="1.0"?><rss version="2.0"><channel><title>CMPSBL</title></channel></rss>`, {
      headers: corsHeaders,
    });
  }
});
