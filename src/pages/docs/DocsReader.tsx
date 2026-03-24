/**
 * Documentation Reader — OS-grade docs rendered in Light theme
 * Reads markdown files from the docs/libraries/ structure and renders them
 * with sidebar navigation using existing design tokens.
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, ChevronRight, FileText, Shield, Database, GitBranch, Eye, Globe, Code, Heart, BookOpen, Lock, Cpu, Brain, Zap, Wrench, Layers, Users, BarChart3, Settings, Rocket, Package, Scale } from 'lucide-react';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';

// Document registry — maps slugs to raw markdown imports from docs/libraries/
const docRegistry: Record<string, { title: string; tier: string; icon: React.ReactNode; loader: () => Promise<string> }> = {
  // Public Library
  'what-is-cmpsbl': { title: 'What Is CMPSBL', tier: 'Public', icon: <Globe className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/01-what-is-cmpsbl.md?raw').then(m => m.default) },
  'how-it-works': { title: 'How It Works', tier: 'Public', icon: <Settings className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/02-how-it-works.md?raw').then(m => m.default) },
  'the-40-primitives': { title: 'The 40 Primitives', tier: 'Public', icon: <Layers className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/03-the-40-primitives.md?raw').then(m => m.default) },
  'key-features': { title: 'Key Features', tier: 'Public', icon: <Zap className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/04-key-features.md?raw').then(m => m.default) },
  'memory-and-learning': { title: 'Memory & Learning', tier: 'Public', icon: <Brain className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/05-memory-and-learning.md?raw').then(m => m.default) },
  'security-and-trust': { title: 'Security & Trust', tier: 'Public', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/06-security-and-trust.md?raw').then(m => m.default) },
  'agent-marketplace': { title: 'Agent Marketplace', tier: 'Public', icon: <Package className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/07-agent-marketplace.md?raw').then(m => m.default) },
  'ascension-engine': { title: 'Ascension Engine', tier: 'Public', icon: <Rocket className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/08-ascension-engine.md?raw').then(m => m.default) },
  'plans-and-pricing': { title: 'Plans & Pricing', tier: 'Public', icon: <BarChart3 className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/09-plans-and-pricing.md?raw').then(m => m.default) },
  'roadmap-and-vision': { title: 'Roadmap & Vision', tier: 'Public', icon: <Eye className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/10-roadmap-and-vision.md?raw').then(m => m.default) },
  'glossary': { title: 'Glossary', tier: 'Public', icon: <Book className="w-4 h-4" />, loader: () => import('../../../docs/libraries/public/11-glossary.md?raw').then(m => m.default) },

  // Users Library
  'getting-started': { title: 'Getting Started', tier: 'Users', icon: <BookOpen className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/01-getting-started.md?raw').then(m => m.default) },
  'api-reference': { title: 'API Reference', tier: 'Users', icon: <Code className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/02-api-reference.md?raw').then(m => m.default) },
  'primitives-guide': { title: 'Primitives Guide', tier: 'Users', icon: <Layers className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/03-primitives-guide.md?raw').then(m => m.default) },
  'user-memory-learning': { title: 'Memory & Learning', tier: 'Users', icon: <Brain className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/04-memory-and-learning.md?raw').then(m => m.default) },
  'rate-limits': { title: 'Rate Limits', tier: 'Users', icon: <BarChart3 className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/05-rate-limits.md?raw').then(m => m.default) },
  'webhooks-events': { title: 'Webhooks & Events', tier: 'Users', icon: <Zap className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/06-webhooks-events.md?raw').then(m => m.default) },
  'cli-and-sdk': { title: 'CLI & SDK', tier: 'Users', icon: <Code className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/07-cli-and-sdk.md?raw').then(m => m.default) },
  'ascension-integration': { title: 'Ascension Integration', tier: 'Users', icon: <Rocket className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/08-ascension-integration.md?raw').then(m => m.default) },
  'agency-framework': { title: 'Agency Framework', tier: 'Users', icon: <Users className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/09-agency-framework.md?raw').then(m => m.default) },
  'troubleshooting': { title: 'Troubleshooting', tier: 'Users', icon: <Wrench className="w-4 h-4" />, loader: () => import('../../../docs/libraries/users/10-troubleshooting.md?raw').then(m => m.default) },

  // Investors Library
  'investor-executive-summary': { title: 'Executive Summary', tier: 'Investors', icon: <FileText className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/01-executive-summary.md?raw').then(m => m.default) },
  'technology-architecture': { title: 'Technology Architecture', tier: 'Investors', icon: <Cpu className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/02-technology-architecture.md?raw').then(m => m.default) },
  'competitive-positioning': { title: 'Competitive Positioning', tier: 'Investors', icon: <BarChart3 className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/03-competitive-positioning.md?raw').then(m => m.default) },
  'commercial-model': { title: 'Commercial Model', tier: 'Investors', icon: <Scale className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/04-commercial-model.md?raw').then(m => m.default) },
  'engineering-proof': { title: 'Engineering Proof', tier: 'Investors', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/05-engineering-proof.md?raw').then(m => m.default) },
  'ip-defensibility': { title: 'IP Defensibility', tier: 'Investors', icon: <Lock className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/06-ip-defensibility.md?raw').then(m => m.default) },
  'governance-risk': { title: 'Governance & Risk', tier: 'Investors', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/07-governance-risk.md?raw').then(m => m.default) },
  'survivability': { title: 'Survivability', tier: 'Investors', icon: <Heart className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/08-survivability.md?raw').then(m => m.default) },
  'defensible-valuation': { title: 'Defensible Valuation', tier: 'Investors', icon: <BarChart3 className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/09-defensible-valuation.md?raw').then(m => m.default) },
  'ascension-demo-script': { title: 'Ascension Demo Script', tier: 'Investors', icon: <Rocket className="w-4 h-4" />, loader: () => import('../../../docs/libraries/investors/10-ascension-demo-script.md?raw').then(m => m.default) },

  // Internal Library
  'internal-system-overview': { title: 'System Overview', tier: 'Internal', icon: <Layers className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/01-system-overview.md?raw').then(m => m.default) },
  'internal-governance': { title: 'Governance Authority', tier: 'Internal', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/02-governance-authority.md?raw').then(m => m.default) },
  'internal-security': { title: 'Security & Defense', tier: 'Internal', icon: <Shield className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/03-security-defense.md?raw').then(m => m.default) },
  'internal-evolution': { title: 'Evolution & SEBA', tier: 'Internal', icon: <GitBranch className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/04-evolution-seba.md?raw').then(m => m.default) },
  'internal-memory': { title: 'Memory & Data', tier: 'Internal', icon: <Database className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/05-memory-data.md?raw').then(m => m.default) },
  'internal-operations': { title: 'Daily Operations', tier: 'Internal', icon: <Settings className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/06-daily-operations.md?raw').then(m => m.default) },
  'internal-atlas': { title: 'ATLAS Engine Hub', tier: 'Internal', icon: <Globe className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/07-atlas-hub.md?raw').then(m => m.default) },
  'internal-succession': { title: 'Succession & Survivability', tier: 'Internal', icon: <Heart className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/08-succession-survivability.md?raw').then(m => m.default) },
  'internal-founder': { title: 'Founder Intent', tier: 'Internal', icon: <Heart className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/09-founder-intent.md?raw').then(m => m.default) },
  'internal-emergency': { title: 'Emergency Procedures', tier: 'Internal', icon: <Zap className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/10-emergency-procedures.md?raw').then(m => m.default) },
  'internal-valuation': { title: 'Defensible Valuation', tier: 'Internal', icon: <BarChart3 className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/11-defensible-valuation.md?raw').then(m => m.default) },
  'internal-cli': { title: 'CLI & Terminal Access', tier: 'Internal', icon: <Code className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/12-cli-terminal-access-control.md?raw').then(m => m.default) },
  'internal-memory-chains': { title: 'Primary Memory Chains', tier: 'Internal', icon: <Database className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/13-primary-memory-chains.md?raw').then(m => m.default) },
  'internal-ada': { title: 'Autonomous Decision Authority', tier: 'Internal', icon: <Brain className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/14-autonomous-decision-authority.md?raw').then(m => m.default) },
  'internal-primitives': { title: 'Primitive Specifications', tier: 'Internal', icon: <Cpu className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/15-primitive-specifications.md?raw').then(m => m.default) },
  'internal-trade-secrets': { title: 'Trade Secrets', tier: 'Internal', icon: <Lock className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/16-trade-secrets.md?raw').then(m => m.default) },
  'internal-crown-jewels': { title: 'Crown Jewel Registry', tier: 'Internal', icon: <Zap className="w-4 h-4" />, loader: () => import('../../../docs/libraries/internal/17-crown-jewel-registry.md?raw').then(m => m.default) },
};

// Group docs by library for sidebar
const tiers = [
  { name: 'Public', slugs: ['what-is-cmpsbl', 'how-it-works', 'the-40-primitives', 'key-features', 'memory-and-learning', 'security-and-trust', 'agent-marketplace', 'ascension-engine', 'plans-and-pricing', 'roadmap-and-vision', 'glossary'] },
  { name: 'Users', slugs: ['getting-started', 'api-reference', 'primitives-guide', 'user-memory-learning', 'rate-limits', 'webhooks-events', 'cli-and-sdk', 'ascension-integration', 'agency-framework', 'troubleshooting'] },
  { name: 'Investors', slugs: ['investor-executive-summary', 'technology-architecture', 'competitive-positioning', 'commercial-model', 'engineering-proof', 'ip-defensibility', 'governance-risk', 'survivability', 'defensible-valuation', 'ascension-demo-script'] },
  { name: 'Internal', slugs: ['internal-system-overview', 'internal-governance', 'internal-security', 'internal-evolution', 'internal-memory', 'internal-operations', 'internal-atlas', 'internal-succession', 'internal-founder', 'internal-emergency', 'internal-valuation', 'internal-cli', 'internal-memory-chains', 'internal-ada', 'internal-primitives', 'internal-trade-secrets', 'internal-crown-jewels'] },
];

export default function DocsReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('doc') || 'what-is-cmpsbl';
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
      <SEO title={`${activeDoc?.title || 'Documentation'} — CMPSBL Docs`} description="Comprehensive documentation for the CMPSBL Substrate OS — v16.7.0 CONTACT Epoch." keywords={['documentation', 'architecture', 'substrate', 'primitives']} />
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
                          if (!doc) return null;
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