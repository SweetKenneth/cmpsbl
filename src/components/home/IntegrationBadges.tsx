/**
 * Integration Badges - Top AI Lab Logos
 * Shows compatibility with major AI providers and frameworks
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// AI Provider logos (using text badges for legal compliance)
const integrations = [
  { name: 'OpenAI', color: 'bg-[hsl(var(--neon-cyan))]/10 text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan))]/20' },
  { name: 'Anthropic', color: 'bg-primary/10 text-primary border-primary/20' },
  { name: 'Google AI', color: 'bg-[hsl(var(--neon-purple))]/10 text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple))]/20' },
  { name: 'Mistral', color: 'bg-[hsl(var(--neon-magenta))]/10 text-[hsl(var(--neon-magenta))] border-[hsl(var(--neon-magenta))]/20' },
  { name: 'Cohere', color: 'bg-[hsl(var(--neon-cyan))]/10 text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan))]/20' },
  { name: 'LangChain', color: 'bg-primary/10 text-primary border-primary/20' },
  { name: 'LlamaIndex', color: 'bg-[hsl(var(--neon-purple))]/10 text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple))]/20' },
  { name: 'Vercel AI', color: 'bg-foreground/10 text-foreground border-foreground/20' },
];

export function IntegrationBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-2", className)}>
      {integrations.map((integration, index) => (
        <motion.div
          key={integration.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.08, y: -3 }}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold border",
            "backdrop-blur-sm cursor-default",
            "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
            "shimmer-on-hover",
            integration.color
          )}
        >
          {integration.name}
        </motion.div>
      ))}
    </div>
  );
}

export function IntegrationBadgesCompact({ className }: { className?: string }) {
  const topFour = integrations.slice(0, 4);
  const remaining = integrations.length - 4;
  
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}>
      <span className="text-xs text-muted-foreground mr-1">Works with:</span>
      {topFour.map((integration, index) => (
        <motion.span
          key={integration.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.05 }}
          className={cn(
            "px-2 py-0.5 rounded text-[10px] font-medium border",
            integration.color
          )}
        >
          {integration.name}
        </motion.span>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground">+{remaining} more</span>
      )}
    </div>
  );
}
