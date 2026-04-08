/**
 * PatentTrustStrip — Dual-patent IP trust signal for the homepage
 */

import { Shield, ExternalLink, Award } from "lucide-react";
import { Link } from "react-router-dom";

const PATENTS = [
  {
    number: "64/029,678",
    title: "Dual-Layer Deterministic Software Evolution",
    shortTitle: "Layer 2 Architecture",
    filed: "04/04/2026",
  },
  {
    number: "64/031,637",
    title: "Silent Symbiotic Software Attachment",
    shortTitle: "Universal Adhesion",
    filed: "04/07/2026",
  },
];

export function PatentTrustStrip() {
  return (
    <section className="relative z-10 px-4 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Protected Innovation
          </span>
        </div>

        {/* Patent cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PATENTS.map((p) => (
            <div
              key={p.number}
              className="relative rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 sm:p-6 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {p.title}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1 leading-relaxed">
                    {p.shortTitle}
                  </p>
                  <p className="text-[10px] font-mono font-medium text-muted-foreground mt-2">
                    U.S. Patent App. No. {p.number} · Filed {p.filed}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inventor attribution */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Inventor:</span>
            <span className="text-sm font-bold text-foreground">Kenneth E. Sweet Jr.</span>
            <span className="text-muted-foreground font-medium">·</span>
            <a
              href="https://orcid.org/0009-0001-4237-1243"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              ORCID <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs font-medium text-muted-foreground max-w-lg mx-auto">
            Governed Cognitive Infrastructure · A PromptFluid™&nbsp;Product
          </p>
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            View 16 verified case studies <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
