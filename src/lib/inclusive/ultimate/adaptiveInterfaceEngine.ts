/**
 * INCLUSIVE Ultimate — System 7: Adaptive Interface Engine
 * 
 * Runtime accessibility adaptation — responds to user preferences
 * (high contrast, reduced motion, screen reader, font scaling, dyslexia fonts)
 * and device capabilities. Profiles stored per session.
 * 
 * @module inclusive/ultimate/adaptiveInterfaceEngine
 */

// ── Types ────────────────────────────────────────────────────────

export interface UserAccessibilityProfile {
  id: string;
  preferences: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderMode: boolean;
    fontScale: number;        // 1.0 = default, 1.5 = 150%
    dyslexiaFont: boolean;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    largeTargets: boolean;
    readingGuide: boolean;
  };
  deviceCapabilities: {
    hasTouch: boolean;
    hasKeyboard: boolean;
    hasPointer: boolean;
    screenWidth: number;
    screenHeight: number;
    prefersReducedMotion: boolean;
    prefersHighContrast: boolean;
  };
  adaptations: Adaptation[];
  createdAt: string;
  updatedAt: string;
}

export interface Adaptation {
  id: string;
  type: string;
  cssProperty?: string;
  cssValue?: string;
  ariaChange?: string;
  description: string;
  appliedAt: string;
}

export interface AdaptationSet {
  profileId: string;
  adaptations: Adaptation[];
  cssOverrides: Record<string, string>;
  ariaOverrides: Record<string, string>;
  generatedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const activeProfiles: Map<string, UserAccessibilityProfile> = new Map();
const adaptationHistory: AdaptationSet[] = [];
const MAX_PROFILES = 100;
const MAX_HISTORY = 200;

// ── Default Profile ──────────────────────────────────────────────

const DEFAULT_PREFERENCES: UserAccessibilityProfile['preferences'] = {
  highContrast: false,
  reducedMotion: false,
  screenReaderMode: false,
  fontScale: 1.0,
  dyslexiaFont: false,
  colorBlindMode: 'none',
  largeTargets: false,
  readingGuide: false,
};

const DEFAULT_CAPABILITIES: UserAccessibilityProfile['deviceCapabilities'] = {
  hasTouch: false,
  hasKeyboard: true,
  hasPointer: true,
  screenWidth: 1920,
  screenHeight: 1080,
  prefersReducedMotion: false,
  prefersHighContrast: false,
};

// ── Adaptation Generation ────────────────────────────────────────

function generateAdaptations(profile: UserAccessibilityProfile): Adaptation[] {
  const adaptations: Adaptation[] = [];
  const prefs = profile.preferences;
  const caps = profile.deviceCapabilities;
  const now = new Date().toISOString();

  if (prefs.highContrast || caps.prefersHighContrast) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'high_contrast',
      cssProperty: 'filter', cssValue: 'contrast(1.4)',
      description: 'Increased contrast for better readability', appliedAt: now,
    });
  }

  if (prefs.reducedMotion || caps.prefersReducedMotion) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'reduced_motion',
      cssProperty: 'transition-duration', cssValue: '0.01ms',
      description: 'Disabled animations for reduced motion preference', appliedAt: now,
    });
  }

  if (prefs.fontScale !== 1.0) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'font_scale',
      cssProperty: 'font-size', cssValue: `${prefs.fontScale * 100}%`,
      description: `Font scaled to ${prefs.fontScale * 100}%`, appliedAt: now,
    });
  }

  if (prefs.dyslexiaFont) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'dyslexia_font',
      cssProperty: 'font-family', cssValue: 'OpenDyslexic, Comic Sans MS, sans-serif',
      description: 'Dyslexia-friendly font activated', appliedAt: now,
    });
    adaptations.push({
      id: crypto.randomUUID(), type: 'dyslexia_spacing',
      cssProperty: 'letter-spacing', cssValue: '0.12em',
      description: 'Increased letter spacing for readability', appliedAt: now,
    });
  }

  if (prefs.largeTargets) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'large_targets',
      cssProperty: 'min-height', cssValue: '44px',
      description: 'Minimum touch target size increased to 44px', appliedAt: now,
    });
  }

  if (prefs.screenReaderMode) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'screen_reader',
      ariaChange: 'aria-live=polite on dynamic regions',
      description: 'Enhanced ARIA live regions for screen reader support', appliedAt: now,
    });
  }

  if (prefs.readingGuide) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'reading_guide',
      cssProperty: 'line-height', cssValue: '1.8',
      description: 'Increased line height for reading guide mode', appliedAt: now,
    });
  }

  if (prefs.colorBlindMode !== 'none') {
    const filters: Record<string, string> = {
      protanopia: 'url(#protanopia-filter)',
      deuteranopia: 'url(#deuteranopia-filter)',
      tritanopia: 'url(#tritanopia-filter)',
    };
    adaptations.push({
      id: crypto.randomUUID(), type: 'color_blind',
      cssProperty: 'filter', cssValue: filters[prefs.colorBlindMode] || 'none',
      description: `Color blind mode: ${prefs.colorBlindMode}`, appliedAt: now,
    });
  }

  // Device-responsive adaptations
  if (caps.hasTouch && !caps.hasPointer) {
    adaptations.push({
      id: crypto.randomUUID(), type: 'touch_only',
      cssProperty: 'min-width', cssValue: '48px',
      description: 'Touch-only device: enlarged interactive elements', appliedAt: now,
    });
  }

  return adaptations;
}

