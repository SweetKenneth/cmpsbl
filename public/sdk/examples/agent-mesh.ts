/**
 * Example: Multi-Agent Orchestration
 * 
 * Coordinate multiple AI agents using different patterns:
 * - Chain: Sequential execution
 * - Parallel: Concurrent execution  
 * - Supervisor: One agent manages others
 * - Debate: Agents discuss and argue
 * - Swarm: Collaborative swarm intelligence
 * 
 * BYOK: Each agent uses YOUR registered API keys.
 */

import { SubstrateClient } from '../substrate-client';

const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  developerId: process.env.DEVELOPER_ID!,
  appId: process.env.APP_ID!
});

interface Agent {
  id: string;
  name: string;
  role: string;
}

/**
 * Create specialized agents
 */
async function createAgents(): Promise<Agent[]> {
  // Research Agent - thorough analysis
  const researcher = await substrate.agents.create({
    name: 'ResearchAgent',
    description: 'Conducts thorough research and analysis',
    system_prompt: `You are a research specialist. Your role is to:
- Gather comprehensive information on topics
- Cite sources and evidence
- Identify gaps in knowledge
- Provide balanced perspectives`,
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    tools: ['web_search', 'memory_query'],
    temperature: 0.3
  });

  // Critic Agent - devil's advocate
  const critic = await substrate.agents.create({
    name: 'CriticAgent',
    description: 'Challenges assumptions and finds weaknesses',
    system_prompt: `You are a critical analyst. Your role is to:
- Challenge assumptions
- Find weaknesses in arguments
- Play devil's advocate
- Ensure rigor in conclusions`,
    provider: 'openai',
    model: 'gpt-4o',
    tools: ['memory_query'],
    temperature: 0.5
  });

  // Synthesizer Agent - combines insights
  const synthesizer = await substrate.agents.create({
    name: 'SynthesizerAgent',
    description: 'Combines insights into coherent conclusions',
    system_prompt: `You are a synthesis specialist. Your role is to:
- Combine multiple viewpoints
- Resolve contradictions
- Create coherent summaries
- Provide actionable recommendations`,
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    tools: ['memory_store'],
    temperature: 0.4
  });

  return [
    { id: researcher.data?.id!, name: 'Researcher', role: 'research' },
    { id: critic.data?.id!, name: 'Critic', role: 'critique' },
    { id: synthesizer.data?.id!, name: 'Synthesizer', role: 'synthesize' }
  ];
}

/**
 * Run agents in chain pattern (sequential)
 */
async function chainExecution(agents: Agent[], task: string) {
  console.log('\n=== Chain Execution ===');
  
  const result = await substrate.agents.run(
    agents.map(a => a.id),
    task,
    { pattern: 'chain' }
  );

  console.log('Chain Result:', result.data?.final_output);
  return result.data;
}

/**
 * Run agents in parallel pattern (concurrent)
 */
async function parallelExecution(agents: Agent[], task: string) {
  console.log('\n=== Parallel Execution ===');
  
  const result = await substrate.agents.run(
    agents.map(a => a.id),
    task,
    { pattern: 'parallel' }
  );

  console.log('Parallel Results:', result.data?.agent_outputs);
  return result.data;
}

/**
 * Run agents in debate pattern (adversarial)
 */
async function debateExecution(agents: Agent[], task: string) {
  console.log('\n=== Debate Execution ===');
  
  // Use researcher and critic for debate
  const result = await substrate.agents.run(
    [agents[0].id, agents[1].id],
    task,
    { 
      pattern: 'debate',
      context: { max_rounds: 3 }
    }
  );

  console.log('Debate Transcript:', result.data?.transcript);
  console.log('Consensus:', result.data?.final_output);
  return result.data;
}

/**
 * Run agents with supervisor pattern
 */
async function supervisorExecution(agents: Agent[], task: string) {
  console.log('\n=== Supervisor Execution ===');
  
  // Synthesizer supervises researcher and critic
  const result = await substrate.agents.run(
    agents.map(a => a.id),
    task,
    { 
      pattern: 'supervisor',
      context: { supervisor_id: agents[2].id }
    }
  );

  console.log('Supervisor Result:', result.data?.final_output);
  return result.data;
}

/**
 * Get agent activity logs
 */
async function getAgentEvents(agentId: string) {
  const events = await substrate.agents.events(agentId, 50);
  console.log('Recent Events:', events.data?.events?.slice(0, 5));
  return events.data;
}

// Main
async function main() {
  console.log('=== Multi-Agent Orchestration Example ===');

  // First, register your API keys
  await substrate.keys.register('anthropic', process.env.ANTHROPIC_API_KEY!);
  await substrate.keys.register('openai', process.env.OPENAI_API_KEY!);
  await substrate.keys.register('groq', process.env.GROQ_API_KEY!);

  // Create the agent team
  const agents = await createAgents();
  console.log('Created agents:', agents.map(a => a.name));

  const researchTask = 'Analyze the potential impact of AI on software development jobs over the next 5 years';

  // Run different patterns
  await chainExecution(agents, researchTask);
  await parallelExecution(agents, researchTask);
  await debateExecution(agents, researchTask);
  await supervisorExecution(agents, researchTask);

  // Check agent activity
  await getAgentEvents(agents[0].id);
}

main().catch(console.error);

export { createAgents, chainExecution, parallelExecution, debateExecution, supervisorExecution };
