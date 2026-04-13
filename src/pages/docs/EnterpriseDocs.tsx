/**
 * Enterprise Documentation Hub — Stripe/Tailwind-level docs experience
 * Clean /docs routing, collapsible sidebar, auto-TOC, Cmd+K search,
 * Inter + JetBrains Mono typography, copy-to-clipboard code blocks.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EnterpriseDocsMarkdown } from '@/components/docs/EnterpriseDocsMarkdown';
import { cn } from '@/lib/utils';
import {
  Book, ChevronRight, Rocket, Code, Brain, Zap, Shield,
  Terminal, Webhook, Package, Users, AlertTriangle, Bot,
  Menu, X, Flame, Search, ArrowLeft, Hash, Hammer,
} from 'lucide-react';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';

// ─── Doc Registry ───

interface DocEntry {
  slug: string;
  title: string;
  icon: typeof Rocket;
  description: string;
  category: string;
  loader: () => Promise<string>;
}

const DOC_CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'core', label: 'Core Concepts' },
  { id: 'tools', label: 'Tools & CLI' },
  { id: 'advanced', label: 'Advanced' },
];

const docs: DocEntry[] = [
  { slug: 'getting-started', title: 'Getting Started', icon: Rocket, category: 'getting-started', description: 'Account setup, API key, first call', loader: () => import('../../../docs/libraries/users/01-getting-started.md?raw').then(m => m.default) },
  { slug: 'api-reference', title: 'API Reference', icon: Code, category: 'core', description: 'Endpoints, request/response, error codes', loader: () => import('../../../docs/libraries/users/02-api-reference.md?raw').then(m => m.default) },
  { slug: 'primitives-guide', title: 'Primitives Guide', icon: Brain, category: 'core', description: 'What each primitive does and when to use it', loader: () => import('../../../docs/libraries/users/03-primitives-guide.md?raw').then(m => m.default) },
  { slug: 'memory-and-learning', title: 'Memory & Learning', icon: Brain, category: 'core', description: '4-tier memory, CLM Engine, DREAM synthesis', loader: () => import('../../../docs/libraries/users/04-memory-and-learning.md?raw').then(m => m.default) },
  { slug: 'rate-limits', title: 'Rate Limits & Quotas', icon: Shield, category: 'core', description: 'Tier limits, enforcement, best practices', loader: () => import('../../../docs/libraries/users/05-rate-limits.md?raw').then(m => m.default) },
  { slug: 'webhooks-events', title: 'Webhooks & Events', icon: Webhook, category: 'core', description: 'Async events, payload format, verification', loader: () => import('../../../docs/libraries/users/06-webhooks-events.md?raw').then(m => m.default) },
  { slug: 'cli-and-sdk', title: 'CLI & SDK', icon: Terminal, category: 'tools', description: 'Terminal commands, packages, NPM ecosystem', loader: () => import('../../../docs/libraries/users/07-cli-and-sdk.md?raw').then(m => m.default) },
  { slug: 'ascension', title: 'Ascension Integration', icon: Zap, category: 'tools', description: 'Upload, discovery, export workflow', loader: () => import('../../../docs/libraries/users/08-ascension-integration.md?raw').then(m => m.default) },
  { slug: 'agency-framework', title: 'Agency Framework', icon: Users, category: 'advanced', description: 'Multi-agent coordination & task management', loader: () => import('../../../docs/libraries/users/09-agency-framework.md?raw').then(m => m.default) },
  { slug: 'signal-forge', title: 'Signal Forge & Loadouts', icon: Flame, category: 'tools', description: 'Pre-built projects, ready to customize', loader: () => import('../../../docs/libraries/users/09-signal-forge-loadouts.md?raw').then(m => m.default) },
  { slug: 'troubleshooting', title: 'Troubleshooting', icon: AlertTriangle, category: 'advanced', description: 'Common errors, debugging, support', loader: () => import('../../../docs/libraries/users/10-troubleshooting.md?raw').then(m => m.default) },
  { slug: 'agent-installation', title: 'Agent Installation', icon: Bot, category: 'advanced', description: 'Install exported agents on any stack', loader: () => import('../../../docs/libraries/users/11-agent-installation.md?raw').then(m => m.default) },
  { slug: 'agent-forge', title: 'Agent Forge', icon: Hammer, category: 'advanced', description: 'Custom named agents, tier-gated slots, CLI activation', loader: () => import('../../../docs/libraries/users/12-agent-forge.md?raw').then(m => m.default) },
];

// ─── Search ───

function useDocSearch(query: string) {
  return useMemo(() => {
    if (!query.trim()) return docs;
    const q = query.toLowerCase();
    return docs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.slug.includes(q)
    );
  }, [query]);
}

// ─── TOC ───

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

function TableOfContents({ headings, activeId }: { headings: TocHeading[]; activeId: string }) {
  if (headings.length < 2) return null;
  const filtered = headings.filter(h => h.level <= 3);

  return (
    <nav className="space-y-0.5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-3 px-2">
        On This Page
      </div>
      {filtered.map(h => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={cn(
            'block text-[13px] leading-snug py-1.5 px-2 rounded-md transition-colors',
            h.level === 3 && 'pl-5',
            activeId === h.id
              ? 'text-primary font-medium bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}

// ─── Index View ───

function DocsIndex() {
  const [search, setSearch] = useState('');
  const results = useDocSearch(search);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Developer Docs — CMPSBL®"
        description="CMPSBL developer documentation: API reference, CLI guides, primitives, memory tiers, webhooks, Ascension workflow, and troubleshooting."
        keywords={['developer docs', 'CMPSBL', 'API reference', 'CLI', 'SDK', 'primitives guide']}
      />
      <CmpsblNav />

      <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-muted-foreground/60 uppercase mb-4">
            <Book className="w-3.5 h-3.5" />
            Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Developer Docs
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Everything you need to build on the CMPSBL® substrate — from first API call to full Ascension workflow.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search documentation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-20 py-3.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md border border-border bg-muted/50 text-[10px] font-mono text-muted-foreground/60">
            ⌘K
          </kbd>
        </div>

        {/* Category groups */}
        {DOC_CATEGORIES.map(cat => {
          const catDocs = results.filter(d => d.category === cat.id);
          if (catDocs.length === 0) return null;
          return (
            <div key={cat.id} className="mb-8">
              <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">
                {cat.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {catDocs.map(doc => {
                  const Icon = doc.icon;
                  return (
                    <Link
                      key={doc.slug}
                      to={`/docs/${doc.slug}`}
                      className="group flex items-start gap-3.5 p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/5 hover:border-primary/25 transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/[0.07] flex items-center justify-center shrink-0 group-hover:bg-primary/[0.12] transition-colors">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-0.5">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {doc.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 shrink-0 mt-0.5 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm">No documents match "{search}"</p>
          </div>
        )}
      </div>

      <EnhancedFooter />
    </div>
  );
}

// ─── Reader View ───

function DocsReader({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeDoc = docs.find(d => d.slug === slug);
  const docIdx = docs.findIndex(d => d.slug === slug);
  const prevDoc = docIdx > 0 ? docs[docIdx - 1] : null;
  const nextDoc = docIdx < docs.length - 1 ? docs[docIdx + 1] : null;

  useEffect(() => {
    if (!activeDoc) return;
    setLoading(true);
    setHeadings([]);
    activeDoc.loader().then(md => {
      setContent(md);
      setLoading(false);
    }).catch(() => {
      setContent('# Document Not Found\n\nThe requested document could not be loaded.');
      setLoading(false);
    });
  }, [slug, activeDoc]);

  // Intersection observer for active heading tracking
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  const handleHeadings = useCallback((h: TocHeading[]) => {
    setHeadings(h);
  }, []);

  if (!activeDoc) {
    return <DocsIndex />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${activeDoc.title} — CMPSBL® Docs`}
        description={activeDoc.description}
        keywords={['CMPSBL', 'docs', activeDoc.title.toLowerCase()]}
      />
      <CmpsblNav />

      {/* Mobile top bar */}
      <div className="xl:hidden fixed top-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="font-medium truncate max-w-[200px]">{activeDoc.title}</span>
        </button>
        <Link to="/docs" className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider hover:text-primary transition-colors">
          All Docs
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="xl:hidden fixed inset-0 z-20 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <div
            className="absolute top-[7rem] left-0 w-72 bottom-0 bg-background border-r border-border overflow-y-auto p-4"
            onClick={e => e.stopPropagation()}
          >
            <SidebarNav currentSlug={slug} onSelect={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-28 xl:pt-24 pb-20">
        <div className="flex gap-0">
          {/* Desktop sidebar */}
          <aside className="hidden xl:block w-64 shrink-0 pr-6">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
              <SidebarNav currentSlug={slug} />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-8">
              <Link to="/docs" className="hover:text-primary transition-colors flex items-center gap-1">
                <Book className="w-3 h-3" />
                Docs
              </Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-foreground font-medium">{activeDoc.title}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : (
              <EnterpriseDocsMarkdown content={content} onHeadingsDetected={handleHeadings} />
            )}

            {/* Prev / Next navigation */}
            <div className="mt-16 pt-8 border-t border-border/40 grid grid-cols-2 gap-4">
              {prevDoc ? (
                <Link
                  to={`/docs/${prevDoc.slug}`}
                  className="group p-4 rounded-xl border border-border/50 hover:border-primary/25 hover:bg-accent/5 transition-all"
                >
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 block mb-1.5">Previous</span>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {prevDoc.title}
                  </span>
                </Link>
              ) : <div />}
              {nextDoc ? (
                <Link
                  to={`/docs/${nextDoc.slug}`}
                  className="group p-4 rounded-xl border border-border/50 hover:border-primary/25 hover:bg-accent/5 transition-all text-right"
                >
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 block mb-1.5">Next</span>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 justify-end">
                    {nextDoc.title}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ) : <div />}
            </div>
          </main>

          {/* Desktop TOC */}
          <aside className="hidden 2xl:block w-56 shrink-0 pl-8">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <TableOfContents headings={headings} activeId={activeHeading} />
            </div>
          </aside>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}

// ─── Sidebar Navigation ───

function SidebarNav({ currentSlug, onSelect }: { currentSlug: string; onSelect?: () => void }) {
  const navigate = useNavigate();

  return (
    <nav>
      <Link
        to="/docs"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-5 px-2"
      >
        <Book className="w-3.5 h-3.5" />
        <span className="font-medium">Documentation</span>
      </Link>

      {DOC_CATEGORIES.map(cat => {
        const catDocs = docs.filter(d => d.category === cat.id);
        if (catDocs.length === 0) return null;

        return (
          <div key={cat.id} className="mb-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-2 px-2">
              {cat.label}
            </div>
            <div className="space-y-0.5">
              {catDocs.map(doc => {
                const Icon = doc.icon;
                const isActive = currentSlug === doc.slug;
                return (
                  <Link
                    key={doc.slug}
                    to={`/docs/${doc.slug}`}
                    onClick={onSelect}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150',
                      isActive
                        ? 'bg-primary/[0.08] text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ─── Router Entry ───

export default function EnterpriseDocs() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <DocsIndex />;
  }

  return <DocsReader slug={slug} />;
}
