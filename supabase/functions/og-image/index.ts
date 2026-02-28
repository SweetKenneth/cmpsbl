/**
 * Dynamic OG Image Generator — Edge Function
 * Generates branded OG images on-the-fly for any route.
 * 
 * Usage: /og-image?title=...&subtitle=...&theme=dark
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BRAND = {
  name: 'CMPSBL',
  tagline: 'Composable AI Infrastructure',
  domain: 'cmpsbl.com',
  colors: {
    dark: { bg: '#0a0a0f', fg: '#e4e4e7', accent: '#6366f1', muted: '#71717a' },
    light: { bg: '#fafafa', fg: '#18181b', accent: '#4f46e5', muted: '#a1a1aa' },
  },
};

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateSVG(title: string, subtitle: string, theme: 'dark' | 'light' = 'dark'): string {
  const c = BRAND.colors[theme];
  const safeTitle = escapeXml(title).slice(0, 80);
  const safeSubtitle = escapeXml(subtitle).slice(0, 120);

  // Wrap title if too long
  const titleLines: string[] = [];
  const words = safeTitle.split(' ');
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length > 28 && currentLine) {
      titleLines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ' ' + word;
    }
  }
  if (currentLine.trim()) titleLines.push(currentLine.trim());

  const titleY = titleLines.length > 1 ? 260 : 290;

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${c.accent}"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="${c.bg}"/>
  <rect width="1200" height="630" fill="url(#accent-grad)"/>
  
  <!-- Geometric accent -->
  <circle cx="1050" cy="120" r="200" fill="${c.accent}" opacity="0.06"/>
  <circle cx="1100" cy="500" r="120" fill="${c.accent}" opacity="0.04"/>
  
  <!-- Top accent line -->
  <rect x="80" y="0" width="4" height="630" fill="${c.accent}" opacity="0.3"/>
  
  <!-- Brand mark -->
  <text x="100" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${c.accent}" letter-spacing="6">${BRAND.name}</text>
  
  <!-- Title -->
  ${titleLines.map((line, i) => 
    `<text x="100" y="${titleY + i * 64}" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="800" fill="${c.fg}">${line}</text>`
  ).join('\n  ')}
  
  <!-- Divider -->
  <rect x="100" y="${titleY + titleLines.length * 64 + 10}" width="120" height="3" fill="url(#line-grad)"/>
  
  <!-- Subtitle -->
  <text x="100" y="${titleY + titleLines.length * 64 + 55}" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${c.muted}">${safeSubtitle}</text>
  
  <!-- Footer -->
  <text x="100" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="${c.muted}">${BRAND.domain}</text>
  <text x="1100" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="${c.muted}" text-anchor="end">${BRAND.tagline}</text>
</svg>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || 'CMPSBL';
    const subtitle = url.searchParams.get('subtitle') || 'Composable AI Infrastructure';
    const theme = (url.searchParams.get('theme') as 'dark' | 'light') || 'dark';

    const svg = generateSVG(title, subtitle, theme);

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'OG generation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
