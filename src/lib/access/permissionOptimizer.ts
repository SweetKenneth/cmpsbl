 /**
  * ACCESS Permission Optimizer v7.5.0
  * Dynamic permission analysis and optimization recommendations
  */
 
 export type PermissionScope = 'read' | 'write' | 'delete' | 'admin' | 'execute';
 export type ResourceType = 'memory' | 'pipeline' | 'integration' | 'config' | 'api' | 'user';
 
 export interface Permission {
   id: string;
   subject: string;
   resource_type: ResourceType;
   resource_id: string;
   scopes: PermissionScope[];
   granted_at: string;
   expires_at: string | null;
   used_count: number;
   last_used_at: string | null;
 }
 
 export interface PermissionRecommendation {
   type: 'revoke' | 'reduce' | 'consolidate' | 'extend' | 'alert';
   severity: 'low' | 'medium' | 'high';
   permission_id: string;
   reason: string;
   suggested_action: string;
   impact: string;
 }
 
 export interface OptimizationReport {
   analyzed_at: string;
   total_permissions: number;
   unused_count: number;
   overprovisioned_count: number;
   expiring_soon_count: number;
   recommendations: PermissionRecommendation[];
   security_score: number;
 }
 
 export interface OptimizerConfig {
   unused_threshold_days: number;
   expiry_warning_days: number;
   min_usage_for_extension: number;
 }
 
 // Configuration
 let config: OptimizerConfig = {
   unused_threshold_days: 30,
   expiry_warning_days: 7,
   min_usage_for_extension: 5,
 };
 
 // In-memory permission store for analysis
 const permissions: Permission[] = [];
 
 /**
  * Register a permission for analysis
  */
 export function registerPermission(permission: Omit<Permission, 'used_count' | 'last_used_at'>): Permission {
   const fullPermission: Permission = {
     ...permission,
     used_count: 0,
     last_used_at: null,
   };
 
   // Update or add
   const existingIdx = permissions.findIndex(p => p.id === permission.id);
   if (existingIdx >= 0) {
     permissions[existingIdx] = { ...permissions[existingIdx], ...permission };
     return permissions[existingIdx];
   }
 
   permissions.push(fullPermission);
   return fullPermission;
 }
 
 /**
  * Record permission usage
  */
 export function recordPermissionUsage(permissionId: string): boolean {
   const permission = permissions.find(p => p.id === permissionId);
   if (permission) {
     permission.used_count++;
     permission.last_used_at = new Date().toISOString();
     return true;
   }
   return false;
 }
 
 /**
  * Analyze permissions and generate recommendations
  */
 export function analyzePermissions(): OptimizationReport {
   const recommendations: PermissionRecommendation[] = [];
   const now = Date.now();
   const unusedThreshold = now - config.unused_threshold_days * 24 * 60 * 60 * 1000;
   const expiryWarning = now + config.expiry_warning_days * 24 * 60 * 60 * 1000;
 
   let unusedCount = 0;
   let overprovisionedCount = 0;
   let expiringSoonCount = 0;
 
   for (const permission of permissions) {
     // Check for unused permissions
     const lastUsed = permission.last_used_at ? new Date(permission.last_used_at).getTime() : 0;
     if (!permission.last_used_at || lastUsed < unusedThreshold) {
       unusedCount++;
       recommendations.push({
         type: 'revoke',
         severity: 'medium',
         permission_id: permission.id,
         reason: `Permission unused for ${config.unused_threshold_days}+ days`,
         suggested_action: 'Consider revoking this permission',
         impact: 'Reduces attack surface with minimal operational risk',
       });
     }
 
     // Check for overprovisioned (admin on low-value resources)
     if (permission.scopes.includes('admin') && ['memory', 'pipeline'].includes(permission.resource_type)) {
       if (permission.used_count < 10) {
         overprovisionedCount++;
         recommendations.push({
           type: 'reduce',
           severity: 'low',
           permission_id: permission.id,
           reason: 'Admin scope on resource with low usage',
           suggested_action: 'Reduce to read/write scope',
           impact: 'Follows principle of least privilege',
         });
       }
     }
 
     // Check for expiring permissions
     if (permission.expires_at) {
       const expiresAt = new Date(permission.expires_at).getTime();
       if (expiresAt < expiryWarning && expiresAt > now) {
         expiringSoonCount++;
         
         if (permission.used_count >= config.min_usage_for_extension) {
           recommendations.push({
             type: 'extend',
             severity: 'low',
             permission_id: permission.id,
             reason: `Permission expiring soon with ${permission.used_count} uses`,
             suggested_action: 'Consider extending expiration',
             impact: 'Maintains operational continuity',
           });
         } else {
           recommendations.push({
             type: 'alert',
             severity: 'low',
             permission_id: permission.id,
             reason: 'Permission expiring with low usage',
             suggested_action: 'Review if permission is still needed',
             impact: 'May indicate unused access',
           });
         }
       }
     }
   }
 
   // Check for consolidation opportunities
   const bySubject = new Map<string, Permission[]>();
   for (const p of permissions) {
     const key = p.subject;
     if (!bySubject.has(key)) bySubject.set(key, []);
     bySubject.get(key)!.push(p);
   }
 
   for (const [subject, perms] of bySubject.entries()) {
     if (perms.length > 5) {
       recommendations.push({
         type: 'consolidate',
         severity: 'low',
         permission_id: perms[0].id,
         reason: `Subject "${subject}" has ${perms.length} individual permissions`,
         suggested_action: 'Consider creating a role for this subject',
         impact: 'Simplifies permission management',
       });
     }
   }
 
   // Calculate security score
   const securityScore = Math.max(0, 100 - 
     (unusedCount * 3) - 
     (overprovisionedCount * 5) - 
     (recommendations.filter(r => r.severity === 'high').length * 10)
   );
 
   return {
     analyzed_at: new Date().toISOString(),
     total_permissions: permissions.length,
     unused_count: unusedCount,
     overprovisioned_count: overprovisionedCount,
     expiring_soon_count: expiringSoonCount,
     recommendations: recommendations.sort((a, b) => {
       const severityOrder = { high: 0, medium: 1, low: 2 };
       return severityOrder[a.severity] - severityOrder[b.severity];
     }),
     security_score: Math.round(securityScore),
   };
 }
 
 /**
  * Get permission by ID
  */
 export function getPermission(permissionId: string): Permission | undefined {
   return permissions.find(p => p.id === permissionId);
 }
 
 /**
  * Get all permissions for a subject
  */
 export function getPermissionsBySubject(subject: string): Permission[] {
   return permissions.filter(p => p.subject === subject);
 }
 
 /**
  * Get all permissions for a resource
  */
 export function getPermissionsByResource(resourceType: ResourceType, resourceId?: string): Permission[] {
   return permissions.filter(p => 
     p.resource_type === resourceType &&
     (!resourceId || p.resource_id === resourceId)
   );
 }
 
 /**
  * Revoke a permission
  */
 export function revokePermission(permissionId: string): boolean {
   const idx = permissions.findIndex(p => p.id === permissionId);
   if (idx >= 0) {
     permissions.splice(idx, 1);
     return true;
   }
   return false;
 }
 
 /**
  * Update optimizer configuration
  */
 export function updateOptimizerConfig(updates: Partial<OptimizerConfig>): OptimizerConfig {
   config = { ...config, ...updates };
   return { ...config };
 }
 
 /**
  * Get optimizer configuration
  */
 export function getOptimizerConfig(): OptimizerConfig {
   return { ...config };
 }
 
 /**
  * Get permission statistics
  */
 export function getPermissionStats(): {
   total: number;
   by_scope: Record<PermissionScope, number>;
   by_resource: Record<ResourceType, number>;
   avg_usage: number;
 } {
   const byScope: Record<PermissionScope, number> = { read: 0, write: 0, delete: 0, admin: 0, execute: 0 };
   const byResource: Record<ResourceType, number> = { memory: 0, pipeline: 0, integration: 0, config: 0, api: 0, user: 0 };
   let totalUsage = 0;
 
   for (const p of permissions) {
     for (const scope of p.scopes) {
       byScope[scope]++;
     }
     byResource[p.resource_type]++;
     totalUsage += p.used_count;
   }
 
   return {
     total: permissions.length,
     by_scope: byScope,
     by_resource: byResource,
     avg_usage: permissions.length > 0 ? totalUsage / permissions.length : 0,
   };
 }