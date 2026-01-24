/**
 * CodeAgent v3 - Multi-Project Knowledge
 * Learn patterns across all projects
 */

import { supabase } from '@/integrations/supabase/client';

export interface ProjectPattern {
  id: string;
  projectId: string;
  projectName: string;
  patternType: 'component' | 'hook' | 'util' | 'api' | 'style' | 'architecture';
  name: string;
  description: string;
  code: string;
  tags: string[];
  confidence: number;
  useCount: number;
  successRate: number;
  createdAt: Date;
  lastUsed?: Date;
}

export interface CrossProjectInsight {
  pattern: string;
  occurrences: { project: string; context: string }[];
  recommendation: string;
  confidence: number;
}

// Known projects in the workspace
const KNOWN_PROJECTS: Record<string, { name: string; stack: string[] }> = {
  'promptfluid': { name: 'PromptFluid Substrate', stack: ['react', 'supabase', 'typescript'] },
  'cascade': { name: 'Cascade AI Agency', stack: ['react', 'supabase', 'typescript'] },
  'simnap': { name: 'SimNap Sleep', stack: ['react', 'supabase', 'typescript'] },
  'botsniper': { name: 'BotSniper Defense', stack: ['react', 'supabase', 'typescript'] }
};

// In-memory pattern store
const patternStore = new Map<string, ProjectPattern[]>();

/**
 * Register a pattern from a project
 */
