/**
 * Unified Edge Middleware — Shared CORS, Auth, Error Handling, Security Headers
 * Gap Analysis P0: Eliminates copy-paste boilerplate across 80+ edge functions.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/** Security headers appended to every response */
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '0',
};

/** All default headers merged */
export const defaultHeaders: Record<string, string> = {
  ...corsHeaders,
  ...securityHeaders,
  'Content-Type': 'application/json',
};

// ═══════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════

export interface AuthContext {
  userId: string;
  email?: string;
  isAdmin: boolean;
}

/** Create a Supabase admin client (service role) */
export function createAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

/** Create a Supabase client scoped to the requesting user */
export function createUserClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    },
  );
}

/** Extract and validate the authenticated user from the request */
export async function requireAuth(req: Request): Promise<AuthContext> {
  const supabase = createUserClient(req);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new EdgeError('Unauthorized', 401, 'AUTH_REQUIRED');
  }

  // Check admin role via RLS-safe RPC
  const adminClient = createAdminClient();
  const { data: isAdmin } = await adminClient.rpc('has_role_text', {
    _user_id: user.id,
    _role: 'admin',
  });

  return {
    userId: user.id,
    email: user.email,
    isAdmin: !!isAdmin,
  };
}

/** Require admin role — throws if not admin */
export async function requireAdmin(req: Request): Promise<AuthContext> {
  const ctx = await requireAuth(req);
  if (!ctx.isAdmin) {
    throw new EdgeError('Admin access required', 403, 'ADMIN_REQUIRED');
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

export class EdgeError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code: string = 'BAD_REQUEST',
  ) {
    super(message);
    this.name = 'EdgeError';
  }
}

/** Wrap a handler with CORS, error handling, and security headers */
export function withMiddleware(
  handler: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const response = await handler(req);

      // Append security headers to successful responses
      const headers = new Headers(response.headers);
      for (const [key, value] of Object.entries(securityHeaders)) {
        if (!headers.has(key)) headers.set(key, value);
      }
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (!headers.has(key)) headers.set(key, value);
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      if (err instanceof EdgeError) {
        return jsonResponse(
          { error: err.message, code: err.code },
          err.status,
        );
      }

      // Log full error server-side, return generic message to client
      console.error('[EdgeMiddleware] Unhandled error:', err);
      return jsonResponse(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        500,
      );
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════

/** Create a JSON response with all default headers */
export function jsonResponse(
  data: unknown,
  status = 200,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...defaultHeaders, ...extra },
  });
}

/** Parse JSON body with size limit */
export async function parseBody<T = unknown>(
  req: Request,
  maxBytes = 16384,
): Promise<T> {
  const contentLength = parseInt(req.headers.get('content-length') || '0');
  if (contentLength > maxBytes) {
    throw new EdgeError(`Payload too large (max ${maxBytes} bytes)`, 413, 'PAYLOAD_TOO_LARGE');
  }

  try {
    return await req.json() as T;
  } catch {
    throw new EdgeError('Invalid JSON body', 400, 'INVALID_JSON');
  }
}
