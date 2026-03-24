// DEFENSE Tracking System
// Real-time defense event tracking and analytics

import { secureGet, secureSet, secureRemove } from '@/lib/system/secureStorage';

// Event types
export interface DefenseEvent {
  id: string;
  type:
    | 'bot_detection'
    | 'behavior_analysis'
    | 'captcha'
    | 'device_fingerprint'
    | 'threat_intelligence';
  timestamp: string;
  details: Record<string, any>;
}

export interface BotDetectionEvent {
  id: string;
  ip: string;
  type: 'bot' | 'human' | 'suspicious';
  score: number;
  timestamp: string;
  blocked: boolean;
  userAgent?: string;
  fingerprint?: string;
}

export interface BehaviorEvent {
  id: string;
  sessionId: string;
  metric: string;
  value: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
}

export interface CaptchaEvent {
  id: string;
  type: 'math' | 'image';
  question: string;
  status: 'solved' | 'pending' | 'failed';
  time: string;
  timestamp: string;
}

export interface DeviceEvent {
  id: string;
  hash: string;
  reputation: number;
  risk: 'low' | 'medium' | 'high';
  visits: number;
  lastSeen: string;
  timestamp: string;
}

export interface ThreatEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  source: string;
  time: string;
  timestamp: string;
}

// Storage keys
const STORAGE_KEYS = {
  BOT_DETECTIONS: 'pf_bot_detections',
  BEHAVIOR_EVENTS: 'pf_behavior_events',
  CAPTCHA_EVENTS: 'pf_captcha_events',
  DEVICE_EVENTS: 'pf_device_events',
  THREAT_EVENTS: 'pf_threat_events',
};

// Helper functions — secure obfuscated storage
const getStoredData = <T>(key: string): T[] => {
  return secureGet<T[]>(key) || [];
};

const storeData = <T>(key: string, data: T[]): void => {
  secureSet(key, data);
};

// Bot Detection
export const logBotDetection = (event: Omit<BotDetectionEvent, 'id' | 'timestamp'>): void => {
  const events = getStoredData<BotDetectionEvent>(STORAGE_KEYS.BOT_DETECTIONS);
  const newEvent: BotDetectionEvent = {
    ...event,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };
  events.unshift(newEvent);
  storeData(STORAGE_KEYS.BOT_DETECTIONS, events.slice(0, 100));
};

export const getBotDetections = (): BotDetectionEvent[] => {
  return getStoredData<BotDetectionEvent>(STORAGE_KEYS.BOT_DETECTIONS);
};

export const getBotStats = () => {
  const events = getBotDetections();
  const total = events.length;
  const bots = events.filter(e => e.type === 'bot').length;
  const humans = events.filter(e => e.type === 'human').length;
  const blocked = events.filter(e => e.blocked).length;
  const suspicious = events.filter(e => e.type === 'suspicious').length;
  
  return { total, bots, humans, blocked, suspicious };
};

// Behavior Analysis
export const logBehaviorEvent = (event: Omit<BehaviorEvent, 'id' | 'timestamp'>): void => {
  const events = getStoredData<BehaviorEvent>(STORAGE_KEYS.BEHAVIOR_EVENTS);
  const newEvent: BehaviorEvent = {
    ...event,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };
  events.unshift(newEvent);
  storeData(STORAGE_KEYS.BEHAVIOR_EVENTS, events.slice(0, 100));
};

export const getBehaviorEvents = (): BehaviorEvent[] => {
  return getStoredData<BehaviorEvent>(STORAGE_KEYS.BEHAVIOR_EVENTS);
};

export const getBehaviorStats = () => {
  const events = getBehaviorEvents();
  const total = events.length;
  const mouseEvents = events.filter(e => e.metric.toLowerCase().includes('mouse')).length;
  const keyboardEvents = events.filter(e => e.metric.toLowerCase().includes('keyboard')).length;
  const scrollEvents = events.filter(e => e.metric.toLowerCase().includes('scroll')).length;
  
  return { total, mouseEvents, keyboardEvents, scrollEvents };
};

