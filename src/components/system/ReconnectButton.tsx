/**
 * System Reconnect Button
 * Triggers Supabase reconnection on demand
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { forceReconnect } from '@/lib/system/forceReconnect';
import { RefreshCw } from 'lucide-react';

export function ReconnectButton() {
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    toast.info('Reconnecting to backend...');
    
    try {
      const status = await forceReconnect();
      
      if (status.connected) {
        toast.success('Reconnected successfully!');
      } else {
        toast.error('Reconnection failed');
      }
    } catch (error) {
      toast.error('Reconnection error');
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <Button
      onClick={handleReconnect}
      disabled={isReconnecting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
      {isReconnecting ? 'Reconnecting...' : 'Reconnect Backend'}
    </Button>
  );
}
