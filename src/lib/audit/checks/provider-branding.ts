/**
 * Audit Check: Provider Branding Detection
 * Scans for leftover branding from popular development platforms
 * that subscribers may have missed during migration.
 *
 * Detects: Lovable, Replit, Vercel, Netlify, Firebase, Supabase,
 * Railway, Render, Fly.io, Heroku, AWS Amplify, and more.
 */

import type { AuditFinding } from '../audit-types';

interface ProviderSignature {
  provider: string;
  patterns: RegExp[];
  metaSelectors?: string[];
  faviconPatterns?: RegExp[];
  linkPatterns?: RegExp[];
}

const PROVIDER_SIGNATURES: ProviderSignature[] = [
  {
    provider: 'Lovable',
    patterns: [
      /lovable\.ai/i,
      /lovable\s*cloud/i,
      /powered\s*by\s*lovable/i,
      /built\s*with\s*lovable/i,
      /lovableproject\.com/i,
      /lovable\.dev/i,
      /gptengineer/i,
    ],
    faviconPatterns: [/lovable/i],
    linkPatterns: [/lovable\.app/i, /lovableproject\.com/i],
  },
  {
    provider: 'Replit',
    patterns: [
      /replit\.com/i,
      /powered\s*by\s*replit/i,
      /built\s*(with|on)\s*replit/i,
      /repl\.co/i,
      /replit\s*agent/i,
    ],
    faviconPatterns: [/replit/i],
    linkPatterns: [/replit\.com/i, /repl\.co/i, /replit\.app/i],
  },
  {
    provider: 'Vercel',
    patterns: [
      /powered\s*by\s*vercel/i,
      /deployed\s*(on|with)\s*vercel/i,
      /vercel\.app/i,
      /▲\s*vercel/i,
    ],
    faviconPatterns: [/vercel/i],
    linkPatterns: [/vercel\.com/i, /vercel\.app/i],
  },
  {
    provider: 'Netlify',
    patterns: [
      /powered\s*by\s*netlify/i,
      /deployed\s*(on|with)\s*netlify/i,
      /netlify\.app/i,
      /netlify\s*cms/i,
    ],
    faviconPatterns: [/netlify/i],
    linkPatterns: [/netlify\.com/i, /netlify\.app/i],
  },
  {
    provider: 'Firebase',
    patterns: [
      /powered\s*by\s*firebase/i,
      /firebaseapp\.com/i,
      /firebase\s*hosting/i,
    ],
    faviconPatterns: [/firebase/i],
    linkPatterns: [/firebaseapp\.com/i, /firebase\.google\.com/i],
  },
  {
    provider: 'Supabase',
    patterns: [
      /powered\s*by\s*supabase/i,
      /built\s*with\s*supabase/i,
      /supabase\.co/i,
    ],
    faviconPatterns: [/supabase/i],
    linkPatterns: [/supabase\.co/i, /supabase\.com/i],
  },
  {
    provider: 'Railway',
    patterns: [
      /powered\s*by\s*railway/i,
      /railway\.app/i,
    ],
    linkPatterns: [/railway\.app/i],
  },
  {
    provider: 'Render',
    patterns: [
      /powered\s*by\s*render/i,
      /onrender\.com/i,
    ],
    linkPatterns: [/onrender\.com/i],
  },
  {
    provider: 'Heroku',
    patterns: [
      /powered\s*by\s*heroku/i,
      /herokuapp\.com/i,
    ],
    linkPatterns: [/herokuapp\.com/i],
  },
  {
    provider: 'Fly.io',
    patterns: [
      /powered\s*by\s*fly\.io/i,
      /fly\.dev/i,
    ],
    linkPatterns: [/fly\.dev/i, /fly\.io/i],
  },
  {
    provider: 'AWS Amplify',
    patterns: [
      /powered\s*by\s*amplify/i,
      /amplifyapp\.com/i,
    ],
    linkPatterns: [/amplifyapp\.com/i],
  },
  {
    provider: 'Cloudflare Pages',
    patterns: [
      /powered\s*by\s*cloudflare/i,
      /pages\.dev/i,
    ],
    linkPatterns: [/pages\.dev/i],
  },
];

