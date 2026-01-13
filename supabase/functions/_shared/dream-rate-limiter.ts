/**
 * Rate Limiter for Dream Feeder API
 * Implements IP-based and account-based rate limiting
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  resetAt: string;
  retryAfterSeconds?: number;
}

interface RateLimitRecord {
  id: string;
  identifier: string;
  identifier_type: string;
  request_count: number;
  window_start: string;
  created_at: string;
  updated_at: string;
}

/**
 * Check and update IP-based rate limit
 * 15 requests per 5 minutes per IP
 */
export async function checkIPRateLimit(
  supabase: SupabaseClient,
  ip: string,
  limit: number = 15,
  windowMinutes: number = 5
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const resetAt = new Date(Date.now() + windowMinutes * 60 * 1000);

  try {
    // Get current count in window
    const { data, error: fetchError } = await supabase
      .from('dream_rate_limits')
      .select('*')
      .eq('identifier', ip)
      .eq('identifier_type', 'ip')
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit fetch error:', fetchError);
      // Fail open - allow request if rate limit check fails
      return { allowed: true, currentCount: 0, limit, resetAt: resetAt.toISOString() };
    }

    const existing = data as RateLimitRecord | null;

    if (existing) {
      const currentCount = existing.request_count || 0;
      const windowStartTime = new Date(existing.window_start);
      const actualResetAt = new Date(windowStartTime.getTime() + windowMinutes * 60 * 1000);
      
      if (currentCount >= limit) {
        const retryAfterSeconds = Math.ceil((actualResetAt.getTime() - Date.now()) / 1000);
        return {
          allowed: false,
          currentCount,
          limit,
          resetAt: actualResetAt.toISOString(),
          retryAfterSeconds: Math.max(0, retryAfterSeconds),
        };
      }

      // Increment counter
      await supabase
        .from('dream_rate_limits')
        .update({
          request_count: currentCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      return {
        allowed: true,
        currentCount: currentCount + 1,
        limit,
        resetAt: actualResetAt.toISOString(),
      };
    }

    // Create new window
    await supabase
      .from('dream_rate_limits')
      .insert({
        identifier: ip,
        identifier_type: 'ip',
        request_count: 1,
        window_start: new Date().toISOString(),
      });

    return {
      allowed: true,
      currentCount: 1,
      limit,
      resetAt: resetAt.toISOString(),
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open
    return { allowed: true, currentCount: 0, limit, resetAt: resetAt.toISOString() };
  }
}

/**
 * Check daily account limit (by user agent + IP as proxy for account)
 * 50 requests per day per "account"
 */
export async function checkDailyLimit(
  supabase: SupabaseClient,
  identifier: string,
  limit: number = 50
): Promise<RateLimitResult> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const { data, error: fetchError } = await supabase
      .from('dream_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('identifier_type', 'daily')
      .gte('window_start', today.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Daily limit fetch error:', fetchError);
      return { allowed: true, currentCount: 0, limit, resetAt: tomorrow.toISOString() };
    }

    const existing = data as RateLimitRecord | null;

    if (existing) {
      const currentCount = existing.request_count || 0;
      
      if (currentCount >= limit) {
        const retryAfterSeconds = Math.ceil((tomorrow.getTime() - Date.now()) / 1000);
        return {
          allowed: false,
          currentCount,
          limit,
          resetAt: tomorrow.toISOString(),
          retryAfterSeconds,
        };
      }

      await supabase
        .from('dream_rate_limits')
        .update({
          request_count: currentCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      return {
        allowed: true,
        currentCount: currentCount + 1,
        limit,
        resetAt: tomorrow.toISOString(),
      };
    }

    await supabase
      .from('dream_rate_limits')
      .insert({
        identifier,
        identifier_type: 'daily',
        request_count: 1,
        window_start: today.toISOString(),
      });

    return {
      allowed: true,
      currentCount: 1,
      limit,
      resetAt: tomorrow.toISOString(),
    };

  } catch (error) {
    console.error('Daily limit check error:', error);
    return { allowed: true, currentCount: 0, limit, resetAt: tomorrow.toISOString() };
  }
}

/**
 * Log rejected/suspicious request to audit table
 */
export async function logToAudit(
  supabase: SupabaseClient,
  data: {
    rawText: string;
    sanitizedText?: string;
    dreamType?: string;
    rejectionReason: string;
    classificationTags?: string[];
    sourceIP?: string;
    userAgent?: string;
    requestHeaders?: Record<string, string>;
    riskScore?: number;
  }
): Promise<void> {
  try {
    await supabase
      .from('dream_ingestion_audit')
      .insert({
        raw_text: data.rawText.substring(0, 2000),
        sanitized_text: data.sanitizedText?.substring(0, 2000) || null,
        dream_type: data.dreamType || null,
        rejection_reason: data.rejectionReason,
        classification_tags: data.classificationTags || [],
        source_ip: data.sourceIP || null,
        user_agent: data.userAgent || null,
        request_headers: data.requestHeaders || null,
        risk_score: data.riskScore || 0,
      });
  } catch (error) {
    console.error('Failed to log to audit:', error);
  }
}
