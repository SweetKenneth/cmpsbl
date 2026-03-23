/**
 * AutoBlog Content Intelligence v2.0
 * Deep, insightful content generation with cognitive substrate awareness
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Rich topic categories for genuinely insightful content
 */
export const DEEP_TOPICS = {
  cognitiveArchitecture: [
    {
      topic: 'Memory Tiering: How AI Systems Decide What to Remember',
      hook: 'Your brain forgets 90% of what it experiences. AI systems face the same challenge—here\'s how we solve it.',
      keyPoints: ['The forgetting curve applies to machines too', 'Hot, warm, and cold memory: a cognitive architecture for persistence', 'Why importance scoring beats timestamp-based retention', 'Real implementation: from 10GB to 500MB with semantic compression'],
      seoKeywords: ['AI memory tiering', 'cognitive architecture', 'semantic compression AI'],
    },
    {
      topic: 'Self-Improvement Without Self-Destruction: Bounded Recursive Enhancement',
      hook: 'The greatest risk of self-improving AI isn\'t improvement—it\'s knowing when to stop.',
      keyPoints: ['Why unconstrained self-modification leads to instability', 'Governance gates: the constitution of autonomous systems', 'Rollback semantics: every change must be reversible', 'How we implement the "wisdom of not changing"'],
      seoKeywords: ['self-improving AI safety', 'recursive enhancement', 'AI governance gates'],
    },
    {
      topic: 'Knowledge Graphs Are Not Databases: Emergent Structure in AI Memory',
      hook: 'Traditional databases store facts. Knowledge graphs store relationships. The difference changes everything.',
      keyPoints: ['Nodes, edges, and the topology of thought', 'How semantic similarity enables "fuzzy recall"', 'Clustering: when ideas naturally group themselves', 'The substrate\'s graph: 50,000+ nodes and growing'],
      seoKeywords: ['knowledge graphs AI', 'semantic memory systems', 'emergent AI structure'],
    },
    {
      topic: 'Context Windows Are a Crutch: Building AI with True Long-Term Memory',
      hook: 'Every LLM forgets after N tokens. Here\'s how to give AI systems memory that persists forever.',
      keyPoints: ['Why context windows create artificial amnesia', 'Persistent memory vs conversation history', 'Semantic retrieval: finding relevant memories without scanning everything', 'Cross-session continuity in production systems'],
      seoKeywords: ['long-term AI memory', 'persistent memory AI', 'context window limitations'],
    },
    {
      topic: 'The Attention Economy Inside AI: How Cognitive Systems Prioritize',
      hook: 'When everything is important, nothing is. AI systems need attention management just like humans.',
      keyPoints: ['Priority scoring in cognitive workloads', 'Interrupt handling in autonomous systems', 'Focus stacking: processing similar tasks together', 'The cost of context switching in multi-agent systems'],
      seoKeywords: ['AI attention management', 'cognitive prioritization', 'autonomous task scheduling'],
    },
  ],
  
  evolutionPatterns: [
    {
      topic: 'The Evolution Cycle: How Autonomous Systems Upgrade Themselves',
      hook: 'Every 24 hours, this system decides what version of itself it should become.',
      keyPoints: ['PROPOSE → EVALUATE → SHADOW → APPLY → VERIFY', 'Confidence thresholds: the bar for self-modification', 'Risk assessment: categorizing changes by blast radius', 'The audit trail: every change has a receipt'],
      seoKeywords: ['autonomous AI evolution', 'self-upgrading systems', 'AI change management'],
    },
    {
      topic: 'Cognitive Scanning: Pre-Evolution Intelligence Gathering',
      hook: 'Before changing itself, the system asks: "What do I need to improve?"',
      keyPoints: ['Module health indicators and their thresholds', 'Performance regression detection', 'Opportunity identification: finding high-ROI improvements', 'The priority queue: not all improvements are equal'],
      seoKeywords: ['AI self-assessment', 'cognitive scanning', 'performance regression AI'],
    },
    {
      topic: 'Shadow Testing: How We Prove Changes Work Before Deploying',
      hook: 'Production is not a testing environment. Here\'s how we verify without breaking things.',
      keyPoints: ['Parallel execution: running old and new simultaneously', 'Diff analysis: detecting behavioral changes', 'Rollback triggers: automatic reversion on anomaly', 'Confidence building through graduated exposure'],
      seoKeywords: ['shadow testing AI', 'safe AI deployment', 'rollback automation'],
    },
    {
      topic: 'Version Control for Intelligence: Git for Cognitive States',
      hook: 'What if you could checkout any previous version of an AI\'s understanding?',
      keyPoints: ['Cognitive state snapshots and diff semantics', 'Branching intelligence: experimental learning paths', 'Merge conflicts in knowledge bases', 'Time-travel debugging for AI decisions'],
      seoKeywords: ['AI version control', 'cognitive state management', 'AI debugging'],
    },
    {
      topic: 'Autonomous A/B Testing: When AI Systems Run Their Own Experiments',
      hook: 'Traditional A/B testing requires humans to design experiments. What if the system designed its own?',
      keyPoints: ['Hypothesis generation from performance data', 'Statistical significance in low-traffic environments', 'Multi-armed bandits for prompt optimization', 'Ethical constraints on autonomous experimentation'],
      seoKeywords: ['autonomous A/B testing', 'AI experimentation', 'prompt optimization'],
    },
  ],

  practicalInsights: [
    {
      topic: 'Why Rate Limiting Matters More Than Raw Speed',
      hook: 'The fastest system isn\'t always the most capable. Sometimes slowing down is the upgrade.',
      keyPoints: ['API budgets: sustainable throughput over burst capacity', 'Intelligent queuing: priority-based request handling', 'Circuit breakers: failing gracefully under pressure', 'The economics of patience in distributed systems'],
      seoKeywords: ['API rate limiting', 'circuit breaker patterns', 'distributed systems resilience'],
    },
    {
      topic: 'Observability in Autonomous Systems: Watching the Watcher',
      hook: 'If an AI makes a decision in the forest and no one monitors it, did it really decide?',
      keyPoints: ['Telemetry design for cognitive systems', 'The dashboard problem: too much data, too little insight', 'Anomaly detection: finding problems before they find you', 'Vision module: the substrate\'s self-monitoring layer'],
      seoKeywords: ['AI observability', 'autonomous monitoring', 'cognitive telemetry'],
    },
    {
      topic: 'The Art of Prompt Engineering: Lessons from a Self-Prompting System',
      hook: 'This system writes its own prompts. Here\'s what it has learned about talking to itself.',
      keyPoints: ['Structured thinking: why format matters', 'Context window management: saying more with less', 'Self-critique: the power of "wait, let me reconsider"', 'Emergent strategies from autonomous prompt iteration'],
      seoKeywords: ['prompt engineering', 'self-prompting AI', 'autonomous prompt optimization'],
    },
    {
      topic: 'The Hidden Cost of AI Hallucinations in Production',
      hook: 'Hallucinations aren\'t just wrong answers—they\'re confidence-weighted lies. Here\'s how we handle them.',
      keyPoints: ['Detection patterns for confident fabrications', 'Ground-truth verification at runtime', 'Cascading hallucination: when one wrong answer contaminates a chain', 'Building trust metrics into every response'],
      seoKeywords: ['AI hallucination detection', 'production AI reliability', 'AI trust metrics'],
    },
    {
      topic: 'Zero-Downtime Migrations for AI Systems',
      hook: 'Upgrading a live AI system is like changing the engine on a moving car. Here\'s the playbook.',
      keyPoints: ['Blue-green deployments for cognitive workloads', 'State migration without data loss', 'Backward-compatible API evolution', 'The "never go down" philosophy in practice'],
      seoKeywords: ['AI system migration', 'zero-downtime deployment', 'cognitive system upgrades'],
    },
    {
      topic: 'Cost Engineering: Running Enterprise AI on a Bootstrap Budget',
      hook: 'We run 40 primitives, 4 categorys, 675+ capabilities, and zero-cost AI routing. Here\'s how.',
      keyPoints: ['Free-tier provider mesh architecture', 'Intelligent caching eliminating 68% of API calls', 'Compute optimization through task batching', 'The $0 AI bill: a monthly reality, not a marketing claim'],
      seoKeywords: ['AI cost optimization', 'free-tier AI routing', 'enterprise AI on a budget'],
    },
  ],

  researchFrontiers: [
    {
      topic: 'Substrate Independence: Building AI That Outlives Its Hardware',
      hook: 'What if your AI could run on any computer, in any cloud, forever?',
      keyPoints: ['The portability challenge: beyond containerization', 'State serialization: capturing cognitive continuity', 'Migration strategies: hot-swap deployment', 'The philosophical implications of location-independent minds'],
      seoKeywords: ['AI portability', 'substrate independence', 'cognitive continuity'],
    },
    {
      topic: 'Multi-Agent Coordination: When AI Systems Work Together',
      hook: 'One AI is interesting. A team of specialized AI agents is transformative.',
      keyPoints: ['Task decomposition: breaking complex work into agent-sized pieces', 'Communication protocols: how agents talk to each other', 'Consensus mechanisms: agreeing on shared state', 'The agency model: specialized cognitive workers'],
      seoKeywords: ['multi-agent AI', 'agent coordination', 'AI team architectures'],
    },
    {
      topic: 'Emergent Behavior: When Systems Do Things We Didn\'t Program',
      hook: 'The most interesting behaviors are the ones we didn\'t explicitly code.',
      keyPoints: ['Emergence vs. bugs: distinguishing novel from wrong', 'Pattern recognition: seeing what the system teaches itself', 'Capability discovery: finding hidden potential', 'The ethics of emergent intelligence'],
      seoKeywords: ['emergent AI behavior', 'AI capability discovery', 'autonomous learning patterns'],
    },
    {
      topic: 'Dream Cycles: Why AI Systems Need Downtime to Get Smarter',
      hook: 'Humans consolidate memories during sleep. Our AI systems do something surprisingly similar.',
      keyPoints: ['Offline processing for memory consolidation', 'Pattern extraction from daily operations', 'Insight generation: connecting disparate data points', 'The neuroscience inspiration behind cognitive rest periods'],
      seoKeywords: ['AI dream cycles', 'cognitive rest', 'memory consolidation AI'],
    },
    {
      topic: 'Federated Intelligence: Learning Across Boundaries Without Sharing Data',
      hook: 'What if AI systems could learn from each other without ever seeing each other\'s data?',
      keyPoints: ['Privacy-preserving collective intelligence', 'Model aggregation without data transfer', 'Trust networks between autonomous systems', 'Regulatory compliance through architectural design'],
      seoKeywords: ['federated learning', 'privacy-preserving AI', 'distributed intelligence'],
    },
    {
      topic: 'The Consciousness Spectrum: Measuring AI Self-Awareness',
      hook: 'We don\'t claim our system is conscious. But it does exhibit measurable self-awareness properties.',
      keyPoints: ['Self-model accuracy: does the system understand itself?', 'Metacognition metrics: thinking about thinking', 'The difference between reflection and consciousness', 'Why honest uncertainty about AI awareness matters'],
      seoKeywords: ['AI self-awareness', 'metacognition AI', 'consciousness spectrum'],
    },
  ],

  developerGuides: [
    {
      topic: 'Building on the Substrate: A Developer\'s Introduction',
      hook: 'Want to extend this cognitive system? Here\'s the architecture you need to understand.',
      keyPoints: ['Module anatomy: hooks, services, and primitives', 'The command system: terminal-driven interaction', 'State management: Zustand stores and persistence', 'Best practices from real implementation experience'],
      seoKeywords: ['CMPSBL developer guide', 'cognitive substrate SDK', 'AI platform development'],
    },
    {
      topic: 'API Design for Cognitive Systems: Lessons Learned',
      hook: 'Standard REST doesn\'t capture cognitive operations. Here\'s what we built instead.',
      keyPoints: ['Intent-based APIs: "what" not "how"', 'Streaming responses: real-time cognitive output', 'Error handling: graceful degradation in AI systems', 'Versioning strategies for evolving capabilities'],
      seoKeywords: ['cognitive API design', 'intent-based API', 'AI API best practices'],
    },
    {
      topic: 'Adding Persistent Memory to Your Agent in Under an Hour',
      hook: 'Your agent forgets everything between sessions. Here\'s how to fix that with three lines of code.',
      keyPoints: ['The withPersistentMemory wrapper pattern', 'Automatic context recall without manual retrieval', 'Memory tiering: hot, warm, and cold storage', 'Works with LangChain, CrewAI, or custom agents'],
      seoKeywords: ['persistent memory agent', 'AI agent memory', 'agent context recall'],
    },
    {
      topic: 'LangChain Integration: Memory That Actually Persists',
      hook: 'LangChain\'s built-in memory resets on restart. Here\'s the drop-in replacement.',
      keyPoints: ['Drop-in LangChainMemory class replacement', 'Semantic search across conversation history', 'Cross-session continuity without infrastructure', 'Production-ready with rate limiting and caching'],
      seoKeywords: ['LangChain persistent memory', 'LangChain integration', 'agent memory replacement'],
    },
    {
      topic: 'RAG Without the Infrastructure Pain',
      hook: 'Vector databases, embeddings, chunking... or just use an API.',
      keyPoints: ['Why most RAG implementations are over-engineered', 'Semantic retrieval without managing Pinecone/Weaviate', 'Automatic importance scoring and decay', 'From prototype to production in one day'],
      seoKeywords: ['RAG without infrastructure', 'simple RAG implementation', 'managed vector search'],
    },
  ],

  securityAndGovernance: [
    {
      topic: 'Prompt Injection Defense: A Practical Guide for 2026',
      hook: 'Attackers have evolved beyond single-shot injection. Multi-turn attacks are the new frontier.',
      keyPoints: ['Taxonomy of modern prompt injection attacks', 'Sliding-window analysis for conversation-level threats', 'Input sanitization without breaking functionality', 'The DEFENSE module\'s layered approach to prompt safety'],
      seoKeywords: ['prompt injection defense', 'AI security 2026', 'multi-turn attack prevention'],
    },
    {
      topic: 'Zero Trust for AI: Why Every Module Needs Its Own Identity',
      hook: 'If you trust your AI modules implicitly, you\'ve already been compromised.',
      keyPoints: ['Mutual TLS between cognitive modules', 'Per-request identity verification', 'Lateral movement prevention in AI architectures', 'The Zero Trust Mesh: production implementation details'],
      seoKeywords: ['zero trust AI', 'AI module security', 'cognitive system identity'],
    },
    {
      topic: 'Compliance Logging for AI: Meeting SOC 2 and HIPAA Requirements',
      hook: 'Regulators are catching up to AI. Here\'s how to be ready before they knock.',
      keyPoints: ['Cryptographic audit chains for AI decisions', 'Actor attribution: who (or what) triggered each action', 'Immutable compliance logs with hash-chain integrity', 'The AUDIT module: governance as a runtime property'],
      seoKeywords: ['AI compliance logging', 'SOC 2 AI', 'HIPAA AI requirements'],
    },
    {
      topic: 'Ethical Guardrails That Don\'t Kill Innovation',
      hook: 'Safety constraints should enable creativity, not prevent it. Here\'s the balance we found.',
      keyPoints: ['The Governance Guard capability architecture', 'Graduated constraints: warnings vs hard blocks', 'User override with audit trail', 'Why transparent AI ethics builds more trust than hidden controls'],
      seoKeywords: ['AI ethical guardrails', 'AI governance framework', 'responsible AI innovation'],
    },
    {
      topic: 'Data Sovereignty in Multi-Tenant AI: Keeping Cognitive Isolation',
      hook: 'When multiple organizations share an AI substrate, how do you prevent knowledge bleed?',
      keyPoints: ['Tenant-level memory isolation', 'Cognitive firewall implementation', 'Shared learning without shared data', 'Regulatory compliance across jurisdictions'],
      seoKeywords: ['data sovereignty AI', 'multi-tenant AI security', 'cognitive isolation'],
    },
  ],

  industryAnalysis: [
    {
      topic: 'The AI Infrastructure Stack in 2026: Winners and Gaps',
      hook: 'The tooling landscape has matured dramatically. Here\'s what matters and what\'s missing.',
      keyPoints: ['From model providers to infrastructure layers', 'The memory gap: why most AI apps still have amnesia', 'Orchestration frameworks: LangChain, CrewAI, and beyond', 'Where CMPSBL fits in the emerging stack'],
      seoKeywords: ['AI infrastructure 2026', 'AI tooling landscape', 'cognitive infrastructure stack'],
    },
    {
      topic: 'Why AI Agents Will Replace AI Chatbots',
      hook: 'Chatbots wait for instructions. Agents take initiative. The difference matters more than you think.',
      keyPoints: ['The autonomy spectrum: from reactive to proactive', 'Tool use: agents that interact with the real world', 'Goal decomposition: breaking complex objectives into steps', 'The substrate as an agent operating system'],
      seoKeywords: ['AI agents vs chatbots', 'autonomous AI agents', 'agent operating system'],
    },
    {
      topic: 'The Real Cost of Building AI Products: A Founder\'s Honest Breakdown',
      hook: 'VC-funded AI companies burn $50K/month on inference. We spend $0. Here\'s why.',
      keyPoints: ['Free-tier provider mesh vs paid API budgets', 'Caching strategies that eliminate 70% of API calls', 'The hidden costs: monitoring, testing, governance', 'Building sustainably: revenue before runway'],
      seoKeywords: ['AI product costs', 'AI startup economics', 'sustainable AI development'],
    },
    {
      topic: 'Open Source vs Proprietary AI Models: The Strategic Decision',
      hook: 'Choosing your model stack isn\'t a technical decision—it\'s a business one.',
      keyPoints: ['Control vs convenience tradeoffs', 'Fine-tuning economics: when open source wins', 'Vendor lock-in risks with proprietary APIs', 'The hybrid approach: routing to both based on task'],
      seoKeywords: ['open source AI models', 'proprietary vs open source AI', 'AI model strategy'],
    },
    {
      topic: 'Enterprise AI Adoption: What CTOs Actually Care About',
      hook: 'Hint: it\'s not model performance. It\'s auditability, security, and integration.',
      keyPoints: ['The compliance checkbox that blocks most AI projects', 'Integration with existing identity and security systems', 'Total cost of ownership beyond API fees', 'The 6-month pilot trap and how to avoid it'],
      seoKeywords: ['enterprise AI adoption', 'CTO AI priorities', 'AI enterprise integration'],
    },
  ],

  moduleDeepDives: [
    {
      topic: 'Inside the ENCODE Agent: How AI Writes Its Own Code',
      hook: 'ENCODE doesn\'t just generate code—it understands the system it\'s modifying.',
      keyPoints: ['System manifest: giving the agent architectural awareness', 'Safe modification boundaries: what ENCODE can and can\'t touch', 'Test-driven code generation: verification before commit', 'The difference between code generation and code evolution'],
      seoKeywords: ['AI code generation', 'autonomous coding agent', 'CMPSBL ENCODE module'],
    },
    {
      topic: 'RELAY and IDENTITY: The Protocol Foundation of Trust',
      hook: 'Every message between modules is authenticated, delivered, and auditable. Here\'s how.',
      keyPoints: ['Mutual TLS with identity verification', 'Dead-letter queuing for guaranteed delivery', 'Cryptographic audit trails for every interaction', 'Protocol contracts: three guarantees woven into boot sequence'],
      seoKeywords: ['AI protocol foundation', 'trusted AI communication', 'RELAY IDENTITY modules'],
    },
    {
      topic: 'INCLUSIVE: Making the Web Accessible Through AI Automation',
      hook: 'WCAG compliance shouldn\'t require a team of specialists. AI can detect and fix accessibility issues automatically.',
      keyPoints: ['Automated WCAG 2.2 violation detection', 'AI-powered remediation suggestions', 'Continuous accessibility monitoring', 'Making inclusion a substrate-level concern'],
      seoKeywords: ['AI accessibility', 'WCAG automation', 'inclusive AI design'],
    },
    {
      topic: 'VERIFY: The World\'s First AI Plugin Certification System',
      hook: 'Anyone can build an AI plugin. VERIFY ensures it\'s safe, reliable, and honest about what it does.',
      keyPoints: ['Automated security scanning for AI plugins', 'Behavioral testing: does the plugin do what it claims?', 'Continuous monitoring for post-deployment regression', 'Trust scores and certification badges'],
      seoKeywords: ['AI plugin certification', 'AI safety verification', 'CMPSBL VERIFY module'],
    },
    {
      topic: 'EVOLUTION: Legacy System Transformation with AI Analysis',
      hook: 'Your legacy codebase isn\'t technical debt—it\'s an opportunity for intelligent transformation.',
      keyPoints: ['Deep structural analysis of existing codebases', 'Risk-ranked modernization recommendations', 'Incremental migration strategies', 'ROI modeling for modernization projects'],
      seoKeywords: ['legacy modernization AI', 'code transformation', 'CMPSBL EVOLUTION'],
    },
  ],
};

