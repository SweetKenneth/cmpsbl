import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LearningRequest {
  action: 'get_progress' | 'award_xp' | 'complete_skill' | 'check_certification' | 'earn_badge' | 'get_skill_tree' | 'start_tutorial' | 'update_tutorial' | 'save_sandbox' | 'load_sandbox';
  developer_id: string;
  skill_key?: string;
  xp_amount?: number;
  tutorial_id?: string;
  step_index?: number;
  code_submission?: string;
  sandbox_data?: Record<string, unknown>;
  session_name?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const request = await req.json() as LearningRequest;
    const { action, developer_id } = request;

    if (!developer_id) {
      return new Response(
        JSON.stringify({ error: "developer_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: unknown;

    switch (action) {
      case 'get_skill_tree': {
        const { data: skills } = await supabase
          .from("developer_skill_tree")
          .select("*")
          .eq("is_active", true)
          .order("tier", { ascending: true });

        const { data: progress } = await supabase
          .from("developer_progress")
          .select("*")
          .eq("developer_id", developer_id);

        const progressMap = new Map(progress?.map(p => [p.skill_key, p]) || []);
        
        result = {
          skills: skills?.map(s => ({
            ...s,
            progress: progressMap.get(s.skill_key) || null,
            is_unlocked: s.prerequisites.length === 0 || 
              s.prerequisites.every((prereq: string) => progressMap.get(prereq)?.is_completed)
          }))
        };
        break;
      }

      case 'get_progress': {
        const { data: progress } = await supabase
          .from("developer_progress")
          .select("*, developer_skill_tree(*)")
          .eq("developer_id", developer_id);

        const { data: badges } = await supabase
          .from("developer_earned_badges")
          .select("*, developer_certifications(*)")
          .eq("developer_id", developer_id);

        const totalXp = progress?.reduce((sum, p) => sum + (p.xp_earned || 0), 0) || 0;
        const completedSkills = progress?.filter(p => p.is_completed).length || 0;

        result = {
          progress,
          badges,
          total_xp: totalXp,
          completed_skills: completedSkills,
          level: Math.floor(totalXp / 500) + 1
        };
        break;
      }

      case 'award_xp': {
        const { skill_key, xp_amount } = request;
        if (!skill_key || !xp_amount) {
          throw new Error("skill_key and xp_amount required");
        }

        // Get skill info
        const { data: skill } = await supabase
          .from("developer_skill_tree")
          .select("*")
          .eq("skill_key", skill_key)
          .single();

        if (!skill) {
          throw new Error("Skill not found");
        }

        // Upsert progress
        const { data: existing } = await supabase
          .from("developer_progress")
          .select("*")
          .eq("developer_id", developer_id)
          .eq("skill_key", skill_key)
          .single();

        const newXp = (existing?.xp_earned || 0) + xp_amount;
        const isCompleted = newXp >= skill.xp_required;

        if (existing) {
          await supabase
            .from("developer_progress")
            .update({
              xp_earned: newXp,
              is_completed: isCompleted,
              completed_at: isCompleted && !existing.is_completed ? new Date().toISOString() : existing.completed_at,
              last_activity_at: new Date().toISOString()
            })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("developer_progress")
            .insert({
              developer_id,
              skill_key,
              xp_earned: xp_amount,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null
            });
        }

        result = {
          skill_key,
          xp_earned: newXp,
          xp_required: skill.xp_required,
          is_completed: isCompleted,
          newly_completed: isCompleted && !existing?.is_completed
        };
        break;
      }

      case 'check_certification': {
        const { data: certs } = await supabase
          .from("developer_certifications")
          .select("*")
          .eq("is_active", true);

        const { data: progress } = await supabase
          .from("developer_progress")
          .select("*")
          .eq("developer_id", developer_id)
          .eq("is_completed", true);

        const { data: earned } = await supabase
          .from("developer_earned_badges")
          .select("certification_key")
          .eq("developer_id", developer_id);

        const completedSkills = new Set(progress?.map(p => p.skill_key) || []);
        const earnedKeys = new Set(earned?.map(e => e.certification_key) || []);
        const totalXp = progress?.reduce((sum, p) => sum + p.xp_earned, 0) || 0;

        const eligible = certs?.filter(cert => 
          !earnedKeys.has(cert.certification_key) &&
          cert.required_skills.every((s: string) => completedSkills.has(s)) &&
          totalXp >= cert.min_xp_total
        ) || [];

        result = { eligible_certifications: eligible };
        break;
      }

      case 'earn_badge': {
        const { skill_key: certKey } = request;
        if (!certKey) {
          throw new Error("certification_key required");
        }

        // Verify eligibility
        const { data: cert } = await supabase
          .from("developer_certifications")
          .select("*")
          .eq("certification_key", certKey)
          .single();

        if (!cert) {
          throw new Error("Certification not found");
        }

        // Check if already earned
        const { data: existing } = await supabase
          .from("developer_earned_badges")
          .select("*")
          .eq("developer_id", developer_id)
          .eq("certification_key", certKey)
          .single();

        if (existing) {
          result = { already_earned: true, badge: existing };
          break;
        }

        // Generate verification hash
        const verificationHash = crypto.randomUUID().replace(/-/g, '');

        const { data: badge } = await supabase
          .from("developer_earned_badges")
          .insert({
            developer_id,
            certification_key: certKey,
            verification_hash: verificationHash,
            metadata: { cert_name: cert.name }
          })
          .select()
          .single();

        result = { earned: true, badge };
        break;
      }

      case 'start_tutorial': {
        const { tutorial_id } = request;
        if (!tutorial_id) {
          throw new Error("tutorial_id required");
        }

        const { data } = await supabase
          .from("developer_tutorial_progress")
          .upsert({
            developer_id,
            tutorial_id,
            step_index: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          }, { onConflict: 'developer_id,tutorial_id' })
          .select()
          .single();

        result = data;
        break;
      }

      case 'update_tutorial': {
        const { tutorial_id, step_index, code_submission } = request;
        if (!tutorial_id) {
          throw new Error("tutorial_id required");
        }

        const { data: existing } = await supabase
          .from("developer_tutorial_progress")
          .select("*")
          .eq("developer_id", developer_id)
          .eq("tutorial_id", tutorial_id)
          .single();

        const submissions = existing?.code_submissions || [];
        if (code_submission) {
          submissions.push({ step: step_index, code: code_submission, timestamp: new Date().toISOString() });
        }

        const { data } = await supabase
          .from("developer_tutorial_progress")
          .update({
            step_index: step_index ?? existing?.step_index,
            code_submissions: submissions,
            is_completed: step_index !== undefined && step_index >= 5, // Assuming 5 steps
            completed_at: step_index !== undefined && step_index >= 5 ? new Date().toISOString() : null
          })
          .eq("developer_id", developer_id)
          .eq("tutorial_id", tutorial_id)
          .select()
          .single();

        result = data;
        break;
      }

      case 'save_sandbox': {
        const { sandbox_data, session_name } = request;
        
        const { data } = await supabase
          .from("developer_sandbox_sessions")
          .upsert({
            developer_id,
            session_name: session_name || 'default',
            code_state: sandbox_data?.code || {},
            memory_state: sandbox_data?.memory || {},
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'developer_id' })
          .select()
          .single();

        result = data;
        break;
      }

      case 'load_sandbox': {
        const { data } = await supabase
          .from("developer_sandbox_sessions")
          .select("*")
          .eq("developer_id", developer_id)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        result = data;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Developer learning error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
