/**
 * StoreCollectorCard — Unified flip card for agents & engines.
 * Uses pure CSS transform for 3D flip (no framer-motion on the flip axis)
 * to ensure backfaceVisibility works correctly cross-browser.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Zap, ShoppingCart, Cpu, RotateCcw, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { generateProductZip } from "@/lib/export/product-zip";
import type { StoreItem } from "@/lib/store/catalog";
import { TIER_META } from "@/lib/store/catalog";
import { useDownloadCeremony } from "@/hooks/useDownloadCeremony";

interface StoreCollectorCardProps {
  item: StoreItem;
  focused: boolean;
  onToggleFocus: () => void;
}

export function StoreCollectorCard({ item, focused, onToggleFocus }: StoreCollectorCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const tier = TIER_META[item.tier];
  const isAgent = item.kind === "agent";
  const { runWithCeremony, overlayElement } = useDownloadCeremony();

  const handleAcquire = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.priceCents === 0) {
      if (!user) {
        toast.error("Create a free account to download — it only takes a moment.", {
          action: { label: "Sign Up", onClick: () => navigate("/auth") },
        });
        return;
      }
      setLoading(true);
      try {
        const slug = item.id.replace(/^(agent-|engine-)/, "");
        await runWithCeremony(
          {
            itemName: item.name,
            kindLabel: isAgent ? "Meta-Agent" : "Engine",
            note: `Your sealed ${isAgent ? "agent" : "engine"} bundle will begin downloading shortly.`,
          },
          async () => {
            const blob = await generateProductZip({
              id: item.id, kind: item.kind, name: item.name, subtitle: item.subtitle,
              price: item.priceDisplay, tier: item.tier, slug, version: "1.0.0",
              capabilities: item.capabilities,
            });
            saveAs(blob, `cmpsbl-${item.kind}-${slug}.zip`);
          }
        );
      } catch { toast.error("Failed to generate download bundle."); }
      finally { setLoading(false); }
      return;
    }
    if (!user) {
      toast.error("Please sign in to purchase.", {
        action: { label: "Sign In", onClick: () => navigate("/auth") },
      });
      return;
    }
    setLoading(true);
    try {
      if (isAgent) {
        const agentId = item.id.replace("agent-", "");
        const { data, error } = await supabase.functions.invoke("agent-checkout", {
          body: { agent_id: agentId, agent_name: item.name },
        });
        if (error) throw error;
        if ((data as any)?.free) { toast.success(`${item.name} activated for free!`); if ((data as any)?.redirect) navigate((data as any).redirect); return; }
        if ((data as any)?.url) { window.location.href = (data as any).url; return; }
        throw new Error("No checkout URL returned");
      } else {
        const engineSlug = item.id.replace("engine-", "");
        const { data, error } = await supabase.functions.invoke("standalone-engine-checkout", {
          body: { engine_slug: engineSlug },
        });
        if (error) throw error;
        if ((data as any)?.url) { window.location.href = (data as any).url; return; }
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      {overlayElement}
      <div
        className={cn(
          "mx-auto transition-all duration-500 ease-out",
          focused ? "w-[calc(100vw-2rem)] max-w-[420px]" : "w-[calc(100vw-4rem)] max-w-[380px]",
        )}
        style={{ perspective: "1200px" }}
      >
        {/* 3D flip container — CSS transition, NOT framer-motion */}
        <div
          className="relative w-full transition-transform duration-600 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            aspectRatio: "3/4",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transitionDuration: "0.6s",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* ═══ FRONT ═══ */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl overflow-hidden",
              "border bg-card/95 backdrop-blur-md flex flex-col",
              tier.border,
              focused && "shadow-2xl ring-1 ring-primary/20",
              !focused && "shadow-xl hover:shadow-2xl",
              "transition-shadow duration-500",
            )}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              boxShadow: focused
                ? `0 0 40px ${item.glowColor}, 0 25px 50px -12px rgba(0,0,0,0.5)`
                : `0 0 20px ${item.glowColor}, 0 20px 40px -12px rgba(0,0,0,0.4)`
            }}
            onClick={onToggleFocus}
          >
            <div className={cn("h-1 w-full bg-gradient-to-r shrink-0", item.gradient)} />

            <div className="relative flex-1 min-h-0 overflow-hidden bg-background/50">
              {item.image ? (
                <img src={item.image} alt={item.name}
                  className="w-full h-full object-cover object-top" loading="lazy" />
              ) : (
                <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", item.gradient, "opacity-15")}>
                  <item.icon className="w-20 h-20 sm:w-24 sm:h-24 text-foreground/15" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              <div className={cn("absolute inset-0 bg-gradient-to-t opacity-30", item.gradient, "mix-blend-overlay")} />

              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-border/30">
                {isAgent ? <Lock className="w-3 h-3 text-muted-foreground/60" /> : <Cpu className="w-3 h-3 text-muted-foreground/60" />}
                <span className="text-[8px] font-black tracking-[0.15em] text-muted-foreground/60">
                  {isAgent ? "SEALED AGENT" : "ENGINE"}
                </span>
              </div>

              <div className={cn("absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black tracking-wider border backdrop-blur-sm", tier.bg, tier.color, tier.border)}>
                {tier.label}
              </div>
            </div>

            <div className="relative z-10 px-5 sm:px-6 pb-4 sm:pb-5 -mt-8 shrink-0">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">{item.name}</h3>
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground/40 mt-1 uppercase">{item.subtitle}</p>
              <p className="text-xs sm:text-[13px] text-muted-foreground/70 leading-relaxed mt-2 line-clamp-2">{item.bio}</p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary/50" />
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground/50 tracking-wider">
                    {item.capabilities.length} {isAgent ? "POWERS" : "CAPS"}
                  </span>
                </div>
                {item.fusedFrom && (
                  <div className="flex gap-1 flex-wrap justify-end max-w-[55%]">
                    {item.fusedFrom.slice(0, 3).map((name) => (
                      <span key={name} className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-foreground/5 text-muted-foreground/40 border border-border/15">{name}</span>
                    ))}
                    {item.fusedFrom.length > 3 && <span className="text-[7px] font-mono text-muted-foreground/25">+{item.fusedFrom.length - 3}</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className={cn("text-base sm:text-lg font-black tracking-tight", tier.color)}>{item.priceDisplay}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                  className={cn(
                    "text-[10px] font-bold text-primary/60 hover:text-primary",
                    "transition-all px-3 py-2 rounded-xl hover:bg-primary/10",
                    "flex items-center gap-1.5 min-h-[40px]"
                  )}
                >
                  <span className="tracking-wider">INSPECT</span>
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ═══ BACK ═══ */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl overflow-hidden",
              "border bg-card/98 backdrop-blur-md flex flex-col",
              tier.border,
              focused && "shadow-2xl",
            )}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: `0 0 30px ${item.glowColor}, 0 20px 40px -12px rgba(0,0,0,0.4)`
            }}
          >
            <div className={cn("h-1 w-full bg-gradient-to-r shrink-0", item.gradient)} />

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{item.name}</h3>
                    <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider border shrink-0", tier.bg, tier.color, tier.border)}>
                      {isAgent ? "AGENT" : "ENGINE"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground/40 mt-0.5 tracking-wider">{item.subtitle}</p>
                </div>
                <div className={cn("px-2.5 py-1 rounded-full text-[8px] font-black border shrink-0 tracking-wider", tier.bg, tier.color, tier.border)}>
                  {tier.label}
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-muted-foreground/60 leading-relaxed">{item.description}</p>

              <div>
                <h4 className="text-[9px] font-black tracking-[0.2em] text-primary/50 mb-3 uppercase">
                  {isAgent ? "Crown Jewel Powers" : "Capabilities"}
                </h4>
                <div className="space-y-1.5">
                  {item.capabilities.map((cap) => (
                    <div key={cap} className="rounded-xl border border-border/20 bg-background/20 px-3.5 py-2.5 flex items-center gap-2">
                      <div className={cn("w-1 h-1 rounded-full shrink-0 bg-gradient-to-r", item.gradient)} />
                      <span className="text-[11px] sm:text-xs font-semibold text-foreground/90">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-border/20 space-y-2 shrink-0">
              <Button
                size="sm"
                className={cn(
                  "w-full gap-2 text-xs sm:text-sm font-black min-h-[48px] rounded-xl",
                  "bg-gradient-to-r text-white shadow-lg transition-all duration-300",
                  "hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
                  item.gradient
                )}
                onClick={handleAcquire}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</>
                ) : (
                  <>
                    {item.priceCents === 0 ? <Download className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    {item.priceCents === 0 ? "Download Free" : `Acquire · ${item.priceDisplay}`}
                  </>
                )}
              </Button>
              <Button
                variant="ghost" size="sm"
                className="w-full text-[10px] font-bold min-h-[40px] gap-1.5 rounded-xl tracking-wider text-muted-foreground/60 hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              >
                <RotateCcw className="w-3 h-3" /> FLIP BACK
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
