import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-generate-api-key',
  targetModule: 'access',
  targetAction: 'create_key',
  migrationGuide: 'ACCESS module now handles API key management via pf-substrate'
}));