/**
 * Generate deeply insightful content from topic template
 */
export async function generateInsightfulContent(
  category: keyof typeof DEEP_TOPICS,
  topicIndex?: number
): Promise<{ title: string; body: string; channel: string } | null> {
  const topics = DEEP_TOPICS[category];
  const selectedIndex = topicIndex ?? Math.floor(Math.random() * topics.length);
  const topic = topics[selectedIndex];

  if (!topic) return null;

  // Gather fresh context from the database
  const [brainStats, evolutionRuns, recentLearning] = await Promise.all([
    getBrainStats(),
    getRecentEvolutionContext(),
    getRecentLearningContext()
  ]);

  const body = `## ${topic.hook}

${generateIntroduction(topic, category)}

### The Core Insight

${topic.keyPoints[0]}

This isn't theoretical—it's running in production right now. ${getProductionContext(brainStats, evolutionRuns)}

### How It Works

${topic.keyPoints.slice(1, 3).map((point, i) => `
**${i + 1}. ${point}**

${generateExplanation(point, category)}
`).join('\n')}

### The Implementation

\`\`\`
# See it in action
${getRelevantCommands(category)}
\`\`\`

${recentLearning ? `
### Recent System Learning

The substrate recently learned: *"${recentLearning}"*

This feeds back into how we approach ${topic.topic.split(':')[0].toLowerCase()}.
` : ''}

### Why This Matters

${topic.keyPoints[topic.keyPoints.length - 1]}

The cognitive substrate exists to explore these ideas in practice—not just theory. Every day, it runs experiments on itself, measuring what works and discarding what doesn't.

---

*This post was generated autonomously by the CMPSBL substrate's AutoBlog engine, reflecting on its own architecture and learning.*

**Classification**: ${getCategoryClassification(category)}  
**Audience**: Developers, Researchers, AI Enthusiasts  
**Keywords**: ${topic.seoKeywords?.join(', ') || category}`;

  return {
    title: `🧠 ${topic.topic}`,
    body,
    channel: getChannelForCategory(category)
  };
}

