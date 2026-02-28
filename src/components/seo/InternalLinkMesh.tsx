/**
 * Internal Link Mesh — programmatic internal linking component
 * Item #6: Builds contextual internal link clusters for crawl depth + authority distribution
 */

import { Link } from 'react-router-dom';

interface LinkNode {
  path: string;
  label: string;
  tags: string[];
}

const LINK_GRAPH: LinkNode[] = [
  { path: '/persistent-memory', label: 'Persistent Memory', tags: ['memory', 'brain', 'agent', 'sdk'] },
  { path: '/modules', label: 'Substrate Modules', tags: ['architecture', 'modules', 'brain', 'encode', 'decode'] },
  { path: '/os', label: 'Substrate OS', tags: ['runtime', 'orchestration', 'telemetry'] },
  { path: '/decode', label: 'DECODE Terminal', tags: ['decode', 'nlp', 'terminal', 'agent'] },
  { path: '/feed-dream-eater', label: 'Dream Feeder', tags: ['dream', 'learning', 'evolution'] },
  { path: '/gaming', label: 'Gaming AI', tags: ['gaming', 'npc', 'memory', 'agent'] },
  { path: '/store', label: 'Artifact Store', tags: ['capabilities', 'store', 'templates'] },
  { path: '/composable-cognitives', label: 'Cognitives', tags: ['agent', 'cognitive', 'ai'] },
  { path: '/lab', label: 'Experimentation Lab', tags: ['lab', 'testing', 'evolution'] },
  { path: '/proof', label: 'Proof Mode', tags: ['proof', 'governance', 'compliance'] },
  { path: '/developers', label: 'Developer Hub', tags: ['sdk', 'api', 'developers'] },
  { path: '/documentation', label: 'Documentation', tags: ['docs', 'api', 'reference'] },
  { path: '/architecture', label: 'Architecture', tags: ['architecture', 'design', 'layers'] },
  { path: '/solutions', label: 'Enterprise Solutions', tags: ['enterprise', 'solutions', 'compliance'] },
  { path: '/blog', label: 'Research Blog', tags: ['blog', 'research', 'insights'] },
  { path: '/system-feed', label: 'System Feed', tags: ['telemetry', 'feed', 'runtime'] },
  { path: '/insights', label: 'Insights', tags: ['analytics', 'insights', 'intelligence'] },
  { path: '/engines', label: 'Orchestration Engines', tags: ['engines', 'orchestration', 'runtime'] },
  { path: '/academy', label: 'Developer Academy', tags: ['academy', 'tutorials', 'learning'] },
];

/**
 * Find related pages by tag overlap, excluding the current page.
 */
function findRelated(currentPath: string, tags: string[], limit = 5): LinkNode[] {
  const tagSet = new Set(tags);
  return LINK_GRAPH
    .filter(n => n.path !== currentPath)
    .map(n => ({
      ...n,
      score: n.tags.filter(t => tagSet.has(t)).length,
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
