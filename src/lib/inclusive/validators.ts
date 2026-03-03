/**
 * INCLUSIVE — Unified Validator Suite
 * @origin(ptchbl) — Adapted from PTCHBL validators/ directory (78 validator files)
 * 
 * Client-side regex-based validators for WCAG 2.2 compliance.
 * Covers: ARIA, Links, Forms, Keyboard, Media, Structure, Images.
 * 
 * These validators extend the basic checks in scan.ts with deeper,
 * more targeted analysis from the PTCHBL scanner.
 */

// ════════════════════════════════════════
// Shared Types
// ════════════════════════════════════════

export interface ValidatorIssue {
  type: string;
  element: string;
  wcagCriteria: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestedFix: string;
  autoFixable: boolean;
}

// ════════════════════════════════════════
// HTML Parsing Utilities
// @origin(ptchbl) html-parser.ts — regex-based, no DOMParser needed
// ════════════════════════════════════════

export function extractElements(html: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'gi');
  return html.match(regex) || [];
}

export function extractSelfClosing(html: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*\\/?>`, 'gi');
  return html.match(regex) || [];
}

export function extractAttr(element: string, attrName: string): string | null {
  const regex = new RegExp(`${attrName}=["']([^"']*)["']`, 'i');
  const match = element.match(regex);
  return match ? match[1] : null;
}

export function getTextContent(element: string): string {
  return element.replace(/<[^>]*>/g, '').trim();
}

// ════════════════════════════════════════
// ARIA Validator (WCAG 4.1.2)
// ════════════════════════════════════════

const VALID_ARIA_ROLES = new Set([
  'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell',
  'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition',
  'dialog', 'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell',
  'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
  'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'navigation', 'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
  'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search',
  'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab',
  'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip',
  'tree', 'treegrid', 'treeitem',
]);

/** Redundant role mappings: semantic tag → implicit role */
const IMPLICIT_ROLES: Record<string, string> = {
  button: 'button', nav: 'navigation', main: 'main', header: 'banner',
  footer: 'contentinfo', aside: 'complementary', form: 'form',
  article: 'article', section: 'region',
};

export function validateAria(html: string): ValidatorIssue[] {
  const issues: ValidatorIssue[] = [];

  // Check for invalid roles
  const roleRegex = /role=["']([^"']*)["']/gi;
  let roleMatch;
  while ((roleMatch = roleRegex.exec(html)) !== null) {
    const role = roleMatch[1].trim();
    if (!VALID_ARIA_ROLES.has(role)) {
      issues.push({
        type: 'invalid_aria_role',
        element: html.substring(Math.max(0, roleMatch.index - 30), roleMatch.index + roleMatch[0].length + 30).substring(0, 120),
        wcagCriteria: ['4.1.2'],
        severity: 'critical',
        description: `Invalid ARIA role: "${role}"`,
        suggestedFix: 'Use a valid ARIA role or remove the role attribute',
        autoFixable: false,
      });
    }
  }

  // Check for redundant roles on semantic HTML
  for (const [tag, implicitRole] of Object.entries(IMPLICIT_ROLES)) {
    const redundantRegex = new RegExp(`<${tag}[^>]*role=["']${implicitRole}["']`, 'gi');
    let redundantMatch;
    while ((redundantMatch = redundantRegex.exec(html)) !== null) {
      issues.push({
        type: 'redundant_aria_role',
        element: redundantMatch[0].substring(0, 120),
        wcagCriteria: ['4.1.2'],
        severity: 'low',
        description: `Redundant role="${implicitRole}" on <${tag}>`,
        suggestedFix: `Remove role attribute; <${tag}> has implicit ${implicitRole} role`,
        autoFixable: true,
      });
    }
  }

  // Check for icons without aria-label or aria-hidden
  const iconRegex = /<(i|svg|span)[^>]*class=["'][^"']*icon[^"']*["'][^>]*>/gi;
  let iconMatch;
  while ((iconMatch = iconRegex.exec(html)) !== null) {
    const el = iconMatch[0];
    if (!el.includes('aria-label') && !el.includes('aria-hidden') && !el.includes('role="presentation"')) {
      issues.push({
        type: 'icon_missing_label',
        element: el.substring(0, 120),
        wcagCriteria: ['4.1.2', '1.1.1'],
        severity: 'high',
        description: 'Icon element missing aria-label or aria-hidden',
        suggestedFix: 'Add aria-label="Description" or aria-hidden="true" for decorative icons',
        autoFixable: true,
      });
    }
  }

  return issues;
}

// ════════════════════════════════════════
// Link Validator (WCAG 2.4.4, 2.4.9)
// ════════════════════════════════════════

const GENERIC_LINK_TEXT = new Set([
  'click here', 'read more', 'more', 'link', 'here', 'this', 'continue',
  'learn more', 'details', 'more info', 'more information', 'click',
]);

export function validateLinks(html: string): ValidatorIssue[] {
  const issues: ValidatorIssue[] = [];
  const links = extractElements(html, 'a');

  for (const link of links) {
    const href = extractAttr(link, 'href');
    const text = getTextContent(link).toLowerCase();
    const ariaLabel = extractAttr(link, 'aria-label');

    // Missing or invalid href
    if (!href || href === '#' || href === '') {
      issues.push({
        type: 'link_missing_href',
        element: link.substring(0, 120),
        wcagCriteria: ['2.4.4'],
        severity: 'critical',
        description: 'Link missing valid href attribute',
        suggestedFix: 'Add proper href or convert to <button> if not navigating',
        autoFixable: false,
      });
    }

    // Empty links
    if (!text && !ariaLabel) {
      issues.push({
        type: 'link_empty',
        element: link.substring(0, 120),
        wcagCriteria: ['2.4.4', '4.1.2'],
        severity: 'critical',
        description: 'Link has no accessible text',
        suggestedFix: 'Add descriptive text or aria-label attribute',
        autoFixable: false,
      });
    }

    // Generic link text
    if (text && GENERIC_LINK_TEXT.has(text) && !ariaLabel) {
      issues.push({
        type: 'link_generic_text',
        element: link.substring(0, 120),
        wcagCriteria: ['2.4.4', '2.4.9'],
        severity: 'high',
        description: `Generic link text: "${text}"`,
        suggestedFix: 'Use descriptive text indicating destination (e.g., "Read our privacy policy")',
        autoFixable: false,
      });
    }
  }

  return issues;
}

// ════════════════════════════════════════
// Form Validator (WCAG 1.3.1, 3.3.2, 4.1.2)
// ════════════════════════════════════════

export function validateForms(html: string): ValidatorIssue[] {
  const issues: ValidatorIssue[] = [];

  const inputs = extractSelfClosing(html, 'input');
  const selects = extractElements(html, 'select');
  const textareas = extractElements(html, 'textarea');
  const formElements = [...inputs, ...selects, ...textareas];

  for (const el of formElements) {
    const id = extractAttr(el, 'id');
    const ariaLabel = extractAttr(el, 'aria-label');
    const ariaLabelledBy = extractAttr(el, 'aria-labelledby');
    const type = extractAttr(el, 'type');
    const placeholder = extractAttr(el, 'placeholder');

    // Skip hidden/submit types
    if (type === 'hidden' || type === 'submit' || type === 'button') continue;

    // Missing label
    const hasLabelAssociation = ariaLabel || ariaLabelledBy || (id && html.includes(`for="${id}"`));
    if (!hasLabelAssociation) {
      issues.push({
        type: 'form_missing_label',
        element: el.substring(0, 120),
        wcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
        severity: 'critical',
        description: 'Form input missing accessible label',
        suggestedFix: id
          ? `Add <label for="${id}">Label</label> or aria-label`
          : 'Add id attribute and associated <label> element',
        autoFixable: false,
      });
    }

    // Placeholder-only
    if (placeholder && !hasLabelAssociation) {
      issues.push({
        type: 'form_placeholder_only',
        element: el.substring(0, 120),
        wcagCriteria: ['3.3.2'],
        severity: 'critical',
        description: 'Input relies on placeholder instead of proper label',
        suggestedFix: 'Add a visible <label> element; placeholders disappear on input',
        autoFixable: false,
      });
    }

    // Required without aria-required
    if (el.includes('required') && !el.includes('aria-required')) {
      issues.push({
        type: 'form_missing_aria_required',
        element: el.substring(0, 120),
        wcagCriteria: ['3.3.2'],
        severity: 'medium',
        description: 'Required field missing aria-required attribute',
        suggestedFix: 'Add aria-required="true" to required inputs',
        autoFixable: true,
      });
    }
  }

  return issues;
}

// ════════════════════════════════════════
// Keyboard Validator (WCAG 2.1.1, 2.4.3, 2.4.7)
// ════════════════════════════════════════

export function validateKeyboard(html: string, css: string = ''): ValidatorIssue[] {
  const issues: ValidatorIssue[] = [];

  // Check for skip links
  if (!/<a[^>]*href=["']#(main|content|main-content)[^"']*["']/i.test(html)) {
    issues.push({
      type: 'keyboard_no_skip_link',
      element: '<body>',
      wcagCriteria: ['2.4.1'],
      severity: 'high',
      description: 'Missing skip navigation link for keyboard users',
      suggestedFix: 'Add <a href="#main" class="skip-link">Skip to main content</a>',
      autoFixable: true,
    });
  }

  // Interactive elements without keyboard access
  const onclickRegex = /<(div|span)[^>]*onclick[^>]*>/gi;
  let onclickMatch;
  while ((onclickMatch = onclickRegex.exec(html)) !== null) {
    const el = onclickMatch[0];
    if (!el.includes('tabindex') && !el.includes('role=')) {
      issues.push({
        type: 'keyboard_not_accessible',
        element: el.substring(0, 120),
        wcagCriteria: ['2.1.1', '4.1.2'],
        severity: 'critical',
        description: 'Interactive element not keyboard accessible',
        suggestedFix: 'Add tabindex="0" and appropriate role, or use <button>',
        autoFixable: true,
      });
    }
  }

  // Negative tabindex
  const negTabRegex = /tabindex=["']-(\d+)["']/gi;
  let negTabMatch;
  while ((negTabMatch = negTabRegex.exec(html)) !== null) {
    issues.push({
      type: 'keyboard_negative_tabindex',
      element: html.substring(Math.max(0, negTabMatch.index - 30), negTabMatch.index + 60).substring(0, 120),
      wcagCriteria: ['2.1.1'],
      severity: 'critical',
      description: 'Element has negative tabindex, unreachable by keyboard',
      suggestedFix: 'Remove negative tabindex or set to 0',
      autoFixable: true,
    });
  }

  // Focus styles removed
  if (css.includes('outline: none') || css.includes('outline:none') || css.includes('outline: 0')) {
    issues.push({
      type: 'keyboard_no_focus_style',
      element: '<style>',
      wcagCriteria: ['2.4.7'],
      severity: 'critical',
      description: 'Focus outline removed — keyboard users cannot see focus',
      suggestedFix: 'Replace outline:none with custom :focus-visible styles',
      autoFixable: false,
    });
  }

  return issues;
}

// ════════════════════════════════════════
// Media Validator (WCAG 1.2.1, 1.2.2, 1.4.5)
// ════════════════════════════════════════

export function validateMedia(html: string): ValidatorIssue[] {
  const issues: ValidatorIssue[] = [];

  // Video without captions
  const videos = extractElements(html, 'video');
  for (const video of videos) {
    if (!video.includes('kind="captions"') && !video.includes('kind="subtitles"')) {
      issues.push({
        type: 'media_video_no_captions',
        element: video.substring(0, 120),
        wcagCriteria: ['1.2.2'],
        severity: 'critical',
        description: 'Video missing captions',
        suggestedFix: 'Add <track kind="captions" src="captions.vtt" srclang="en">',
        autoFixable: false,
      });
    }
  }

  // Audio without transcript
  const audios = extractElements(html, 'audio');
  for (const audio of audios) {
    issues.push({
      type: 'media_audio_no_transcript',
      element: audio.substring(0, 120),
      wcagCriteria: ['1.2.1'],
      severity: 'critical',
      description: 'Audio element — ensure transcript is provided',
      suggestedFix: 'Provide a link to a text transcript near the audio player',
      autoFixable: false,
    });
  }

  return issues;
}

// ════════════════════════════════════════
// Structure Validator (WCAG 1.3.1, 2.4.2, 2.4.6, 3.1.1)
// ════════════════════════════════════════

export function validateStructure(html: string): ValidatorIssue[] {
  const issues: ValidatorIssue[] = [];

  // Heading hierarchy
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let prevLevel = 0;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    const level = parseInt(headingMatch[1]);
    const text = headingMatch[2].replace(/<[^>]*>/g, '').trim();

    if (!text) {
      issues.push({
        type: 'structure_empty_heading',
        element: headingMatch[0].substring(0, 80),
        wcagCriteria: ['2.4.6'],
        severity: 'critical',
        description: 'Heading element is empty',
        suggestedFix: 'Add descriptive text or remove the heading',
        autoFixable: false,
      });
    }

    if (prevLevel > 0 && level > prevLevel + 1) {
      issues.push({
        type: 'structure_skipped_heading',
        element: headingMatch[0].substring(0, 80),
        wcagCriteria: ['1.3.1'],
        severity: 'high',
        description: `Heading skips from <h${prevLevel}> to <h${level}>`,
        suggestedFix: `Use <h${prevLevel + 1}> instead to maintain hierarchy`,
        autoFixable: false,
      });
    }

    prevLevel = level;
  }

  // Missing lang
  if (!/<html[^>]*lang=/i.test(html)) {
    issues.push({
      type: 'structure_missing_lang',
      element: '<html>',
      wcagCriteria: ['3.1.1'],
      severity: 'critical',
      description: 'Missing lang attribute on <html> element',
      suggestedFix: 'Add lang="en" (or appropriate language code)',
      autoFixable: true,
    });
  }

  // Missing title
  if (!/<title[^>]*>[^<]+<\/title>/i.test(html)) {
    issues.push({
      type: 'structure_missing_title',
      element: '<head>',
      wcagCriteria: ['2.4.2'],
      severity: 'critical',
      description: 'Page missing <title> or title is empty',
      suggestedFix: 'Add descriptive <title> in <head>',
      autoFixable: true,
    });
  }

  return issues;
}

// ════════════════════════════════════════
// Image Validator (WCAG 1.1.1, 1.4.5, 1.4.9)
// ════════════════════════════════════════

const TEXT_IMAGE_PATTERNS = [/banner/i, /heading/i, /title/i, /logo.*text/i, /text.*image/i, /quote/i];
const COMPLEX_IMAGE_PATTERNS = [/chart/i, /graph/i, /diagram/i, /infographic/i, /flowchart/i, /visualization/i];

export function validateImages(html: string): ValidatorIssue[] {
  const issues: ValidatorIssue[] = [];
  const images = extractSelfClosing(html, 'img');

  for (const img of images) {
    const alt = extractAttr(img, 'alt');
    const src = extractAttr(img, 'src') || '';
    const ariaLabel = extractAttr(img, 'aria-label');
    const ariaHidden = extractAttr(img, 'aria-hidden');

    // Missing alt entirely
    if (alt === null && !ariaLabel && ariaHidden !== 'true') {
      issues.push({
        type: 'image_missing_alt',
        element: img.substring(0, 120),
        wcagCriteria: ['1.1.1'],
        severity: 'critical',
        description: `Image missing alt attribute: ${src.substring(0, 50)}`,
        suggestedFix: 'Add alt="" for decorative or descriptive alt text for meaningful images',
        autoFixable: true,
      });
    }

    // Functional image with empty alt (inside link/button)
    if (alt === '') {
      const imgIndex = html.indexOf(img);
      const surroundingContext = html.substring(Math.max(0, imgIndex - 100), imgIndex + img.length + 10);
      if (/<(a|button)[^>]*>/.test(surroundingContext)) {
        issues.push({
          type: 'image_functional_empty_alt',
          element: img.substring(0, 120),
          wcagCriteria: ['1.1.1'],
          severity: 'critical',
          description: 'Functional image (in link/button) has empty alt text',
          suggestedFix: 'Provide alt text describing the image function/purpose',
          autoFixable: false,
        });
      }
    }

    // Image of text detection
    const combined = (src + ' ' + (alt || '')).toLowerCase();
    if (TEXT_IMAGE_PATTERNS.some(p => p.test(combined))) {
      issues.push({
        type: 'image_of_text',
        element: img.substring(0, 120),
        wcagCriteria: ['1.4.5', '1.4.9'],
        severity: 'high',
        description: 'Image appears to contain text — use real HTML text instead',
        suggestedFix: 'Use CSS/HTML text instead of text in images',
        autoFixable: false,
      });
    }

    // Complex images without longdesc
    if (COMPLEX_IMAGE_PATTERNS.some(p => p.test(combined))) {
      if (!img.includes('longdesc') && !img.includes('aria-describedby')) {
        issues.push({
          type: 'image_complex_no_longdesc',
          element: img.substring(0, 120),
          wcagCriteria: ['1.1.1'],
          severity: 'high',
          description: 'Complex image lacks detailed description',
          suggestedFix: 'Add longdesc or aria-describedby for charts, diagrams, infographics',
          autoFixable: false,
        });
      }
    }
  }

  return issues;
}

// ════════════════════════════════════════
// Unified Runner
// ════════════════════════════════════════

/** Run all validators against HTML and return combined issues */
export function runAllValidators(html: string, css: string = ''): ValidatorIssue[] {
  return [
    ...validateAria(html),
    ...validateLinks(html),
    ...validateForms(html),
    ...validateKeyboard(html, css),
    ...validateMedia(html),
    ...validateStructure(html),
    ...validateImages(html),
  ];
}

/** Get validator stats */
export function getValidatorCoverage(): {
  validators: string[];
  wcagCriteriaCovered: string[];
  totalChecks: number;
} {
  return {
    validators: ['aria', 'link', 'form', 'keyboard', 'media', 'structure', 'image'],
    wcagCriteriaCovered: [
      '1.1.1', '1.2.1', '1.2.2', '1.3.1', '1.4.5', '1.4.9',
      '2.1.1', '2.4.1', '2.4.2', '2.4.3', '2.4.4', '2.4.6', '2.4.7', '2.4.9',
      '3.1.1', '3.3.2',
      '4.1.2',
    ],
    totalChecks: 20,
  };
}
