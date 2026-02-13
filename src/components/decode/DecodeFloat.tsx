import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  onClick?: () => void;
  anchorId?: string;
};

export default function DecodeFloat({ onClick, anchorId = "decode-float-anchor" }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);

  return (
    <button
      id={anchorId}
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Decode — substrate voice"
      className={cn(
        "fixed right-4 z-[9999] cursor-pointer touch-manipulation",
        "w-14 h-14 rounded-full grid place-items-center",
        "border border-border/30 bg-background/70 backdrop-blur-lg",
        "shadow-lg hover:shadow-xl transition-shadow",
        "active:scale-[0.97]"
      )}
      style={{
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Inner dot */}
      <span className="w-2.5 h-2.5 rounded-full bg-foreground/90" />
      {/* Ring */}
      <span
        className="absolute w-10 h-10 rounded-full border border-foreground/15"
        style={{ animation: "pulse 3s ease-in-out infinite" }}
      />
    </button>
  );
}
