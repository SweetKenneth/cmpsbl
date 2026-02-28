/**
 * #2 — Schema Introspection Probe
 * Query information_schema to build a complete data model map of unknown databases.
 */

export interface SchemaMap {
  tables: TableInfo[];
  relationships: RelationshipInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
  enums: EnumInfo[];
  functions: FunctionInfo[];
  triggers: TriggerInfo[];
  totalTables: number;
  totalColumns: number;
  totalRelationships: number;
  securityPosture: SecurityPosture;
  scanTimestamp: string;
}

export interface TableInfo {
  schema: string;
  name: string;
  columns: ColumnInfo[];
  rowEstimate: number | null;
  hasRLS: boolean;
  hasPrimaryKey: boolean;
  hasTimestamps: boolean;
  hasUserReference: boolean;
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  isNullable: boolean;
  hasDefault: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  sensitivityLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface RelationshipInfo {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  constraintName: string;
  onDelete: string;
  onUpdate: string;
}

export interface IndexInfo {
  tableName: string;
  indexName: string;
  columns: string[];
  isUnique: boolean;
  indexType: string;
}

export interface ConstraintInfo {
  tableName: string;
  constraintName: string;
  constraintType: string;
  definition: string;
}

export interface EnumInfo {
  name: string;
  values: string[];
  schema: string;
}

export interface FunctionInfo {
  name: string;
  schema: string;
  returnType: string;
  language: string;
  security: 'invoker' | 'definer';
}

export interface TriggerInfo {
  name: string;
  tableName: string;
  event: string;
  timing: string;
  functionName: string;
}

export interface SecurityPosture {
  tablesWithRLS: number;
  tablesWithoutRLS: number;
  tablesWithUserScoping: number;
  sensitiveColumnsExposed: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Sensitive column name patterns
const SENSITIVITY_PATTERNS: Array<{ pattern: RegExp; level: 'low' | 'medium' | 'high' | 'critical' }> = [
  { pattern: /^(password|passwd|pass_hash|password_hash|pwd)$/i, level: 'critical' },
  { pattern: /^(secret|api_key|api_secret|private_key|access_token|refresh_token)$/i, level: 'critical' },
  { pattern: /^(ssn|social_security|tax_id|national_id)$/i, level: 'critical' },
  { pattern: /^(credit_card|card_number|cvv|expiry)$/i, level: 'critical' },
  { pattern: /^(email|phone|mobile|address|zip|postal)$/i, level: 'high' },
  { pattern: /(token|key|secret|credential)/i, level: 'high' },
  { pattern: /^(name|first_name|last_name|full_name|display_name)$/i, level: 'medium' },
  { pattern: /^(dob|date_of_birth|birthday|birth_date)$/i, level: 'medium' },
  { pattern: /^(ip_address|user_agent|device_id|fingerprint)$/i, level: 'medium' },
  { pattern: /^(salary|income|balance|amount)$/i, level: 'medium' },
  { pattern: /^(avatar|profile_url|bio|description)$/i, level: 'low' },
];

function classifyColumnSensitivity(columnName: string): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  for (const { pattern, level } of SENSITIVITY_PATTERNS) {
    if (pattern.test(columnName)) return level;
  }
  return 'none';
}

function calculateSecurityGrade(posture: Omit<SecurityPosture, 'grade'>): SecurityPosture['grade'] {
  const totalTables = posture.tablesWithRLS + posture.tablesWithoutRLS;
  if (totalTables === 0) return 'A';
  
  const rlsCoverage = posture.tablesWithRLS / totalTables;
  const sensitiveExposure = posture.sensitiveColumnsExposed;
  
  if (rlsCoverage >= 0.95 && sensitiveExposure === 0) return 'A';
  if (rlsCoverage >= 0.8 && sensitiveExposure <= 2) return 'B';
  if (rlsCoverage >= 0.6 && sensitiveExposure <= 5) return 'C';
  if (rlsCoverage >= 0.4) return 'D';
  return 'F';
}

/**
 * Build a complete schema map from database query results
 */
export function buildSchemaMap(
  rawTables: Array<{ table_schema: string; table_name: string }>,
  rawColumns: Array<{ table_name: string; column_name: string; data_type: string; is_nullable: string; column_default: string | null }>,
  rawConstraints: Array<{ table_name: string; constraint_name: string; constraint_type: string }>,
  rawForeignKeys: Array<{ source_table: string; source_column: string; target_table: string; target_column: string; constraint_name: string; delete_rule: string; update_rule: string }>,
  rawIndexes: Array<{ tablename: string; indexname: string; indexdef: string }>,
  rawRLSStatus: Array<{ tablename: string; rowsecurity: boolean }>,
  rawFunctions: Array<{ routine_name: string; routine_schema: string; data_type: string; external_language: string; security_type: string }>,
  rawTriggers: Array<{ trigger_name: string; event_object_table: string; event_manipulation: string; action_timing: string; action_statement: string }>,
): SchemaMap {
  const primaryKeys = new Set(
    rawConstraints
      .filter(c => c.constraint_type === 'PRIMARY KEY')
      .map(c => `${c.table_name}.${c.constraint_name}`)
  );

  const uniqueConstraints = new Set(
    rawConstraints
      .filter(c => c.constraint_type === 'UNIQUE')
      .map(c => `${c.table_name}.${c.constraint_name}`)
  );

  const fkColumns = new Set(rawForeignKeys.map(fk => `${fk.source_table}.${fk.source_column}`));

  const rlsMap = new Map(rawRLSStatus.map(r => [r.tablename, r.rowsecurity]));

  // Build tables
  const tables: TableInfo[] = rawTables.map(t => {
    const columns: ColumnInfo[] = rawColumns
      .filter(c => c.table_name === t.table_name)
      .map(c => ({
        name: c.column_name,
        dataType: c.data_type,
        isNullable: c.is_nullable === 'YES',
        hasDefault: c.column_default !== null,
        defaultValue: c.column_default,
        isPrimaryKey: false, // simplified — would need join with key_column_usage
        isForeignKey: fkColumns.has(`${t.table_name}.${c.column_name}`),
        isUnique: false,
        sensitivityLevel: classifyColumnSensitivity(c.column_name),
      }));

    const hasTimestamps = columns.some(c => c.name === 'created_at') && columns.some(c => c.name === 'updated_at');
    const hasUserReference = columns.some(c => c.name === 'user_id' || c.name === 'owner_id' || c.name === 'created_by');

    return {
      schema: t.table_schema,
      name: t.table_name,
      columns,
      rowEstimate: null,
      hasRLS: rlsMap.get(t.table_name) ?? false,
      hasPrimaryKey: columns.some(c => c.isPrimaryKey) || rawConstraints.some(c => c.table_name === t.table_name && c.constraint_type === 'PRIMARY KEY'),
      hasTimestamps,
      hasUserReference,
    };
  });

  // Build relationships
  const relationships: RelationshipInfo[] = rawForeignKeys.map(fk => ({
    sourceTable: fk.source_table,
    sourceColumn: fk.source_column,
    targetTable: fk.target_table,
    targetColumn: fk.target_column,
    constraintName: fk.constraint_name,
    onDelete: fk.delete_rule,
    onUpdate: fk.update_rule,
  }));

  // Build indexes
  const indexes: IndexInfo[] = rawIndexes.map(idx => ({
    tableName: idx.tablename,
    indexName: idx.indexname,
    columns: [], // would parse from indexdef
    isUnique: idx.indexdef?.includes('UNIQUE') ?? false,
    indexType: idx.indexdef?.includes('btree') ? 'btree' : idx.indexdef?.includes('gin') ? 'gin' : 'unknown',
  }));

  // Security posture
  const tablesWithRLS = tables.filter(t => t.hasRLS).length;
  const tablesWithoutRLS = tables.filter(t => !t.hasRLS).length;
  const tablesWithUserScoping = tables.filter(t => t.hasUserReference).length;
  const sensitiveColumnsExposed = tables
    .filter(t => !t.hasRLS)
    .flatMap(t => t.columns)
    .filter(c => c.sensitivityLevel === 'high' || c.sensitivityLevel === 'critical')
    .length;

  const postureBase = { tablesWithRLS, tablesWithoutRLS, tablesWithUserScoping, sensitiveColumnsExposed };
  const securityPosture: SecurityPosture = {
    ...postureBase,
    grade: calculateSecurityGrade(postureBase),
  };

  // Build functions
  const functions: FunctionInfo[] = rawFunctions.map(f => ({
    name: f.routine_name,
    schema: f.routine_schema,
    returnType: f.data_type,
    language: f.external_language || 'sql',
    security: (f.security_type === 'DEFINER' ? 'definer' : 'invoker') as 'invoker' | 'definer',
  }));

  // Build triggers
  const triggers: TriggerInfo[] = rawTriggers.map(t => ({
    name: t.trigger_name,
    tableName: t.event_object_table,
    event: t.event_manipulation,
    timing: t.action_timing,
    functionName: t.action_statement,
  }));

  return {
    tables,
    relationships,
    indexes,
    constraints: rawConstraints.map(c => ({
      tableName: c.table_name,
      constraintName: c.constraint_name,
      constraintType: c.constraint_type,
      definition: '',
    })),
    enums: [],
    functions,
    triggers,
    totalTables: tables.length,
    totalColumns: tables.reduce((sum, t) => sum + t.columns.length, 0),
    totalRelationships: relationships.length,
    securityPosture,
    scanTimestamp: new Date().toISOString(),
  };
}
