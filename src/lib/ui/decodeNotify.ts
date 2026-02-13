import { pushToast } from "@/components/toast/SmartToastStore";

export function decodeToast(message: string, opts?: {
  ctaLabel?: string;
  onCtaClick?: () => void;
  durationMs?: number;
}) {
  return pushToast({
    message,
    anchor: "decode",
    variant: "info",
    durationMs: opts?.durationMs ?? 5500,
    ctaLabel: opts?.ctaLabel,
    onCtaClick: opts?.onCtaClick,
  });
}

export function decodeNewVideo(title: string, onOpen: () => void) {
  return decodeToast(`New video from the substrate: ${title}`, {
    ctaLabel: "View",
    onCtaClick: onOpen,
    durationMs: 7000,
  });
}

export function decodeNewReport(label: string, onOpen: () => void) {
  return decodeToast(`New report ready: ${label}`, {
    ctaLabel: "Open",
    onCtaClick: onOpen,
    durationMs: 7000,
  });
}
