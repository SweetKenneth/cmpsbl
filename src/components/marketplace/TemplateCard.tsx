/**
 * TemplateCard — Premium visual template card with rarity, dynamic names, and rarity images
 * Mobile-optimized, designed to make users want to own it
 * Fixed checkout and like functionality
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, Eye, Star, Heart, Brain, Shield, Moon, Zap, 
  MessageSquare, Settings, Server, Sparkles, TrendingUp, Lock, Clock
} from 'lucide-react';
import type { Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';
import { generateDisplayName, getRarityBadge } from '@/lib/templateNames';
import { getRarityByDifficulty } from '@/config/marketplace-rarity';

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
  brain: 'from-neon-purple/30 via-neon-purple/20 to-neon-magenta/30',
  decode: 'from-neon-cyan/30 via-neon-cyan/20 to-neon-blue/30',
  defense: 'from-neon-magenta/30 via-neon-magenta/20 to-destructive/30',
  nexus: 'from-neon-green/30 via-neon-green/20 to-teal-600/30',
  vision: 'from-neon-blue/30 via-neon-blue/20 to-primary/30',
  dream: 'from-neon-purple/30 via-neon-purple/20 to-primary/30',
  system: 'from-slate-600/30 via-slate-500/20 to-zinc-600/30',
  world_engine: 'from-orange-600/30 via-neon-amber/20 to-neon-amber/30',
};

const categoryColors: Record<string, string> = {
  brain: 'border-neon-purple/40 shadow-neon-purple/20',
  decode: 'border-neon-cyan/40 shadow-neon-cyan/20',
  defense: 'border-neon-magenta/40 shadow-neon-magenta/20',
  nexus: 'border-neon-green/40 shadow-neon-green/20',
  vision: 'border-neon-blue/40 shadow-neon-blue/20',
  dream: 'border-neon-purple/40 shadow-neon-purple/20',
  system: 'border-slate-500/40 shadow-slate-500/20',
  world_engine: 'border-neon-amber/40 shadow-neon-amber/20',
};

interface TemplateCardProps {
  template: Template;
  onPreview: () => void;
  onBuy: () => void;
  isLoading?: boolean;
  featured?: boolean;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

export function TemplateCard({ 
  template, 
  onPreview, 
  onBuy, 
  isLoading, 
  featured,
  isLiked = false,
  onToggleLike 
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = template.icon;
  const CategoryIcon = categoryIcons[template.category] || Zap;
  const pricing = getTemplatePricing(template.difficulty, template.id);
  const gradient = categoryGradients[template.category] || categoryGradients.brain;
  const borderColor = categoryColors[template.category] || categoryColors.brain;
  const rarity = getRarityBadge(template.difficulty);
  const displayName = generateDisplayName(template.id, template.category, template.difficulty);
  const rarityConfig = getRarityByDifficulty(template.difficulty);
  const rarityImage = rarityConfig.image;

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger preview if clicking on the card background, not buttons
    onPreview();
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onBuy();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleLike?.();
  };

  const handlePreviewButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPreview();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 cursor-pointer h-full",
          "border-2 hover:shadow-2xl",
          isHovered ? borderColor : "border-border/50",
          featured && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Visual Preview Header with Rarity Image */}
        <div className={cn(
          "relative h-36 sm:h-44 overflow-hidden",
          `bg-gradient-to-br ${gradient}`
        )}>
          {/* Rarity background image with better overlay */}
          <img 
            src={rarityImage} 
            alt={`${rarity.label} tier`}
            className="absolute inset-0 w-full h-full object-cover opacity-25 transition-opacity group-hover:opacity-40"
          />
          
          {/* Animated pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/10 opacity-30" />
          
          {/* Decorative elements with animation */}
          <motion.div 
            className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/5 blur-xl"
            animate={isHovered ? { scale: 1.5, opacity: 0.8 } : { scale: 1, opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/10 blur-2xl -translate-x-1/2 translate-y-1/2" />
          
          {/* Center icon display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center",
                "bg-background/95 border-2 shadow-2xl backdrop-blur-sm",
                borderColor
              )}
              animate={isHovered ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </motion.div>
          </div>

          {/* Featured badge */}
          {featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-neon-amber to-neon-amber text-white border-0 gap-1 shadow-lg">
                <TrendingUp className="w-3 h-3" />
                Featured
              </Badge>
            </div>
          )}

          {/* Like button */}
          {onToggleLike && (
            <motion.button
              className={cn(
                "absolute top-3 right-3 p-2.5 rounded-full transition-all",
                "bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg",
                "border border-border/50",
                isLiked ? "text-neon-magenta" : "text-muted-foreground hover:text-neon-magenta"
              )}
              onClick={handleLikeClick}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            </motion.button>
          )}

          {/* Quick preview overlay on hover */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
            <Button 
              variant="secondary" 
              size="default" 
              className="gap-2 shadow-xl"
              onClick={handlePreviewButtonClick}
            >
              <Eye className="w-4 h-4" />
              Preview Template
            </Button>
          </motion.div>
        </div>

        <CardContent className="p-4 sm:p-5 space-y-3">
          {/* Rarity & Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn("text-[10px] h-6 px-2 border gap-1", rarity.bgColor, rarity.color, rarity.borderColor)}>
              <Sparkles className="w-3 h-3" />
              {rarity.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1 h-6 px-2">
              <CategoryIcon className="w-3 h-3" />
              {template.category}
            </Badge>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
              <Clock className="w-3 h-3" />
              {template.estimatedTime}
            </div>
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

          {/* Feature chips with better styling */}
          <div className="flex flex-wrap gap-1.5">
            {template.features.slice(0, 3).map((f, i) => (
              <span 
                key={i} 
                className="text-[10px] px-2 py-1 rounded-full bg-primary/5 text-primary/80 border border-primary/10 font-medium"
              >
                {f}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="text-[10px] px-2 py-1 text-primary font-semibold">
                +{template.features.length - 3} more
              </span>
            )}
          </div>

          {/* Price & Actions with enhanced styling */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div>
              <span className="text-2xl font-black text-primary">
                {formatPrice(pricing.amount)}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">one-time</span>
              </div>
            </div>
            <Button 
              size="default" 
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
              onClick={handleBuyClick}
              disabled={isLoading}
            >
              <ShoppingCart className="w-4 h-4" />
              Buy
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
