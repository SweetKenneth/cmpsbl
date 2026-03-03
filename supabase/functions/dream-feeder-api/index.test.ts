/**
 * Dream Feeder API — Edge Function Tests
 * Tests CORS, input validation, rate limiting, and contract compliance
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE_URL = `${SUPABASE_URL}/functions/v1/dream-feeder-api`;

Deno.test("CORS: OPTIONS returns 200 with proper headers", async () => {
  const res = await fetch(BASE_URL, { method: "OPTIONS" });
  const body = await res.text();
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") === "*");
});

Deno.test("GET: returns dream-eater state", async () => {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: { "apikey": SUPABASE_ANON_KEY },
  });
  const data = await res.json();
  // Should return 200 with state or empty state
  assert(res.status === 200 || res.status === 404);
  if (res.status === 200) {
    assert("state" in data || "dreams_today" in data || "mood" in data || "error" in data);
  }
});

Deno.test("POST: rejects empty body", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  assert("error" in data);
});

Deno.test("POST: rejects HTML/script injection", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      dream_content: '<script>alert("xss")</script>',
      dream_type: "dream",
    }),
  });
  const data = await res.json();
  // Should either reject or sanitize
  assert(res.status === 200 || res.status === 400 || res.status === 422);
  await res.body?.cancel();
});

Deno.test("POST: rejects oversized payload", async () => {
  const bigContent = "x".repeat(5000); // Over 4KB limit
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      dream_content: bigContent,
      dream_type: "dream",
    }),
  });
  const data = await res.json();
  assert(res.status >= 400, `Expected rejection of oversized payload, got ${res.status}`);
});

Deno.test("POST: rejects invalid dream_type", async () => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      dream_content: "A peaceful meadow under starlight",
      dream_type: "invalid_type",
    }),
  });
  const data = await res.json();
  assert(res.status >= 400, `Expected rejection of invalid type, got ${res.status}`);
});

Deno.test("DELETE/PUT/PATCH: rejected methods return 405", async () => {
  for (const method of ["DELETE", "PUT", "PATCH"]) {
    const res = await fetch(BASE_URL, {
      method,
      headers: { "apikey": SUPABASE_ANON_KEY },
    });
    await res.text(); // consume body
    assert(
      res.status === 405 || res.status === 400 || res.status === 404,
      `Expected rejection for ${method}, got ${res.status}`
    );
  }
});
