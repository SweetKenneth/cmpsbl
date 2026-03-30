/**
 * AuthorityLinkBlock — SEO authority link component
 * Renders contextual internal links + curated external links.
 * ALL internal links verified against nav menu and footer — no broken routes.
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

// ── Internal links — only verified working routes from nav & footer ──

const INTERNAL_LINKS: InternalLink[] = [
  // Priority: Home
  { label: 'CMPSBL Home', href: '/' },
  { label: 'Composable AI Platform', href: '/' },
  // Platform
  { label: 'How it Works', href: '/ai-operating-system' },
  { label: 'Architecture', href: '/architecture' },
  { label: 'Runtime', href: '/runtime' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Persistent Memory', href: '/persistent-memory' },
  // Build
  { label: 'Builder Workspace', href: '/workspace' },
  { label: 'Developers Playground', href: '/codelab' },
  { label: 'Developer Tools', href: '/devtools' },
  { label: 'Documentation', href: '/docs' },
  { label: 'API Access', href: '/api-access' },
  { label: 'Experiment Lab', href: '/lab' },
  // Marketplace
  { label: 'Store & Plans', href: '/store' },
  { label: 'Academy', href: '/academy' },
  { label: 'Showcase', href: '/showcase' },
  // Explore
  { label: 'Memory Stream', href: '/foundry' },
  { label: 'Ascension', href: '/ascension' },
  { label: 'Blog', href: '/blog' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Developers', href: '/developers' },
  { label: 'EVOLUTION Layer', href: '/evolution' },
  // Company
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Investors', href: '/investors' },
  { label: 'Careers', href: '/careers' },
  { label: 'Publication', href: '/publication' },
  { label: 'Heritage Paper', href: '/heritage-paper' },
  { label: 'Evolution Scanner', href: '/scanner' },
  { label: 'System Status', href: '/status' },
  { label: 'Support', href: '/support' },
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
  currentPath: string;
  internalLimit?: number;
  externalLimit?: number;
  title?: string;
  className?: string;
}

/**
 * Deterministic but varied link selection based on currentPath hash.
 */
function selectLinks<T extends { href?: string; label?: string }>(
  pool: T[],
  currentPath: string,
  limit: number,
  priorityPaths?: string[],
): T[] {
  let hash = 0;
  for (let i = 0; i < currentPath.length; i++) {
    hash = ((hash << 5) - hash + currentPath.charCodeAt(i)) | 0;
  }
  const seed = Math.abs(hash);

  const filtered = pool.filter(l => {
    const href = (l as any).href;
    return href !== currentPath;
  });

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
