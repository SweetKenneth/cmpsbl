/**
 * Documentation Reader — OS-grade docs rendered in Light theme
 * Reads markdown files from the docs/ directory structure and renders them
 * with sidebar navigation using existing design tokens.
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, ChevronRight, FileText, Shield, Database, GitBranch, Eye, Server, TestTube, Globe, Code, Scale, Heart, LifeBuoy, BookOpen } from 'lucide-react';
import CmpsblNav from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import SEO from '@/components/SEO';

// Document registry — maps slugs to raw markdown imports
const docRegistry: Record<string, { title: string; tier: string; icon: React.ReactNode; loader: () => Promise<string> }> = {
  'style-guide': { title: 'Style Guide', tier: 'Index', icon: <BookOpen className="w-4 h-4" />, loader: () => import('../../../docs/00-index/style-guide.md?raw').then(m => m.default) },
  'glossary': { title: 'Glossary', tier: 'Index', icon: <Book className="w-4 h-4" />, loader: () => import('../../../docs/00-index/glossary.md?raw').then(m => m.default) },
  'navigation': { title: 'Navigation', tier: 'Index', icon: <ChevronRight className="w-4 h-4" />, loader: () => import('../../../docs/00-index/navigation.md?raw').then(m => m.default) },
  'master-architecture-spec': { title: 'Master Architecture Specification', tier: 'Tier 1 — Canonical Core', icon: <FileText className="w-4 h-4" />, loader: () => import('../../../docs/01-architecture/master-architecture-spec.md?raw').then(m => m.default) },
  'governance-autonomy-doctrine': { title: 'Governance & Autonomy Doctrine', tier: 'Tier 1 — Canonical Core', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/02-governance/governance-autonomy-doctrine.md?raw').then(m => m.default) },
  'security-architecture': { title: 'Security Architecture', tier: 'Tier 1 — Canonical Core', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/03-security/security-architecture.md?raw').then(m => m.default) },
  'data-and-memory-model': { title: 'Data & Memory Model', tier: 'Tier 1 — Canonical Core', icon: <Database className="w-4 h-4" />, loader: () => import('../../../docs/04-data-memory/data-and-memory-model.md?raw').then(m => m.default) },
  'evolution-and-versioning-framework': { title: 'Evolution & Versioning Framework', tier: 'Tier 1 — Canonical Core', icon: <GitBranch className="w-4 h-4" />, loader: () => import('../../../docs/05-evolution-versioning/evolution-and-versioning-framework.md?raw').then(m => m.default) },
  'observability-telemetry-handbook': { title: 'Observability & Telemetry Handbook', tier: 'Tier 2 — Operations', icon: <Eye className="w-4 h-4" />, loader: () => import('../../../docs/06-observability/observability-telemetry-handbook.md?raw').then(m => m.default) },
  'deployment-infrastructure-manual': { title: 'Deployment & Infrastructure Manual', tier: 'Tier 2 — Operations', icon: <Server className="w-4 h-4" />, loader: () => import('../../../docs/07-deployment/deployment-infrastructure-manual.md?raw').then(m => m.default) },
  'testing-validation-matrix': { title: 'Testing & Validation Matrix', tier: 'Tier 2 — Operations', icon: <TestTube className="w-4 h-4" />, loader: () => import('../../../docs/08-testing/testing-validation-matrix.md?raw').then(m => m.default) },
  'public-whitepaper': { title: 'Public Whitepaper', tier: 'Tier 3 — Strategic', icon: <Globe className="w-4 h-4" />, loader: () => import('../../../docs/09-whitepaper/public-whitepaper.md?raw').then(m => m.default) },
  'api-integration-specification': { title: 'API & Integration Specification', tier: 'Tier 3 — Strategic', icon: <Code className="w-4 h-4" />, loader: () => import('../../../docs/10-api/api-integration-specification.md?raw').then(m => m.default) },
  'licensing-commercial-model': { title: 'Licensing & Commercial Model', tier: 'Tier 3 — Strategic', icon: <Scale className="w-4 h-4" />, loader: () => import('../../../docs/11-licensing/licensing-commercial-model.md?raw').then(m => m.default) },
  'founder-intent': { title: 'Founder Intent', tier: 'Tier 4 — Founder Safeguards', icon: <Heart className="w-4 h-4" />, loader: () => import('../../../docs/12-founder/founder-intent.md?raw').then(m => m.default) },
  'survivability-succession-protocol': { title: 'Survivability & Succession Protocol', tier: 'Tier 4 — Founder Safeguards', icon: <LifeBuoy className="w-4 h-4" />, loader: () => import('../../../docs/13-survivability/survivability-succession-protocol.md?raw').then(m => m.default) },
};

// Group docs by tier for sidebar
const tiers = [
  { name: 'Index', slugs: ['style-guide', 'glossary', 'navigation'] },
  { name: 'Tier 1 — Canonical Core', slugs: ['master-architecture-spec', 'governance-autonomy-doctrine', 'security-architecture', 'data-and-memory-model', 'evolution-and-versioning-framework'] },
  { name: 'Tier 2 — Operations', slugs: ['observability-telemetry-handbook', 'deployment-infrastructure-manual', 'testing-validation-matrix'] },
  { name: 'Tier 3 — Strategic', slugs: ['public-whitepaper', 'api-integration-specification', 'licensing-commercial-model'] },
  { name: 'Tier 4 — Founder Safeguards', slugs: ['founder-intent', 'survivability-succession-protocol'] },
];

export default function DocsReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('doc') || 'master-architecture-spec';
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeDoc = docRegistry[activeSlug];

  // Load doc content
  useMemo(() => {
    const entry = docRegistry[activeSlug];
    if (!entry) return;
    setLoading(true);
    entry.loader().then(md => {
      setContent(md);
      setLoading(false);
    }).catch(() => {
      setContent('# Document Not Found\n\nThe requested document could not be loaded.');
      setLoading(false);
    });
  }, [activeSlug]);

  const selectDoc = (slug: string) => {
    setSearchParams({ doc: slug });
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={`${activeDoc?.title || 'Documentation'} — CMPSBL Docs`} description="OS-grade documentation for the CMPSBL substrate." keywords={['documentation', 'architecture', 'substrate']} />
      <CmpsblNav />

      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-16">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Book className="w-4 h-4" />
          {sidebarOpen ? 'Hide' : 'Show'} Documentation Index
        </button>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={cn(
            "w-64 shrink-0 lg:block",
            sidebarOpen ? "block" : "hidden"
          )}>
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <nav className="space-y-6 pr-4">
                  {tiers.map(tier => (
                    <div key={tier.name}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {tier.name}
                      </h3>
                      <ul className="space-y-0.5">
                        {tier.slugs.map(slug => {
                          const doc = docRegistry[slug];
                          return (
                            <li key={slug}>
                              <button
                                onClick={() => selectDoc(slug)}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors",
                                  activeSlug === slug
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                              >
                                {doc.icon}
                                <span className="truncate">{doc.title}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            ) : (
              <article className="prose prose-slate max-w-none
                prose-headings:text-foreground prose-headings:font-semibold
                prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-3 prose-h1:mb-6
                prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-foreground prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                prose-table:text-sm
                prose-th:text-foreground prose-th:font-semibold prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:border prose-th:border-border
                prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-border prose-td:text-foreground
                prose-li:text-foreground
                prose-hr:border-border
                prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
            )}
          </main>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
