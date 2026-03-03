/**
 * Core Admin Edge Function — Exemplar for shared edge-middleware pattern
 * Migrated from legacy boilerplate to withMiddleware + requireAdmin
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  withMiddleware,
  requireAdmin,
  createAdminClient,
  jsonResponse,
  parseBody,
  EdgeError,
} from "../_shared/edge-middleware.ts";

interface AdminRequest {
  action: string;
  data?: Record<string, unknown>;
}

serve(withMiddleware(async (req: Request): Promise<Response> => {
  // Require admin — throws 401/403 automatically
  await requireAdmin(req);

  const { action, data } = await parseBody<AdminRequest>(req);

  console.log(`👑 Core Admin: ${action}`);

  const supabaseClient = createAdminClient();

  switch (action) {
    case 'get_system_overview': {
      const { count: memoryCount } = await supabaseClient
        .from('brain_memories')
        .select('id', { count: 'exact', head: true });

      const { count: logsCount } = await supabaseClient
        .from('learning_logs')
        .select('id', { count: 'exact', head: true });

      return jsonResponse({
        success: true,
        overview: {
          total_memories: memoryCount || 0,
          total_logs: logsCount || 0,
          system_version: '1.0.0',
          uptime: '100%',
          active_modules: ['brain', 'defense', 'nexus', 'marketing', 'access'],
        },
      });
    }

    case 'clear_logs': {
      const older_than_days = (data?.older_than_days as number) ?? 30;
      const cutoffDate = new Date(Date.now() - older_than_days * 24 * 60 * 60 * 1000);

      const { error } = await supabaseClient
        .from('learning_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw new EdgeError(error.message, 500, 'DB_ERROR');

      return jsonResponse({ success: true, message: 'Logs cleared' });
    }

    default:
      throw new EdgeError(`Unknown action: ${action}`, 400, 'UNKNOWN_ACTION');
  }
}));
