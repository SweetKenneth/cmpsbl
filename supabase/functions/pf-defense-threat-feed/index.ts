import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LEGAL_NOTICE = {
  warning: "⚖️ LEGAL NOTICE - PRIVATE API ENDPOINT",
  notice: "This API endpoint and all associated services, domains, and subdomains located at PromptFluid.com are PRIVATE and PROPRIETARY.",
  terms: "Unauthorized access, use, scraping, reproduction, or distribution of this API or its data is STRICTLY PROHIBITED and constitutes a violation of federal and state laws including but not limited to the Computer Fraud and Abuse Act (18 U.S.C. § 1030).",
  enforcement: "Any unauthorized use will result in immediate legal action including civil damages and criminal prosecution to the fullest extent of the law.",
  trademark: "PromptFluid™ is a registered trademark (filed November 2025). All rights reserved.",
  contact: "Authorized access inquiries: legal@promptfluid.com",
  jurisdiction: "This service operates under U.S. federal jurisdiction with additional state-level protections.",
  monitoring: "All access is monitored and logged. IP addresses and request metadata are retained for legal purposes.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // GET /recent - Latest threat intelligence
    if (req.method === "GET" && path === "recent") {
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const severity = url.searchParams.get("severity");
      
      let query = supabase
        .from("pf_global_threat_feed")
        .select("*")
        .eq("public_visible", true)
        .order("detected_at", { ascending: false })
        .limit(limit);

      if (severity) {
        query = query.eq("severity", severity);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          count: data?.length || 0,
          threats: data,
          api_version: "1.0.0",
          legal_notice: LEGAL_NOTICE
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /stats - Global threat statistics
    if (req.method === "GET" && path === "stats") {
      const { data: stats, error } = await supabase
        .from("pf_threat_statistics")
        .select("*")
        .limit(100);

      if (error) throw error;

      // Aggregate by threat type and severity
      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};
      let totalThreats = 0;

      stats?.forEach((stat) => {
        const count = stat.count || 0;
        byType[stat.threat_type] = (byType[stat.threat_type] || 0) + count;
        bySeverity[stat.severity] = (bySeverity[stat.severity] || 0) + count;
        totalThreats += count;
      });

      return new Response(
        JSON.stringify({
          success: true,
          period: "30_days",
          total_threats: totalThreats,
          by_type: byType,
          by_severity: bySeverity,
          api_version: "1.0.0",
          legal_notice: LEGAL_NOTICE
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /map - Geographic threat distribution
    if (req.method === "GET" && path === "map") {
      const { data, error } = await supabase
        .from("pf_global_threat_feed")
        .select("country_code, severity")
        .eq("public_visible", true)
        .not("country_code", "is", null);

      if (error) throw error;

      // Aggregate by country
      const countryMap: Record<string, { count: number; severities: Record<string, number> }> = {};

      data?.forEach((threat) => {
        const code = threat.country_code;
        if (!countryMap[code]) {
          countryMap[code] = { count: 0, severities: {} };
        }
        countryMap[code].count++;
        countryMap[code].severities[threat.severity] = 
          (countryMap[code].severities[threat.severity] || 0) + 1;
      });

      return new Response(
        JSON.stringify({
          success: true,
          countries: countryMap,
          total_countries: Object.keys(countryMap).length,
          api_version: "1.0.0",
          legal_notice: LEGAL_NOTICE
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /ip/{ip} - IP reputation lookup
    if (req.method === "GET" && url.pathname.includes("/ip/")) {
      const ipSegments = url.pathname.split("/ip/");
      const ip = ipSegments[ipSegments.length - 1];

      const { data, error } = await supabase
        .from("pf_global_threat_feed")
        .select("*")
        .eq("ip_address", ip)
        .eq("public_visible", true)
        .order("detected_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const threatCount = data?.length || 0;
      const lastSeen = data?.[0]?.detected_at || null;
      const severities = data?.reduce((acc: Record<string, number>, threat) => {
        acc[threat.severity] = (acc[threat.severity] || 0) + 1;
        return acc;
      }, {});

      let reputation = "clean";
      if (threatCount > 10) reputation = "malicious";
      else if (threatCount > 3) reputation = "suspicious";
      else if (threatCount > 0) reputation = "flagged";

      return new Response(
        JSON.stringify({
          success: true,
          ip,
          reputation,
          threat_count: threatCount,
          last_seen: lastSeen,
          severity_breakdown: severities,
          recent_threats: data?.slice(0, 10),
          api_version: "1.0.0",
          legal_notice: LEGAL_NOTICE
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /report - Submit threat (rate limited)
    if (req.method === "POST" && path === "report") {
      const body = await req.json();
      
      const { threat_type, threat_category, ip_address, attack_vector, severity, description } = body;

      if (!threat_type || !severity) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields: threat_type, severity" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert threat report
      const { data, error } = await supabase
        .from("pf_global_threat_feed")
        .insert({
          threat_type,
          threat_category: threat_category || "unknown",
          ip_address: ip_address || null,
          attack_vector: attack_vector || null,
          severity,
          description: description || null,
          public_visible: false, // Admin approval required
          anonymized: true
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Threat report submitted for review",
          threat_id: data.id,
          api_version: "1.0.0",
          legal_notice: LEGAL_NOTICE
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /feed - RSS/JSON feed
    if (req.method === "GET" && path === "feed") {
      const format = url.searchParams.get("format") || "json";
      const limit = parseInt(url.searchParams.get("limit") || "50");

      const { data, error } = await supabase
        .from("pf_global_threat_feed")
        .select("*")
        .eq("public_visible", true)
        .order("detected_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (format === "rss") {
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PromptFluid Defense - Global Threat Intelligence</title>
    <link>https://api.promptfluid.com/threat-intelligence</link>
    <description>⚖️ PRIVATE API - Unauthorized access prohibited. Real-time threat intelligence feed from PromptFluid Defense network. PromptFluid™ trademark filed Nov 2025. All access monitored and logged.</description>
    <language>en-us</language>
    <copyright>© 2025 PromptFluid. All rights reserved. Unauthorized use subject to legal action.</copyright>
    ${data?.map(threat => `
    <item>
      <title>[${threat.severity.toUpperCase()}] ${threat.threat_type} - ${threat.threat_category}</title>
      <description>${threat.description || 'No description'}</description>
      <pubDate>${new Date(threat.detected_at).toUTCString()}</pubDate>
      <guid>${threat.id}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`;

        return new Response(rss, {
          headers: { ...corsHeaders, "Content-Type": "application/rss+xml" }
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          format: "json",
          count: data?.length || 0,
          threats: data,
          api_version: "1.0.0",
          legal_notice: LEGAL_NOTICE
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 404 - Invalid endpoint
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid endpoint",
        available_endpoints: [
          "/recent",
          "/stats",
          "/map",
          "/ip/{ip_address}",
          "/report",
          "/feed"
        ],
        api_version: "1.0.0",
        legal_notice: LEGAL_NOTICE
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Threat feed API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        api_version: "1.0.0",
        legal_notice: LEGAL_NOTICE
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});