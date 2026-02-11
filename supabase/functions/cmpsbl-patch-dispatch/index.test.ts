import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/cmpsbl-patch-dispatch`;

Deno.test("cmpsbl-patch-dispatch - rejects unauthenticated requests", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      target_distribution: "LNCHBL",
      patch_version: "2.0.1-test",
      capabilities: ["test"],
      engines: [],
      changelog: "Unauthenticated test",
      config_overrides: {},
    }),
  });
  const body = await res.text();
  assertEquals(res.status, 401);
  console.log("Unauthenticated rejection:", body);
});

Deno.test("cmpsbl-patch-dispatch - authenticated admin dispatch", async () => {
  // Sign in as the governor to get a valid JWT
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: "kennethsweet214@gmail.com",
      // This test requires the governor's password - will fail without it
      // but validates the flow
      password: Deno.env.get("TEST_GOVERNOR_PASSWORD") || "placeholder",
    }),
  });
  const signInBody = await signInRes.json();

  if (!signInBody.access_token) {
    console.log("⚠️ Could not authenticate - skipping live dispatch test");
    console.log("Set TEST_GOVERNOR_PASSWORD env var to run full test");
    return;
  }

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${signInBody.access_token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      target_distribution: "LNCHBL",
      patch_version: "2.0.1",
      capabilities: ["test-capability"],
      engines: [],
      changelog: "Test patch v2.0.1 from CMPSBL dispatch layer",
      config_overrides: {},
    }),
  });
  const body = await res.json();
  console.log("Dispatch response:", res.status, JSON.stringify(body, null, 2));
});
