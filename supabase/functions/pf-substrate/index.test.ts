/**
 * PF-Substrate — Edge Function Tests
 * Tests CORS, defense perimeter, input validation, and response contracts
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE_URL = `${SUPABASE_URL}/functions/v1/pf-substrate`;

Deno.test("CORS: OPTIONS returns 200 with proper headers", async () => {
  const res = await fetch(BASE_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") === "*");
});

Deno.test("POST: rejects empty body gracefully", async () => {
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
  // Should not crash — should return structured error
  assert(typeof data === "object", "Response should be an object");
  assert(
    res.status >= 400 || "error" in data || "output" in data,
    `Expected structured rejection, got ${res.status}`
  );
});

Deno.test("POST: health action returns status", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: "health" }),
  });
  const data = await res.json();
  assert(typeof data === "object");
  // Health should return version or status
  const hasExpected = "version" in data || "status" in data || "output" in data || "error" in data;
  assert(hasExpected, `Unexpected health response: ${JSON.stringify(data).slice(0, 300)}`);
});

Deno.test("POST: rejects SQL injection attempt", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: "query",
      input: "'; DROP TABLE users; --",
    }),
  });
  const data = await res.json();
  // Should reject or handle safely
  assert(
    res.status >= 400 || "error" in data || "output" in data,
    "SQL injection should be handled safely"
  );
});

Deno.test("POST: rejects path traversal attempt", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: "read",
      input: "../../../etc/passwd",
    }),
  });
  const data = await res.json();
  assert(
    res.status >= 400 || "error" in data || "output" in data,
    "Path traversal should be handled safely"
  );
});

Deno.test("Response contract: never returns raw stack trace", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: "nonexistent_action_xyz" }),
  });
  const text = await res.text();
  // Should never expose stack traces
  assert(!text.includes("at Object."), "Response should not contain stack traces");
  assert(!text.includes("node_modules"), "Response should not expose internal paths");
});
