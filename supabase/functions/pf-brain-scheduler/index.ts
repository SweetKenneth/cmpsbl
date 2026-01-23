import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-brain-scheduler',
  targetModule: 'core',
  targetAction: 'schedule',
  migrationGuide: 'CORE kernel now handles job scheduling via pf-substrate'
}));
