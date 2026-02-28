/**
 * Performance Budget Plugin for Vite
 * Item #24: Fail build if JS bundle exceeds threshold
 */

import type { Plugin } from 'vite';

interface PerformanceBudgetConfig {
  /** Max initial JS bundle size in KB (default: 500) */
  maxInitialJs?: number;
  /** Max single chunk size in KB (default: 300) */
  maxChunkSize?: number;
  /** Max total CSS size in KB (default: 150) */
  maxCss?: number;
  /** Whether to fail the build or just warn (default: 'warn') */
  mode?: 'warn' | 'error';
}

export function performanceBudget(config: PerformanceBudgetConfig = {}): Plugin {
  const {
    maxInitialJs = 500,
    maxChunkSize = 300,
    maxCss = 150,
    mode = 'warn',
  } = config;

  return {
    name: 'vite-performance-budget',
    apply: 'build',

    generateBundle(_options, bundle) {
      const violations: string[] = [];
      let totalJs = 0;
      let totalCss = 0;

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const sizeKB = ('code' in chunk ? chunk.code.length : ('source' in chunk ? (chunk.source as string).length : 0)) / 1024;

        if (fileName.endsWith('.js')) {
          totalJs += sizeKB;
          if (sizeKB > maxChunkSize) {
            violations.push(`⚠ Chunk "${fileName}" is ${sizeKB.toFixed(1)}KB (budget: ${maxChunkSize}KB)`);
          }
        }

        if (fileName.endsWith('.css')) {
          totalCss += sizeKB;
        }
      }

      if (totalJs > maxInitialJs) {
        violations.push(`⚠ Total JS: ${totalJs.toFixed(1)}KB exceeds budget of ${maxInitialJs}KB`);
      }

      if (totalCss > maxCss) {
        violations.push(`⚠ Total CSS: ${totalCss.toFixed(1)}KB exceeds budget of ${maxCss}KB`);
      }

      if (violations.length > 0) {
        const report = `\n📊 Performance Budget Report:\n${violations.join('\n')}\n`;
        if (mode === 'error') {
          this.error(report);
        } else {
          this.warn(report);
        }
      } else {
        console.log(`\n✅ Performance budget passed (JS: ${totalJs.toFixed(0)}KB/${maxInitialJs}KB, CSS: ${totalCss.toFixed(0)}KB/${maxCss}KB)\n`);
      }
    },
  };
}
