/**
 * Integration Badges - Top AI Lab Logos
 * Shows compatibility with major AI providers and frameworks
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// AI Provider logos (using text badges for legal compliance)
const integrations = [
  { name: 'OpenAI', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { name: 'Anthropic', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { name: 'Google AI', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { name: 'Mistral', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
  { name: 'Cohere', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { name: 'LangChain', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  { name: 'LlamaIndex', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
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
          whileHover={{ scale: 1.08, y: -2 }}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border",
            "backdrop-blur-sm cursor-default",
            "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
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
