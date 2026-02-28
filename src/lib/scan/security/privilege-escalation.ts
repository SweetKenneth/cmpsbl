/**
 * #12 — Privilege Escalation Prober
 * Test if anonymous users can access authenticated endpoints,
 * if regular users can access admin routes, and if API keys grant broader access than intended.
 */

export interface PrivilegeEscalationReport {
  probes: EscalationProbe[];
  criticalFindings: EscalationFinding[];
  adminRoutes: AdminRouteInfo[];
  roleHierarchy: RoleHierarchyInfo;
  totalProbes: number;
  failedProbes: number;
  riskScore: number;
  scanTimestamp: string;
}

export interface EscalationProbe {
  id: string;
  type: 'anon_to_auth' | 'user_to_admin' | 'cross_tenant' | 'api_key_scope' | 'role_bypass';
  target: string;
  method: string;
  expectedResult: 'deny' | 'allow';
  actualResult: 'deny' | 'allow' | 'error' | 'untested';
  passed: boolean;
  evidence: string;
}

export interface EscalationFinding {
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  affectedRoutes: string[];
  remediation: string;
  cweId: string;
}

export interface AdminRouteInfo {
  path: string;
  file: string;
  hasRoleCheck: boolean;
  requiredRole: string | null;
  protectionMethod: string | null;
}

export interface RoleHierarchyInfo {
  roles: string[];
  hasHierarchy: boolean;
  adminRoles: string[];
  defaultRole: string | null;
  issues: string[];
}

// Patterns indicating admin/privileged routes
const ADMIN_ROUTE_PATTERNS = [
  /\/admin/i,
  /\/dashboard(?!\/user)/i,
  /\/manage/i,
  /\/internal/i,
  /\/api\/v\d+\/admin/i,
  /\/settings\/system/i,
  /\/users\/manage/i,
  /\/config(?:uration)?/i,
  /\/debug/i,
  /\/metrics/i,
  /\/health(?:check)?/i,
];

