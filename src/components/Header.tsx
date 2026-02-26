import { Bell, Search, LogOut, Menu, Map, Home, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMetric } from "@/stores/publicMetricsStore";
import { useArtifactSlots } from "@/hooks/useArtifactSlots";
import { useEngineSubscription } from "@/hooks/useEngineSubscription";
import { SlotCapacityIndicator } from "@/components/slots/SlotCapacityIndicator";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth();
  const version = useMetric('version');
  const { tier } = useEngineSubscription();
  const slotState = useArtifactSlots(tier);
  
  return (
    <header className="h-14 lg:h-16 glass border-b border-border/50 px-4 lg:px-6 flex items-center justify-between">
      {/* Mobile hamburger menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>
      
      {/* CMPSBL text for mobile */}
      <div className="lg:hidden flex items-center gap-2">
        <span className="text-xl font-bold glow-text">CMPSBL</span>
        <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">substrate</span>
      </div>

      <div className="hidden lg:flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex gap-2"
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
          className="flex gap-2"
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
          className="hidden lg:flex gap-2"
          onClick={() => window.location.href = '/substrate'}
        >
          <Map className="w-4 h-4" />
          Substrate Overview
        </Button>
        

        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted/50 transition-colors h-9 w-9"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </Button>

        <div className="hidden lg:block w-px h-6 bg-border/50" />

        {user && (
          <>
            <span className="hidden lg:block text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-9 w-9">
              <LogOut className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
