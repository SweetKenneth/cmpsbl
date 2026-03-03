/**
 * INCLUSIVE Validators — Unit Tests
 * Gap Analysis P0: Core test suite scaffolding
 */

import { describe, it, expect } from 'vitest';
import {
  validateAria,
  validateLinks,
  validateForms,
  validateKeyboard,
  validateMedia,
  validateStructure,
  validateImages,
  runAllValidators,
} from '../validators';

// Minimal HTML fixtures
const goodHtml = `
<html lang="en">
<head><title>Test</title></head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <nav aria-label="Main">
    <a href="/about">About Us</a>
  </nav>
  <main id="main">
    <h1>Page Title</h1>
    <h2>Section</h2>
    <img src="logo.png" alt="Company logo" />
    <form>
      <label for="email">Email</label>
      <input id="email" type="email" />
    </form>
    <video><track kind="captions" src="c.vtt" /></video>
  </main>
</body>
</html>
`;

const badHtml = `
<html>
<body>
  <div role="invalid_role">Test</div>
  <a href="/page">Click here</a>
  <a href="/more">Read more</a>
  <img src="photo.jpg" />
  <h1>First</h1>
  <h3>Skipped h2</h3>
  <form><input type="text" /></form>
  <video src="v.mp4"></video>
</body>
</html>
`;

describe('INCLUSIVE Validators', () => {
  describe('validateAria', () => {
    it('passes for valid ARIA roles', () => {
      const issues = validateAria(goodHtml);
      const ariaIssues = issues.filter(i => i.wcagCriteria?.includes('4.1.2'));
      expect(ariaIssues).toHaveLength(0);
    });
    it('detects invalid ARIA roles', () => {
      const issues = validateAria(badHtml);
      expect(issues.some(i => i.type === 'invalid_aria_role')).toBe(true);
    });
  });

  describe('validateLinks', () => {
    it('detects generic link text', () => {
      const issues = validateLinks(badHtml);
      expect(issues.some(i => i.type === 'link_generic_text')).toBe(true);
    });
  });

  describe('validateImages', () => {
    it('detects missing alt text', () => {
      const issues = validateImages(badHtml);
      expect(issues.some(i => i.type === 'image_missing_alt')).toBe(true);
    });
    it('passes for images with alt', () => {
      const issues = validateImages(goodHtml);
      expect(issues.filter(i => i.type === 'image_missing_alt')).toHaveLength(0);
    });
  });

  describe('validateStructure (headings)', () => {
    it('detects skipped heading levels', () => {
      const issues = validateStructure(badHtml);
      expect(issues.some(i => i.type === 'structure_skipped_heading')).toBe(true);
    });
  });

  describe('validateForms', () => {
    it('detects inputs without labels', () => {
      const issues = validateForms(badHtml);
      expect(issues.some(i => i.type === 'form_missing_label')).toBe(true);
    });
  });

  describe('validateMedia', () => {
    it('detects videos without captions', () => {
      const issues = validateMedia(badHtml);
      expect(issues.some(i => i.type === 'media_video_no_captions')).toBe(true);
    });
  });

  describe('validateKeyboard', () => {
    it('detects missing skip link', () => {
      const issues = validateKeyboard(badHtml);
      expect(issues.some(i => i.type === 'keyboard_no_skip_link')).toBe(true);
    });
  });

  describe('runAllValidators', () => {
    it('returns combined issues from all validators', () => {
      const issues = runAllValidators(badHtml);
      expect(issues.length).toBeGreaterThan(3);
    });
    it('returns few/no issues for well-structured HTML', () => {
      const issues = runAllValidators(goodHtml);
      expect(issues.length).toBeLessThan(3);
    });
  });
});
