import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-defense-rate-limit',
  targetModule: 'core',
  targetAction: 'authorize',
  migrationGuide: 'CORE kernel now handles rate limiting via pf-substrate'
}));
