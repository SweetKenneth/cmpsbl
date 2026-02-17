/**
 * INCLUSIVE Module — Compliance Automation
 * v10.5.4 ARCHITECT — WCAG monitoring, automated remediation, and compliance reporting
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export interface ComplianceRule {
  id: string;
  wcag_criterion: string;
  level: 'A' | 'AA' | 'AAA';
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  title: string;
  description: string;
  automated_check: boolean;
  fix_template?: FixTemplate;
}

export interface FixTemplate {
  type: 'attribute' | 'element' | 'style' | 'structure';
  pattern: string;
  replacement: string;
  validation: string;
}

export interface ComplianceViolation {
  id: string;
  rule_id: string;
  element_selector: string;
  element_html: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  message: string;
  help_url?: string;
  auto_fixable: boolean;
  fixed: boolean;
  fixed_at?: string;
  page_url: string;
  detected_at: string;
}

export interface ComplianceReport {
  id: string;
  generated_at: string;
  target_level: 'A' | 'AA' | 'AAA';
  pages_scanned: number;
  total_violations: number;
  violations_by_level: Record<string, number>;
  violations_by_category: Record<string, number>;
  violations_by_impact: Record<string, number>;
  auto_fixed: number;
  compliance_score: number;
  details: ViolationSummary[];
}

export interface ViolationSummary {
  rule_id: string;
  wcag_criterion: string;
  count: number;
  pages_affected: string[];
  auto_fixable: boolean;
}

export interface RemediationTask {
  id: string;
  violation_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  assigned_to?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimated_effort_minutes: number;
  actual_effort_minutes?: number;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

// ============ State ============

const complianceRules: Map<string, ComplianceRule> = new Map();
const violations: Map<string, ComplianceViolation> = new Map();
const remediationTasks: Map<string, RemediationTask> = new Map();
const reports: Map<string, ComplianceReport> = new Map();

// Initialize WCAG rules
const WCAG_RULES: ComplianceRule[] = [
  { id: 'wcag-1.1.1', wcag_criterion: '1.1.1', level: 'A', category: 'perceivable', title: 'Non-text Content', description: 'All images have alt text', automated_check: true, fix_template: { type: 'attribute', pattern: '<img(?![^>]*alt=)', replacement: '<img alt=""', validation: 'alt attribute exists' } },
  { id: 'wcag-1.4.3', wcag_criterion: '1.4.3', level: 'AA', category: 'perceivable', title: 'Contrast Minimum', description: 'Text has sufficient contrast ratio', automated_check: true },
  { id: 'wcag-2.1.1', wcag_criterion: '2.1.1', level: 'A', category: 'operable', title: 'Keyboard', description: 'All functionality is keyboard accessible', automated_check: true },
  { id: 'wcag-2.4.1', wcag_criterion: '2.4.1', level: 'A', category: 'operable', title: 'Bypass Blocks', description: 'Skip navigation links are available', automated_check: true },
  { id: 'wcag-2.4.4', wcag_criterion: '2.4.4', level: 'A', category: 'operable', title: 'Link Purpose', description: 'Link text describes its purpose', automated_check: true },
  { id: 'wcag-3.1.1', wcag_criterion: '3.1.1', level: 'A', category: 'understandable', title: 'Language of Page', description: 'Page has lang attribute', automated_check: true, fix_template: { type: 'attribute', pattern: '<html(?![^>]*lang=)', replacement: '<html lang="en"', validation: 'lang attribute exists' } },
  { id: 'wcag-4.1.1', wcag_criterion: '4.1.1', level: 'A', category: 'robust', title: 'Parsing', description: 'HTML is well-formed', automated_check: true },
  { id: 'wcag-4.1.2', wcag_criterion: '4.1.2', level: 'A', category: 'robust', title: 'Name, Role, Value', description: 'UI components have accessible names', automated_check: true },
];

WCAG_RULES.forEach(rule => complianceRules.set(rule.id, rule));

// ============ Rule Management ============

/**
 * Get compliance rule by ID
 */
export function getComplianceRule(id: string): ComplianceRule | null {
  return complianceRules.get(id) || null;
}

/**
 * List compliance rules
 */
export function listComplianceRules(filter?: {
  level?: ComplianceRule['level'];
  category?: ComplianceRule['category'];
  automated_only?: boolean;
}): ComplianceRule[] {
  let rules = Array.from(complianceRules.values());
  
  if (filter?.level) {
    rules = rules.filter(r => r.level === filter.level);
  }
  
  if (filter?.category) {
    rules = rules.filter(r => r.category === filter.category);
  }
  
  if (filter?.automated_only) {
    rules = rules.filter(r => r.automated_check);
  }
  
  return rules;
}

// ============ Violation Detection ============

/**
 * Scan HTML content for violations
 */
