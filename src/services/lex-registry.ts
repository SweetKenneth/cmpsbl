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
  const { data, error } = await supabase.functions.invoke("lex-registry-lookup", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (error) throw new Error("Registry lookup failed");

  // Edge function returns via GET — supabase.functions.invoke sends POST by default,
  // so we use the query-param approach via direct fetch instead
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

  const { data, error } = await supabase
    .from("lex_registry" as string)
    .select("*")
    .eq("registrant_user_id", user.id)
    .order("registered_at", { ascending: false });

  if (error) throw new Error("Failed to fetch registrations");
  return data as unknown as LexRegistryEntry[];
}

/** Get audit trail for a registry entry */
export async function getRegistryAudit(registryId: string) {
  const { data, error } = await supabase
    .from("lex_registry_events" as string)
    .select("*")
    .eq("registry_id", registryId)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Failed to fetch audit trail");
  return data;
}

/** Generate SHA-256 hash of a string (for client-side hash generation) */
export async function generatePackageHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
