import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutoFixResult {
  issue_id: string;
  success: boolean;
  fix_code?: string;
  fix_description?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scan_id } = await req.json();

    if (!scan_id) {
      return new Response(
        JSON.stringify({ error: "scan_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch auto-fixable issues
    const { data: issues, error: fetchError } = await supabase
      .from("pf_clarity_issues")
      .select("*")
      .eq("scan_id", scan_id)
      .eq("status", "open")
      .eq("auto_fixable", true);

    if (fetchError) throw fetchError;

    console.log(`Processing ${issues?.length || 0} auto-fixable issues for scan ${scan_id}`);

    const results: AutoFixResult[] = [];

    for (const issue of issues || []) {
      try {
        const fixResult = await applyAutoFix(issue);
        
        if (fixResult.success) {
          // Insert fix record
          await supabase.from("pf_clarity_fixes").insert({
            issue_id: issue.id,
            fix_type: issue.issue_type,
            fix_code: fixResult.fix_code,
            fix_description: fixResult.fix_description,
            status: "applied",
            applied_at: new Date().toISOString(),
          });

          // Update issue status
          await supabase
            .from("pf_clarity_issues")
            .update({
              status: "auto_fixed",
              auto_fix_attempted: true,
              auto_fix_successful: true,
            })
            .eq("id", issue.id);

          results.push({
            issue_id: issue.id,
            success: true,
            fix_code: fixResult.fix_code,
            fix_description: fixResult.fix_description,
          });
        } else {
          // Mark as pending review
          await supabase
            .from("pf_clarity_issues")
            .update({
              status: "pending_review",
              auto_fix_attempted: true,
              auto_fix_successful: false,
            })
            .eq("id", issue.id);

          results.push({
            issue_id: issue.id,
            success: false,
            error: fixResult.error,
          });
        }
      } catch (error) {
        console.error(`Error fixing issue ${issue.id}:`, error);
        results.push({
          issue_id: issue.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    // Update scan stats
    await supabase
      .from("pf_clarity_scans")
      .update({
        issues_auto_fixed: successCount,
        issues_pending_review: failCount,
      })
      .eq("id", scan_id);

    return new Response(
      JSON.stringify({
        success: true,
        total_processed: results.length,
        fixes_applied: successCount,
        fixes_failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch auto-fix error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function applyAutoFix(issue: any): Promise<{ success: boolean; fix_code?: string; fix_description?: string; error?: string }> {
  try {
    switch (issue.issue_type) {
      case "missing_alt_text":
        return {
          success: true,
          fix_code: `img.setAttribute('alt', 'AI-generated: Decorative image');`,
          fix_description: "Added AI-generated alt text to image",
        };

      case "missing_lang_attribute":
        return {
          success: true,
          fix_code: `document.documentElement.setAttribute('lang', 'en');`,
          fix_description: "Added lang='en' to html element",
        };

      case "multiple_h1":
        return {
          success: true,
          fix_code: `
            const h1Elements = document.querySelectorAll('h1');
            h1Elements.forEach((h1, index) => {
              if (index > 0) {
                const h2 = document.createElement('h2');
                h2.innerHTML = h1.innerHTML;
                h1.replaceWith(h2);
              }
            });
          `,
          fix_description: "Converted extra H1 headings to H2",
        };

      case "input_missing_label":
        return {
          success: true,
          fix_code: `input.setAttribute('aria-label', 'Input field');`,
          fix_description: "Added aria-label to input field",
        };

      case "missing_skip_link":
        return {
          success: true,
          fix_code: `
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'skip-link';
            document.body.insertBefore(skipLink, document.body.firstChild);
          `,
          fix_description: "Added skip navigation link",
        };

      case "non_keyboard_accessible":
        return {
          success: true,
          fix_code: `element.setAttribute('tabindex', '0');`,
          fix_description: "Added tabindex to make element keyboard accessible",
        };

      case "autoplay_no_controls":
        return {
          success: true,
          fix_code: `audio.setAttribute('controls', 'controls');`,
          fix_description: "Added controls to autoplay audio",
        };

      case "missing_title":
        return {
          success: true,
          fix_code: `
            if (!document.title) {
              document.title = document.querySelector('h1')?.textContent || 'Untitled Page';
            }
          `,
          fix_description: "Added page title",
        };

      default:
        return {
          success: false,
          error: `No auto-fix available for issue type: ${issue.issue_type}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
