/**
 * Template Alley — FREE Template Library + Template Generator
 * v9.1.0 ARCHITECT — Starting points for learning and remixing
 * All templates free, includes code snippets + paid generator
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEMPLATES, ALL_TEMPLATES, type Template } from "@/data/templates";
import { Input } from "@/components/ui/input";
import { 
  Code, 
  Sparkles, 
  Search, 
  Unlock, 
  Check, 
  Copy, 
  ArrowRight,
  Package,
  Brain,
  MessageSquare,
  Shield,
  Network,
  Eye,
  Moon,
  Settings,
  Layers,
  ChevronDown,
  ChevronUp,
  Wand2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { openCheckoutRedirect } from "@/lib/checkout/checkoutRedirect";
import { toast } from "sonner";

type SortOption = 'featured' | 'name' | 'category';

const categoryMeta: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  brain: { icon: Brain, color: "text-violet-500 bg-violet-500/10 border-violet-500/30", label: "Brain" },
  decode: { icon: MessageSquare, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", label: "Decode" },
  defense: { icon: Shield, color: "text-rose-500 bg-rose-500/10 border-rose-500/30", label: "Defense" },
  nexus: { icon: Network, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", label: "Nexus" },
  vision: { icon: Eye, color: "text-blue-500 bg-blue-500/10 border-blue-500/30", label: "Vision" },
  dream: { icon: Moon, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "Dream" },
  system: { icon: Settings, color: "text-slate-500 bg-slate-500/10 border-slate-500/30", label: "System" },
  world_engine: { icon: Layers, color: "text-amber-500 bg-amber-500/10 border-amber-500/30", label: "World Engine" },
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  advanced: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  premium: 'bg-primary/10 text-primary border-primary/30',
  elite: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  pro: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
};

export default function TemplateAlley() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    let results = ALL_TEMPLATES.filter((template) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.category.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (categoryFilter && template.category !== categoryFilter) return false;
      return true;
    });

    if (sortBy === 'name') results.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'category') results.sort((a, b) => a.category.localeCompare(b.category));

    return results;
  }, [searchQuery, categoryFilter, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_TEMPLATES.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const categories = Object.keys(categoryCounts);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <SEO
        title={`Template Alley | ${ALL_TEMPLATES.length}+ Free Templates | CMPSBL`}
        description={`Explore ${ALL_TEMPLATES.length}+ free templates for learning and remixing. All templates unlocked.`}
        keywords={["AI templates", "free templates", "cognitive templates", "code templates"]}
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* Hero */}
        <section className="py-16 md:py-24 border-b border-border/50 bg-gradient-to-b from-cyan-500/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              <Unlock className="w-3 h-3 mr-1" />
              ALL UNLOCKED
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Template Alley</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              {ALL_TEMPLATES.length}+ free templates with copy-paste code.
              Starting points for learning, remixing, and building.
            </p>
            
            {/* Explainer */}
            <div className="max-w-2xl mx-auto p-4 rounded-xl bg-muted/50 border border-border/50 mb-6">
              <div className="flex items-start gap-3 text-left">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Templates are free starting points.</strong> Copy the code, remix it, make it yours.
                  For production-ready orchestration, explore our <Link to="/engines" className="text-primary hover:underline">Engine Marketplace</Link>.
                </div>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/codelab">
                <Button className="gap-2">
                  <Code className="w-4 h-4" />
                  Open CodeLab
                </Button>
              </Link>
              <Link to="/capabilities">
                <Button variant="outline" className="gap-2">
                  <Package className="w-4 h-4" />
                  Free Capabilities
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">{ALL_TEMPLATES.length}+</div>
                <div className="text-xs text-muted-foreground">Templates</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-black text-emerald-400">
                  <Check className="w-5 h-5" />
                  FREE
                </div>
                <div className="text-xs text-muted-foreground">All Unlocked</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400">{categories.length}</div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="text-center">
                <div className="text-3xl font-black text-violet-400">
                  <Code className="w-8 h-8 inline" />
                </div>
                <div className="text-xs text-muted-foreground">With Code</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" />
              </div>
              <div className="flex gap-2">
                <select value={categoryFilter || ''} onChange={(e) => setCategoryFilter(e.target.value || null)} className="h-11 px-3 rounded-md border bg-background text-sm">
                  <option value="">All Categories</option>
                  {categories.map((cat) => (<option key={cat} value={cat}>{categoryMeta[cat]?.label || cat} ({categoryCounts[cat]})</option>))}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="h-11 px-3 rounded-md border bg-background text-sm">
                  <option value="featured">Featured</option>
                  <option value="name">Name A-Z</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Template Generator */}
        <section className="container mx-auto px-4 py-8">
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-violet-500/5 to-cyan-500/10 p-6 md:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Wand2 className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">Template Generator</h2>
                  <Badge className="bg-primary text-primary-foreground">$19</Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Generate custom templates from natural language descriptions. Describe what you want to build, 
                  and get production-ready code with best practices baked in.
                </p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Instant generation</li>
                  <li className="flex items-center gap-1"><Code className="w-3 h-3 text-cyan-400" /> Production-ready code</li>
                  <li className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-violet-400" /> Unlimited generations</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                <Button 
                  size="lg" 
                  className="gap-2 w-full md:w-auto"
                  onClick={() => openCheckoutRedirect({
                    fn: 'marketplace-checkout',
                    body: {
                      product_type: 'template_generator',
                      price_id: 'price_1SyZufQ7FtTiAL4aN8eIsVXE',
                      product_id: 'prod_TwSqj6y5PfMkPy',
                      item_name: 'CMPSBL Template Generator',
                      unit_amount_usd: 19
                    }
                  })}
                >
                  <Wand2 className="w-4 h-4" />
                  Buy Generator — $19
                </Button>
                <span className="text-xs text-center text-muted-foreground">One-time payment • Lifetime access</span>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <main className="flex-1 container mx-auto px-4 py-8 pt-0">
          <p className="text-sm text-muted-foreground mb-6">Showing {filteredTemplates.length} of {ALL_TEMPLATES.length} free templates</p>
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                const catMeta = categoryMeta[template.category] || categoryMeta.system;
                const CatIcon = catMeta.icon;
                const isExpanded = expandedTemplate === template.id;
                
                return (
                  <div 
                    key={template.id} 
                    className={cn(
                      "p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all",
                      isExpanded && "col-span-full lg:col-span-2"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", catMeta.color)}>
                          <CatIcon className="w-3 h-3 mr-1" />
                          {catMeta.label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", difficultyColors[template.difficulty])}>
                          {template.difficulty}
                        </Badge>
                      </div>
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <Check className="w-2.5 h-2.5 mr-1" />
                        FREE
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    {/* Expand/Collapse Code */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{template.estimatedTime}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                        className="gap-1"
                      >
                        <Code className="w-4 h-4" />
                        {isExpanded ? 'Hide' : 'View'} Code
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                    </div>
                    
                    {/* Expanded Code Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="relative">
                          <pre className="bg-muted/80 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[300px] overflow-y-auto">
                            <code>{template.code}</code>
                          </pre>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2 gap-1"
                            onClick={() => copyCode(template.code, template.id)}
                          >
                            {copiedId === template.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <Button variant="ghost" onClick={() => { setSearchQuery(""); setCategoryFilter(null); }}>
                Clear filters
              </Button>
            </div>
          )}
        </main>

        {/* Engine CTA */}
        <section className="border-t border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready for Production?</h2>
            <p className="text-muted-foreground mb-6">Templates are starting points. Engines are production-ready orchestrations.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/engines">
                  <Code className="w-4 h-4 mr-2" />
                  View Engine Marketplace
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/synergies">
                  <Layers className="w-4 h-4 mr-2" />
                  Explore Pipelines
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}