export function scanForViolations(
  html: string,
  pageUrl: string,
  targetLevel: 'A' | 'AA' | 'AAA' = 'AA'
): ComplianceViolation[] {
  const detectedViolations: ComplianceViolation[] = [];
  const levelsToCheck: ComplianceRule['level'][] = ['A'];
  
  if (targetLevel === 'AA' || targetLevel === 'AAA') {
    levelsToCheck.push('AA');
  }
  if (targetLevel === 'AAA') {
    levelsToCheck.push('AAA');
  }
  
  const rulesToCheck = Array.from(complianceRules.values())
    .filter(r => levelsToCheck.includes(r.level) && r.automated_check);
  
  for (const rule of rulesToCheck) {
    const ruleViolations = checkRule(rule, html, pageUrl);
    detectedViolations.push(...ruleViolations);
  }
  
  // Store violations
  detectedViolations.forEach(v => violations.set(v.id, v));
  
  return detectedViolations;
}

function checkRule(rule: ComplianceRule, html: string, pageUrl: string): ComplianceViolation[] {
  const ruleViolations: ComplianceViolation[] = [];
  
  switch (rule.id) {
    case 'wcag-1.1.1': {
      // Check for images without alt
      const imgMatches = html.matchAll(/<img[^>]*>/gi);
      for (const match of imgMatches) {
        if (!match[0].includes('alt=')) {
          ruleViolations.push(createViolation(rule, match[0], 'img:not([alt])', pageUrl, 'Image missing alt attribute'));
        }
      }
      break;
    }
    case 'wcag-3.1.1': {
      // Check for html without lang
      if (!/<html[^>]*lang=/i.test(html)) {
        ruleViolations.push(createViolation(rule, '<html>', 'html', pageUrl, 'HTML element missing lang attribute'));
      }
      break;
    }
    case 'wcag-2.4.4': {
      // Check for empty or generic links
      const linkMatches = html.matchAll(/<a[^>]*>([^<]*)<\/a>/gi);
      for (const match of linkMatches) {
        const linkText = match[1].trim();
        if (!linkText || ['click here', 'here', 'read more', 'more'].includes(linkText.toLowerCase())) {
          ruleViolations.push(createViolation(rule, match[0], 'a', pageUrl, 'Link text is not descriptive'));
        }
      }
      break;
    }
    // Add more rule checks as needed
  }
  
  return ruleViolations;
}

function createViolation(
  rule: ComplianceRule,
  html: string,
  selector: string,
  pageUrl: string,
  message: string
): ComplianceViolation {
  return {
    id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rule_id: rule.id,
    element_selector: selector,
    element_html: html.substring(0, 200),
    impact: rule.level === 'A' ? 'critical' : rule.level === 'AA' ? 'serious' : 'moderate',
    message,
    auto_fixable: !!rule.fix_template,
    fixed: false,
    page_url: pageUrl,
    detected_at: new Date().toISOString(),
  };
}

// ============ Auto-Remediation ============

/**
 * Auto-fix a violation if possible
 */
