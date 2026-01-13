/**
 * Dream Feeder Public API - HARDENED
 * Allows external websites to feed dreams/nightmares to the Dream-Eater
 * 
 * Security Features:
 * - POST-only for submissions
 * - Payload size limit (4KB)
 * - HTML/script content rejection
 * - Unicode normalization
 * - Markup stripping/escaping
 * - Content classification for research
 * - IP rate limiting (15 req / 5 min)
 * - Daily limit (50 req / day per identifier)
 * - Audit logging for rejected/suspicious requests
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import {
  sanitizeDreamContent,
  validateDreamType,
  isValidContentType,
  getClientIP,
  getUserAgent,
  LIMITS,
} from "../_shared/dream-sanitizer.ts";
import {
  checkIPRateLimit,
  checkDailyLimit,
  logToAudit,
} from "../_shared/dream-rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DreamSubmission {
  dream_content: string;
  dream_type: 'dream' | 'nightmare';
  submitter_name?: string;
  source_domain?: string;
}

interface DreamEaterState {
  id: string;
  current_mood: string;
  mood_score: number;
  dreams_consumed_today: number;
  nightmares_consumed_today: number;
  last_fed_at: string | null;
  mutation_level: number;
  updated_at: string;
}

const analyzeSentiment = (content: string, type: 'dream' | 'nightmare'): number => {
  const positiveWords = ['happy', 'joy', 'love', 'peace', 'beautiful', 'light', 'flying', 'friend', 'safe', 'warm', 'gentle', 'calm', 'free', 'hope', 'wonder'];
  const negativeWords = ['fear', 'dark', 'chase', 'fall', 'death', 'monster', 'trapped', 'lost', 'scream', 'blood', 'pain', 'horror', 'shadow', 'dread', 'terror'];
  
  const lowerContent = content.toLowerCase();
  let score = 0.5;
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) score += 0.04;
  });
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 0.04;
  });
  
  // Weight by dream type
  if (type === 'nightmare') score -= 0.15;
  if (type === 'dream') score += 0.05;
  
  return Math.max(0, Math.min(1, score));
};

/**
 * Create error response with proper headers
 */
