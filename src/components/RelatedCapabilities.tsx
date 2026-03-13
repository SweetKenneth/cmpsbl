/**
 * RelatedCapabilities — Contextual cross-link cards for page bottoms
 * Shows 3-4 related pages based on current route to eliminate dead ends.
 */

import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCrossLinks } from "@/lib/cross-links";
import { cn } from "@/lib/utils";

interface RelatedCapabilitiesProps {
  /** Override the auto-detected path */
  path?: string;
  className?: string;
}

export function RelatedCapabilities({ path, className }: RelatedCapabilitiesProps) {
  const location = useLocation();
  const currentPath = path || location.pathname;
  const links = getCrossLinks(currentPath);

  if (!links.length) return null;

  return (
    <section className={cn("py-12 sm:py-16 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.25em] mb-2">
            Continue Exploring
          </p>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
            Related Capabilities
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {links.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group relative p-4 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300 card-lift"
            >
              {link.badge && (
                <Badge
                  variant="outline"
                  className="absolute top-3 right-3 text-[9px] px-1.5 py-0 border-primary/20 text-primary/70"
                >
                  {link.badge}
                </Badge>
              )}
              <h4 className="text-sm font-bold text-foreground mb-1.5 pr-12 group-hover:text-primary transition-colors">
                {link.title}
              </h4>
              <p className="text-[11px] leading-relaxed text-muted-foreground mb-3">
                {link.description}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary/60 group-hover:text-primary transition-colors">
                Explore <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
