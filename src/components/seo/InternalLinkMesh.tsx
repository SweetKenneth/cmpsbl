/**
 * Internal Link Mesh — programmatic internal linking component
 * Builds contextual internal link clusters for crawl depth + authority distribution.
 * Priority nodes (home, evolution) appear more frequently via boosted tag overlap.
 */

import { Link } from 'react-router-dom';

interface LinkNode {
  path: string;
  label: string;
  tags: string[];
  /** Higher priority = appears more often in results */
  priority?: number;
}

const LINK_GRAPH: LinkNode[] = [
  // ── Priority pages (authority magnets) ───────────────
  { path: '/', label: 'CMPSBL Home', tags: ['home', 'platform', 'ai', 'cognitive', 'substrate', 'agent', 'memory', 'evolution', 'modules', 'sdk'], priority: 3 },
  { path: '/evolution', label: 'EVOLUTION', tags: ['evolution', 'scan', 'governance', 'rollback', 'drift', 'improvement', 'agent', 'ai', 'substrate', 'defense'], priority: 3 },

  // ── Core platform ────────────────────────────────────
  { path: '/persistent-memory', label: 'Persistent Memory', tags: ['memory', 'brain', 'agent', 'sdk', 'cognitive'] },
  { path: '/architecture', label: 'Substrate Architecture', tags: ['architecture', 'agents', 'engines', 'layers', 'organs', 'substrate'] },
  { path: '/substrate', label: 'Substrate Overview', tags: ['substrate', 'platform', 'architecture', 'runtime'] },
  { path: '/os', label: 'Substrate OS', tags: ['runtime', 'orchestration', 'telemetry', 'substrate'] },
  { path: '/decode', label: 'DECODE Terminal', tags: ['decode', 'nlp', 'terminal', 'agent', 'evolution'] },
  { path: '/feed-dream-eater', label: 'Dream Eater', tags: ['dream', 'learning', 'evolution', 'memory'] },
  { path: '/runtime', label: 'Runtime', tags: ['runtime', 'orchestration', 'substrate', 'platform'] },
  { path: '/ai-operating-system', label: 'How It Works', tags: ['platform', 'architecture', 'ai', 'cognitive'] },

  // ── Products ─────────────────────────────────────────
  { path: '/composable-cognitives', label: 'Runtime Agents', tags: ['agent', 'runtime', 'ai', 'sealed'] },
  { path: '/packs', label: 'Capability Packs', tags: ['capabilities', 'store', 'templates', 'nodes'] },
  { path: '/enterprise', label: 'Enterprise', tags: ['enterprise', 'solutions', 'compliance', 'governance'] },
  { path: '/store', label: 'Store & Pricing', tags: ['pricing', 'plans', 'upgrade', 'store'] },
  { path: '/gaming', label: 'World Engine', tags: ['gaming', 'npc', 'memory', 'agent'] },

  // ── Developer surface ────────────────────────────────
  { path: '/developers', label: 'Developer Showcase', tags: ['sdk', 'api', 'developers', 'community'] },
  { path: '/developers/guide', label: 'Developer Guide', tags: ['sdk', 'api', 'setup', 'developers', 'integration'] },
  { path: '/documentation', label: 'Documentation', tags: ['docs', 'api', 'reference', 'sdk'] },
  { path: '/architecture', label: 'Architecture', tags: ['architecture', 'design', 'layers', 'substrate'] },
  { path: '/academy', label: 'Developer Academy', tags: ['academy', 'tutorials', 'learning', 'sdk'] },
  { path: '/codelab', label: 'CodeLab', tags: ['codelab', 'testing', 'sdk', 'developers'] },
  { path: '/workspace', label: 'Builder Workspace', tags: ['sdk', 'terminal', 'build', 'developers', 'workspace'] },
  { path: '/api-access', label: 'API Access', tags: ['api', 'keys', 'sdk', 'developers'] },
  { path: '/developers/guide', label: 'Developer Guide', tags: ['onboarding', 'start', 'developers', 'platform'] },

  // ── Discovery & content ──────────────────────────────
  { path: '/blog', label: 'Research Blog', tags: ['blog', 'research', 'insights', 'ai'] },
  { path: '/scanner', label: 'Evolution Scanner', tags: ['scan', 'evolution', 'drift', 'defense'] },
  { path: '/proof', label: 'Proof Mode', tags: ['proof', 'governance', 'compliance', 'evolution'] },
  { path: '/showcase', label: 'Showcase', tags: ['showcase', 'community', 'builds'] },
  { path: '/use-cases', label: 'Use Cases', tags: ['enterprise', 'solutions', 'use-cases'] },
  { path: '/roadmap', label: 'Roadmap', tags: ['roadmap', 'future', 'platform'] },
  { path: '/changelog', label: 'Changelog', tags: ['changelog', 'updates', 'platform'] },
  { path: '/status', label: 'System Status', tags: ['status', 'uptime', 'telemetry'] },
  { path: '/lab', label: 'Experimentation Lab', tags: ['lab', 'testing', 'evolution'] },
  { path: '/system-feed', label: 'System Feed', tags: ['telemetry', 'feed', 'runtime'] },

  // ── Company ──────────────────────────────────────────
  { path: '/about', label: 'About CMPSBL', tags: ['company', 'about', 'mission'] },
  { path: '/contact', label: 'Contact', tags: ['company', 'contact', 'support'] },
  { path: '/solutions', label: 'Solutions', tags: ['enterprise', 'solutions', 'compliance'] },
  { path: '/investors', label: 'Investors', tags: ['company', 'investors', 'funding'] },
];

/**
 * Find related pages by tag overlap, excluding the current page.
 * Priority nodes get a score boost so they surface more often.
 */
function findRelated(currentPath: string, tags: string[], limit = 5): LinkNode[] {
  const tagSet = new Set(tags);
  return LINK_GRAPH
    .filter(n => n.path !== currentPath)
    .map(n => ({
      ...n,
      score: n.tags.filter(t => tagSet.has(t)).length * (n.priority ?? 1),
    }))
    .filter(n => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

interface InternalLinkMeshProps {
  currentPath: string;
  tags: string[];
  title?: string;
  limit?: number;
  className?: string;
}

export function InternalLinkMesh({
  currentPath,
  tags,
  title = 'Related',
  limit = 5,
  className = '',
}: InternalLinkMeshProps) {
  const related = findRelated(currentPath, tags, limit);
  if (related.length === 0) return null;

  return (
    <nav aria-label="Related pages" className={`mt-8 pt-6 border-t border-border ${className}`}>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {related.map(node => (
          <li key={node.path}>
            <Link
              to={node.path}
              className="inline-block px-3 py-1.5 text-sm rounded-md bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {node.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
