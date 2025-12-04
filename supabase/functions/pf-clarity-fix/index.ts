import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { issue, html, context } = await req.json();

    console.log(`Auto-fixing issue: ${issue.wcag_criterion}`);

    let fixedHtml = html;
    let appliedFixes = [];

    // Apply fixes based on issue type
    switch (issue.wcag_criterion) {
      case "1.1.1": // Missing alt text
        const altTextFix = await generateAltText(context);
        fixedHtml = html.replace(
          /<img([^>]*)>/gi,
          (match: string, attrs: string) => {
            if (!attrs.includes('alt=')) {
              appliedFixes.push("Added AI-generated alt text to images");
              return `<img${attrs} alt="${altTextFix}">`;
            }
            return match;
          }
        );
        break;

      case "3.1.1": // Missing lang attribute
        fixedHtml = html.replace(
          /<html([^>]*)>/i,
          (match: string, attrs: string) => {
            if (!attrs.includes('lang=')) {
              appliedFixes.push("Added lang='en' to html element");
              return `<html${attrs} lang="en">`;
            }
            return match;
          }
        );
        break;

      case "2.4.6": // Multiple H1s
        let h1Count = 0;
        fixedHtml = html.replace(
          /<h1([^>]*)>/gi,
          (match: string, attrs: string) => {
            h1Count++;
            if (h1Count > 1) {
              appliedFixes.push("Converted extra H1 headings to H2");
              return `<h2${attrs}>`;
            }
            return match;
          }
        );
        fixedHtml = fixedHtml.replace(/<\/h1>/gi, (match: string, offset: number) => {
          const position = html.substring(0, offset).split('<h1').length - 1;
          return position > 0 ? '</h2>' : match;
        });
        break;

      default:
        appliedFixes.push("No automatic fix available for this issue");
    }

    return new Response(
      JSON.stringify({
        success: true,
        fixed_html: fixedHtml,
        applied_fixes: appliedFixes,
        issue_resolved: appliedFixes.length > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Auto-fix error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateAltText(context: any): Promise<string> {
  // In production, this would call PromptFluid Nexus for AI-generated alt text
  // For now, return a placeholder
  return "AI-generated description";
}