function scanTextContent(text: string, provider: ProviderSignature): string | null {
  for (const pattern of provider.patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

export function checkProviderBranding(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Collect all scannable surfaces
  const title = document.title || '';
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
  const twitterDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';

  const metaSurfaces = [
    { label: 'title', value: title },
    { label: 'meta description', value: metaDesc },
    { label: 'og:title', value: ogTitle },
    { label: 'og:description', value: ogDesc },
    { label: 'twitter:title', value: twitterTitle },
    { label: 'twitter:description', value: twitterDesc },
  ];

  // Check meta tags for provider branding
  for (const surface of metaSurfaces) {
    if (!surface.value) continue;
    for (const provider of PROVIDER_SIGNATURES) {
      const match = scanTextContent(surface.value, provider);
      if (match) {
        findings.push({
          id: `provider_branding_${provider.provider.toLowerCase()}_${surface.label.replace(/\W/g, '_')}`,
          category: 'seo',
          severity: 'error',
          title: `${provider.provider} branding in ${surface.label}`,
          detail: `"${match}" found in ${surface.label}. Remove third-party platform branding before shipping.`,
          hint: `Replace ${provider.provider} references with your own branding.`,
        });
      }
    }
  }

  // Check favicons for provider branding
  const favicons = document.querySelectorAll('link[rel*="icon"]');
  favicons.forEach((favicon) => {
    const href = favicon.getAttribute('href') || '';
    for (const provider of PROVIDER_SIGNATURES) {
      if (provider.faviconPatterns) {
        for (const pattern of provider.faviconPatterns) {
          if (pattern.test(href)) {
            findings.push({
              id: `provider_favicon_${provider.provider.toLowerCase()}`,
              category: 'seo',
              severity: 'error',
              title: `${provider.provider} favicon detected`,
              detail: `Favicon "${href}" appears to be from ${provider.provider}. Replace with your own favicon.`,
              hint: 'Upload a custom favicon to /public and update your HTML head.',
            });
          }
        }
      }
    }
  });

  // Check all links on page for provider domains
  const links = document.querySelectorAll('a[href]');
  const checkedDomains = new Set<string>();
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    for (const provider of PROVIDER_SIGNATURES) {
      if (provider.linkPatterns) {
        for (const pattern of provider.linkPatterns) {
          const key = `${provider.provider}:${pattern.source}`;
          if (!checkedDomains.has(key) && pattern.test(href)) {
            checkedDomains.add(key);
            findings.push({
              id: `provider_link_${provider.provider.toLowerCase()}_${pattern.source.replace(/\W/g, '_')}`,
              category: 'seo',
              severity: 'warn',
              title: `${provider.provider} link found`,
              detail: `Link to "${href}" references ${provider.provider} domain. Verify this is intentional.`,
              hint: 'Remove platform-specific links before deploying to production.',
            });
          }
        }
      }
    }
  });

  // Check for generator meta tags
  const generator = document.querySelector('meta[name="generator"]');
  if (generator) {
    const content = generator.getAttribute('content') || '';
    for (const provider of PROVIDER_SIGNATURES) {
      if (provider.patterns.some(p => p.test(content))) {
        findings.push({
          id: `provider_generator_${provider.provider.toLowerCase()}`,
          category: 'seo',
          severity: 'error',
          title: `${provider.provider} generator meta tag`,
          detail: `<meta name="generator" content="${content}"> exposes your build platform. Remove it.`,
          hint: 'Delete the generator meta tag from your HTML head.',
        });
      }
    }
  }

  // Check for common platform CSS classes left in body
  const body = document.body;
  if (body) {
    const bodyClasses = body.className || '';
    const platformClasses = [
      { pattern: /replit/i, provider: 'Replit' },
      { pattern: /lovable/i, provider: 'Lovable' },
      { pattern: /vercel/i, provider: 'Vercel' },
      { pattern: /netlify/i, provider: 'Netlify' },
    ];
    for (const { pattern, provider } of platformClasses) {
      if (pattern.test(bodyClasses)) {
        findings.push({
          id: `provider_body_class_${provider.toLowerCase()}`,
          category: 'ui',
          severity: 'warn',
          title: `${provider} CSS class on <body>`,
          detail: `Body element has class referencing ${provider}. Remove platform-specific classes.`,
        });
      }
    }
  }

  // Summary
  if (findings.length === 0) {
    findings.push({
      id: 'provider_branding_clean',
      category: 'seo',
      severity: 'info',
      title: 'No third-party provider branding detected',
      detail: 'Page is clean of known platform branding from Lovable, Replit, Vercel, Netlify, Firebase, and others.',
    });
  }

  return findings;
}
