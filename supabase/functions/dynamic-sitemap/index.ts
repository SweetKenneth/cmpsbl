/**
 * Dynamic Sitemap Generator — Edge Function
 * Generates sitemap XML from auto_blog_posts + static routes.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
};

const SITE = 'https://cmpsbl.com';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/explore', priority: '1.0', changefreq: 'daily' },
  { path: '/substrate', priority: '0.9', changefreq: 'weekly' },
  { path: '/ai-operating-system', priority: '0.9', changefreq: 'weekly' },
  { path: '/modules', priority: '0.8', changefreq: 'weekly' },
  { path: '/persistent-memory', priority: '0.8', changefreq: 'monthly' },
  { path: '/composable-cognitives', priority: '0.8', changefreq: 'monthly' },
  { path: '/decode', priority: '0.8', changefreq: 'monthly' },
  { path: '/feed-dream-eater', priority: '0.7', changefreq: 'monthly' },
  { path: '/upgrade', priority: '0.7', changefreq: 'monthly' },
  { path: '/packs', priority: '0.7', changefreq: 'monthly' },
  { path: '/start-here', priority: '0.8', changefreq: 'monthly' },
  { path: '/documentation', priority: '0.7', changefreq: 'weekly' },
  { path: '/developer-portal', priority: '0.7', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'yearly' },
  { path: '/solutions', priority: '0.7', changefreq: 'monthly' },
  { path: '/enterprise', priority: '0.7', changefreq: 'monthly' },
  { path: '/architecture', priority: '0.7', changefreq: 'monthly' },
  { path: '/runtime', priority: '0.6', changefreq: 'monthly' },
  { path: '/foundations', priority: '0.6', changefreq: 'monthly' },
  { path: '/proof', priority: '0.6', changefreq: 'monthly' },
  { path: '/gaming', priority: '0.6', changefreq: 'monthly' },
  { path: '/evolution-mesh', priority: '0.6', changefreq: 'monthly' },
  { path: '/status', priority: '0.5', changefreq: 'daily' },
  { path: '/careers', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/products/defense', priority: '0.8', changefreq: 'weekly' },
  { path: '/products/clarity', priority: '0.8', changefreq: 'weekly' },
  { path: '/products/brain', priority: '0.8', changefreq: 'weekly' },
  { path: '/products/modernizer', priority: '0.8', changefreq: 'weekly' },
  { path: '/products/cascade', priority: '0.8', changefreq: 'weekly' },
  { path: '/products/marketing', priority: '0.8', changefreq: 'weekly' },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch published blog posts
    const { data: posts } = await supabase
      .from('auto_blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(500);

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Static routes
    for (const route of STATIC_ROUTES) {
      xml += `  <url>
    <loc>${SITE}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
    }

    // Blog posts
    if (posts) {
      for (const post of posts) {
        const lastmod = (post.updated_at || post.published_at || today).split('T')[0];
        xml += `  <url>
    <loc>${SITE}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Scan result share pages
    const { data: scans } = await supabase
      .from('access_scans')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (scans) {
      for (const scan of scans) {
        const lastmod = scan.created_at.split('T')[0];
        xml += `  <url>
    <loc>${SITE}/scan/results/${scan.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, { headers: corsHeaders });
  } catch (error) {
    return new Response(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: corsHeaders,
    });
  }
});
