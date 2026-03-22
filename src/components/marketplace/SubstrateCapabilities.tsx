/**
 * Substrate Capabilities — Expandable showcase of all template features
 * Shows what cognitive abilities are baked into templates and the generator
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Brain, MessageSquare, Shield, Zap, Eye, Moon, Settings, Globe, Cpu,
  ChevronDown, ChevronUp, Sparkles, Network, Activity, Lock, Waves,
  BookOpen, Database, GitBranch, Gauge, Search, Target, Fingerprint,
  Lightbulb, TrendingUp, RefreshCw, AlertTriangle, Layers, Users,
  FileText, Workflow, HeartPulse, Compass, Microscope, Scale, Accessibility
} from "lucide-react";

// Capability categories with their features
const CAPABILITY_CATEGORIES = [
  {
    id: 'memory',
    title: 'Memory & Context',
    icon: Brain,
    color: 'from-neon-cyan to-neon-blue',
    description: 'Persistent context across sessions with multi-tier memory architecture',
    features: [
      { name: 'Context Recall', description: 'Retrieve relevant memories from previous interactions', icon: Search },
      { name: 'Session Persistence', description: 'Maintain conversation state across browser sessions', icon: Database },
      { name: 'Memory Tiering', description: 'Hot/Warm/Cold memory tiers for optimal retrieval', icon: Layers },
      { name: 'Knowledge Graphs', description: 'Semantic relationships between learned concepts', icon: Network },
      { name: 'Memory Compression', description: 'Intelligent summarization of older memories', icon: RefreshCw },
      { name: 'Cross-Session Learning', description: 'Build knowledge over multiple interactions', icon: TrendingUp },
    ],
  },
  {
    id: 'analysis',
    title: 'Analysis & Understanding',
    icon: Microscope,
    color: 'from-neon-purple to-neon-purple',
    description: 'Deep understanding of content, intent, and emotional context',
    features: [
      { name: 'Mood Detection', description: 'Analyze emotional tone and sentiment in real-time', icon: Activity },
      { name: 'Intent Recognition', description: 'Understand what users really want from their input', icon: Target },
      { name: 'Sentiment Analysis', description: 'Track emotional states across conversations', icon: HeartPulse },
      { name: 'Theme Extraction', description: 'Identify key themes and topics automatically', icon: Lightbulb },
      { name: 'Pattern Recognition', description: 'Detect behavioral and usage patterns', icon: GitBranch },
      { name: 'Anomaly Detection', description: 'Flag unusual patterns for review', icon: AlertTriangle },
    ],
  },
  {
    id: 'relationships',
    title: 'Relationship Mapping',
    icon: Network,
    color: 'from-neon-green to-teal-600',
    description: 'Build and traverse semantic connections between concepts',
    features: [
      { name: 'Entity Extraction', description: 'Identify people, places, and concepts from text', icon: Users },
      { name: 'Semantic Linking', description: 'Connect related concepts automatically', icon: Workflow },
      { name: 'Causal Chains', description: 'Track cause-and-effect relationships', icon: GitBranch },
      { name: 'Hierarchy Building', description: 'Organize knowledge in structured trees', icon: Layers },
      { name: 'Association Scoring', description: 'Weighted connections between concepts', icon: Scale },
      { name: 'Graph Traversal', description: 'Find paths between any two concepts', icon: Compass },
    ],
  },
  {
    id: 'learning',
    title: 'Adaptive Learning',
    icon: TrendingUp,
    color: 'from-neon-amber to-orange-600',
    description: 'Self-improving systems that get smarter with each interaction',
    features: [
      { name: 'Difficulty Scaling', description: 'Adjust complexity based on user mastery', icon: Gauge },
      { name: 'Skill Tracking', description: 'Monitor progress across knowledge domains', icon: Target },
      { name: 'Personalized Paths', description: 'Custom learning journeys per user', icon: Workflow },
      { name: 'Feedback Integration', description: 'Learn from corrections and preferences', icon: RefreshCw },
      { name: 'Competency Scoring', description: 'Track and improve task performance', icon: Activity },
      { name: 'Continuous Improvement', description: 'Background optimization of responses', icon: Sparkles },
    ],
  },
  {
    id: 'security',
    title: 'Security & Defense',
    icon: Shield,
    color: 'from-destructive to-neon-magenta',
    description: 'Built-in protection against threats and misuse',
    features: [
      { name: 'Bot Detection', description: 'Identify and block automated abuse', icon: Fingerprint },
      { name: 'Rate Limiting', description: 'Adaptive throttling to prevent abuse', icon: Gauge },
      { name: 'Input Sanitization', description: 'Clean and validate all user input', icon: Shield },
      { name: 'Threat Analysis', description: 'Real-time threat scoring and blocking', icon: AlertTriangle },
      { name: 'IP Intelligence', description: 'Reputation-based access control', icon: Globe },
      { name: 'Audit Logging', description: 'Complete activity trail for compliance', icon: FileText },
    ],
  },
  {
    id: 'evolution',
    title: 'Dream & Evolution',
    icon: Moon,
    color: 'from-primary to-neon-purple',
    description: 'Nocturnal processing for system-wide improvements',
    features: [
      { name: 'Dream Cycles', description: 'Background processing for optimization', icon: Moon },
      { name: 'Heuristic Synthesis', description: 'Generate new strategies from patterns', icon: Sparkles },
      { name: 'Memory Consolidation', description: 'Strengthen important memories overnight', icon: Database },
      { name: 'Pattern Fusion', description: 'Combine insights across domains', icon: Waves },
      { name: 'Self-Improvement', description: 'Autonomous capability enhancement', icon: TrendingUp },
      { name: 'Mutation Engine', description: 'Controlled variation for evolution', icon: RefreshCw },
    ],
  },
  {
    id: 'observability',
    title: 'Observability & Health',
    icon: Eye,
    color: 'from-sky-500 to-neon-cyan',
    description: 'Real-time monitoring and health tracking',
    features: [
      { name: 'Health Monitoring', description: 'Track system health in real-time', icon: HeartPulse },
      { name: 'Metrics Collection', description: 'Comprehensive performance metrics', icon: Activity },
      { name: 'Distributed Tracing', description: 'Track requests across all nodes', icon: Workflow },
      { name: 'Alert Management', description: 'Proactive issue notification', icon: AlertTriangle },
      { name: 'Dashboard Analytics', description: 'Visual insights into system state', icon: Gauge },
      { name: 'Dependency Mapping', description: 'Visualize module relationships', icon: Network },
    ],
  },
  {
    id: 'accessibility',
    title: 'Human Compatibility',
    icon: Accessibility,
    color: 'from-neon-magenta to-neon-magenta',
    description: 'WCAG compliance and accessibility built-in',
    features: [
      { name: 'WCAG 2.2 Scanning', description: 'Automated accessibility auditing', icon: Search },
      { name: 'Auto-Repair', description: 'Fix common accessibility issues', icon: RefreshCw },
      { name: 'Screen Reader Support', description: 'Optimized for assistive tech', icon: MessageSquare },
      { name: 'Keyboard Navigation', description: 'Full keyboard accessibility', icon: Compass },
      { name: 'Color Contrast', description: 'Ensure readable color combinations', icon: Eye },
      { name: 'Semantic HTML', description: 'Proper document structure', icon: FileText },
    ],
  },
];

interface SubstrateCapabilitiesProps {
  compact?: boolean;
}

export function SubstrateCapabilities({ compact = false }: SubstrateCapabilitiesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayCategories = compact && !showAll 
    ? CAPABILITY_CATEGORIES.slice(0, 4) 
    : CAPABILITY_CATEGORIES;

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const totalFeatures = CAPABILITY_CATEGORIES.reduce((acc, cat) => acc + cat.features.length, 0);

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-3 gap-2 px-4 py-1.5 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border-neon-cyan/30">
            <Cpu className="w-3.5 h-3.5" />
            Built Into Every Template
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-purple bg-clip-text text-transparent">
              Substrate Capabilities
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            {totalFeatures}+ cognitive abilities baked into our templates. Every template inherits 
            these production-ready features from the CMPSBL World Engine.
          </p>
        </div>

        {/* Capability Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;

            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'ring-2 ring-primary/50 sm:col-span-2' 
                    : 'hover:border-primary/30'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <CardTitle className="text-base sm:text-lg leading-tight">{category.title}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                  <Badge variant="secondary" className="w-fit text-xs mt-1">
                    {category.features.length} features
                  </Badge>
                </CardHeader>

                {/* Expanded Features */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0 border-t border-border/50">
                        <div className="grid gap-2 pt-3">
                          {category.features.map((feature, idx) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <div 
                                key={idx}
                                className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <FeatureIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium leading-tight">{feature.name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {feature.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

        {/* Show More / CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {compact && !showAll && (
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
              className="gap-2"
            >
              Show All {CAPABILITY_CATEGORIES.length} Categories
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
          
          <Link to="/docs/substrate/capabilities">
            <Button variant="ghost" className="gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              View SDK Documentation
            </Button>
          </Link>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">{totalFeatures}+</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Features</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">{CAPABILITY_CATEGORIES.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">14</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Nodes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export the capability data for use elsewhere
export { CAPABILITY_CATEGORIES };
