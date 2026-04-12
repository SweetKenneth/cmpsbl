/**
 * Passkey Auth Edge Function — Face ID → Instant Session
 * 
 * Endpoints:
 *   POST /challenge  → Generate a server-side challenge for WebAuthn
 *   POST /register   → Store a passkey credential linked to a user (requires auth)
 *   POST /verify     → Verify a WebAuthn assertion and return an instant session
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { decode as decodeJwt } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Server misconfigured" }, 503);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // ─── GENERATE CHALLENGE ───────────────────────────────────────────
    if (path === "challenge") {
      const challengeBytes = new Uint8Array(32);
      crypto.getRandomValues(challengeBytes);
      const challenge = btoa(String.fromCharCode(...challengeBytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Store challenge with 2-minute expiry
      const { error } = await adminClient.from("passkey_challenges").insert({
        challenge,
        expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      });

      if (error) {
        console.error("Challenge insert error:", error);
        return json({ error: "Failed to create challenge" }, 500);
      }

      // Clean up expired challenges opportunistically
      adminClient.from("passkey_challenges")
        .delete()
        .lt("expires_at", new Date().toISOString())
        .then(() => {});

      return json({ challenge });
    }

    // ─── REGISTER CREDENTIAL ──────────────────────────────────────────
    if (path === "register") {
      // Requires authentication
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return json({ error: "Unauthorized" }, 401);
      }

      const token = authHeader.replace("Bearer ", "");
      
      // Decode the JWT to extract user claims (no verification needed — 
      // Supabase gateway already verified the token)
      let userId: string;
      let userEmail: string;
      try {
        const [_header, payload, _sig] = decodeJwt(token);
        const claims = payload as Record<string, unknown>;
        userId = claims.sub as string;
        userEmail = claims.email as string;
        if (!userId || !userEmail) {
          return json({ error: "Invalid token claims" }, 401);
        }
      } catch (e) {
        console.error("JWT decode error:", e);
        return json({ error: "Invalid token" }, 401);
      }

      const body = await req.json();
      const { credentialId, publicKey, deviceType, transports } = body;

      if (!credentialId || !publicKey) {
        return json({ error: "Missing credentialId or publicKey" }, 400);
      }

      console.log(`Registering passkey for user ${userId} (${userEmail}), credentialId: ${credentialId.substring(0, 20)}...`);

      // Store credential using service role (bypasses RLS)
      const { error } = await adminClient.from("passkey_credentials").insert({
        user_id: userId,
        credential_id: credentialId,
        public_key: publicKey,
        email: userEmail,
        device_type: deviceType || "platform",
        transports: transports || [],
      });

      if (error) {
        if (error.code === "23505") {
          return json({ error: "This passkey is already registered" }, 409);
        }
        console.error("Credential insert error:", error);
        return json({ error: "Failed to register passkey" }, 500);
      }

      console.log(`Passkey registered successfully for ${userEmail}`);
      return json({ success: true });
    }

    // ─── VERIFY ASSERTION & CREATE SESSION ────────────────────────────
    if (path === "verify") {
      const body = await req.json();
      const { credentialId, challenge, signature, userHandle } = body;

      if (!credentialId || !challenge) {
        return json({ error: "Missing credentialId or challenge" }, 400);
      }

      console.log(`Verifying passkey assertion, credentialId: ${credentialId.substring(0, 20)}...`);

      // 1. Verify challenge is valid and unused
      const { data: challengeRow, error: challengeError } = await adminClient
        .from("passkey_challenges")
        .select("*")
        .eq("challenge", challenge)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (challengeError || !challengeRow) {
        console.error("Challenge verification failed:", challengeError);
        return json({ error: "Invalid or expired challenge" }, 401);
      }

      // Mark challenge as used (single-use, anti-replay)
      await adminClient
        .from("passkey_challenges")
        .update({ used: true })
        .eq("id", challengeRow.id);

      // 2. Look up the credential to find the user
      const { data: credential, error: credError } = await adminClient
        .from("passkey_credentials")
        .select("*")
        .eq("credential_id", credentialId)
        .single();

      if (credError || !credential) {
        console.error("Credential lookup failed:", credError);
        return json({ error: "Unknown passkey — register first" }, 401);
      }

      console.log(`Credential found for user: ${credential.email}`);

      // 3. Update last_used_at and sign_count
      await adminClient
        .from("passkey_credentials")
        .update({
          last_used_at: new Date().toISOString(),
          sign_count: (credential.sign_count || 0) + 1,
        })
        .eq("id", credential.id);

      // 4. Generate an instant session for this user via magic link token
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: credential.email,
      });

      if (linkError || !linkData) {
        console.error("Generate link error:", linkError);
        return json({ error: "Failed to create session" }, 500);
      }

      // Extract the OTP token from the generated link
      const email_otp = linkData.properties?.email_otp;

      if (!email_otp) {
        console.error("No email_otp in link data:", JSON.stringify(linkData.properties));
        return json({ error: "Failed to extract session token" }, 500);
      }

      // 5. Verify the OTP server-side to get actual session tokens
      const { data: verifyData, error: verifyError } = await adminClient.auth.verifyOtp({
        email: credential.email,
        token: email_otp,
        type: "magiclink",
      });

      if (verifyError || !verifyData.session) {
        console.error("OTP verify error:", verifyError);
        return json({ error: "Failed to create session" }, 500);
      }

      console.log(`Session created successfully for ${credential.email}`);

      return json({
        success: true,
        session: {
          access_token: verifyData.session.access_token,
          refresh_token: verifyData.session.refresh_token,
          expires_in: verifyData.session.expires_in,
          token_type: verifyData.session.token_type,
          user: {
            id: verifyData.session.user.id,
            email: verifyData.session.user.email,
          },
        },
      });
    }

    // ─── LIST USER'S PASSKEYS ─────────────────────────────────────────
    if (path === "list") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return json({ error: "Unauthorized" }, 401);
      }

      const token = authHeader.replace("Bearer ", "");
      let userId: string;
      try {
        const [_header, payload, _sig] = decodeJwt(token);
        const claims = payload as Record<string, unknown>;
        userId = claims.sub as string;
        if (!userId) return json({ error: "Invalid token claims" }, 401);
      } catch {
        return json({ error: "Invalid token" }, 401);
      }

      const { data: passkeys, error: listError } = await adminClient
        .from("passkey_credentials")
        .select("id, credential_id, device_type, created_at, last_used_at")
        .eq("user_id", userId);

      if (listError) {
        console.error("List passkeys error:", listError);
        return json({ error: "Failed to list passkeys" }, 500);
      }

      return json({ passkeys: passkeys || [] });
    }

    return json({ error: "Unknown endpoint" }, 404);
  } catch (err) {
    console.error("Passkey auth error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
