import { pushToast } from "./SmartToastStore";
import type { SmartToastAnchor, SmartToastVariant } from "./SmartToastStore";

export function useSmartToast() {
  return {
    toast: (message: string, opts?: {
      variant?: SmartToastVariant;
      durationMs?: number;
      anchor?: SmartToastAnchor;
      ctaLabel?: string;
      onCtaClick?: () => void;
    }) => pushToast({ message, ...opts }),
  };
}
