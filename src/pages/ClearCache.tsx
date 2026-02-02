import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeFullFlush } from '@/lib/system/cacheFlush';
import { cacheManager } from '@/lib/system/cache';

export default function ClearCache() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'clearing' | 'done'>('clearing');

  useEffect(() => {
    const clearAll = async () => {
      // Clear in-memory cache
      cacheManager.invalidateAll();
      
      // Clear localStorage/sessionStorage via system flush
      await executeFullFlush();
      
      // Clear service worker caches
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      setStatus('done');
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    };
    
    clearAll();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'clearing' ? (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Clearing cache...</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 text-green-500 mx-auto">✓</div>
            <p className="text-foreground font-medium">Cache cleared!</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
