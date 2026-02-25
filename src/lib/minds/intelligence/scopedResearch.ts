/**
 * Minds Intelligence Layer — Scoped Research URLs
 * Each Mind has a curated domain whitelist.
 * Research tool enforces scope boundaries at execution layer.
 */

import { isFeatureActive } from './featureFlags';

export interface ResearchScope {
  /** Allowed domains for this Mind */
  allowedDomains: string[];
  /** Blocked domains (override even if in allowed) */
  blockedDomains: string[];
  /** Max depth for crawling */
  maxCrawlDepth: number;
  /** Whether to allow subdomains of allowed domains */
  allowSubdomains: boolean;
}

/** Per-Mind research scope definitions */
const MIND_RESEARCH_SCOPES: Record<string, ResearchScope> = {
  hybrid: {
    allowedDomains: ['*'], // Generalist — unrestricted
    blockedDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
    maxCrawlDepth: 2,
    allowSubdomains: true,
  },
  educator: {
    allowedDomains: [
      'scholar.google.com', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov',
      'wikipedia.org', 'khanacademy.org', 'coursera.org',
      'edx.org', 'mit.edu', 'stanford.edu', 'nature.com',
      'sciencedirect.com', 'jstor.org', 'researchgate.net',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 3,
    allowSubdomains: true,
  },
  sales: {
    allowedDomains: [
      'linkedin.com', 'crunchbase.com', 'glassdoor.com',
      'g2.com', 'capterra.com', 'trustpilot.com',
      'bloomberg.com', 'reuters.com', 'sec.gov',
      'pitchbook.com', 'owler.com', 'zoominfo.com',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 2,
    allowSubdomains: true,
  },
  research: {
    allowedDomains: [
      'scholar.google.com', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov',
      'nature.com', 'sciencedirect.com', 'jstor.org',
      'researchgate.net', 'semanticscholar.org', 'ieee.org',
      'acm.org', 'springer.com', 'wiley.com', 'ssrn.com',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 4,
    allowSubdomains: true,
  },
  coding: {
    allowedDomains: [
      'github.com', 'stackoverflow.com', 'developer.mozilla.org',
      'docs.python.org', 'docs.rust-lang.org', 'go.dev',
      'npmjs.com', 'crates.io', 'pypi.org', 'pkg.go.dev',
      'devdocs.io', 'hackernews.com',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 3,
    allowSubdomains: true,
  },
  legal: {
    allowedDomains: [
      'law.cornell.edu', 'supremecourt.gov', 'uscourts.gov',
      'sec.gov', 'ftc.gov', 'gdpr-info.eu', 'iapp.org',
      'lexisnexis.com', 'westlaw.com', 'findlaw.com',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 3,
    allowSubdomains: true,
  },
  security: {
    allowedDomains: [
      'nvd.nist.gov', 'cve.org', 'owasp.org', 'mitre.org',
      'sans.org', 'cisa.gov', 'exploit-db.com',
      'security.googleblog.com', 'github.com/advisories',
    ],
    blockedDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
    maxCrawlDepth: 3,
    allowSubdomains: true,
  },
  finance: {
    allowedDomains: [
      'sec.gov', 'bloomberg.com', 'reuters.com', 'wsj.com',
      'ft.com', 'investopedia.com', 'yahoo.com/finance',
      'federalreserve.gov', 'treasury.gov',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 2,
    allowSubdomains: true,
  },
  marketing: {
    allowedDomains: [
      'hubspot.com', 'semrush.com', 'ahrefs.com', 'moz.com',
      'marketingland.com', 'searchengineland.com', 'adweek.com',
      'contentmarketinginstitute.com', 'sproutsocial.com',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 2,
    allowSubdomains: true,
  },
  product: {
    allowedDomains: [
      'producthunt.com', 'ycombinator.com', 'techcrunch.com',
      'svpg.com', 'mindtheproduct.com', 'lenny.substack.com',
      'intercom.com/blog', 'amplitude.com/blog',
    ],
    blockedDomains: ['localhost', '127.0.0.1'],
    maxCrawlDepth: 2,
    allowSubdomains: true,
  },
};

/** Default scope for Minds without explicit definitions */
const DEFAULT_SCOPE: ResearchScope = {
  allowedDomains: ['*'],
  blockedDomains: ['localhost', '127.0.0.1', '0.0.0.0', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
  maxCrawlDepth: 2,
  allowSubdomains: true,
};

/** Get research scope for a Mind */
export function getResearchScope(mindSku: string): ResearchScope {
  return MIND_RESEARCH_SCOPES[mindSku] ?? DEFAULT_SCOPE;
}

/** Validate a URL against a Mind's research scope */
export function isUrlAllowed(mindSku: string, url: string): { allowed: boolean; reason?: string } {
  if (!isFeatureActive('scoped_research')) {
    return { allowed: true }; // Feature disabled, allow all
  }

  const scope = getResearchScope(mindSku);

  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { allowed: false, reason: 'Invalid URL format' };
  }

  // Check blocked domains first
  for (const blocked of scope.blockedDomains) {
    if (hostname === blocked || hostname.endsWith(`.${blocked}`)) {
      return { allowed: false, reason: `Domain "${hostname}" is blocked` };
    }
  }

  // Wildcard allows all
  if (scope.allowedDomains.includes('*')) {
    return { allowed: true };
  }

  // Check allowed domains
  for (const allowed of scope.allowedDomains) {
    if (hostname === allowed) return { allowed: true };
    if (scope.allowSubdomains && hostname.endsWith(`.${allowed}`)) {
      return { allowed: true };
    }
  }

  return { allowed: false, reason: `Domain "${hostname}" not in whitelist for ${mindSku}` };
}

/** Add a custom domain to a Mind's scope (runtime) */
export function addAllowedDomain(mindSku: string, domain: string): void {
  if (!MIND_RESEARCH_SCOPES[mindSku]) {
    MIND_RESEARCH_SCOPES[mindSku] = { ...DEFAULT_SCOPE, allowedDomains: [] };
  }
  if (!MIND_RESEARCH_SCOPES[mindSku].allowedDomains.includes(domain)) {
    MIND_RESEARCH_SCOPES[mindSku].allowedDomains.push(domain);
  }
}

/** Get the full scope config for admin inspection */
export function getAllScopes(): Record<string, ResearchScope> {
  return { ...MIND_RESEARCH_SCOPES };
}
