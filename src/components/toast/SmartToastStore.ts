export type SmartToastVariant = "info" | "success" | "warning" | "error";
export type SmartToastAnchor = "decode" | "interaction" | "center";

export type SmartToast = {
  id: string;
  message: string;
  variant?: SmartToastVariant;
  durationMs?: number;
  anchor?: SmartToastAnchor;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

type Listener = (toasts: SmartToast[]) => void;

let toasts: SmartToast[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => { listeners.delete(listener); };
}

export function pushToast(t: Omit<SmartToast, "id">) {
  const toast: SmartToast = { id: uid(), durationMs: 3500, anchor: "decode", ...t };
  toasts = [...toasts, toast];
  emit();

  const duration = toast.durationMs ?? 3500;
  window.setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== toast.id);
    emit();
  }, duration);

  return toast.id;
}

export function removeToast(id: string) {
  toasts = toasts.filter((x) => x.id !== id);
  emit();
}
