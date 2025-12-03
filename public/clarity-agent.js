/**
 * PromptFluid Clarity v4.1.0 - Universal Accessibility Agent
 * AI-Powered WCAG 2.2 Scanner & Auto-Fix Engine
 * 
 * Usage:
 * <script src="https://[your-supabase-url]/storage/v1/object/public/clarity-agent/clarity-agent.js"></script>
 * <script>
 *   PromptFluidClarity.init({
 *     siteKey: 'your-install-key',
 *     apiUrl: 'https://[your-supabase-url]/functions/v1',
 *     autoFix: true,
 *     wcagLevel: 'AA'
 *   });
 * </script>
 */

(function() {
  'use strict';

  const VERSION = '4.1.0';
  
  // Core configuration
  let config = {
    siteKey: null,
    apiUrl: null,
    autoFix: false,
    wcagLevel: 'AA',
    scanOnLoad: true,
    visualIndicators: true,
    reportEndpoint: null,
  };

  // Issue storage
  let detectedIssues = [];
  let appliedFixes = [];

  /**
   * Initialize Clarity Agent
   */
  function init(options) {
    config = { ...config, ...options };

    if (!config.siteKey || !config.apiUrl) {
      console.error('[Clarity] Missing required config: siteKey and apiUrl');
      return;
    }

    console.log(`[Clarity v${VERSION}] Initializing...`);

    if (config.scanOnLoad) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runScan);
      } else {
        runScan();
      }
    }

    // Expose API
    window.PromptFluidClarity = {
      ...window.PromptFluidClarity,
      scan: runScan,
      getIssues: () => detectedIssues,
      getFixes: () => appliedFixes,
      version: VERSION,
    };
  }

  /**
   * Run accessibility scan
   */
  async function runScan() {
    console.log('[Clarity] Starting scan...');
    detectedIssues = [];

    // Run all WCAG checks
    checkImages();
    checkForms();
    checkHeadings();
    checkLanguage();
    checkKeyboardAccess();
    checkContrast();
    checkAudio();
    checkVideo();

    console.log(`[Clarity] Found ${detectedIssues.length} issues`);

    // Auto-fix if enabled
    if (config.autoFix && detectedIssues.length > 0) {
      await applyFixes();
    }

    // Report to backend
    if (config.reportEndpoint || config.apiUrl) {
      await reportResults();
    }

    return detectedIssues;
  }

  /**
   * Check images for alt text (WCAG 1.1.1)
   */
  function checkImages() {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        detectedIssues.push({
          wcag_criterion: '1.1.1',
          severity: 'critical',
          issue_type: 'missing_alt_text',
          element: img,
          auto_fixable: true,
        });
      }
    });
  }

  /**
   * Check form inputs for labels (WCAG 3.3.2)
   */
  function checkForms() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      const hasLabel = input.hasAttribute('aria-label') || 
                      input.hasAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel && input.type !== 'hidden' && input.type !== 'submit') {
        detectedIssues.push({
          wcag_criterion: '3.3.2',
          severity: 'critical',
          issue_type: 'input_missing_label',
          element: input,
          auto_fixable: true,
        });
      }
    });
  }

  /**
   * Check heading hierarchy (WCAG 2.4.6)
   */
  function checkHeadings() {
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      detectedIssues.push({
        wcag_criterion: '2.4.6',
        severity: 'warning',
        issue_type: 'missing_h1',
        auto_fixable: false,
      });
    } else if (h1s.length > 1) {
      h1s.forEach((h1, index) => {
        if (index > 0) {
          detectedIssues.push({
            wcag_criterion: '2.4.6',
            severity: 'warning',
            issue_type: 'multiple_h1',
            element: h1,
            auto_fixable: true,
          });
        }
      });
    }
  }

  /**
   * Check language attribute (WCAG 3.1.1)
   */
  function checkLanguage() {
    const html = document.documentElement;
    if (!html.hasAttribute('lang')) {
      detectedIssues.push({
        wcag_criterion: '3.1.1',
        severity: 'critical',
        issue_type: 'missing_lang_attribute',
        element: html,
        auto_fixable: true,
      });
    }
  }

  /**
   * Check keyboard accessibility (WCAG 2.1.1)
   */
  function checkKeyboardAccess() {
    const interactive = document.querySelectorAll('[onclick], [onkeydown]');
    interactive.forEach((elem) => {
      const isNativeInteractive = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(elem.tagName);
      if (!isNativeInteractive && !elem.hasAttribute('tabindex')) {
        detectedIssues.push({
          wcag_criterion: '2.1.1',
          severity: 'critical',
          issue_type: 'non_keyboard_accessible',
          element: elem,
          auto_fixable: true,
        });
      }
    });
  }

  /**
   * Check color contrast (WCAG 1.4.3) - simplified
   */
  function checkContrast() {
    // Note: Full contrast checking requires computed styles and luminance calculations
    // This is a placeholder for backend processing
    detectedIssues.push({
      wcag_criterion: '1.4.3',
      severity: 'info',
      issue_type: 'contrast_check_required',
      auto_fixable: false,
      message: 'Manual contrast verification recommended',
    });
  }

  /**
   * Check audio controls (WCAG 1.4.2)
   */
  function checkAudio() {
    const audio = document.querySelectorAll('audio[autoplay]');
    audio.forEach((elem) => {
      if (!elem.hasAttribute('controls')) {
        detectedIssues.push({
          wcag_criterion: '1.4.2',
          severity: 'critical',
          issue_type: 'autoplay_no_controls',
          element: elem,
          auto_fixable: true,
        });
      }
    });
  }

  /**
   * Check video captions (WCAG 1.2.2)
   */
  function checkVideo() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      const hasTrack = video.querySelector('track[kind="captions"]');
      if (!hasTrack) {
        detectedIssues.push({
          wcag_criterion: '1.2.2',
          severity: 'critical',
          issue_type: 'missing_video_captions',
          element: video,
          auto_fixable: false,
        });
      }
    });
  }

  /**
   * Apply auto-fixes for fixable issues
   */
  async function applyFixes() {
    console.log('[Clarity] Applying auto-fixes...');
    
    detectedIssues.forEach((issue) => {
      if (!issue.auto_fixable || !issue.element) return;

      switch (issue.issue_type) {
        case 'missing_alt_text':
          issue.element.setAttribute('alt', 'Decorative image');
          appliedFixes.push({ issue, fix: 'Added alt text' });
          break;

        case 'input_missing_label':
          issue.element.setAttribute('aria-label', 'Input field');
          appliedFixes.push({ issue, fix: 'Added aria-label' });
          break;

        case 'multiple_h1':
          const h2 = document.createElement('h2');
          h2.innerHTML = issue.element.innerHTML;
          h2.className = issue.element.className;
          issue.element.replaceWith(h2);
          appliedFixes.push({ issue, fix: 'Converted H1 to H2' });
          break;

        case 'missing_lang_attribute':
          issue.element.setAttribute('lang', 'en');
          appliedFixes.push({ issue, fix: 'Added lang="en"' });
          break;

        case 'non_keyboard_accessible':
          issue.element.setAttribute('tabindex', '0');
          appliedFixes.push({ issue, fix: 'Added tabindex' });
          break;

        case 'autoplay_no_controls':
          issue.element.setAttribute('controls', 'controls');
          appliedFixes.push({ issue, fix: 'Added controls' });
          break;
      }
    });

    console.log(`[Clarity] Applied ${appliedFixes.length} fixes`);
  }

  /**
   * Report results to backend
   */
  async function reportResults() {
    const endpoint = config.reportEndpoint || `${config.apiUrl}/pf-clarity-scan`;
    
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_key: config.siteKey,
          url: window.location.href,
          wcag_level: config.wcagLevel,
          issues: detectedIssues.map(i => ({
            ...i,
            element: i.element ? i.element.outerHTML?.substring(0, 200) : null,
          })),
          fixes: appliedFixes.length,
          agent_version: VERSION,
          timestamp: new Date().toISOString(),
        }),
      });
      
      console.log('[Clarity] Results reported successfully');
    } catch (error) {
      console.error('[Clarity] Failed to report results:', error);
    }
  }

  // Expose init globally
  window.PromptFluidClarity = {
    init,
    version: VERSION,
  };

  console.log(`[Clarity v${VERSION}] Agent loaded. Call PromptFluidClarity.init() to start.`);
})();
