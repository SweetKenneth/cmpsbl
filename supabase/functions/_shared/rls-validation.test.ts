/**
 * RLS Policy Validation Tests
 * Verifies that Row-Level Security policies correctly block unauthorized access
 * Tests run against the live database using anon key (no auth)
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

/** Helper: make a PostgREST request as anon user */
async function queryTable(table: string, method = "GET", body?: string): Promise<{ status: number; data: any }> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?limit=5`;
  const headers: Record<string, string> = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=minimal" : "return=representation",
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body || undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

// ═══════════════════════════════════════════════════════════════
// USER-PROTECTED TABLES — anon should get empty arrays (RLS blocks)
// ═══════════════════════════════════════════════════════════════

Deno.test("RLS: user_roles — anon SELECT returns empty", async () => {
  const { status, data } = await queryTable("user_roles");
  assertEquals(status, 200);
  assert(Array.isArray(data) && data.length === 0, "Anon should see no user_roles");
});

Deno.test("RLS: user_pack_activations — anon SELECT returns empty", async () => {
  const { status, data } = await queryTable("user_pack_activations");
  assertEquals(status, 200);
  assert(Array.isArray(data) && data.length === 0, "Anon should see no activations");
});

Deno.test("RLS: activation_audit_log — anon SELECT returns empty", async () => {
  const { status, data } = await queryTable("activation_audit_log");
  assertEquals(status, 200);
  assert(Array.isArray(data) && data.length === 0, "Anon should see no audit logs");
});

// ═══════════════════════════════════════════════════════════════
// WRITE PROTECTION — anon should NOT be able to insert
// ═══════════════════════════════════════════════════════════════

Deno.test("RLS: user_roles — anon INSERT blocked", async () => {
  const { status } = await queryTable("user_roles", "POST", JSON.stringify({
    user_id: "00000000-0000-0000-0000-000000000000",
    role: "admin",
  }));
  assert(status >= 400, `Expected INSERT rejection, got ${status}`);
});

Deno.test("RLS: audit_logs — anon INSERT blocked", async () => {
  const { status } = await queryTable("audit_logs", "POST", JSON.stringify({
    action: "test_injection",
    entity_type: "test",
  }));
  assert(status >= 400, `Expected INSERT rejection, got ${status}`);
});

Deno.test("RLS: evolution_runs — anon INSERT blocked", async () => {
  const { status } = await queryTable("evolution_runs", "POST", JSON.stringify({
    phase: "planning",
  }));
  assert(status >= 400, `Expected INSERT rejection, got ${status}`);
});

// ═══════════════════════════════════════════════════════════════
// SERVICE-ONLY TABLES — anon should not read internal data
// ═══════════════════════════════════════════════════════════════

Deno.test("RLS: nexus_provider_health — anon SELECT returns empty", async () => {
  const { status, data } = await queryTable("nexus_provider_health");
  // Should either return empty or 403/401
  assert(
    status >= 400 || (Array.isArray(data) && data.length === 0),
    `Internal table should not leak data to anon, got ${status}`
  );
});

Deno.test("RLS: nexus_cost_ledger — anon SELECT returns empty", async () => {
  const { status, data } = await queryTable("nexus_cost_ledger");
  assert(
    status >= 400 || (Array.isArray(data) && data.length === 0),
    `Cost ledger should not leak data to anon`
  );
});

Deno.test("RLS: governance_mode — anon cannot write", async () => {
  const { status } = await queryTable("governance_mode", "POST", JSON.stringify({
    mode: "LOCKDOWN",
    reason: "rls_test",
  }));
  assert(status >= 400, `Expected governance write rejection, got ${status}`);
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC TABLES — anon CAN read (intentional public access)
// ═══════════════════════════════════════════════════════════════

Deno.test("RLS: agency_templates — anon SELECT allowed (public catalog)", async () => {
  const { status } = await queryTable("agency_templates");
  assertEquals(status, 200, "Public catalog should be readable by anon");
});

Deno.test("RLS: discoveries — anon SELECT allowed (public showcase)", async () => {
  const { status } = await queryTable("discoveries");
  assertEquals(status, 200, "Public discoveries should be readable by anon");
});
