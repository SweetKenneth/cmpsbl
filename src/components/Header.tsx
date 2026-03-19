import { useState } from "react";
import { Bell, Search, LogOut, Menu, Map, Home, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useArtifactSlots } from "@/hooks/useArtifactSlots";
import { useEngineSubscription } from "@/hooks/useEngineSubscription";
import { SlotCapacityIndicator } from "@/components/slots/SlotCapacityIndicator";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth();
  const { tier } = useEngineSubscription();
  const slotState = useArtifactSlots(tier);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <header className="glass border-b border-border/50">
      <div className="h-14 lg:h-16 px-4 lg:px-6 flex items-center justify-between">
        {/* Mobile hamburger menu — 44px touch target */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-11 w-11 min-h-[44px] min-w-[44px]"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* CMPSBL text for mobile */}
        <div className="lg:hidden flex items-center gap-2">
          <span className="text-xl font-bold glow-text">CMPSBL</span>
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">Composable AI</span>
        </div>

        <div className="hidden lg:flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search systems, docs, pages…  ⌘K"
              className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
              readOnly
              onClick={() => {
                // Dispatch ⌘K to open the command palette
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
              }}
              onFocus={(e) => e.target.blur()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Mobile search toggle — 44px touch target */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-11 w-11 min-h-[44px] min-w-[44px]"
            onClick={() => setMobileSearchOpen(v => !v)}
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
          >
            {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2 min-h-[44px]"
            asChild
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              <span className="hidden lg:inline">Home</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2 min-h-[44px]"
            asChild
          >
            <Link to="/showcase">
              <Crown className="w-4 h-4" />
              <span className="hidden lg:inline">Cognitive Showcase</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex gap-2 min-h-[44px]"
            onClick={() => navigate('/ai-operating-system')}
          >
            <Map className="w-4 h-4" />
            How It Works
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted/50 transition-colors h-11 w-11 min-h-[44px] min-w-[44px]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>

          {user && slotState.activeCount > 0 && (
            <SlotCapacityIndicator slotState={slotState} variant="compact" className="hidden lg:flex" />
          )}

          <div className="hidden lg:block w-px h-6 bg-border/50" />

          {user && (
            <>
              <span className="hidden lg:block text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={signOut} className="h-11 w-11 min-h-[44px] min-w-[44px]" aria-label="Sign out">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search bar — slides down when toggled */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search systems, docs, pages..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
      )}

      {/* Breadcrumb — contextual wayfinding below the header */}
      <div className="px-4 lg:px-6 py-1.5 border-t border-border/20">
        <PublicBreadcrumb />
      </div>
    </header>
  );
}