export function autoFixViolation(violationId: string, html: string): { success: boolean; fixed_html?: string; error?: string } {
  const violation = violations.get(violationId);
  if (!violation) {
    return { success: false, error: 'Violation not found' };
  }
  
  if (!violation.auto_fixable) {
    return { success: false, error: 'Violation is not auto-fixable' };
  }
  
  const rule = complianceRules.get(violation.rule_id);
  if (!rule?.fix_template) {
    return { success: false, error: 'No fix template available' };
  }
  
  try {
    const fixedHtml = html.replace(
      new RegExp(rule.fix_template.pattern, 'gi'),
      rule.fix_template.replacement
    );
    
    violation.fixed = true;
    violation.fixed_at = new Date().toISOString();
    violations.set(violationId, violation);
    
    return { success: true, fixed_html: fixedHtml };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/**
 * Batch auto-fix violations
 */
export function batchAutoFix(html: string, violationIds?: string[]): {
  fixed_html: string;
  fixed_count: number;
  failed_count: number;
} {
  let fixedHtml = html;
  let fixedCount = 0;
  let failedCount = 0;
  
  const toFix = violationIds 
    ? violationIds.map(id => violations.get(id)).filter((v): v is ComplianceViolation => !!v)
    : Array.from(violations.values()).filter(v => v.auto_fixable && !v.fixed);
  
  for (const violation of toFix) {
    const result = autoFixViolation(violation.id, fixedHtml);
    if (result.success && result.fixed_html) {
      fixedHtml = result.fixed_html;
      fixedCount++;
    } else {
      failedCount++;
    }
  }
  
  return { fixed_html: fixedHtml, fixed_count: fixedCount, failed_count: failedCount };
}

// ============ Remediation Tasks ============

/**
 * Create remediation task for non-auto-fixable violations
 */
export function createRemediationTask(violationId: string): RemediationTask {
  const violation = violations.get(violationId);
  const rule = violation ? complianceRules.get(violation.rule_id) : null;
  
  const task: RemediationTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    violation_id: violationId,
    status: 'pending',
    priority: violation?.impact === 'critical' ? 'critical' : 
              violation?.impact === 'serious' ? 'high' : 
              violation?.impact === 'moderate' ? 'medium' : 'low',
    estimated_effort_minutes: rule?.level === 'A' ? 30 : rule?.level === 'AA' ? 60 : 120,
    created_at: new Date().toISOString(),
  };
  
  remediationTasks.set(task.id, task);
  return task;
}

/**
 * Update remediation task status
 */
export function updateRemediationTask(
  taskId: string,
  updates: Partial<Omit<RemediationTask, 'id' | 'violation_id' | 'created_at'>>
): RemediationTask | null {
  const task = remediationTasks.get(taskId);
  if (!task) return null;
  
  const updated = { ...task, ...updates };
  
  if (updates.status === 'completed' && !task.completed_at) {
    updated.completed_at = new Date().toISOString();
    
    // Mark violation as fixed
    const violation = violations.get(task.violation_id);
    if (violation) {
      violation.fixed = true;
      violation.fixed_at = updated.completed_at;
      violations.set(task.violation_id, violation);
    }
  }
  
  remediationTasks.set(taskId, updated);
  return updated;
}

/**
 * Get remediation tasks
 */
export function getRemediationTasks(filter?: {
  status?: RemediationTask['status'];
  priority?: RemediationTask['priority'];
  assigned_to?: string;
}): RemediationTask[] {
  let tasks = Array.from(remediationTasks.values());
  
  if (filter?.status) {
    tasks = tasks.filter(t => t.status === filter.status);
  }
  
  if (filter?.priority) {
    tasks = tasks.filter(t => t.priority === filter.priority);
  }
  
  if (filter?.assigned_to) {
    tasks = tasks.filter(t => t.assigned_to === filter.assigned_to);
  }
  
  return tasks.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============ Reporting ============

/**
 * Generate compliance report
 */
export async function generateComplianceReport(targetLevel: 'A' | 'AA' | 'AAA' = 'AA'): Promise<ComplianceReport> {
  const allViolations = Array.from(violations.values());
  
  const byLevel: Record<string, number> = { A: 0, AA: 0, AAA: 0 };
  const byCategory: Record<string, number> = { perceivable: 0, operable: 0, understandable: 0, robust: 0 };
  const byImpact: Record<string, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const summaryMap: Map<string, ViolationSummary> = new Map();
  
  let autoFixed = 0;
  const pagesSet = new Set<string>();
  
  for (const violation of allViolations) {
    pagesSet.add(violation.page_url);
    
    const rule = complianceRules.get(violation.rule_id);
    if (rule) {
      byLevel[rule.level]++;
      byCategory[rule.category]++;
    }
    
    byImpact[violation.impact]++;
    
    if (violation.fixed) {
      autoFixed++;
    }
    
    // Build summary
    const existing = summaryMap.get(violation.rule_id);
    if (existing) {
      existing.count++;
      if (!existing.pages_affected.includes(violation.page_url)) {
        existing.pages_affected.push(violation.page_url);
      }
    } else {
      summaryMap.set(violation.rule_id, {
        rule_id: violation.rule_id,
        wcag_criterion: rule?.wcag_criterion || '',
        count: 1,
        pages_affected: [violation.page_url],
        auto_fixable: violation.auto_fixable,
      });
    }
  }
  
  // Calculate compliance score
  const maxScore = 100;
  const penaltyPerCritical = 10;
  const penaltyPerSerious = 5;
  const penaltyPerModerate = 2;
  const penaltyPerMinor = 1;
  
  const penalty = 
    byImpact.critical * penaltyPerCritical +
    byImpact.serious * penaltyPerSerious +
    byImpact.moderate * penaltyPerModerate +
    byImpact.minor * penaltyPerMinor;
  
  const complianceScore = Math.max(0, maxScore - penalty);
  
  const report: ComplianceReport = {
    id: `report_${Date.now()}`,
    generated_at: new Date().toISOString(),
    target_level: targetLevel,
    pages_scanned: pagesSet.size,
    total_violations: allViolations.length,
    violations_by_level: byLevel,
    violations_by_category: byCategory,
    violations_by_impact: byImpact,
    auto_fixed: autoFixed,
    compliance_score: complianceScore,
    details: Array.from(summaryMap.values()),
  };
  
  reports.set(report.id, report);
  
  // Log to database
  try {
    await supabase.from('brain_events').insert([{
      module: 'inclusive',
      event_type: 'compliance_report_generated',
      data: { 
        report_id: report.id, 
        compliance_score: complianceScore,
        total_violations: allViolations.length,
      },
      outcome: 'success',
    }]);
  } catch (e) {
    console.error('Failed to log compliance report:', e);
  }
  
  return report;
}

/**
 * Get compliance report by ID
 */
export function getComplianceReport(id: string): ComplianceReport | null {
  return reports.get(id) || null;
}

/**
 * List compliance reports
 */
export function listComplianceReports(limit: number = 10): ComplianceReport[] {
  return Array.from(reports.values())
    .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())
    .slice(0, limit);
}

// ============ Trend Analysis ============

/**
 * Get compliance trend over time
 */
export function getComplianceTrend(): {
  date: string;
  score: number;
  violations: number;
}[] {
  return Array.from(reports.values())
    .sort((a, b) => new Date(a.generated_at).getTime() - new Date(b.generated_at).getTime())
    .map(r => ({
      date: r.generated_at.split('T')[0],
      score: r.compliance_score,
      violations: r.total_violations,
    }));
}
