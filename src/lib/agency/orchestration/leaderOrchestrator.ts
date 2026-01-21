/**
 * Leader Orchestrator — Routes tasks to specialist agents
 * The leader receives user instructions, parses into primitives,
 * assigns to best-fit agents, and aggregates results
 */

import { supabase } from '@/integrations/supabase/client';
import { TASK_PRIMITIVES, TaskPrimitiveId, getPrimitiveForTaskType } from '../skills/taskPrimitives';
import { SPECIALIZATION_SKILLS, hasSkill, type AgentSkillId } from '../skills/agentSkills';
import { recordTelemetryEvent } from '../telemetry/agencyTelemetry';

// ============================================================================
// TYPES
// ============================================================================

export interface TeamMember {
  id: string;
  role: string;
  specialization: string;
  is_leader: boolean;
  skill_weights?: Record<string, number>;
}

export interface RoutedTask {
  primitiveId: TaskPrimitiveId;
  assignedMemberId: string;
  input: string;
  priority: number;
}

export interface OrchestrationPlan {
  originalInput: string;
  parsedIntents: string[];
  routedTasks: RoutedTask[];
  executionOrder: 'sequential' | 'parallel' | 'mixed';
}

export interface OrchestrationResult {
  success: boolean;
  taskIds: string[];
  summary?: string;
  errors?: string[];
}

// ============================================================================
// INTENT PARSING
// ============================================================================

/**
 * Parse user input into task intents
 * Uses keyword matching and pattern recognition
 */
export function parseIntents(input: string): { primitive: TaskPrimitiveId; input: string }[] {
  const intents: { primitive: TaskPrimitiveId; input: string }[] = [];
  const lowerInput = input.toLowerCase();
  
  // Research patterns
  if (lowerInput.includes('research') || lowerInput.includes('find out') || lowerInput.includes('discover')) {
    intents.push({ primitive: 'web_research', input });
  }
  
  // Competitive analysis patterns
  if (lowerInput.includes('competitor') || lowerInput.includes('competition') || lowerInput.includes('compare')) {
    intents.push({ primitive: 'competitive_profile', input });
  }
  
  // SEO patterns
  if (lowerInput.includes('seo') || lowerInput.includes('ranking') || lowerInput.includes('keywords')) {
    intents.push({ primitive: 'seo_audit', input });
  }
  
  // Content patterns
  if (lowerInput.includes('write') || lowerInput.includes('create content') || lowerInput.includes('blog')) {
    intents.push({ primitive: 'content_generation', input });
  }
  
  // Outreach patterns
  if (lowerInput.includes('email') || lowerInput.includes('outreach') || lowerInput.includes('sequence')) {
    intents.push({ primitive: 'outreach_generation', input });
  }
  
  // Data patterns
  if (lowerInput.includes('extract') || lowerInput.includes('scrape') || lowerInput.includes('data from')) {
    intents.push({ primitive: 'data_extraction', input });
  }
  
  // Enrichment patterns
  if (lowerInput.includes('enrich') || lowerInput.includes('add context') || lowerInput.includes('enhance')) {
    intents.push({ primitive: 'data_enrichment', input });
  }
  
  // Monitoring patterns
  if (lowerInput.includes('monitor') || lowerInput.includes('track') || lowerInput.includes('alert')) {
    intents.push({ primitive: 'monitoring_check', input });
  }
  
  // Local business patterns
  if (lowerInput.includes('local') || lowerInput.includes('nearby') || lowerInput.includes('reviews')) {
    intents.push({ primitive: 'local_business_analysis', input });
  }
  
  // Dataset operations
  if (lowerInput.includes('clean') || lowerInput.includes('convert') || lowerInput.includes('normalize')) {
    intents.push({ primitive: 'dataset_operations', input });
  }
  
  // Default to web research if no specific intent detected
  if (intents.length === 0) {
    intents.push({ primitive: 'web_research', input });
  }
  
  return intents;
}

// ============================================================================
// AGENT MATCHING
// ============================================================================

/**
 * Find the best agent for a task primitive
 */
export function findBestAgent(
  primitive: TaskPrimitiveId,
  members: TeamMember[],
  excludeIds: string[] = []
): TeamMember | null {
  const primitiveConfig = TASK_PRIMITIVES[primitive];
  if (!primitiveConfig) return null;
  
  const requiredSkills = primitiveConfig.skills;
  
  // Score each agent
  const scored = members
    .filter(m => !m.is_leader && !excludeIds.includes(m.id))
    .map(member => {
      const memberSkills = SPECIALIZATION_SKILLS[member.specialization] || [];
      const matchingSkills = requiredSkills.filter(skill => memberSkills.includes(skill));
      
      // Score based on skill match + weights
      let score = matchingSkills.length / requiredSkills.length;
      
      // Boost score based on skill weights if available
      if (member.skill_weights) {
        for (const skill of matchingSkills) {
          const weight = member.skill_weights[skill] || 0.5;
          score += weight * 0.1;
        }
      }
      
      return { member, score };
    })
    .sort((a, b) => b.score - a.score);
  
  return scored[0]?.member || null;
}

/**
 * Calculate work distribution to avoid overloading agents
 */
