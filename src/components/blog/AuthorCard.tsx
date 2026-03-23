/**
 * AuthorCard — E-E-A-T Author Attribution Component
 * Renders Person JSON-LD schema + visible author bio for search authority
 */

import { Helmet } from 'react-helmet-async';
import { Shield, ExternalLink } from 'lucide-react';

interface AuthorCardProps {
  name?: string;
  role?: string;
  reviewedBy?: string | null;
  reviewStatus?: string;
  reviewedAt?: string | null;
  experienceTags?: string[];
  /** Placement: 'top' renders compact inline, 'bottom' renders full bio */
  placement?: 'top' | 'bottom';
}

const DEFAULT_AUTHOR = {
  name: 'CMPSBL Research Team',
  role: 'AI Systems Architecture',
  url: 'https://cmpsbl.com/about',
  description: 'The CMPSBL Research Team designs and maintains the cognitive orchestration substrate — a 40-primitive AI operating system composed of agents, engines, layers, and organs with 675+ capabilities, powering persistent memory, multi-provider routing, and autonomous self-improvement for enterprise AI applications.',
  expertise: ['AI Operating Systems', 'Cognitive Infrastructure', 'Multi-Agent Orchestration', 'Enterprise AI Security'],
};

export function AuthorCard({
  name = DEFAULT_AUTHOR.name,
  role = DEFAULT_AUTHOR.role,
  reviewedBy,
  reviewStatus = 'pending',
  reviewedAt,
  experienceTags = DEFAULT_AUTHOR.expertise,
  placement = 'bottom',
}: AuthorCardProps) {

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: role,
    url: DEFAULT_AUTHOR.url,
    description: DEFAULT_AUTHOR.description,
    worksFor: {
      '@type': 'Organization',
      name: 'CMPSBL',
      url: 'https://cmpsbl.com',
    },
    knowsAbout: experienceTags,
  };

  const isReviewed = reviewStatus === 'reviewed' && reviewedBy;

  if (placement === 'top') {
    return (
      <>
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(personJsonLd)}</script>
        </Helmet>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{name}</span>
            <span className="text-xs">{role}</span>
          </div>
          {isReviewed && (
            <div className="flex items-center gap-1 ml-auto px-2 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs">
              <Shield className="w-3 h-3" />
              Reviewed
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(personJsonLd)}</script>
      </Helmet>
      <div className="p-6 rounded-xl bg-card/50 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{name}</h4>
              {isReviewed && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs">
                  <Shield className="w-3 h-3" />
                  Expert Reviewed
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{role}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {DEFAULT_AUTHOR.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {experienceTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            {isReviewed && reviewedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Reviewed by <span className="text-foreground font-medium">{reviewedBy}</span> on{' '}
                {new Date(reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <a
              href="/about"
              className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
            >
              Meet the team <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
