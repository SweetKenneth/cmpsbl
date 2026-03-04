import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { RealtimeIndicator } from "./RealtimeIndicator";
import { CascadeStatusWidget } from "./CascadeStatusWidget";

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-border/50">
      {/* Memory Stream flowing accent bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar" />
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          <SidebarTrigger />
          
          <AdminBreadcrumb />
        </div>

        {/* Center Section - Cascade Status */}
        <div className="hidden xl:flex flex-1 justify-center">
          <CascadeStatusWidget />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Realtime Connection Indicator */}
          <RealtimeIndicator />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted/50" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-card border-border/50">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Badge variant="default" className="mt-0.5">New</Badge>
                    <div>
                      <p className="text-sm font-medium">System Update</p>
                      <p className="text-xs text-muted-foreground">Cascade brain synced successfully</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg hover:bg-muted/50">
                  <p className="text-sm">3 new user signups</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50" aria-label="User menu">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden lg:inline text-sm">{user?.email?.split("@")[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{user?.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
