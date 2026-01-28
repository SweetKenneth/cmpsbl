/**
 * AI Governance Namespace
 * 12 governance surfaces for the substrate class
 */

import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Globe, ExternalLink, Shield, CheckCircle, FileCheck, Scale,
  Lock, AlertTriangle, Landmark, Flag, Eye, Settings,
  Layers, Archive, Users
} from "lucide-react";

const NAMESPACE_SURFACES = [
  { name: "Governance", domain: "AIGVRN.com", icon: Landmark, description: "Root governance namespace", isRoot: true },
  { name: "Standards", domain: "AISTNDRD.com", icon: FileCheck, description: "Technical standards & specifications" },
  { name: "Certification", domain: "AICRTFY.com", icon: CheckCircle, description: "Compliance certification" },
  { name: "Verification", domain: "AIVRFY.com", icon: Shield, description: "Validation & testing" },
  { name: "Policy", domain: "AIPLCY.com", icon: Scale, description: "Policy frameworks" },
  { name: "Compliance", domain: "AICMPLY.com", icon: FileCheck, description: "Regulatory compliance" },
  { name: "Security", domain: "AISCRTY.com", icon: Lock, description: "Security standards" },
  { name: "Safety", domain: "AISFTY.com", icon: AlertTriangle, description: "Safety protocols" },
  { name: "Regulation", domain: "AIRGLTN.com", icon: Landmark, description: "Regulatory alignment" },
  { name: "Sovereignty", domain: "AISVRGN.com", icon: Flag, description: "Data sovereignty" },
  { name: "Privacy", domain: "AIPRVCY.com", icon: Eye, description: "Privacy controls" },
  { name: "Control", domain: "AICNTRL.com", icon: Settings, description: "Operational control" },
];

export default function Namespace() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AIGVRN — AI Governance Reference Namespace | CMPSBL Substrate OS v6.0.0</title>
        <meta name="description" content="AI Governance Reference Namespace (AIGVRN): 12 governance surfaces for the substrate class — Standards, Certification, Verification, Policy, Compliance, Security, Safety, Regulation, Sovereignty, Privacy, Control. Part of CMPSBL Substrate OS v6.0.0." />
        <meta name="keywords" content="AIGVRN, AI governance, AISTNDRD, AICRTFY, AIVRFY, AIPLCY, AICMPLY, AISCRTY, AISFTY, AIRGLTN, AISVRGN, AIPRVCY, AICNTRL, CMPSBL, Substrate OS v6.0.0" />
      </Helmet>

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">AIGVRN</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            AI Governance Namespace
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            The governance semantics layer for the substrate class. A structured namespace 
            covering 12 surfaces for policy, compliance, security, and regulatory alignment.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">12 Surfaces</Badge>
            <Badge variant="outline">Schema-Safe</Badge>
            <Badge variant="outline">Non-Political</Badge>
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              Namespace Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              The <strong>AI Governance Reference Namespace (AIGVRN)</strong> provides a 
              structured semantic layer for substrate-class systems. It defines 12 governance 
              surfaces that precede and govern agents, licensing logic, and acquisition pathways.
            </p>
            <p>
              This namespace is <strong>schema-safe</strong> — it defines organizational structure 
              without prescribing specific policy content. It is <strong>non-political</strong> — 
              focused on technical and operational governance rather than advocacy positions.
            </p>
            <p>
              CMPSBL FNDTN v6.0.0 references this namespace as its governance semantics layer, 
              aligning terminology and structures for interoperability with future substrate 
              implementations.
            </p>
          </CardContent>
        </Card>

        {/* Cross-links */}
        <Card className="mb-8 bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Three-Surface Standard Stack</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/foundations" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Substrate Standard</h4>
                <p className="text-sm text-muted-foreground">CMPSBL FNDTN v6.0.0</p>
              </Link>
              <Link to="/namespace" className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-medium text-primary mb-1">Governance Standard</h4>
                <p className="text-sm text-muted-foreground">AI Governance Namespace</p>
              </Link>
              <Link to="/llms-txt" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Machine Context Standard</h4>
                <p className="text-sm text-muted-foreground">LLMS.txt</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* 12 Surfaces Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            12 Governance Surfaces
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NAMESPACE_SURFACES.map((surface) => (
              <a
                key={surface.domain}
                href={`https://${surface.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-4 rounded-lg border transition-all hover:shadow-md ${
                  surface.isRoot 
                    ? "border-primary/30 bg-primary/5 hover:border-primary/50" 
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${surface.isRoot ? "bg-primary/10" : "bg-muted"}`}>
                    <surface.icon className={`w-5 h-5 ${surface.isRoot ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{surface.name}</h3>
                      {surface.isRoot && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">ROOT</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{surface.description}</p>
                    <div className="flex items-center gap-1 text-xs font-mono text-primary group-hover:underline">
                      {surface.domain}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schema-Safe Design</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  The namespace defines structural categories without mandating specific policies.
                  Organizations can map their existing governance frameworks to these surfaces
                  while maintaining full policy autonomy.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Substrate Alignment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  FNDTN v6.0.0 uses this namespace as its governance layer. The INCLUSIVE module
                  implements accessibility and alignment hooks that reference namespace surfaces
                  for policy routing and compliance checks.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Domain Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  All 12 domains are registered and available for namespace-aligned services.
                  The root domain (AIGVRN.com) serves as the canonical entry point for
                  governance documentation.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Future Extensions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  The namespace is designed for extension. Additional surfaces may be added
                  as governance requirements evolve. The schema supports versioning and
                  backward-compatible updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Archive Links */}
        <Card className="bg-muted/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Archival Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <a 
                href="https://zenodo.org/records/18393018" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Archive className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Zenodo</p>
                  <p className="text-xs text-muted-foreground">AI Governance Reference Namespace</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
              <a 
                href="https://orcid.org/0009-0001-4237-1243" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">ORCID</p>
                  <p className="text-xs text-muted-foreground">Author Profile</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Author Attribution */}
        <div className="mt-12 p-6 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            AI Governance Reference Namespace by{" "}
            <a 
              href="https://orcid.org/0009-0001-4237-1243" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kenneth E. Sweet Jr.
            </a>
            {" "}• PromptFluid • January 2026
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
