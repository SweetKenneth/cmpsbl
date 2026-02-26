import { useEffect, useRef, useState } from 'react';

export default function ClearCache() {
  const [status, setStatus] = useState<'clearing' | 'done'>('clearing');
  const ran = useRef(false);
  const redirecting = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // Clear localStorage
      try { localStorage.clear(); } catch { /* Storage API unavailable */ }
      // Clear sessionStorage  
      try { sessionStorage.clear(); } catch { /* Storage API unavailable */ }

      // Clear service worker caches
      try {
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
        }
      } catch { /* Cache API unavailable */ }

      // Unregister service workers
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
      } catch { /* SW API unavailable */ }

      setStatus('done');

      // Redirect — guard against double-fire
      if (!redirecting.current) {
        redirecting.current = true;
        // Use assign instead of replace so the browser actually navigates
        // Use a short delay so the user sees the "done" state
        setTimeout(() => {
          window.location.href = '/';
        }, 600);
      }
    })();
  }, []);

  // Fallback: if we're still here after 4 seconds, force redirect
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!redirecting.current) {
        redirecting.current = true;
      }
      window.location.href = '/';
    }, 4000);
    return () => clearTimeout(fallback);
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
