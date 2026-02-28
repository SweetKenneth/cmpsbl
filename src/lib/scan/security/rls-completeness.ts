/**
 * #11 — RLS Policy Completeness Checker
 * For every table, verify SELECT/INSERT/UPDATE/DELETE each have explicit policies.
 */

export interface RLSCompletenessReport {
  tables: TableRLSStatus[];
  totalTables: number;
  fullyProtected: number;
  partiallyProtected: number;
  unprotected: number;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  criticalGaps: RLSGap[];
  recommendations: string[];
  scanTimestamp: string;
}

export interface TableRLSStatus {
  schema: string;
  table: string;
  rlsEnabled: boolean;
  policies: PolicyInfo[];
  coverage: OperationCoverage;
  hasUserScoping: boolean;
  sensitiveColumns: string[];
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  gaps: string[];
}

export interface PolicyInfo {
  name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  roles: string[];
  usingExpression: string | null;
  checkExpression: string | null;
  isPermissive: boolean;
  isOverlyBroad: boolean;
}

export interface OperationCoverage {
  select: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
  allCovered: boolean;
  missingOperations: string[];
}

export interface RLSGap {
  table: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  fix: string;
}

// Patterns that indicate overly permissive policies
const OVERLY_BROAD_PATTERNS = [
  /^\s*true\s*$/i,
  /^\s*1\s*=\s*1\s*$/,
  /^\s*'1'\s*=\s*'1'\s*$/,
];

// Sensitive table name patterns that MUST have RLS
const SENSITIVE_TABLE_PATTERNS = [
  /user|account|profile|member/i,
  /payment|billing|invoice|subscription|order/i,
  /credential|secret|token|key|password|auth/i,
  /message|chat|conversation|notification/i,
  /document|file|upload|attachment/i,
  /medical|health|diagnosis/i,
  /financial|transaction|balance/i,
];

/**
 * Analyze RLS completeness across all tables
 */
