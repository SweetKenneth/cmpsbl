import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-core-gateway',
  targetModule: 'core',
  targetAction: 'route',
  migrationGuide: 'CORE module now handles routing via pf-substrate'
}));
