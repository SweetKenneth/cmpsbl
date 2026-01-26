/**
 * MarketplaceSearch — Hero search bar with quick filters
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketplaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  suggestions?: string[];
}

const POPULAR_SEARCHES = [
  'drift prevention',
  'chatbot',
  'memory',
  'NPC',
  'security',
  'dream cycles'
];

export function MarketplaceSearch({ value, onChange, resultCount, suggestions }: MarketplaceSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Main Search Bar */}
      <div className={cn(
        "relative flex items-center transition-all duration-300",
        "bg-card border rounded-2xl shadow-lg",
        isFocused ? "border-primary ring-4 ring-primary/20" : "border-border/50"
      )}>
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search 50+ templates... (e.g., 'drift prevention', 'chatbot', 'NPC')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-12 pr-24 py-6 text-base bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/70"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-16 h-8 w-8"
            onClick={() => onChange('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <Button 
          size="sm" 
          className="absolute right-2 px-4 gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Result Count */}
      {value && (
        <div className="mt-3 text-center">
          <span className="text-sm text-muted-foreground">
            Found <span className="font-semibold text-foreground">{resultCount}</span> templates
          </span>
        </div>
      )}

      {/* Popular Searches (when empty) */}
      {!value && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <Badge
              key={term}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-xs"
              onClick={() => onChange(term)}
            >
              {term}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
