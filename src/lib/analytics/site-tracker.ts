/**
 * Site Analytics Tracker — Human-Only, Owner-Excluded
 * Collects real visitor data: pages, time, scroll, device, referrer, fingerprint.
 * Filters bots client-side before sending. Owner IP excluded server-side.
 */

import { supabase } from '@/integrations/supabase/client';
import { isEditorPreviewEnv } from '@/lib/system/isLovableEditorPreviewEnv';

// ─── Bot Detection ───────────────────────────────────────────────────
const BOT_UA_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scrape/i, /headless/i, /phantom/i,
  /selenium/i, /puppeteer/i, /playwright/i, /wget/i, /curl/i,
  /python/i, /java\//i, /http/i, /fetch/i, /axios/i, /node/i,
  /go-http/i, /ruby/i, /perl/i, /libwww/i, /apache/i, /nutch/i,
  /slurp/i, /mediapartners/i, /adsbot/i, /googlebot/i, /bingbot/i,
  /yandex/i, /baidu/i, /duckduck/i, /facebot/i, /ia_archiver/i,
  /archive\.org/i, /semrush/i, /ahrefs/i, /mj12bot/i, /dotbot/i,
  /petalbot/i, /bytespider/i, /gptbot/i, /claudebot/i, /ccbot/i,
  /dataprovider/i, /zoominfobot/i, /ltx71/i, /censys/i, /zgrab/i,
  /masscan/i, /nmap/i, /nikto/i, /sqlmap/i, /burp/i,
  /applebot/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i,
  /telegrambot/i, /discordbot/i, /slack/i, /embedly/i,
  /preview/i, /snippet/i, /thumbnail/i, /lighthouse/i,
  /pagespeed/i, /gtmetrix/i, /pingdom/i, /uptimerobot/i,
  /statuspage/i, /monitor/i, /check/i, /probe/i, /scan/i,
];

function isBot(): boolean {
  const ua = navigator.userAgent;
  if (!ua || ua.length < 20) return true;
  if (BOT_UA_PATTERNS.some(p => p.test(ua))) return true;
  // Headless detection
  if ((navigator as any).webdriver) return true;
  if (!(window as any).chrome && /Chrome/.test(ua) && !/Mobile/.test(ua)) return true;
  if (navigator.languages?.length === 0) return true;
  if (!navigator.plugins || navigator.plugins.length === 0) {
    // Some headless browsers have no plugins - but mobile also has none
    // Only flag if desktop UA claims plugins
    if (/Windows|Macintosh|Linux/.test(ua) && !/Mobile|Android/.test(ua)) return true;
  }
  return false;
}

// ─── Fingerprint Generation ─────────────────────────────────────────
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
    navigator.maxTouchPoints || 0,
    navigator.platform,
  ];
  // Simple hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fp_' + Math.abs(hash).toString(36);
}

// ─── Device / Browser Parsing ───────────────────────────────────────
function parseUA() {
  const ua = navigator.userAgent;
  let browser = 'Unknown', browserVersion = '', os = 'Unknown', osVersion = '';
  
  if (/Edg\/(\d+)/.test(ua)) { browser = 'Edge'; browserVersion = RegExp.$1; }
  else if (/OPR\/(\d+)/.test(ua)) { browser = 'Opera'; browserVersion = RegExp.$1; }
  else if (/Chrome\/(\d+)/.test(ua)) { browser = 'Chrome'; browserVersion = RegExp.$1; }
  else if (/Firefox\/(\d+)/.test(ua)) { browser = 'Firefox'; browserVersion = RegExp.$1; }
  else if (/Safari\/(\d+)/.test(ua) && /Version\/(\d+)/.test(ua)) { browser = 'Safari'; browserVersion = RegExp.$1; }
  
  if (/Windows NT ([\d.]+)/.test(ua)) { os = 'Windows'; osVersion = RegExp.$1; }
  else if (/Mac OS X ([\d_]+)/.test(ua)) { os = 'macOS'; osVersion = RegExp.$1.replace(/_/g, '.'); }
  else if (/Android ([\d.]+)/.test(ua)) { os = 'Android'; osVersion = RegExp.$1; }
  else if (/iPhone OS ([\d_]+)/.test(ua)) { os = 'iOS'; osVersion = RegExp.$1.replace(/_/g, '.'); }
  else if (/Linux/.test(ua)) { os = 'Linux'; }
  else if (/CrOS/.test(ua)) { os = 'ChromeOS'; }

  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
  const isTablet = /iPad|Tablet|PlayBook/.test(ua) || (isMobile && Math.min(screen.width, screen.height) > 600);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  return { browser, browserVersion, os, osVersion, deviceType };
}

function parseReferrer() {
  const ref = document.referrer;
  if (!ref) return { referrer: null, referrerDomain: null };
  try {
    const url = new URL(ref);
    // Don't count self-referrals
    if (url.hostname === window.location.hostname) return { referrer: null, referrerDomain: null };
    return { referrer: ref, referrerDomain: url.hostname };
  } catch {
    return { referrer: ref, referrerDomain: null };
  }
}

