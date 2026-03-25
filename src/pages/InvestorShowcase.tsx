/**
 * Investor Showcase — PIN-gated entry with responsive mobile/desktop layouts
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShowcaseMobile } from "@/components/investor/ShowcaseMobile";
import { ShowcaseDesktop } from "@/components/investor/ShowcaseDesktop";

const SHOWCASE_PIN = "2026";

// ─── PIN Gate ────────────────────────────────────────────────
const PinGate = ({ onSuccess }: { onSuccess: () => void }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-sm space-y-6 text-center ${shaking ? "animate-shake" : ""}`}
      >
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">CMPSBL® Investor Preview</h1>
          <p className="text-sm text-muted-foreground">Enter access code to continue</p>
        </div>

        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-mono font-bold transition-colors ${
                error
                  ? "border-destructive text-destructive"
                  : pin[i]
                  ? "border-primary text-foreground"
                  : "border-border text-muted-foreground/30"
              }`}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        <input
          type="tel"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && (() => {
            if (pin === SHOWCASE_PIN) onSuccess();
            else {
              setError(true);
              setShaking(true);
              setTimeout(() => setShaking(false), 500);
              setTimeout(() => { setError(false); setPin(""); }, 1500);
            }
          })()}
          className="sr-only"
          autoFocus
        />

        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "←"].map((key, i) => (
            <button
              key={i}
              className={`h-12 rounded-lg text-lg font-medium transition-colors ${
                key === null
                  ? "invisible"
                  : "bg-muted hover:bg-accent text-foreground active:scale-95"
              }`}
              onClick={() => {
                if (key === "←") setPin((p) => p.slice(0, -1));
                else if (key !== null && pin.length < 4) {
                  const next = pin + key;
                  setPin(next);
                  if (next.length === 4) setTimeout(() => {
                    if (next === SHOWCASE_PIN) onSuccess();
                    else {
                      setError(true);
                      setShaking(true);
                      setTimeout(() => setShaking(false), 500);
                      setTimeout(() => { setError(false); setPin(""); }, 1500);
                    }
                  }, 150);
                }
              }}
            >
              {key ?? ""}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive animate-fade-in">Invalid code</p>
        )}
      </motion.div>
    </div>
  );
};

// ─── Root ────────────────────────────────────────────────────
const InvestorShowcase = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const isMobile = useIsMobile();

  if (!authenticated) {
    return <PinGate onSuccess={() => setAuthenticated(true)} />;
  }

  return isMobile ? <ShowcaseMobile /> : <ShowcaseDesktop />;
};

export default InvestorShowcase;
