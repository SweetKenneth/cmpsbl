import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-core',
  targetModule: 'core',
  targetAction: 'status',
  migrationGuide: 'CORE module now handles all kernel operations via pf-substrate'
}));
