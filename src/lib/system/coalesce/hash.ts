/**
 * Request Coalescing Hash — Auth-scope-aware deduplication key
 * Includes auth scope, permissions, tenant/user ID, and payload
 */

async function sha256(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface CoalesceContext {
  user_id?: string;
  auth_role?: string;
  scopes?: string[];
  tool_permissions?: string[];
  tenant_id?: string;
}

/** Generate a dedup key that includes auth context */
export async function generateCoalesceKey(
  url: string,
  method: string,
  body: unknown,
  context: CoalesceContext
): Promise<string> {
  const payload = {
    url,
    method: method.toUpperCase(),
    body: body ?? null,
    user_id: context.user_id ?? 'anon',
    auth_role: context.auth_role ?? 'anon',
    scopes: (context.scopes ?? []).sort(),
    tool_permissions: (context.tool_permissions ?? []).sort(),
    tenant_id: context.tenant_id ?? 'default',
  };

  return sha256(JSON.stringify(payload));
}
