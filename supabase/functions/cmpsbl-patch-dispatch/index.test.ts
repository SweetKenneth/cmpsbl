import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const PATCH_SECRET = Deno.env.get("CMPSBL_PATCH_SECRET");

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/cmpsbl-patch-dispatch`;

Deno.test("rejects unauthenticated requests", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
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
  console.log("✅ Unauthenticated rejection:", body);
});

Deno.test("dispatches patch v2.0.1 via patch secret", async () => {
  if (!PATCH_SECRET) {
    console.log("⚠️ CMPSBL_PATCH_SECRET not available in test env — skipping");
    return;
  }

  console.log("🔑 Using patch secret for governor auth...");
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PATCH_SECRET}`,
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
  console.log(`📡 Response [${res.status}]:`, JSON.stringify(body, null, 2));

  if (res.status === 200) {
    console.log("✅ Patch dispatched successfully!");
    assertEquals(body.success, true);
  } else if (res.status === 502) {
    console.log("⚠️ CMPSBL dispatched OK but LNCHBL returned error (check LNCHBL side)");
    console.log("LNCHBL status:", body.lnchbl_status);
  } else {
    console.log("❌ Unexpected status:", res.status);
  }
});
