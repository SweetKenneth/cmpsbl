/**
 * MarketplaceSidebar — Category navigation and filters
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Brain, Shield, Moon, Zap, Eye, MessageSquare, Settings, Server,
  Star, Sparkles, Filter, X
} from 'lucide-react';

const CATEGORIES = [
  { id: null, name: 'All Templates', icon: Sparkles, color: 'text-primary' },
  { id: 'brain', name: 'Memory & Learning', icon: Brain, color: 'text-violet-500' },
  { id: 'decode', name: 'Chatbots & NLP', icon: MessageSquare, color: 'text-cyan-500' },
  { id: 'defense', name: 'Security & Safety', icon: Shield, color: 'text-rose-500' },
  { id: 'dream', name: 'Dream Cycles', icon: Moon, color: 'text-purple-500' },
  { id: 'vision', name: 'Observability', icon: Eye, color: 'text-blue-500' },
  { id: 'nexus', name: 'AI Routing', icon: Zap, color: 'text-emerald-500' },
  { id: 'world_engine', name: 'World Engine', icon: Server, color: 'text-orange-500' },
  { id: 'system', name: 'System & Admin', icon: Settings, color: 'text-slate-500' },
];

const DIFFICULTIES = [
  { id: 'beginner', name: 'Starter', price: '$27', color: 'bg-system-green/20 text-system-green border-system-green/30' },
  { id: 'intermediate', name: 'Advanced', price: '$87', color: 'bg-system-amber/20 text-system-amber border-system-amber/30' },
  { id: 'advanced', name: 'Enterprise', price: '$147', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  { id: 'premium', name: 'Premium', price: '$299', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { id: 'elite', name: 'Elite', price: '$399', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'pro', name: 'Pro', price: '$499', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

interface MarketplaceSidebarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedDifficulties: string[];
  onDifficultyToggle: (difficulty: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  onClearFilters: () => void;
}

export function MarketplaceSidebar({
  selectedCategory,
  onCategoryChange,
  selectedDifficulties,
  onDifficultyToggle,
  priceRange,
  onPriceRangeChange,
  categoryCounts,
  totalCount,
  onClearFilters,
}: MarketplaceSidebarProps) {
  const hasActiveFilters = selectedCategory !== null || selectedDifficulties.length > 0 || priceRange[0] > 27 || priceRange[1] < 499;

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-7 text-xs">
              <X className="w-3 h-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Category</h4>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count = cat.id ? (categoryCounts[cat.id] || 0) : totalCount;
                  const isSelected = selectedCategory === cat.id;
                  
                  return (
                    <button
                      key={cat.id ?? 'all'}
                      onClick={() => onCategoryChange(cat.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                        "hover:bg-muted/80",
                        isSelected 
                          ? "bg-primary/10 text-primary font-medium border border-primary/30" 
                          : "text-foreground/80"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", cat.color)} />
                      <span className="flex-1 text-left">{cat.name}</span>
                      <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Price Tier */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Price Tier</h4>
              <div className="space-y-2">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficulties.includes(diff.id);
                  
                  return (
                    <button
                      key={diff.id}
                      onClick={() => onDifficultyToggle(diff.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                        "hover:bg-muted/80 border",
                        isSelected 
                          ? "border-primary/50 bg-primary/5" 
                          : "border-transparent"
                      )}
                    >
                      <Badge variant="outline" className={cn("text-xs", diff.color)}>
                        {diff.name}
                      </Badge>
                      <span className="font-medium">{diff.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Price Range Slider */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Price Range</h4>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  min={27}
                  max={499}
                  step={10}
                  onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                  className="mb-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
