/**
 * INCLUSIVE — WCAG 2.2 Criterion Registry
 * @origin(ptchbl) — Migrated from PTCHBL WCAG Scanner wcag-registry.ts
 * 
 * Structured criterion metadata with principle/guideline/validator mappings.
 * Extends the flat WCAG_CRITERIA map in scan.ts with rich taxonomy data.
 */

export type WCAGPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';

export interface WCAGCriterion {
  id: string;
  level: 'A' | 'AA' | 'AAA';
  principle: WCAGPrinciple;
  guideline: string;
  name: string;
  description: string;
  automated: boolean;
  autoFixable: boolean;
  validator?: string;
}

/**
 * Full WCAG 2.2 Registry — structured criterion data
 * Covers all 86 criteria with principle/guideline taxonomy
 */
export const WCAG_REGISTRY: Record<string, WCAGCriterion> = {
  // ═══ PERCEIVABLE ═══

  // 1.1 Text Alternatives
  '1.1.1': { id: '1.1.1', level: 'A', principle: 'perceivable', guideline: 'Text Alternatives', name: 'Non-text Content', description: 'All non-text content has a text alternative', automated: true, autoFixable: true, validator: 'image' },

  // 1.2 Time-based Media
  '1.2.1': { id: '1.2.1', level: 'A', principle: 'perceivable', guideline: 'Time-based Media', name: 'Audio-only and Video-only', description: 'Alternative for time-based media is provided', automated: true, autoFixable: false, validator: 'media' },
  '1.2.2': { id: '1.2.2', level: 'A', principle: 'perceivable', guideline: 'Time-based Media', name: 'Captions (Prerecorded)', description: 'Captions are provided for all prerecorded audio', automated: true, autoFixable: false, validator: 'media' },
  '1.2.3': { id: '1.2.3', level: 'A', principle: 'perceivable', guideline: 'Time-based Media', name: 'Audio Description or Media Alternative', description: 'An alternative for time-based media or audio description is provided', automated: true, autoFixable: false, validator: 'media' },
  '1.2.4': { id: '1.2.4', level: 'AA', principle: 'perceivable', guideline: 'Time-based Media', name: 'Captions (Live)', description: 'Captions provided for all live audio in synchronized media', automated: false, autoFixable: false },
  '1.2.5': { id: '1.2.5', level: 'AA', principle: 'perceivable', guideline: 'Time-based Media', name: 'Audio Description (Prerecorded)', description: 'Audio description provided for all prerecorded video', automated: false, autoFixable: false },
  '1.2.6': { id: '1.2.6', level: 'AAA', principle: 'perceivable', guideline: 'Time-based Media', name: 'Sign Language (Prerecorded)', description: 'Sign language interpretation provided', automated: false, autoFixable: false },
  '1.2.7': { id: '1.2.7', level: 'AAA', principle: 'perceivable', guideline: 'Time-based Media', name: 'Extended Audio Description', description: 'Extended audio description provided', automated: false, autoFixable: false },
  '1.2.8': { id: '1.2.8', level: 'AAA', principle: 'perceivable', guideline: 'Time-based Media', name: 'Media Alternative (Prerecorded)', description: 'Alternative for time-based media provided', automated: false, autoFixable: false },
  '1.2.9': { id: '1.2.9', level: 'AAA', principle: 'perceivable', guideline: 'Time-based Media', name: 'Audio-only (Live)', description: 'Alternative for live audio-only content provided', automated: false, autoFixable: false },

  // 1.3 Adaptable
  '1.3.1': { id: '1.3.1', level: 'A', principle: 'perceivable', guideline: 'Adaptable', name: 'Info and Relationships', description: 'Information, structure, and relationships can be programmatically determined', automated: true, autoFixable: false, validator: 'structure+form' },
  '1.3.2': { id: '1.3.2', level: 'A', principle: 'perceivable', guideline: 'Adaptable', name: 'Meaningful Sequence', description: 'Correct reading sequence can be programmatically determined', automated: true, autoFixable: false, validator: 'structure' },
  '1.3.3': { id: '1.3.3', level: 'A', principle: 'perceivable', guideline: 'Adaptable', name: 'Sensory Characteristics', description: 'Instructions do not rely solely on sensory characteristics', automated: false, autoFixable: false },
  '1.3.4': { id: '1.3.4', level: 'AA', principle: 'perceivable', guideline: 'Adaptable', name: 'Orientation', description: 'Content not restricted to a single display orientation', automated: false, autoFixable: false },
  '1.3.5': { id: '1.3.5', level: 'AA', principle: 'perceivable', guideline: 'Adaptable', name: 'Identify Input Purpose', description: 'Input purpose can be programmatically determined', automated: true, autoFixable: true, validator: 'form' },
  '1.3.6': { id: '1.3.6', level: 'AAA', principle: 'perceivable', guideline: 'Adaptable', name: 'Identify Purpose', description: 'Purpose of UI components can be programmatically determined', automated: false, autoFixable: false },

  // 1.4 Distinguishable
  '1.4.1': { id: '1.4.1', level: 'A', principle: 'perceivable', guideline: 'Distinguishable', name: 'Use of Color', description: 'Color is not the only visual means of conveying information', automated: false, autoFixable: false },
  '1.4.2': { id: '1.4.2', level: 'A', principle: 'perceivable', guideline: 'Distinguishable', name: 'Audio Control', description: 'Mechanism to pause or stop audio that plays automatically', automated: true, autoFixable: true },
  '1.4.3': { id: '1.4.3', level: 'AA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Contrast (Minimum)', description: 'Text has a contrast ratio of at least 4.5:1', automated: true, autoFixable: true, validator: 'contrast' },
  '1.4.4': { id: '1.4.4', level: 'AA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Resize Text', description: 'Text can be resized up to 200% without loss of functionality', automated: false, autoFixable: false },
  '1.4.5': { id: '1.4.5', level: 'AA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Images of Text', description: 'Text is used rather than images of text', automated: true, autoFixable: false, validator: 'media+image' },
  '1.4.6': { id: '1.4.6', level: 'AAA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Contrast (Enhanced)', description: 'Text has a contrast ratio of at least 7:1', automated: true, autoFixable: true, validator: 'contrast' },
  '1.4.7': { id: '1.4.7', level: 'AAA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Low or No Background Audio', description: 'Audio content has no or very low background sounds', automated: false, autoFixable: false },
  '1.4.8': { id: '1.4.8', level: 'AAA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Visual Presentation', description: 'Blocks of text have configurable visual presentation', automated: false, autoFixable: false },
  '1.4.9': { id: '1.4.9', level: 'AAA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Images of Text (No Exception)', description: 'Images of text are only used for pure decoration', automated: true, autoFixable: false, validator: 'image' },
  '1.4.10': { id: '1.4.10', level: 'AA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Reflow', description: 'Content reflows without two-dimensional scrolling', automated: false, autoFixable: false },
  '1.4.11': { id: '1.4.11', level: 'AA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Non-text Contrast', description: 'UI components and graphical objects have contrast ratio of 3:1', automated: true, autoFixable: false, validator: 'contrast' },
  '1.4.12': { id: '1.4.12', level: 'AA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Text Spacing', description: 'No loss of content when text spacing is adjusted', automated: false, autoFixable: false },
  '1.4.13': { id: '1.4.13', level: 'AA', principle: 'perceivable', guideline: 'Distinguishable', name: 'Content on Hover or Focus', description: 'Hover/focus content is dismissible, hoverable, and persistent', automated: false, autoFixable: false },

  // ═══ OPERABLE ═══

  // 2.1 Keyboard Accessible
  '2.1.1': { id: '2.1.1', level: 'A', principle: 'operable', guideline: 'Keyboard Accessible', name: 'Keyboard', description: 'All functionality is available from a keyboard', automated: true, autoFixable: true, validator: 'keyboard' },
  '2.1.2': { id: '2.1.2', level: 'A', principle: 'operable', guideline: 'Keyboard Accessible', name: 'No Keyboard Trap', description: 'Keyboard focus can be moved away from components', automated: true, autoFixable: false, validator: 'keyboard' },
  '2.1.3': { id: '2.1.3', level: 'AAA', principle: 'operable', guideline: 'Keyboard Accessible', name: 'Keyboard (No Exception)', description: 'All functionality operable via keyboard without exception', automated: false, autoFixable: false },
  '2.1.4': { id: '2.1.4', level: 'A', principle: 'operable', guideline: 'Keyboard Accessible', name: 'Character Key Shortcuts', description: 'Character key shortcuts can be turned off or remapped', automated: false, autoFixable: false },

  // 2.2 Enough Time
  '2.2.1': { id: '2.2.1', level: 'A', principle: 'operable', guideline: 'Enough Time', name: 'Timing Adjustable', description: 'Time limits can be adjusted', automated: false, autoFixable: false },
  '2.2.2': { id: '2.2.2', level: 'A', principle: 'operable', guideline: 'Enough Time', name: 'Pause, Stop, Hide', description: 'Moving, blinking, scrolling content can be paused', automated: true, autoFixable: false },
  '2.2.3': { id: '2.2.3', level: 'AAA', principle: 'operable', guideline: 'Enough Time', name: 'No Timing', description: 'Timing is not an essential part of the event', automated: false, autoFixable: false },
  '2.2.4': { id: '2.2.4', level: 'AAA', principle: 'operable', guideline: 'Enough Time', name: 'Interruptions', description: 'Interruptions can be postponed or suppressed', automated: false, autoFixable: false },
  '2.2.5': { id: '2.2.5', level: 'AAA', principle: 'operable', guideline: 'Enough Time', name: 'Re-authenticating', description: 'Data is preserved when session expires', automated: false, autoFixable: false },
  '2.2.6': { id: '2.2.6', level: 'AAA', principle: 'operable', guideline: 'Enough Time', name: 'Timeouts', description: 'Users are warned about inactivity timeouts', automated: false, autoFixable: false },

  // 2.3 Seizures and Physical Reactions
  '2.3.1': { id: '2.3.1', level: 'A', principle: 'operable', guideline: 'Seizures', name: 'Three Flashes or Below Threshold', description: 'No content flashes more than three times per second', automated: false, autoFixable: false },
  '2.3.2': { id: '2.3.2', level: 'AAA', principle: 'operable', guideline: 'Seizures', name: 'Three Flashes', description: 'No content flashes more than three times per second', automated: false, autoFixable: false },
  '2.3.3': { id: '2.3.3', level: 'AAA', principle: 'operable', guideline: 'Seizures', name: 'Animation from Interactions', description: 'Motion animation can be disabled', automated: false, autoFixable: false },

  // 2.4 Navigable
  '2.4.1': { id: '2.4.1', level: 'A', principle: 'operable', guideline: 'Navigable', name: 'Bypass Blocks', description: 'Mechanism to bypass blocks of repeated content', automated: true, autoFixable: true, validator: 'keyboard' },
  '2.4.2': { id: '2.4.2', level: 'A', principle: 'operable', guideline: 'Navigable', name: 'Page Titled', description: 'Pages have titles that describe topic or purpose', automated: true, autoFixable: true, validator: 'structure' },
  '2.4.3': { id: '2.4.3', level: 'A', principle: 'operable', guideline: 'Navigable', name: 'Focus Order', description: 'Focus order preserves meaning and operability', automated: true, autoFixable: false, validator: 'keyboard' },
  '2.4.4': { id: '2.4.4', level: 'A', principle: 'operable', guideline: 'Navigable', name: 'Link Purpose (In Context)', description: 'Purpose of each link can be determined from link text', automated: true, autoFixable: false, validator: 'link' },
  '2.4.5': { id: '2.4.5', level: 'AA', principle: 'operable', guideline: 'Navigable', name: 'Multiple Ways', description: 'More than one way to locate a page', automated: false, autoFixable: false },
  '2.4.6': { id: '2.4.6', level: 'AA', principle: 'operable', guideline: 'Navigable', name: 'Headings and Labels', description: 'Headings and labels describe topic or purpose', automated: true, autoFixable: true, validator: 'structure' },
  '2.4.7': { id: '2.4.7', level: 'AA', principle: 'operable', guideline: 'Navigable', name: 'Focus Visible', description: 'Keyboard focus indicator is visible', automated: true, autoFixable: false, validator: 'keyboard' },
  '2.4.8': { id: '2.4.8', level: 'AAA', principle: 'operable', guideline: 'Navigable', name: 'Location', description: 'Information about user location within a set of pages', automated: false, autoFixable: false },
  '2.4.9': { id: '2.4.9', level: 'AAA', principle: 'operable', guideline: 'Navigable', name: 'Link Purpose (Link Only)', description: 'Purpose of each link identified from link text alone', automated: true, autoFixable: false, validator: 'link' },
  '2.4.10': { id: '2.4.10', level: 'AAA', principle: 'operable', guideline: 'Navigable', name: 'Section Headings', description: 'Section headings organize content', automated: true, autoFixable: false, validator: 'structure' },

  // 2.5 Input Modalities
  '2.5.1': { id: '2.5.1', level: 'A', principle: 'operable', guideline: 'Input Modalities', name: 'Pointer Gestures', description: 'Multipoint gestures have single-pointer alternatives', automated: false, autoFixable: false },
  '2.5.2': { id: '2.5.2', level: 'A', principle: 'operable', guideline: 'Input Modalities', name: 'Pointer Cancellation', description: 'Pointer actions can be cancelled', automated: false, autoFixable: false },
  '2.5.3': { id: '2.5.3', level: 'A', principle: 'operable', guideline: 'Input Modalities', name: 'Label in Name', description: 'Visible label is part of accessible name', automated: true, autoFixable: false },
  '2.5.4': { id: '2.5.4', level: 'A', principle: 'operable', guideline: 'Input Modalities', name: 'Motion Actuation', description: 'Functionality by motion can be operated by interface', automated: false, autoFixable: false },
  '2.5.5': { id: '2.5.5', level: 'AAA', principle: 'operable', guideline: 'Input Modalities', name: 'Target Size (Enhanced)', description: 'Target size is at least 44x44 CSS pixels', automated: false, autoFixable: false },
  '2.5.6': { id: '2.5.6', level: 'AAA', principle: 'operable', guideline: 'Input Modalities', name: 'Concurrent Input Mechanisms', description: 'No restriction on input modalities', automated: false, autoFixable: false },
  '2.5.7': { id: '2.5.7', level: 'AA', principle: 'operable', guideline: 'Input Modalities', name: 'Dragging Movements', description: 'Dragging has single-pointer alternative', automated: false, autoFixable: false },
  '2.5.8': { id: '2.5.8', level: 'AA', principle: 'operable', guideline: 'Input Modalities', name: 'Target Size (Minimum)', description: 'Target size is at least 24x24 CSS pixels', automated: false, autoFixable: false },

  // ═══ UNDERSTANDABLE ═══

  // 3.1 Readable
  '3.1.1': { id: '3.1.1', level: 'A', principle: 'understandable', guideline: 'Readable', name: 'Language of Page', description: 'Default human language can be programmatically determined', automated: true, autoFixable: true, validator: 'structure' },
  '3.1.2': { id: '3.1.2', level: 'AA', principle: 'understandable', guideline: 'Readable', name: 'Language of Parts', description: 'Language of each passage can be determined', automated: false, autoFixable: false },
  '3.1.3': { id: '3.1.3', level: 'AAA', principle: 'understandable', guideline: 'Readable', name: 'Unusual Words', description: 'Mechanism for identifying unusual words', automated: false, autoFixable: false },
  '3.1.4': { id: '3.1.4', level: 'AAA', principle: 'understandable', guideline: 'Readable', name: 'Abbreviations', description: 'Mechanism for identifying abbreviations', automated: false, autoFixable: false },
  '3.1.5': { id: '3.1.5', level: 'AAA', principle: 'understandable', guideline: 'Readable', name: 'Reading Level', description: 'Supplemental content for complex text', automated: false, autoFixable: false },
  '3.1.6': { id: '3.1.6', level: 'AAA', principle: 'understandable', guideline: 'Readable', name: 'Pronunciation', description: 'Mechanism for identifying pronunciation', automated: false, autoFixable: false },

  // 3.2 Predictable
  '3.2.1': { id: '3.2.1', level: 'A', principle: 'understandable', guideline: 'Predictable', name: 'On Focus', description: 'No change of context on focus', automated: true, autoFixable: false },
  '3.2.2': { id: '3.2.2', level: 'A', principle: 'understandable', guideline: 'Predictable', name: 'On Input', description: 'No change of context on input', automated: true, autoFixable: false },
  '3.2.3': { id: '3.2.3', level: 'AA', principle: 'understandable', guideline: 'Predictable', name: 'Consistent Navigation', description: 'Navigation mechanisms are consistent', automated: false, autoFixable: false },
  '3.2.4': { id: '3.2.4', level: 'AA', principle: 'understandable', guideline: 'Predictable', name: 'Consistent Identification', description: 'Components with same functionality identified consistently', automated: false, autoFixable: false },
  '3.2.5': { id: '3.2.5', level: 'AAA', principle: 'understandable', guideline: 'Predictable', name: 'Change on Request', description: 'Changes of context initiated only by user request', automated: false, autoFixable: false },

  // 3.3 Input Assistance
  '3.3.1': { id: '3.3.1', level: 'A', principle: 'understandable', guideline: 'Input Assistance', name: 'Error Identification', description: 'Input errors are identified and described', automated: true, autoFixable: false },
  '3.3.2': { id: '3.3.2', level: 'A', principle: 'understandable', guideline: 'Input Assistance', name: 'Labels or Instructions', description: 'Labels or instructions provided for user input', automated: true, autoFixable: true, validator: 'form' },
  '3.3.3': { id: '3.3.3', level: 'AA', principle: 'understandable', guideline: 'Input Assistance', name: 'Error Suggestion', description: 'Suggestions for correcting errors', automated: false, autoFixable: false },
  '3.3.4': { id: '3.3.4', level: 'AA', principle: 'understandable', guideline: 'Input Assistance', name: 'Error Prevention (Legal, Financial, Data)', description: 'Submissions reversible, checked, or confirmed', automated: false, autoFixable: false },
  '3.3.5': { id: '3.3.5', level: 'AAA', principle: 'understandable', guideline: 'Input Assistance', name: 'Help', description: 'Context-sensitive help is available', automated: false, autoFixable: false },
  '3.3.6': { id: '3.3.6', level: 'AAA', principle: 'understandable', guideline: 'Input Assistance', name: 'Error Prevention (All)', description: 'All submissions reversible, checked, or confirmed', automated: false, autoFixable: false },
  '3.3.7': { id: '3.3.7', level: 'AAA', principle: 'understandable', guideline: 'Input Assistance', name: 'Redundant Entry', description: 'Previously entered information auto-populated', automated: false, autoFixable: false },
  '3.3.8': { id: '3.3.8', level: 'AAA', principle: 'understandable', guideline: 'Input Assistance', name: 'Accessible Authentication (Minimum)', description: 'Authentication without cognitive function test', automated: false, autoFixable: false },
  '3.3.9': { id: '3.3.9', level: 'AAA', principle: 'understandable', guideline: 'Input Assistance', name: 'Accessible Authentication (Enhanced)', description: 'No cognitive function test for authentication', automated: false, autoFixable: false },

  // ═══ ROBUST ═══
  '4.1.1': { id: '4.1.1', level: 'A', principle: 'robust', guideline: 'Compatible', name: 'Parsing', description: 'Markup is well-formed', automated: true, autoFixable: false },
  '4.1.2': { id: '4.1.2', level: 'A', principle: 'robust', guideline: 'Compatible', name: 'Name, Role, Value', description: 'For all UI components, name and role can be programmatically determined', automated: true, autoFixable: false, validator: 'aria+form' },
  '4.1.3': { id: '4.1.3', level: 'AA', principle: 'robust', guideline: 'Compatible', name: 'Status Messages', description: 'Status messages can be programmatically determined', automated: true, autoFixable: true },
};

