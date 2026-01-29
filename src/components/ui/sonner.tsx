import { Toaster as Sonner, toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Sonner
      theme="dark"
      // On mobile: center top for visibility regardless of scroll
      // On desktop: bottom-right as standard
      position={isMobile ? "top-center" : "bottom-right"}
      offset={isMobile ? 16 : 16}
      style={{
        position: 'fixed',
        zIndex: 999999,
      }}
      richColors
      closeButton
      expand
      visibleToasts={3}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:border-primary/20 !pointer-events-auto",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        duration: 6000,
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
