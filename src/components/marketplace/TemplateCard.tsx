/**
 * TemplateCard — Visual, desirable template card with preview
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, Eye, Star, Code, Heart, 
  Brain, Shield, Moon, Zap, MessageSquare, Settings, Server
} from 'lucide-react';
import type { Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';

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

const categoryColors: Record<string, string> = {
  brain: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  decode: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  defense: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  nexus: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  vision: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  dream: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  system: 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
  world_engine: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
};

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-system-green/20 text-system-green border-system-green/30',
  intermediate: 'bg-system-amber/20 text-system-amber border-system-amber/30',
  advanced: 'bg-destructive/20 text-destructive border-destructive/30',
  premium: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  elite: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  pro: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
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
  const categoryStyle = categoryColors[template.category] || categoryColors.brain;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5",
        "bg-gradient-to-b from-card to-card/80",
        featured && "ring-2 ring-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreview}
    >
      {/* Visual Preview Header */}
      <div className={cn(
        "relative h-40 bg-gradient-to-br border-b",
        categoryStyle
      )}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/10 opacity-50" />
        
        {/* Center icon display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center",
            "bg-background/90 border shadow-lg backdrop-blur-sm",
            "transition-transform duration-300",
            isHovered && "scale-110"
          )}>
            <Icon className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </Badge>
          </div>
        )}

        {/* Like button */}
        <button
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all",
            "bg-background/80 backdrop-blur-sm hover:bg-background",
            isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </button>

        {/* Quick preview button on hover */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <Eye className="w-4 h-4" />
            Quick Preview
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category & Difficulty */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] gap-1 h-5">
            <CategoryIcon className="w-3 h-3" />
            {template.category}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] h-5", difficultyStyles[template.difficulty])}>
            {template.difficulty}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {template.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {template.features.slice(0, 3).map((f, i) => (
            <span 
              key={i} 
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {f}
            </span>
          ))}
          {template.features.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
              +{template.features.length - 3} more
            </span>
          )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatPrice(pricing.amount)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">one-time</span>
          </div>
          <Button 
            size="sm" 
            className="gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onBuy();
            }}
            disabled={isLoading}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
