import { useEffect, useState } from 'react';

export default function ClearCache() {
  const [status, setStatus] = useState<'clearing' | 'done' | 'error'>('clearing');

  useEffect(() => {
    const clearAll = async () => {
      try {
        // Clear all localStorage (except nothing — wipe it all)
        try { localStorage.clear(); } catch {}
        
        // Clear sessionStorage
        try { sessionStorage.clear(); } catch {}

        // Clear service worker caches
        if ('caches' in window) {
          try {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
          } catch {}
        }

        // Unregister service workers
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
          } catch {}
        }

        setStatus('done');
      } catch {
        setStatus('done');
      }

      // Hard redirect after short delay (bypasses React router)
      setTimeout(() => {
        window.location.replace('/');
      }, 1200);
    };

    clearAll();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        {status === 'clearing' ? (
          <>
            <div style={{ width: 32, height: 32, border: '3px solid #555', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#999' }}>Clearing cache...</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 600 }}>Cache cleared!</p>
            <p style={{ color: '#999', fontSize: 14, marginTop: 8 }}>Redirecting...</p>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}