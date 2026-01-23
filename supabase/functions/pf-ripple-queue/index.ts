import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleLegacyRequest } from "../_shared/legacy-redirect.ts";

serve((req) => handleLegacyRequest(req, {
  legacyEndpoint: 'pf-ripple-queue',
  targetModule: 'ripple',
  targetAction: 'enqueue',
  migrationGuide: 'RIPPLE module now handles all queue operations via pf-substrate'
}));