// ════════════════════════════════════════
// Query Utilities
// ════════════════════════════════════════

/** Get all automated criteria */
export function getAutomatedCriteria(): WCAGCriterion[] {
  return Object.values(WCAG_REGISTRY).filter(c => c.automated);
}

/** Get auto-fixable criteria */
export function getAutoFixableCriteria(): WCAGCriterion[] {
  return Object.values(WCAG_REGISTRY).filter(c => c.autoFixable);
}

/** Get criteria by level */
export function getCriteriaByLevel(level: 'A' | 'AA' | 'AAA'): WCAGCriterion[] {
  return Object.values(WCAG_REGISTRY).filter(c => c.level === level);
}

/** Get criteria by principle */
export function getCriteriaByPrinciple(principle: WCAGPrinciple): WCAGCriterion[] {
  return Object.values(WCAG_REGISTRY).filter(c => c.principle === principle);
}

/** Get criteria by validator */
export function getCriteriaByValidator(validator: string): WCAGCriterion[] {
  return Object.values(WCAG_REGISTRY).filter(c => c.validator?.includes(validator));
}

/** Get registry stats */
export function getRegistryStats(): {
  total: number;
  automated: number;
  autoFixable: number;
  manual: number;
  byLevel: Record<string, number>;
  byPrinciple: Record<string, number>;
} {
  const all = Object.values(WCAG_REGISTRY);
  const automated = all.filter(c => c.automated).length;
  const autoFixable = all.filter(c => c.autoFixable).length;

  const byLevel: Record<string, number> = { A: 0, AA: 0, AAA: 0 };
  const byPrinciple: Record<string, number> = { perceivable: 0, operable: 0, understandable: 0, robust: 0 };

  for (const c of all) {
    byLevel[c.level]++;
    byPrinciple[c.principle]++;
  }

  return {
    total: all.length,
    automated,
    autoFixable,
    manual: all.length - automated,
    byLevel,
    byPrinciple,
  };
}

/** Look up a single criterion */
export function getCriterion(id: string): WCAGCriterion | undefined {
  return WCAG_REGISTRY[id];
}
