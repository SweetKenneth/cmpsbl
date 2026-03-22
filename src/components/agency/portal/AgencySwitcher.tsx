/**
 * Agency Switcher Component
 * Allows users to switch between multiple owned agencies
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Building2, Check, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserAgency } from '@/hooks/useUserAgency';

interface AgencySwitcherProps {
  agencies: UserAgency[];
  currentAgencyId: string;
  currentAgencyName: string;
  isOwner: boolean;
  className?: string;
}

export function AgencySwitcher({
  agencies,
  currentAgencyId,
  currentAgencyName,
  isOwner,
  className,
}: AgencySwitcherProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Don't render if only one agency or not owner
  if (!isOwner || agencies.length <= 1) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-sm truncate max-w-[150px]">{currentAgencyName}</span>
      </div>
    );
  }

  const handleSelect = (agency: UserAgency) => {
    if (agency.id === currentAgencyId) {
      setOpen(false);
      return;
    }
    
    if (agency.slug) {
      navigate(`/a/${agency.slug}`);
    } else {
      navigate(`/agency/${agency.id}`);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto py-1.5 px-2 gap-2 hover:bg-white/10",
            className
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-semibold text-sm truncate max-w-[120px]">
            {currentAgencyName}
          </span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary/80">
            {agencies.length}
          </Badge>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 bg-background/95 backdrop-blur-xl border-border/50"
      >
        <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
          Your Agencies
        </div>
        {agencies.map((agency) => (
          <DropdownMenuItem
            key={agency.id}
            onClick={() => handleSelect(agency)}
            className={cn(
              "flex items-center gap-3 py-2.5 cursor-pointer",
              agency.id === currentAgencyId && "bg-primary/10"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              agency.id === currentAgencyId
                ? "bg-primary/30 border border-primary/50"
                : "bg-white/5 border border-white/10"
            )}>
              <Building2 className={cn(
                "w-4 h-4",
                agency.id === currentAgencyId ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{agency.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {agency.slug ? `/a/${agency.slug}` : 'Not deployed'}
              </p>
            </div>
            {agency.id === currentAgencyId && (
              <Check className="w-4 h-4 text-primary shrink-0" />
            )}
            {agency.status === 'deployed' && agency.id !== currentAgencyId && (
              <Badge variant="outline" className="text-[9px] border-neon-green/30 text-neon-green shrink-0">
                LIVE
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/os')}
          className="flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-sm">Create New Agency</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