export function analyzeRLSCompleteness(
  tables: Array<{
    schema: string;
    name: string;
    rlsEnabled: boolean;
    columns: Array<{ name: string; dataType: string }>;
  }>,
  policies: Array<{
    tableName: string;
    policyName: string;
    command: string;
    roles: string[];
    usingExpression: string | null;
    checkExpression: string | null;
    permissive: boolean;
  }>
): RLSCompletenessReport {
  const tableStatuses: TableRLSStatus[] = [];
  const criticalGaps: RLSGap[] = [];
  const recommendations: string[] = [];

  for (const table of tables) {
    const tablePolicies = policies.filter(p => p.tableName === table.name);
    
    const policyInfos: PolicyInfo[] = tablePolicies.map(p => ({
      name: p.policyName,
      operation: normalizeOperation(p.command),
      roles: p.roles,
      usingExpression: p.usingExpression,
      checkExpression: p.checkExpression,
      isPermissive: p.permissive,
      isOverlyBroad: isOverlyBroad(p.usingExpression) || isOverlyBroad(p.checkExpression),
    }));

    // Check operation coverage
    const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] as const;
    const hasAll = policyInfos.some(p => p.operation === 'ALL');
    
    const coverage: OperationCoverage = {
      select: hasAll || policyInfos.some(p => p.operation === 'SELECT'),
      insert: hasAll || policyInfos.some(p => p.operation === 'INSERT'),
      update: hasAll || policyInfos.some(p => p.operation === 'UPDATE'),
      delete: hasAll || policyInfos.some(p => p.operation === 'DELETE'),
      allCovered: false,
      missingOperations: [],
    };

    coverage.missingOperations = operations.filter(op => !coverage[op.toLowerCase() as keyof typeof coverage]);
    coverage.allCovered = coverage.missingOperations.length === 0;

    // Check for user scoping
    const hasUserScoping = policyInfos.some(p => 
      /auth\.uid\(\)|current_user|session_user|user_id/i.test(
        (p.usingExpression || '') + (p.checkExpression || '')
      )
    );

    // Detect sensitive columns
    const sensitiveColumns = table.columns
      .filter(c => /password|secret|token|ssn|credit|email|phone|address/i.test(c.name))
      .map(c => c.name);

    // Calculate risk
    const isSensitiveTable = SENSITIVE_TABLE_PATTERNS.some(p => p.test(table.name));
    const hasOverlyBroadPolicies = policyInfos.some(p => p.isOverlyBroad);
    
    const gaps: string[] = [];
    let riskLevel: TableRLSStatus['riskLevel'] = 'safe';

    if (!table.rlsEnabled) {
      riskLevel = isSensitiveTable ? 'critical' : 'high';
      gaps.push('RLS not enabled');
      
      criticalGaps.push({
        table: table.name,
        severity: isSensitiveTable ? 'critical' : 'high',
        title: `RLS disabled on ${isSensitiveTable ? 'sensitive ' : ''}table "${table.name}"`,
        description: `Table "${table.name}" has no Row-Level Security. Any authenticated user can read/write all rows.`,
        fix: `ALTER TABLE ${table.schema}.${table.name} ENABLE ROW LEVEL SECURITY;\n-- Then create appropriate policies for each operation`,
      });
    } else if (!coverage.allCovered) {
      riskLevel = isSensitiveTable ? 'high' : 'medium';
      gaps.push(`Missing policies for: ${coverage.missingOperations.join(', ')}`);
      
      for (const op of coverage.missingOperations) {
        criticalGaps.push({
          table: table.name,
          severity: isSensitiveTable ? 'high' : 'medium',
          title: `Missing ${op} policy on "${table.name}"`,
          description: `Table "${table.name}" has RLS enabled but no ${op} policy. This operation may be implicitly denied or use a fallback.`,
          fix: `CREATE POLICY "${table.name}_${op.toLowerCase()}_policy" ON ${table.schema}.${table.name} FOR ${op} USING (auth.uid() = user_id);`,
        });
      }
    } else if (hasOverlyBroadPolicies) {
      riskLevel = 'medium';
      gaps.push('Has overly permissive policies (e.g., USING (true))');
    } else if (!hasUserScoping && isSensitiveTable) {
      riskLevel = 'low';
      gaps.push('No user-scoped policies on sensitive table');
    }

    tableStatuses.push({
      schema: table.schema,
      table: table.name,
      rlsEnabled: table.rlsEnabled,
      policies: policyInfos,
      coverage,
      hasUserScoping,
      sensitiveColumns,
      riskLevel,
      gaps,
    });
  }

  // Calculate stats
  const fullyProtected = tableStatuses.filter(t => t.rlsEnabled && t.coverage.allCovered && t.riskLevel === 'safe').length;
  const partiallyProtected = tableStatuses.filter(t => t.rlsEnabled && !t.coverage.allCovered).length;
  const unprotected = tableStatuses.filter(t => !t.rlsEnabled).length;

  // Grade
  const protectionRatio = fullyProtected / Math.max(tables.length, 1);
  const overallGrade: RLSCompletenessReport['overallGrade'] = 
    protectionRatio >= 0.95 && criticalGaps.filter(g => g.severity === 'critical').length === 0 ? 'A' :
    protectionRatio >= 0.8 ? 'B' :
    protectionRatio >= 0.6 ? 'C' :
    protectionRatio >= 0.4 ? 'D' : 'F';

  // Recommendations
  if (unprotected > 0) {
    recommendations.push(`Enable RLS on ${unprotected} unprotected table(s) immediately`);
  }
  if (partiallyProtected > 0) {
    recommendations.push(`Add missing operation policies to ${partiallyProtected} partially-protected table(s)`);
  }
  const broadPolicies = tableStatuses.filter(t => t.policies.some(p => p.isOverlyBroad));
  if (broadPolicies.length > 0) {
    recommendations.push(`Replace overly permissive policies on ${broadPolicies.length} table(s) with user-scoped conditions`);
  }

  return {
    tables: tableStatuses,
    totalTables: tables.length,
    fullyProtected,
    partiallyProtected,
    unprotected,
    overallGrade,
    criticalGaps,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}

function normalizeOperation(command: string): PolicyInfo['operation'] {
  const upper = command.toUpperCase().trim();
  if (upper === 'ALL') return 'ALL';
  if (upper === 'SELECT') return 'SELECT';
  if (upper === 'INSERT') return 'INSERT';
  if (upper === 'UPDATE') return 'UPDATE';
  if (upper === 'DELETE') return 'DELETE';
  return 'ALL';
}

function isOverlyBroad(expression: string | null): boolean {
  if (!expression) return false;
  return OVERLY_BROAD_PATTERNS.some(p => p.test(expression));
}
