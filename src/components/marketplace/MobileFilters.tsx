/**
 * MobileFilters — Responsive filter drawer for mobile
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Filter, X, Brain, Shield, Moon, Zap, Eye, MessageSquare, Settings, Server, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: null, name: 'All', icon: Sparkles, color: 'text-primary' },
  { id: 'brain', name: 'Memory', icon: Brain, color: 'text-neon-purple' },
  { id: 'decode', name: 'Chatbots', icon: MessageSquare, color: 'text-neon-cyan' },
  { id: 'defense', name: 'Security', icon: Shield, color: 'text-neon-magenta' },
  { id: 'dream', name: 'Dream', icon: Moon, color: 'text-neon-purple' },
  { id: 'vision', name: 'Vision', icon: Eye, color: 'text-neon-blue' },
  { id: 'nexus', name: 'Routing', icon: Zap, color: 'text-neon-green' },
  { id: 'world_engine', name: 'World', icon: Server, color: 'text-neon-amber' },
];

const DIFFICULTIES = [
  { id: 'beginner', name: 'Starter', price: '$27' },
  { id: 'intermediate', name: 'Advanced', price: '$87' },
  { id: 'advanced', name: 'Enterprise', price: '$147' },
  { id: 'premium', name: 'Premium', price: '$299' },
  { id: 'elite', name: 'Elite', price: '$399' },
  { id: 'pro', name: 'Pro', price: '$499' },
];

interface MobileFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedDifficulties: string[];
  onDifficultyToggle: (difficulty: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function MobileFilters({
  selectedCategory,
  onCategoryChange,
  selectedDifficulties,
  onDifficultyToggle,
  onClearFilters,
  activeFilterCount,
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Filters</SheetTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  Clear all
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-100px)]">
            {/* Categories */}
            <div>
              <h4 className="font-medium mb-3">Category</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  
                  return (
                    <Button
                      key={cat.id ?? 'all'}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        onCategoryChange(cat.id);
                      }}
                      className="gap-1.5"
                    >
                      <Icon className={cn("w-4 h-4", !isSelected && cat.color)} />
                      {cat.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Price Tiers */}
            <div>
              <h4 className="font-medium mb-3">Price Tier</h4>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficulties.includes(diff.id);
                  
                  return (
                    <Button
                      key={diff.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => onDifficultyToggle(diff.id)}
                      className="justify-between"
                    >
                      <span>{diff.name}</span>
                      <span className="text-xs opacity-70">{diff.price}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Apply button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button className="w-full" onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
