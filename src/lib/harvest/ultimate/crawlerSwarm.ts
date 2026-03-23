/**
 * HARVEST Ultimate — Adaptive Crawler Swarm
 * Pool of virtual crawlers with independent rate limits, rotation strategies,
 * and politeness profiles. Swarm scales up/down based on thermal budget.
 */

export type CrawlerStatus = 'idle' | 'active' | 'rate_limited' | 'banned' | 'cooldown';
export type PolitenessLevel = 'respectful' | 'moderate' | 'aggressive';

export interface VirtualCrawler {
  id: string;
  status: CrawlerStatus;
  requestsPerMinute: number;
  maxRequestsPerMinute: number;
  politeness: PolitenessLevel;
  totalRequests: number;
  totalFailures: number;
  lastActiveAt: number;
  cooldownUntil: number;
  userAgent: string;
}

export interface SwarmConfig {
  minCrawlers: number;
  maxCrawlers: number;
  defaultPoliteness: PolitenessLevel;
  defaultRPM: number;
}

export interface SwarmStats {
  totalCrawlers: number;
  activeCrawlers: number;
  idleCrawlers: number;
  rateLimitedCrawlers: number;
  bannedCrawlers: number;
  totalRequests: number;
  swarmEfficiency: number;
}

const DEFAULT_CONFIG: SwarmConfig = {
  minCrawlers: 2,
  maxCrawlers: 20,
  defaultPoliteness: 'respectful',
  defaultRPM: 10,
};

const USER_AGENTS = [
  'CMPSBL-Harvest/1.0 (Substrate Data Acquisition)',
  'CMPSBL-Reaper/1.0 (ETL Pipeline)',
  'CMPSBL-Leviathan/1.0 (Data Intelligence)',
];

let config: SwarmConfig = { ...DEFAULT_CONFIG };
const crawlers = new Map<string, VirtualCrawler>();

function createCrawler(): VirtualCrawler {
  const id = `crawler-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const crawler: VirtualCrawler = {
    id, status: 'idle',
    requestsPerMinute: 0,
    maxRequestsPerMinute: config.defaultRPM,
    politeness: config.defaultPoliteness,
    totalRequests: 0, totalFailures: 0,
    lastActiveAt: 0, cooldownUntil: 0,
    userAgent: USER_AGENTS[crawlers.size % USER_AGENTS.length],
  };
  crawlers.set(id, crawler);
  return crawler;
}

export function initSwarm(cfg?: Partial<SwarmConfig>): void {
  config = { ...DEFAULT_CONFIG, ...cfg };
  crawlers.clear();
  for (let i = 0; i < config.minCrawlers; i++) createCrawler();
}

export function acquireCrawler(): VirtualCrawler | null {
  const now = Date.now();
  // Find idle or cooled-down crawler
  for (const c of crawlers.values()) {
    if (c.status === 'cooldown' && now > c.cooldownUntil) {
      c.status = 'idle';
    }
    if (c.status === 'idle') {
      c.status = 'active';
      c.lastActiveAt = now;
      return c;
    }
  }
  // Scale up if under max
  if (crawlers.size < config.maxCrawlers) {
    const c = createCrawler();
    c.status = 'active';
    c.lastActiveAt = now;
    return c;
  }
  return null;
}

export function releaseCrawler(id: string, success: boolean): void {
  const c = crawlers.get(id);
  if (!c) return;
  c.totalRequests++;
  if (!success) c.totalFailures++;
  c.requestsPerMinute++;

  if (c.requestsPerMinute >= c.maxRequestsPerMinute) {
    c.status = 'rate_limited';
    c.cooldownUntil = Date.now() + 60_000;
    c.requestsPerMinute = 0;
    setTimeout(() => { if (c.status === 'rate_limited') c.status = 'idle'; }, 60_000);
  } else {
    c.status = 'idle';
  }
}

export function banCrawler(id: string): void {
  const c = crawlers.get(id);
  if (c) c.status = 'banned';
}

export function scaleSwarm(thermalZone: string): void {
  const target = thermalZone === 'cool' ? config.maxCrawlers
    : thermalZone === 'warm' ? Math.ceil(config.maxCrawlers * 0.7)
    : thermalZone === 'hot' ? Math.ceil(config.maxCrawlers * 0.4)
    : config.minCrawlers;

  while (crawlers.size < target) createCrawler();
  // Retire excess idle crawlers
  if (crawlers.size > target) {
    const idle = [...crawlers.values()].filter(c => c.status === 'idle');
    let toRemove = crawlers.size - target;
    for (const c of idle) {
      if (toRemove <= 0) break;
      crawlers.delete(c.id);
      toRemove--;
    }
  }
}

export function getSwarmStats(): SwarmStats {
  const all = [...crawlers.values()];
  const active = all.filter(c => c.status === 'active').length;
  const idle = all.filter(c => c.status === 'idle').length;
  const rateLimited = all.filter(c => c.status === 'rate_limited').length;
  const banned = all.filter(c => c.status === 'banned').length;
  const total = all.reduce((s, c) => s + c.totalRequests, 0);
  const efficiency = all.length > 0 ? (active + idle) / all.length : 0;
  return { totalCrawlers: all.length, activeCrawlers: active, idleCrawlers: idle, rateLimitedCrawlers: rateLimited, bannedCrawlers: banned, totalRequests: total, swarmEfficiency: efficiency };
}

export function resetSwarmState(): void { crawlers.clear(); config = { ...DEFAULT_CONFIG }; }