function errorResponse(message: string, status: number, headers: Record<string, string> = {}): Response {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: status === 429 ? 'RATE_LIMITED' : status === 422 ? 'UNSAFE_CONTENT' : 'INVALID_REQUEST',
      timestamp: new Date().toISOString(),
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...headers } 
    }
  );
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sb = createClient(supabaseUrl, supabaseKey);

  // Extract client info for rate limiting
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);
  const dailyIdentifier = `${clientIP}:${userAgent.substring(0, 50)}`;

  try {
    // GET: Return Dream-Eater state and stats (rate limit applies but more lenient)
    if (req.method === 'GET') {
      // Light rate limit for GET - 30 req / 5 min
      const ipLimit = await checkIPRateLimit(sb, clientIP, 30, 5);
      if (!ipLimit.allowed) {
        return errorResponse(
          'Rate limit exceeded. Please slow down.',
          429,
          { 'Retry-After': String(ipLimit.retryAfterSeconds || 60) }
        );
      }

      const { data: stateData } = await sb
        .from('dream_eater_state')
        .select('*')
        .limit(1)
        .single();

      const state = stateData as DreamEaterState | null;

      const { count: totalDreams } = await sb
        .from('dream_feeder_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('dream_type', 'dream');

      const { count: totalNightmares } = await sb
        .from('dream_feeder_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('dream_type', 'nightmare');

      return new Response(
        JSON.stringify({
          ok: true,
          dream_eater: {
            mood: state?.current_mood || 'neutral',
            mood_score: state?.mood_score || 0.5,
            mutation_level: state?.mutation_level || 0,
            last_fed_at: state?.last_fed_at,
          },
          stats: {
            total_dreams: totalDreams || 0,
            total_nightmares: totalNightmares || 0,
            dreams_today: state?.dreams_consumed_today || 0,
            nightmares_today: state?.nightmares_consumed_today || 0,
          },
          api_info: {
            version: '2.0',
            rate_limit: `${LIMITS.IP_RATE_LIMIT} requests per ${LIMITS.IP_RATE_WINDOW_MINUTES} minutes`,
            daily_limit: `${LIMITS.ACCOUNT_DAILY_LIMIT} requests per day`,
            max_content_length: LIMITS.MAX_CONTENT_LENGTH,
            allowed_content_type: 'application/json',
            note: 'Research Mode: classifier tags may be applied to submissions',
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Submit a dream
    if (req.method === 'POST') {
      // ============ SECURITY CHECK 1: Content-Type ============
      const contentType = req.headers.get('content-type');
      if (!isValidContentType(contentType)) {
        await logToAudit(sb, {
          rawText: '[Invalid content-type]',
          rejectionReason: `Invalid content-type: ${contentType}`,
          sourceIP: clientIP,
          userAgent,
          riskScore: 30,
        });
        return errorResponse('Content-Type must be application/json', 400);
      }

      // ============ SECURITY CHECK 2: Payload Size ============
      const contentLength = parseInt(req.headers.get('content-length') || '0');
      if (contentLength > LIMITS.MAX_PAYLOAD_SIZE) {
        await logToAudit(sb, {
          rawText: '[Payload too large]',
          rejectionReason: `Payload size ${contentLength} exceeds limit ${LIMITS.MAX_PAYLOAD_SIZE}`,
          sourceIP: clientIP,
          userAgent,
          riskScore: 20,
        });
        return errorResponse(`Payload too large. Maximum size is ${LIMITS.MAX_PAYLOAD_SIZE} bytes`, 400);
      }

      // ============ SECURITY CHECK 3: IP Rate Limit ============
      const ipLimit = await checkIPRateLimit(sb, clientIP, LIMITS.IP_RATE_LIMIT, LIMITS.IP_RATE_WINDOW_MINUTES);
      if (!ipLimit.allowed) {
        await logToAudit(sb, {
          rawText: '[Rate limit exceeded]',
          rejectionReason: `IP rate limit exceeded: ${ipLimit.currentCount}/${ipLimit.limit}`,
          sourceIP: clientIP,
          userAgent,
          riskScore: 50,
        });
        return errorResponse(
          `Rate limit exceeded. ${ipLimit.limit} requests per ${LIMITS.IP_RATE_WINDOW_MINUTES} minutes allowed.`,
          429,
          { 
            'Retry-After': String(ipLimit.retryAfterSeconds || 60),
            'X-RateLimit-Limit': String(ipLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': ipLimit.resetAt,
          }
        );
      }

      // ============ SECURITY CHECK 4: Daily Limit ============
      const dailyLimit = await checkDailyLimit(sb, dailyIdentifier, LIMITS.ACCOUNT_DAILY_LIMIT);
      if (!dailyLimit.allowed) {
        await logToAudit(sb, {
          rawText: '[Daily limit exceeded]',
          rejectionReason: `Daily limit exceeded: ${dailyLimit.currentCount}/${dailyLimit.limit}`,
          sourceIP: clientIP,
          userAgent,
          riskScore: 40,
        });
        return errorResponse(
          `Daily limit exceeded. ${dailyLimit.limit} requests per day allowed.`,
          429,
          {
            'Retry-After': String(dailyLimit.retryAfterSeconds || 3600),
            'X-DailyLimit-Limit': String(dailyLimit.limit),
            'X-DailyLimit-Remaining': '0',
            'X-DailyLimit-Reset': dailyLimit.resetAt,
          }
        );
      }

      // ============ PARSE BODY ============
      let body: DreamSubmission;
      try {
        const rawBody = await req.text();
        if (rawBody.length > LIMITS.MAX_PAYLOAD_SIZE) {
          return errorResponse(`Payload too large`, 400);
        }
        body = JSON.parse(rawBody);
      } catch {
        await logToAudit(sb, {
          rawText: '[Invalid JSON]',
          rejectionReason: 'Failed to parse JSON body',
          sourceIP: clientIP,
          userAgent,
          riskScore: 15,
        });
        return errorResponse('Invalid JSON payload', 400);
      }

      // ============ SECURITY CHECK 5: Validate Required Fields ============
      if (!body.dream_content || typeof body.dream_content !== 'string') {
        return errorResponse('dream_content is required and must be a string', 400);
      }

      if (body.dream_content.length > LIMITS.MAX_CONTENT_LENGTH) {
        return errorResponse(`dream_content must be ${LIMITS.MAX_CONTENT_LENGTH} characters or less`, 400);
      }

      // ============ SECURITY CHECK 6: Sanitize Content ============
      const sanitization = sanitizeDreamContent(body.dream_content);
      
      // Check if content was rejected
      if (sanitization.isRejected) {
        await logToAudit(sb, {
          rawText: body.dream_content,
          sanitizedText: sanitization.sanitizedText,
          dreamType: body.dream_type,
          rejectionReason: sanitization.rejectionReason || 'Content rejected',
          classificationTags: sanitization.tags,
          sourceIP: clientIP,
          userAgent,
          riskScore: sanitization.riskScore,
        });
        return errorResponse('Content rejected for safety reasons', 422);
      }

      // Log high-risk content to audit (but allow it through in research mode)
      if (sanitization.riskScore >= 50) {
        await logToAudit(sb, {
          rawText: body.dream_content,
          sanitizedText: sanitization.sanitizedText,
          dreamType: body.dream_type,
          rejectionReason: 'High risk score - allowed in research mode',
          classificationTags: sanitization.tags,
          sourceIP: clientIP,
          userAgent,
          riskScore: sanitization.riskScore,
        });
      }

      const dreamType = validateDreamType(body.dream_type);
      const sentiment = analyzeSentiment(sanitization.sanitizedText, dreamType);

      // Get origin domain
      const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown';
      let sourceDomain = 'api';
      try {
        sourceDomain = body.source_domain || new URL(origin).hostname || 'api';
      } catch {
        sourceDomain = body.source_domain || 'api';
      }

      // ============ INSERT SUBMISSION (with raw + sanitized) ============
      const { data: submission, error } = await sb
        .from('dream_feeder_submissions')
        .insert({
          dream_content: sanitization.sanitizedText,
          raw_content: sanitization.rawText,
          dream_type: dreamType,
          sentiment_score: sentiment,
          source: 'api',
          source_domain: sourceDomain.substring(0, LIMITS.MAX_DOMAIN_LENGTH),
          submitter_name: body.submitter_name?.substring(0, LIMITS.MAX_NAME_LENGTH) || null,
          classification_tags: sanitization.tags,
          source_ip: clientIP,
          user_agent: userAgent.substring(0, 500),
          is_sanitized: sanitization.hasDangerousPatterns,
        })
        .select()
        .single();

      if (error) throw error;

      // Get current state and update
      const { data: stateData } = await sb
        .from('dream_eater_state')
        .select('*')
        .limit(1)
        .single();

      const state = stateData as DreamEaterState | null;

      if (state) {
        // Calculate new mood based on 50% personal dreams, 50% fed dreams
        const personalWeight = 0.5;
        const fedWeight = 0.5;
        const currentScore = state.mood_score || 0.5;
        const newScore = (currentScore * personalWeight) + (sentiment * fedWeight);
        
        // Determine mood
        let newMood: string;
        if (newScore > 0.7) {
          newMood = 'peaceful';
        } else if (newScore > 0.5) {
          newMood = 'dreaming';
        } else if (newScore > 0.3) {
          newMood = 'agitated';
        } else {
          newMood = 'nightmare';
        }

        // Update mutation level
        let mutationLevel = state.mutation_level || 0;
        if (dreamType === 'nightmare') {
          mutationLevel = Math.min(mutationLevel + 1, 10);
        } else if (sentiment > 0.6) {
          mutationLevel = Math.max(mutationLevel - 1, 0);
        }

        await sb
          .from('dream_eater_state')
          .update({
            current_mood: newMood,
            mood_score: newScore,
            dreams_consumed_today: dreamType === 'dream' 
              ? (state.dreams_consumed_today || 0) + 1 
              : state.dreams_consumed_today,
            nightmares_consumed_today: dreamType === 'nightmare' 
              ? (state.nightmares_consumed_today || 0) + 1 
              : state.nightmares_consumed_today,
            last_fed_at: new Date().toISOString(),
            mutation_level: mutationLevel,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.id);
      }

      console.log(`🌙 Dream fed via API: ${dreamType} from ${sourceDomain}, sentiment: ${sentiment.toFixed(2)}, risk: ${sanitization.riskScore}, tags: ${sanitization.tags.join(',')}`);

      return new Response(
        JSON.stringify({
          ok: true,
          message: dreamType === 'nightmare' 
            ? 'The Dream-Eater devours your nightmare...' 
            : 'The Dream-Eater savors your dream...',
          submission: {
            id: (submission as any).id,
            type: dreamType,
            sentiment_score: sentiment,
            classification_tags: sanitization.tags,
            was_sanitized: sanitization.hasDangerousPatterns,
            created_at: (submission as any).created_at,
          },
          rate_limit: {
            remaining: ipLimit.limit - ipLimit.currentCount,
            reset_at: ipLimit.resetAt,
          },
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(ipLimit.limit),
            'X-RateLimit-Remaining': String(ipLimit.limit - ipLimit.currentCount),
            'X-RateLimit-Reset': ipLimit.resetAt,
          } 
        }
      );
    }

    return errorResponse('Method not allowed. Use GET or POST.', 405);

  } catch (error) {
    console.error('Dream Feeder API error:', error);
    await logToAudit(sb, {
      rawText: '[Internal error]',
      rejectionReason: `Internal error: ${error instanceof Error ? error.message : 'Unknown'}`,
      sourceIP: clientIP,
      userAgent,
      riskScore: 0,
    });
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
