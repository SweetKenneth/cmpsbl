/**
 * S-Tier 104 — Behavioral Biometrics Engine
 * ID: S-89 | CJPI: 89 | Module: IDENTITY
 * 
 * Continuous authentication through behavioral biometrics analysis.
 */

export interface BehavioralProfile {
  userId: string;
  typingPattern: TypingMetrics;
  interactionPattern: InteractionMetrics;
  sessionPattern: SessionMetrics;
  confidence: number;
  lastUpdated: string;
}

export interface TypingMetrics {
  avgKeystrokeIntervalMs: number;
  stdDevMs: number;
  avgDwellTimeMs: number;
  commonBigrams: Record<string, number>;
  wordsPerMinute: number;
}

export interface InteractionMetrics {
  avgClickIntervalMs: number;
  scrollPattern: 'smooth' | 'jumpy' | 'minimal';
  preferredNavigation: 'keyboard' | 'mouse' | 'mixed';
  avgSessionDepth: number;
}

export interface SessionMetrics {
  typicalStartHour: number;
  avgSessionDurationMs: number;
  typicalDaysActive: number[];
  timezone: string;
}

export interface AuthenticationResult {
  userId: string;
  isAuthentic: boolean;
  confidence: number;
  deviations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export class BehavioralBiometricsEngine {
  private profiles: Map<string, BehavioralProfile> = new Map();
  private readonly CONFIDENCE_THRESHOLD = 0.65;

  enrollProfile(profile: BehavioralProfile): void {
    this.profiles.set(profile.userId, profile);
  }

  authenticate(userId: string, current: Partial<BehavioralProfile>): AuthenticationResult {
    const baseline = this.profiles.get(userId);
    const deviations: string[] = [];
    let matchScore = 0;
    let checks = 0;

    if (!baseline) {
      return {
        userId, isAuthentic: false, confidence: 0,
        deviations: ['No baseline profile found'],
        riskLevel: 'high', timestamp: new Date().toISOString(),
      };
    }

    // Typing pattern comparison
    if (current.typingPattern && baseline.typingPattern) {
      checks++;
      const intervalDiff = Math.abs(
        current.typingPattern.avgKeystrokeIntervalMs - baseline.typingPattern.avgKeystrokeIntervalMs
      ) / baseline.typingPattern.avgKeystrokeIntervalMs;

      if (intervalDiff < 0.2) matchScore++;
      else deviations.push(`Typing speed deviation: ${(intervalDiff * 100).toFixed(0)}%`);

      checks++;
      const wpmDiff = Math.abs(
        current.typingPattern.wordsPerMinute - baseline.typingPattern.wordsPerMinute
      ) / Math.max(1, baseline.typingPattern.wordsPerMinute);

      if (wpmDiff < 0.25) matchScore++;
      else deviations.push(`WPM deviation: ${(wpmDiff * 100).toFixed(0)}%`);
    }

    // Session pattern comparison
    if (current.sessionPattern && baseline.sessionPattern) {
      checks++;
      const hourDiff = Math.abs(current.sessionPattern.typicalStartHour - baseline.sessionPattern.typicalStartHour);
      if (hourDiff <= 3) matchScore++;
      else deviations.push(`Unusual login hour: ${current.sessionPattern.typicalStartHour}`);
    }

    // Interaction pattern
    if (current.interactionPattern && baseline.interactionPattern) {
      checks++;
      if (current.interactionPattern.preferredNavigation === baseline.interactionPattern.preferredNavigation) {
        matchScore++;
      } else {
        deviations.push(`Navigation pattern changed: ${current.interactionPattern.preferredNavigation}`);
      }
    }

    const confidence = checks > 0 ? matchScore / checks : 0;
    const riskLevel: AuthenticationResult['riskLevel'] =
      confidence >= 0.8 ? 'low' : confidence >= 0.5 ? 'medium' : 'high';

    return {
      userId,
      isAuthentic: confidence >= this.CONFIDENCE_THRESHOLD,
      confidence,
      deviations,
      riskLevel,
      timestamp: new Date().toISOString(),
    };
  }
}
