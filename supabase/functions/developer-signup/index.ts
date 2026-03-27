import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Developer Signup - Email-Only API Key Generation
 * Simplified signup flow for instant SDK access
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, name } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if developer already exists
    const { data: existingDev } = await supabase
      .from("access_developers")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .single();

    let developerId: string;

    if (existingDev) {
      developerId = existingDev.id;
      
      // Check for existing active key
      const { data: existingKey } = await supabase
        .from("access_api_keys")
        .select("key_prefix, created_at")
        .eq("developer_id", developerId)
        .eq("is_active", true)
        .single();

      if (existingKey) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "You already have an API key. Check your email for the original key.",
            keyPrefix: existingKey.key_prefix,
            createdAt: existingKey.created_at,
            note: "For security, we only show the full key once at creation. Contact support if you need a new key.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Create new developer
      const { data: newDev, error: devError } = await supabase
        .from("access_developers")
        .insert({
          email: email.toLowerCase(),
          display_name: name || email.split("@")[0],
          status: "active",
          metadata: {
            source: "developer-signup",
            signupAt: new Date().toISOString(),
          }
        })
        .select()
        .single();

      if (devError) throw devError;
      developerId = newDev.id;
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 11); // cmpsbl_xxxx

    // Store the key
    const { error: keyError } = await supabase
      .from("access_api_keys")
      .insert({
        developer_id: developerId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: "Default API Key",
        scopes: ["memory:read", "memory:write", "playground"],
        rate_limit_per_minute: 60,
        rate_limit_per_day: 1000,
        is_active: true,
      });

    if (keyError) throw keyError;

    // Log the signup event
    await supabase.from("brain_events").insert({
      module: "access",
      event_type: "developer_signup",
      data: {
        email: email.toLowerCase(),
        keyPrefix,
        source: "developer-signup",
      },
      outcome: "completed",
    });

    return new Response(
      JSON.stringify({
        success: true,
        apiKey, // Only shown ONCE
        keyPrefix,
        message: "🎉 Your API key has been generated! Save it now - you won't see it again.",
        quickstart: {
          install: "npm install @cmpsbl/sdk",
          usage: `import { withPersistentMemory } from '@cmpsbl/sdk';

const agent = withPersistentMemory({
  apiKey: '${apiKey}',
  agentId: 'my-agent'
});`,
          docs: "https://cmpsbl.com/docs/persistent-memory",
        },
        limits: {
          requestsPerMinute: 60,
          requestsPerDay: 1000,
          tier: "free",
        },
        terminalCommands: [
          "memory.status     # Check memory tiers",
          "memory.store <content>  # Save a memory",
          "memory.recall <query>   # Retrieve memories",
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Developer signup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Signup failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "cmpsbl_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
