/**
 * Experimentation Lab — Live Demo Templates
 * Showcases working implementations of top 5 substrate templates
 */

import { useState } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  MessageSquare, Brain, Moon, ArrowRight, Code, Sparkles, ExternalLink,
  ShoppingCart, BookOpen, Cpu, GitBranch, BarChart3, GraduationCap
} from "lucide-react";

// Live Demo Components
import { PersistentChatbotDemo } from "@/components/lab/PersistentChatbotDemo";
import { DreamProcessorDemo } from "@/components/lab/DreamProcessorDemo";
import { KnowledgeGraphDemo } from "@/components/lab/KnowledgeGraphDemo";
import { SentimentAnalysisDemo } from "@/components/lab/SentimentAnalysisDemo";
import { AdaptiveLearningDemo } from "@/components/lab/AdaptiveLearningDemo";

// Template Info Cards
const FEATURED_TEMPLATES = [
  {
    id: 'learning-agent',
    name: 'Self-Learning Chatbot',
    description: 'AI chatbot with persistent memory that learns from every conversation and recalls context across sessions.',
    icon: MessageSquare,
    color: 'from-cyan-500 to-blue-600',
    features: ['Persistent Memory', 'Context Recall', 'Continuous Learning', 'Session Reflection'],
    difficulty: 'advanced',
    price: '$147',
    tab: 'chatbot'
  },
  {
    id: 'dream-feeder',
    name: 'Dream Processor',
    description: 'Feed dreams into the cognitive substrate for mood analysis, interpretation, and synthesis.',
    icon: Moon,
    color: 'from-violet-500 to-purple-600',
    features: ['Dream Ingestion', 'Mood Analysis', 'Dream Interpretation', 'Mutation Cycles'],
    difficulty: 'beginner',
    price: '$27',
    tab: 'dream'
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Build interconnected knowledge structures with relationship mapping and cross-domain synthesis.',
    icon: GitBranch,
    color: 'from-emerald-500 to-teal-600',
    features: ['Graph Building', 'Relationship Mapping', 'Cross-Domain Synthesis', 'Memory Reinforcement'],
    difficulty: 'advanced',
    price: '$147',
    tab: 'knowledge'
  },
  {
    id: 'sentiment-engine',
    name: 'Sentiment Analysis Engine',
    description: 'Real-time text analysis with emotion detection, keyword extraction, and confidence scoring.',
    icon: BarChart3,
    color: 'from-emerald-500 to-cyan-600',
    features: ['Emotion Detection', 'Confidence Scoring', 'Keyword Extraction', 'Historical Tracking'],
    difficulty: 'intermediate',
    price: '$87',
    tab: 'sentiment'
  },
  {
    id: 'adaptive-learning',
    name: 'Adaptive Learning Assistant',
    description: 'Self-adjusting quiz system that learns from responses and adapts difficulty in real-time.',
    icon: GraduationCap,
    color: 'from-violet-500 to-pink-600',
    features: ['Adaptive Difficulty', 'Topic Mastery Tracking', 'Streak Rewards', 'Learning Analytics'],
    difficulty: 'advanced',
    price: '$127',
    tab: 'learning'
  }
];

