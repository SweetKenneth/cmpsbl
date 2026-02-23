/**
 * Known bot user agent patterns for server-side filtering
 * Used by the analytics dashboard to post-filter any bots that slipped through client-side
 */

export const KNOWN_BOT_PATTERNS = [
  'bot', 'crawl', 'spider', 'scrape', 'headless', 'phantom',
  'selenium', 'puppeteer', 'playwright', 'wget', 'curl',
  'python', 'java/', 'http', 'fetch', 'axios', 'node-fetch',
  'go-http', 'ruby', 'perl', 'libwww', 'apache', 'nutch',
  'slurp', 'mediapartners', 'adsbot', 'googlebot', 'bingbot',
  'yandex', 'baidu', 'duckduck', 'facebot', 'ia_archiver',
  'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'petalbot',
  'bytespider', 'gptbot', 'claudebot', 'ccbot', 'dataprovider',
  'zoominfobot', 'ltx71', 'censys', 'zgrab', 'masscan',
  'nmap', 'nikto', 'sqlmap', 'burp', 'applebot', 'twitterbot',
  'linkedinbot', 'whatsapp', 'telegrambot', 'discordbot',
  'slack', 'embedly', 'preview', 'snippet', 'thumbnail',
  'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'uptimerobot',
  'monitor', 'check_http', 'probe', 'scan',
];

export function isBotUA(ua: string): boolean {
  if (!ua || ua.length < 20) return true;
  const lower = ua.toLowerCase();
  return KNOWN_BOT_PATTERNS.some(p => lower.includes(p));
}
