/**
 * INCLUSIVE Adaptive Interface
 * Dynamic UI adaptation based on accessibility profiles
 */
 
 // Adaptation profile
 export interface AdaptationProfile {
   id: string;
   name: string;
   preferences: AccessibilityPreferences;
   overrides: UIOverrides;
   autoDetected: boolean;
   lastUpdated: string;
 }
 
 // Accessibility preferences
 export interface AccessibilityPreferences {
   fontSize: 'default' | 'large' | 'x-large';
   contrast: 'default' | 'high' | 'inverted';
   reduceMotion: boolean;
   reduceTransparency: boolean;
   screenReader: boolean;
   keyboardOnly: boolean;
   colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
   dyslexiaFont: boolean;
   focusIndicator: 'default' | 'enhanced' | 'high-visibility';
 }
 
 // UI overrides
 export interface UIOverrides {
   customCSS?: string;
   hiddenElements?: string[];
   simplifiedLayout?: boolean;
   enlargedClickTargets?: boolean;
   verboseLabels?: boolean;
 }
 
 // Adaptation suggestion
 export interface AdaptationSuggestion {
   preference: keyof AccessibilityPreferences;
   currentValue: unknown;
   suggestedValue: unknown;
   reason: string;
   confidence: number;
 }
 
 // Active profiles
 const profiles = new Map<string, AdaptationProfile>();
 let activeProfile: AdaptationProfile | null = null;
 
 // Default preferences
 const DEFAULT_PREFERENCES: AccessibilityPreferences = {
   fontSize: 'default',
   contrast: 'default',
   reduceMotion: false,
   reduceTransparency: false,
   screenReader: false,
   keyboardOnly: false,
   dyslexiaFont: false,
   focusIndicator: 'default',
 };
 
 /**
  * Create an adaptation profile
  */
 export function createProfile(
   name: string,
   preferences: Partial<AccessibilityPreferences> = {}
 ): AdaptationProfile {
   const profile: AdaptationProfile = {
     id: `profile_${Date.now()}`,
     name,
     preferences: { ...DEFAULT_PREFERENCES, ...preferences },
     overrides: {},
     autoDetected: false,
     lastUpdated: new Date().toISOString(),
   };
   
   profiles.set(profile.id, profile);
   return profile;
 }
 
 /**
  * Detect system preferences and create profile
  */
 export function detectSystemPreferences(): AdaptationProfile {
   const preferences: Partial<AccessibilityPreferences> = {};
   
   // Detect from browser/OS settings
   if (typeof window !== 'undefined') {
     // Reduced motion
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
       preferences.reduceMotion = true;
     }
     
     // High contrast
     if (window.matchMedia('(prefers-contrast: more)').matches) {
       preferences.contrast = 'high';
     }
     
     // Reduced transparency
     if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
       preferences.reduceTransparency = true;
     }
     
     // Color scheme (for inverted)
     if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
       // Dark mode preference detected
     }
   }
   
   const profile = createProfile('Auto-Detected', preferences);
   profile.autoDetected = true;
   
   return profile;
 }
 
 /**
  * Activate a profile
  */
 export function activateProfile(profileId: string): boolean {
   const profile = profiles.get(profileId);
   if (!profile) return false;
   
   activeProfile = profile;
   applyAdaptations(profile);
   
   return true;
 }
 
 /**
  * Apply adaptations to the UI
  */
 function applyAdaptations(profile: AdaptationProfile): void {
   if (typeof document === 'undefined') return;
   
   const root = document.documentElement;
   const { preferences, overrides } = profile;
   
   // Font size
   switch (preferences.fontSize) {
     case 'large':
       root.style.setProperty('--base-font-size', '18px');
       break;
     case 'x-large':
       root.style.setProperty('--base-font-size', '22px');
       break;
     default:
       root.style.removeProperty('--base-font-size');
   }
   
   // Contrast
   root.classList.toggle('high-contrast', preferences.contrast === 'high');
   root.classList.toggle('inverted-colors', preferences.contrast === 'inverted');
   
   // Reduced motion
   root.classList.toggle('reduce-motion', preferences.reduceMotion);
   
   // Focus indicator
   root.classList.toggle('enhanced-focus', preferences.focusIndicator !== 'default');
   
   // Dyslexia font
   root.classList.toggle('dyslexia-font', preferences.dyslexiaFont);
   
   // Color blind modes
   root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
   if (preferences.colorBlindMode && preferences.colorBlindMode !== 'none') {
     root.classList.add(preferences.colorBlindMode);
   }
   
   // Custom CSS
   if (overrides.customCSS) {
     let styleEl = document.getElementById('inclusive-custom-css');
     if (!styleEl) {
       styleEl = document.createElement('style');
       styleEl.id = 'inclusive-custom-css';
       document.head.appendChild(styleEl);
     }
     styleEl.textContent = overrides.customCSS;
   }
   
   // Simplified layout
   root.classList.toggle('simplified-layout', overrides.simplifiedLayout || false);
   
   // Enlarged click targets
   root.classList.toggle('enlarged-targets', overrides.enlargedClickTargets || false);
 }
 
 /**
  * Get adaptation suggestions based on usage patterns
  */
 export function getSuggestions(
   usageData: {
     zoomLevel?: number;
     missedClicks?: number;
     keyboardUsage?: number;
     avgSessionTime?: number;
   }
 ): AdaptationSuggestion[] {
   const suggestions: AdaptationSuggestion[] = [];
   const current = activeProfile?.preferences || DEFAULT_PREFERENCES;
   
   // Suggest larger font if user zooms frequently
   if (usageData.zoomLevel && usageData.zoomLevel > 1.2) {
     suggestions.push({
       preference: 'fontSize',
       currentValue: current.fontSize,
       suggestedValue: 'large',
       reason: 'Detected frequent zoom usage',
       confidence: 0.8,
     });
   }
   
   // Suggest enlarged targets if many missed clicks
   if (usageData.missedClicks && usageData.missedClicks > 10) {
     suggestions.push({
       preference: 'keyboardOnly',
       currentValue: current.keyboardOnly,
       suggestedValue: true,
       reason: 'Detected difficulty with click targets',
       confidence: 0.7,
     });
   }
   
   // Suggest keyboard mode if high keyboard usage
   if (usageData.keyboardUsage && usageData.keyboardUsage > 0.8) {
     suggestions.push({
       preference: 'focusIndicator',
       currentValue: current.focusIndicator,
       suggestedValue: 'enhanced',
       reason: 'High keyboard navigation usage detected',
       confidence: 0.9,
     });
   }
   
   return suggestions;
 }
 
 /**
  * Update profile preferences
  */
 export function updatePreferences(
   profileId: string,
   updates: Partial<AccessibilityPreferences>
 ): AdaptationProfile | null {
   const profile = profiles.get(profileId);
   if (!profile) return null;
   
   profile.preferences = { ...profile.preferences, ...updates };
   profile.lastUpdated = new Date().toISOString();
   profile.autoDetected = false;
   
   if (activeProfile?.id === profileId) {
     applyAdaptations(profile);
   }
   
   return profile;
 }
 
 /**
  * Get active profile
  */
 export function getActiveProfile(): AdaptationProfile | null {
   return activeProfile;
 }
 
 /**
  * Get all profiles
  */
 export function getAllProfiles(): AdaptationProfile[] {
   return Array.from(profiles.values());
 }
 
 /**
  * Delete a profile
  */
 export function deleteProfile(profileId: string): boolean {
   if (activeProfile?.id === profileId) {
     activeProfile = null;
   }
   return profiles.delete(profileId);
 }
 
 /**
  * Reset to defaults
  */
 export function resetToDefaults(): void {
   activeProfile = null;
   
   if (typeof document !== 'undefined') {
     const root = document.documentElement;
     root.style.removeProperty('--base-font-size');
     root.classList.remove(
       'high-contrast', 'inverted-colors', 'reduce-motion',
       'enhanced-focus', 'dyslexia-font', 'simplified-layout',
       'enlarged-targets', 'protanopia', 'deuteranopia', 'tritanopia'
     );
   }
 }
 
 /**
  * Generate CSS for a profile
  */
 export function generateProfileCSS(profile: AdaptationProfile): string {
   const { preferences } = profile;
   const rules: string[] = [];
   
   if (preferences.fontSize !== 'default') {
     const size = preferences.fontSize === 'x-large' ? '22px' : '18px';
     rules.push(`html { font-size: ${size} !important; }`);
   }
   
   if (preferences.contrast === 'high') {
     rules.push(`
       * {
         --foreground: 0 0% 0% !important;
         --background: 0 0% 100% !important;
       }
     `);
   }
   
   if (preferences.reduceMotion) {
     rules.push(`
       *, *::before, *::after {
         animation-duration: 0.01ms !important;
         transition-duration: 0.01ms !important;
       }
     `);
   }
   
   if (preferences.dyslexiaFont) {
     rules.push(`
       body {
         font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
         letter-spacing: 0.1em !important;
         word-spacing: 0.2em !important;
       }
     `);
   }
   
   return rules.join('\n');
 }