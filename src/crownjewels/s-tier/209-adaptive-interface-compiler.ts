/**
 * S-Tier 209 — Adaptive Interface Compiler (SYN09)
 * ID: S-SYN09 | CJPI: 91 | Module: INCLUSIVE×DECODE
 *
 * Compiles content for diverse accessibility profiles with modality
 * adaptation, progressive enhancement, and usage analytics.
 */

export type Modality = 'voice' | 'text' | 'simplified' | 'assistive' | 'visual';

export interface AdaptiveAccessibilityProfile {
  modality: Modality;
  fontSize: number;
  contrast: 'normal' | 'high' | 'ultra-high';
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface CompiledOutput {
  output: string;
  modality: Modality;
  adaptations: string[];
  ariaAnnotations: Record<string, string>;
  estimatedReadTimeMs: number;
}

export class AdaptiveInterfaceCompiler {
  private profiles: Map<string, AdaptiveAccessibilityProfile> = new Map();
  private compilationLog: { userId: string; modality: Modality; adaptations: number; timestamp: number }[] = [];

  private readonly defaults: AdaptiveAccessibilityProfile = {
    modality: 'text', fontSize: 16, contrast: 'normal',
    reducedMotion: false, screenReader: false, colorBlindMode: 'none',
  };

  setProfile(userId: string, profile: Partial<AdaptiveAccessibilityProfile>): void {
    this.profiles.set(userId, { ...this.defaults, ...profile });
  }

  compile(userId: string, content: string, contentType: 'paragraph' | 'heading' | 'action' | 'data' = 'paragraph'): CompiledOutput {
    const profile = this.profiles.get(userId) ?? this.defaults;
    const adaptations: string[] = [];
    const ariaAnnotations: Record<string, string> = {};
    let output = content;

    // Modality adaptations
    if (profile.modality === 'simplified') {
      adaptations.push('language_simplified');
      // Shorten sentences
      output = content.split('. ').slice(0, Math.ceil(content.split('. ').length * 0.6)).join('. ');
      if (!output.endsWith('.')) output += '.';
    }

    if (profile.modality === 'voice') {
      adaptations.push('voice_optimized');
      ariaAnnotations['aria-live'] = 'polite';
      ariaAnnotations['role'] = 'status';
    }

    if (profile.modality === 'assistive') {
      adaptations.push('assistive_enhanced');
      ariaAnnotations['role'] = contentType === 'heading' ? 'heading' : contentType === 'action' ? 'button' : 'text';
      ariaAnnotations['aria-label'] = content.slice(0, 100);
    }

    // Visual adaptations
    if (profile.contrast === 'high') adaptations.push('high_contrast');
    if (profile.contrast === 'ultra-high') adaptations.push('ultra_high_contrast');
    if (profile.fontSize > 20) adaptations.push('large_text');
    if (profile.fontSize > 28) adaptations.push('extra_large_text');
    if (profile.reducedMotion) adaptations.push('reduced_motion');
    if (profile.screenReader) {
      adaptations.push('screen_reader');
      ariaAnnotations['aria-live'] = ariaAnnotations['aria-live'] ?? 'assertive';
    }
    if (profile.colorBlindMode !== 'none') adaptations.push(`color_blind_${profile.colorBlindMode}`);

    // Reading time estimate (avg 200 wpm)
    const wordCount = output.split(/\s+/).length;
    const estimatedReadTimeMs = (wordCount / 200) * 60000 * (profile.modality === 'voice' ? 1.5 : 1);

    this.compilationLog.push({ userId, modality: profile.modality, adaptations: adaptations.length, timestamp: Date.now() });
    if (this.compilationLog.length > 1000) this.compilationLog.shift();

    return { output, modality: profile.modality, adaptations, ariaAnnotations, estimatedReadTimeMs };
  }

  getProfile(userId: string): AdaptiveAccessibilityProfile | null {
    return this.profiles.get(userId) ?? null;
  }

  getStats(): { profiles: number; totalCompilations: number; modalityDistribution: Record<string, number>; avgAdaptations: number } {
    const dist: Record<string, number> = {};
    let totalAdapt = 0;
    for (const entry of this.compilationLog) {
      dist[entry.modality] = (dist[entry.modality] ?? 0) + 1;
      totalAdapt += entry.adaptations;
    }
    return {
      profiles: this.profiles.size,
      totalCompilations: this.compilationLog.length,
      modalityDistribution: dist,
      avgAdaptations: this.compilationLog.length > 0 ? totalAdapt / this.compilationLog.length : 0,
    };
  }

  reset(): void {
    this.profiles.clear();
    this.compilationLog = [];
  }
}
