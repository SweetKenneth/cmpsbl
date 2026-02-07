/**
 * Template Alley — FREE Exploration Layer
 * Starting points for learning and remixing
 * v8.0.0 - Free templates, no pricing, no checkout
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES, type Template } from "@/data/templates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code, Grid3X3, LayoutList, Sparkles, Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = 'featured' | 'name' | 'category';
type ViewMode = 'grid' | 'list';

export default function TemplateAlley() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredTemplates = useMemo(() => {
    let results = TEMPLATES.filter((template) => {
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
    TEMPLATES.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const categories = Object.keys(categoryCounts);

  return (
    <>
      <SEO
        title={`Template Alley (FREE) | ${TEMPLATES.length}+ AI Templates | CMPSBL`}
        description={`Explore ${TEMPLATES.length}+ free AI templates for learning and remixing.`}
        keywords={["AI templates", "free templates", "cognitive templates"]}
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* FREE Hero */}
        <section className="py-16 md:py-24 border-b border-border/50">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4">FREE</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Template Alley</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Templates are free starting points designed for learning and remixing.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Templates cannot be promoted to engines.</span>
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
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat} ({categoryCounts[cat]})</option>))}
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

        {/* Grid */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground mb-6">Showing {filteredTemplates.length} of {TEMPLATES.length} templates</p>
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs capitalize">{template.category}</Badge>
                    <Badge className="text-[10px]">FREE</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            </div>
          )}
        </main>

        {/* CTA */}
        <section className="border-t border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready for Production?</h2>
            <p className="text-muted-foreground mb-6">Explore our Engine Marketplace for canonized orchestrations.</p>
            <Button asChild size="lg"><Link to="/engines"><Code className="w-4 h-4 mr-2" />View Engine Marketplace</Link></Button>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}
