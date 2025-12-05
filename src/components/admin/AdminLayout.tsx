import { ReactNode } from "react";
import { UnifiedAdminSidebar } from "./UnifiedAdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminErrorBoundary } from "./ErrorBoundary";
import { useKeyboardShortcuts } from "./ui/KeyboardShortcuts";
import { useAdminAnalytics } from "@/hooks/admin/useAdminAnalytics";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useKeyboardShortcuts(true);
  useAdminAnalytics();

  return (
    <AdminErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-background/95">
          {/* Neural ambient background */}
          <div className="fixed inset-0 pointer-events-none opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <UnifiedAdminSidebar />

          <div className="flex-1 flex flex-col relative">
            <AdminHeader />

            <main className="flex-1 overflow-auto">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in-up">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminErrorBoundary>
  );
}