// Patterns indicating role checks in code
const ROLE_CHECK_PATTERNS = [
  /(?:role|permission)\s*===?\s*['"`](admin|superadmin|owner|moderator)['"`]/i,
  /isAdmin|isSuperAdmin|isOwner|hasPermission|checkRole|requireRole/i,
  /user\.role|req\.user\.role|session\.user\.role/i,
  /authorize\s*\(\s*['"`](admin|superadmin)/i,
  /guard.*admin|admin.*guard/i,
  /\.can\s*\(|\.cannot\s*\(|ability\./i, // CASL patterns
];

// Patterns indicating auth middleware
const AUTH_MIDDLEWARE_PATTERNS = [
  /requireAuth|isAuthenticated|ensureAuth|authGuard/i,
  /passport\.authenticate|jwt\.verify|verifyToken/i,
  /middleware.*auth|auth.*middleware/i,
  /withAuth|useAuth|getServerSession|getSession/i,
];

/**
 * Analyze privilege escalation risks in the codebase
 */
export function analyzePrivilegeEscalation(
  files: Array<{ path: string; content: string }>,
  routes: Array<{ path: string; method: string; file: string; hasAuth: boolean }>
): PrivilegeEscalationReport {
  const probes: EscalationProbe[] = [];
  const criticalFindings: EscalationFinding[] = [];
  const adminRoutes: AdminRouteInfo[] = [];

  // 1. Identify admin routes and check their protection
  for (const file of files) {
    for (const pattern of ADMIN_ROUTE_PATTERNS) {
      if (pattern.test(file.path) || pattern.test(file.content)) {
        const hasRoleCheck = ROLE_CHECK_PATTERNS.some(p => p.test(file.content));
        const hasAuthMiddleware = AUTH_MIDDLEWARE_PATTERNS.some(p => p.test(file.content));
        
        const roleMatch = file.content.match(/(?:role|permission)\s*===?\s*['"`](\w+)['"`]/i);
        
        adminRoutes.push({
          path: file.path,
          file: file.path,
          hasRoleCheck,
          requiredRole: roleMatch?.[1] || null,
          protectionMethod: hasAuthMiddleware ? 'middleware' : hasRoleCheck ? 'inline' : null,
        });

        // Probe: Unprotected admin route
        if (!hasRoleCheck && !hasAuthMiddleware) {
          probes.push({
            id: `probe-admin-unprotected-${adminRoutes.length}`,
            type: 'user_to_admin',
            target: file.path,
            method: 'GET',
            expectedResult: 'deny',
            actualResult: 'untested',
            passed: false,
            evidence: 'Admin route detected without role check or auth middleware',
          });

          criticalFindings.push({
            severity: 'critical',
            title: `Unprotected admin route: ${file.path}`,
            description: 'Admin/privileged route accessible without authentication or role verification.',
            affectedRoutes: [file.path],
            remediation: 'Add authentication middleware and role-based access control to this route.',
            cweId: 'CWE-862',
          });
        }

        // Probe: Admin route with auth but no role check
        if (hasAuthMiddleware && !hasRoleCheck) {
          probes.push({
            id: `probe-admin-no-role-${adminRoutes.length}`,
            type: 'user_to_admin',
            target: file.path,
            method: 'GET',
            expectedResult: 'deny',
            actualResult: 'untested',
            passed: false,
            evidence: 'Admin route has auth but no role verification — any authenticated user may access it',
          });

          criticalFindings.push({
            severity: 'high',
            title: `Admin route without role check: ${file.path}`,
            description: 'Route requires authentication but does not verify the user has admin privileges.',
            affectedRoutes: [file.path],
            remediation: 'Add role-based check: verify user has admin/appropriate role before allowing access.',
            cweId: 'CWE-285',
          });
        }
      }
    }
  }

  // 2. Check for anonymous access to authenticated endpoints
  for (const route of routes) {
    if (!route.hasAuth) {
      const isSensitive = /user|account|payment|order|admin|settings|profile/i.test(route.path);
      const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(route.method);
      
      if (isSensitive || isMutation) {
        probes.push({
          id: `probe-anon-${probes.length}`,
          type: 'anon_to_auth',
          target: route.path,
          method: route.method,
          expectedResult: 'deny',
          actualResult: 'untested',
          passed: false,
          evidence: `${isMutation ? 'Mutation' : 'Sensitive'} endpoint without authentication`,
        });

        if (isMutation) {
          criticalFindings.push({
            severity: 'high',
            title: `Unauthenticated mutation: ${route.method} ${route.path}`,
            description: 'Data modification endpoint is accessible without authentication.',
            affectedRoutes: [route.path],
            remediation: 'Add authentication middleware to prevent anonymous mutations.',
            cweId: 'CWE-306',
          });
        }
      }
    }
  }

  // 3. Check for IDOR (Insecure Direct Object Reference) patterns
  for (const file of files) {
    const idorPatterns = [
      /params\.(id|userId|orderId|documentId)/i,
      /req\.query\.(id|userId)/i,
      /\/:id\b/,
    ];
    
    const hasIdParam = idorPatterns.some(p => p.test(file.content));
    const hasOwnershipCheck = /auth\.uid\(\)|user\.id.*===|owner_id|created_by|belongs_to/i.test(file.content);
    
    if (hasIdParam && !hasOwnershipCheck) {
      probes.push({
        id: `probe-idor-${probes.length}`,
        type: 'cross_tenant',
        target: file.path,
        method: 'GET',
        expectedResult: 'deny',
        actualResult: 'untested',
        passed: false,
        evidence: 'Resource accessed by ID without ownership verification',
      });

      criticalFindings.push({
        severity: 'high',
        title: `Potential IDOR in ${file.path}`,
        description: 'Resource is accessed by ID parameter without verifying the requesting user owns it.',
        affectedRoutes: [file.path],
        remediation: 'Add ownership check: verify the resource belongs to the authenticated user before serving it.',
        cweId: 'CWE-639',
      });
    }
  }

  // 4. Analyze role hierarchy
  const allContent = files.map(f => f.content).join('\n');
  const roleMatches = allContent.match(/(?:role|permission)\s*(?:===?|!==?|includes|has)\s*['"`](\w+)['"`]/gi);
  const detectedRoles = [...new Set(roleMatches?.map(m => {
    const match = m.match(/['"`](\w+)['"`]/);
    return match?.[1];
  }).filter(Boolean) || [])];

  const adminRoles = detectedRoles.filter(r => /admin|super|owner|root/i.test(r!));
  const roleIssues: string[] = [];
  
  if (detectedRoles.length > 0 && adminRoles.length === 0) {
    roleIssues.push('Roles detected but no admin/elevated role found — privilege model may be flat');
  }
  
  if (detectedRoles.length === 0) {
    roleIssues.push('No role-based access control detected');
  }

  const roleHierarchy: RoleHierarchyInfo = {
    roles: detectedRoles as string[],
    hasHierarchy: detectedRoles.length > 1,
    adminRoles: adminRoles as string[],
    defaultRole: detectedRoles.find(r => /user|member|basic/i.test(r!)) || null,
    issues: roleIssues,
  };

  // Risk score
  const failedProbes = probes.filter(p => !p.passed).length;
  const criticalCount = criticalFindings.filter(f => f.severity === 'critical').length;
  const highCount = criticalFindings.filter(f => f.severity === 'high').length;
  const riskScore = Math.min(100, criticalCount * 30 + highCount * 15 + failedProbes * 5);

  return {
    probes,
    criticalFindings,
    adminRoutes,
    roleHierarchy,
    totalProbes: probes.length,
    failedProbes,
    riskScore,
    scanTimestamp: new Date().toISOString(),
  };
}