const TEMPLATE_CODE: Record<string, string> = {
  chatbot: `import { substrate } from './lib/substrate';

// Self-Learning Chatbot with Persistent Memory
async function chat(message: string, sessionId: string) {
  // 1. Recall relevant context from memory
  const context = await substrate.brain.query(message, 5);
  
  // 2. Process with Decode (includes context)
  const response = await substrate.decode.chat(message, sessionId);
  
  // 3. Learn from this interaction
  await substrate.brain.learn(
    \`User: \${message}\\nAssistant: \${response.data?.reply}\`,
    'conversation'
  );
  
  // 4. Periodically trigger reflection
  if (shouldReflect()) {
    await substrate.brain.reflect();
  }
  
  return response.data?.reply;
}

// Recall memories about a topic
async function recall(topic: string) {
  const memories = await substrate.brain.query(topic, 10);
  return memories.data?.memories || [];
}`,

  dream: `import { substrate } from './lib/substrate';

// Feed a dream for processing
const result = await substrate.dream.feed(
  'I was floating through an endless library...',
  'dream' // or 'nightmare', 'vision', 'memory'
);

// Check Dream-Eater state
const state = await substrate.dream.status();
console.log('Mood:', state.data.current_mood);
console.log('Dreams consumed today:', state.data.dreams_consumed_today);

// Interpret a specific dream
const interpretation = await substrate.dream.interpret(
  'Flying over silver mountains with crystalline wings'
);

// Trigger mutation cycle (synthesis)
await substrate.dream.mutate();`,

  knowledge: `import { substrate } from './lib/substrate';

// Store interconnected knowledge
await substrate.brain.remember('React is a JavaScript library', 'concept');
await substrate.brain.remember('React uses virtual DOM', 'fact');
await substrate.brain.remember('Virtual DOM improves performance', 'fact');

// Build knowledge graph from memories
await substrate.brain.graphBuild();

// Get graph structure summary
const summary = await substrate.brain.graphSummary();
console.log('Nodes:', summary.data.node_count);
console.log('Edges:', summary.data.edge_count);

// Synthesize insights across domains
const insights = await substrate.brain.synthesize();
console.log('Cross-domain insights:', insights.data.insights);`,

  sentiment: `import { substrate } from './lib/substrate';

// Analyze text sentiment with emotion detection
async function analyzeSentiment(text: string) {
  // 1. Run sentiment analysis through Decode
  const analysis = await substrate.decode.analyze(text, {
    analysis_type: 'sentiment',
    include_emotions: true
  });
  
  // 2. Extract results
  const { sentiment, confidence, emotions, keywords } = analysis.data;
  
  // 3. Store analysis for learning
  await substrate.brain.learn(
    \`Sentiment: "\${text.slice(0,50)}..." → \${sentiment} (\${confidence}%)\`,
    'analysis'
  );
  
  return {
    sentiment,     // 'positive' | 'negative' | 'neutral' | 'mixed'
    confidence,    // 0-100
    emotions: {    // Emotion breakdown
      joy: emotions.joy,
      sadness: emotions.sadness,
      anger: emotions.anger,
      fear: emotions.fear,
      surprise: emotions.surprise,
      trust: emotions.trust
    },
    keywords       // Extracted key terms
  };
}

// Track sentiment trends over time
const history = await substrate.brain.query('sentiment analysis', 20);`,

  learning: `import { substrate } from './lib/substrate';

// Adaptive Learning System
class AdaptiveQuiz {
  private userProfile = {
    topicStrengths: {} as Record<string, number>,
    currentDifficulty: 'easy' as 'easy' | 'medium' | 'hard',
    streak: 0
  };

  async getNextQuestion() {
    // Select question based on user's weak topics
    const weakTopics = this.getWeakTopics();
    
    // Query for appropriate difficulty
    return await substrate.brain.query(
      \`quiz \${this.userProfile.currentDifficulty} \${weakTopics.join(' ')}\`,
      1
    );
  }

  async recordAnswer(topic: string, correct: boolean) {
    // Update topic strength
    const current = this.userProfile.topicStrengths[topic] || 0.5;
    this.userProfile.topicStrengths[topic] = correct 
      ? Math.min(1, current + 0.1)
      : Math.max(0, current - 0.15);

    // Adapt difficulty based on streak
    if (correct) {
      this.userProfile.streak++;
      if (this.userProfile.streak >= 3) {
        this.increaseDifficulty();
      }
    } else {
      this.userProfile.streak = 0;
    }

    // Store learning event
    await substrate.brain.learn(
      \`Quiz answer: topic=\${topic}, correct=\${correct}\`,
      'learning'
    );
  }

  private getWeakTopics(): string[] {
    return Object.entries(this.userProfile.topicStrengths)
      .filter(([_, score]) => score < 0.5)
      .map(([topic]) => topic);
  }

  private increaseDifficulty() {
    if (this.userProfile.currentDifficulty === 'easy') {
      this.userProfile.currentDifficulty = 'medium';
    } else if (this.userProfile.currentDifficulty === 'medium') {
      this.userProfile.currentDifficulty = 'hard';
    }
  }
}`
};