export function distributeWork(
  tasks: { primitive: TaskPrimitiveId; input: string }[],
  members: TeamMember[]
): RoutedTask[] {
  const assignments: RoutedTask[] = [];
  const memberWorkload: Record<string, number> = {};
  
  // Initialize workload tracking
  for (const member of members) {
    if (!member.is_leader) {
      memberWorkload[member.id] = 0;
    }
  }
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    // Find least-loaded suitable agent
    let bestAgent: TeamMember | null = null;
    let lowestLoad = Infinity;
    
    const primitiveConfig = TASK_PRIMITIVES[task.primitive];
    const requiredSkills = primitiveConfig?.skills || [];
    
    for (const member of members) {
      if (member.is_leader) continue;
      
      const memberSkills = SPECIALIZATION_SKILLS[member.specialization] || [];
      const canHandle = requiredSkills.some(skill => memberSkills.includes(skill as AgentSkillId));
      
      if (canHandle && memberWorkload[member.id] < lowestLoad) {
        bestAgent = member;
        lowestLoad = memberWorkload[member.id];
      }
    }
    
    if (bestAgent) {
      assignments.push({
        primitiveId: task.primitive,
        assignedMemberId: bestAgent.id,
        input: task.input,
        priority: 50 - i * 5, // Decrease priority for later tasks
      });
      memberWorkload[bestAgent.id]++;
    }
  }
  
  return assignments;
}

// ============================================================================
// ORCHESTRATION EXECUTION
// ============================================================================

/**
 * Create an orchestration plan from user input
 */
export function createOrchestrationPlan(
  input: string,
  members: TeamMember[]
): OrchestrationPlan {
  const parsedIntents = parseIntents(input);
  const routedTasks = distributeWork(parsedIntents, members);
  
  // Determine execution order
  let executionOrder: 'sequential' | 'parallel' | 'mixed' = 'parallel';
  if (routedTasks.length === 1) {
    executionOrder = 'sequential';
  } else if (routedTasks.length > 3) {
    executionOrder = 'mixed'; // Start some in parallel, aggregate
  }
  
  return {
    originalInput: input,
    parsedIntents: parsedIntents.map(i => i.primitive),
    routedTasks,
    executionOrder,
  };
}

/**
 * Execute the orchestration plan
 */
export async function executeOrchestration(
  agencyId: string,
  plan: OrchestrationPlan
): Promise<OrchestrationResult> {
  const taskIds: string[] = [];
  const errors: string[] = [];
  
  try {
    // Create tasks for each routed assignment
    for (const routed of plan.routedTasks) {
      const primitive = TASK_PRIMITIVES[routed.primitiveId];
      
      const { data: task, error } = await supabase
        .from('agency_tasks')
        .insert({
          agency_id: agencyId,
          assigned_member_id: routed.assignedMemberId,
          title: `${primitive.name}: ${routed.input.slice(0, 50)}...`,
          description: routed.input,
          task_type: routed.primitiveId,
          status: 'queued',
          priority: routed.priority,
          progress: 0,
          input_data: {
            rawInput: routed.input,
            primitiveId: routed.primitiveId,
            orchestrated: true,
          },
          metadata: {
            source: 'leader_orchestration',
            plan: plan.originalInput.slice(0, 200),
          },
        })
        .select('id')
        .single();
      
      if (error) {
        errors.push(`Failed to create task: ${error.message}`);
      } else if (task) {
        taskIds.push(task.id);
      }
    }
    
    // Record telemetry
    await recordTelemetryEvent(agencyId, null, 'tasks_completed', taskIds.length);
    
    return {
      success: errors.length === 0,
      taskIds,
      summary: `Created ${taskIds.length} tasks from orchestration plan`,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (err) {
    return {
      success: false,
      taskIds,
      errors: [err instanceof Error ? err.message : 'Unknown error'],
    };
  }
}

/**
 * Leader routes a single task to the best agent
 */
export async function leaderRouteTask(
  agencyId: string,
  leaderId: string,
  input: string,
  members: TeamMember[]
): Promise<{ success: boolean; taskId?: string; assignedTo?: string; error?: string }> {
  const intents = parseIntents(input);
  
  if (intents.length === 0) {
    return { success: false, error: 'Could not parse task intent' };
  }
  
  const primaryIntent = intents[0];
  const bestAgent = findBestAgent(primaryIntent.primitive, members);
  
  if (!bestAgent) {
    return { success: false, error: 'No suitable agent found for this task' };
  }
  
  const primitive = TASK_PRIMITIVES[primaryIntent.primitive];
  
  const { data: task, error } = await supabase
    .from('agency_tasks')
    .insert({
      agency_id: agencyId,
      assigned_member_id: bestAgent.id,
      title: `${primitive.name}: ${input.slice(0, 50)}...`,
      description: input,
      task_type: primaryIntent.primitive,
      status: 'queued',
      priority: 50,
      progress: 0,
      input_data: {
        rawInput: input,
        primitiveId: primaryIntent.primitive,
        routedBy: leaderId,
      },
      metadata: {
        source: 'leader_route',
        assignedByLeader: true,
      },
    })
    .select('id')
    .single();
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return {
    success: true,
    taskId: task.id,
    assignedTo: bestAgent.specialization,
  };
}