// CAPTCHA
export const logCaptchaEvent = (event: Omit<CaptchaEvent, 'id' | 'timestamp'>): void => {
  const events = getStoredData<CaptchaEvent>(STORAGE_KEYS.CAPTCHA_EVENTS);
  const newEvent: CaptchaEvent = {
    ...event,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };
  events.unshift(newEvent);
  storeData(STORAGE_KEYS.CAPTCHA_EVENTS, events.slice(0, 100));
};

export const getCaptchaEvents = (): CaptchaEvent[] => {
  return getStoredData<CaptchaEvent>(STORAGE_KEYS.CAPTCHA_EVENTS);
};

export const getCaptchaStats = () => {
  const events = getCaptchaEvents();
  const total = events.length;
  const solved = events.filter(e => e.status === 'solved').length;
  const failed = events.filter(e => e.status === 'failed').length;
  const pending = events.filter(e => e.status === 'pending').length;
  const successRate = total > 0 ? ((solved / total) * 100).toFixed(1) : '0.0';
  
  return { total, solved, failed, pending, successRate };
};

// Device Fingerprint
export const logDeviceEvent = (event: Omit<DeviceEvent, 'id' | 'timestamp'>): void => {
  const events = getStoredData<DeviceEvent>(STORAGE_KEYS.DEVICE_EVENTS);
  const existingIndex = events.findIndex(e => e.hash === event.hash);
  
  if (existingIndex !== -1) {
    events[existingIndex] = {
      ...events[existingIndex],
      ...event,
      visits: events[existingIndex].visits + 1,
      lastSeen: new Date().toLocaleString(),
      timestamp: new Date().toISOString(),
    };
  } else {
    const newEvent: DeviceEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    events.unshift(newEvent);
  }
  
  storeData(STORAGE_KEYS.DEVICE_EVENTS, events.slice(0, 100));
};

export const getDeviceEvents = (): DeviceEvent[] => {
  return getStoredData<DeviceEvent>(STORAGE_KEYS.DEVICE_EVENTS);
};

export const getDeviceStats = () => {
  const events = getDeviceEvents();
  const total = events.length;
  const highRep = events.filter(e => e.reputation >= 70).length;
  const lowRep = events.filter(e => e.reputation < 40).length;
  const flagged = events.filter(e => e.risk === 'high').length;
  
  return { total, highRep, lowRep, flagged };
};

// Threat Intelligence
export const logThreatEvent = (event: Omit<ThreatEvent, 'id' | 'timestamp'>): void => {
  const events = getStoredData<ThreatEvent>(STORAGE_KEYS.THREAT_EVENTS);
  const newEvent: ThreatEvent = {
    ...event,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };
  events.unshift(newEvent);
  storeData(STORAGE_KEYS.THREAT_EVENTS, events.slice(0, 100));
};

export const getThreatEvents = (): ThreatEvent[] => {
  return getStoredData<ThreatEvent>(STORAGE_KEYS.THREAT_EVENTS);
};

export const getThreatStats = () => {
  const events = getThreatEvents();
  const total = events.length;
  const critical = events.filter(e => e.severity === 'critical').length;
  const high = events.filter(e => e.severity === 'high').length;
  const medium = events.filter(e => e.severity === 'medium').length;
  const avgConfidence = total > 0 
    ? (events.reduce((sum, e) => sum + e.confidence, 0) / total).toFixed(1)
    : '0.0';
  
  return { total, critical, high, medium, avgConfidence };
};

/** @deprecated Demo data seeding removed — Signal Honesty enforced. Defense data comes from real events only. */
export const initializeDemoData = (): void => {
  // No-op: removed fake data seeding per Zero-Mock policy
};

// Clear all data
export const clearAllDefenseData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => secureRemove(key));
};
