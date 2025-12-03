import { Brain, Sparkles, TrendingUp, GitBranch, Zap, LineChart, Network, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

export default function BrainHub() {
  const navigate = useNavigate();

  const brainTools = [
    {
      icon: Brain,
      title: "Brain Training Console",
      description: "Train and fine-tune AI models with custom datasets and adaptive learning parameters.",
      href: "/brain/training",
      status: "Active",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Brain Learning",
      description: "Monitor learning progress, accuracy metrics, and model performance in real-time.",
      href: "/brain-learning",
      status: "Active",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: LineChart,
      title: "Brain Analytics",
      description: "Deep analytics on AI behavior, decision patterns, and intelligence evolution.",
      href: "/brain-analytics",
      status: "Active",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Network,
      title: "Brain ML Engine",
      description: "Machine learning core with behavioral analysis and anomaly detection.",
      href: "/brain-ml",
      status: "Active",
      color: "from-pink-500 to-red-500"
    },
    {
      icon: Sparkles,
      title: "Learning Intelligence",
      description: "Advanced intelligence layer that learns from every interaction across the ecosystem.",
      href: "/learning-intelligence",
      status: "Active",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: GitBranch,
      title: "Cascade Mindmap",
      description: "Visualize AI decision trees, neural pathways, and knowledge graph connections.",
      href: "/cascade-mindmap",
      status: "Active",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: Zap,
      title: "Sentience Hub",
      description: "Monitor autonomous AI consciousness, dream cycles, and emergent behaviors.",
      href: "/sentience-hub",
      status: "Active",
      color: "from-yellow-500 to-green-500"
    },
    {
      icon: FileText,
      title: "Reflex Keys",
      description: "Manage API keys, access tokens, and authentication credentials for Brain modules.",
      href: "/admin/reflex-keys",
      status: "Admin",
      color: "from-green-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Brain Hub — AI Intelligence Tools | PromptFluid"
        description="Access all PromptFluid Brain intelligence tools: training console, analytics, ML engine, learning intelligence, and autonomous consciousness monitoring."
        canonical="https://promptfluid.com/brain-hub"
        keywords={[
          'AI brain tools',
          'machine learning console',
          'AI training platform',
          'brain analytics',
          'autonomous AI',
          'sentience monitoring',
          'neural pathways',
          'AI consciousness',
          'adaptive learning',
          'intelligence evolution'
        ]}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Intelligence Command Center</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Brain Hub
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Access all AI intelligence tools, training consoles, and autonomous consciousness monitoring systems in one centralized hub.
          </p>

          <Link to="/projects/brain">
            <Button size="lg" variant="outline">
              Learn About Cascade Brain →
            </Button>
          </Link>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brainTools.map((tool, index) => (
            <Card 
              key={index}
              className="p-6 glass border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(tool.href)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{tool.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tool.status === 'Admin' 
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                }`}>
                  {tool.status}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
