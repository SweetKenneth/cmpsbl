/**
 * Substrate Insights — Observer Tier
 * Public page explaining observer-level access to CMPSBL substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Eye, BarChart3, FileText, BookOpen, ArrowRight, 
  CheckCircle, Shield, Layers, Users, Mail
} from "lucide-react";

const OBSERVER_FEATURES = [
  {
    icon: Eye,
    title: "Read-Only Visibility",
    description: "Access to documentation, architecture diagrams, and system overviews without modification rights."
  },
  {
    icon: BarChart3,
    title: "Public Metrics",
    description: "View aggregate performance benchmarks and validation methodology results."
  },
  {
    icon: FileText,
    title: "Documentation Access",
    description: "Full access to the architecture library covering all 38 nodes across 12 sectors."
  },
  {
    icon: BookOpen,
    title: "Research Materials",
    description: "Access to academic-grade documentation suitable for citation and reference."
  },
  {
    icon: Shield,
    title: "Standards Reference",
    description: "Review AIGVRN governance namespace and LLMS.txt machine context standards."
  },
  {
    icon: Layers,
    title: "Architecture Overview",
    description: "Understand the layered kernel architecture — 9 modules, 5 meshes, 9 zones."
  }
];

export default function Insights() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Substrate Insights — Observer Tier | CMPSBL"
        description="Observer-level access to the cognitive substrate. Read-only visibility into architecture, documentation, module specifications, and system standards."
        keywords={['AI substrate insights', 'observer access', 'cognitive architecture visibility', 'AI documentation access']}
      />

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">Observer Access</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            Substrate Insights
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Observer-level access to the CMPSBL cognitive substrate. 
            Explore documentation, architecture, and standards with read-only visibility.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">Production</Badge>
            <Badge variant="outline">9 Modules</Badge>
            <Badge variant="outline">Read-Only</Badge>
          </div>
        </div>

        {/* What Observers Get */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            What Observers Access
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OBSERVER_FEATURES.map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <feature.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Observer Scope */}
        <Card className="mb-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Observer Scope
            </CardTitle>
            <CardDescription>
              Understanding the observer tier within CMPSBL's access hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
               The <strong>Observer</strong> tier provides read-only access to CMPSBL documentation, 
               architecture references, and standards materials. Observers can review the full 
               documentation library, understand the 9-module + 5-mesh + 9-zone kernel architecture, and access 
               governance namespace documentation.
             </p>
            <p>
              This tier is designed for researchers, evaluators, and those seeking to understand 
              the substrate class before deeper engagement. All materials are citation-ready 
              and suitable for academic or commercial evaluation.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Available Resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/foundations" className="block">
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <Layers className="w-8 h-8 text-primary mb-3" />
                   <h3 className="font-semibold mb-1">Architecture Library</h3>
                   <p className="text-sm text-muted-foreground">Documents covering architecture, modules, meshes, and zones</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/namespace" className="block">
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <Shield className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Governance Namespace</h3>
                  <p className="text-sm text-muted-foreground">AI governance standards and 12 domain surfaces</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/llms-txt" className="block">
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <FileText className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">LLMS.txt Standard</h3>
                  <p className="text-sm text-muted-foreground">Machine-readable context format for AI systems</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Registration CTA */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-8 text-center">
            <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Register as Observer</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Join the observer list to receive updates on CMPSBL documentation releases, 
              standards publications, and research materials.
            </p>
            <Button size="lg" asChild>
              <Link to="/register">
                Register Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Applied Engagements CTA */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Interested in Applied Engagements?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Applied engagements are scoped, research-first, and selective.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/contact">
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attribution */}
        <div className="mt-12 p-6 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            CMPSBL® by{" "}
            <a 
              href="https://orcid.org/0009-0001-4237-1243" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kenneth E. Sweet Jr.
            </a>
            {" "}• CMPSBL® • 2026
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