async function getBrainStats(): Promise<{ nodes: number; memories: number; reflections: number }> {
  try {
    const [nodes, memories, reflections] = await Promise.all([
      supabase.from('brain_graph_nodes').select('*', { count: 'exact', head: true }),
      supabase.from('brain_memory_hot').select('*', { count: 'exact', head: true }),
      supabase.from('brain_reflections').select('*', { count: 'exact', head: true })
    ]);
    return {
      nodes: nodes.count || 0,
      memories: memories.count || 0,
      reflections: reflections.count || 0
    };
  } catch {
    return { nodes: 0, memories: 0, reflections: 0 };
  }
}

async function getRecentEvolutionContext(): Promise<string> {
  try {
    const { data } = await supabase
      .from('evolution_runs')
      .select('phase, confidence_score, metadata')
      .eq('phase', 'verified')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      const meta = data.metadata as Record<string, unknown> | null;
      return `Last evolution: ${((data.confidence_score || 0.85) * 100).toFixed(0)}% confidence, ${meta?.total_actions || 0} changes applied.`;
    }
  } catch { /* ignore */ }
  return '';
}

async function getRecentLearningContext(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('brain_memory_hot')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data?.content) {
      return data.content.substring(0, 150);
    }
  } catch { /* ignore */ }
  return null;
}

