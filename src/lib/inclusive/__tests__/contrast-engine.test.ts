/**
 * INCLUSIVE Contrast Engine — Unit Tests
 * Gap Analysis P0: Core test suite scaffolding
 */

import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  getContrastRatio,
  hexToRgb,
  parseRgb,
  hslToRgb,
  parseColor,
  meetsWCAG,
  checkContrast,
  suggestAccessibleColor,
  rgbToHex,
  scanContrastIssues,
} from '../contrast-engine';

describe('INCLUSIVE Contrast Engine', () => {
  describe('getLuminance', () => {
    it('returns 0 for black', () => {
      expect(getLuminance(0, 0, 0)).toBe(0);
    });
    it('returns 1 for white', () => {
      expect(getLuminance(255, 255, 255)).toBeCloseTo(1, 4);
    });
    it('returns mid-range for gray', () => {
      const lum = getLuminance(128, 128, 128);
      expect(lum).toBeGreaterThan(0.2);
      expect(lum).toBeLessThan(0.3);
    });
  });

  describe('getContrastRatio', () => {
    it('returns 21:1 for black on white', () => {
      expect(getContrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 0);
    });
    it('returns 1:1 for same colors', () => {
      expect(getContrastRatio([100, 100, 100], [100, 100, 100])).toBe(1);
    });
    it('is symmetric', () => {
      const a: [number, number, number] = [255, 0, 0];
      const b: [number, number, number] = [0, 0, 255];
      expect(getContrastRatio(a, b)).toBe(getContrastRatio(b, a));
    });
  });

  describe('hexToRgb', () => {
    it('parses 6-char hex', () => {
      expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    });
    it('parses 3-char hex', () => {
      expect(hexToRgb('#f00')).toEqual([255, 0, 0]);
    });
    it('returns null for invalid', () => {
      expect(hexToRgb('xyz')).toBeNull();
    });
  });

  describe('parseRgb', () => {
    it('parses rgb()', () => {
      expect(parseRgb('rgb(128, 64, 32)')).toEqual([128, 64, 32]);
    });
    it('parses rgba()', () => {
      expect(parseRgb('rgba(255, 128, 0, 0.5)')).toEqual([255, 128, 0]);
    });
  });

  describe('hslToRgb', () => {
    it('converts pure red', () => {
      expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
    });
    it('converts white', () => {
      expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]);
    });
    it('converts black', () => {
      expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
    });
  });

  describe('parseColor', () => {
    it('parses named colors', () => {
      expect(parseColor('white')).toEqual([255, 255, 255]);
      expect(parseColor('black')).toEqual([0, 0, 0]);
    });
    it('parses hex', () => {
      expect(parseColor('#00ff00')).toEqual([0, 255, 0]);
    });
    it('parses rgb', () => {
      expect(parseColor('rgb(10, 20, 30)')).toEqual([10, 20, 30]);
    });
    it('returns null for garbage', () => {
      expect(parseColor('notacolor')).toBeNull();
    });
  });

  describe('meetsWCAG', () => {
    it('AA normal requires 4.5:1', () => {
      expect(meetsWCAG(4.5, 'AA', 'normal')).toBe(true);
      expect(meetsWCAG(4.4, 'AA', 'normal')).toBe(false);
    });
    it('AA large requires 3:1', () => {
      expect(meetsWCAG(3, 'AA', 'large')).toBe(true);
      expect(meetsWCAG(2.9, 'AA', 'large')).toBe(false);
    });
    it('AAA normal requires 7:1', () => {
      expect(meetsWCAG(7, 'AAA', 'normal')).toBe(true);
      expect(meetsWCAG(6.9, 'AAA', 'normal')).toBe(false);
    });
  });

  describe('checkContrast', () => {
    it('grades black/white as AAA', () => {
      const result = checkContrast('black', 'white');
      expect(result).not.toBeNull();
      expect(result!.grade).toBe('AAA');
    });
    it('returns null for invalid colors', () => {
      expect(checkContrast('invalid', 'white')).toBeNull();
    });
  });

  describe('suggestAccessibleColor', () => {
    it('returns none needed when already passing', () => {
      const result = suggestAccessibleColor('black', 'white');
      expect(result).not.toBeNull();
      expect(result!.adjustment).toBe('none needed');
    });
    it('suggests darker foreground on light background', () => {
      const result = suggestAccessibleColor('#999999', '#ffffff');
      expect(result).not.toBeNull();
      expect(result!.ratio).toBeGreaterThanOrEqual(4.5);
    });
    it('suggests lighter foreground on dark background', () => {
      const result = suggestAccessibleColor('#555555', '#000000');
      expect(result).not.toBeNull();
      expect(result!.ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('rgbToHex', () => {
    it('converts to lowercase hex', () => {
      expect(rgbToHex([255, 0, 128])).toBe('#ff0080');
    });
  });

  describe('scanContrastIssues', () => {
    it('detects low contrast in inline styles', () => {
      const html = '<p style="color: #aaa; background-color: #bbb;">Low contrast</p>';
      const issues = scanContrastIssues(html);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe('insufficient_contrast');
    });
    it('returns no issues for good contrast', () => {
      const html = '<p style="color: #000; background-color: #fff;">Good contrast</p>';
      const issues = scanContrastIssues(html);
      expect(issues).toHaveLength(0);
    });
  });
});
