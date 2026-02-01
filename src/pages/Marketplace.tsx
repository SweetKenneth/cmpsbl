/**
 * Marketplace — Fiverr/eBay-style browsable template store
 * Complete redesign with visual previews, search, and clear separation
 * v7.0.0 - Enhanced with Bundles, Stacks, and Agency surfaces
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TEMPLATES, type Template } from "@/data/templates";
import { MARKETPLACE_PRODUCTS, getTemplatePricing } from "@/config/marketplace-products";
import { BUNDLES, TEMPLATE_STACKS, AGENCY_PACKS } from "@/config/marketplace-bundles";
import { useMarketplaceUser } from "@/hooks/useMarketplaceUser";

// Marketplace components
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceSidebar } from "@/components/marketplace/MarketplaceSidebar";
import { TemplateCard } from "@/components/marketplace/TemplateCard";
import { TemplatePreviewModal } from "@/components/marketplace/TemplatePreviewModal";
import { FeaturedSection } from "@/components/marketplace/FeaturedSection";
import { MobileFilters } from "@/components/marketplace/MobileFilters";
import { PopularSection } from "@/components/marketplace/PopularSection";
import { UserPurchases } from "@/components/marketplace/UserPurchases";
import { MarketplaceAuthPrompt } from "@/components/marketplace/MarketplaceAuthPrompt";
import { MailingListSignup } from "@/components/marketplace/MailingListSignup";
import { AITemplateGenerator } from "@/components/marketplace/AITemplateGenerator";
import { BundlesSection } from "@/components/marketplace/BundlesSection";
import { AgencySection } from "@/components/marketplace/AgencySection";
import { SubstrateCapabilities } from "@/components/marketplace/SubstrateCapabilities";

import {
  Code, Server, Grid3X3, LayoutList, Sparkles, Package, Building2
} from "lucide-react";

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name';
type ViewMode = 'grid' | 'list';

export default function Marketplace() {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([27, 499]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Modal state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // User personalization
  const { trackView, trackPreview, isLoggedIn } = useMarketplaceUser();

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let results = TEMPLATES.filter((template) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.features.some(f => f.toLowerCase().includes(query)) ||
          template.category.toLowerCase().includes(query);
        if (!matches) return false;
      }
      
      // Category filter
      if (categoryFilter && template.category !== categoryFilter) return false;
      
      // Difficulty filter
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(template.difficulty)) {
        return false;
      }
      
      // Price range filter
      const pricing = getTemplatePricing(template.difficulty, template.id);
      const priceInDollars = pricing.amount / 100;
      if (priceInDollars < priceRange[0] || priceInDollars > priceRange[1]) {
        return false;
      }
      
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => {
          const priceA = getTemplatePricing(a.difficulty, a.id).amount;
          const priceB = getTemplatePricing(b.difficulty, b.id).amount;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        results.sort((a, b) => {
          const priceA = getTemplatePricing(a.difficulty, a.id).amount;
          const priceB = getTemplatePricing(b.difficulty, b.id).amount;
          return priceB - priceA;
        });
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Keep original order (featured first in data)
        break;
    }

    return results;
  }, [searchQuery, categoryFilter, selectedDifficulties, priceRange, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TEMPLATES.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Active filter count for mobile badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryFilter) count++;
    count += selectedDifficulties.length;
    if (priceRange[0] > 27 || priceRange[1] < 499) count++;
    return count;
  }, [categoryFilter, selectedDifficulties, priceRange]);

  // Handlers
  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearFilters = () => {
    setCategoryFilter(null);
    setSelectedDifficulties([]);
    setPriceRange([27, 499]);
    setSearchQuery("");
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
    trackPreview(template.id);
  };

  const handleCheckout = async (type: 'os' | 'world_engine' | 'template' | 'bundle' | 'stack' | 'agency', template?: Template, itemId?: string, billingCycle?: 'monthly' | 'annual') => {
    setIsCheckingOut(true);
    try {
      let priceId: string;
      let productId: string;
      let productName: string | undefined;

      if (type === 'os') {
        priceId = MARKETPLACE_PRODUCTS.os_license.price_id;
        productId = MARKETPLACE_PRODUCTS.os_license.product_id;
        productName = 'OS License';
      } else if (type === 'world_engine') {
        priceId = MARKETPLACE_PRODUCTS.world_engine.price_id;
        productId = MARKETPLACE_PRODUCTS.world_engine.product_id;
        productName = 'World Engine Complete';
      } else if (type === 'bundle' && itemId) {
        // Find bundle by ID
        const bundle = BUNDLES.find(b => b.id === itemId);
        if (!bundle?.price_id || !bundle?.product_id) {
          throw new Error('Bundle pricing not configured');
        }
        priceId = bundle.price_id;
        productId = bundle.product_id;
        productName = bundle.name;
      } else if (type === 'stack' && itemId) {
        // Find stack by ID
        const stack = TEMPLATE_STACKS.find(s => s.id === itemId);
        if (!stack?.price_id || !stack?.product_id) {
          throw new Error('Stack pricing not configured');
        }
        priceId = stack.price_id;
        productId = stack.product_id;
        productName = stack.name;
      } else if (type === 'agency' && itemId) {
        // Find agency pack by ID
        const pack = AGENCY_PACKS.find(p => p.id === itemId);
        if (!pack?.product_id) {
          throw new Error('Agency pack pricing not configured');
        }
        priceId = billingCycle === 'annual' && pack.price_id_annual 
          ? pack.price_id_annual 
          : pack.price_id_monthly!;
        productId = pack.product_id;
        productName = pack.name;
      } else if (template) {
        const pricing = getTemplatePricing(template.difficulty, template.id);
        priceId = pricing.price_id;
        productId = pricing.product_id;
        productName = template.name;
      } else {
        throw new Error("Invalid checkout parameters");
      }

      const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
        body: {
          product_type: type,
          price_id: priceId,
          product_id: productId,
          template_name: productName,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      
      window.open(data.url, '_blank');
      toast.success('Opening Stripe Checkout...');
      setPreviewOpen(false);
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Checkout failed: ${errorMessage}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleBundleCheckout = (bundleId: string) => {
    // Determine if it's a stack or bundle
    const isStack = TEMPLATE_STACKS.some(s => s.id === bundleId);
    handleCheckout(isStack ? 'stack' : 'bundle', undefined, bundleId);
  };

  const handleAgencyCheckout = (packId: string, billingCycle: 'monthly' | 'annual') => {
    handleCheckout('agency', undefined, packId, billingCycle);
  };

  return (
    <>
      <SEO
        title={`AI Template Marketplace | ${TEMPLATES.length}+ Drift-Prevention Templates | CMPSBL`}
        description={`Browse ${TEMPLATES.length}+ production-ready AI templates with memory persistence, drift prevention, and self-improvement. From $27. Build AI that remembers.`}
        keywords={["AI templates", "chatbot templates", "AI memory", "drift prevention", "LLM templates", "cognitive OS"]}
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* Header with Search */}
        <MarketplaceHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultCount={filteredTemplates.length}
        />

        {/* AI Template Generator - Featured prominently */}
        <AITemplateGenerator featured />

        {/* Substrate Capabilities - Expandable showcase */}
        <SubstrateCapabilities compact />

        {/* Live Lab CTA */}
        <section className="container mx-auto px-4 py-6">
          <Link
            to="/lab"
            className="block p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-purple-500/5 hover:border-cyan-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    See Templates in Action
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Live</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try our Experimentation Lab — 3 live demos with full source code exposed
                  </p>
                </div>
              </div>
              <Code className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </section>

        {/* Featured Products */}
        <FeaturedSection
          onBuyOS={() => handleCheckout('os')}
          onBuyWorldEngine={() => handleCheckout('world_engine')}
          isLoading={isCheckingOut}
        />

        {/* Auth Prompt for non-logged-in users */}
        <MarketplaceAuthPrompt />

        {/* User Purchases & Recommendations */}
        <UserPurchases
          onPreview={handlePreview}
          onBuy={(t) => handleCheckout('template', t)}
          isLoading={isCheckingOut}
        />

        {/* Popular/Trending Section */}
        <PopularSection
          onPreview={handlePreview}
          onBuy={(t) => handleCheckout('template', t)}
          isLoading={isCheckingOut}
        />

        {/* Bundles & Stacks Section */}
        <BundlesSection
          onBuyBundle={handleBundleCheckout}
          isLoading={isCheckingOut}
        />

        {/* Agency Licensing Section */}
        <AgencySection
          onCheckout={handleAgencyCheckout}
          isLoading={isCheckingOut}
        />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <Tabs defaultValue="templates" className="space-y-6">
            {/* Tab Header with Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="templates" className="gap-2">
                  <Code className="w-4 h-4" />
                  Templates
                  <Badge variant="secondary" className="ml-1 h-5">{TEMPLATES.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="bundles" className="gap-2">
                  <Package className="w-4 h-4" />
                  Bundles
                </TabsTrigger>
                <TabsTrigger value="licensing" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Licensing
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {/* Mobile Filters */}
                <MobileFilters
                  selectedCategory={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  selectedDifficulties={selectedDifficulties}
                  onDifficultyToggle={handleDifficultyToggle}
                  onClearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                />

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-0">
              <div className="flex gap-8">
                {/* Sidebar (Desktop) */}
                <MarketplaceSidebar
                  selectedCategory={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  selectedDifficulties={selectedDifficulties}
                  onDifficultyToggle={handleDifficultyToggle}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  categoryCounts={categoryCounts}
                  totalCount={TEMPLATES.length}
                  onClearFilters={clearFilters}
                />

                {/* Template Grid */}
                <div className="flex-1">
                  {/* Results info */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium text-foreground">{filteredTemplates.length}</span> of {TEMPLATES.length} templates
                    </p>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                        Clear filters ({activeFilterCount})
                      </Button>
                    )}
                  </div>

                  {filteredTemplates.length > 0 ? (
                    <div className={
                      viewMode === 'grid'
                        ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                        : "space-y-4"
                    }>
                      {filteredTemplates.map((template, index) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onPreview={() => handlePreview(template)}
                          onBuy={() => handleCheckout('template', template)}
                          isLoading={isCheckingOut}
                          featured={index < 3 && !searchQuery && !categoryFilter}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-medium mb-2">No templates found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Bundles Tab */}
            <TabsContent value="bundles">
              <BundlesSection
                onBuyBundle={handleBundleCheckout}
                isLoading={isCheckingOut}
              />
            </TabsContent>

            {/* Licensing Tab */}
            <TabsContent value="licensing">
              <AgencySection
                onCheckout={handleAgencyCheckout}
                isLoading={isCheckingOut}
              />
              <FeaturedSection
                onBuyOS={() => handleCheckout('os')}
                onBuyWorldEngine={() => handleCheckout('world_engine')}
                isLoading={isCheckingOut}
              />
            </TabsContent>
          </Tabs>
        </main>

        {/* Mailing List Signup */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto">
            <MailingListSignup />
          </div>
        </section>

        <EnhancedFooter />
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onBuy={(t) => handleCheckout('template', t)}
        isLoading={isCheckingOut}
      />
    </>
  );
}
