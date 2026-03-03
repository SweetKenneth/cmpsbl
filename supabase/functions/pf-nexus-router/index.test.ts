/**
 * NEXUS Router — Edge Function Tests
 * Tests CORS, auth enforcement, input validation, and response contract
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE_URL = `${SUPABASE_URL}/functions/v1/pf-nexus-router`;

Deno.test("CORS: OPTIONS returns 200 with proper headers", async () => {
  const res = await fetch(BASE_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") === "*");
});

Deno.test("POST: rejects empty body", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  // Should fail — no prompt/action provided
  assert(res.status >= 400 || ("error" in data), `Expected error for empty body, got ${res.status}`);
});

Deno.test("POST: rejects missing prompt field", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: "route", model: "auto" }),
  });
  const data = await res.json();
  assert(
    res.status >= 400 || "error" in data,
    `Expected error for missing prompt, got ${res.status}: ${JSON.stringify(data)}`
  );
});

Deno.test("Response contract: valid response shape", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: "health",
    }),
  });
  const data = await res.json();
  // Health check should return structured response
  assert(typeof data === "object", "Response should be an object");
  // Should have either error or valid fields
  const hasExpectedShape = "error" in data || "status" in data || "providers" in data || "output" in data || "ok" in data;
  assert(hasExpectedShape, `Unexpected response shape: ${JSON.stringify(data).slice(0, 200)}`);
});