export async function registerPattern(
  projectId: string,
  pattern: Omit<ProjectPattern, 'id' | 'projectId' | 'createdAt' | 'useCount' | 'successRate'>
): Promise<ProjectPattern> {
  const project = KNOWN_PROJECTS[projectId] || { name: projectId, stack: [] };
  
  const newPattern: ProjectPattern = {
    ...pattern,
    id: `pattern_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    projectId,
    projectName: project.name,
    createdAt: new Date(),
    useCount: 1,
    successRate: 1.0
  };
  
  // Add to local store
  if (!patternStore.has(projectId)) {
    patternStore.set(projectId, []);
  }
  patternStore.get(projectId)!.push(newPattern);
  
  // Persist to database
  try {
    await supabase.from('brain_memories').insert({
      memory_type: 'project_pattern',
      content: JSON.stringify(newPattern),
      tags: [...pattern.tags, projectId, pattern.patternType],
      confidence: pattern.confidence
    });
  } catch (e) {
    console.warn('Failed to persist pattern:', e);
  }
  
  return newPattern;
}

/**
 * Find patterns across all projects
 */
export async function findCrossProjectPatterns(
  query: string,
  patternType?: ProjectPattern['patternType']
): Promise<ProjectPattern[]> {
  const results: ProjectPattern[] = [];
  const queryLower = query.toLowerCase();
  
  // Search local store
  for (const [, patterns] of patternStore) {
    for (const pattern of patterns) {
      if (patternType && pattern.patternType !== patternType) continue;
      
      const matches = 
        pattern.name.toLowerCase().includes(queryLower) ||
        pattern.description.toLowerCase().includes(queryLower) ||
        pattern.tags.some(t => t.toLowerCase().includes(queryLower));
      
      if (matches) {
        results.push(pattern);
      }
    }
  }
  
  // Search database
  try {
    const { data } = await supabase
      .from('brain_memories')
      .select('*')
      .eq('memory_type', 'project_pattern')
      .order('confidence', { ascending: false })
      .limit(20);
    
    if (data) {
      for (const memory of data) {
        try {
          const pattern = JSON.parse(memory.content) as ProjectPattern;
          if (!results.find(r => r.id === pattern.id)) {
            if (patternType && pattern.patternType !== patternType) continue;
            
            const matches = 
              pattern.name.toLowerCase().includes(queryLower) ||
              pattern.description.toLowerCase().includes(queryLower);
            
            if (matches) {
              results.push(pattern);
            }
          }
        } catch {
          // Skip malformed patterns
        }
      }
    }
  } catch (e) {
    console.warn('Failed to search patterns:', e);
  }
  
  // Sort by confidence and usage
  return results.sort((a, b) => 
    (b.confidence * b.successRate) - (a.confidence * a.successRate)
  ).slice(0, 10);
}

/**
 * Record pattern usage
 */
export async function recordPatternUsage(
  patternId: string,
  success: boolean
): Promise<void> {
  // Find pattern in local store
  for (const [, patterns] of patternStore) {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern) {
      pattern.useCount++;
      pattern.lastUsed = new Date();
      
      // Update success rate with exponential moving average
      const alpha = 0.3;
      pattern.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * pattern.successRate;
      
      // Update confidence based on usage
      pattern.confidence = Math.min(1, pattern.confidence + (success ? 0.01 : -0.02));
      break;
    }
  }
}

/**
 * Get insights from cross-project patterns
 */
export function getCrossProjectInsights(): CrossProjectInsight[] {
  const insights: CrossProjectInsight[] = [];
  const patternCounts = new Map<string, { count: number; projects: Set<string>; contexts: string[] }>();
  
  // Aggregate patterns by name/type
  for (const [projectId, patterns] of patternStore) {
    for (const pattern of patterns) {
      const key = `${pattern.patternType}:${pattern.name.toLowerCase()}`;
      
      if (!patternCounts.has(key)) {
        patternCounts.set(key, { count: 0, projects: new Set(), contexts: [] });
      }
      
      const entry = patternCounts.get(key)!;
      entry.count++;
      entry.projects.add(projectId);
      entry.contexts.push(pattern.description);
    }
  }
  
  // Generate insights for common patterns
  for (const [key, data] of patternCounts) {
    if (data.projects.size > 1) {
      const [type, name] = key.split(':');
      
      insights.push({
        pattern: name,
        occurrences: Array.from(data.projects).map(p => ({
          project: KNOWN_PROJECTS[p]?.name || p,
          context: data.contexts[0]
        })),
        recommendation: `This ${type} pattern is used across ${data.projects.size} projects. Consider standardizing.`,
        confidence: Math.min(1, data.count * 0.2)
      });
    }
  }
  
  return insights.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Sync patterns from a project's codebase
 */
export async function syncProjectPatterns(
  projectId: string,
  files: Map<string, string>
): Promise<number> {
  let synced = 0;
  
  for (const [path, content] of files) {
    // Extract component patterns
    if (path.includes('/components/') && path.endsWith('.tsx')) {
      const componentMatch = content.match(/export\s+(?:default\s+)?function\s+(\w+)/);
      if (componentMatch) {
        await registerPattern(projectId, {
          projectName: KNOWN_PROJECTS[projectId]?.name || projectId,
          patternType: 'component',
          name: componentMatch[1],
          description: `React component from ${path}`,
          code: content.substring(0, 500),
          tags: ['react', 'component'],
          confidence: 0.7
        });
        synced++;
      }
    }
    
    // Extract hook patterns
    if (path.includes('/hooks/') || /use[A-Z]\w+/.test(path)) {
      const hookMatch = content.match(/export\s+function\s+(use\w+)/);
      if (hookMatch) {
        await registerPattern(projectId, {
          projectName: KNOWN_PROJECTS[projectId]?.name || projectId,
          patternType: 'hook',
          name: hookMatch[1],
          description: `Custom React hook from ${path}`,
          code: content.substring(0, 500),
          tags: ['react', 'hook'],
          confidence: 0.7
        });
        synced++;
      }
    }
  }
  
  return synced;
}

/**
 * Get project statistics
 */
export function getProjectStats(): Record<string, { patterns: number; avgConfidence: number }> {
  const stats: Record<string, { patterns: number; avgConfidence: number }> = {};
  
  for (const [projectId, patterns] of patternStore) {
    const totalConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0);
    stats[projectId] = {
      patterns: patterns.length,
      avgConfidence: patterns.length > 0 ? totalConfidence / patterns.length : 0
    };
  }
  
  return stats;
}