// ── Core API ────────────────────────────────────────────────────

/** Create or update a user accessibility profile */
export function setProfile(
  profileId: string,
  preferences: Partial<UserAccessibilityProfile['preferences']> = {},
  deviceCapabilities: Partial<UserAccessibilityProfile['deviceCapabilities']> = {},
): UserAccessibilityProfile {
  const existing = activeProfiles.get(profileId);
  const now = new Date().toISOString();

  const profile: UserAccessibilityProfile = {
    id: profileId,
    preferences: { ...(existing?.preferences || DEFAULT_PREFERENCES), ...preferences },
    deviceCapabilities: { ...(existing?.deviceCapabilities || DEFAULT_CAPABILITIES), ...deviceCapabilities },
    adaptations: [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  profile.adaptations = generateAdaptations(profile);

  activeProfiles.set(profileId, profile);
  if (activeProfiles.size > MAX_PROFILES) {
    const oldest = activeProfiles.keys().next().value;
    if (oldest) activeProfiles.delete(oldest);
  }

  return profile;
}

/** Generate CSS/ARIA adaptation set for a profile */
export function getAdaptationSet(profileId: string): AdaptationSet | null {
  const profile = activeProfiles.get(profileId);
  if (!profile) return null;

  const cssOverrides: Record<string, string> = {};
  const ariaOverrides: Record<string, string> = {};

  for (const adapt of profile.adaptations) {
    if (adapt.cssProperty && adapt.cssValue) {
      cssOverrides[adapt.cssProperty] = adapt.cssValue;
    }
    if (adapt.ariaChange) {
      ariaOverrides[adapt.type] = adapt.ariaChange;
    }
  }

  const set: AdaptationSet = {
    profileId,
    adaptations: profile.adaptations,
    cssOverrides,
    ariaOverrides,
    generatedAt: new Date().toISOString(),
  };

  adaptationHistory.push(set);
  if (adaptationHistory.length > MAX_HISTORY) adaptationHistory.splice(0, adaptationHistory.length - MAX_HISTORY);

  return set;
}

/** Get active profile */
export function getProfile(profileId: string): UserAccessibilityProfile | undefined {
  return activeProfiles.get(profileId);
}

/** Get adaptive engine health */
export function getAdaptiveHealth() {
  return {
    activeProfiles: activeProfiles.size,
    totalAdaptationSets: adaptationHistory.length,
    avgAdaptationsPerProfile: activeProfiles.size > 0
      ? Math.round(Array.from(activeProfiles.values()).reduce((s, p) => s + p.adaptations.length, 0) / activeProfiles.size * 10) / 10
      : 0,
  };
}

/** Reset */
export function resetAdaptiveEngine(): void {
  activeProfiles.clear();
  adaptationHistory.length = 0;
}
