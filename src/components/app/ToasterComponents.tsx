/**
 * Lazy-loaded toaster components to reduce initial bundle size
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const ToasterComponents = () => (
  <>
    <Toaster />
    <Sonner />
  </>
);

export default ToasterComponents;
