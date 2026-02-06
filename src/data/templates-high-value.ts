/**
 * High-Value Templates — February 2026
 * Strategic templates for enterprise buyers
 * 20 premium templates across governance, intelligence, and operations
 */

import { LucideIcon } from 'lucide-react';
import {
  Shield, TrendingUp, Code, Users, FileText, Target, Activity,
  Building2, Server, Globe, Briefcase, BarChart3, Lock, Workflow,
  Database, Sparkles, Brain, Zap, Settings, Eye
} from 'lucide-react';

import type { Template } from './templates';

export const HIGH_VALUE_TEMPLATES: Template[] = [
  // === ENTERPRISE AI GOVERNANCE ===
  {
    id: 'ai-governance-framework',
    name: 'AI Governance Framework',
    description: 'Enterprise-grade AI governance with policy enforcement, audit trails, and compliance monitoring',
    icon: Shield,
    category: 'defense',
    difficulty: 'pro',
    estimatedTime: '90 min',
    features: ['Policy Enforcement', 'Approval Workflows', 'Audit Trails', 'Compliance Reporting'],
    code: `import { substrate } from './lib/substrate';

// AI Governance Framework — Enterprise policy enforcement
class AIGovernanceFramework {
  private policies: Map<string, GovernancePolicy> = new Map();
  private auditLog: AuditEntry[] = [];
  
  async registerPolicy(policy: GovernancePolicy): Promise<void> {
    this.policies.set(policy.id, policy);
    await substrate.brain.remember(
      \`Policy registered: \${policy.name}\`,
      'governance_policy'
    );
  }
  
  async evaluateRequest(request: AIRequest): Promise<GovernanceDecision> {
    const violations: PolicyViolation[] = [];
    for (const policy of this.policies.values()) {
      const result = await this.checkPolicy(request, policy);
      if (!result.passed) violations.push({ policy: policy.id, reason: result.reason });
    }
    return { allowed: violations.length === 0, violations };
  }
  
  async generateComplianceReport(timeframe: DateRange): Promise<ComplianceReport> {
    const logs = this.auditLog.filter(e => e.timestamp >= timeframe.start);
    return {
      totalRequests: logs.length,
      violations: logs.filter(e => e.data?.violations?.length > 0).length,
      approvalRate: this.calculateApprovalRate(logs),
    };
  }
}

export const governance = new AIGovernanceFramework();`
  },

  {
    id: 'model-registry-manager',
    name: 'Model Registry Manager',
    description: 'ML model versioning, deployment tracking, A/B testing orchestration, and rollback management',
    icon: Server,
    category: 'system',
    difficulty: 'elite',
    estimatedTime: '85 min',
    features: ['Model Versioning', 'Deployment Tracking', 'A/B Testing', 'Rollback Management'],
    code: `import { substrate } from './lib/substrate';

// Model Registry Manager — ML model lifecycle with memory
class ModelRegistryManager {
  private models: Map<string, ModelVersion[]> = new Map();
  private deployments: Deployment[] = [];
  
  async registerModel(model: ModelVersion): Promise<void> {
    const versions = this.models.get(model.name) || [];
    versions.push(model);
    this.models.set(model.name, versions);
    
    await substrate.brain.remember(
      \`Model registered: \${model.name} v\${model.version}\`,
      'model_registry'
    );
  }
  
  async deploy(modelName: string, version: string, config: DeployConfig): Promise<Deployment> {
    const deployment = {
      id: crypto.randomUUID(),
      modelName,
      version,
      config,
      status: 'active',
      deployedAt: new Date(),
    };
    
    this.deployments.push(deployment);
    await substrate.brain.remember(\`Deployed: \${modelName} v\${version}\`, 'deployment');
    return deployment;
  }
  
  async rollback(deploymentId: string): Promise<void> {
    const deployment = this.deployments.find(d => d.id === deploymentId);
    if (deployment) {
      deployment.status = 'rolled_back';
      await substrate.brain.remember(\`Rollback: \${deployment.modelName}\`, 'rollback');
    }
  }
}

export const modelRegistry = new ModelRegistryManager();`
  },

  // === STRATEGIC INTELLIGENCE ===
  {
    id: 'competitive-intelligence-engine',
    name: 'Competitive Intelligence Engine',
    description: 'Market analysis with competitor tracking, trend detection, and strategic insights',
    icon: TrendingUp,
    category: 'brain',
    difficulty: 'elite',
    estimatedTime: '75 min',
    features: ['Competitor Tracking', 'Trend Detection', 'Strategic Insights', 'Market Memory'],
    code: `import { substrate } from './lib/substrate';

// Competitive Intelligence Engine — Market analysis with memory
class CompetitiveIntelligence {
  private competitors: Map<string, CompetitorProfile> = new Map();
  
  async trackCompetitor(profile: CompetitorProfile): Promise<void> {
    const existing = this.competitors.get(profile.id);
    this.competitors.set(profile.id, profile);
    
    if (existing) {
      const changes = this.detectChanges(existing, profile);
      if (changes.length > 0) {
        await substrate.brain.remember(
          \`Competitor changes: \${profile.name} - \${changes.join(', ')}\`,
          'competitor_change'
        );
      }
    }
  }
  
  async detectTrends(): Promise<MarketTrend[]> {
    const context = await substrate.brain.query('competitor_change OR market_signal', 50);
    const analysis = await substrate.nexus.text(\`
      Analyze market trends from: \${context.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    return this.parseTrends(analysis.data?.text || '');
  }
  
  async generateInsights(): Promise<StrategicInsight[]> {
    const intel = await substrate.brain.query('trend_analysis competitor', 20);
    return this.parseInsights(intel.data?.text || '');
  }
}

export const competitiveIntel = new CompetitiveIntelligence();`
  },

  {
    id: 'decision-support-system',
    name: 'Decision Support System',
    description: 'Executive decision support with scenario modeling, risk analysis, and outcome prediction',
    icon: BarChart3,
    category: 'brain',
    difficulty: 'pro',
    estimatedTime: '80 min',
    features: ['Scenario Modeling', 'Risk Analysis', 'Outcome Prediction', 'Decision Memory'],
    code: `import { substrate } from './lib/substrate';

// Decision Support System — Executive intelligence with memory
class DecisionSupportSystem {
  private decisions: Decision[] = [];
  
  async analyzeScenario(scenario: Scenario): Promise<ScenarioAnalysis> {
    const historicalContext = await substrate.brain.query(
      \`decision \${scenario.category}\`,
      20
    );
    
    const analysis = await substrate.nexus.text(\`
      Analyze scenario: \${scenario.description}
      Historical decisions: \${historicalContext.data?.memories?.map(m => m.content).join('\\n')}
      Provide risk assessment and outcome predictions.
    \`);
    
    return this.parseAnalysis(analysis.data?.text || '');
  }
  
  async recordDecision(decision: Decision): Promise<void> {
    this.decisions.push(decision);
    await substrate.brain.remember(
      \`Decision: \${decision.title} - \${decision.outcome}\`,
      'decision_record'
    );
  }
  
  async predictOutcome(decision: ProposedDecision): Promise<OutcomePrediction> {
    const similarDecisions = await substrate.brain.query(
      \`decision \${decision.category}\`,
      15
    );
    
    const prediction = await substrate.nexus.text(\`
      Predict outcome for: \${decision.description}
      Similar decisions: \${similarDecisions.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parsePrediction(prediction.data?.text || '');
  }
}

export const decisionSupport = new DecisionSupportSystem();`
  },

  // === DEVELOPER PRODUCTIVITY ===
  {
    id: 'codebase-intelligence',
    name: 'Codebase Intelligence Agent',
    description: 'Codebase analysis with architectural insights, technical debt tracking, and pattern memory',
    icon: Code,
    category: 'system',
    difficulty: 'elite',
    estimatedTime: '80 min',
    features: ['Architecture Analysis', 'Tech Debt Tracking', 'Refactoring Hints', 'Pattern Memory'],
    code: `import { substrate } from './lib/substrate';

// Codebase Intelligence Agent
class CodebaseIntelligence {
  private techDebt: TechDebtItem[] = [];
  
  async analyzeArchitecture(root: string): Promise<ArchitectureReport> {
    const modules = await this.scanModules(root);
    const deps = await this.buildDependencyGraph(modules);
    
    const analysis = await substrate.nexus.text(\`
      Analyze architecture: \${modules.length} modules, deps: \${JSON.stringify(deps)}
    \`);
    
    await substrate.brain.remember(\`Architecture: \${analysis.data?.text}\`, 'architecture');
    return { modules, dependencies: deps, recommendations: [] };
  }
  
  async trackTechDebt(item: TechDebtItem): Promise<void> {
    this.techDebt.push(item);
    await substrate.brain.remember(
      \`Tech debt: \${item.description} in \${item.location}\`,
      'tech_debt'
    );
  }
  
  async suggestRefactoring(path: string, code: string): Promise<Suggestion[]> {
    const patterns = await substrate.brain.query(\`refactoring \${path}\`, 10);
    const suggestions = await substrate.nexus.text(\`
      Refactoring for: \${code.substring(0, 2000)}
      Patterns: \${patterns.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    return this.parseSuggestions(suggestions.data?.text || '');
  }
}

export const codebaseIntel = new CodebaseIntelligence();`
  },

  {
    id: 'devops-autopilot',
    name: 'DevOps Autopilot',
    description: 'Infrastructure automation with incident prediction, capacity planning, and operational memory',
    icon: Settings,
    category: 'system',
    difficulty: 'pro',
    estimatedTime: '85 min',
    features: ['Incident Prediction', 'Capacity Planning', 'Deploy Optimization', 'Runbook Automation'],
    code: `import { substrate } from './lib/substrate';

// DevOps Autopilot — Infrastructure intelligence with memory
class DevOpsAutopilot {
  private incidents: Incident[] = [];
  private metrics: MetricData[] = [];
  
  async predictIncident(systemId: string): Promise<IncidentPrediction> {
    const history = await substrate.brain.query(\`incident \${systemId}\`, 30);
    const currentMetrics = this.metrics.filter(m => m.systemId === systemId);
    
    const prediction = await substrate.nexus.text(\`
      Predict incidents for \${systemId}:
      Current metrics: \${JSON.stringify(currentMetrics)}
      History: \${history.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parsePrediction(prediction.data?.text || '');
  }
  
  async planCapacity(systemId: string, horizon: number): Promise<CapacityPlan> {
    const usageHistory = await substrate.brain.query(\`capacity \${systemId}\`, 50);
    
    const plan = await substrate.nexus.text(\`
      Capacity plan for \${systemId} over \${horizon} days:
      Usage history: \${usageHistory.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    await substrate.brain.remember(\`Capacity plan: \${systemId}\`, 'capacity_plan');
    return this.parsePlan(plan.data?.text || '');
  }
  
  async optimizeDeployment(config: DeployConfig): Promise<OptimizedConfig> {
    const deployHistory = await substrate.brain.query('deployment', 20);
    return this.optimize(config, deployHistory.data?.memories || []);
  }
}

export const devopsAutopilot = new DevOpsAutopilot();`
  },

  {
    id: 'api-design-assistant',
    name: 'API Design Assistant',
    description: 'API design intelligence with schema validation, versioning strategy, and design pattern memory',
    icon: Workflow,
    category: 'system',
    difficulty: 'premium',
    estimatedTime: '60 min',
    features: ['Schema Validation', 'Version Strategy', 'Breaking Change Detection', 'Design Patterns'],
    code: `import { substrate } from './lib/substrate';

// API Design Assistant — Design intelligence with memory
class APIDesignAssistant {
  private schemas: Map<string, APISchema[]> = new Map();
  
  async validateSchema(schema: APISchema): Promise<ValidationResult> {
    const patterns = await substrate.brain.query('api_pattern', 15);
    
    const validation = await substrate.nexus.text(\`
      Validate API schema: \${JSON.stringify(schema)}
      Best practices: \${patterns.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parseValidation(validation.data?.text || '');
  }
  
  async detectBreakingChanges(apiName: string, newSchema: APISchema): Promise<BreakingChange[]> {
    const versions = this.schemas.get(apiName) || [];
    const lastVersion = versions[versions.length - 1];
    
    if (!lastVersion) return [];
    
    const comparison = await substrate.nexus.text(\`
      Detect breaking changes:
      Old: \${JSON.stringify(lastVersion)}
      New: \${JSON.stringify(newSchema)}
    \`);
    
    await substrate.brain.remember(\`API changes: \${apiName}\`, 'api_change');
    return this.parseBreakingChanges(comparison.data?.text || '');
  }
  
  async suggestDesignPatterns(useCase: string): Promise<DesignPattern[]> {
    const context = await substrate.brain.query(\`api_pattern \${useCase}\`, 20);
    return this.parsePatterns(context.data?.text || '');
  }
}

export const apiDesign = new APIDesignAssistant();`
  },

  // === CUSTOMER SUCCESS ===
  {
    id: 'customer-success-brain',
    name: 'Customer Success Brain',
    description: 'Customer health scoring, churn prediction, and expansion opportunity detection',
    icon: Users,
    category: 'brain',
    difficulty: 'elite',
    estimatedTime: '70 min',
    features: ['Health Scoring', 'Churn Prediction', 'Expansion Detection', 'Interaction Memory'],
    code: `import { substrate } from './lib/substrate';

// Customer Success Brain
class CustomerSuccessBrain {
  private customers: Map<string, CustomerProfile> = new Map();
  
  async calculateHealthScore(customerId: string): Promise<HealthScore> {
    const customer = this.customers.get(customerId);
    const context = await substrate.brain.query(\`customer:\${customerId}\`, 20);
    
    const analysis = await substrate.nexus.text(\`
      Health score for \${customer?.name}: \${JSON.stringify(customer?.usageMetrics)}
      Context: \${context.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    const score = this.parseScore(analysis.data?.text || '');
    await substrate.brain.remember(\`Health: \${customer?.name} = \${score.value}\`, 'health_score');
    return score;
  }
  
  async predictChurn(customerId: string): Promise<ChurnPrediction> {
    const history = await substrate.brain.query(\`health_score customer:\${customerId}\`, 10);
    const prediction = await substrate.nexus.text(\`
      Churn risk analysis: \${history.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    return this.parseChurnPrediction(prediction.data?.text || '');
  }
  
  async detectExpansion(customerId: string): Promise<Opportunity[]> {
    const usage = await substrate.brain.query(\`usage customer:\${customerId}\`, 15);
    return this.parseOpportunities(usage.data?.text || '');
  }
}

export const customerSuccess = new CustomerSuccessBrain();`
  },

  {
    id: 'voice-of-customer-engine',
    name: 'Voice of Customer Engine',
    description: 'Customer feedback analysis with sentiment tracking, theme extraction, and feedback memory',
    icon: Sparkles,
    category: 'brain',
    difficulty: 'premium',
    estimatedTime: '65 min',
    features: ['Sentiment Analysis', 'Theme Extraction', 'Priority Scoring', 'Feedback Memory'],
    code: `import { substrate } from './lib/substrate';

// Voice of Customer Engine — Feedback analysis with memory
class VoiceOfCustomerEngine {
  private feedback: CustomerFeedback[] = [];
  
  async analyzeFeedback(feedback: CustomerFeedback): Promise<FeedbackAnalysis> {
    this.feedback.push(feedback);
    
    const sentiment = await substrate.nexus.text(\`
      Analyze sentiment: \${feedback.content}
    \`);
    
    const themes = await substrate.nexus.text(\`
      Extract themes from: \${feedback.content}
    \`);
    
    await substrate.brain.remember(
      \`Feedback: \${feedback.source} - \${sentiment.data?.text}\`,
      'customer_feedback'
    );
    
    return {
      sentiment: this.parseSentiment(sentiment.data?.text || ''),
      themes: this.parseThemes(themes.data?.text || ''),
      priority: this.calculatePriority(feedback),
    };
  }
  
  async detectTrends(): Promise<FeedbackTrend[]> {
    const recentFeedback = await substrate.brain.query('customer_feedback', 100);
    
    const trends = await substrate.nexus.text(\`
      Identify feedback trends: \${recentFeedback.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parseTrends(trends.data?.text || '');
  }
}

export const voiceOfCustomer = new VoiceOfCustomerEngine();`
  },

  // === CONTENT & MARKETING ===
  {
    id: 'content-strategy-engine',
    name: 'Content Strategy Engine',
    description: 'Content planning with SEO intelligence, topic clustering, and performance memory',
    icon: Globe,
    category: 'brain',
    difficulty: 'premium',
    estimatedTime: '60 min',
    features: ['SEO Intelligence', 'Topic Clustering', 'Performance Prediction', 'Content Memory'],
    code: `import { substrate } from './lib/substrate';

// Content Strategy Engine — Planning with memory
class ContentStrategyEngine {
  private content: ContentPiece[] = [];
  
  async analyzeTopics(keywords: string[]): Promise<TopicCluster[]> {
    const performance = await substrate.brain.query('content_performance', 30);
    
    const clusters = await substrate.nexus.text(\`
      Create topic clusters for: \${keywords.join(', ')}
      Performance history: \${performance.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parseClusters(clusters.data?.text || '');
  }
  
  async predictPerformance(content: ContentPiece): Promise<PerformancePrediction> {
    const similar = await substrate.brain.query(\`content \${content.category}\`, 20);
    
    const prediction = await substrate.nexus.text(\`
      Predict performance for: \${content.title}
      Similar content: \${similar.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parsePrediction(prediction.data?.text || '');
  }
  
  async recordPerformance(contentId: string, metrics: ContentMetrics): Promise<void> {
    await substrate.brain.remember(
      \`Content performance: \${contentId} - views: \${metrics.views}, engagement: \${metrics.engagement}\`,
      'content_performance'
    );
  }
}

export const contentStrategy = new ContentStrategyEngine();`
  },

  {
    id: 'brand-voice-guardian',
    name: 'Brand Voice Guardian',
    description: 'Brand consistency enforcement with tone detection, style guidance, and brand memory',
    icon: Lock,
    category: 'decode',
    difficulty: 'premium',
    estimatedTime: '55 min',
    features: ['Tone Detection', 'Style Guidance', 'Terminology Management', 'Brand Memory'],
    code: `import { substrate } from './lib/substrate';

// Brand Voice Guardian — Consistency with memory
class BrandVoiceGuardian {
  private guidelines: BrandGuidelines | null = null;
  
  async setGuidelines(guidelines: BrandGuidelines): Promise<void> {
    this.guidelines = guidelines;
    await substrate.brain.remember(
      \`Brand guidelines: \${JSON.stringify(guidelines)}\`,
      'brand_guidelines'
    );
  }
  
  async analyzeContent(content: string): Promise<BrandAnalysis> {
    const guidelines = await substrate.brain.query('brand_guidelines', 5);
    
    const analysis = await substrate.nexus.text(\`
      Analyze brand consistency:
      Content: \${content}
      Guidelines: \${guidelines.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parseAnalysis(analysis.data?.text || '');
  }
  
  async suggestRevisions(content: string): Promise<Revision[]> {
    const analysis = await this.analyzeContent(content);
    
    if (analysis.score < 80) {
      const revisions = await substrate.nexus.text(\`
        Suggest brand-aligned revisions for: \${content}
        Issues: \${analysis.issues.join(', ')}
      \`);
      return this.parseRevisions(revisions.data?.text || '');
    }
    
    return [];
  }
}

export const brandVoice = new BrandVoiceGuardian();`
  },

  // === LEGAL & COMPLIANCE ===
  {
    id: 'contract-intelligence',
    name: 'Contract Intelligence Agent',
    description: 'Contract analysis with clause extraction, risk identification, and obligation tracking',
    icon: FileText,
    category: 'brain',
    difficulty: 'elite',
    estimatedTime: '85 min',
    features: ['Clause Extraction', 'Risk Identification', 'Obligation Tracking', 'Contract Memory'],
    code: `import { substrate } from './lib/substrate';

// Contract Intelligence Agent
class ContractIntelligence {
  private contracts: Map<string, Contract> = new Map();
  
  async analyzeContract(contract: Contract): Promise<ContractAnalysis> {
    this.contracts.set(contract.id, contract);
    
    const clauses = await substrate.nexus.text(\`
      Extract clauses from: \${contract.content.substring(0, 5000)}
    \`);
    
    const risks = await substrate.nexus.text(\`
      Identify risks in: \${contract.content.substring(0, 5000)}
    \`);
    
    await substrate.brain.remember(
      \`Contract: \${contract.title} analyzed\`,
      'contract_analysis'
    );
    
    return {
      clauses: this.parseClauses(clauses.data?.text || ''),
      risks: this.parseRisks(risks.data?.text || ''),
    };
  }
  
  async compareContracts(id1: string, id2: string): Promise<Comparison> {
    const c1 = this.contracts.get(id1);
    const c2 = this.contracts.get(id2);
    
    const comparison = await substrate.nexus.text(\`
      Compare: \${c1?.title} vs \${c2?.title}
    \`);
    return this.parseComparison(comparison.data?.text || '');
  }
}

export const contractIntel = new ContractIntelligence();`
  },

  {
    id: 'privacy-compliance-engine',
    name: 'Privacy Compliance Engine',
    description: 'GDPR/CCPA compliance automation with data mapping, consent tracking, and regulation memory',
    icon: Shield,
    category: 'defense',
    difficulty: 'elite',
    estimatedTime: '90 min',
    features: ['Data Mapping', 'Consent Tracking', 'Breach Detection', 'Regulation Memory'],
    code: `import { substrate } from './lib/substrate';

// Privacy Compliance Engine — Regulatory automation with memory
class PrivacyComplianceEngine {
  private dataMap: DataAsset[] = [];
  private consents: ConsentRecord[] = [];
  
  async mapDataAssets(asset: DataAsset): Promise<void> {
    this.dataMap.push(asset);
    await substrate.brain.remember(
      \`Data asset: \${asset.name} - PII: \${asset.containsPII} - Location: \${asset.location}\`,
      'data_mapping'
    );
  }
  
  async trackConsent(record: ConsentRecord): Promise<void> {
    this.consents.push(record);
    await substrate.brain.remember(
      \`Consent: \${record.userId} - \${record.purpose} - \${record.granted ? 'granted' : 'denied'}\`,
      'consent_record'
    );
  }
  
  async generateComplianceReport(regulation: string): Promise<ComplianceReport> {
    const dataAssets = await substrate.brain.query('data_mapping', 50);
    const consents = await substrate.brain.query('consent_record', 50);
    
    const report = await substrate.nexus.text(\`
      Generate \${regulation} compliance report:
      Data assets: \${dataAssets.data?.memories?.map(m => m.content).join('\\n')}
      Consents: \${consents.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parseReport(report.data?.text || '');
  }
}

export const privacyCompliance = new PrivacyComplianceEngine();`
  },

  // === OPERATIONS ===
  {
    id: 'supply-chain-intelligence',
    name: 'Supply Chain Intelligence',
    description: 'Supply chain optimization with demand forecasting, risk assessment, and supply memory',
    icon: Building2,
    category: 'brain',
    difficulty: 'pro',
    estimatedTime: '85 min',
    features: ['Demand Forecasting', 'Risk Assessment', 'Supplier Scoring', 'Supply Memory'],
    code: `import { substrate } from './lib/substrate';

// Supply Chain Intelligence — Optimization with memory
class SupplyChainIntelligence {
  private suppliers: Map<string, Supplier> = new Map();
  
  async forecastDemand(productId: string, horizon: number): Promise<DemandForecast> {
    const history = await substrate.brain.query(\`demand \${productId}\`, 50);
    
    const forecast = await substrate.nexus.text(\`
      Forecast demand for \${productId} over \${horizon} days:
      History: \${history.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    await substrate.brain.remember(\`Demand forecast: \${productId}\`, 'demand_forecast');
    return this.parseForecast(forecast.data?.text || '');
  }
  
  async assessSupplierRisk(supplierId: string): Promise<RiskAssessment> {
    const supplier = this.suppliers.get(supplierId);
    const history = await substrate.brain.query(\`supplier \${supplierId}\`, 30);
    
    const risk = await substrate.nexus.text(\`
      Assess supplier risk: \${JSON.stringify(supplier)}
      History: \${history.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parseRisk(risk.data?.text || '');
  }
  
  async optimizeRouting(orders: Order[]): Promise<RoutingPlan> {
    const constraints = await substrate.brain.query('routing_constraint', 20);
    return this.calculateOptimalRoutes(orders, constraints.data?.memories || []);
  }
}

export const supplyChain = new SupplyChainIntelligence();`
  },

  {
    id: 'resource-allocation-optimizer',
    name: 'Resource Allocation Optimizer',
    description: 'Resource planning with capacity modeling, skill matching, and allocation memory',
    icon: Zap,
    category: 'brain',
    difficulty: 'premium',
    estimatedTime: '65 min',
    features: ['Capacity Modeling', 'Skill Matching', 'Utilization Optimization', 'Allocation Memory'],
    code: `import { substrate } from './lib/substrate';

// Resource Allocation Optimizer — Planning with memory
class ResourceAllocationOptimizer {
  private resources: Resource[] = [];
  private allocations: Allocation[] = [];
  
  async optimizeAllocation(tasks: Task[]): Promise<AllocationPlan> {
    const history = await substrate.brain.query('allocation', 30);
    
    const plan = await substrate.nexus.text(\`
      Optimize resource allocation:
      Tasks: \${JSON.stringify(tasks)}
      Resources: \${JSON.stringify(this.resources)}
      History: \${history.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    await substrate.brain.remember(\`Allocation plan created\`, 'allocation');
    return this.parsePlan(plan.data?.text || '');
  }
  
  async matchSkills(taskId: string): Promise<ResourceMatch[]> {
    const task = this.findTask(taskId);
    const matches = this.resources.filter(r => 
      r.skills.some(s => task?.requiredSkills.includes(s))
    );
    
    return matches.map(r => ({
      resourceId: r.id,
      matchScore: this.calculateMatchScore(r, task),
    }));
  }
  
  async predictUtilization(horizon: number): Promise<UtilizationForecast> {
    const current = this.calculateCurrentUtilization();
    const history = await substrate.brain.query('utilization', 50);
    return this.forecastUtilization(current, history.data?.memories || [], horizon);
  }
}

export const resourceOptimizer = new ResourceAllocationOptimizer();`
  },

  // === RESEARCH & ANALYTICS ===
  {
    id: 'research-synthesis-engine',
    name: 'Research Synthesis Engine',
    description: 'Research aggregation with source validation, insight extraction, and research memory',
    icon: Database,
    category: 'brain',
    difficulty: 'elite',
    estimatedTime: '80 min',
    features: ['Source Validation', 'Insight Extraction', 'Citation Management', 'Research Memory'],
    code: `import { substrate } from './lib/substrate';

// Research Synthesis Engine — Aggregation with memory
class ResearchSynthesisEngine {
  private sources: ResearchSource[] = [];
  
  async ingestSource(source: ResearchSource): Promise<SourceAnalysis> {
    this.sources.push(source);
    
    const validation = await substrate.nexus.text(\`
      Validate research source: \${source.title}
      Publisher: \${source.publisher}
      Date: \${source.publishDate}
    \`);
    
    await substrate.brain.remember(
      \`Research: \${source.title} - validity: \${validation.data?.text}\`,
      'research_source'
    );
    
    return this.parseValidation(validation.data?.text || '');
  }
  
  async synthesize(topic: string): Promise<ResearchSynthesis> {
    const sources = await substrate.brain.query(\`research_source \${topic}\`, 50);
    
    const synthesis = await substrate.nexus.text(\`
      Synthesize research on \${topic}:
      Sources: \${sources.data?.memories?.map(m => m.content).join('\\n')}
      Provide key insights and cite sources.
    \`);
    
    return this.parseSynthesis(synthesis.data?.text || '');
  }
  
  async generateCitations(format: string): Promise<Citation[]> {
    return this.sources.map(s => this.formatCitation(s, format));
  }
}

export const researchSynthesis = new ResearchSynthesisEngine();`
  },

  {
    id: 'anomaly-detection-suite',
    name: 'Anomaly Detection Suite',
    description: 'Multi-dimensional anomaly detection with pattern learning and root cause analysis',
    icon: Activity,
    category: 'vision',
    difficulty: 'elite',
    estimatedTime: '80 min',
    features: ['Pattern Learning', 'Alert Prioritization', 'Root Cause Analysis', 'Anomaly Memory'],
    code: `import { substrate } from './lib/substrate';

// Anomaly Detection Suite
class AnomalyDetection {
  private baselines: Map<string, Baseline> = new Map();
  private anomalies: Anomaly[] = [];
  
  async learnBaseline(metricId: string, data: number[]): Promise<Baseline> {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / data.length);
    
    const baseline = { metricId, mean, stdDev, upper: mean + 3 * stdDev, lower: mean - 3 * stdDev };
    this.baselines.set(metricId, baseline);
    
    await substrate.brain.remember(\`Baseline: \${metricId} mean=\${mean.toFixed(2)}\`, 'baseline');
    return baseline;
  }
  
  async detect(metricId: string, value: number): Promise<AnomalyResult> {
    const baseline = this.baselines.get(metricId);
    if (!baseline) return { isAnomaly: false };
    
    const zScore = Math.abs((value - baseline.mean) / baseline.stdDev);
    if (zScore > 3) {
      this.anomalies.push({ metricId, value, zScore, detectedAt: new Date() });
      await substrate.brain.remember(\`Anomaly: \${metricId}=\${value} z=\${zScore.toFixed(2)}\`, 'anomaly');
      await substrate.vision.alert('warn', \`Anomaly in \${metricId}\`);
    }
    return { isAnomaly: zScore > 3, zScore };
  }
  
  async analyzeRootCause(anomalyIdx: number): Promise<RootCause> {
    const anomaly = this.anomalies[anomalyIdx];
    const context = await substrate.brain.query(\`anomaly \${anomaly?.metricId}\`, 20);
    const analysis = await substrate.nexus.text(\`Root cause: \${JSON.stringify(anomaly)}\`);
    return this.parseRootCause(analysis.data?.text || '');
  }
}

export const anomalyDetection = new AnomalyDetection();`
  },

  // === SPECIALIZED AGENTS ===
  {
    id: 'sales-intelligence-agent',
    name: 'Sales Intelligence Agent',
    description: 'Prospect scoring, opportunity analysis, competitive positioning, and deal memory',
    icon: Target,
    category: 'brain',
    difficulty: 'elite',
    estimatedTime: '75 min',
    features: ['Prospect Scoring', 'Opportunity Analysis', 'Competitive Intel', 'Deal Memory'],
    code: `import { substrate } from './lib/substrate';

// Sales Intelligence Agent
class SalesIntelligence {
  private prospects: Map<string, Prospect> = new Map();
  private deals: Map<string, Deal> = new Map();
  
  async scoreProspect(prospect: Prospect): Promise<Score> {
    this.prospects.set(prospect.id, prospect);
    const history = await substrate.brain.query(\`deal industry:\${prospect.industry}\`, 10);
    
    const scoring = await substrate.nexus.text(\`
      Score prospect: \${prospect.company} in \${prospect.industry}
      History: \${history.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    await substrate.brain.remember(\`Prospect: \${prospect.company} scored\`, 'prospect_score');
    return this.parseScore(scoring.data?.text || '');
  }
  
  async analyzeDeal(deal: Deal): Promise<DealAnalysis> {
    this.deals.set(deal.id, deal);
    const similar = await substrate.brain.query(\`deal \${deal.industry}\`, 15);
    
    const analysis = await substrate.nexus.text(\`
      Analyze deal: \${JSON.stringify(deal)}
      Similar: \${similar.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    await substrate.brain.remember(\`Deal: \${deal.name} analyzed\`, 'deal_analysis');
    return this.parseAnalysis(analysis.data?.text || '');
  }
}

export const salesIntel = new SalesIntelligence();`
  },

  {
    id: 'talent-acquisition-brain',
    name: 'Talent Acquisition Brain',
    description: 'Recruiting intelligence with candidate matching, skill assessment, and hiring memory',
    icon: Users,
    category: 'brain',
    difficulty: 'elite',
    estimatedTime: '70 min',
    features: ['Candidate Matching', 'Skill Assessment', 'Culture Fit Analysis', 'Hiring Memory'],
    code: `import { substrate } from './lib/substrate';

// Talent Acquisition Brain — Recruiting with memory
class TalentAcquisitionBrain {
  private candidates: Map<string, Candidate> = new Map();
  private positions: Map<string, Position> = new Map();
  
  async matchCandidates(positionId: string): Promise<CandidateMatch[]> {
    const position = this.positions.get(positionId);
    const hiringHistory = await substrate.brain.query(\`hiring \${position?.role}\`, 20);
    
    const candidates = Array.from(this.candidates.values());
    const matches = await substrate.nexus.text(\`
      Match candidates for: \${position?.title}
      Requirements: \${position?.requirements.join(', ')}
      Candidates: \${JSON.stringify(candidates)}
      Historical hires: \${hiringHistory.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parseMatches(matches.data?.text || '');
  }
  
  async assessSkills(candidateId: string): Promise<SkillAssessment> {
    const candidate = this.candidates.get(candidateId);
    
    const assessment = await substrate.nexus.text(\`
      Assess skills for: \${candidate?.name}
      Experience: \${JSON.stringify(candidate?.experience)}
      Skills: \${candidate?.skills.join(', ')}
    \`);
    
    await substrate.brain.remember(\`Assessment: \${candidate?.name}\`, 'skill_assessment');
    return this.parseAssessment(assessment.data?.text || '');
  }
  
  async recordHire(candidateId: string, positionId: string): Promise<void> {
    await substrate.brain.remember(
      \`Hired: \${candidateId} for \${positionId}\`,
      'hiring_record'
    );
  }
}

export const talentAcquisition = new TalentAcquisitionBrain();`
  },

  {
    id: 'product-feedback-loop',
    name: 'Product Feedback Loop',
    description: 'Product intelligence with feature request analysis, user behavior learning, and product memory',
    icon: Briefcase,
    category: 'brain',
    difficulty: 'premium',
    estimatedTime: '65 min',
    features: ['Feature Analysis', 'Behavior Learning', 'Roadmap Prioritization', 'Product Memory'],
    code: `import { substrate } from './lib/substrate';

// Product Feedback Loop — Intelligence with memory
class ProductFeedbackLoop {
  private requests: FeatureRequest[] = [];
  private behaviors: UserBehavior[] = [];
  
  async analyzeFeatureRequest(request: FeatureRequest): Promise<FeatureAnalysis> {
    this.requests.push(request);
    
    const similar = await substrate.brain.query(\`feature \${request.category}\`, 20);
    
    const analysis = await substrate.nexus.text(\`
      Analyze feature request: \${request.description}
      Similar requests: \${similar.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    await substrate.brain.remember(
      \`Feature request: \${request.title} - \${analysis.data?.text}\`,
      'feature_request'
    );
    
    return this.parseAnalysis(analysis.data?.text || '');
  }
  
  async prioritizeRoadmap(): Promise<RoadmapPriority[]> {
    const requests = await substrate.brain.query('feature_request', 50);
    const behaviors = await substrate.brain.query('user_behavior', 50);
    
    const priorities = await substrate.nexus.text(\`
      Prioritize roadmap:
      Requests: \${requests.data?.memories?.map(m => m.content).join('\\n')}
      Behaviors: \${behaviors.data?.memories?.map(m => m.content).join('\\n')}
    \`);
    
    return this.parsePriorities(priorities.data?.text || '');
  }
  
  async trackBehavior(behavior: UserBehavior): Promise<void> {
    this.behaviors.push(behavior);
    await substrate.brain.remember(
      \`Behavior: \${behavior.action} - \${behavior.context}\`,
      'user_behavior'
    );
  }
}

export const productFeedback = new ProductFeedbackLoop();`
  }
];

// Export count helper
export const HIGH_VALUE_TEMPLATE_COUNT = HIGH_VALUE_TEMPLATES.length;
