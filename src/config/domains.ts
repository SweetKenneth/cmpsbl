// CMPSBL Dual-Domain Architecture Configuration
// evolv.onl: Backend/API/Railway infrastructure
// cmpsbl.com: Public-facing website and customer portal

export const DOMAIN_CONFIG = {
  backend: {
    primary: 'evolv.onl',
    subdomains: {
      api: 'api.evolv.onl',
      workers: 'workers.evolv.onl',
      railway: 'railway.evolv.onl',
      defense: 'defense.evolv.onl',
      nexus: 'nexus.evolv.onl',
      brain: 'brain.evolv.onl',
    },
    purpose: 'Backend infrastructure, API endpoints, Railway workers, Defense System',
    restricted: true,
    requiresAuth: true,
  },
  frontend: {
    primary: 'cmpsbl.com',
    subdomains: {
      www: 'www.cmpsbl.com',
      app: 'app.cmpsbl.com',
      docs: 'docs.cmpsbl.com',
      studio: 'studio.cmpsbl.com',
      vision: 'vision.cmpsbl.com',
    },
    purpose: 'Public website, customer portal, employee interaction',
    restricted: false,
    requiresAuth: false,
  },
  /** Vertical substrate subdomains — each is a full 40-primitive instance */
  verticals: {
    security: 'security.cmpsbl.com',
    health: 'health.cmpsbl.com',
    fintech: 'fintech.cmpsbl.com',
    legal: 'legal.cmpsbl.com',
    gaming: 'gaming.cmpsbl.com',
    education: 'education.cmpsbl.com',
    robotics: 'robotics.cmpsbl.com',
    quantum: 'quantum.cmpsbl.com',
    llm: 'llm.cmpsbl.com',
    agency: 'agency.cmpsbl.com',
    ultimate: 'ultimate.cmpsbl.com',
  },
  /** Special-purpose subdomains (not full substrates) */
  services: {
    marketplace: 'marketplace.cmpsbl.com',
  },
} as const;

export const COPYRIGHT_NOTICE = {
  trademark: '™',
  copyright: '©',
  year: new Date().getFullYear(),
  entities: [
    'CMPSBL™',
    'CMPSBL.com',
    'Evolv.onl',
    'CMPSBL BRAIN™',
    'CMPSBL VISION™',
    'CMPSBL DEFENSE™',
    'CMPSBL NEXUS™',
    'CMPSBL RIPPLE™',
    'CMPSBL CYBER™',
    'CMPSBL LLM™',
  ],
  legalWarning: `All Rights Reserved. Unauthorized access, use, or distribution of CMPSBL's proprietary APIs, networks, products, or intellectual property is strictly prohibited and subject to legal prosecution.`,
  enforcementNotice: `This system is protected by CMPSBL DEFENSE™. All access attempts are monitored, logged, and analyzed for security threats.`,
};

export function isDomain(hostname: string, type: 'backend' | 'frontend'): boolean {
  const config = DOMAIN_CONFIG[type];
  return hostname === config.primary || 
         Object.values(config.subdomains).some(subdomain => hostname === subdomain);
}

export function getCurrentDomainType(): 'backend' | 'frontend' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const hostname = window.location.hostname;
  
  if (isDomain(hostname, 'backend')) return 'backend';
  if (isDomain(hostname, 'frontend')) return 'frontend';
  
  return 'unknown';
}

export function isBackendDomain(): boolean {
  return getCurrentDomainType() === 'backend';
}

export function isFrontendDomain(): boolean {
  return getCurrentDomainType() === 'frontend';
}

/**
 * Detect if current hostname is a vertical substrate subdomain
 * Returns the vertical key (e.g. 'security') or null
 */
export function getVerticalSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname.toLowerCase();

  for (const [key, subdomain] of Object.entries(DOMAIN_CONFIG.verticals)) {
    if (hostname === subdomain || hostname === `www.${subdomain}`) {
      return key;
    }
  }
  return null;
}

/**
 * Check if on any vertical substrate subdomain
 */
export function isVerticalDomain(): boolean {
  return getVerticalSubdomain() !== null;
}

/**
 * Detect if current hostname is the marketplace subdomain
 */
export function isMarketplaceDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === DOMAIN_CONFIG.services.marketplace
    || hostname === `www.${DOMAIN_CONFIG.services.marketplace}`;
}