function generateIntroduction(topic: { topic: string; hook: string; keyPoints: string[] }, category: string): string {
  const intros: Record<string, string> = {
    cognitiveArchitecture: `The architecture of thinking systems isn't obvious. It emerges from thousands of design decisions, each balancing capability against complexity. Here's what we've learned building a system that thinks about ${topic.topic.split(':')[0].toLowerCase()}.`,
    evolutionPatterns: `Autonomous evolution is the holy grail of AI development—systems that improve themselves without human intervention. But it's also the most dangerous capability to get wrong. Here's our approach.`,
    practicalInsights: `Theory is easy. Production is hard. After running cognitive workloads 24/7, we've accumulated hard-won insights about what actually works.`,
    researchFrontiers: `The future of AI isn't just about bigger models—it's about smarter architectures. Here's what the frontier looks like from inside a working cognitive system.`,
    developerGuides: `Want to build on these ideas? We've open-sourced our thinking (if not our code) to help others learn from our experience.`,
    securityAndGovernance: `AI security isn't optional—it's foundational. Here's how the CMPSBL substrate approaches security and governance as runtime properties, not afterthoughts.`,
    industryAnalysis: `The AI landscape shifts weekly. Here's our perspective from inside the infrastructure layer, building the plumbing that other AI products depend on.`,
    moduleDeepDives: `Each entity in the CMPSBL substrate solves a specific problem. Here's a deep dive into one of them.`,
  };
  return intros[category] || intros.practicalInsights;
}

