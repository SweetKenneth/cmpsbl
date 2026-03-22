/**
 * Mobile Navigation Bar 2026
 * Bottom tab bar for mobile portal navigation
 */

import { MessageSquare, ListTodo, Users2, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeTaskCount?: number;
  isOwner: boolean;
  className?: string;
}

const tabs = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'team', label: 'Team', icon: Users2 },
  { id: 'telemetry', label: 'Stats', icon: BarChart3, ownerOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, ownerOnly: true },
];

export function MobileNavBar({ 
  activeTab, 
  onTabChange, 
  activeTaskCount = 0,
  isOwner,
  className,
}: MobileNavBarProps) {
  const visibleTabs = tabs.filter(tab => !tab.ownerOnly || isOwner);

  return (
    <nav className={cn(
      "lg:hidden fixed bottom-0 left-0 right-0 z-50",
      "border-t border-border bg-card",
      "safe-area-pb",
      className
    )}>
      <div className="flex items-stretch justify-around h-16">
        {visibleTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const showBadge = tab.id === 'tasks' && activeTaskCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 relative",
                "transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-amber text-[9px] flex items-center justify-center text-black font-bold">
                    {activeTaskCount > 9 ? '9+' : activeTaskCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
