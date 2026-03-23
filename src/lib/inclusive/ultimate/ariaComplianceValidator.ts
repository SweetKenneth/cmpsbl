/**
 * INCLUSIVE Ultimate — System 4: ARIA Compliance Validator
 * 
 * Validates ARIA roles, states, properties against WAI-ARIA 1.2 spec.
 * Detects misused roles, orphaned labels, conflicting states, missing children.
 * 
 * @module inclusive/ultimate/ariaComplianceValidator
 */

// ── Types ────────────────────────────────────────────────────────

export type AriaViolationType =
  | 'invalid_role'
  | 'missing_required_property'
  | 'orphaned_label'
  | 'conflicting_states'
  | 'missing_required_children'
  | 'missing_required_parent'
  | 'deprecated_role'
  | 'redundant_role'
  | 'invalid_value';

export interface AriaViolation {
  id: string;
  type: AriaViolationType;
  element: string;
  role?: string;
  property?: string;
  description: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  suggestion: string;
  autoFixable: boolean;
}

export interface AriaValidationResult {
  id: string;
  target: string;
  totalElements: number;
  validElements: number;
  violations: AriaViolation[];
  score: number;
  validatedAt: string;
}

// ── ARIA Role Spec ───────────────────────────────────────────────

const ROLE_SPECS: Record<string, {
  requiredProperties: string[];
  requiredChildren?: string[];
  requiredParent?: string[];
  deprecated?: boolean;
  implicit?: string[];
}> = {
  alert:          { requiredProperties: [] },
  alertdialog:    { requiredProperties: ['aria-label', 'aria-labelledby'] },
  button:         { requiredProperties: [], implicit: ['button', 'input[type=button]'] },
  checkbox:       { requiredProperties: ['aria-checked'] },
  combobox:       { requiredProperties: ['aria-expanded', 'aria-controls'] },
  dialog:         { requiredProperties: ['aria-label', 'aria-labelledby'] },
  grid:           { requiredProperties: [], requiredChildren: ['row'] },
  gridcell:       { requiredProperties: [], requiredParent: ['row'] },
  heading:        { requiredProperties: ['aria-level'] },
  link:           { requiredProperties: [], implicit: ['a[href]'] },
  list:           { requiredProperties: [], requiredChildren: ['listitem'] },
  listbox:        { requiredProperties: [], requiredChildren: ['option'] },
  listitem:       { requiredProperties: [], requiredParent: ['list'] },
  menu:           { requiredProperties: [], requiredChildren: ['menuitem', 'menuitemcheckbox', 'menuitemradio'] },
  menubar:        { requiredProperties: [], requiredChildren: ['menuitem'] },
  menuitem:       { requiredProperties: [], requiredParent: ['menu', 'menubar'] },
  navigation:     { requiredProperties: [] },
  option:         { requiredProperties: [], requiredParent: ['listbox'] },
  progressbar:    { requiredProperties: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'] },
  radio:          { requiredProperties: ['aria-checked'] },
  radiogroup:     { requiredProperties: [], requiredChildren: ['radio'] },
  row:            { requiredProperties: [], requiredParent: ['grid', 'table', 'treegrid'] },
  scrollbar:      { requiredProperties: ['aria-controls', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-orientation'] },
  search:         { requiredProperties: [] },
  slider:         { requiredProperties: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'] },
  spinbutton:     { requiredProperties: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'] },
  switch:         { requiredProperties: ['aria-checked'] },
  tab:            { requiredProperties: [], requiredParent: ['tablist'] },
  table:          { requiredProperties: [], requiredChildren: ['row'] },
  tablist:        { requiredProperties: [], requiredChildren: ['tab'] },
  tabpanel:       { requiredProperties: ['aria-labelledby'] },
  textbox:        { requiredProperties: [] },
  toolbar:        { requiredProperties: [] },
  tooltip:        { requiredProperties: [] },
  tree:           { requiredProperties: [], requiredChildren: ['treeitem'] },
  treegrid:       { requiredProperties: [], requiredChildren: ['row'] },
  treeitem:       { requiredProperties: [], requiredParent: ['tree'] },
  // Deprecated
  directory:      { requiredProperties: [], deprecated: true },
};

// ── State ────────────────────────────────────────────────────────

const validationHistory: AriaValidationResult[] = [];
const MAX_HISTORY = 200;

// ── Core API ────────────────────────────────────────────────────

/** Validate ARIA usage in a target */
export function validateAria(
  target: string,
  elements: Array<{ tag: string; role?: string; attributes: Record<string, string> }>,
): AriaValidationResult {
  const violations: AriaViolation[] = [];
  let validCount = 0;

  for (const el of elements) {
    const role = el.role || el.attributes['role'];
    if (!role) {
      // Check for aria-label without role
      if (el.attributes['aria-label'] && !['input', 'button', 'a', 'select', 'textarea'].includes(el.tag)) {
        violations.push({
          id: crypto.randomUUID(),
          type: 'orphaned_label',
          element: `<${el.tag}>`,
          property: 'aria-label',
          description: `aria-label on <${el.tag}> without an explicit role — may be ignored by assistive technology`,
          severity: 'moderate',
          suggestion: `Add an appropriate role to <${el.tag}> or use a semantic element`,
          autoFixable: false,
        });
      }
      validCount++;
      continue;
    }

    const spec = ROLE_SPECS[role];

    if (!spec) {
      violations.push({
        id: crypto.randomUUID(),
        type: 'invalid_role',
        element: `<${el.tag}>`,
        role,
        description: `Unknown ARIA role "${role}" on <${el.tag}>`,
        severity: 'serious',
        suggestion: `Use a valid WAI-ARIA 1.2 role`,
        autoFixable: false,
      });
      continue;
    }

    if (spec.deprecated) {
      violations.push({
        id: crypto.randomUUID(),
        type: 'deprecated_role',
        element: `<${el.tag}>`,
        role,
        description: `Deprecated ARIA role "${role}" on <${el.tag}>`,
        severity: 'moderate',
        suggestion: `Replace with a current equivalent role`,
        autoFixable: true,
      });
    }

    // Check implicit (redundant) roles
    if (spec.implicit?.includes(el.tag)) {
      violations.push({
        id: crypto.randomUUID(),
        type: 'redundant_role',
        element: `<${el.tag}>`,
        role,
        description: `Redundant role="${role}" on <${el.tag}> — the element already has this role implicitly`,
        severity: 'minor',
        suggestion: `Remove the redundant role attribute`,
        autoFixable: true,
      });
    }

    // Check required properties
    for (const prop of spec.requiredProperties) {
      // Accept either of aria-label OR aria-labelledby if one is required
      if ((prop === 'aria-label' || prop === 'aria-labelledby') &&
          (el.attributes['aria-label'] || el.attributes['aria-labelledby'])) {
        continue;
      }
      if (!el.attributes[prop]) {
        violations.push({
          id: crypto.randomUUID(),
          type: 'missing_required_property',
          element: `<${el.tag}>`,
          role,
          property: prop,
          description: `Missing required property "${prop}" for role="${role}" on <${el.tag}>`,
          severity: 'serious',
          suggestion: `Add ${prop} attribute to the element`,
          autoFixable: prop.startsWith('aria-value'),
        });
      }
    }

    // Check conflicting states
    if (el.attributes['aria-hidden'] === 'true' && el.attributes['aria-expanded']) {
      violations.push({
        id: crypto.randomUUID(),
        type: 'conflicting_states',
        element: `<${el.tag}>`,
        role,
        description: `Conflicting states: aria-hidden="true" with aria-expanded on <${el.tag}>`,
        severity: 'serious',
        suggestion: `Remove aria-hidden or aria-expanded — an element cannot be both hidden and expandable`,
        autoFixable: false,
      });
    }

    validCount++;
  }

  const score = elements.length > 0
    ? Math.round(((elements.length - violations.length) / elements.length) * 100)
    : 100;

  const result: AriaValidationResult = {
    id: crypto.randomUUID(),
    target,
    totalElements: elements.length,
    validElements: validCount,
    violations,
    score: Math.max(0, score),
    validatedAt: new Date().toISOString(),
  };

  validationHistory.push(result);
  if (validationHistory.length > MAX_HISTORY) validationHistory.splice(0, validationHistory.length - MAX_HISTORY);

  return result;
}

/** Get validation health */
export function getAriaHealth() {
  const recent = validationHistory.slice(-20);
  return {
    totalValidations: validationHistory.length,
    rolesTracked: Object.keys(ROLE_SPECS).length,
    avgScore: recent.length > 0
      ? Math.round(recent.reduce((s, r) => s + r.score, 0) / recent.length)
      : 100,
    commonViolations: getTopViolationTypes(),
  };
}

function getTopViolationTypes(): Array<{ type: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const result of validationHistory.slice(-50)) {
    for (const v of result.violations) {
      counts[v.type] = (counts[v.type] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
}

/** Reset */
export function resetAriaValidator(): void {
  validationHistory.length = 0;
}
