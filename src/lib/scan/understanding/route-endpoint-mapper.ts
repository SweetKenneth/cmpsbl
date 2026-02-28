/**
 * #6 — Route & Endpoint Mapper
 * Crawl all API routes, middleware chains, and auth guards to build
 * a complete attack surface map.
 */

export interface RouteMap {
  routes: RouteInfo[];
  middlewareChains: MiddlewareChain[];
  unprotectedRoutes: RouteInfo[];
  publicEndpoints: RouteInfo[];
  totalRoutes: number;
  totalUnprotected: number;
  attackSurfaceScore: number;
  scanTimestamp: string;
}

export interface RouteInfo {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL' | '*';
  handler: string;
  file: string;
  hasAuth: boolean;
  hasValidation: boolean;
  hasRateLimit: boolean;
  middleware: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  parameterTypes: ParameterInfo[];
}

export interface ParameterInfo {
  name: string;
  location: 'path' | 'query' | 'body' | 'header';
  type: string;
  required: boolean;
  validated: boolean;
}

export interface MiddlewareChain {
  name: string;
  appliedTo: string[];
  type: 'auth' | 'validation' | 'rate_limit' | 'cors' | 'logging' | 'error_handling' | 'custom';
  order: number;
}

// Route detection patterns by framework
const ROUTE_PATTERNS: Record<string, RegExp[]> = {
  express: [
    /(?:app|router)\.(get|post|put|patch|delete|all)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    /(?:app|router)\.use\s*\(\s*['"`]([^'"`]+)['"`]/gi,
  ],
  nextjs: [
    /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/gi,
    /export\s+(?:const|let)\s+(GET|POST|PUT|PATCH|DELETE)\s*=/gi,
  ],
  fastify: [
    /fastify\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    /fastify\.route\s*\(\s*\{[^}]*method:\s*['"`]([^'"`]+)['"`][^}]*url:\s*['"`]([^'"`]+)['"`]/gi,
  ],
  react_router: [
    /<Route\s+[^>]*path\s*=\s*['"`]([^'"`]+)['"`]/gi,
    /path:\s*['"`]([^'"`]+)['"`]/gi,
  ],
};

// Auth middleware patterns
const AUTH_PATTERNS = [
  /auth(?:enticate|orize|Guard|Middleware|Check|Verify)/i,
  /requireAuth|isAuthenticated|ensureLoggedIn|protect/i,
  /jwt\.verify|verifyToken|checkToken|validateSession/i,
  /passport\.authenticate/i,
  /withAuth|useAuth|getServerSession/i,
  /middleware.*auth/i,
  /Bearer|Authorization/i,
];

// Validation middleware patterns  
const VALIDATION_PATTERNS = [
  /validate|validator|schema|zod|yup|joi|class-validator/i,
  /body\(\)|query\(\)|param\(\)/i,
  /ajv|superstruct/i,
];

// Rate limit patterns
const RATE_LIMIT_PATTERNS = [
  /rateLimit|rate[-_]limit|throttle|limiter/i,
  /express-rate-limit|bottleneck|p-queue/i,
];

/**
 * Extract routes from source files
 */
export function extractRoutes(
  files: Array<{ path: string; content: string }>,
  framework: string
): RouteMap {
  const routes: RouteInfo[] = [];
  const middlewareChains: MiddlewareChain[] = [];
  const seenMiddleware = new Map<string, MiddlewareChain>();

  for (const file of files) {
    // Detect framework-specific routes
    const patterns = ROUTE_PATTERNS[framework.toLowerCase()] || ROUTE_PATTERNS.express;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const method = (match[1] || 'GET').toUpperCase() as RouteInfo['method'];
        const path = match[2] || file.path;
        
        // Check for auth, validation, rate limiting in surrounding context
        const contextStart = Math.max(0, match.index - 500);
        const contextEnd = Math.min(file.content.length, match.index + 500);
        const context = file.content.slice(contextStart, contextEnd);
        
        const hasAuth = AUTH_PATTERNS.some(p => p.test(context));
        const hasValidation = VALIDATION_PATTERNS.some(p => p.test(context));
        const hasRateLimit = RATE_LIMIT_PATTERNS.some(p => p.test(context));

        // Extract middleware names
        const middlewareMatch = context.match(/(?:use|middleware)\s*\(\s*([a-zA-Z_]+)/g);
        const middleware = middlewareMatch?.map(m => m.replace(/(?:use|middleware)\s*\(\s*/, '')) || [];

        // Detect parameters
        const params: ParameterInfo[] = [];
        const pathParams = path.match(/:([a-zA-Z_]+)/g);
        if (pathParams) {
          for (const param of pathParams) {
            params.push({
              name: param.replace(':', ''),
              location: 'path',
              type: 'string',
              required: true,
              validated: hasValidation,
            });
          }
        }

        // Calculate risk level
        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        const riskLevel = calculateRouteRisk(hasAuth, hasValidation, hasRateLimit, isMutation, path);

        routes.push({
          path,
          method,
          handler: `${file.path}:${method}`,
          file: file.path,
          hasAuth,
          hasValidation,
          hasRateLimit,
          middleware,
          riskLevel,
          parameterTypes: params,
        });

        // Track middleware
        for (const mw of middleware) {
          if (!seenMiddleware.has(mw)) {
            const type = AUTH_PATTERNS.some(p => p.test(mw)) ? 'auth' :
                        VALIDATION_PATTERNS.some(p => p.test(mw)) ? 'validation' :
                        RATE_LIMIT_PATTERNS.some(p => p.test(mw)) ? 'rate_limit' :
                        /cors/i.test(mw) ? 'cors' :
                        /log/i.test(mw) ? 'logging' :
                        /error/i.test(mw) ? 'error_handling' : 'custom';
            seenMiddleware.set(mw, {
              name: mw,
              appliedTo: [path],
              type,
              order: seenMiddleware.size,
            });
          } else {
            seenMiddleware.get(mw)!.appliedTo.push(path);
          }
        }
      }
    }

    // Detect Next.js App Router routes from file structure
    if (framework.toLowerCase() === 'next.js' || framework.toLowerCase() === 'nextjs') {
      const appRouterMatch = file.path.match(/(?:app|pages)\/(.+?)\/(?:route|page)\.[jt]sx?$/);
      if (appRouterMatch) {
        const routePath = '/' + appRouterMatch[1].replace(/\[([^\]]+)\]/g, ':$1');
        const isApiRoute = file.path.includes('/api/') || file.path.includes('route.');
        
        const methods: Array<RouteInfo['method']> = isApiRoute
          ? (['GET', 'POST', 'PUT', 'DELETE'] as const).filter(m => 
              new RegExp(`export\\s+(?:async\\s+)?function\\s+${m}|export\\s+(?:const|let)\\s+${m}`).test(file.content)
            )
          : ['GET'];

        for (const method of methods) {
          const hasAuth = AUTH_PATTERNS.some(p => p.test(file.content));
          const hasValidation = VALIDATION_PATTERNS.some(p => p.test(file.content));
          
          routes.push({
            path: routePath,
            method,
            handler: file.path,
            file: file.path,
            hasAuth,
            hasValidation,
            hasRateLimit: RATE_LIMIT_PATTERNS.some(p => p.test(file.content)),
            middleware: [],
            riskLevel: calculateRouteRisk(hasAuth, hasValidation, false, method !== 'GET', routePath),
            parameterTypes: [],
          });
        }
      }
    }
  }

  const unprotectedRoutes = routes.filter(r => !r.hasAuth && r.riskLevel !== 'low');
  const publicEndpoints = routes.filter(r => !r.hasAuth);

  const attackSurfaceScore = calculateAttackSurface(routes);

  return {
    routes,
    middlewareChains: Array.from(seenMiddleware.values()),
    unprotectedRoutes,
    publicEndpoints,
    totalRoutes: routes.length,
    totalUnprotected: unprotectedRoutes.length,
    attackSurfaceScore,
    scanTimestamp: new Date().toISOString(),
  };
}

function calculateRouteRisk(
  hasAuth: boolean,
  hasValidation: boolean,
  hasRateLimit: boolean,
  isMutation: boolean,
  path: string
): RouteInfo['riskLevel'] {
  let risk = 0;
  
  if (!hasAuth) risk += 3;
  if (!hasValidation && isMutation) risk += 2;
  if (!hasRateLimit && (isMutation || /auth|login|signup|payment|checkout/i.test(path))) risk += 2;
  if (isMutation) risk += 1;
  if (/admin|internal|debug|graphql/i.test(path)) risk += 2;
  if (/\*|\.\./.test(path)) risk += 1;

  if (risk >= 6) return 'critical';
  if (risk >= 4) return 'high';
  if (risk >= 2) return 'medium';
  return 'low';
}

function calculateAttackSurface(routes: RouteInfo[]): number {
  if (routes.length === 0) return 0;
  
  const riskWeights = { low: 1, medium: 3, high: 7, critical: 10 };
  const totalRisk = routes.reduce((sum, r) => sum + riskWeights[r.riskLevel], 0);
  const maxPossibleRisk = routes.length * 10;
  
  return Math.round((totalRisk / maxPossibleRisk) * 100);
}
