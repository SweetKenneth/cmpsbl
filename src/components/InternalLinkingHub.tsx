import { Link } from "react-router-dom";
import { Shield, BookOpen, Zap, Target, Brain, Eye, Layers, Code } from "lucide-react";

interface InternalLinkProps {
  className?: string;
  variant?: "compact" | "full";
  context?: "security" | "ai" | "accessibility" | "general";
}

/**
 * Internal Linking Hub Component
 * Strategic internal linking for topical authority and PageRank distribution.
 * Context-aware: renders relevant links based on page topic.
 */

const LINK_SETS = {
  security: [
    { href: "/projects", icon: Shield, label: "DEFENSE WordPress Plugin", description: "AI-powered bot protection for WordPress", priority: "high" as const },
    { href: "/blog/wordpress-bot-defense", icon: BookOpen, label: "Bot Defense Guide", description: "Complete WordPress security guide", priority: "high" as const },
    { href: "/blog/top-security-plugins-2025", icon: Target, label: "Plugin Comparison", description: "Compare top security plugins", priority: "medium" as const },
    { href: "/blog/ai-cybersecurity-evolution", icon: Shield, label: "AI Cybersecurity Evolution", description: "How AI is reshaping threat detection", priority: "medium" as const },
  ],
  ai: [
    { href: "/substrate", icon: Layers, label: "Platform Architecture", description: "Composable AI infrastructure", priority: "high" as const },
    { href: "/blog/why-agents-forget", icon: Brain, label: "Why Agents Forget", description: "Episodic memory for stateful AI", priority: "high" as const },
    { href: "/foundry", icon: Brain, label: "Memory Stream", description: "Autonomous software discovery", priority: "high" as const },
    { href: "/ascension", icon: Zap, label: "Ascension", description: "Zero-LLM code transformation", priority: "high" as const },
  ],
  accessibility: [
    { href: "/blog/accessibility-free-for-all", icon: Eye, label: "Free Accessibility Tools", description: "WCAG scanning at zero cost", priority: "high" as const },
    { href: "/blog/wordpress-accessibility-guide", icon: BookOpen, label: "WordPress A11y Guide", description: "Full WCAG compliance walkthrough", priority: "high" as const },
    { href: "/blog/wcag-2-2-changes", icon: Target, label: "WCAG 2.2 Changes", description: "What's new in accessibility standards", priority: "medium" as const },
    { href: "/solutions", icon: Zap, label: "All Solutions", description: "Explore the CMPSBL ecosystem", priority: "medium" as const },
  ],
  general: [
    { href: "/projects", icon: Shield, label: "DEFENSE WordPress Plugin", description: "AI-powered bot protection for WordPress", priority: "high" as const },
    { href: "/substrate", icon: Layers, label: "Substrate Architecture", description: "Composable cognitive infrastructure", priority: "high" as const },
    { href: "/foundry", icon: Brain, label: "Memory Stream", description: "Autonomous software discovery", priority: "high" as const },
    { href: "/ascension", icon: Zap, label: "Ascension", description: "Zero-LLM code transformation", priority: "medium" as const },
  ],
};

export function InternalLinkingHub({ className = "", variant = "compact", context = "general" }: InternalLinkProps) {
  const primaryLinks = LINK_SETS[context];

  if (variant === "compact") {
    return (
      <nav className={`flex flex-wrap gap-3 ${className}`} aria-label="Related pages">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              link.priority === "high"
                ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                : "glass hover:border-primary/30 text-muted-foreground hover:text-primary"
            }`}
          >
            <link.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <section className={`grid md:grid-cols-2 gap-4 ${className}`}>
      {primaryLinks.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className={`group p-6 rounded-xl transition-all duration-300 ${
            link.priority === "high"
              ? "bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/40 hover:shadow-glow"
              : "glass hover:border-primary/30"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              link.priority === "high" 
                ? "bg-primary/20 text-primary" 
                : "bg-muted text-muted-foreground"
            } group-hover:scale-110 transition-transform`}>
              <link.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {link.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
