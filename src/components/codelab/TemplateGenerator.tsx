/**
 * Surface D — Template Browser & Generator
 * Browse 70+ templates or generate custom ones
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Copy, Check, Download, Search,
  Brain, Shield, Zap, Eye, Moon, MessageSquare, Settings,
  ChevronDown, ChevronUp, Filter
} from "lucide-react";
import { toast } from "sonner";
import { TEMPLATES, getCategoryCounts, type Template } from "@/data/templates";

const categoryIcons: Record<string, React.ElementType> = {
  brain: Brain,
  decode: MessageSquare,
  defense: Shield,
  nexus: Zap,
  vision: Eye,
  dream: Moon,
  system: Settings,
};

const categoryColors: Record<string, string> = {
  brain: "text-violet-500 border-violet-500/30 bg-violet-500/10",
  decode: "text-cyan-500 border-cyan-500/30 bg-cyan-500/10",
  defense: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  nexus: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  vision: "text-rose-500 border-rose-500/30 bg-rose-500/10",
  dream: "text-purple-500 border-purple-500/30 bg-purple-500/10",
  system: "text-blue-500 border-blue-500/30 bg-blue-500/10",
};

const difficultyColors: Record<string, string> = {
  beginner: "text-green-500",
  intermediate: "text-yellow-500",
  advanced: "text-red-500",
};

function TemplateCard({ template, onSelect }: { template: Template; onSelect: (t: Template) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = template.icon;
  const CategoryIcon = categoryIcons[template.category] || Zap;

  const copyCode = () => {
    navigator.clipboard.writeText(template.code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([template.code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}.ts`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <Card className="p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ 
            background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1))` 
          }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{template.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline" className={`text-xs gap-1 ${categoryColors[template.category]}`}>
          <CategoryIcon className="w-3 h-3" />
          {template.category}
        </Badge>
        <Badge variant="outline" className={`text-xs ${difficultyColors[template.difficulty]}`}>
          {template.difficulty}
        </Badge>
        <span className="text-xs text-muted-foreground">{template.estimatedTime}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {template.features.slice(0, 3).map((feature, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {feature}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
          {expanded ? "Hide Code" : "View Code"}
        </Button>
        <Button variant="ghost" size="sm" onClick={copyCode}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadCode}>
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t">
          <ScrollArea className="h-[300px]">
            <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {template.code}
            </pre>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}

export function TemplateGenerator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.features.some(f => f.toLowerCase().includes(query)) ||
          template.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter && template.category !== categoryFilter) return false;

      // Difficulty filter
      if (difficultyFilter && template.difficulty !== difficultyFilter) return false;

      return true;
    });
  }, [searchQuery, categoryFilter, difficultyFilter]);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Template Library
          </h2>
          <p className="text-sm text-muted-foreground">
            {TEMPLATES.length} templates across {Object.keys(categoryCounts).length} modules
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Filter className="w-3 h-3" />
            {filteredTemplates.length} showing
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Category filters */}
        <Button
          variant={categoryFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter(null)}
          className="text-xs"
        >
          All ({TEMPLATES.length})
        </Button>
        {Object.entries(categoryCounts).map(([category, count]) => {
          const Icon = categoryIcons[category] || Zap;
          return (
            <Button
              key={category}
              variant={categoryFilter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
              className={`text-xs gap-1 ${categoryFilter === category ? '' : categoryColors[category]}`}
            >
              <Icon className="w-3 h-3" />
              {category} ({count})
            </Button>
          );
        })}
      </div>

      {/* Difficulty filters */}
      <div className="flex gap-2">
        {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => {
          const count = TEMPLATES.filter(t => t.difficulty === difficulty).length;
          return (
            <Button
              key={difficulty}
              variant={difficultyFilter === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter(difficultyFilter === difficulty ? null : difficulty)}
              className={`text-xs ${difficultyFilter !== difficulty ? difficultyColors[difficulty] : ''}`}
            >
              {difficulty} ({count})
            </Button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={setSelectedTemplate}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates match your filters</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter(null);
              setDifficultyFilter(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
