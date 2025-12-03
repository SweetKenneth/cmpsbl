import { Bell, Search, LogOut, Sun, Moon, Laptop, Menu, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
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
      
      {/* PromptFluid text for mobile */}
      <div className="lg:hidden flex items-center">
        <span className="text-xl font-bold glow-text">PromptFluid</span>
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
          className="hidden lg:flex gap-2"
          onClick={() => window.location.href = '/system-map'}
        >
          <Map className="w-4 h-4" />
          Feature Map
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted/50 transition-colors h-9 w-9"
            >
              {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="w-4 h-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="w-4 h-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Laptop className="w-4 h-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
