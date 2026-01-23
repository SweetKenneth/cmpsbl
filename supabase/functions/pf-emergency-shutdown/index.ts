import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-emergency-shutdown',
  targetModule: 'core',
  targetAction: 'shutdown',
  migrationGuide: 'CORE kernel now handles emergency shutdown via pf-substrate'
}));
