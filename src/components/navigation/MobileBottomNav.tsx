/**
 * MobileBottomNav — Fixed bottom tab bar for the 5 most critical destinations.
 * Visible only on mobile (<lg) on public-facing routes.
 * All links preserved — this is additive, not replacing any navigation.
 */

import { Link, useLocation } from "react-router-dom";
import { Home, Layers, Zap, BookOpen, User, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MobileCommandPalette } from "./MobileCommandPalette";

const TABS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Modules", href: "/modules", icon: Layers },
  { name: "Search", href: "__search__", icon: Search },
  { name: "Docs", href: "/documentation", icon: BookOpen },
  { name: "Account", href: "/auth", icon: User, authHref: "/os" },
] as const;

// Routes where bottom nav should be hidden (admin, dashboard, embedded views)
const HIDDEN_PREFIXES = ["/admin", "/os", "/brain", "/cascade-admin"];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  // Hide on admin/dashboard routes and in desktop
  const shouldHide = HIDDEN_PREFIXES.some(p => location.pathname.startsWith(p));
  if (shouldHide) return null;

  return (
    <>
      <MobileCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      
      <nav
        className="fixed bottom-0 left-0 right-0 z-[9990] lg:hidden border-t border-border bg-background/95 backdrop-blur-md safe-area-inset"
        role="navigation"
        aria-label="Quick navigation"
      >
        <div className="flex items-center justify-around h-14 px-1">
          {TABS.map((tab) => {
            const href = tab.name === "Account" && user ? (tab as any).authHref : tab.href;
            const isSearch = href === "__search__";
            const isActive = !isSearch && location.pathname === href;

            if (isSearch) {
              return (
                <button
                  key="search"
                  onClick={() => setCommandOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors touch-manipulation text-muted-foreground active:text-primary"
                  aria-label="Search and navigate"
                >
                  <Search className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Search</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.name}
                to={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors touch-manipulation min-w-[52px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-primary"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.name === "Account" && user ? "Dashboard" : tab.name}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer so page content isn't hidden behind the nav */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