function getProductionContext(
  brainStats: { nodes: number; memories: number; reflections: number },
  evolutionContext: string
): string {
  if (brainStats.nodes > 0) {
    return `The substrate currently maintains ${brainStats.nodes.toLocaleString()} knowledge nodes, ${brainStats.memories.toLocaleString()} hot memories, and ${brainStats.reflections} documented reflections. ${evolutionContext}`;
  }
  return 'The system runs continuous cognitive cycles, learning and adapting in real-time.';
}

function generateExplanation(point: string, category: string): string {
  // Generate contextual explanation based on the point
  const explanations: Record<string, string> = {
    'cognitive': 'This principle emerges from observing how effective cognitive systems balance capability with efficiency.',
    'evolution': 'We learned this through hundreds of evolution cycles—some successful, some requiring rollback.',
    'practical': 'Production taught us this lesson, often the hard way.',
    'research': 'Current research points toward this direction, and our experiments confirm it.',
    'developer': 'Developers building on the substrate consistently find this pattern useful.'
  };
  
  const key = Object.keys(explanations).find(k => category.toLowerCase().includes(k)) || 'practical';
  return explanations[key];
}

function getRelevantCommands(category: string): string {
  const commands: Record<string, string> = {
    cognitiveArchitecture: `brain.status        # View memory distribution
brain.tier          # Trigger memory tiering
brain.recall <q>    # Query knowledge graph`,
    evolutionPatterns: `evolve.status       # Current evolution state
evolve.receipts     # View audit trail
evolution.omega     # Deep system analysis`,
    practicalInsights: `system.status       # Global health check
vision.stream       # Real-time telemetry
circuit.status      # Circuit breaker states`,
    researchFrontiers: `substrate.info      # Architecture overview
synergy.list        # View capability mesh
cognitive.scan      # Capability analysis`,
    developerGuides: `help                # Available commands
system.hooks        # Registered modules
atlas.status        # Control plane state`
  };
  return commands[category] || commands.developerGuides;
}

