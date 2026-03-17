/**
 * Admin Routes — Governor-only protected routes
 */
import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { AdminRoute } from "@/components/admin/AdminRoute";

const ShadowMeshPage = lazy(() => import("@/pages/admin/ShadowMeshPage"));
const ImmunityMeshDashboard = lazy(() => import("@/pages/admin/ImmunityMeshDashboard"));
const OwnerReports = lazy(() => import("@/pages/admin/OwnerReports"));
const EvolutionMeshDashboard = lazy(() => import("@/pages/admin/EvolutionMeshDashboard"));
const GovernanceControlPlane = lazy(() => import("@/pages/admin/GovernanceControlPlane"));
const QuarryDashboard = lazy(() => import("@/pages/admin/QuarryDashboard"));
const IntelPanel = lazy(() => import("@/pages/admin/IntelPanel"));
const STierVault = lazy(() => import("@/pages/admin/STierVault"));
const DiscoveryMiningConsole = lazy(() => import("@/pages/admin/DiscoveryMiningConsole"));
const GateEngineDashboard = lazy(() => import("@/pages/admin/GateEngineDashboard"));
const EncodeConsolePage = lazy(() => import("@/pages/admin/EncodeConsolePage"));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/AnalyticsDashboard"));
const AuditCenterPage = lazy(() => import("@/pages/admin/AuditCenterPage"));
const EmailListPanel = lazy(() => import("@/pages/admin/EmailListPanel"));
const GovernorNodeDashboard = lazy(() => import("@/pages/admin/GovernorNodeDashboard"));

export const adminRoutes = (
  <>
    <Route path="/admin/patches" element={<Navigate to="/" replace />} />
    <Route path="/admin/shadow-mesh" element={<AdminRoute><ShadowMeshPage /></AdminRoute>} />
    <Route path="/admin/immunity-mesh" element={<AdminRoute><ImmunityMeshDashboard /></AdminRoute>} />
    <Route path="/admin/owner-reports" element={<AdminRoute><OwnerReports /></AdminRoute>} />
    <Route path="/admin/evolution" element={<AdminRoute><EvolutionMeshDashboard /></AdminRoute>} />
    <Route path="/admin/governance" element={<AdminRoute><GovernanceControlPlane /></AdminRoute>} />
    <Route path="/admin/quarry" element={<AdminRoute><QuarryDashboard /></AdminRoute>} />
    <Route path="/admin/intel" element={<AdminRoute><IntelPanel /></AdminRoute>} />
    <Route path="/admin/s-tier-vault" element={<AdminRoute><STierVault /></AdminRoute>} />
    <Route path="/admin/discovery-mining" element={<AdminRoute><DiscoveryMiningConsole /></AdminRoute>} />
    <Route path="/admin/gate" element={<AdminRoute><GateEngineDashboard /></AdminRoute>} />
    <Route path="/quarry" element={<Navigate to="/admin/quarry" replace />} />
    <Route path="/admin/*" element={<Navigate to="/" replace />} />
    <Route path="/diligence" element={<Navigate to="/" replace />} />
    <Route path="/admin/encode-console" element={<AdminRoute><EncodeConsolePage /></AdminRoute>} />
    <Route path="/admin/analytics" element={<AdminRoute><AnalyticsDashboard /></AdminRoute>} />
    <Route path="/admin/audit-center" element={<AdminRoute><AuditCenterPage /></AdminRoute>} />
    <Route path="/admin/email-list" element={<AdminRoute><EmailListPanel /></AdminRoute>} />
    <Route path="/audit" element={<Navigate to="/admin/audit-center" replace />} />
  </>
);
