import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadCeremonyOverlayProps {
  open: boolean;
  itemName: string;
  kindLabel?: string;
  note?: string;
}

export function DownloadCeremonyOverlay({
  open,
  itemName,
  kindLabel = "CMPSBL item",
  note = "Your full package will begin shortly.",
}: DownloadCeremonyOverlayProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!open) {
      setPhase(0);
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 350),
      window.setTimeout(() => setPhase(2), 900),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-background backdrop-blur-xl overflow-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/10" />
          <div className="relative flex min-h-[100dvh] items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl rounded-3xl border border-primary/20 bg-card/85 p-6 shadow-2xl shadow-primary/10 sm:p-10"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                      EXPORT RITUAL
                    </p>
                    <p className="text-sm font-semibold text-foreground">Preparing {kindLabel}</p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-primary/70" />
              </div>

              <div className="space-y-4 text-left">
                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                  Thank you for downloading <span className="text-primary">{itemName}</span>.
                </h2>
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {note} If you hit any friction, visit our support page. <span className="text-foreground">The system remembers.</span>
                </p>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-border/40 bg-background/60 p-4">
                {[
                  "Authenticating delivery path",
                  "Assembling docs, runtime, and manifest",
                  "Triggering secure download",
                ].map((step, index) => {
                  const active = phase >= index;
                  const current = phase === index;

                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${active ? "border-primary/30 bg-primary/10" : "border-border/40 bg-muted/40"}`}>
                        {current ? (
                          <Download className="h-3.5 w-3.5 animate-bounce text-primary" />
                        ) : (
                          <ShieldCheck className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/50"}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{step}</p>
                      </div>
                      {index < 2 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Mobile-first delivery · Full package bundle · Runtime + docs + tests
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to="/support">Visit Support</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
