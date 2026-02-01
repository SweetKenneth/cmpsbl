/**
 * Library — FNDTN v6 Documentation Library
 * Properly renders Markdown documentation with navigation
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  FileText, Download, ChevronLeft, ChevronRight, 
  BookOpen, Layers, Menu, X, ExternalLink, Copy, Check
} from "lucide-react";
import { toast } from "sonner";

const LIBRARY_DOCS = [
  { id: "00", name: "INDEX", title: "Document Library Index" },
  { id: "01", name: "EXECUTIVE-SUMMARY", title: "Executive Summary" },
  { id: "02", name: "SYSTEM-ARCHITECTURE", title: "System Architecture" },
  { id: "03", name: "USERS-GUIDE", title: "User's Guide" },
  { id: "04", name: "API-REFERENCE", title: "API Reference" },
  { id: "10", name: "CORE-MODULE", title: "CORE Module" },
  { id: "11", name: "RIPPLE-MODULE", title: "RIPPLE Module" },
  { id: "12", name: "ACCESS-MODULE", title: "ACCESS Module" },
  { id: "13", name: "BRAIN-MODULE", title: "BRAIN Module" },
  { id: "14", name: "DECODE-MODULE", title: "DECODE Module" },
  { id: "15", name: "DREAM-MODULE", title: "DREAM Module" },
  { id: "16", name: "DEFENSE-MODULE", title: "DEFENSE Module" },
  { id: "17", name: "NEXUS-MODULE", title: "NEXUS Module" },
  { id: "18", name: "VISION-MODULE", title: "VISION Module" },
  { id: "19", name: "INTEGRATION-MODULE", title: "INTEGRATION Module" },
  { id: "20", name: "SYSTEM-MODULE", title: "SYSTEM Module" },
  { id: "21", name: "MODERNIZER-MODULE", title: "MODERNIZER Module" },
  { id: "22", name: "CORTEX-MODULE", title: "CORTEX Module" },
  { id: "23", name: "INCLUSIVE-MODULE", title: "INCLUSIVE Module" },
  { id: "30", name: "VALIDATION-METHODOLOGY", title: "Validation Methodology" },
  { id: "31", name: "PERFORMANCE-BENCHMARKS", title: "Performance Benchmarks" },
  { id: "32", name: "LIVE-SYSTEM-EVIDENCE", title: "Live System Evidence" },
  { id: "40", name: "GLOSSARY", title: "Glossary" },
  { id: "41", name: "BIBLIOGRAPHY", title: "Bibliography" },
  { id: "42", name: "LICENSING-INFO", title: "Licensing Information" },
  { id: "50", name: "MARKETPLACE-REFERENCE", title: "Marketplace Reference" },
  { id: "60", name: "CODELAB", title: "CodeLab" },
  { id: "61", name: "AGENTS-AND-FORGE", title: "Agents and Forge" },
  { id: "62", name: "TEMPLATE-GENERATOR", title: "Template Generator" },
  { id: "63", name: "CLM", title: "Constant Learning Mode" },
  { id: "64", name: "MEMORY-ARCHITECTURE", title: "Memory Architecture" },
  { id: "65", name: "SPACED-REPETITION", title: "Spaced Repetition System" },
  { id: "75", name: "EVOLUTION-LIFECYCLE", title: "Evolution Lifecycle" },
  { id: "76", name: "EVOLUTION-AUTONOMY", title: "Evolution Autonomy" },
  { id: "77", name: "SYNERGY-PIPELINES", title: "Synergy Pipelines" },
  { id: "78", name: "PREDICTIVE-PREVENTION", title: "Predictive Issue Prevention" },
  { id: "79", name: "ADAPTIVE-PERSONALIZATION", title: "Adaptive Personalization" },
  { id: "80", name: "INTELLIGENT-DELEGATION", title: "Intelligent Task Delegation" },
  { id: "81", name: "SECURITY-HARDENING", title: "Real-time Security Hardening" },
  { id: "82", name: "CONTEXTUAL-MEMORY", title: "Context-Aware Memory Recall" },
  { id: "83", name: "AUTONOMOUS-DOCS", title: "Autonomous Documentation" },
  { id: "84", name: "INSIGHT-SYNTHESIS", title: "Cross-Domain Insight Synthesis" },
  { id: "85", name: "GRACEFUL-DEGRADATION", title: "Graceful Degradation Chain" },
  { id: "86", name: "INTENT-AMPLIFICATION", title: "Intent Amplification" },
  { id: "87", name: "EVOLUTION-CONFIDENCE", title: "Evolution Confidence Scoring" },
];

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const docParam = searchParams.get("doc");
  const currentDoc = LIBRARY_DOCS.find(d => `${d.id}-${d.name}` === docParam) || LIBRARY_DOCS[0];
  const currentIndex = LIBRARY_DOCS.findIndex(d => d === currentDoc);
  const prevDoc = currentIndex > 0 ? LIBRARY_DOCS[currentIndex - 1] : null;
  const nextDoc = currentIndex < LIBRARY_DOCS.length - 1 ? LIBRARY_DOCS[currentIndex + 1] : null;

  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      try {
        const filename = `${currentDoc.id}-${currentDoc.name}.md`;
        const response = await fetch(`/docs/library/${filename}`);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent("# Document Not Found\n\nThis document could not be loaded.");
        }
      } catch (error) {
        setContent("# Error Loading Document\n\nAn error occurred while loading this document.");
      }
      setLoading(false);
    };

    loadDocument();
    setSidebarOpen(false);
  }, [currentDoc]);

  const navigateTo = (doc: typeof LIBRARY_DOCS[0]) => {
    setSearchParams({ doc: `${doc.id}-${doc.name}` });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/library?doc=${currentDoc.id}-${currentDoc.name}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDoc = () => {
    const filename = `${currentDoc.id}-${currentDoc.name}.md`;
    const a = document.createElement("a");
    a.href = `/docs/library/${filename}`;
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{currentDoc.title} — FNDTN v6 Library | promptfluid®</title>
        <meta name="description" content={`${currentDoc.title} - CMPSBL Substrate OS v6.0.0 documentation library.`} />
      </Helmet>

      <PublicNav />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <Button 
            variant="outline" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full h-12 justify-between text-sm font-medium"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="truncate">{currentDoc.title}</span>
            </span>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Sidebar */}
        <aside className={`
          lg:w-72 lg:border-r lg:border-border bg-background
          ${sidebarOpen ? 'fixed inset-x-0 top-[117px] bottom-0 z-30 bg-background/98 backdrop-blur-md' : 'hidden lg:block'}
        `}>
          <ScrollArea className="h-full">
            <div className="p-4 lg:p-4">
              <div className="flex items-center gap-2 mb-4 px-2 lg:px-0">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">FNDTN v6 Library</h2>
              </div>
              <Badge variant="outline" className="mb-4 ml-2 lg:ml-0">{LIBRARY_DOCS.length} Documents</Badge>
              
              <nav className="space-y-1">
                {LIBRARY_DOCS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => navigateTo(doc)}
                    className={`w-full text-left px-4 py-3.5 lg:px-3 lg:py-2 rounded-lg text-sm transition-all active:scale-[0.98] ${
                      currentDoc === doc 
                        ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono text-xs mr-2 opacity-50">{doc.id}</span>
                    {doc.title}
                  </button>
                ))}
              </nav>

              <Separator className="my-5" />
              
              <div className="space-y-2 px-2 lg:px-0 pb-6">
                <Link to="/foundations">
                  <Button variant="ghost" size="lg" className="w-full h-12 lg:h-9 justify-start gap-3 lg:gap-2 text-sm">
                    <FileText className="w-5 h-5 lg:w-4 lg:h-4" />
                    Foundations Paper
                  </Button>
                </Link>
                <Link to="/namespace">
                  <Button variant="ghost" size="lg" className="w-full h-12 lg:h-9 justify-start gap-3 lg:gap-2 text-sm">
                    <ExternalLink className="w-5 h-5 lg:w-4 lg:h-4" />
                    AI Governance Namespace
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Document Header */}
          <div className="sticky top-14 lg:top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="font-mono shrink-0 text-xs">{currentDoc.id}</Badge>
                <h1 className="font-semibold truncate text-sm sm:text-base">{currentDoc.title}</h1>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={copyLink} className="h-10 w-10 sm:h-9 sm:w-9">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={downloadDoc} className="h-10 w-10 sm:h-9 sm:w-9">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="px-5 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            ) : (
              <article className="library-content max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => (
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary border-b-2 border-primary/30 pb-4 sm:pb-6 mb-8 sm:mb-10 mt-2 sm:mt-4 leading-tight">
                        {children}
                      </h1>
                    ),
                    h2: ({children}) => (
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-10 sm:mt-14 mb-4 sm:mb-6 pt-6 sm:pt-8 border-t border-border flex items-center gap-2 sm:gap-3 leading-tight">
                        <span className="w-1 sm:w-1.5 h-6 sm:h-8 bg-primary rounded-full shrink-0" />
                        <span>{children}</span>
                      </h2>
                    ),
                    h3: ({children}) => (
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary/90 mt-8 sm:mt-10 mb-3 sm:mb-5 leading-snug">
                        {children}
                      </h3>
                    ),
                    h4: ({children}) => (
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4 leading-snug">
                        {children}
                      </h4>
                    ),
                    p: ({children}) => (
                      <p className="text-[15px] sm:text-base md:text-lg leading-relaxed sm:leading-relaxed text-muted-foreground mb-5 sm:mb-6">
                        {children}
                      </p>
                    ),
                    ul: ({children}) => (
                      <ul className="my-5 sm:my-6 ml-1 space-y-2 sm:space-y-3">
                        {children}
                      </ul>
                    ),
                    ol: ({children}) => (
                      <ol className="my-5 sm:my-6 ml-1 space-y-2 sm:space-y-3 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    li: ({children}) => (
                      <li className="flex items-start gap-2 sm:gap-3 text-[15px] sm:text-base md:text-lg leading-relaxed text-muted-foreground">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mt-2 sm:mt-2.5 shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({children}) => (
                      <strong className="font-bold text-foreground">{children}</strong>
                    ),
                    em: ({children}) => (
                      <em className="italic text-primary/80">{children}</em>
                    ),
                    a: ({href, children}) => {
                      // Handle internal library document links
                      if (href) {
                        // Match patterns like ./01-EXECUTIVE-SUMMARY.md or 01-EXECUTIVE-SUMMARY.md
                        const mdMatch = href.match(/(?:\.\/)?(\d{2})-([A-Z-]+)\.md$/i);
                        if (mdMatch) {
                          const docId = `${mdMatch[1]}-${mdMatch[2].toUpperCase()}`;
                          const targetDoc = LIBRARY_DOCS.find(d => `${d.id}-${d.name}` === docId);
                          if (targetDoc) {
                            return (
                              <button
                                onClick={() => setSearchParams({ doc: docId })}
                                className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors"
                              >
                                {children}
                              </button>
                            );
                          }
                        }
                        
                        // Handle FNDTN paper links - route to /foundations
                        if (href.includes('fndtn-v6-foundations-paper') || href.includes('FNDTN-v6')) {
                          return (
                            <Link to="/foundations" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">
                              {children}
                            </Link>
                          );
                        }
                        
                        // Handle external links
                        if (href.startsWith('http://') || href.startsWith('https://')) {
                          return (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                            >
                              {children}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          );
                        }
                        
                        // Handle anchor links within same page
                        if (href.startsWith('#')) {
                          return (
                            <a href={href} className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">
                              {children}
                            </a>
                          );
                        }
                      }
                      
                      // Fallback: render as styled text (broken link)
                      return (
                        <span className="text-primary/60 font-medium">
                          {children}
                        </span>
                      );
                    },
                    blockquote: ({children}) => (
                      <blockquote className="my-6 sm:my-8 pl-4 sm:pl-6 border-l-4 border-primary bg-primary/5 py-3 sm:py-4 pr-3 sm:pr-4 rounded-r-lg italic text-muted-foreground text-[15px] sm:text-base">
                        {children}
                      </blockquote>
                    ),
                    hr: () => (
                      <hr className="my-8 sm:my-12 border-t-2 border-border" />
                    ),
                    table: ({children}) => (
                      <div className="my-6 sm:my-8 -mx-5 sm:mx-0 overflow-x-auto">
                        <div className="inline-block min-w-full sm:rounded-lg border border-border">
                          <table className="min-w-full text-xs sm:text-sm md:text-base">
                            {children}
                          </table>
                        </div>
                      </div>
                    ),
                    thead: ({children}) => (
                      <thead className="bg-primary/10 border-b border-border">
                        {children}
                      </thead>
                    ),
                    th: ({children}) => (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-primary text-xs sm:text-sm whitespace-nowrap">
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="px-3 sm:px-4 py-2 sm:py-3 border-t border-border text-muted-foreground text-xs sm:text-sm">
                        {children}
                      </td>
                    ),
                    code: ({className, children}) => {
                      const isBlock = className?.includes('language-');
                      if (isBlock) {
                        return (
                          <code className={`${className} block text-xs sm:text-sm`}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-mono break-words">
                          {children}
                        </code>
                      );
                    },
                    pre: ({children}) => (
                      <pre className="my-6 sm:my-8 p-4 sm:p-6 bg-muted/50 border border-border rounded-lg sm:rounded-xl overflow-x-auto text-xs sm:text-sm -mx-5 sm:mx-0">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
            )}
          </div>

          {/* Navigation */}
          <div className="border-t border-border px-4 lg:px-8 py-4">
            <div className="flex justify-between gap-2 max-w-4xl mx-auto">
              {prevDoc ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigateTo(prevDoc)} 
                  className="gap-2 h-11 sm:h-10 flex-1 sm:flex-none max-w-[45%] sm:max-w-none"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline truncate">{prevDoc.title}</span>
                  <span className="sm:hidden text-sm">Prev</span>
                </Button>
              ) : <div className="flex-1 sm:flex-none" />}
              {nextDoc ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigateTo(nextDoc)} 
                  className="gap-2 h-11 sm:h-10 flex-1 sm:flex-none max-w-[45%] sm:max-w-none"
                >
                  <span className="hidden sm:inline truncate">{nextDoc.title}</span>
                  <span className="sm:hidden text-sm">Next</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </Button>
              ) : <div className="flex-1 sm:flex-none" />}
            </div>
          </div>
        </main>
      </div>

      <EnhancedFooter />
    </div>
  );
}
