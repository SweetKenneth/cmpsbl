/**
 * RestorationReport — Visual display of the restoration documentation package
 * Shows all 7 sections of the report.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Sparkles,
  AlertTriangle,
  Code2,
  TestTube,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RestorationReport as ReportType } from "@/lib/factory/restoration-docs";

interface RestorationReportViewProps {
  report: ReportType;
}

const SECTIONS = [
  { key: 'pipeline', icon: Layers, title: 'Pipeline Details' },
  { key: 'capabilities', icon: Sparkles, title: 'New Capabilities' },
  { key: 'vulnerabilities', icon: AlertTriangle, title: 'Vulnerability Assessment' },
  { key: 'errors', icon: Code2, title: 'Error Codes' },
  { key: 'testing', icon: TestTube, title: 'Testing Guide' },
  { key: 'certificate', icon: Award, title: 'CJPI Certificate' },
  { key: 'manifest', icon: FileText, title: 'Primitive Manifest' },
] as const;

export function RestorationReportView({ report }: RestorationReportViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['certificate']));
  const [copied, setCopied] = useState(false);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyTestCommand = () => {
    navigator.clipboard.writeText(report.testingGuide.testCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Restoration Report</h3>
            <p className="text-[10px] text-muted-foreground">
              {report.id} · Generated {report.generatedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-border/10">
        {SECTIONS.map(({ key, icon: Icon, title }) => {
          const isExpanded = expandedSections.has(key);
          return (
            <div key={key}>
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-card/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">{title}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-4">
                  {key === 'pipeline' && (
                    <div className="space-y-1.5">
                      {report.pipelineDetails.map((step) => (
                        <div key={step.order} className="flex items-center gap-2 text-[11px]">
                          <span className="text-muted-foreground/50 font-mono w-6">{step.order}.</span>
                          <span className="font-bold text-primary">{step.primitiveName}</span>
                          <span className="text-muted-foreground flex-1 truncate">— {step.action}</span>
                          <span className="text-muted-foreground/40 font-mono">{step.durationMs}ms</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {key === 'capabilities' && (
                    <div className="space-y-3">
                      {report.newCapabilities.map((cap) => (
                        <div key={cap.name} className="rounded-lg border border-border/20 bg-card/10 p-3">
                          <div className="text-xs font-bold text-foreground mb-1">{cap.name}</div>
                          <p className="text-[10px] text-muted-foreground mb-2">{cap.description}</p>
                          <pre className="text-[10px] font-mono text-primary/70 bg-background/50 rounded p-2 overflow-x-auto">
                            {cap.usageExample}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {key === 'vulnerabilities' && (
                    <div className="space-y-1.5">
                      {report.vulnerabilityAssessment.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px]">
                          <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            v.status === 'hardened' ? "bg-emerald-400" : v.status === 'mitigated' ? "bg-amber-400" : "bg-muted-foreground/30",
                          )} />
                          <span className="text-foreground font-medium">{v.title}</span>
                          <span className="text-muted-foreground/50 uppercase text-[9px] font-bold">{v.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {key === 'errors' && (
                    <div className="space-y-1.5">
                      {report.errorCodes.map((ec) => (
                        <div key={ec.code} className="text-[11px]">
                          <span className="font-mono font-bold text-primary">{ec.code}</span>
                          <span className="text-muted-foreground"> — {ec.trigger}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {key === 'testing' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <pre className="text-[10px] font-mono text-primary/70 bg-background/50 rounded px-3 py-1.5 flex-1">
                          {report.testingGuide.testCommand}
                        </pre>
                        <Button variant="ghost" size="sm" onClick={copyTestCommand} className="shrink-0">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                      <ol className="space-y-1">
                        {report.testingGuide.steps.map((step, i) => (
                          <li key={i} className="text-[10px] text-muted-foreground flex gap-1.5">
                            <span className="text-muted-foreground/40 font-mono">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {key === 'certificate' && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                      <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-lg font-black text-foreground">{report.cjpiCertificate.score}</div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                        {report.cjpiCertificate.tier} Tier
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono break-all">
                        Serial: {report.cjpiCertificate.serialNumber}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono break-all mt-1">
                        Fingerprint: {report.cjpiCertificate.fingerprint}
                      </div>
                    </div>
                  )}

                  {key === 'manifest' && (
                    <div className="space-y-1.5">
                      {report.primitiveManifest.map((pm) => (
                        <div key={pm.name} className="flex items-center gap-2 text-[11px]">
                          <span className="font-bold text-primary">{pm.name}</span>
                          <span className="text-muted-foreground/40 text-[9px] uppercase">{pm.category}</span>
                          <span className="text-muted-foreground flex-1 truncate">— {pm.contribution}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
