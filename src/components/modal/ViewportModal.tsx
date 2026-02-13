import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function ViewportModal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[12000] grid place-items-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cn(
        "w-full max-w-[900px] max-h-[78vh] overflow-hidden",
        "bg-background/95 border border-border/30 rounded-2xl",
        "flex flex-col shadow-2xl"
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <span className="text-sm text-foreground/90 font-medium">{title || ""}</span>
          <button
            type="button"
            onClick={onClose}
            className="border border-border/30 bg-muted/30 text-foreground/80 rounded-lg p-1.5 hover:bg-muted/50 cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
