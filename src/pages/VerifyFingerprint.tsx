/**
 * /verify/:fingerprint — Public verification page
 * Allows anyone to verify the authenticity of a CMPSBL® Ascension artifact
 * directly from a URL embedded in the branded output.
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Shield, CheckCircle, XCircle, Loader2, ExternalLink, FileCode, Award } from "lucide-react";
import { lookupAnyFingerprint, type UnifiedLookupResult } from "@/lib/factory/restoration-session";

type VerifyState = "loading" | "verified" | "not-found";

const VerifyFingerprint = () => {
  const { fingerprint } = useParams<{ fingerprint: string }>();
  const [state, setState] = useState<VerifyState>("loading");
  const [result, setResult] = useState<UnifiedLookupResult | null>(null);

  useEffect(() => {
    if (!fingerprint) {
      setState("not-found");
      return;
    }

    let cancelled = false;
    lookupAnyFingerprint(fingerprint).then((r) => {
      if (cancelled) return;
      if (r) {
        setResult(r);
        setState("verified");
      } else {
        setState("not-found");
      }
    });
    return () => { cancelled = true; };
  }, [fingerprint]);

  const title = state === "verified"
    ? `Verified — ${fingerprint}`
    : `Verify Artifact — CMPSBL®`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content="Verify the authenticity of a CMPSBL® Ascension artifact using its Fingerprint ID." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">CMPSBL<sup className="text-[10px]">®</sup></span>
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Artifact Verification</p>
          </div>

          {/* Card */}
          <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            {state === "loading" && (
              <div className="p-10 flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Verifying fingerprint…</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">{fingerprint}</code>
              </div>
            )}

            {state === "verified" && result && (
              <VerifiedView fingerprint={fingerprint!} result={result} />
            )}

            {state === "not-found" && (
              <div className="p-10 flex flex-col items-center gap-4 text-center">
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-7 w-7 text-destructive" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Not Found</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  No artifact matches this fingerprint. It may have been entered incorrectly or the artifact was not processed through the CMPSBL® Ascension substrate.
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">{fingerprint ?? "—"}</code>
                <Link to="/" className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1">
                  Go to CMPSBL.com <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-muted-foreground mt-6">
            CMPSBL® · A PromptFluid™ Product · U.S. Patent App. No. 64/029,678
          </p>
        </div>
      </div>
    </>
  );
};

const VerifiedView = ({ fingerprint, result }: { fingerprint: string; result: UnifiedLookupResult }) => {
  const isRestoration = result.source === "restoration";
  const session = result.session;

  const score = isRestoration
    ? (session as { cjpiScore: number }).cjpiScore
    : (session as { finalCjpi: number | null }).finalCjpi ?? 0;

  const tier = isRestoration
    ? (session as { cjpiTier: string }).cjpiTier
    : score >= 90 ? "S" : score >= 75 ? "A" : score >= 60 ? "B" : "C";

  const serial = isRestoration
    ? (session as { serialNumber: string }).serialNumber
    : null;

  const language = isRestoration
    ? (session as { originalLanguage: string | null }).originalLanguage
    : null;

  const primitives = isRestoration
    ? (session as { selectedPrimitives: string[] }).selectedPrimitives
    : (session as { primitivesApplied: string[] }).primitivesApplied;

  const createdAt = new Date(session.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const tierBg = tier === "S" ? "bg-yellow-500/15 text-yellow-600" : tier === "A" ? "bg-emerald-500/15 text-emerald-600" : tier === "B" ? "bg-blue-500/15 text-blue-600" : "bg-muted text-muted-foreground";
  const tierAccent = tier === "S" ? "text-yellow-600" : tier === "A" ? "text-emerald-600" : tier === "B" ? "text-blue-600" : "text-primary";

  return (
    <>
      {/* Success banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Verified Authentic</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">
            This artifact was processed through the CMPSBL® Ascension substrate.
          </p>
        </div>
      </div>

      {/* CJPI Hero */}
      <div className="px-6 pt-6 pb-4 text-center border-b border-border">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Award className={`h-6 w-6 ${tierAccent}`} />
          <span className={`text-4xl font-black tracking-tight ${tierAccent}`}>{score}</span>
          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${tierBg}`}>{tier}-Tier</span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">CJPI Score · Governed Cognitive Infrastructure</p>
      </div>

      {/* Details */}
      <div className="p-6 space-y-5">
        {/* Metadata rows */}
        <div className="space-y-3 text-sm">
          <Row label="Fingerprint" value={fingerprint} mono />
          {serial && <Row label="Serial Number" value={serial} mono />}
          <Row label="Source" value={isRestoration ? "Ascension Lab" : "Vertical Ascension"} />
          {language && <Row label="Language" value={language} />}
          <Row label="Processed" value={createdAt} />
          <Row label="Primitives Applied" value={String(primitives.length)} />
        </div>

        {/* Primitives list */}
        {primitives.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Applied Primitives</p>
            <div className="flex flex-wrap gap-1.5">
              {primitives.map((p) => (
                <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Patent attribution */}
        <div className="pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Protected under U.S. Patent App. No. 64/029,678 &amp; No. 64/031,637.
            Inventor: Kenneth E. Sweet Jr. · PromptFluid™
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
          <FileCode className="h-3 w-3" /> cmpsbl.com
        </Link>
        <Link
          to="/ascension"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Run Your Own Ascension <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
};

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className={`text-foreground text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
  </div>
);

export default VerifyFingerprint;
