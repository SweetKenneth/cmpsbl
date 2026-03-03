/**
 * ExperienceMarkers — E-E-A-T Experience Signal Component
 * Injects first-person expertise context and internal cross-links
 */

import { Link } from 'react-router-dom';
import { Brain, Layers, Shield, Zap, BookOpen } from 'lucide-react';

interface ExperienceMarkersProps {
  category: string;
}

const CATEGORY_LINKS: Record<string, { icon: React.ElementType; label: string; href: string; description: string }[]> = {
  insight: [
    { icon: Brain, label: 'Persistent Memory', href: '/persistent-memory', description: 'Built from our production memory architecture' },
    { icon: Layers, label: 'Module Architecture', href: '/modules', description: 'Explore the 38-node substrate' },
  ],
  research: [
    { icon: Brain, label: 'SEBA Architecture', href: '/modules/seba', description: 'Our self-evolving bounded agent framework' },
    { icon: BookOpen, label: 'Developer Academy', href: '/academy', description: 'Learn the patterns behind this research' },
  ],
  changelog: [
    { icon: Zap, label: 'Explore', href: '/explore', description: 'Browse templates and artifacts' },
    { icon: Layers, label: 'Modules', href: '/modules', description: 'Full substrate architecture' },
  ],
  release: [
    { icon: Layers, label: 'All Modules', href: '/modules', description: 'See the full substrate architecture' },
    { icon: Shield, label: 'Enterprise Solutions', href: '/solutions', description: 'How enterprises deploy these releases' },
  ],
  update: [
    { icon: Brain, label: 'AI Operating System', href: '/ai-operating-system', description: 'What makes CMPSBL an AI OS' },
    { icon: Zap, label: 'Use Cases', href: '/use-cases', description: 'Real-world applications of these updates' },
  ],
};

const DEFAULT_LINKS = [
  { icon: Brain, label: 'AI Operating System', href: '/ai-operating-system', description: 'The definitive guide to cognitive infrastructure' },
  { icon: Layers, label: 'Platform Overview', href: '/modules', description: 'Explore the 38-node substrate' },
];

export function ExperienceMarkers({ category }: ExperienceMarkersProps) {
  const links = CATEGORY_LINKS[category] || DEFAULT_LINKS;

  return (
    <div className="my-12 p-6 rounded-xl bg-muted/30 border border-border/50">
      <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        From Our Engineering Experience
      </h4>
      <p className="text-xs text-muted-foreground mb-4">
        These insights come directly from building and operating the CMPSBL Substrate in production environments.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {links.map(({ icon: Icon, label, href, description }) => (
          <Link
            key={href}
            to={href}
            className="group flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {label}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