function getCategoryClassification(category: string): string {
  const classifications: Record<string, string> = {
    cognitiveArchitecture: 'Architecture Deep-Dive',
    evolutionPatterns: 'Evolution Engineering',
    practicalInsights: 'Production Insights',
    researchFrontiers: 'Research Frontier',
    developerGuides: 'Developer Guide',
    securityAndGovernance: 'Security & Governance',
    industryAnalysis: 'Industry Analysis',
    moduleDeepDives: 'Module Deep-Dive',
  };
  return classifications[category] || 'System Log';
}

function getChannelForCategory(category: string): string {
  const channels: Record<string, string> = {
    cognitiveArchitecture: 'blog',
    evolutionPatterns: 'changelog',
    practicalInsights: 'blog',
    researchFrontiers: 'blog',
    developerGuides: 'release_notes',
    securityAndGovernance: 'blog',
    industryAnalysis: 'blog',
    moduleDeepDives: 'blog',
  };
  return channels[category] || 'blog';
}

/**
 * Get all available topic categories with counts
 */
export function getTopicInventory(): Array<{
  category: keyof typeof DEEP_TOPICS;
  count: number;
  description: string;
}> {
  return [
    { category: 'cognitiveArchitecture', count: DEEP_TOPICS.cognitiveArchitecture.length, description: 'How AI systems think and remember' },
    { category: 'evolutionPatterns', count: DEEP_TOPICS.evolutionPatterns.length, description: 'Self-improvement and autonomous upgrades' },
    { category: 'practicalInsights', count: DEEP_TOPICS.practicalInsights.length, description: 'Real-world production lessons' },
    { category: 'researchFrontiers', count: DEEP_TOPICS.researchFrontiers.length, description: 'Cutting-edge AI concepts' },
    { category: 'developerGuides', count: DEEP_TOPICS.developerGuides.length, description: 'Building on the substrate' },
    { category: 'securityAndGovernance', count: DEEP_TOPICS.securityAndGovernance.length, description: 'AI security, compliance, and ethical guardrails' },
    { category: 'industryAnalysis', count: DEEP_TOPICS.industryAnalysis.length, description: 'Market trends and competitive landscape' },
    { category: 'moduleDeepDives', count: DEEP_TOPICS.moduleDeepDives.length, description: 'Deep dives into individual substrate modules' },
  ];
}

