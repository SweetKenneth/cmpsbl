/**
 * pf-security-gate — Auth Security Hardening Edge Function
 * 
 * Handles:
 * 1. Auth event logging (signup, login, logout, password reset)
 * 2. Disposable email blocking on signup
 * 3. Login rate limiting per IP
 * 4. Geographic anomaly detection
 * 5. Admin IP allowlist verification
 * 
 * @author Kenneth E Sweet Jr
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ═══════════════════════════════════════════════════════════════
// DISPOSABLE EMAIL DOMAIN LIST (50+ domains)
// ═══════════════════════════════════════════════════════════════

const DISPOSABLE_DOMAINS = new Set([
  'maildrop.cc', 'guerrillamail.com', 'guerrillamail.de', 'grr.la',
  'guerrillamail.net', 'tempmail.com', 'throwaway.email', 'temp-mail.org',
  'tempail.com', 'fakeinbox.com', 'sharklasers.com', 'guerrillamailblock.com',
  'pokemail.net', 'spam4.me', 'dispostable.com', 'yopmail.com',
  'mailinator.com', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'leakscope-test.dev', 'tempinbox.com', 'discard.email', 'mailnesia.com',
  'harakirimail.com', 'meltmail.com', 'nospamfor.us', 'mailcatch.com',
  'mintemail.com', 'tempr.email', 'burnermail.io', 'jetable.org',
  'getairmail.com', 'filzmail.com', 'mailexpire.com',
  'mytemp.email', 'mohmal.com', 'emailondeck.com', 'getnada.com',
  'mailsac.com', '10minutemail.com', 'guerrillamail.info',
  'crazymailing.com', 'deadaddress.com', 'sogetthis.com', 'mailnator.com',
  'tmail.ws', 'bugmenot.com', 'tempmailo.com', 'throwam.com',
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain || '');
}

// ═══════════════════════════════════════════════════════════════
// IP GEOLOCATION (using free ip-api.com)
// ═══════════════════════════════════════════════════════════════

interface GeoData {
  country: string;
  city: string;
  lat: number;
  lon: number;
}

async function getGeoFromIP(ip: string): Promise<GeoData | null> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return null;
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,lat,lon`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) { await res.text(); return null; }
    const data = await res.json();
    return { country: data.country, city: data.city, lat: data.lat, lon: data.lon };
  } catch {
    return null;
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════

async function checkRateLimit(supabase: ReturnType<typeof getSupabaseAdmin>, ip: string): Promise<{ blocked: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('auth_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('failed_at', windowStart);

  const attempts = count ?? 0;
  const MAX_ATTEMPTS = 5;

  return { blocked: attempts >= MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - attempts) };
}

async function recordFailedAttempt(supabase: ReturnType<typeof getSupabaseAdmin>, ip: string, email?: string): Promise<void> {
  await supabase.from('auth_rate_limits').insert({
    ip_address: ip,
    email: email || null,
    attempt_type: 'login',
  });
}

// ═══════════════════════════════════════════════════════════════
// ADMIN IP ALLOWLIST
// ═══════════════════════════════════════════════════════════════

async function isAdminIPAllowed(supabase: ReturnType<typeof getSupabaseAdmin>, ip: string): Promise<boolean> {
  // If no entries in allowlist, allow all (not yet configured)
  const { count: totalCount } = await supabase
    .from('admin_ip_allowlist')
    .select('*', { count: 'exact', head: true });

  if (!totalCount || totalCount === 0) return true;

  const { count } = await supabase
    .from('admin_ip_allowlist')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip);

  return (count ?? 0) > 0;
}

// ═══════════════════════════════════════════════════════════════
// GEO ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════════

async function detectGeoAnomaly(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  ip: string
): Promise<{ isAnomalous: boolean; distance: number }> {
  const geo = await getGeoFromIP(ip);
  if (!geo) return { isAnomalous: false, distance: 0 };

  // Get last known geo login
  const { data: lastGeo } = await supabase
    .from('auth_geo_log')
    .select('latitude, longitude, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let distance = 0;
  let isAnomalous = false;

  if (lastGeo?.latitude && lastGeo?.longitude) {
    distance = haversineKm(lastGeo.latitude, lastGeo.longitude, geo.lat, geo.lon);
    const timeDiffHours = (Date.now() - new Date(lastGeo.created_at).getTime()) / (1000 * 60 * 60);
    // Flag if > 500km in < 2 hours (impossible travel)
    if (distance > 500 && timeDiffHours < 2) {
      isAnomalous = true;
    }
  }

  // Log the geo event
  await supabase.from('auth_geo_log').insert({
    user_id: userId,
    ip_address: ip,
    country_code: geo.country,
    city: geo.city,
    latitude: geo.lat,
    longitude: geo.lon,
    distance_from_last_km: distance,
    is_anomalous: isAnomalous,
  });

  if (isAnomalous) {
    await supabase.from('audit_logs').insert({
      action: 'GEO_ANOMALY_DETECTED',
      performed_by: userId,
      entity_type: 'auth',
      details: {
        ip,
        country: geo.country,
        city: geo.city,
        distance_km: Math.round(distance),
        severity: 'critical',
      },
    });
  }

  return { isAnomalous, distance };
}

// ═══════════════════════════════════════════════════════════════
// AUTH EVENT LOGGER
// ═══════════════════════════════════════════════════════════════

async function logAuthEvent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  eventType: string,
  userId: string | null,
  email: string | null,
  ip: string,
  userAgent: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const geo = await getGeoFromIP(ip);

  await supabase.from('auth_events').insert({
    user_id: userId,
    email,
    event_type: eventType,
    ip_address: ip,
    user_agent: userAgent,
    geo_country: geo?.country || null,
    geo_city: geo?.city || null,
    metadata,
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { action } = body;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || req.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    switch (action) {
      // ── Validate email before signup ──
      case 'validate_signup': {
        const { email } = body;
        if (!email || typeof email !== 'string') {
          return new Response(JSON.stringify({ error: 'Email required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (isDisposableEmail(email)) {
          await logAuthEvent(supabase, 'blocked_disposable_email', null, email, ip, userAgent);
          return new Response(JSON.stringify({
            allowed: false,
            reason: 'Please use a permanent email address. Disposable email services are not permitted.',
          }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ allowed: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── Check rate limit before login ──
      case 'check_rate_limit': {
        const rateLimit = await checkRateLimit(supabase, ip);
        if (rateLimit.blocked) {
          await logAuthEvent(supabase, 'login_rate_limited', null, body.email || null, ip, userAgent);
        }
        return new Response(JSON.stringify(rateLimit), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── Record failed login ──
      case 'record_failed_login': {
        await recordFailedAttempt(supabase, ip, body.email);
        await logAuthEvent(supabase, 'login_failed', null, body.email || null, ip, userAgent);
        return new Response(JSON.stringify({ recorded: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── Log successful auth event ──
      case 'log_auth_event': {
        const { event_type, user_id, email } = body;
        await logAuthEvent(supabase, event_type, user_id || null, email || null, ip, userAgent, body.metadata || {});

        // Run geo anomaly detection on login
        if (event_type === 'login_success' && user_id) {
          const geoResult = await detectGeoAnomaly(supabase, user_id, ip);
          return new Response(JSON.stringify({ logged: true, geo_anomaly: geoResult.isAnomalous }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ logged: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── Check admin IP allowlist ──
      case 'check_admin_ip': {
        const allowed = await isAdminIPAllowed(supabase, ip);
        if (!allowed) {
          await logAuthEvent(supabase, 'admin_ip_blocked', body.user_id || null, null, ip, userAgent, {
            severity: 'critical',
          });
        }
        return new Response(JSON.stringify({ allowed, ip }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── Get security dashboard data (admin only) ──
      case 'security_dashboard': {
        // Verify admin via JWT
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return new Response(JSON.stringify({ error: 'Invalid token' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: isAdmin } = await supabase.rpc('has_role_text', {
          _user_id: user.id, _role: 'admin',
        });

        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Forbidden' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Fetch security metrics
        const [recentEvents, geoAnomalies, rateLimits, canaryStatus] = await Promise.all([
          supabase.from('auth_events').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('auth_geo_log').select('*').eq('is_anomalous', true).order('created_at', { ascending: false }).limit(20),
          supabase.from('auth_rate_limits').select('*').gte('failed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).order('failed_at', { ascending: false }),
          supabase.from('canary_tokens').select('*'),
        ]);

        return new Response(JSON.stringify({
          recent_events: recentEvents.data || [],
          geo_anomalies: geoAnomalies.data || [],
          rate_limit_events: rateLimits.data || [],
          canary_tokens: canaryStatus.data || [],
        }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
