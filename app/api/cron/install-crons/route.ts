import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(_req: NextRequest) {
  // This endpoint provides instructions for manual cron installation
  // Actual cron jobs must be configured in Supabase Dashboard
  
  return NextResponse.json({
    ok: true,
    message: "Cron installation instructions",
    actions: {
      remove: [
        "pf-brain-cycle (old 15-min cycle)",
        "pf-brain-continuous-learn (old continuous learning)",
        "pf-brain-report (old reporting)",
        "Any legacy brain_* cron jobs"
      ],
      add: [
        {
          name: "pf-brain-scheduler",
          schedule: "*/15 * * * *",
          function: "pf-brain-scheduler",
          description: "Runs every 15 minutes to process prioritized learning queries"
        },
        {
          name: "pf-brain-report", 
          schedule: "0 */6 * * *",
          function: "pf-brain-report",
          description: "Generates and emails 6-hour reports at minute 0 past every 6th hour"
        }
      ]
    },
    instructions: [
      "1. Go to Supabase Dashboard → Edge Functions → Cron Jobs",
      "2. Delete any existing brain-related cron jobs",
      "3. Create new cron: pf-brain-scheduler with schedule '*/15 * * * *'",
      "4. Create new cron: pf-brain-report with schedule '0 */6 * * *'",
      "5. Ensure RESEND_API_KEY is set in Supabase secrets for email reports"
    ]
  });
}
