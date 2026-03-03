/**
 * Fingerprint Drift Evaluator — DEFENSE module
 * Computes drift score between current fingerprint signals and last-known snapshot.
 * Only hashed/bucketed signals are compared — never raw IPs or identifiers.
 * Target nodes: DEFENSE, SITE-GUARD
 */

import {
  withMiddleware,
  createAdminClient,
  jsonResponse,
  parseBody,
  EdgeError,
} from "../_shared/edge-middleware.ts";

interface DriftRequest {
  fingerprint_hash: string;
  signal_hashes: Record<string, string>;
  signal_buckets: Record<string, string | number>;
  flags: Record<string, boolean>;
}

interface DriftResult {
  drift_score: number;
  drift_reasons: string[];
  is_within_tolerance: boolean;
  recommended_action: 'allow' | 'challenge' | 'block';
  is_new_device: boolean;
}

// Signal weights for drift scoring
const SIGNAL_WEIGHTS: Record<string, number> = {
  canvas: 0.15,
  webgl: 0.15,
  audio: 0.10,
  timezone: 0.10,
  language: 0.08,
  platform: 0.12,
  screen_bucket: 0.08,
  viewport_bucket: 0.05,
  plugins_count: 0.05,
  cores_bucket: 0.06,
  memory_bucket: 0.06,
};

// Hard-negative flags — these increase risk, never forgiven by drift tolerance
const HARD_NEGATIVE_FLAGS = ['webdriver', 'cdpDetected', 'performanceAPITampered', 'swiftshader_detected'];

// Default thresholds
const TOLERANCE_THRESHOLD = 0.35;
const CHALLENGE_THRESHOLD = 0.60;

Deno.serve(withMiddleware(async (req: Request) => {
  if (req.method !== 'POST') {
    throw new EdgeError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
  }

  const body = await parseBody<DriftRequest>(req);

  if (!body.fingerprint_hash || body.fingerprint_hash.length < 1 || body.fingerprint_hash.length > 128) {
    throw new EdgeError('Invalid fingerprint_hash', 400, 'INVALID_INPUT');
  }

  if (!body.signal_hashes || typeof body.signal_hashes !== 'object') {
    throw new EdgeError('signal_hashes required', 400, 'INVALID_INPUT');
  }

  const supabase = createAdminClient();

  // Look up last-known snapshot
  const { data: snapshot } = await supabase
    .from('device_fingerprint_snapshots')
    .select('*')
    .eq('fingerprint_hash', body.fingerprint_hash)
    .maybeSingle();

  // New device — no drift to compute
  if (!snapshot) {
    // Store the initial snapshot
    await supabase.from('device_fingerprint_snapshots').insert({
      fingerprint_hash: body.fingerprint_hash,
      signal_hashes: body.signal_hashes,
      signal_buckets: body.signal_buckets || {},
      flags: body.flags || {},
    });

    const result: DriftResult = {
      drift_score: 0,
      drift_reasons: [],
      is_within_tolerance: true,
      recommended_action: 'allow',
      is_new_device: true,
    };

    return jsonResponse(result);
  }

  // ── Compute drift score ────────────────────────────────────────
  const storedHashes = (snapshot.signal_hashes || {}) as Record<string, string>;
  const storedBuckets = (snapshot.signal_buckets || {}) as Record<string, string | number>;
  const storedFlags = (snapshot.flags || {}) as Record<string, boolean>;

  let driftScore = 0;
  const driftReasons: string[] = [];

  // Compare signal hashes
  for (const [signal, weight] of Object.entries(SIGNAL_WEIGHTS)) {
    const current = body.signal_hashes[signal] || '';
    const stored = storedHashes[signal] || '';

    if (stored && current && stored !== current) {
      driftScore += weight;
      driftReasons.push(`${signal}_changed`);
    }
  }

  // Compare buckets (screen, viewport, cores, memory)
  if (body.signal_buckets) {
    for (const [key, currentVal] of Object.entries(body.signal_buckets)) {
      const storedVal = storedBuckets[key];
      if (storedVal !== undefined && String(storedVal) !== String(currentVal)) {
        // Bucket changes add minor drift
        driftScore += 0.03;
        driftReasons.push(`${key}_bucket_shifted`);
      }
    }
  }

  // Hard negatives — automation flags override drift tolerance
  let hasHardNegative = false;
  if (body.flags) {
    for (const flag of HARD_NEGATIVE_FLAGS) {
      if (body.flags[flag] === true && !storedFlags[flag]) {
        hasHardNegative = true;
        driftScore += 0.25;
        driftReasons.push(`hard_negative:${flag}`);
      }
    }
  }

  // New hard negatives that appeared (weren't in previous snapshot)
  if (body.flags) {
    for (const flag of HARD_NEGATIVE_FLAGS) {
      if (body.flags[flag] === true) {
        hasHardNegative = true;
      }
    }
  }

  // Clamp drift score
  driftScore = Math.min(1, Math.max(0, driftScore));

  // ── Check historical reputation for trusted devices ────────────
  let isTrusted = false;
  const { data: events } = await supabase
    .from('defense_events')
    .select('action')
    .eq('fingerprint_hash', body.fingerprint_hash)
    .order('created_at', { ascending: false })
    .limit(50);

  if (events && events.length >= 10) {
    const blockRate = events.filter((e: any) => e.action === 'block').length / events.length;
    if (blockRate < 0.1) {
      isTrusted = true;
    }
  }

  // ── Determine action ──────────────────────────────────────────
  let recommendedAction: DriftResult['recommended_action'];

  if (hasHardNegative) {
    // Hard negatives always escalate regardless of trust
    recommendedAction = driftScore > CHALLENGE_THRESHOLD ? 'block' : 'challenge';
  } else if (driftScore <= TOLERANCE_THRESHOLD) {
    recommendedAction = 'allow';
  } else if (driftScore <= CHALLENGE_THRESHOLD) {
    // Trusted devices get more leniency in challenge range
    recommendedAction = isTrusted ? 'allow' : 'challenge';
  } else {
    // High drift — trusted devices get challenged instead of blocked
    recommendedAction = isTrusted && !hasHardNegative ? 'challenge' : 'block';
  }

  const isWithinTolerance = driftScore <= TOLERANCE_THRESHOLD && !hasHardNegative;

  // ── Update snapshot with latest signals ────────────────────────
  const driftEntry = {
    score: driftScore,
    reasons: driftReasons.slice(0, 10),
    action: recommendedAction,
    timestamp: new Date().toISOString(),
  };

  // Keep bounded drift history (last 20 entries)
  const existingHistory = Array.isArray(snapshot.drift_history) ? snapshot.drift_history : [];
  const updatedHistory = [...existingHistory.slice(-19), driftEntry];

  await supabase
    .from('device_fingerprint_snapshots')
    .update({
      signal_hashes: body.signal_hashes,
      signal_buckets: body.signal_buckets || {},
      flags: body.flags || {},
      drift_history: updatedHistory,
    })
    .eq('fingerprint_hash', body.fingerprint_hash);

  const result: DriftResult = {
    drift_score: Math.round(driftScore * 1000) / 1000,
    drift_reasons: driftReasons,
    is_within_tolerance: isWithinTolerance,
    recommended_action: recommendedAction,
    is_new_device: false,
  };

  console.log('[DEFENSE] Drift evaluation:', body.fingerprint_hash.slice(0, 8), 'score:', result.drift_score, 'action:', result.recommended_action);

  return jsonResponse(result);
}));
