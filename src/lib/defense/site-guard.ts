/**
 * Defense Site Guard — Active bot detection for the live website
 * Lightweight client-side defense layer
 * 
 * Installs:
 * 1. Browser fingerprint collection (non-invasive)
 * 2. Behavioral signal tracking (mouse patterns, timing)
 * 3. Bot detection heuristics (headless browser, automation APIs)
 * 4. Report to substrate DEFENSE module
 */

import { supabase } from '@/integrations/supabase/client';

interface BotSignals {
  isBot: boolean;
  confidence: number;
  signals: string[];
  fingerprint: Record<string, unknown>;
}

/**
 * Collect browser fingerprint signals (non-invasive, no cookies)
 */
function collectFingerprint(): Record<string, unknown> {
  const nav = navigator as any;
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.length || 0,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    screenRes: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    webdriver: nav.webdriver || false,
    pdfViewerEnabled: nav.pdfViewerEnabled || false,
  };
}

/**
 * Run bot detection heuristics
 */
function detectBot(): BotSignals {
  const signals: string[] = [];
  let botScore = 0;
  const fingerprint = collectFingerprint();
  const nav = navigator as any;

  // 1. WebDriver flag (Selenium, Puppeteer, Playwright)
  if (nav.webdriver === true) {
    botScore += 40;
    signals.push('webdriver_detected');
  }

  // 2. Automation-related properties
  const automationKeys = [
    '__webdriver_evaluate', '__selenium_evaluate', '__fxdriver_evaluate',
    '__driver_evaluate', '__webdriver_unwrapped', '__driver_unwrapped',
    '__selenium_unwrapped', '_Selenium_IDE_Recorder', '_phantom', '__nightmare',
    'callPhantom', 'callSelenium', '_selenium', 'calledSelenium',
    'domAutomation', 'domAutomationController',
  ];
  
  for (const key of automationKeys) {
    if ((window as any)[key] || (document as any)[key]) {
      botScore += 30;
      signals.push(`automation_api:${key}`);
      break; // One is enough
    }
  }

  // 3. Headless browser detection
  if (!navigator.userAgent || navigator.userAgent.length < 20) {
    botScore += 25;
    signals.push('short_user_agent');
  }
  
  if (/HeadlessChrome|PhantomJS|Nightmare|Electron/i.test(navigator.userAgent)) {
    botScore += 35;
    signals.push('headless_ua');
  }

  // 4. Missing browser features that real browsers always have
  if (!(window as any).chrome && /Chrome/.test(navigator.userAgent)) {
    botScore += 15;
    signals.push('missing_chrome_object');
  }

  // 5. Permissions API anomaly
  if (!navigator.permissions) {
    botScore += 10;
    signals.push('no_permissions_api');
  }

  // 6. Plugin count (real browsers usually have plugins)
  if (navigator.plugins && navigator.plugins.length === 0 && !/Mobile|Android|iPhone/i.test(navigator.userAgent)) {
    botScore += 10;
    signals.push('no_plugins');
  }

  // 7. Screen resolution anomalies
  if (screen.width === 0 || screen.height === 0) {
    botScore += 20;
    signals.push('zero_screen');
  }

  // 8. Language anomaly
  if (!navigator.language) {
    botScore += 15;
    signals.push('no_language');
  }

  // 9. Connection type (bots often have no connection info)
  const conn = (nav as any).connection;
  if (!conn && !/iPhone|iPad/i.test(navigator.userAgent)) {
    // Not a signal for iOS which doesn't support this
    botScore += 5;
    signals.push('no_connection_api');
  }

  const confidence = Math.min(1, botScore / 100);
  
  return {
    isBot: botScore >= 50,
    confidence,
    signals,
    fingerprint,
  };
}

/**
 * Report bot detection to the DEFENSE module (via database)
 */
async function reportDetection(result: BotSignals): Promise<void> {
  if (!result.isBot && result.confidence < 0.3) return; // Only report suspicious activity
  
  try {
    await supabase.from('defense_events').insert({
      ip: 'client-side', // Real IP determined server-side
      action: result.isBot ? 'block' : 'monitor',
      risk_score: Math.round(result.confidence * 100),
      endpoint: window.location.pathname,
      user_agent: navigator.userAgent,
      reason: result.signals.join(', ') || 'behavioral_analysis',
      fingerprint_hash: hashFingerprint(result.fingerprint),
      session_id: getSessionId(),
      metadata: {
        detection_source: 'site-guard',
        signals: result.signals,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    // Silent fail — defense logging should never break the site
  }
}

/**
 * Simple hash for fingerprint (not cryptographic, just for grouping)
 */
function hashFingerprint(fp: Record<string, unknown>): string {
  const str = JSON.stringify(fp);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

/**
 * Get or create a session ID for this visit
 */
function getSessionId(): string {
  const key = 'pf_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ─── Behavioral Tracking (passive) ───

let mouseMovements = 0;
let keyPresses = 0;
let scrollEvents = 0;

function trackBehavior(): void {
  const handler = () => { mouseMovements++; };
  const keyHandler = () => { keyPresses++; };
  const scrollHandler = () => { scrollEvents++; };
  
  document.addEventListener('mousemove', handler, { passive: true });
  document.addEventListener('keydown', keyHandler, { passive: true });
  document.addEventListener('scroll', scrollHandler, { passive: true });
  
  // After 10 seconds, check behavioral signals
  setTimeout(() => {
    const noInteraction = mouseMovements === 0 && keyPresses === 0 && scrollEvents === 0;
    if (noInteraction) {
      // User loaded page but had zero interaction — might be a scraper
      reportDetection({
        isBot: false,
        confidence: 0.3,
        signals: ['no_interaction_10s'],
        fingerprint: collectFingerprint(),
      });
    }
    
    // Cleanup
    document.removeEventListener('mousemove', handler);
    document.removeEventListener('keydown', keyHandler);
    document.removeEventListener('scroll', scrollHandler);
  }, 10000);
}

// ─── Public API ───

/**
 * Install the defense site guard on the live website
 * Call once at app initialization
 */
export function installSiteGuard(): (() => void) | undefined {
  // Don't install in development or in the editor preview
  if (import.meta.env.DEV) {
    console.log('[SiteGuard] Skipping — development mode');
    return;
  }

  // Run initial bot detection
  const result = detectBot();
  
  if (result.isBot || result.confidence >= 0.3) {
    console.warn(`[SiteGuard] Suspicious activity detected (confidence: ${(result.confidence * 100).toFixed(0)}%):`, result.signals);
    reportDetection(result);
  }
  
  // Start behavioral tracking
  trackBehavior();
  
  // Periodic re-check (every 60 seconds)
  const interval = setInterval(() => {
    const recheck = detectBot();
    if (recheck.confidence > 0.5) {
      reportDetection(recheck);
    }
  }, 60000);
  
  return () => clearInterval(interval);
}
