/**
 * CMPSBL® — DOI Publication
 * Research Artifact Publication
 */

import { Link } from "react-router-dom";
import { ExternalLink, FileText, Github, Search, Copy, Check, BookOpen, Scale, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { useState } from "react";
import { toast } from "sonner";

export default function Publication() {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const citations = {
    apa: `Sweet, K. E., Jr. (2026). CMPSBL substrate: Cognitive orchestration substrate for multi-provider AI systems (Version 2026.01) [Software]. Zenodo. https://doi.org/10.5281/zenodo.18234910`,
    bibtex: `@software{sweet2026cmpsbl,
  author       = {Sweet, Kenneth E., Jr.},
  title        = {CMPSBL substrate: Cognitive orchestration substrate for multi-provider AI systems},
  year         = {2026},
  version      = {2026.01},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.18234910},
  url          = {https://doi.org/10.5281/zenodo.18234910}
}`,
    chicago: `Sweet, Kenneth E., Jr. 2026. "CMPSBL substrate: Cognitive orchestration substrate for multi-provider AI systems." Version 2026.01. Zenodo. https://doi.org/10.5281/zenodo.18234910.`
  };

  const handleCopy = (format: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    toast.success(`${format.toUpperCase()} citation copied`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="CMPSBL Substrate — DOI Publication"
        description="DOI publication for the CMPSBL Substrate, including architecture, brain, nexus routing, defense intelligence, learning cycles, dream protocol, and licensing."
        canonical="https://cmpsbl.com/publication"
        keywords={['CMPSBL DOI', 'cognitive substrate', 'AI research artifact', 'Zenodo publication', 'OpenAIRE']}
        type="article"
      />

      <PublicNav />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-violet-500/5 blur-[80px]" />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <FileText className="w-3 h-3 mr-2" />
              Research Artifact
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4">
              CMPSBL Substrate — <span className="font-medium text-primary">DOI Publication</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
              Cognitive Orchestration Substrate for Multi-Provider AI Systems
            </p>

            {/* DOI Block */}
            <Card className="p-6 md:p-8 bg-card/60 backdrop-blur border-border/50 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">DOI</p>
                  <p className="text-xl md:text-2xl font-mono font-semibold text-foreground">
                    10.5281/zenodo.18234910
                  </p>
                </div>
                <Badge className="w-fit bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  Published January 2026
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a 
                    href="https://doi.org/10.5281/zenodo.18234910" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View DOI
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a 
                    href="https://github.com/cmpsbl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View Repository
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a 
                    href="https://explore.openaire.eu/search/result?pid=10.5281%2Fzenodo.18234910" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    OpenAIRE Index
                  </a>
                </Button>
              </div>
            </Card>

            {/* Description */}
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                The CMPSBL Substrate is a cognitive orchestration substrate that provides persistent memory, 
                unified routing, defense intelligence, autonomous learning cycles, and multi-provider execution 
                across heterogeneous AI models and cloud services. The substrate is model-agnostic, provider-agnostic, 
                and deployable on commodity Supabase + Postgres infrastructure. The DOI artifact includes the core 
                substrate specification, Dream Protocol, Learning Cycles, Security Model, Decode RFC, Brain APIs, 
                Nexus Routing, and licensing documentation.
              </p>
            </div>
          </div>
        </section>

        {/* Citation Formats */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Citation Formats</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(citations).map(([format, text]) => (
                <Card key={format} className="p-4 bg-card/60 backdrop-blur border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="uppercase text-xs">
                      {format}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(format, text)}
                      className="h-8"
                    >
                      {copiedFormat === format ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="text-xs md:text-sm font-mono text-muted-foreground bg-muted/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {text}
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Licensing */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Licensing</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-card/60 backdrop-blur border-border/50">
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
                  Core Platform
                </Badge>
                <h3 className="text-lg font-semibold text-foreground mb-2">Apache License 2.0</h3>
                <p className="text-sm text-muted-foreground">
                  Permissive license for commercial use, modification, and distribution with notice requirements.
                </p>
              </Card>
              <Card className="p-6 bg-card/60 backdrop-blur border-border/50">
                <Badge className="mb-3 bg-violet-500/10 text-violet-500 border-violet-500/30">
                  WordPress Plugins
                </Badge>
                <h3 className="text-lg font-semibold text-foreground mb-2">GPL-2.0</h3>
                <p className="text-sm text-muted-foreground">
                  GNU General Public License v2 for WordPress plugin components.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Owner */}
        <section className="container mx-auto px-6 py-12 pb-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Owner</h2>
            </div>

            <Card className="p-6 bg-card/60 backdrop-blur border-border/50">
              <p className="text-lg font-medium text-foreground mb-1">CMPSBL Research Team</p>
              <p className="text-muted-foreground mb-4">CMPSBL Studio</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/investors">Investor Relations</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contact">Contact</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
