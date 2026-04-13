/**
 * Lex Registry Client Service
 * Bridges the Shield UI to the Lex Registry backend.
 * 
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from "@/integrations/supabase/client";

export type LexRegistryStatus = "protected" | "licensed" | "unregistered";

export interface LexRegistryEntry {
  status: LexRegistryStatus;
  package_name: string | null;
  package_hash: string | null;
  registrant_org: string | null;
  registered_at: string | null;
}

export interface LexRegistration {
  id: string;
  package_name: string;
  package_hash: string;
  status: LexRegistryStatus;
  registered_at: string;
}

/** Public lookup — no auth required */
export async function lookupRegistry(
  params: { hash?: string; name?: string }
): Promise<LexRegistryEntry> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = new URL(`https://${projectId}.supabase.co/functions/v1/lex-registry-lookup`);
  if (params.hash) url.searchParams.set("hash", params.hash);
  if (params.name) url.searchParams.set("name", params.name);

  const res = await fetch(url.toString(), {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!res.ok) throw new Error("Registry lookup failed");
  return res.json();
}

/** Register a package — auth required */
export async function registerPackage(params: {
  package_name: string;
  package_hash: string;
  status?: "protected" | "licensed";
  org?: string;
  metadata?: Record<string, unknown>;
}): Promise<LexRegistration> {
  const { data, error } = await supabase.functions.invoke("lex-registry-register", {
    body: params,
  });

  if (error) throw new Error(error.message || "Registration failed");
  if (!data?.success) throw new Error(data?.error || "Registration failed");

  return data.registration;
}

/** Get all registrations for the current user (direct DB query) */
export async function getMyRegistrations(): Promise<LexRegistryEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Use rpc-style query to avoid type issues with new tables
  const { data, error } = await (supabase as unknown as { from: (t: string) => unknown })
    .from("lex_registry") as { data: unknown; error: unknown };

  // Direct fetch approach for type safety
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const res = await fetch(
    `${projectUrl}/rest/v1/lex_registry?registrant_user_id=eq.${user.id}&order=registered_at.desc`,
    {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch registrations");
  return res.json();
}

/** Get audit trail for a registry entry */
export async function getRegistryAudit(registryId: string): Promise<unknown[]> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(
    `${projectUrl}/rest/v1/lex_registry_events?registry_id=eq.${registryId}&order=created_at.asc`,
    {
      headers: {
        apikey: apiKey,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch audit trail");
  return res.json();
}

/** Generate SHA-256 hash of a string (for client-side hash generation) */
export async function generatePackageHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Audit chain verification result */
export interface ChainVerificationResult {
  registry_id: string;
  chain_intact: boolean;
  total_events: number;
  verified_events: number;
  first_break_at: number | null;
  first_break_event_id: string | null;
  expected_hash: string | null;
  actual_hash: string | null;
  terminal_hash: string | null;
}

/** Verify audit chain integrity for a registry entry */
export async function verifyAuditChain(registryId: string): Promise<ChainVerificationResult> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = new URL(`https://${projectId}.supabase.co/functions/v1/lex-registry-verify-chain`);
  url.searchParams.set("registry_id", registryId);

  const res = await fetch(url.toString(), {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!res.ok) throw new Error("Chain verification failed");
  return res.json();
}