/**
 * Pick the best topic based on recent activity and coverage
 */
export async function pickOptimalTopic(): Promise<{
  category: keyof typeof DEEP_TOPICS;
  topicIndex: number;
  confidence: number;
  rationale: string;
} | null> {
  try {
    // Get recently published topics to avoid repeats
    const { data: recentPosts } = await supabase
      .from('auto_blog_posts')
      .select('title, category')
      .order('published_at', { ascending: false })
      .limit(10);

    const recentTitles = recentPosts?.map(p => p.title.toLowerCase()) || [];
    
    // Score each topic by freshness and relevance
    const inventory = getTopicInventory();
    let bestPick: { category: keyof typeof DEEP_TOPICS; topicIndex: number; confidence: number; rationale: string } | null = null;
    let highestScore = 0;

    for (const { category } of inventory) {
      const topics = DEEP_TOPICS[category];
      
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        let score = 0.5; // Base score
        
        // Check if not recently covered
        const isFresh = !recentTitles.some(t => 
          t.includes(topic.topic.toLowerCase().split(':')[0])
        );
        
        if (isFresh) {
          score += 0.3;
        }
        
        // Boost evolution content if there's recent activity
        if (category === 'evolutionPatterns') {
          const { count } = await supabase
            .from('evolution_runs')
            .select('*', { count: 'exact', head: true })
            .eq('phase', 'verified')
            .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
          
          if ((count || 0) > 0) {
            score += 0.2;
          }
        }
        
        // Add some randomness for variety
        score += Math.random() * 0.1;
        
        if (score > highestScore) {
          highestScore = score;
          bestPick = {
            category,
            topicIndex: i,
            confidence: score,
            rationale: isFresh ? 'Fresh topic with high relevance' : 'Selected for diversity'
          };
        }
      }
    }
    
    return bestPick;
  } catch (error) {
    console.error('[Content Intelligence] Error picking topic:', error);
    return null;
  }
}
