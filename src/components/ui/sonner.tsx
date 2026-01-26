import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Position toasts at top-right on mobile to avoid bottom nav bar
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <Sonner
      theme="dark"
      position={isMobile ? "top-right" : "bottom-right"}
      offset={isMobile ? "80px" : "16px"}
      style={{
        position: 'fixed',
        ...(isMobile ? { top: '5rem', right: '1rem' } : { bottom: '1rem', right: '1rem' }),
        zIndex: 999999,
      }}
      richColors
      closeButton
      expand
      visibleToasts={5}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:border-primary/20 !pointer-events-auto",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        duration: 8000,
        style: {
          position: 'relative',
          pointerEvents: 'auto',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
