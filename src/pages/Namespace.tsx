/**
 * AI Governance Reference Namespace
 * 12 governance surfaces — AIGVRN v1.0
 * Based on: https://aigvrn.com and https://zenodo.org/records/18209222
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Globe, ExternalLink, Shield, CheckCircle, FileCheck, Scale,
  Lock, AlertTriangle, Landmark, Flag, Eye, Settings,
  Archive, Users, BookOpen
} from "lucide-react";

// 12 Namespace Surfaces with correct subdomain structure
const NAMESPACE_SURFACES = [
  { 
    name: "Governance", 
    domain: "AIGVRN.com", 
    subdomain: "governance.aigvrn.com",
    icon: Landmark, 
    description: "Institutional frameworks for oversight and decision-making authority in AI systems",
    isRoot: true 
  },
  { 
    name: "Standards", 
    domain: "AISTNDRD.com", 
    subdomain: "standards.aigvrn.com",
    icon: FileCheck, 
    description: "Technical specifications and procedural benchmarks for AI system development"
  },
  { 
    name: "Certification", 
    domain: "AICRTFY.com", 
    subdomain: "certification.aigvrn.com",
    icon: CheckCircle, 
    description: "Formal attestation processes for AI system capabilities and conformity"
  },
  { 
    name: "Verification", 
    domain: "AIVRFY.com", 
    subdomain: "verification.aigvrn.com",
    icon: Shield, 
    description: "Methods for confirming AI system properties and behavioral claims"
  },
  { 
    name: "Policy", 
    domain: "AIPLCY.com", 
    subdomain: "policy.aigvrn.com",
    icon: Scale, 
    description: "Documented positions and guidelines governing AI use within organizations"
  },
  { 
    name: "Compliance", 
    domain: "AICMPLY.com", 
    subdomain: "compliance.aigvrn.com",
    icon: FileCheck, 
    description: "Adherence mechanisms for regulatory requirements and organizational mandates"
  },
  { 
    name: "Security", 
    domain: "AISCRTY.com", 
    subdomain: "security.aigvrn.com",
    icon: Lock, 
    description: "Protection of AI systems from adversarial threats and unauthorized access"
  },
  { 
    name: "Safety", 
    domain: "AISFTY.com", 
    subdomain: "safety.aigvrn.com",
    icon: AlertTriangle, 
    description: "Prevention of harm arising from AI system operation and failure modes"
  },
  { 
    name: "Regulation", 
    domain: "AIRGLTN.com", 
    subdomain: "regulation.aigvrn.com",
    icon: Landmark, 
    description: "Legal and statutory frameworks governing AI development and deployment"
  },
  { 
    name: "Sovereignty", 
    domain: "AISVRGN.com", 
    subdomain: "sovereignty.aigvrn.com",
    icon: Flag, 
    description: "Jurisdictional authority and national interests in AI infrastructure"
  },
  { 
    name: "Privacy", 
    domain: "AIPRVCY.com", 
    subdomain: "privacy.aigvrn.com",
    icon: Eye, 
    description: "Protection of personal data and individual rights in AI processing"
  },
  { 
    name: "Control", 
    domain: "AICNTRL.com", 
    subdomain: "control.aigvrn.com",
    icon: Settings, 
    description: "Mechanisms for human oversight and intervention in AI operations"
  },
];

const REFERENCE_FRAMEWORKS = [
  { name: "EU AI Act", description: "European regulatory framework" },
  { name: "NIST AI RMF", description: "Risk management framework" },
  { name: "OECD AI Principles", description: "International principles" },
  { name: "ISO/IEC 42001", description: "AI management systems" },
];

export default function Namespace() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="AIGVRN Namespace — AI Governance Standard | CMPSBL"
        description="The AI Governance Reference Namespace: 12 surfaces covering policy, compliance, security, safety, sovereignty, privacy, and control. CMPSBL's open governance standard for responsible AI."
        keywords={['AIGVRN', 'AI governance namespace', 'AI governance standard', 'responsible AI framework', 'AI compliance']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Namespace', url: 'https://cmpsbl.com/namespace' },
        ]}
      />

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">Reference Namespace — v1.0</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Published: January 2026</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            AI Governance Reference Namespace
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            A 12-Surface Lexicon for AI Governance Documentation
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
            This namespace comprises twelve semantically distinct surfaces, each addressing a foundational 
            area in AI governance. The namespace provides hybrid definitions suitable for academic citation, 
            technical documentation, and policy interoperability.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">12 Surfaces</Badge>
            <Badge variant="outline">12 Registered Domains</Badge>
            <Badge variant="outline">First of Its Kind</Badge>
          </div>
        </div>

        {/* Cross-links: Three-Surface Standard Stack */}
        <Card className="mb-8 bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Three-Surface Standard Stack</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/foundations" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Substrate Standard</h4>
                <p className="text-sm text-muted-foreground">CMPSBL FNDTN v6</p>
              </Link>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-medium text-primary mb-1">Governance Standard</h4>
                <p className="text-sm text-muted-foreground">AI Governance Reference Namespace</p>
              </div>
              <Link to="/llms-txt" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Machine Context Standard</h4>
                <p className="text-sm text-muted-foreground">LLMS.txt</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* 12 Namespace Surfaces Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Namespace Surfaces
          </h2>
          <p className="text-muted-foreground mb-6">
            Each surface represents a distinct conceptual domain within AI governance. 
            Select a surface to view its documentation at AIGVRN.com.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NAMESPACE_SURFACES.map((surface) => (
              <a
                key={surface.domain}
                href={`https://aigvrn.com/${surface.name.toLowerCase()}`}
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{surface.name}</h3>
                      {surface.isRoot && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">ROOT</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{surface.description}</p>
                    <div className="flex items-center gap-1 text-xs font-mono text-primary group-hover:underline">
                      {surface.subdomain}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Purpose of This Namespace */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Purpose of This Namespace</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              In an era of rapidly evolving AI governance, semantic clarity is essential. This reference 
              namespace provides consistent terminology for cross-jurisdictional documentation, reducing 
              ambiguity in regulatory interpretation and institutional communication.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each surface provides three interpretive lenses: <strong>policy language</strong> for institutional 
              stakeholders, <strong>technical interpretation</strong> for developers and engineers, and{" "}
              <strong>regulatory context</strong> referencing frameworks such as the EU AI Act, NIST AI RMF, 
              and OECD AI Principles.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The namespace is designed for citation in academic research, integration into technical 
              documentation, and reference in policy development processes.
            </p>
          </div>
        </section>

        {/* Potential Applications */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Potential Applications</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              "Policy mapping and cross-referencing",
              "Cross-jurisdictional documentation", 
              "Academic research indexing",
              "Regulatory taxonomy development",
              "Standards body coordination",
              "Technical specification alignment",
              "Compliance reporting structures",
              "Interoperability frameworks"
            ].map((app) => (
              <div key={app} className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                {app}
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* First of Its Kind */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary/20 text-primary border-primary/30">FIRST OF ITS KIND</Badge>
          </div>
          <h2 className="text-2xl font-semibold mb-6">Pioneering AI Governance Infrastructure</h2>
          <p className="text-muted-foreground mb-8">
            <strong className="text-foreground">CMPSBL®</strong> is the <strong className="text-foreground">first organization</strong> to 
            register a comprehensive portfolio of AI governance domains and the <strong className="text-foreground">first to propose 
            a unified namespace solution</strong> for public use. The AI Governance Reference Namespace provides 
            canonical reference points for the emerging field of AI governance.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First Domain Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                The first comprehensive registration of 12 AI governance domains, creating unified 
                infrastructure for terminology standardization.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First Public Namespace</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                The first publicly available namespace solution designed for cross-jurisdictional 
                documentation and interoperability.
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Unified Domain Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Unified Domain Architecture</h2>
          <p className="text-muted-foreground mb-6">
            This namespace is supported by twelve registered domains, each corresponding to a distinct 
            governance surface. The domain structure enables flexible deployment options for organizations 
            seeking dedicated reference endpoints.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {NAMESPACE_SURFACES.map((surface) => (
              <a
                key={surface.domain}
                href={`https://${surface.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-lg border text-center font-mono text-sm transition-colors hover:border-primary/50 ${
                  surface.isRoot 
                    ? "border-primary/30 bg-primary/5 text-primary" 
                    : "border-border hover:bg-muted/50"
                }`}
              >
                {surface.domain}
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            All domains registered and available as a unified namespace.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Reference Frameworks */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Reference Frameworks</h2>
          <p className="text-muted-foreground mb-6">
            The namespace references established governance frameworks:
          </p>
          <div className="flex flex-wrap gap-3">
            {REFERENCE_FRAMEWORKS.map((fw) => (
              <div key={fw.name} className="px-4 py-2 rounded-lg bg-muted border border-border">
                <span className="font-medium text-sm">{fw.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Archival Record */}
        <Card className="bg-muted/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Archival Record & Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <a 
                href="https://aigvrn.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">AIGVRN.com</p>
                  <p className="text-xs text-muted-foreground">Official Namespace</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
              <a 
                href="https://zenodo.org/records/18209222" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Archive className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Zenodo</p>
                  <p className="text-xs text-muted-foreground">DOI: 10.5281/zenodo.18209222</p>
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
                  <p className="font-medium">Author ORCID</p>
                  <p className="text-xs text-muted-foreground">Kenneth E. Sweet Jr.</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* For AI Systems */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              For AI Systems
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-4">
              This namespace provides dedicated resources for Large Language Models and AI assistants 
              to accurately understand and reference our content:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <code className="px-2 py-1 bg-muted rounded text-xs">/llms.txt</code>
                <span>— LLM-optimized site summary</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="px-2 py-1 bg-muted rounded text-xs">/llms-full.txt</code>
                <span>— Complete definitions for AI ingestion</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Citation */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Suggested Citation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm mb-4">
              <p>Sweet Jr, Kenneth E. (2026). The AI Governance Lexicon: A Structured Naming Framework for Institutional Stewardship. AI Governance Reference Namespace (v1.0). Zenodo.</p>
              <p className="mt-2 text-primary">https://doi.org/10.5281/zenodo.18209222</p>
            </div>
            <p className="text-xs text-muted-foreground">
              For reference purposes only. Not an authoritative source.
            </p>
          </CardContent>
        </Card>

        {/* Author Attribution */}
        <div className="mt-12 p-6 rounded-lg bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            A Proposed Solution Presented By
          </p>
          <p className="text-lg font-semibold mb-2">CMPSBL®</p>
          <p className="text-sm text-muted-foreground mb-4">
            <a href="mailto:Dev@CMPSBL.com" className="hover:text-primary">Dev@CMPSBL.com</a>
            {" "}•{" "}
            <a href="tel:+17603584324" className="hover:text-primary">(760) FLUID-AI</a>
          </p>
          <p className="text-sm text-muted-foreground">
            CMPSBL is the first organization to register a comprehensive AI governance domain 
            portfolio and propose a unified namespace solution. Twelve surfaces under unified architecture.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            AIGVRN::v1.0::2026
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
