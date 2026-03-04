import { ReactNode } from "react";
import "@/styles/admin/design-tokens.css";
import "@/styles/admin/animations.css";
import { UnifiedAdminSidebar } from "./UnifiedAdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AdminErrorBoundary } from "./ErrorBoundary";
import { useKeyboardShortcuts } from "./ui/KeyboardShortcuts";
import { useAdminAnalytics } from "@/hooks/admin/useAdminAnalytics";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubstrateParticles } from "@/components/ui/SubstrateParticles";

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  useSwipeGesture({
    onSwipeRight: () => setOpenMobile(true),
    onSwipeLeft: () => setOpenMobile(false),
    enabled: isMobile,
  });

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-background/95">
      {/* Substrate particle field — hidden on mobile for perf */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <SubstrateParticles
            count={30}
            color="var(--primary)"
            accent="var(--neon-cyan)"
            speed={0.6}
            glow
          />
          {/* Substrate grid overlay */}
          <div className="absolute inset-0 substrate-grid-bg opacity-50" />
        </div>
      )}

      {/* Ambient glow orbs — hidden on mobile for perf */}
      <div className="fixed inset-0 pointer-events-none opacity-20 hidden md:block z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-memory-drift" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-memory-drift"
          style={{ 
            background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.15), transparent)",
            animationDelay: "2s" 
          }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl animate-memory-drift"
          style={{ 
            background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.1), transparent)",
            animationDelay: "4s" 
          }}
        />
      </div>

      <UnifiedAdminSidebar />

      <div className="flex-1 flex flex-col relative min-w-0 z-10">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useKeyboardShortcuts(true);
  useAdminAnalytics();

  return (
    <AdminErrorBoundary>
      <SidebarProvider defaultOpen={false}>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </SidebarProvider>
    </AdminErrorBoundary>
  );
}
