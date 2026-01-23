import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'integration-bus',
  targetModule: 'core',
  targetAction: 'integrate',
  migrationGuide: 'CORE kernel now handles integrations via pf-substrate'
}));
