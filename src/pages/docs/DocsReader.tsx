/**
 * Public Documentation — Mobile-first, light-themed doc reader
 * Only displays public-facing documentation from docs/libraries/public/
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Book, ChevronRight, Globe, Settings, Layers, Zap, Brain, Shield, Package, Rocket, BarChart3, Eye, BookOpen, Menu, X } from 'lucide-react';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';

const publicDocs = [
  { slug: 'what-is-cmpsbl', title: 'What Is CMPSBL', icon: Globe, description: 'Plain-language overview of the platform', loader: () => import('../../../docs/libraries/public/01-what-is-cmpsbl.md?raw').then(m => m.default) },
  { slug: 'how-it-works', title: 'How It Works', icon: Settings, description: 'Architecture, primitives & execution flow', loader: () => import('../../../docs/libraries/public/02-how-it-works.md?raw').then(m => m.default) },
  { slug: 'the-40-primitives', title: 'The 40 Primitives', icon: Layers, description: 'Complete catalog of every primitive', loader: () => import('../../../docs/libraries/public/03-the-40-primitives.md?raw').then(m => m.default) },
  { slug: 'key-features', title: 'Key Features', icon: Zap, description: 'Feature catalog with descriptions', loader: () => import('../../../docs/libraries/public/04-key-features.md?raw').then(m => m.default) },
  { slug: 'memory-and-learning', title: 'Memory & Learning', icon: Brain, description: '4-tier memory, CLM & DREAM Engine', loader: () => import('../../../docs/libraries/public/05-memory-and-learning.md?raw').then(m => m.default) },
  { slug: 'security-and-trust', title: 'Security & Trust', icon: Shield, description: 'How your data is protected', loader: () => import('../../../docs/libraries/public/06-security-and-trust.md?raw').then(m => m.default) },
  { slug: 'agent-marketplace', title: 'Agent Marketplace', icon: Package, description: 'Cognitive agents, powers & pricing', loader: () => import('../../../docs/libraries/public/07-agent-marketplace.md?raw').then(m => m.default) },
  { slug: 'ascension-engine', title: 'Ascension Engine', icon: Rocket, description: 'Software evolution, discovery & export', loader: () => import('../../../docs/libraries/public/08-ascension-engine.md?raw').then(m => m.default) },
  { slug: 'plans-and-pricing', title: 'Plans & Pricing', icon: BarChart3, description: 'Tier comparison & upgrade paths', loader: () => import('../../../docs/libraries/public/09-plans-and-pricing.md?raw').then(m => m.default) },
  { slug: 'roadmap-and-vision', title: 'Roadmap & Vision', icon: Eye, description: 'Where CMPSBL is headed', loader: () => import('../../../docs/libraries/public/10-roadmap-and-vision.md?raw').then(m => m.default) },
  { slug: 'glossary', title: 'Glossary', icon: BookOpen, description: 'Terminology reference', loader: () => import('../../../docs/libraries/public/11-glossary.md?raw').then(m => m.default) },
];

export default function DocsReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('doc') || '';
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeDoc = publicDocs.find(d => d.slug === activeSlug);

  // Load content when a doc is selected
  useMemo(() => {
    const entry = publicDocs.find(d => d.slug === activeSlug);
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
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Index view — shown when no doc is selected
  if (!activeSlug || !activeDoc) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO
          title="Documentation — CMPSBL®"
          description="Comprehensive public documentation for the CMPSBL Substrate — v16.7.0 CONTACT Epoch. Learn how it works, explore the 40 primitives, and get started."
          keywords={['documentation', 'CMPSBL', 'substrate', 'primitives', 'AI operating system']}
        />
        <CmpsblNav />

        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-muted-foreground uppercase mb-3">
              <Book className="w-3.5 h-3.5" />
              v16.7.0 — CONTACT Epoch
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
              Documentation
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Everything you need to understand CMPSBL — from the high-level architecture to the 40 primitives that make the substrate work.
            </p>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {publicDocs.map((doc, i) => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.slug}
                  onClick={() => selectDoc(doc.slug)}
                  className="group text-left p-4 sm:p-5 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-primary/20 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground/60">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {doc.title}
                        </h2>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 shrink-0 mt-0.5 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <EnhancedFooter />
      </div>
    );
  }

  // Reading view — single doc with sidebar nav
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${activeDoc.title} — CMPSBL Docs`}
        description={activeDoc.description}
        keywords={['documentation', 'CMPSBL', activeDoc.title.toLowerCase()]}
      />
      <CmpsblNav />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="font-medium">{activeDoc.title}</span>
        </button>
        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">Docs</span>
      </div>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-background/80 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute top-[7rem] left-0 right-0 bottom-0 bg-background border-t border-border overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1 max-w-lg mx-auto">
              {publicDocs.map((doc, i) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={doc.slug}
                    onClick={() => selectDoc(doc.slug)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors",
                      activeSlug === doc.slug
                        ? "bg-primary/8 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium block truncate">{doc.title}</span>
                      <span className="text-xs text-muted-foreground/70 block truncate">{doc.description}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-28 lg:pt-24 pb-16">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-3 px-3">
                Public Docs
              </div>
              <nav className="space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                {publicDocs.map((doc, i) => {
                  const Icon = doc.icon;
                  return (
                    <button
                      key={doc.slug}
                      onClick={() => selectDoc(doc.slug)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all duration-150",
                        activeSlug === doc.slug
                          ? "bg-primary/8 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="mt-4 pt-3 border-t border-border px-3">
                <button
                  onClick={() => { setSearchParams({}); window.scrollTo({ top: 0 }); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Book className="w-3 h-3" />
                  Back to Index
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
              <button onClick={() => { setSearchParams({}); }} className="hover:text-primary transition-colors">Docs</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{activeDoc.title}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            ) : (
              <article className="prose prose-slate max-w-none
                prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
                prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:border-b prose-h1:border-border prose-h1:pb-4 prose-h1:mb-8
                prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-2
                prose-h3:text-base sm:prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-foreground prose-p:leading-relaxed prose-p:text-[15px]
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:text-sm
                prose-table:text-sm prose-table:overflow-x-auto
                prose-th:text-foreground prose-th:font-semibold prose-th:bg-muted/60 prose-th:px-3 prose-th:py-2.5 prose-th:border prose-th:border-border prose-th:text-xs prose-th:uppercase prose-th:tracking-wider
                prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-border prose-td:text-foreground
                prose-li:text-foreground prose-li:text-[15px]
                prose-hr:border-border
                prose-blockquote:border-primary/20 prose-blockquote:text-muted-foreground prose-blockquote:bg-primary/[0.02] prose-blockquote:rounded-r-lg prose-blockquote:py-1
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
            )}

            {/* Prev / Next navigation */}
            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4">
              {(() => {
                const idx = publicDocs.findIndex(d => d.slug === activeSlug);
                const prev = idx > 0 ? publicDocs[idx - 1] : null;
                const next = idx < publicDocs.length - 1 ? publicDocs[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button onClick={() => selectDoc(prev.slug)} className="text-left group">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 block mb-0.5">Previous</span>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{prev.title}</span>
                      </button>
                    ) : <div />}
                    {next ? (
                      <button onClick={() => selectDoc(next.slug)} className="text-right group">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 block mb-0.5">Next</span>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{next.title}</span>
                      </button>
                    ) : <div />}
                  </>
                );
              })()}
            </div>
          </main>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}