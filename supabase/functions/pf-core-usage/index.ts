import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-core-usage',
  targetModule: 'access',
  targetAction: 'get_usage',
  migrationGuide: 'ACCESS module now handles usage metering via pf-substrate'
}));
