/**
 * Academic V13 Documentation Library — Publication-grade technical docs
 * Renders the v13.5 Academic Protection Set with sidebar navigation.
 * Loads pre-built HTML documents from /docs/academic-v13/print/ and
 * renders body content inline with scoped styling.
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Book, FileText, Shield, Database, GitBranch, Globe,
  Lock, Brain, Zap, Layers, Scale, TrendingUp,
  ExternalLink, BookOpen, Printer
} from 'lucide-react';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';

interface DocEntry {
  title: string;
  tier: string;
  icon: React.ReactNode;
  file: string;
}

const docRegistry: Record<string, DocEntry> = {
  'release-index':           { title: 'Release Index',             tier: '📖 Open Access',  icon: <Book className="w-4 h-4" />,       file: '00-release-index.html' },
  'release-abstract':        { title: 'Release Abstract',          tier: '📖 Open Access',  icon: <FileText className="w-4 h-4" />,   file: '01-release-abstract.html' },
  'system-overview':         { title: 'System Overview',           tier: '📖 Open Access',  icon: <Layers className="w-4 h-4" />,     file: '02-system-overview.html' },
  'memory-stream':           { title: 'Memory Stream & Foundry',   tier: '📖 Open Access',  icon: <Brain className="w-4 h-4" />,      file: '03-memory-stream-foundry.html' },
  'pipeline-crystallization':{ title: 'Memory Crystallization',  tier: '📖 Open Access',  icon: <Zap className="w-4 h-4" />,        file: '04-pipeline-crystallization.html' },
  'universal-export':        { title: 'Universal Export',          tier: '📖 Open Access',  icon: <Globe className="w-4 h-4" />,      file: '05-universal-export.html' },
  'governance-safety':       { title: 'Governance & Safety',       tier: '📖 Open Access',  icon: <Shield className="w-4 h-4" />,     file: '06-governance-safety.html' },
  'resilience-hardening':    { title: 'Resilience / IRONCLAD',     tier: '📖 Open Access',  icon: <Shield className="w-4 h-4" />,     file: '07-resilience-hardening.html' },
  'intent-mesh':             { title: 'Intent Mesh & Orchestration', tier: '📖 Open Access', icon: <GitBranch className="w-4 h-4" />, file: '08-intent-mesh.html' },
  'domain-extension':        { title: 'Domain Extension',          tier: '📖 Open Access',  icon: <Layers className="w-4 h-4" />,     file: '09-domain-extension.html' },
  'prior-art':               { title: 'Prior Art Statement',       tier: '📖 Open Access',  icon: <Scale className="w-4 h-4" />,      file: '10-prior-art-statement.html' },
  'pipeline-economy':        { title: 'Memory Economy',          tier: '🔐 Diligence',    icon: <TrendingUp className="w-4 h-4" />, file: '11-pipeline-economy.html' },
  'engine-stacking':         { title: 'Engine Stacking',           tier: '🔐 Diligence',    icon: <Layers className="w-4 h-4" />,     file: '12-engine-stacking.html' },
  'domain-expansion':        { title: 'Domain Expansion',          tier: '🔐 Diligence',    icon: <Globe className="w-4 h-4" />,      file: '13-domain-expansion.html' },
  'governance-risk':         { title: 'Governance & Risk',         tier: '🔐 Diligence',    icon: <Shield className="w-4 h-4" />,     file: '14-governance-risk.html' },
  'moat-analysis':           { title: 'Moat Analysis',             tier: '🔐 Diligence',    icon: <Lock className="w-4 h-4" />,       file: '15-moat-analysis.html' },
  'commercialization':       { title: 'Commercialization Ladder',  tier: '🔐 Diligence',    icon: <TrendingUp className="w-4 h-4" />, file: '16-commercialization-ladder.html' },
  'sealed-mechanisms':       { title: 'Sealed Mechanisms',         tier: '⛔ Withheld',      icon: <Lock className="w-4 h-4" />,       file: '17-sealed-mechanisms.html' },
  'zenodo-metadata':         { title: 'Zenodo Metadata',           tier: '📖 Metadata',     icon: <Database className="w-4 h-4" />,   file: '18-zenodo-metadata.html' },
};

const tiers = [
  { name: '📖 Open Access / Prior Art', slugs: ['release-index', 'release-abstract', 'system-overview', 'memory-stream', 'pipeline-crystallization', 'universal-export', 'governance-safety', 'resilience-hardening', 'intent-mesh', 'domain-extension', 'prior-art'] },
  { name: '🔐 Internal / Diligence', slugs: ['pipeline-economy', 'engine-stacking', 'domain-expansion', 'governance-risk', 'moat-analysis', 'commercialization'] },
  { name: '⛔ Withheld / Sealed', slugs: ['sealed-mechanisms'] },
  { name: '📖 Metadata', slugs: ['zenodo-metadata'] },
];

/** Extract the inner content of <body>…</body> from a full HTML document */
function extractBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : html;
}

export default function AcademicV13Docs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('doc') || 'release-index';
  const [bodyHtml, setBodyHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeDoc = docRegistry[activeSlug];

  useEffect(() => {
    const entry = docRegistry[activeSlug];
    if (!entry) return;
    setLoading(true);
    fetch(`/docs/academic-v13/print/${entry.file}`)
      .then(r => r.text())
      .then(html => {
        setBodyHtml(extractBody(html));
        setLoading(false);
      })
      .catch(() => {
        setBodyHtml('<h1>Document Not Found</h1><p>The requested document could not be loaded.</p>');
        setLoading(false);
      });
  }, [activeSlug]);

  const selectDoc = (slug: string) => {
    setSearchParams({ doc: slug });
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handlePrint = () => {
    const entry = docRegistry[activeSlug];
    if (entry) {
      window.open(`/docs/academic-v13/print/${entry.file}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${activeDoc?.title || 'Academic Library'} — CMPSBL Academic Protection Set`}
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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

        {/* Mobile sidebar toggle + print */}
        <div className="flex items-center gap-3 lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            {sidebarOpen ? 'Hide' : 'Show'} Index
          </button>
        </div>

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
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{activeDoc?.title}</h2>
                <span className="text-xs font-mono text-muted-foreground">{activeDoc?.tier}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="w-3.5 h-3.5" />
                Print Version
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            ) : (
              <div
                ref={contentRef}
                className="academic-doc-content"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}
          </main>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
