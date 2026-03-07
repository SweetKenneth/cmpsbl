/**
 * AuthorityLinkBlock — SEO authority link component
 * Renders contextual internal links + curated external links
 * to push PageRank toward priority pages (home & evolution).
 * Drop into any page's footer area for topical authority.
 */

import { Link } from 'react-router-dom';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

interface InternalLink {
  label: string;
  href: string;
}

interface ExtLink {
  label: string;
  href: string;
  rel?: string;
}

// ── Internal links (40 unique) — weighted toward / and /evolution ──

const INTERNAL_LINKS: InternalLink[] = [
  // Priority: Home
  { label: 'CMPSBL Home', href: '/' },
  { label: 'Composable AI Platform', href: '/' },
  // Priority: Evolution
  { label: 'EVOLUTION', href: '/evolution' },
  { label: 'Evolution Control Center', href: '/evolution' },
  { label: 'Self-Improving Systems', href: '/evolution' },
  // Core platform
  { label: 'Substrate Overview', href: '/substrate' },
  { label: 'AI Operating System', href: '/ai-operating-system' },
  { label: 'Runtime Environment', href: '/runtime' },
  { label: 'Architecture', href: '/architecture' },
  { label: 'All Nodes', href: '/modules' },
  { label: 'DECODE Terminal', href: '/decode' },
  { label: 'Proof Mode', href: '/proof' },
  // Products
  { label: 'Persistent Memory', href: '/persistent-memory' },
  { label: 'Artifact Packs', href: '/packs' },
  { label: 'Composable Agents', href: '/composable-cognitives' },
  { label: 'Dream Eater', href: '/feed-dream-eater' },
  { label: 'World Engine', href: '/gaming' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Upgrade & Pricing', href: '/upgrade' },
  // Developer
  { label: 'Start Here', href: '/start-here' },
  { label: 'Documentation', href: '/documentation' },
  { label: 'Developer Guide', href: '/developers/guide' },
  { label: 'Developer Showcase', href: '/developers' },
  { label: 'Academy', href: '/academy' },
  { label: 'CodeLab', href: '/codelab' },
  { label: 'API Access', href: '/api-access' },
  { label: 'DevTools', href: '/devtools' },
  // Discovery
  { label: 'Evolution Scanner', href: '/scanner' },
  { label: 'Research Blog', href: '/blog' },
  { label: 'Showcase', href: '/showcase' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'System Status', href: '/status' },
  { label: 'Experimentation Lab', href: '/lab' },
  // Company
  { label: 'About CMPSBL', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Investors', href: '/investors' },
  { label: 'Capability Map', href: '/capability-map' },
  { label: 'Foundations', href: '/foundations' },
];

// ── External links (10) — topical authority signals ──

const EXTERNAL_LINKS: ExtLink[] = [
  { label: 'OpenAI Platform', href: 'https://platform.openai.com', rel: 'noopener noreferrer' },
  { label: 'Anthropic Research', href: 'https://www.anthropic.com/research', rel: 'noopener noreferrer' },
  { label: 'Google DeepMind', href: 'https://deepmind.google', rel: 'noopener noreferrer' },
  { label: 'Hugging Face', href: 'https://huggingface.co', rel: 'noopener noreferrer' },
  { label: 'LangChain Docs', href: 'https://docs.langchain.com', rel: 'noopener noreferrer' },
  { label: 'OWASP AI Security', href: 'https://owasp.org/www-project-ai-security-and-privacy-guide/', rel: 'noopener noreferrer' },
  { label: 'NIST AI Framework', href: 'https://www.nist.gov/artificial-intelligence', rel: 'noopener noreferrer' },
  { label: 'arXiv AI Papers', href: 'https://arxiv.org/list/cs.AI/recent', rel: 'noopener noreferrer' },
  { label: 'W3C Web Standards', href: 'https://www.w3.org/standards/', rel: 'noopener noreferrer' },
  { label: 'AI Alliance', href: 'https://thealliance.ai', rel: 'noopener noreferrer' },
];

interface AuthorityLinkBlockProps {
  /** Current page path — links to this path are excluded */
  currentPath: string;
  /** Max internal links to show (default 8) */
  internalLimit?: number;
  /** Max external links to show (default 4) */
  externalLimit?: number;
  /** Section title */
  title?: string;
  className?: string;
}

/**
 * Deterministic but varied link selection based on currentPath hash.
 * Always includes at least one home link and one evolution link.
 */
function selectLinks<T extends { href?: string; label?: string }>(
  pool: T[],
  currentPath: string,
  limit: number,
  priorityPaths?: string[],
): T[] {
  // Simple hash from path string
  let hash = 0;
  for (let i = 0; i < currentPath.length; i++) {
    hash = ((hash << 5) - hash + currentPath.charCodeAt(i)) | 0;
  }
  const seed = Math.abs(hash);

  const filtered = pool.filter(l => {
    const href = (l as any).href;
    return href !== currentPath;
  });

  // Ensure priority paths are included
  const priority: T[] = [];
  const rest: T[] = [];
  for (const link of filtered) {
    const href = (link as any).href;
    if (priorityPaths?.includes(href) && priority.length < 2) {
      priority.push(link);
    } else {
      rest.push(link);
    }
  }

  // Shuffle rest deterministically
  const shuffled = [...rest].sort((a, b) => {
    const ha = (a as any).label?.charCodeAt(0) ?? 0;
    const hb = (b as any).label?.charCodeAt(0) ?? 0;
    return ((ha * 31 + seed) % 97) - ((hb * 31 + seed) % 97);
  });

  return [...priority, ...shuffled].slice(0, limit);
}

export function AuthorityLinkBlock({
  currentPath,
  internalLimit = 8,
  externalLimit = 4,
  title = 'Explore More',
  className = '',
}: AuthorityLinkBlockProps) {
  const internalLinks = selectLinks(INTERNAL_LINKS, currentPath, internalLimit, ['/', '/evolution']);
  const externalLinks = selectLinks(EXTERNAL_LINKS, currentPath, externalLimit);

  return (
    <nav
      aria-label="Related resources"
      className={`py-10 sm:py-14 border-t border-border/30 ${className}`}
    >
      <div className="max-w-5xl mx-auto px-4">
        <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-6">
          {title}
        </h3>

        {/* Internal links */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
          {internalLinks.map((link) => (
            <Link
              key={link.href + link.label}
              to={link.href}
              className="inline-flex items-center px-2.5 py-1 text-[11px] sm:text-xs rounded-md bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* External links */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {externalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel={link.rel ?? 'noopener noreferrer'}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs rounded-md text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/30 transition-all duration-200"
            >
              {link.label}
              <ExternalLinkIcon className="w-2.5 h-2.5 opacity-40" />
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
