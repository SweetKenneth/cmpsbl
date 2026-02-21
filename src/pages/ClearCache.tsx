import { useEffect, useRef, useState } from 'react';

export default function ClearCache() {
  const [status, setStatus] = useState<'clearing' | 'done'>('clearing');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Defer clearing to next tick so the component renders first
    const timer = setTimeout(async () => {
      // Clear localStorage
      try { localStorage.clear(); } catch {}
      // Clear sessionStorage  
      try { sessionStorage.clear(); } catch {}

      // Clear service worker caches
      try {
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
        }
      } catch {}

      // Unregister service workers
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
      } catch {}

      setStatus('done');

      // Hard navigate after brief pause
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        {status === 'clearing' ? (
          <>
            <div style={{ width: 32, height: 32, border: '3px solid #555', borderTopColor: '#fff', borderRadius: '50%', animation: 'cc-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#999' }}>Clearing cache...</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 600 }}>Cache cleared!</p>
            <p style={{ color: '#999', fontSize: 14, marginTop: 8 }}>Redirecting...</p>
          </>
        )}
        <style>{`@keyframes cc-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
