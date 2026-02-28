/**
 * #17 — Migration Health Auditor
 * Analyze migration history for reversibility, destructive operations,
 * and schema drift.
 */

export interface MigrationHealthReport {
  migrations: MigrationInfo[];
  destructiveOperations: DestructiveOp[];
  reversibilityScore: number;
  schemaDriftIssues: SchemaDrift[];
  totalMigrations: number;
  irreversibleCount: number;
  destructiveCount: number;
  recommendations: string[];
  scanTimestamp: string;
}

export interface MigrationInfo {
  file: string;
  name: string;
  hasUp: boolean;
  hasDown: boolean;
  isReversible: boolean;
  isDestructive: boolean;
  operations: string[];
  risk: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string | null;
}

export interface DestructiveOp {
  file: string;
  operation: string;
  line: number;
  severity: 'high' | 'critical';
  hasBackup: boolean;
  description: string;
}

export interface SchemaDrift {
  type: 'missing_migration' | 'orphaned_migration' | 'order_conflict' | 'duplicate';
  description: string;
  files: string[];
  severity: 'medium' | 'high';
}

const DESTRUCTIVE_PATTERNS: Array<{ pattern: RegExp; operation: string; severity: 'high' | 'critical' }> = [
  { pattern: /DROP\s+TABLE/i, operation: 'DROP TABLE', severity: 'critical' },
  { pattern: /DROP\s+COLUMN/i, operation: 'DROP COLUMN', severity: 'critical' },
  { pattern: /DROP\s+INDEX/i, operation: 'DROP INDEX', severity: 'high' },
  { pattern: /DROP\s+SCHEMA/i, operation: 'DROP SCHEMA', severity: 'critical' },
  { pattern: /DROP\s+DATABASE/i, operation: 'DROP DATABASE', severity: 'critical' },
  { pattern: /TRUNCATE/i, operation: 'TRUNCATE', severity: 'critical' },
  { pattern: /DELETE\s+FROM\s+\w+\s*;/i, operation: 'DELETE ALL', severity: 'critical' },
  { pattern: /ALTER\s+TABLE.*DROP/i, operation: 'ALTER DROP', severity: 'high' },
  { pattern: /ALTER\s+TABLE.*ALTER\s+COLUMN.*TYPE/i, operation: 'ALTER TYPE', severity: 'high' },
  { pattern: /ALTER\s+TABLE.*RENAME/i, operation: 'RENAME', severity: 'high' },
];

const BACKUP_PATTERNS = [
  /CREATE\s+TABLE.*_backup/i,
  /INTO\s+.*_backup/i,
  /pg_dump|mysqldump|mongodump/i,
  /BACKUP/i,
  /-- backup|-- snapshot/i,
];

/**
 * Analyze migration files for health and risk
 */
