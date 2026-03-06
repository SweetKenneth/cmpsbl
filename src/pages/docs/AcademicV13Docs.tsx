/**
 * Academic V13 Documentation Library — Publication-grade technical docs
 * Renders the v13.5 Academic Protection Set with sidebar navigation
 * using the existing light-theme documentation styling.
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Book, FileText, Shield, Database, GitBranch, Globe,
  Lock, Brain, Zap, Layers, Scale, TrendingUp,
  ChevronRight, ExternalLink, BookOpen, Eye
} from 'lucide-react';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';

const docRegistry: Record<string, { title: string; tier: string; icon: React.ReactNode; loader: () => Promise<string> }> = {
  'release-index': { title: 'Release Index', tier: '📖 Open Access', icon: <Book className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/00-release-index.md?raw').then(m => m.default) },
  'release-abstract': { title: 'Release Abstract', tier: '📖 Open Access', icon: <FileText className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/01-release-abstract.md?raw').then(m => m.default) },
  'system-overview': { title: 'System Overview', tier: '📖 Open Access', icon: <Layers className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/02-system-overview.md?raw').then(m => m.default) },
  'memory-stream': { title: 'Memory Stream & Foundry', tier: '📖 Open Access', icon: <Brain className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/03-memory-stream-foundry.md?raw').then(m => m.default) },
  'pipeline-crystallization': { title: 'Pipeline Crystallization', tier: '📖 Open Access', icon: <Zap className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/04-pipeline-crystallization.md?raw').then(m => m.default) },
  'universal-export': { title: 'Universal Export', tier: '📖 Open Access', icon: <Globe className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/05-universal-export.md?raw').then(m => m.default) },
  'governance-safety': { title: 'Governance & Safety', tier: '📖 Open Access', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/06-governance-safety.md?raw').then(m => m.default) },
  'resilience-hardening': { title: 'Resilience / IRONCLAD', tier: '📖 Open Access', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/07-resilience-hardening.md?raw').then(m => m.default) },
  'intent-mesh': { title: 'Intent Mesh & Orchestration', tier: '📖 Open Access', icon: <GitBranch className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/08-intent-mesh.md?raw').then(m => m.default) },
  'domain-extension': { title: 'Domain Extension', tier: '📖 Open Access', icon: <Layers className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/09-domain-extension.md?raw').then(m => m.default) },
  'prior-art': { title: 'Prior Art Statement', tier: '📖 Open Access', icon: <Scale className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/10-prior-art-statement.md?raw').then(m => m.default) },
  'pipeline-economy': { title: 'Pipeline Economy', tier: '🔐 Diligence', icon: <TrendingUp className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/11-pipeline-economy.md?raw').then(m => m.default) },
  'engine-stacking': { title: 'Engine Stacking', tier: '🔐 Diligence', icon: <Layers className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/12-engine-stacking.md?raw').then(m => m.default) },
  'domain-expansion': { title: 'Domain Expansion', tier: '🔐 Diligence', icon: <Globe className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/13-domain-expansion.md?raw').then(m => m.default) },
  'governance-risk': { title: 'Governance & Risk', tier: '🔐 Diligence', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/14-governance-risk.md?raw').then(m => m.default) },
  'moat-analysis': { title: 'Moat Analysis', tier: '🔐 Diligence', icon: <Lock className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/15-moat-analysis.md?raw').then(m => m.default) },
  'commercialization': { title: 'Commercialization Ladder', tier: '🔐 Diligence', icon: <TrendingUp className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/16-commercialization-ladder.md?raw').then(m => m.default) },
  'sealed-mechanisms': { title: 'Sealed Mechanisms', tier: '⛔ Withheld', icon: <Lock className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/17-sealed-mechanisms.md?raw').then(m => m.default) },
  'zenodo-metadata': { title: 'Zenodo Metadata', tier: '📖 Metadata', icon: <Database className="w-4 h-4" />, loader: () => import('../../../docs/academic-v13/18-zenodo-metadata.md?raw').then(m => m.default) },
};

const tiers = [
  { name: '📖 Open Access / Prior Art', slugs: ['release-index', 'release-abstract', 'system-overview', 'memory-stream', 'pipeline-crystallization', 'universal-export', 'governance-safety', 'resilience-hardening', 'intent-mesh', 'domain-extension', 'prior-art'] },
  { name: '🔐 Internal / Diligence', slugs: ['pipeline-economy', 'engine-stacking', 'domain-expansion', 'governance-risk', 'moat-analysis', 'commercialization'] },
  { name: '⛔ Withheld / Sealed', slugs: ['sealed-mechanisms'] },
  { name: '📖 Metadata', slugs: ['zenodo-metadata'] },
];

export default function AcademicV13Docs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('doc') || 'release-index';
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeDoc = docRegistry[activeSlug];

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
      <SEO
        title={`${activeDoc?.title || 'Academic Library'} — CMPSBL v13.5 Academic Protection Set`}
        description="Publication-grade technical documentation for the CMPSBL Substrate OS. Defensive publication, prior-art establishment, and Zenodo-ready academic archive."
        keywords={['CMPSBL', 'substrate', 'cognitive architecture', 'prior art', 'defensive publication', 'academic', 'Zenodo']}
      />
      <CmpsblNav />

      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
            <span>v13.5</span>
            <span>·</span>
            <span>IRONCLAD Epoch</span>
            <span>·</span>
            <span>Academic Protection Set</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">CMPSBL® Academic Library</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://doi.org/10.5281/zenodo.18234909"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              DOI: 10.5281/zenodo.18234909
            </a>
            <span>·</span>
            <a
              href="https://orcid.org/0009-0001-4237-1243"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              Kenneth E. Sweet Jr.
            </a>
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          {sidebarOpen ? 'Hide' : 'Show'} Document Index
        </button>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={cn(
            "w-64 shrink-0 lg:block",
            sidebarOpen ? "block" : "hidden"
          )}>
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-12rem)]">
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
