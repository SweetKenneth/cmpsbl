/**
 * DEFENSE — Geo-Fencing & Jurisdiction Enforcement v1.0.0
 * Runtime geo-blocking and region-locked access enforcement.
 *
 * Features:
 *  - Country/region allowlists and blocklists
 *  - Geo-velocity detection (impossible travel)
 *  - Jurisdiction compliance zones (GDPR, CCPA, etc.)
 *  - VPN/proxy detection signals
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type JurisdictionZone = 'EU_GDPR' | 'US_CCPA' | 'UK_DPA' | 'APAC_PDPA' | 'GLOBAL' | 'RESTRICTED';

export interface GeoLocation {
  readonly countryCode: string;       // ISO 3166-1 alpha-2
  readonly regionCode?: string;       // ISO 3166-2
  readonly latitude?: number;
  readonly longitude?: number;
  readonly timezone?: string;
  readonly isProxy?: boolean;
  readonly isVpn?: boolean;
  readonly isTor?: boolean;
}

export interface GeoFencePolicy {
  readonly allowedCountries: ReadonlySet<string>;   // Empty = allow all
  readonly blockedCountries: ReadonlySet<string>;
  readonly jurisdictionZone: JurisdictionZone;
  readonly enforceGeoVelocity: boolean;
  readonly maxTravelSpeedKmh: number;               // Default 900 km/h (plane)
  readonly blockProxies: boolean;
  readonly blockVpns: boolean;
  readonly blockTor: boolean;
}

export interface GeoFenceResult {
  readonly allowed: boolean;
  readonly reason: string;
  readonly location: GeoLocation;
  readonly jurisdictionZone: JurisdictionZone;
  readonly riskSignals: readonly string[];
  readonly impossibleTravel: boolean;
  readonly travelSpeedKmh: number | null;
}

export interface ActorGeoHistory {
  readonly actorId: string;
  readonly lastLocation: GeoLocation;
  readonly lastTimestamp: number;
  readonly locationHistory: readonly GeoLocation[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT POLICY
// ═══════════════════════════════════════════════════════════════════════════════

// Commonly sanctioned or high-risk countries (configurable)
const DEFAULT_BLOCKED = new Set(['KP', 'IR', 'SY', 'CU']);

const JURISDICTION_MAP: Record<string, JurisdictionZone> = {
  AT: 'EU_GDPR', BE: 'EU_GDPR', BG: 'EU_GDPR', HR: 'EU_GDPR', CY: 'EU_GDPR',
  CZ: 'EU_GDPR', DK: 'EU_GDPR', EE: 'EU_GDPR', FI: 'EU_GDPR', FR: 'EU_GDPR',
  DE: 'EU_GDPR', GR: 'EU_GDPR', HU: 'EU_GDPR', IE: 'EU_GDPR', IT: 'EU_GDPR',
  LV: 'EU_GDPR', LT: 'EU_GDPR', LU: 'EU_GDPR', MT: 'EU_GDPR', NL: 'EU_GDPR',
  PL: 'EU_GDPR', PT: 'EU_GDPR', RO: 'EU_GDPR', SK: 'EU_GDPR', SI: 'EU_GDPR',
  ES: 'EU_GDPR', SE: 'EU_GDPR', NO: 'EU_GDPR', IS: 'EU_GDPR', LI: 'EU_GDPR',
  CH: 'EU_GDPR',
  GB: 'UK_DPA',
  US: 'US_CCPA',
  SG: 'APAC_PDPA', JP: 'APAC_PDPA', KR: 'APAC_PDPA', AU: 'APAC_PDPA',
};

let activePolicy: GeoFencePolicy = {
  allowedCountries: new Set(),
  blockedCountries: DEFAULT_BLOCKED,
  jurisdictionZone: 'GLOBAL',
  enforceGeoVelocity: true,
  maxTravelSpeedKmh: 900,
  blockProxies: false,
  blockVpns: false,
  blockTor: true,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE — Actor geo-history
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_ACTORS = 2000;
const MAX_HISTORY_PER_ACTOR = 10;
const actorGeoHistory = new Map<string, { last: GeoLocation; lastTs: number; history: GeoLocation[] }>();

// ═══════════════════════════════════════════════════════════════════════════════
// GEO MATH
// ═══════════════════════════════════════════════════════════════════════════════

const EARTH_RADIUS_KM = 6371;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Evaluate a geo-fence policy against an actor's location.
 */
