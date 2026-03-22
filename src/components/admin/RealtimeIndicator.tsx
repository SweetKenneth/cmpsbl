import { useRealtimeConnection } from "@/hooks/admin/useRealtimeConnection";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RealtimeIndicator() {
  const { status, reconnect } = useRealtimeConnection();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={reconnect}
            disabled={status.isReconnecting}
            aria-label={status.isReconnecting ? "Reconnecting to realtime" : status.isConnected ? "Realtime connected" : "Realtime disconnected — click to reconnect"}
            className={cn(
              "relative transition-all duration-300",
              status.isConnected ? "text-neon-green hover:text-neon-green" : "text-destructive hover:text-destructive",
              status.isReconnecting && "animate-pulse cursor-wait"
            )}
          >
            {status.isReconnecting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : status.isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            {status.isConnected && !status.isReconnecting && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">
              {status.isReconnecting ? "Reconnecting..." : status.isConnected ? "Connected" : "Disconnected"}
            </p>
            <p className="text-muted-foreground">
              {status.channels.length} active {status.channels.length === 1 ? 'channel' : 'channels'}
            </p>
            {status.lastPing && (
              <p className="text-muted-foreground">
                Last: {status.lastPing.toLocaleTimeString()}
              </p>
            )}
            {!status.isConnected && (
              <p className="text-xs text-neon-amber mt-2">
                Click to reconnect
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
