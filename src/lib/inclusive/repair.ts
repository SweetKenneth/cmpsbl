/**
 * INCLUSIVE Repair Engine
 * v8.0.0 SYNERGY+ — 14th Substrate Module
 * @origin(cmptbl) — Fix patterns from archived utilities
 * 
 * Developed by PromptFluid® as part of the CMPSBL cognitive orchestration substrate.
 */

import type { InclusiveIssue, InclusiveRepair } from './types';

/**
 * Auto-repair accessibility issues in HTML
 */
export function repairHTML(html: string, issues: InclusiveIssue[]): { html: string; repairs: InclusiveRepair[] } {
  let repairedHtml = html;
  const repairs: InclusiveRepair[] = [];

  for (const issue of issues) {
    if (!issue.auto_fixable) continue;

    const result = applyRepair(repairedHtml, issue);
    if (result.applied) {
      repairedHtml = result.html;
      repairs.push({
        issue_id: issue.id,
        wcag_criterion: issue.wcag_criterion,
        original: result.original,
        fixed: result.fixed,
        explanation: result.explanation,
        auto_applied: true,
      });
    }
  }

  return { html: repairedHtml, repairs };
}

interface RepairResult {
  applied: boolean;
  html: string;
  original: string;
  fixed: string;
  explanation: string;
}

/**
 * Apply single repair based on issue type
 */
function applyRepair(html: string, issue: InclusiveIssue): RepairResult {
  switch (issue.type) {
    case 'missing-lang':
      return repairMissingLang(html);
    case 'missing-h1':
      return repairMissingH1(html);
    case 'multiple-h1':
      return repairMultipleH1(html);
    case 'missing-main':
      return repairMissingMain(html);
    case 'missing-title':
      return repairMissingTitle(html);
    case 'missing-skip-link':
      return repairMissingSkipLink(html);
    default:
      return { applied: false, html, original: '', fixed: '', explanation: 'No auto-fix available' };
  }
}

/**
 * Add lang attribute to html element
 */
function repairMissingLang(html: string): RepairResult {
  if (html.match(/<html[^>]*lang=/i)) {
    return { applied: false, html, original: '', fixed: '', explanation: 'Already has lang attribute' };
  }

  const original = html.match(/<html[^>]*>/i)?.[0] || '<html>';
  const fixed = original.replace(/<html/i, '<html lang="en"');
  const repairedHtml = html.replace(/<html/i, '<html lang="en"');

  return {
    applied: true,
    html: repairedHtml,
    original,
    fixed,
    explanation: 'Added lang="en" to <html> element for screen reader language detection',
  };
}

/**
 * Add H1 heading if missing
 */
function repairMissingH1(html: string): RepairResult {
  // Find title or first meaningful content
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const h1Content = titleMatch?.[1] || 'Page Title';
  
  // Insert after opening body tag
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (!bodyMatch) {
    return { applied: false, html, original: '', fixed: '', explanation: 'No body tag found' };
  }

  const original = bodyMatch[0];
  const fixed = `${original}\n<h1>${h1Content}</h1>`;
  const repairedHtml = html.replace(bodyMatch[0], fixed);

  return {
    applied: true,
    html: repairedHtml,
    original,
    fixed,
    explanation: `Added <h1>${h1Content}</h1> for document hierarchy`,
  };
}

/**
 * Convert extra H1s to H2s
 */
function repairMultipleH1(html: string): RepairResult {
  let h1Count = 0;
  let original = '';
  let fixed = '';

  const repairedHtml = html.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, (match, attrs, content) => {
    h1Count++;
    if (h1Count === 1) {
      return match; // Keep first H1
    }
    if (!original) original = match;
    const replacement = `<h2${attrs}>${content}</h2>`;
    if (!fixed) fixed = replacement;
    return replacement;
  });

  if (h1Count <= 1) {
    return { applied: false, html, original: '', fixed: '', explanation: 'Only one H1 found' };
  }

  return {
    applied: true,
    html: repairedHtml,
    original,
    fixed,
    explanation: `Converted ${h1Count - 1} extra H1 heading(s) to H2 for proper hierarchy`,
  };
}

/**
 * Add main landmark wrapper
 */
function repairMissingMain(html: string): RepairResult {
  if (html.includes('<main') || html.includes('role="main"')) {
    return { applied: false, html, original: '', fixed: '', explanation: 'Main landmark already exists' };
  }

  // Find content area (after header, before footer, or main body content)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) {
    return { applied: false, html, original: '', fixed: '', explanation: 'No body content found' };
  }

  // Simple: wrap body content with main if no header/footer structure
  const original = bodyMatch[1].substring(0, 50) + '...';
  const fixed = '<main>' + bodyMatch[1] + '</main>';
  
  return {
    applied: true,
    html: html.replace(bodyMatch[1], fixed),
    original,
    fixed: '<main>...</main>',
    explanation: 'Wrapped content in <main> landmark for assistive technology navigation',
  };
}

/**
 * Add page title
 */
function repairMissingTitle(html: string): RepairResult {
  if (html.match(/<title[^>]*>[^<]+<\/title>/i)) {
    return { applied: false, html, original: '', fixed: '', explanation: 'Title already exists' };
  }

  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  const titleContent = h1Match?.[1] || 'Page Title';

  const headMatch = html.match(/<head[^>]*>/i);
  if (!headMatch) {
    return { applied: false, html, original: '', fixed: '', explanation: 'No head tag found' };
  }

  const original = headMatch[0];
  const fixed = `${headMatch[0]}\n<title>${titleContent}</title>`;
  const repairedHtml = html.replace(headMatch[0], fixed);

  return {
    applied: true,
    html: repairedHtml,
    original,
    fixed,
    explanation: `Added <title>${titleContent}</title> for page identification`,
  };
}

/**
 * Add skip navigation link
 */
function repairMissingSkipLink(html: string): RepairResult {
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (!bodyMatch) {
    return { applied: false, html, original: '', fixed: '', explanation: 'No body tag found' };
  }

  const original = bodyMatch[0];
  const skipLink = '<a href="#main-content" class="skip-link">Skip to main content</a>';
  const fixed = `${bodyMatch[0]}\n${skipLink}`;
  const repairedHtml = html.replace(bodyMatch[0], fixed);

  return {
    applied: true,
    html: repairedHtml,
    original,
    fixed,
    explanation: 'Added skip navigation link for keyboard users',
  };
}
