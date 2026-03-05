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
