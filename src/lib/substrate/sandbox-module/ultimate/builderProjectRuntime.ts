/**
 * Builder Project Runtime
 * 
 * Execution environment for builder/developer projects running on the substrate.
 * Project-scoped sandboxes with capability token injection and hot-reload.
 * 
 * @module sandbox/ultimate/builderProjectRuntime
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export interface BuilderProject {
  id: string;
  builderId: string;
  sandboxId: string;
  name: string;
  status: 'initializing' | 'running' | 'suspended' | 'terminated';
  capabilities: string[];
  tier: 'builder' | 'pro' | 'governor';
  createdAt: number;
  lastActivityAt: number;
  hotReloadEnabled: boolean;
  buildArtifacts: string[];
}

export interface CapabilityToken {
  projectId: string;
  capability: string;
  grantedAt: number;
  expiresAt: number | null;
  usageCount: number;
}

// ── State ──────────────────────────────────────────────────────

const projects = new Map<string, BuilderProject>();
const capabilityTokens = new Map<string, CapabilityToken[]>();

// ── Core ───────────────────────────────────────────────────────

/** Create a builder project runtime */
export function createProject(
  id: string,
  builderId: string,
  sandboxId: string,
  name: string,
  capabilities: string[],
  tier: BuilderProject['tier'] = 'builder',
): BuilderProject {
  const project: BuilderProject = {
    id, builderId, sandboxId, name, capabilities, tier,
    status: 'initializing',
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    hotReloadEnabled: true,
    buildArtifacts: [],
  };
  projects.set(id, project);

  // Inject capability tokens
  const tokens: CapabilityToken[] = capabilities.map(cap => ({
    projectId: id, capability: cap,
    grantedAt: Date.now(), expiresAt: null, usageCount: 0,
  }));
  capabilityTokens.set(id, tokens);

  project.status = 'running';
  return project;
}

/** Record a hot-reload event */
export function hotReload(projectId: string): boolean {
  const project = projects.get(projectId);
  if (!project || !project.hotReloadEnabled || project.status !== 'running') return false;
  project.lastActivityAt = Date.now();
  return true;
}

/** Use a capability token */
export function useCapability(projectId: string, capability: string): boolean {
  const tokens = capabilityTokens.get(projectId);
  if (!tokens) return false;
  const token = tokens.find(t => t.capability === capability);
  if (!token) return false;
  if (token.expiresAt && Date.now() > token.expiresAt) return false;
  token.usageCount++;
  const project = projects.get(projectId);
  if (project) project.lastActivityAt = Date.now();
  return true;
}

/** Register a build artifact */
export function registerArtifact(projectId: string, artifactPath: string): void {
  const project = projects.get(projectId);
  if (project) {
    project.buildArtifacts.push(artifactPath);
    project.lastActivityAt = Date.now();
  }
}

/** Suspend a project */
export function suspendProject(projectId: string): boolean {
  const project = projects.get(projectId);
  if (!project || project.status !== 'running') return false;
  project.status = 'suspended';
  return true;
}

/** Resume a suspended project */
export function resumeProject(projectId: string): boolean {
  const project = projects.get(projectId);
  if (!project || project.status !== 'suspended') return false;
  project.status = 'running';
  project.lastActivityAt = Date.now();
  return true;
}

/** Terminate a project */
export function terminateProject(projectId: string): boolean {
  const project = projects.get(projectId);
  if (!project) return false;
  project.status = 'terminated';
  return true;
}

export function getProject(id: string): BuilderProject | undefined { return projects.get(id); }
export function getProjectsByBuilder(builderId: string): BuilderProject[] {
  return Array.from(projects.values()).filter(p => p.builderId === builderId);
}

export function getBuilderRuntimeHealth() {
  const all = Array.from(projects.values());
  return {
    totalProjects: all.length,
    running: all.filter(p => p.status === 'running').length,
    suspended: all.filter(p => p.status === 'suspended').length,
    terminated: all.filter(p => p.status === 'terminated').length,
  };
}

export function resetBuilderRuntime(): void {
  projects.clear();
  capabilityTokens.clear();
}
