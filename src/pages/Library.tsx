/**
 * Library — CMPSBL® Documentation Library
 * Premium documentation experience for investors and users
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, ChevronLeft, ChevronRight, 
  BookOpen, Layers, Menu, X, ExternalLink, Copy, Check, Printer,
  Sparkles, Shield, TrendingUp, Users, Briefcase, Code, 
  Building2, Rocket, BarChart3, Lock, Map, GitCompare
} from "lucide-react";
import { toast } from "sonner";
import { usePrintDocument } from "@/hooks/usePrintDocument";

// Document categories for organization
const CATEGORIES = {
  overview: { label: "Overview", icon: BookOpen, color: "from-primary to-violet-500" },
  technical: { label: "Technical", icon: Code, color: "from-blue-500 to-cyan-500" },
  business: { label: "Business", icon: Briefcase, color: "from-emerald-500 to-teal-500" },
  investor: { label: "Investor", icon: TrendingUp, color: "from-amber-500 to-orange-500" },
};

// Curated public-facing documentation with categories and metadata
const LIBRARY_DOCS = [
  { 
    id: "00", 
    name: "INDEX", 
    title: "Documentation Overview",
    category: "overview",
    description: "Complete guide to CMPSBL documentation",
    featured: false,
    readTime: "2 min"
  },
  { 
    id: "01", 
    name: "EXECUTIVE-SUMMARY", 
    title: "Executive Summary",
    category: "investor",
    description: "High-level overview for decision makers and investors",
    featured: true,
    readTime: "5 min"
  },
  { 
    id: "02", 
    name: "WHAT-IS-CMPSBL", 
    title: "What is CMPSBL?",
    category: "overview",
    description: "Introduction to the cognitive infrastructure layer",
    featured: true,
    readTime: "4 min"
  },
  { 
    id: "03", 
    name: "KEY-CAPABILITIES", 
    title: "Key Capabilities",
    category: "technical",
    description: "Deep dive into the 38-node / 12-sector architecture and synergies",
    featured: true,
    readTime: "8 min"
  },
  { 
    id: "04", 
    name: "USE-CASES", 
    title: "Use Cases",
    category: "business",
    description: "Real-world applications and industry examples",
    featured: false,
    readTime: "6 min"
  },
  { 
    id: "05", 
    name: "ARCHITECTURE", 
    title: "Architecture Overview",
    category: "technical",
    description: "Technical foundation and system design",
    featured: true,
    readTime: "7 min"
  },
  { 
    id: "06", 
    name: "GETTING-STARTED", 
    title: "Getting Started",
    category: "technical",
    description: "Quick start guide for developers",
    featured: false,
    readTime: "5 min"
  },
  { 
    id: "07", 
    name: "LICENSING", 
    title: "Pricing & Licensing",
    category: "business",
    description: "License tiers and pricing structure",
    featured: false,
    readTime: "4 min"
  },
  { 
    id: "08", 
    name: "FAQ", 
    title: "FAQ",
    category: "overview",
    description: "Frequently asked questions",
    featured: false,
    readTime: "6 min"
  },
  { 
    id: "09-SEC", 
    name: "SECURITY-COMPLIANCE", 
    title: "Security & Compliance",
    category: "business",
    description: "Enterprise security architecture and compliance frameworks",
    featured: true,
    readTime: "8 min"
  },
  { 
    id: "09", 
    name: "SYNERGY-CAPABILITIES", 
    title: "Synergy Capabilities",
    category: "technical",
    description: "300 cross-module pipelines that multiply intelligence",
    featured: true,
    readTime: "12 min"
  },
  { 
    id: "10-MKT", 
    name: "MARKETPLACE-FEATURES", 
    title: "Marketplace Features",
    category: "technical",
    description: "CodeLab, Templates, and Capabilities Depot",
    featured: false,
    readTime: "6 min"
  },
  { 
    id: "10", 
    name: "ROADMAP", 
    title: "Product Roadmap",
    category: "investor",
    description: "Vision and development timeline through 2028",
    featured: false,
    readTime: "5 min"
  },
  { 
    id: "11", 
    name: "CASE-STUDIES", 
    title: "Case Studies",
    category: "business",
    description: "Real implementation success stories",
    featured: true,
    readTime: "10 min"
  },
  { 
    id: "12", 
    name: "COMPARISONS", 
    title: "Market Comparison",
    category: "investor",
    description: "How CMPSBL compares to alternatives",
    featured: false,
    readTime: "7 min"
  },
  { 
    id: "13", 
    name: "INVESTOR-OVERVIEW", 
    title: "Investor Overview",
    category: "investor",
    description: "Investment thesis and market opportunity",
    featured: true,
    readTime: "10 min"
  },
];

const getCategoryIcon = (category: string) => {
  const icons = {
    overview: BookOpen,
    technical: Code,
    business: Briefcase,
    investor: TrendingUp,
  };
  return icons[category as keyof typeof icons] || FileText;
};

/** Inject mobile-first viewport + responsive CSS into HTML doc strings */
function injectMobileCSS(html: string): string {
  const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1">';
  const mobileCss = `<style>
    *, *::before, *::after { box-sizing: border-box; }
    body { max-width: 100% !important; padding: 1rem !important; margin: 0 !important; word-wrap: break-word; overflow-wrap: break-word; font-size: 10pt; }
    table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; font-size: 9pt; }
    pre { white-space: pre-wrap; word-break: break-word; max-width: 100%; }
    img { max-width: 100%; height: auto; }
    h1 { font-size: 16pt; }
    h2 { font-size: 13pt; }
    @media (min-width: 768px) {
      body { max-width: 7in !important; margin: auto !important; padding: 0.8in !important; font-size: 11pt; }
      table { font-size: 10pt; }
      h1 { font-size: 20pt; }
      h2 { font-size: 14pt; }
    }
  </style>`;
  // Inject after <meta charset>
  let result = html.replace(/<meta charset="utf-8"\s*\/?>/, `$&\n${viewport}`);
  // Inject mobile CSS before closing </head>
  result = result.replace('</head>', `${mobileCss}\n</head>`);
  return result;
}

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { printDocument } = usePrintDocument();
  const docParam = searchParams.get("doc");
  const currentDoc = LIBRARY_DOCS.find(d => `${d.id}-${d.name}` === docParam) || null;
  const currentIndex = currentDoc ? LIBRARY_DOCS.findIndex(d => d === currentDoc) : -1;
  const prevDoc = currentIndex > 0 ? LIBRARY_DOCS[currentIndex - 1] : null;
  const nextDoc = currentIndex < LIBRARY_DOCS.length - 1 ? LIBRARY_DOCS[currentIndex + 1] : null;

  const filteredDocs = activeCategory 
    ? LIBRARY_DOCS.filter(d => d.category === activeCategory)
    : LIBRARY_DOCS;

  const featuredDocs = LIBRARY_DOCS.filter(d => d.featured);

  const [isHtmlContent, setIsHtmlContent] = useState(false);

  useEffect(() => {
    if (!currentDoc) return;
    
    const loadDocument = async () => {
      setLoading(true);
      try {
        // Handle special suffixed IDs like "09-SEC" → "09-SECURITY-COMPLIANCE"
        const baseId = currentDoc.id.split('-')[0];
        const filename = `${baseId}-${currentDoc.name}`;
        // Try .html first (new format), fall back to .md
        let response = await fetch(`/docs/website/${filename}.html`);
        if (!response.ok) {
          response = await fetch(`/docs/website/${filename}.md`);
        }
        if (response.ok) {
          const text = await response.text();
          const html = text.trimStart().startsWith('<!') || text.trimStart().startsWith('<html');
          setIsHtmlContent(html);
          setContent(text);
        } else {
          setIsHtmlContent(false);
          setContent("# Document Not Found\n\nThis document could not be loaded.");
        }
      } catch (error) {
        setIsHtmlContent(false);
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
    if (!currentDoc) return;
    const url = `${window.location.origin}/library?doc=${currentDoc.id}-${currentDoc.name}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintDownload = () => {
    if (!currentDoc) return;
    printDocument({
      content,
      title: currentDoc.title,
      docId: currentDoc.id,
    });
  };

  // Library Landing View
  if (!currentDoc) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title="Documentation Library | CMPSBL"
          description="Complete documentation for CMPSBL cognitive infrastructure. Executive summaries, technical guides, case studies, and investor materials."
          image="https://cmpsbl.com/og/documentation.jpg"
          keywords={['CMPSBL documentation', 'AI infrastructure docs', 'substrate knowledge base', 'cognitive architecture reference']}
        />

        <PublicNav />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-16 sm:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-violet-500/5" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Documentation
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                    Documentation Library
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                  Everything you need to understand, evaluate, and build with CMPSBL® 
                  — the cognitive infrastructure layer for AI applications.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigateTo(LIBRARY_DOCS.find(d => d.id === "01")!)}
                    className="gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    Executive Summary
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigateTo(LIBRARY_DOCS.find(d => d.id === "06")!)}
                    className="gap-2"
                  >
                    <Rocket className="w-5 h-5" />
                    Getting Started
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Featured Documents */}
          <section className="py-12 sm:py-16 bg-muted/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">Featured Documents</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredDocs.map((doc, index) => {
                  const CategoryIcon = getCategoryIcon(doc.category);
                  const category = CATEGORIES[doc.category as keyof typeof CATEGORIES];
                  
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="group cursor-pointer h-full border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                        onClick={() => navigateTo(doc)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${category.color} bg-opacity-10`}>
                              <CategoryIcon className="w-5 h-5 text-white" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {doc.readTime}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.description}
                          </p>
                          
                          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {category.label}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Category Filter & All Documents */}
          <section className="py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="w-5 h-5 text-foreground" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold">All Documents</h2>
                  <Badge variant="outline" className="ml-2">{LIBRARY_DOCS.length}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(null)}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <Button
                      key={key}
                      variant={activeCategory === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(key)}
                      className="text-xs gap-1.5"
                    >
                      <cat.icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredDocs.map((doc, index) => {
                    const CategoryIcon = getCategoryIcon(doc.category);
                    const category = CATEGORIES[doc.category as keyof typeof CATEGORIES];
                    
                    return (
                      <motion.div
                        key={doc.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card 
                          className="group cursor-pointer border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all duration-200"
                          onClick={() => navigateTo(doc)}
                        >
                          <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                            <div className={`hidden sm:flex p-2.5 rounded-xl bg-gradient-to-br ${category.color} shrink-0`}>
                              <CategoryIcon className="w-5 h-5 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-muted-foreground">{doc.id}</span>
                                {doc.featured && (
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                )}
                              </div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                                {doc.title}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate hidden sm:block">
                                {doc.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                                {doc.readTime}
                              </Badge>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="py-12 sm:py-16 bg-muted/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-bold mb-8 text-center">Additional Resources</h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/foundations">
                  <Card className="group cursor-pointer h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        Foundations Paper
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Deep technical research documentation
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/namespace">
                  <Card className="group cursor-pointer h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        AI Governance Namespace
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Standardized AI terminology
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/changelog">
                  <Card className="group cursor-pointer h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <GitCompare className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        Changelog
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Version history and updates
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/substrate/licensing">
                  <Card className="group cursor-pointer h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        Get a License
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Start building with CMPSBL
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <EnhancedFooter />
      </div>
    );
  }

  // Document Reader View
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={`${currentDoc.title} — Documentation | CMPSBL`}
        description={currentDoc.description}
        keywords={['CMPSBL documentation', currentDoc.title.toLowerCase(), 'substrate docs']}
      />

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
          lg:w-80 lg:border-r lg:border-border bg-background
          ${sidebarOpen ? 'fixed inset-x-0 top-[117px] bottom-0 z-30 bg-background/98 backdrop-blur-md' : 'hidden lg:block'}
        `}>
          <ScrollArea className="h-full">
            <div className="p-4 lg:p-5">
              <Link to="/library" className="flex items-center gap-2 mb-4 px-2 lg:px-0 hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back to Library</span>
              </Link>
              
              <div className="flex items-center gap-2 mb-2 px-2 lg:px-0">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Documentation</h2>
              </div>
              <Badge variant="outline" className="mb-4 ml-2 lg:ml-0">{LIBRARY_DOCS.length} docs</Badge>
              
              <nav className="space-y-1">
                {LIBRARY_DOCS.map((doc) => {
                  const CategoryIcon = getCategoryIcon(doc.category);
                  
                  return (
                    <button
                      key={doc.id}
                      onClick={() => navigateTo(doc)}
                      className={`w-full text-left px-4 py-3.5 lg:px-3 lg:py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] flex items-center gap-3 ${
                        currentDoc.id === doc.id 
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CategoryIcon className="w-4 h-4 shrink-0 opacity-60" />
                      <span className="truncate flex-1">{doc.title}</span>
                      {doc.featured && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
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
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="outline" className="font-mono shrink-0 text-xs">{currentDoc.id}</Badge>
                <Separator orientation="vertical" className="h-4" />
                <h1 className="font-semibold truncate text-sm sm:text-base">{currentDoc.title}</h1>
                {currentDoc.featured && (
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex mr-2">
                  {currentDoc.readTime}
                </Badge>
                <Button variant="ghost" size="icon" onClick={copyLink} className="h-10 w-10 sm:h-9 sm:w-9" title="Copy link">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handlePrintDownload} className="h-10 w-10 sm:h-9 sm:w-9" title="Download as PDF">
                  <Printer className="w-4 h-4" />
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
              <motion.article 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="library-content max-w-none"
              >
                {isHtmlContent ? (
                  <iframe
                    srcDoc={injectMobileCSS(content)}
                    className="w-full border-0 min-h-[80vh]"
                    style={{ height: '100%' }}
                    title={currentDoc.title}
                    sandbox="allow-same-origin allow-popups"
                    onLoad={(e) => {
                      const iframe = e.currentTarget;
                      if (iframe.contentDocument) {
                        iframe.style.height = iframe.contentDocument.documentElement.scrollHeight + 'px';
                      }
                    }}
                  />
                ) : (
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
                      if (href) {
                        const mdMatch = href.match(/(?:\.\/)?(\d{2})-([A-Z-]+)\.(?:md|html)$/i);
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
                        
                        if (href.includes('fndtn-v6-foundations-paper') || href.includes('FNDTN-v6')) {
                          return (
                            <Link to="/foundations" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">
                              {children}
                            </Link>
                          );
                        }
                        
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
                        
                        if (href.startsWith('#')) {
                          return (
                            <a href={href} className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">
                              {children}
                            </a>
                          );
                        }
                      }
                      
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
                      <div className="my-6 sm:my-8 -mx-5 sm:mx-0 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        <div className="inline-block min-w-full px-5 sm:px-0">
                          <div className="sm:rounded-lg border border-border overflow-hidden">
                            <table className="min-w-full text-xs sm:text-sm md:text-base">
                              {children}
                            </table>
                          </div>
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
                )}
              </motion.article>
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
