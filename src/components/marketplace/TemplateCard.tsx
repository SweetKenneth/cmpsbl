/**
 * TemplateCard — Premium visual template card with rarity and dynamic names
 * Mobile-optimized, designed to make users want to own it
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, Eye, Star, Heart, Brain, Shield, Moon, Zap, 
  MessageSquare, Settings, Server, Sparkles, TrendingUp
} from 'lucide-react';
import type { Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';
import { generateDisplayName, getRarityBadge } from '@/lib/templateNames';

const categoryIcons: Record<string, React.ElementType> = {
  brain: Brain,
  decode: MessageSquare,
  defense: Shield,
  nexus: Zap,
  vision: Eye,
  dream: Moon,
  system: Settings,
  world_engine: Server,
};

const categoryGradients: Record<string, string> = {
  brain: 'from-violet-600/30 via-violet-500/20 to-fuchsia-600/30',
  decode: 'from-cyan-600/30 via-cyan-500/20 to-blue-600/30',
  defense: 'from-rose-600/30 via-rose-500/20 to-red-600/30',
  nexus: 'from-emerald-600/30 via-emerald-500/20 to-teal-600/30',
  vision: 'from-blue-600/30 via-blue-500/20 to-indigo-600/30',
  dream: 'from-purple-600/30 via-purple-500/20 to-indigo-600/30',
  system: 'from-slate-600/30 via-slate-500/20 to-zinc-600/30',
  world_engine: 'from-orange-600/30 via-orange-500/20 to-amber-600/30',
};

const categoryColors: Record<string, string> = {
  brain: 'border-violet-500/40 shadow-violet-500/20',
  decode: 'border-cyan-500/40 shadow-cyan-500/20',
  defense: 'border-rose-500/40 shadow-rose-500/20',
  nexus: 'border-emerald-500/40 shadow-emerald-500/20',
  vision: 'border-blue-500/40 shadow-blue-500/20',
  dream: 'border-purple-500/40 shadow-purple-500/20',
  system: 'border-slate-500/40 shadow-slate-500/20',
  world_engine: 'border-orange-500/40 shadow-orange-500/20',
};

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  intermediate: { label: 'Intermediate', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  advanced: { label: 'Advanced', color: 'text-rose-400', bg: 'bg-rose-500/15' },
  premium: { label: 'Premium', color: 'text-violet-400', bg: 'bg-violet-500/15' },
  elite: { label: 'Elite', color: 'text-amber-400', bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20' },
  pro: { label: 'Pro', color: 'text-cyan-400', bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' },
};

interface TemplateCardProps {
  template: Template;
  onPreview: () => void;
  onBuy: () => void;
  isLoading?: boolean;
  featured?: boolean;
}

export function TemplateCard({ template, onPreview, onBuy, isLoading, featured }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const Icon = template.icon;
  const CategoryIcon = categoryIcons[template.category] || Zap;
  const pricing = getTemplatePricing(template.difficulty, template.id);
  const gradient = categoryGradients[template.category] || categoryGradients.brain;
  const borderColor = categoryColors[template.category] || categoryColors.brain;
  const difficulty = difficultyConfig[template.difficulty] || difficultyConfig.beginner;
  const rarity = getRarityBadge(template.difficulty);
  const displayName = generateDisplayName(template.id, template.category, template.difficulty);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "border-2 hover:shadow-2xl",
        isHovered ? borderColor : "border-border/50",
        featured && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreview}
    >
      {/* Visual Preview Header */}
      <div className={cn(
        "relative h-36 sm:h-44 overflow-hidden",
        `bg-gradient-to-br ${gradient}`
      )}>
        {/* Animated pattern */}
        <div className="absolute inset-0 bg-grid-white/10 opacity-30" />
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/5 blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/10 blur-2xl -translate-x-1/2 translate-y-1/2" />
        
        {/* Center icon display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center",
            "bg-background/95 border-2 shadow-2xl backdrop-blur-sm",
            "transition-all duration-300",
            isHovered && "scale-110 rotate-3",
            borderColor
          )}>
            <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 shadow-lg">
              <TrendingUp className="w-3 h-3" />
              Featured
            </Badge>
          </div>
        )}

        {/* Like button */}
        <button
          className={cn(
            "absolute top-3 right-3 p-2.5 rounded-full transition-all",
            "bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg",
            "border border-border/50",
            isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </button>

        {/* Quick preview overlay on hover */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <Button 
            variant="secondary" 
            size="default" 
            className="gap-2 shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <Eye className="w-4 h-4" />
            Preview Template
          </Button>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Rarity & Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn("text-[10px] h-6 px-2 border", rarity.bgColor, rarity.color, rarity.borderColor)}>
            <Sparkles className="w-3 h-3 mr-1" />
            {rarity.label}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1 h-6 px-2">
            <CategoryIcon className="w-3 h-3" />
            {template.category}
          </Badge>
        </div>

        {/* Dynamic Title */}
        <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {displayName}
        </h3>
        
        {/* Original Name as Subtitle */}
        <p className="text-xs text-muted-foreground/70 -mt-2">{template.name}</p>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {template.description}
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-1.5">
          {template.features.slice(0, 3).map((f, i) => (
            <span 
              key={i} 
              className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border/50"
            >
              {f}
            </span>
          ))}
          {template.features.length > 3 && (
            <span className="text-[10px] px-2 py-1 text-primary font-medium">
              +{template.features.length - 3} more
            </span>
          )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <span className="text-2xl font-black text-primary">
              {formatPrice(pricing.amount)}
            </span>
            <span className="text-[10px] text-muted-foreground ml-1 block">one-time</span>
          </div>
          <Button 
            size="default" 
            className="gap-2 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onBuy();
            }}
            disabled={isLoading}
          >
            <ShoppingCart className="w-4 h-4" />
            Buy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
