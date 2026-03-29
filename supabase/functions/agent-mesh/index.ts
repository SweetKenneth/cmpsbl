/**
 * Agent Mesh - Multi-agent coordination patterns
 * Supports: chain, parallel, supervisor, debate, swarm
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-developer-id, x-app-id',
};

interface AgentMeshRequest {
  action: 'create_agent' | 'create_mesh' | 'run_mesh' | 'status' | 'list_agents';
  agent?: {
    name: string;
    type: 'worker' | 'supervisor' | 'router' | 'critic';
    system_prompt: string;
    model_preference?: string;
    capabilities?: string[];
    constraints?: Record<string, unknown>;
  };
  mesh?: {
    pattern: 'chain' | 'parallel' | 'supervisor' | 'debate' | 'swarm';
    agents: string[];
    config?: Record<string, unknown>;
  };
  mesh_id?: string;
  input?: string;
}

interface Agent {
  id: string;
  agent_name: string;
  agent_type: string;
  system_prompt: string;
  model_preference: string;
  capabilities: string[];
  constraints: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const developerId = req.headers.get('x-developer-id');
    const appId = req.headers.get('x-app-id');
    
    if (!developerId || !appId) {
      return new Response(
        JSON.stringify({ error: 'Missing x-developer-id or x-app-id headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AgentMeshRequest = await req.json();
    const { action } = body;

    switch (action) {
      case 'create_agent': {
        const { agent } = body;
        if (!agent) {
          return new Response(
            JSON.stringify({ error: 'Missing agent definition' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('substrate_agents')
          .upsert({
            developer_id: developerId,
            app_id: appId,
            agent_name: agent.name,
            agent_type: agent.type,
            system_prompt: agent.system_prompt,
            model_preference: agent.model_preference || 'groq/llama-3.3-70b-versatile',
            capabilities: agent.capabilities || [],
            constraints: agent.constraints || {},
            is_active: true,
          }, {
            onConflict: 'developer_id,app_id,agent_name',
          })
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, agent: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list_agents': {
        const { data, error } = await supabase
          .from('substrate_agents')
          .select('*')
          .eq('developer_id', developerId)
          .eq('app_id', appId)
          .eq('is_active', true);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ agents: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'run_mesh': {
        const { mesh, input } = body;
        if (!mesh || !input) {
          return new Response(
            JSON.stringify({ error: 'Missing mesh config or input' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get agents
        const { data: agents, error: agentError } = await supabase
          .from('substrate_agents')
          .select('*')
          .eq('developer_id', developerId)
          .eq('app_id', appId)
          .in('agent_name', mesh.agents)
          .eq('is_active', true);

        if (agentError || !agents?.length) {
          return new Response(
            JSON.stringify({ error: 'Agents not found', requested: mesh.agents }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const meshId = crypto.randomUUID();
        const startTime = Date.now();
        let result: unknown;
        let events: Array<Record<string, unknown>> = [];

        // Execute based on pattern
        switch (mesh.pattern) {
          case 'chain': {
            // Sequential execution, output of one feeds into next
            let currentInput = input;
            for (const agentName of mesh.agents) {
              const agent = agents.find(a => a.agent_name === agentName);
              if (!agent) continue;

              const agentResult = await executeAgent(supabase, agent, currentInput, developerId, appId);
              
              events.push({
                mesh_id: meshId,
                agent_id: agent.id,
                event_type: 'task_completed',
                source_agent: agentName,
                payload: { input: currentInput, output: agentResult.content },
                tokens_used: agentResult.tokens,
                duration_ms: agentResult.duration,
              });

              currentInput = agentResult.content;
            }
            result = { final_output: currentInput, pattern: 'chain' };
            break;
          }

          case 'parallel': {
            // Execute all agents in parallel
            const parallelResults = await Promise.all(
              mesh.agents.map(async (agentName) => {
                const agent = agents.find(a => a.agent_name === agentName);
                if (!agent) return null;

                const agentResult = await executeAgent(supabase, agent, input, developerId, appId);
                
                events.push({
                  mesh_id: meshId,
                  agent_id: agent.id,
                  event_type: 'task_completed',
                  source_agent: agentName,
                  payload: { output: agentResult.content },
                  tokens_used: agentResult.tokens,
                  duration_ms: agentResult.duration,
                });

                return { agent: agentName, output: agentResult.content };
              })
            );
            result = { outputs: parallelResults.filter(Boolean), pattern: 'parallel' };
            break;
          }

          case 'supervisor': {
            // Supervisor delegates to workers, synthesizes results
            const supervisor = agents.find(a => a.agent_type === 'supervisor');
            const workers = agents.filter(a => a.agent_type === 'worker');

            if (!supervisor) {
              return new Response(
                JSON.stringify({ error: 'No supervisor agent found' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            // Supervisor plans
            const plan = await executeAgent(supabase, supervisor, 
              `Plan how to handle this task using these workers: ${workers.map(w => w.agent_name).join(', ')}\n\nTask: ${input}`,
              developerId, appId
            );

            events.push({
              mesh_id: meshId,
              agent_id: supervisor.id,
              event_type: 'task_assigned',
              source_agent: supervisor.agent_name,
              payload: { plan: plan.content },
              tokens_used: plan.tokens,
              duration_ms: plan.duration,
            });

            // Workers execute
            const workerResults = await Promise.all(
              workers.map(async (worker) => {
                const workerResult = await executeAgent(supabase, worker, input, developerId, appId);
                events.push({
                  mesh_id: meshId,
                  agent_id: worker.id,
                  event_type: 'task_completed',
                  source_agent: worker.agent_name,
                  payload: { output: workerResult.content },
                  tokens_used: workerResult.tokens,
                  duration_ms: workerResult.duration,
                });
                return { worker: worker.agent_name, output: workerResult.content };
              })
            );

            // Supervisor synthesizes
            const synthesis = await executeAgent(supabase, supervisor,
              `Synthesize these worker outputs:\n${workerResults.map(r => `${r.worker}: ${r.output}`).join('\n\n')}`,
              developerId, appId
            );

            result = { 
              pattern: 'supervisor',
              plan: plan.content,
              worker_outputs: workerResults,
              synthesis: synthesis.content,
            };
            break;
          }

          case 'debate': {
            // Agents debate, critic synthesizes
            const debaters = agents.filter(a => a.agent_type !== 'critic');
            const critic = agents.find(a => a.agent_type === 'critic');

            // Round 1: Initial positions
            const positions = await Promise.all(
              debaters.map(async (agent) => {
                const pos = await executeAgent(supabase, agent, input, developerId, appId);
                events.push({
                  mesh_id: meshId,
                  agent_id: agent.id,
                  event_type: 'task_completed',
                  source_agent: agent.agent_name,
                  payload: { round: 1, position: pos.content },
                  tokens_used: pos.tokens,
                  duration_ms: pos.duration,
                });
                return { agent: agent.agent_name, position: pos.content };
              })
            );

            // Round 2: Rebuttals
            const rebuttals = await Promise.all(
              debaters.map(async (agent, i) => {
                const otherPositions = positions.filter((_, j) => j !== i);
                const rebuttal = await executeAgent(supabase, agent,
                  `Respond to these positions:\n${otherPositions.map(p => `${p.agent}: ${p.position}`).join('\n\n')}`,
                  developerId, appId
                );
                return { agent: agent.agent_name, rebuttal: rebuttal.content };
              })
            );

            // Critic synthesizes
            let finalVerdict = positions.map(p => p.position).join('\n');
            if (critic) {
              const verdict = await executeAgent(supabase, critic,
                `Evaluate this debate and provide final verdict:\n\nPositions:\n${positions.map(p => `${p.agent}: ${p.position}`).join('\n\n')}\n\nRebuttals:\n${rebuttals.map(r => `${r.agent}: ${r.rebuttal}`).join('\n\n')}`,
                developerId, appId
              );
              finalVerdict = verdict.content;
            }

            result = {
              pattern: 'debate',
              positions,
              rebuttals,
              verdict: finalVerdict,
            };
            break;
          }

          case 'swarm': {
            // All agents work together, sharing context
            const roundsCount = Number(mesh.config?.rounds) || 3;
            let sharedContext = input;
            const contributions: Array<{ round: number; agent: string; contribution: string }> = [];

            for (let round = 1; round <= roundsCount; round++) {
              for (const agent of agents) {
                const contrib = await executeAgent(supabase, agent,
                  `Round ${round}. Shared context:\n${sharedContext}\n\nAdd your contribution:`,
                  developerId, appId
                );
                
                contributions.push({
                  round,
                  agent: agent.agent_name,
                  contribution: contrib.content,
                });

                sharedContext = `${sharedContext}\n\n[${agent.agent_name}]: ${contrib.content}`;

                events.push({
                  mesh_id: meshId,
                  agent_id: agent.id,
                  event_type: 'task_completed',
                  source_agent: agent.agent_name,
                  payload: { round, contribution: contrib.content },
                  tokens_used: contrib.tokens,
                  duration_ms: contrib.duration,
                });
              }
            }

            result = {
              pattern: 'swarm',
              rounds: roundsCount,
              contributions,
              final_context: sharedContext,
            };
            break;
          }
        }

        // Store events
        if (events.length > 0) {
          await supabase.from('substrate_agent_events').insert(events);
        }

        return new Response(
          JSON.stringify({
            success: true,
            mesh_id: meshId,
            duration_ms: Date.now() - startTime,
            result,
            events_count: events.length,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        return new Response(
          JSON.stringify({
            status: 'operational',
            patterns: ['chain', 'parallel', 'supervisor', 'debate', 'swarm'],
            agent_types: ['worker', 'supervisor', 'router', 'critic'],
            version: '1.0.0',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: unknown) {
    console.error('Agent Mesh error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Execute a single agent using BYOK proxy
async function executeAgent(
  _supabase: unknown,
  agent: Agent,
  input: string,
  developerId: string,
  appId: string
): Promise<{ content: string; tokens: number; duration: number }> {
  const startTime = Date.now();
  
  // Parse model preference
  const [provider, model] = (agent.model_preference || 'groq/llama-3.3-70b-versatile').split('/');
  
  // Call BYOK proxy
  const baseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  try {
    const response = await fetch(`${baseUrl}/functions/v1/byok-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'x-developer-id': developerId,
        'x-app-id': appId,
      },
      body: JSON.stringify({
        provider,
        model,
        messages: [
          { role: 'system', content: agent.system_prompt },
          { role: 'user', content: input },
        ],
        max_tokens: agent.constraints?.max_tokens || 1024,
        temperature: agent.constraints?.temperature || 0.7,
      }),
    });

    const result = await response.json();
    
    return {
      content: result.content || result.error || 'No response',
      tokens: (result.usage?.total_tokens) || 0,
      duration: Date.now() - startTime,
    };
  } catch (error: unknown) {
    return {
      content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      tokens: 0,
      duration: Date.now() - startTime,
    };
  }
}
