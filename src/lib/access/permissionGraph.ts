 /**
  * ACCESS Permission Graph
  * v7.5.0 — Hierarchical permission resolution with inheritance
  */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Permission node
 export interface PermissionNode {
   id: string;
   scope: string;
   resource: string;
   actions: string[];
   conditions?: Record<string, unknown>;
   inheritsFrom?: string[];
 }
 
 // Permission check result
 export interface PermissionCheck {
   allowed: boolean;
   reason: string;
   grantedBy?: string;
   conditions?: Record<string, unknown>;
   evaluationPath: string[];
 }
 
 // Role definition
 export interface Role {
   id: string;
   name: string;
   description: string;
   permissions: PermissionNode[];
   inherits?: string[];
   isSystem: boolean;
 }
 
 // In-memory permission cache
 const permissionCache = new Map<string, PermissionCheck>();
 const roleCache = new Map<string, Role>();
 const CACHE_TTL_MS = 5 * 60 * 1000;
 
 // Built-in roles
 const SYSTEM_ROLES: Role[] = [
   {
     id: 'admin',
     name: 'Administrator',
     description: 'Full system access',
     permissions: [
       { id: 'admin_all', scope: '*', resource: '*', actions: ['*'] }
     ],
     isSystem: true,
   },
   {
     id: 'operator',
     name: 'Operator',
     description: 'Operational access to substrate modules',
     permissions: [
       { id: 'op_read', scope: 'substrate', resource: '*', actions: ['read', 'execute'] },
       { id: 'op_terminal', scope: 'terminal', resource: '*', actions: ['read', 'execute'] },
     ],
     isSystem: true,
   },
   {
     id: 'observer',
     name: 'Observer',
     description: 'Read-only access',
     permissions: [
       { id: 'obs_read', scope: '*', resource: '*', actions: ['read'] }
     ],
     isSystem: true,
   },
   {
     id: 'developer',
     name: 'Developer',
     description: 'API and integration access',
     permissions: [
       { id: 'dev_api', scope: 'api', resource: '*', actions: ['read', 'write'] },
       { id: 'dev_int', scope: 'integration', resource: '*', actions: ['read', 'write', 'connect'] },
     ],
     inherits: ['observer'],
     isSystem: true,
   },
 ];
 
 // Initialize system roles
 SYSTEM_ROLES.forEach(role => roleCache.set(role.id, role));
 
 /**
  * Check if an action is allowed for a user
  */
 export async function checkPermission(
   userId: string,
   scope: string,
   resource: string,
   action: string
 ): Promise<PermissionCheck> {
   const cacheKey = `${userId}:${scope}:${resource}:${action}`;
   const cached = permissionCache.get(cacheKey);
   
   if (cached) {
     return cached;
   }
   
   // Get user roles
   const userRoles = await getUserRoles(userId);
   const evaluationPath: string[] = [];
   
   // Check each role
   for (const roleId of userRoles) {
     const result = await evaluateRole(roleId, scope, resource, action, evaluationPath);
     if (result.allowed) {
       permissionCache.set(cacheKey, result);
       setTimeout(() => permissionCache.delete(cacheKey), CACHE_TTL_MS);
       return result;
     }
   }
   
   const denied: PermissionCheck = {
     allowed: false,
     reason: `No permission grants ${action} on ${scope}:${resource}`,
     evaluationPath,
   };
   
   permissionCache.set(cacheKey, denied);
   return denied;
 }
 
 /**
  * Evaluate a role for permission
  */
 async function evaluateRole(
   roleId: string,
   scope: string,
   resource: string,
   action: string,
   evaluationPath: string[]
 ): Promise<PermissionCheck> {
   evaluationPath.push(`role:${roleId}`);
   
   const role = roleCache.get(roleId);
   if (!role) {
     return { allowed: false, reason: `Role ${roleId} not found`, evaluationPath };
   }
   
   // Check direct permissions
   for (const perm of role.permissions) {
     if (matchesScope(perm.scope, scope) && 
         matchesResource(perm.resource, resource) && 
         matchesAction(perm.actions, action)) {
       return {
         allowed: true,
         reason: `Granted by ${role.name}`,
         grantedBy: role.id,
         conditions: perm.conditions,
         evaluationPath,
       };
     }
   }
   
   // Check inherited roles
   if (role.inherits) {
     for (const inheritedRoleId of role.inherits) {
       const result = await evaluateRole(inheritedRoleId, scope, resource, action, evaluationPath);
       if (result.allowed) {
         return result;
       }
     }
   }
   
   return { allowed: false, reason: 'Not granted by role', evaluationPath };
 }
 
 function matchesScope(pattern: string, scope: string): boolean {
   if (pattern === '*') return true;
   if (pattern.endsWith('.*')) {
     return scope.startsWith(pattern.slice(0, -2));
   }
   return pattern === scope;
 }
 
 function matchesResource(pattern: string, resource: string): boolean {
   if (pattern === '*') return true;
   return pattern === resource;
 }
 
 function matchesAction(allowed: string[], action: string): boolean {
   return allowed.includes('*') || allowed.includes(action);
 }
 
 /**
  * Get roles for a user
  */
 async function getUserRoles(userId: string): Promise<string[]> {
   try {
     const { data } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', userId);
     
     return (data || []).map(r => r.role);
   } catch {
     return ['observer']; // Default role
   }
 }
 
 /**
  * Grant a role to a user
  */
 export async function grantRole(
   userId: string,
   roleId: string
 ): Promise<{ success: boolean; error?: string }> {
   try {
     const role = roleCache.get(roleId);
     if (!role) {
       return { success: false, error: `Role ${roleId} does not exist` };
     }
     
     // Map custom role IDs to valid database enum values
     const dbRole = roleId === 'admin' ? 'admin' : roleId === 'operator' ? 'moderator' : 'user';
     
     const { error } = await supabase
       .from('user_roles')
       .insert({ user_id: userId, role: dbRole as 'admin' | 'moderator' | 'user' });
     
     if (error) throw error;
     
     // Invalidate permission cache for user
     invalidateUserPermissions(userId);
     
     return { success: true };
   } catch (error) {
     return { success: false, error: String(error) };
   }
 }
 
 /**
  * Revoke a role from a user
  */
 export async function revokeRole(
   userId: string,
   roleId: string
 ): Promise<{ success: boolean; error?: string }> {
   try {
     // Map custom role IDs to valid database enum values
     const dbRole = roleId === 'admin' ? 'admin' : roleId === 'operator' ? 'moderator' : 'user';
     
     const { error } = await supabase
       .from('user_roles')
       .delete()
       .eq('user_id', userId)
       .eq('role', dbRole);
     
     if (error) throw error;
     
     invalidateUserPermissions(userId);
     return { success: true };
   } catch (error) {
     return { success: false, error: String(error) };
   }
 }
 
 /**
  * Invalidate cached permissions for a user
  */
 function invalidateUserPermissions(userId: string): void {
   for (const key of permissionCache.keys()) {
     if (key.startsWith(`${userId}:`)) {
       permissionCache.delete(key);
     }
   }
 }
 
 /**
  * Get all available roles
  */
 export function getRoles(): Role[] {
   return Array.from(roleCache.values());
 }
 
 /**
  * Get a specific role
  */
 export function getRole(roleId: string): Role | undefined {
   return roleCache.get(roleId);
 }
 
 /**
  * Create a custom role
  */
 export function createRole(role: Omit<Role, 'isSystem'>): Role {
   const newRole: Role = { ...role, isSystem: false };
   roleCache.set(role.id, newRole);
   return newRole;
 }
 
 /**
  * Get effective permissions for a user
  */
 export async function getEffectivePermissions(userId: string): Promise<PermissionNode[]> {
   const userRoles = await getUserRoles(userId);
   const permissions: PermissionNode[] = [];
   const seen = new Set<string>();
   
   const collectPermissions = (roleId: string) => {
     if (seen.has(roleId)) return;
     seen.add(roleId);
     
     const role = roleCache.get(roleId);
     if (!role) return;
     
     permissions.push(...role.permissions);
     
     if (role.inherits) {
       role.inherits.forEach(collectPermissions);
     }
   };
   
   userRoles.forEach(collectPermissions);
   return permissions;
 }