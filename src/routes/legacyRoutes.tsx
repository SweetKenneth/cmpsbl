/**
 * Legacy Redirect Routes — Consolidated wildcard redirects for deprecated paths
 */
import { Route, Navigate } from "react-router-dom";

export const legacyRoutes = (
  <>
    <Route path="/dashboard" element={<Navigate to="/" replace />} />
    <Route path="/evolution-mesh" element={<Navigate to="/" replace />} />

    {/* Legacy brain/cascade */}
    <Route path="/brain" element={<Navigate to="/decode" replace />} />
    <Route path="/brain/*" element={<Navigate to="/" replace />} />
    <Route path="/cascade" element={<Navigate to="/decode" replace />} />
    <Route path="/cascade-/*" element={<Navigate to="/" replace />} />

    {/* Clarity */}
    <Route path="/clarity" element={<Navigate to="/" replace />} />
    <Route path="/clarity/*" element={<Navigate to="/" replace />} />
    <Route path="/clarity-/*" element={<Navigate to="/" replace />} />

    {/* Defense */}
    <Route path="/defense" element={<Navigate to="/" replace />} />
    <Route path="/defense/*" element={<Navigate to="/" replace />} />
    <Route path="/defense-/*" element={<Navigate to="/" replace />} />

    {/* Ripple */}
    <Route path="/ripple/*" element={<Navigate to="/" replace />} />
    <Route path="/ripple-/*" element={<Navigate to="/" replace />} />

    {/* Misc legacy */}
    <Route path="/index" element={<Navigate to="/" replace />} />
    <Route path="/checkout" element={<Navigate to="/" replace />} />
    <Route path="/sandbox" element={<Navigate to="/" replace />} />
    <Route path="/system" element={<Navigate to="/" replace />} />
    <Route path="/system-/*" element={<Navigate to="/" replace />} />
    <Route path="/studio" element={<Navigate to="/" replace />} />
    <Route path="/studio/*" element={<Navigate to="/" replace />} />
    <Route path="/modernizer" element={<Navigate to="/" replace />} />
    <Route path="/demo-admin" element={<Navigate to="/" replace />} />
    <Route path="/demo-admin/*" element={<Navigate to="/" replace />} />
    <Route path="/resources/*" element={<Navigate to="/" replace />} />
    <Route path="/solutions/*" element={<Navigate to="/solutions" replace />} />

    {/* Removed pages — redirect to home */}
    <Route path="/capability-map" element={<Navigate to="/" replace />} />
    <Route path="/foundations" element={<Navigate to="/" replace />} />
    <Route path="/evolution" element={<Navigate to="/" replace />} />
    <Route path="/proof" element={<Navigate to="/" replace />} />
    <Route path="/status" element={<Navigate to="/" replace />} />
    <Route path="/system-integrity" element={<Navigate to="/" replace />} />
     <Route path="/start-here" element={<Navigate to="/developers/guide" replace />} />
    <Route path="/products" element={<Navigate to="/" replace />} />
    <Route path="/clockless-world-engine" element={<Navigate to="/" replace />} />
    <Route path="/scanner" element={<Navigate to="/" replace />} />
    <Route path="/overview" element={<Navigate to="/" replace />} />
    <Route path="/feed-dream-eater" element={<Navigate to="/" replace />} />
  </>
);