function getUTM() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
}

function getConnectionType(): string | null {
  const conn = (navigator as any).connection;
  return conn?.effectiveType || null;
}

// ─── Session Management ─────────────────────────────────────────────
const SESSION_KEY = 'pf_analytics_sid';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

function getOrCreateSession(): { sessionId: string; isNew: boolean } {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const { id, ts } = JSON.parse(stored);
      if (Date.now() - ts < SESSION_TIMEOUT) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: Date.now() }));
        return { sessionId: id, isNew: false };
      }
    }
  } catch {}
  const id = 'ses_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: Date.now() }));
  return { sessionId: id, isNew: true };
}

// ─── Tracker State ──────────────────────────────────────────────────
let currentPageViewId: string | null = null;
let pageEnterTime = 0;
let maxScrollDepth = 0;
let isTracking = false;

function trackScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  ) - window.innerHeight;
  if (docHeight > 0) {
    const pct = Math.round((scrollTop / docHeight) * 100);
    if (pct > maxScrollDepth) maxScrollDepth = pct;
  }
}

async function sendTimeOnPage() {
  if (!currentPageViewId || !pageEnterTime) return;
  const duration = Date.now() - pageEnterTime;
  if (duration < 500) return; // Skip sub-second views
  
  try {
    await supabase
      .from('site_page_views')
      .update({
        time_on_page_ms: duration,
        scroll_depth_pct: maxScrollDepth,
        is_bounce: false,
      })
      .eq('id', currentPageViewId);
    
    // Update session
    const { sessionId } = getOrCreateSession();
    await supabase
      .from('site_sessions')
      .update({
        total_duration_ms: duration,
        last_page: window.location.pathname,
        ended_at: new Date().toISOString(),
        is_bounce: false,
      })
      .eq('id', sessionId);
  } catch {}
}

// ─── Main Track Function ────────────────────────────────────────────
async function trackPageView() {
  if (isEditorPreviewEnv()) return;
  if (isBot()) return;
  
  // Send time for previous page
  await sendTimeOnPage();
  
  const { sessionId, isNew } = getOrCreateSession();
  const fingerprint = generateFingerprint();
  const { browser, browserVersion, os, osVersion, deviceType } = parseUA();
  const { referrer, referrerDomain } = parseReferrer();
  const utm = getUTM();
  
  pageEnterTime = Date.now();
  maxScrollDepth = 0;

  const pageData = {
    session_id: sessionId,
    fingerprint_hash: fingerprint,
    page_path: window.location.pathname,
    page_title: document.title,
    referrer,
    referrer_domain: referrerDomain,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    user_agent: navigator.userAgent.slice(0, 500),
    screen_width: screen.width,
    screen_height: screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_type: deviceType,
    browser,
    browser_version: browserVersion,
    os,
    os_version: osVersion,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection_type: getConnectionType(),
    entry_page: isNew,
  };

  try {
    const { data } = await supabase
      .from('site_page_views')
      .insert(pageData)
      .select('id')
      .single();
    
    currentPageViewId = data?.id || null;

    // Upsert session
    if (isNew) {
      await supabase.from('site_sessions').insert({
        id: sessionId,
        fingerprint_hash: fingerprint,
        first_page: window.location.pathname,
        last_page: window.location.pathname,
        referrer,
        referrer_domain: referrerDomain,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        device_type: deviceType,
        browser,
        os,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_width: screen.width,
        screen_height: screen.height,
      });
    } else {
      await supabase.from('site_sessions').update({
        page_count: undefined, // handled by increment below
        last_page: window.location.pathname,
        ended_at: new Date().toISOString(),
      }).eq('id', sessionId);
      
      // Increment page count via raw update
      const { data: sess } = await supabase
        .from('site_sessions')
        .select('page_count')
        .eq('id', sessionId)
        .single();
      if (sess) {
        await supabase.from('site_sessions').update({
          page_count: (sess.page_count || 1) + 1,
          is_bounce: false,
        }).eq('id', sessionId);
      }
    }
  } catch (e) {
    // Silent fail — analytics should never break the site
  }
}

// ─── Init ───────────────────────────────────────────────────────────
export function initSiteAnalytics() {
  if (isTracking) return;
  if (isEditorPreviewEnv()) return;
  if (isBot()) return;
  isTracking = true;

  // Track initial page
  trackPageView();

  // Scroll tracking
  window.addEventListener('scroll', trackScroll, { passive: true });

  // Send time on page when leaving
  window.addEventListener('beforeunload', () => {
    sendTimeOnPage();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendTimeOnPage();
  });

  // SPA navigation: listen for popstate + intercept pushState
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  
  history.pushState = function (...args) {
    origPush(...args);
    setTimeout(trackPageView, 50);
  };
  history.replaceState = function (...args) {
    origReplace(...args);
    // Don't track replaceState as new page view
  };
  window.addEventListener('popstate', () => {
    setTimeout(trackPageView, 50);
  });
}
