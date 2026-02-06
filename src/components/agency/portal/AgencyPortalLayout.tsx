/**
 * Agency Portal Layout 2026
 * Split-panel command center with glassmorphic surfaces
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AgencyPortalLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  header: ReactNode;
  className?: string;
}

export function AgencyPortalLayout({ sidebar, main, header, className }: AgencyPortalLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      "bg-gradient-to-br from-background via-background to-secondary/20",
      className
    )}>
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-ambient-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-magenta/5 rounded-full blur-[100px] animate-ambient-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50">
        {header}
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-r border-border/30 bg-card dark:bg-card/30 dark:backdrop-blur-xl">
          {sidebar}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {main}
        </main>
      </div>
    </div>
  );
}
