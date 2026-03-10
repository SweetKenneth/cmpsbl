/**
 * CommunityShowcase — Sample projects and use cases for inspiration
 * Real-world examples of what you can build with the substrate
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Star, GitFork, ExternalLink, Code, Users, Zap, Heart,
  Brain, Shield, MessageSquare, Moon, Eye, Sparkles, Rocket,
  TrendingUp, Clock, CheckCircle2, ArrowRight, Play
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowcaseProject {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  modules: string[];
  stars: number;
  forks: number;
  featured: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  previewUrl?: string;
  repoUrl?: string;
  metrics: {
    latency: string;
    requests: string;
    uptime: string;
  };
}

const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "memory-assistant",
    name: "Memory-Enhanced Personal Assistant",
    description: "A personal AI assistant that learns from every interaction, remembers preferences, and evolves its responses over time. Uses the Dream module for overnight consolidation.",
    author: "cmpsbl",
    category: "ai-assistant",
    tags: ["ai", "memory", "learning", "personal"],
    modules: ["brain", "decode", "dream", "nexus"],
    stars: 847,
    forks: 234,
    featured: true,
    difficulty: "intermediate",
    previewUrl: "#",
    metrics: { latency: "~120ms", requests: "10k/day", uptime: "99.9%" }
  },
  {
    id: "secure-api-gateway",
    name: "Enterprise API Gateway",
    description: "Production-ready API gateway with bot detection, rate limiting, and intelligent threat analysis. Includes automatic reputation scoring and adaptive security posture.",
    author: "securecorp",
    category: "security",
    tags: ["security", "api", "enterprise", "gateway"],
    modules: ["defense", "access", "vision", "core"],
    stars: 623,
    forks: 189,
    featured: true,
    difficulty: "advanced",
    metrics: { latency: "~15ms", requests: "100k/day", uptime: "99.99%" }
  },
  {
    id: "content-engine",
    name: "Self-Improving Content Engine",
    description: "AI content generation that learns from user feedback and automatically improves over time. Includes A/B testing, performance tracking, and pattern discovery.",
    author: "contentlab",
    category: "content",
    tags: ["content", "ai", "marketing", "automation"],
    modules: ["brain", "nexus", "vision", "evolution"],
    stars: 512,
    forks: 145,
    featured: false,
    difficulty: "intermediate",
    metrics: { latency: "~200ms", requests: "5k/day", uptime: "99.5%" }
  },
  {
    id: "customer-support-bot",
    name: "Context-Aware Support Bot",
    description: "Customer support chatbot with full conversation history, ticket context, and escalation handling. Learns from resolved tickets to improve future responses.",
    author: "supportai",
    category: "chatbot",
    tags: ["support", "chatbot", "customer-service"],
    modules: ["decode", "brain", "ripple", "nexus"],
    stars: 456,
    forks: 123,
    featured: false,
    difficulty: "beginner",
    previewUrl: "#",
    metrics: { latency: "~80ms", requests: "15k/day", uptime: "99.8%" }
  },
  {
    id: "world-builder",
    name: "Dynamic Game World Engine",
    description: "Procedurally generated game worlds with persistent NPCs, evolving storylines, and player memory. Uses Dream module for overnight world evolution.",
    author: "gamedev",
    category: "gaming",
    tags: ["gaming", "procedural", "world-building", "npcs"],
    modules: ["brain", "dream", "nexus", "ripple"],
    stars: 389,
    forks: 98,
    featured: true,
    difficulty: "advanced",
    metrics: { latency: "~150ms", requests: "2k/day", uptime: "99.7%" }
  },
  {
    id: "data-pipeline",
    name: "Intelligent Data Pipeline",
    description: "ETL pipeline with automatic schema detection, anomaly flagging, and self-healing capabilities. Learns optimal processing patterns over time.",
    author: "dataops",
    category: "data",
    tags: ["data", "etl", "pipeline", "automation"],
    modules: ["core", "vision", "brain", "modernizer"],
    stars: 334,
    forks: 87,
    featured: false,
    difficulty: "intermediate",
    metrics: { latency: "~50ms", requests: "50k/day", uptime: "99.95%" }
  },
  {
    id: "mood-tracker",
    name: "AI Mood & Wellness Tracker",
    description: "Personal wellness app that learns your patterns, predicts mood changes, and provides personalized recommendations based on your history.",
    author: "wellness",
    category: "health",
    tags: ["wellness", "health", "ai", "personal"],
    modules: ["brain", "decode", "dream", "vision"],
    stars: 278,
    forks: 65,
    featured: false,
    difficulty: "beginner",
    previewUrl: "#",
    metrics: { latency: "~90ms", requests: "3k/day", uptime: "99.6%" }
  },
  {
    id: "research-assistant",
    name: "Academic Research Assistant",
    description: "Research tool that remembers papers you've read, finds connections between concepts, and suggests related work based on your research interests.",
    author: "academia",
    category: "research",
    tags: ["research", "academic", "knowledge", "ai"],
    modules: ["brain", "nexus", "decode", "vision"],
    stars: 245,
    forks: 54,
    featured: false,
    difficulty: "intermediate",
    metrics: { latency: "~180ms", requests: "1k/day", uptime: "99.4%" }
  },
];

const CATEGORIES = [
  { id: "all", label: "All Projects" },
  { id: "ai-assistant", label: "AI Assistants" },
  { id: "security", label: "Security" },
  { id: "chatbot", label: "Chatbots" },
  { id: "gaming", label: "Gaming" },
  { id: "content", label: "Content" },
  { id: "data", label: "Data" },
];

const MODULE_COLORS: Record<string, string> = {
  brain: "bg-cyan-500",
  nexus: "bg-green-500",
  decode: "bg-purple-500",
  defense: "bg-amber-500",
  vision: "bg-blue-500",
  dream: "bg-pink-500",
  system: "bg-red-500",
  access: "bg-orange-500",
  core: "bg-slate-500",
  ripple: "bg-indigo-500",
  modernizer: "bg-emerald-500",
};

export function CommunityShowcase() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"stars" | "recent">("stars");

  const filteredProjects = SHOWCASE_PROJECTS
    .filter(project => {
      const matchesSearch = search === "" ||
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase()) ||
        project.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return sortBy === "stars" ? b.stars - a.stars : 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Community Showcase</h2>
            <p className="text-muted-foreground">
              Real-world projects built on the substrate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === "stars" ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => setSortBy("stars")}
          >
            <Star className="w-3 h-3" />
            Popular
          </Button>
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => setSortBy("recent")}
          >
            <Clock className="w-3 h-3" />
            Recent
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <ScrollArea className="h-[700px]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map(project => (
            <Card
              key={project.id}
              className={cn(
                "p-4 hover:border-primary/50 transition-all group",
                project.featured && "ring-1 ring-amber-500/30 bg-amber-500/5"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  {project.featured && (
                    <Badge className="mb-2 bg-amber-500/10 text-amber-500 border-amber-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">by {project.author}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "shrink-0 text-xs",
                    project.difficulty === "beginner" && "bg-emerald-500/10 text-emerald-500",
                    project.difficulty === "intermediate" && "bg-amber-500/10 text-amber-500",
                    project.difficulty === "advanced" && "bg-rose-500/10 text-rose-500"
                  )}
                >
                  {project.difficulty}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {project.description}
              </p>

              {/* Modules Used */}
              <div className="flex gap-1 mb-3">
                {project.modules.map(mod => (
                  <div
                    key={mod}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      MODULE_COLORS[mod] || "bg-slate-500"
                    )}
                    title={mod}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {project.modules.join(", ")}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-border/50 text-center">
                <div>
                  <div className="text-xs font-semibold">{project.metrics.latency}</div>
                  <div className="text-[10px] text-muted-foreground">Latency</div>
                </div>
                <div>
                  <div className="text-xs font-semibold">{project.metrics.requests}</div>
                  <div className="text-[10px] text-muted-foreground">Requests</div>
                </div>
                <div>
                  <div className="text-xs font-semibold">{project.metrics.uptime}</div>
                  <div className="text-[10px] text-muted-foreground">Uptime</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {project.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    {project.forks}
                  </span>
                </div>
                <div className="flex gap-1">
                  {project.previewUrl && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                      <Play className="w-3 h-3" />
                      Demo
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                    <Code className="w-3 h-3" />
                    Code
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No projects found matching your criteria</p>
          </div>
        )}
      </ScrollArea>

      {/* Submit Project CTA */}
      <Card className="p-4 border-primary/30 bg-primary/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-primary" />
            <div>
              <h4 className="font-semibold">Built something cool?</h4>
              <p className="text-sm text-muted-foreground">
                Share your project with the community and get featured!
              </p>
            </div>
          </div>
          <Button className="gap-2 shrink-0">
            Submit Project
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
