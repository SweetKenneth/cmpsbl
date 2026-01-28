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
        <div className="lg:hidden sticky top-14 z-40 bg-background border-b border-border p-3">
          <Button 
            variant="outline" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {currentDoc.title}
            </span>
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Sidebar */}
        <aside className={`
          lg:w-72 lg:border-r lg:border-border bg-background
          ${sidebarOpen ? 'fixed inset-x-0 top-[105px] bottom-0 z-30' : 'hidden lg:block'}
        `}>
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">FNDTN v6 Library</h2>
              </div>
              <Badge variant="outline" className="mb-4">26 Documents</Badge>
              
              <nav className="space-y-1">
                {LIBRARY_DOCS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => navigateTo(doc)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentDoc === doc 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono text-xs mr-2 opacity-50">{doc.id}</span>
                    {doc.title}
                  </button>
                ))}
              </nav>

              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Link to="/foundations">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    Foundations Paper
                  </Button>
                </Link>
                <Link to="/namespace">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <ExternalLink className="w-4 h-4" />
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
          <div className="sticky top-14 lg:top-0 z-20 bg-background border-b border-border px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="font-mono shrink-0">{currentDoc.id}</Badge>
                <h1 className="font-semibold truncate">{currentDoc.title}</h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={copyLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={downloadDoc}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="px-4 lg:px-8 py-8 max-w-4xl mx-auto">
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
                      <h1 className="text-3xl md:text-4xl font-bold text-primary border-b-2 border-primary/30 pb-6 mb-10 mt-4">
                        {children}
                      </h1>
                    ),
                    h2: ({children}) => (
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-14 mb-6 pt-8 border-t border-border flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-primary rounded-full" />
                        {children}
                      </h2>
                    ),
                    h3: ({children}) => (
                      <h3 className="text-xl md:text-2xl font-semibold text-primary/90 mt-10 mb-5">
                        {children}
                      </h3>
                    ),
                    h4: ({children}) => (
                      <h4 className="text-lg md:text-xl font-semibold text-foreground mt-8 mb-4">
                        {children}
                      </h4>
                    ),
                    p: ({children}) => (
                      <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
                        {children}
                      </p>
                    ),
                    ul: ({children}) => (
                      <ul className="my-6 ml-2 space-y-3">
                        {children}
                      </ul>
                    ),
                    ol: ({children}) => (
                      <ol className="my-6 ml-2 space-y-3 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    li: ({children}) => (
                      <li className="flex items-start gap-3 text-base md:text-lg leading-relaxed text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2.5 shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({children}) => (
                      <strong className="font-bold text-foreground">{children}</strong>
                    ),
                    em: ({children}) => (
                      <em className="italic text-primary/80">{children}</em>
                    ),
                    a: ({href, children}) => (
                      <a href={href} className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">
                        {children}
                      </a>
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="my-8 pl-6 border-l-4 border-primary bg-primary/5 py-4 pr-4 rounded-r-lg italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    hr: () => (
                      <hr className="my-12 border-t-2 border-border" />
                    ),
                    table: ({children}) => (
                      <div className="my-8 overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-sm md:text-base">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({children}) => (
                      <thead className="bg-primary/10 border-b border-border">
                        {children}
                      </thead>
                    ),
                    th: ({children}) => (
                      <th className="px-4 py-3 text-left font-bold text-primary">
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="px-4 py-3 border-t border-border text-muted-foreground">
                        {children}
                      </td>
                    ),
                    code: ({className, children}) => {
                      const isBlock = className?.includes('language-');
                      if (isBlock) {
                        return (
                          <code className={`${className} block`}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-mono">
                          {children}
                        </code>
                      );
                    },
                    pre: ({children}) => (
                      <pre className="my-8 p-6 bg-muted/50 border border-border rounded-xl overflow-x-auto text-sm">
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
            <div className="flex justify-between max-w-4xl mx-auto">
              {prevDoc ? (
                <Button variant="ghost" onClick={() => navigateTo(prevDoc)} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{prevDoc.title}</span>
                  <span className="sm:hidden">Previous</span>
                </Button>
              ) : <div />}
              {nextDoc ? (
                <Button variant="ghost" onClick={() => navigateTo(nextDoc)} className="gap-2">
                  <span className="hidden sm:inline">{nextDoc.title}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : <div />}
            </div>
          </div>
        </main>
      </div>

      <EnhancedFooter />
    </div>
  );
}