export function evaluateGeoFence(actorId: string, location: GeoLocation): GeoFenceResult {
  const riskSignals: string[] = [];
  let allowed = true;
  let reason = 'Allowed';
  let impossibleTravel = false;
  let travelSpeed: number | null = null;

  const cc = location.countryCode.toUpperCase();

  // 1. Blocklist check
  if (activePolicy.blockedCountries.has(cc)) {
    allowed = false;
    reason = `Country ${cc} is blocked by policy`;
    riskSignals.push('blocked_country');
  }

  // 2. Allowlist check (if non-empty)
  if (allowed && activePolicy.allowedCountries.size > 0 && !activePolicy.allowedCountries.has(cc)) {
    allowed = false;
    reason = `Country ${cc} is not in allowlist`;
    riskSignals.push('not_in_allowlist');
  }

  // 3. Proxy/VPN/Tor checks
  if (location.isTor && activePolicy.blockTor) {
    allowed = false;
    reason = 'Tor exit node detected';
    riskSignals.push('tor_detected');
  }
  if (location.isVpn && activePolicy.blockVpns) {
    allowed = false;
    reason = 'VPN detected';
    riskSignals.push('vpn_detected');
  }
  if (location.isProxy && activePolicy.blockProxies) {
    allowed = false;
    reason = 'Proxy detected';
    riskSignals.push('proxy_detected');
  }

  // Signal without blocking
  if (location.isVpn) riskSignals.push('vpn_signal');
  if (location.isProxy) riskSignals.push('proxy_signal');
  if (location.isTor) riskSignals.push('tor_signal');

  // 4. Geo-velocity check
  if (activePolicy.enforceGeoVelocity && location.latitude != null && location.longitude != null) {
    const existing = actorGeoHistory.get(actorId);
    if (existing?.last.latitude != null && existing.last.longitude != null) {
      const distanceKm = haversineDistance(
        existing.last.latitude, existing.last.longitude!,
        location.latitude, location.longitude,
      );
      const timeDiffHours = (Date.now() - existing.lastTs) / (1000 * 60 * 60);
      if (timeDiffHours > 0.001) { // Avoid div-by-zero
        travelSpeed = distanceKm / timeDiffHours;
        if (travelSpeed > activePolicy.maxTravelSpeedKmh && distanceKm > 50) {
          impossibleTravel = true;
          riskSignals.push('impossible_travel');
          allowed = false;
          reason = `Impossible travel: ${Math.round(travelSpeed)} km/h detected`;
        }
      }
    }
  }

  // 5. Update history
  const hist = actorGeoHistory.get(actorId);
  if (hist) {
    hist.history.push(location);
    if (hist.history.length > MAX_HISTORY_PER_ACTOR) hist.history.splice(0, 1);
    hist.last = location;
    hist.lastTs = Date.now();
  } else {
    actorGeoHistory.set(actorId, { last: location, lastTs: Date.now(), history: [location] });
    // Evict
    if (actorGeoHistory.size > MAX_ACTORS) {
      const oldest = actorGeoHistory.keys().next().value;
      if (oldest) actorGeoHistory.delete(oldest);
    }
  }

  // Determine jurisdiction
  const jurisdiction = JURISDICTION_MAP[cc] || 'GLOBAL';

  return Object.freeze({
    allowed,
    reason,
    location,
    jurisdictionZone: jurisdiction,
    riskSignals: Object.freeze(riskSignals),
    impossibleTravel,
    travelSpeedKmh: travelSpeed,
  });
}

/**
 * Update the active geo-fence policy.
 */
export function updateGeoPolicy(update: Partial<GeoFencePolicy>): GeoFencePolicy {
  activePolicy = { ...activePolicy, ...update };
  return activePolicy;
}

/**
 * Get the current active policy.
 */
export function getActiveGeoPolicy(): GeoFencePolicy {
  return activePolicy;
}

/**
 * Get geo-fencing stats.
 */
export function getGeoFenceStats() {
  return {
    version: '1.0.0',
    trackedActors: actorGeoHistory.size,
    blockedCountries: activePolicy.blockedCountries.size,
    allowedCountries: activePolicy.allowedCountries.size,
    jurisdictionZone: activePolicy.jurisdictionZone,
    geoVelocityEnabled: activePolicy.enforceGeoVelocity,
  };
}

/**
 * Clear all geo-fence state.
 */
export function clearGeoState(): void {
  actorGeoHistory.clear();
}