export function analyzeMigrationHealth(
  migrationFiles: Array<{ path: string; content: string }>
): MigrationHealthReport {
  const migrations: MigrationInfo[] = [];
  const destructiveOperations: DestructiveOp[] = [];
  const schemaDriftIssues: SchemaDrift[] = [];
  const recommendations: string[] = [];

  for (const file of migrationFiles) {
    const content = file.content;
    const lines = content.split('\n');
    const fileName = file.path.split('/').pop() || file.path;

    // Detect up/down sections
    const hasUp = /-- migrate:up|exports\.up|up\s*\(/i.test(content) || !(/-- migrate:down|exports\.down|down\s*\(/i.test(content));
    const hasDown = /-- migrate:down|exports\.down|down\s*\(|ROLLBACK/i.test(content);

    // Detect destructive operations
    const fileDestructive: DestructiveOp[] = [];
    for (let i = 0; i < lines.length; i++) {
      for (const { pattern, operation, severity } of DESTRUCTIVE_PATTERNS) {
        if (pattern.test(lines[i])) {
          const hasBackup = BACKUP_PATTERNS.some(bp => bp.test(content));
          fileDestructive.push({
            file: file.path,
            operation,
            line: i + 1,
            severity,
            hasBackup,
            description: lines[i].trim().slice(0, 100),
          });
        }
      }
    }

    destructiveOperations.push(...fileDestructive);

    // Extract operations
    const operations: string[] = [];
    if (/CREATE\s+TABLE/i.test(content)) operations.push('CREATE TABLE');
    if (/ALTER\s+TABLE/i.test(content)) operations.push('ALTER TABLE');
    if (/CREATE\s+INDEX/i.test(content)) operations.push('CREATE INDEX');
    if (/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION/i.test(content)) operations.push('CREATE FUNCTION');
    if (/CREATE\s+TRIGGER/i.test(content)) operations.push('CREATE TRIGGER');
    if (/CREATE\s+POLICY/i.test(content)) operations.push('CREATE POLICY');
    if (/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(content)) operations.push('ENABLE RLS');
    if (/INSERT\s+INTO/i.test(content)) operations.push('INSERT DATA');
    if (/UPDATE\s/i.test(content)) operations.push('UPDATE DATA');

    // Extract timestamp from filename
    const timestampMatch = fileName.match(/^(\d{14}|\d{8}|\d{4}[-_]\d{2}[-_]\d{2})/);
    
    // Risk assessment
    const isDestructive = fileDestructive.length > 0;
    const isReversible = hasDown || !isDestructive;
    let risk: MigrationInfo['risk'] = 'low';
    if (isDestructive && !hasDown) risk = 'critical';
    else if (isDestructive) risk = 'high';
    else if (!hasDown) risk = 'medium';

    migrations.push({
      file: file.path,
      name: fileName,
      hasUp,
      hasDown,
      isReversible,
      isDestructive,
      operations,
      risk,
      timestamp: timestampMatch?.[1] || null,
    });
  }

  // Check for schema drift issues
  const timestamps = migrations.map(m => m.timestamp).filter(Boolean) as string[];
  const sortedTimestamps = [...timestamps].sort();
  if (JSON.stringify(timestamps) !== JSON.stringify(sortedTimestamps)) {
    schemaDriftIssues.push({
      type: 'order_conflict',
      description: 'Migration files are not in chronological order',
      files: migrations.map(m => m.file),
      severity: 'medium',
    });
  }

  // Check for duplicates
  const nameCount = new Map<string, string[]>();
  for (const m of migrations) {
    const baseName = m.name.replace(/^\d+[-_]/, '');
    const files = nameCount.get(baseName) || [];
    files.push(m.file);
    nameCount.set(baseName, files);
  }
  for (const [name, files] of nameCount.entries()) {
    if (files.length > 1) {
      schemaDriftIssues.push({
        type: 'duplicate',
        description: `Duplicate migration name: ${name}`,
        files,
        severity: 'high',
      });
    }
  }

  // Recommendations
  const irreversibleCount = migrations.filter(m => !m.isReversible).length;
  const destructiveCount = destructiveOperations.length;

  if (irreversibleCount > 0) {
    recommendations.push(`${irreversibleCount} migration(s) lack down/rollback logic — add reversibility`);
  }
  if (destructiveCount > 0) {
    recommendations.push(`${destructiveCount} destructive operation(s) detected — ensure backups exist before running`);
    const unbackedDestructive = destructiveOperations.filter(d => !d.hasBackup);
    if (unbackedDestructive.length > 0) {
      recommendations.push(`${unbackedDestructive.length} destructive operation(s) have no backup strategy`);
    }
  }

  const reversibilityScore = migrations.length > 0
    ? Math.round((migrations.filter(m => m.isReversible).length / migrations.length) * 100)
    : 100;

  return {
    migrations,
    destructiveOperations,
    reversibilityScore,
    schemaDriftIssues,
    totalMigrations: migrations.length,
    irreversibleCount,
    destructiveCount,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}