export default function ExperimentationLab() {
  const [activeTab, setActiveTab] = useState('chatbot');

  return (
    <>
      <SEO
        title="Lab — Live Template Demos & Source Code | CMPSBL"
        description="Run CMPSBL templates live: persistent memory chatbot, DREAM processor, knowledge graph builder, and more. Full source code included — fork and deploy on the substrate runtime free."
        keywords={["CMPSBL lab", "live demos", "persistent memory chatbot", "DREAM processor", "knowledge graph demo", "source code"]}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                <Cpu className="w-3 h-3 mr-1" />
                Live Demos
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-violet-500 bg-clip-text text-transparent">
                Experimentation Lab
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Experience CMPSBL Substrate templates in action. These are <strong>live implementations</strong> running 
                on the substrate—not mockups. Try them, see the code, and build your own.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/explore">
                    <ShoppingCart className="w-5 h-5" />
                    Browse All Templates
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/code-lab">
                    <Code className="w-5 h-5" />
                    View SDK
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Info Banner */}
        <section className="border-b border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>5 live templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-500" />
                <span>Full source code exposed</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-500" />
                <span>Powered by real substrate</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Free to use & learn from</span>
              </div>
            </div>
          </div>
        </section>

        {/* Template Cards */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Featured Live Templates</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
            {FEATURED_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    activeTab === template.tab ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setActiveTab(template.tab)}
                >
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <CardTitle className="text-base md:text-sm leading-tight">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{template.price}</Badge>
                    </div>
                    <CardDescription className="text-sm md:text-xs line-clamp-2 leading-relaxed">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.features.slice(0, 2).map((f) => (
                        <Badge key={f} variant="outline" className="text-xs md:text-[10px]">
                          {f}
                        </Badge>
                      ))}
                      {template.features.length > 2 && (
                        <Badge variant="outline" className="text-xs md:text-[10px]">
                          +{template.features.length - 2}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant={activeTab === template.tab ? "default" : "outline"} 
                      size="sm"
                      className="w-full gap-2 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(template.tab);
                      }}
                    >
                      {activeTab === template.tab ? 'Viewing' : 'Try It'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="container mx-auto px-4 pb-12">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-border/50 p-4 bg-muted/30">
                <TabsList className="grid grid-cols-5 max-w-2xl mx-auto">
                  <TabsTrigger value="chatbot" className="gap-1.5 text-xs">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chatbot</span>
                  </TabsTrigger>
                  <TabsTrigger value="dream" className="gap-1.5 text-xs">
                    <Moon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dream</span>
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="gap-1.5 text-xs">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Graph</span>
                  </TabsTrigger>
                  <TabsTrigger value="sentiment" className="gap-1.5 text-xs">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sentiment</span>
                  </TabsTrigger>
                  <TabsTrigger value="learning" className="gap-1.5 text-xs">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Quiz</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                {/* Interactive Demo */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">Live Demo</span>
                  </div>
                  
                  <TabsContent value="chatbot" className="mt-0">
                    <PersistentChatbotDemo />
                  </TabsContent>
                  
                  <TabsContent value="dream" className="mt-0">
                    <DreamProcessorDemo />
                  </TabsContent>
                  
                  <TabsContent value="knowledge" className="mt-0">
                    <KnowledgeGraphDemo />
                  </TabsContent>

                  <TabsContent value="sentiment" className="mt-0">
                    <SentimentAnalysisDemo />
                  </TabsContent>

                  <TabsContent value="learning" className="mt-0">
                    <AdaptiveLearningDemo />
                  </TabsContent>
                </div>

                {/* Code Preview */}
                <div className="p-6 bg-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Full Template Code</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Copy & use for free
                    </Badge>
                  </div>
                  
                  <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/50">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                      <span className="text-xs text-muted-foreground ml-2">template.ts</span>
                    </div>
                    <pre className="p-4 text-xs overflow-x-auto max-h-[400px]">
                      <code className="language-typescript">
                        {TEMPLATE_CODE[activeTab as keyof typeof TEMPLATE_CODE]}
                      </code>
                    </pre>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">This is what you get</strong> when you purchase a template from the marketplace. 
                      Full source code, ready to integrate with your application.
                    </p>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Your Own?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Browse 100+ production-ready templates in the marketplace. Each template includes 
                full source code, documentation, and integration guides.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-violet-600 hover:opacity-90">
                  <Link to="/explore">
                    <ShoppingCart className="w-5 h-5" />
                    Browse Artifacts
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link to="/documentation">
                    <BookOpen className="w-5 h-5" />
                    Read Documentation
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}
