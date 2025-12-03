import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, wcag_level = "AA", include_suggestions = true } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Scanning URL: ${url} for WCAG ${wcag_level}`);

    // Fetch the page content
    const pageResponse = await fetch(url);
    const html = await pageResponse.text();

    // Perform accessibility scan
    const issues = await performAccessibilityScan(html, wcag_level);

    const response = {
      url,
      wcag_level,
      issues,
      total_issues: issues.length,
      compliance_score: calculateComplianceScore(issues),
      scanned_at: new Date().toISOString(),
      suggestions: include_suggestions ? generateSuggestions(issues) : []
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Scan error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function performAccessibilityScan(html: string, wcagLevel: string) {
  const issues = [];

  // Check for missing alt text
  const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)/gi) || []).length;
  if (imgWithoutAlt > 0) {
    issues.push({
      severity: "critical",
      wcag_criterion: "1.1.1",
      issue: "Images without alt text",
      count: imgWithoutAlt,
      description: "Images must have alt text for screen readers"
    });
  }

  // Check for missing form labels
  const inputsWithoutLabels = (html.match(/<input(?![^>]*aria-label)(?![^>]*id="[^"]*"[^>]*<label[^>]*for="[^"]*")/gi) || []).length;
  if (inputsWithoutLabels > 0) {
    issues.push({
      severity: "critical",
      wcag_criterion: "3.3.2",
      issue: "Form inputs without labels",
      count: inputsWithoutLabels,
      description: "All form inputs must have associated labels"
    });
  }

  // Check for low contrast (simplified check)
  const hasLowContrast = html.includes('color:') && html.includes('background');
  if (hasLowContrast) {
    issues.push({
      severity: "warning",
      wcag_criterion: "1.4.3",
      issue: "Potential contrast issues",
      description: "Text must have sufficient contrast with background"
    });
  }

  // Check for missing language attribute
  if (!html.match(/<html[^>]*lang=/i)) {
    issues.push({
      severity: "critical",
      wcag_criterion: "3.1.1",
      issue: "Missing language attribute",
      description: "HTML element must have a lang attribute"
    });
  }

  // Check for heading hierarchy
  const h1Count = (html.match(/<h1/gi) || []).length;
  if (h1Count === 0) {
    issues.push({
      severity: "warning",
      wcag_criterion: "2.4.6",
      issue: "No H1 heading found",
      description: "Pages should have at least one H1 heading"
    });
  } else if (h1Count > 1) {
    issues.push({
      severity: "warning",
      wcag_criterion: "2.4.6",
      issue: "Multiple H1 headings",
      count: h1Count,
      description: "Pages should have only one H1 heading"
    });
  }

  return issues;
}

function calculateComplianceScore(issues: any[]) {
  const criticalWeight = 10;
  const warningWeight = 5;
  
  let deductions = 0;
  issues.forEach(issue => {
    if (issue.severity === "critical") {
      deductions += criticalWeight * (issue.count || 1);
    } else if (issue.severity === "warning") {
      deductions += warningWeight * (issue.count || 1);
    }
  });

  return Math.max(0, 100 - deductions);
}

function generateSuggestions(issues: any[]) {
  return issues.map(issue => ({
    criterion: issue.wcag_criterion,
    suggestion: getSuggestionForIssue(issue),
    priority: issue.severity === "critical" ? "high" : "medium"
  }));
}

function getSuggestionForIssue(issue: any) {
  const suggestions: Record<string, string> = {
    "1.1.1": "Add descriptive alt text to all images. Use AI to generate contextual descriptions.",
    "3.3.2": "Ensure all form inputs have associated labels using <label> elements or aria-label.",
    "1.4.3": "Increase text contrast to meet WCAG AA standards (4.5:1 for normal text).",
    "3.1.1": "Add lang attribute to <html> element (e.g., <html lang='en'>).",
    "2.4.6": "Use a single H1 heading per page that describes the main content."
  };

  return suggestions[issue.wcag_criterion] || "Review and fix this accessibility issue.";
}
