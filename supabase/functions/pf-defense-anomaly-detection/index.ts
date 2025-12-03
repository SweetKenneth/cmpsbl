import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AnomalySchema = z.object({
  lookbackHours: z.number().int().min(1).max(168).optional().default(24)
});

interface AnomalyScore {
  overall_score: number;
  factors: {
    risk_score_anomaly: number;
    request_rate_anomaly: number;
    fingerprint_anomaly: number;
    behavioral_anomaly: number;
  };
  is_anomalous: boolean;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validation = AnomalySchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { lookbackHours } = validation.data;

    // Fetch recent defense events
    const cutoffTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();
    const { data: events, error: eventsError } = await supabase
      .from('defense_events')
      .select('*')
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    if (!events || events.length < 10) {
      return new Response(
        JSON.stringify({
          anomalies: [],
          message: 'Insufficient data for anomaly detection (need at least 10 events)',
          baseline_events: events?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate baseline statistics
    const riskScores = events.map(e => e.risk_score);
    const avgRiskScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
    const stdDevRiskScore = Math.sqrt(
      riskScores.reduce((sum, val) => sum + Math.pow(val - avgRiskScore, 2), 0) / riskScores.length
    );

    // Group by time buckets (hourly) for rate anomaly detection
    const timeBuckets = new Map<string, number>();
    events.forEach(e => {
      const hourBucket = new Date(e.created_at).toISOString().slice(0, 13);
      timeBuckets.set(hourBucket, (timeBuckets.get(hourBucket) || 0) + 1);
    });

    const avgRequestsPerHour = Array.from(timeBuckets.values()).reduce((a, b) => a + b, 0) / timeBuckets.size;
    const stdDevRequestsPerHour = Math.sqrt(
      Array.from(timeBuckets.values()).reduce((sum, val) => sum + Math.pow(val - avgRequestsPerHour, 2), 0) / timeBuckets.size
    );

    // Track fingerprint frequency
    const fingerprintCounts = new Map<string, number>();
    events.forEach(e => {
      if (e.metadata?.fingerprint) {
        fingerprintCounts.set(e.metadata.fingerprint, (fingerprintCounts.get(e.metadata.fingerprint) || 0) + 1);
      }
    });

    // Detect anomalies
    const anomalies: any[] = [];
    const recentEvents = events.slice(0, Math.min(20, events.length));

    for (const event of recentEvents) {
      const score = calculateAnomalyScore(
        event,
        avgRiskScore,
        stdDevRiskScore,
        avgRequestsPerHour,
        stdDevRequestsPerHour,
        fingerprintCounts
      );

      if (score.is_anomalous) {
        anomalies.push({
          event_id: event.id,
          timestamp: event.created_at,
          risk_score: event.risk_score,
          action: event.action,
          ip_address: event.ip,
          anomaly_score: score.overall_score,
          factors: score.factors,
          confidence: score.confidence,
          reason: event.reason
        });
      }
    }

    // Sort anomalies by severity
    anomalies.sort((a, b) => b.anomaly_score - a.anomaly_score);

    return new Response(
      JSON.stringify({
        anomalies: anomalies.slice(0, 10), // Top 10 anomalies
        total_anomalies: anomalies.length,
        baseline_events: events.length,
        lookback_hours: lookbackHours,
        statistics: {
          avg_risk_score: avgRiskScore.toFixed(2),
          std_dev_risk_score: stdDevRiskScore.toFixed(2),
          avg_requests_per_hour: avgRequestsPerHour.toFixed(2),
          unique_fingerprints: fingerprintCounts.size
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in anomaly-detection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateAnomalyScore(
  event: any,
  avgRiskScore: number,
  stdDevRiskScore: number,
  avgRequestsPerHour: number,
  stdDevRequestsPerHour: number,
  fingerprintCounts: Map<string, number>
): AnomalyScore {
  let overallScore = 0;
  const factors = {
    risk_score_anomaly: 0,
    request_rate_anomaly: 0,
    fingerprint_anomaly: 0,
    behavioral_anomaly: 0
  };

  // Risk score anomaly (z-score)
  const riskZScore = Math.abs((event.risk_score - avgRiskScore) / (stdDevRiskScore || 1));
  factors.risk_score_anomaly = Math.min(riskZScore / 3, 1); // Normalize to 0-1
  overallScore += factors.risk_score_anomaly * 40; // 40% weight

  // Fingerprint frequency anomaly
  const fingerprint = event.metadata?.fingerprint;
  if (fingerprint) {
    const fingerprintCount = fingerprintCounts.get(fingerprint) || 1;
    if (fingerprintCount > 10) {
      factors.fingerprint_anomaly = Math.min(fingerprintCount / 50, 1);
      overallScore += factors.fingerprint_anomaly * 30; // 30% weight
    }
  }

  // Behavioral anomaly (based on reasons)
  if (event.reason && Array.isArray(event.reason) && event.reason.length > 3) {
    factors.behavioral_anomaly = Math.min(event.reason.length / 8, 1);
    overallScore += factors.behavioral_anomaly * 20; // 20% weight
  }

  // Request rate anomaly
  factors.request_rate_anomaly = 0.1; // Base value
  overallScore += factors.request_rate_anomaly * 10; // 10% weight

  const confidence = overallScore > 50 ? 0.85 + (Math.min(overallScore - 50, 50) / 50) * 0.15 : 0.5 + (overallScore / 50) * 0.35;

  return {
    overall_score: Math.round(overallScore),
    factors,
    is_anomalous: overallScore >= 50,
    confidence: Math.round(confidence * 100) / 100
  };
}