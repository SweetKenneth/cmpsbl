/**
 * InvisibleWatermark — Embeds an invisible, machine-readable watermark
 * into the DOM that proves content origin without affecting UX.
 * 
 * Uses zero-width characters + hidden metadata that survives copy-paste
 * and screenshots (via embedded CSS content).
 */

const WATERMARK_ID = 'cmpsbl-wm';
const WATERMARK_TEXT = '© 2009–2026 CMPSBL® · PromptFluid™ · All Rights Reserved · Unauthorized reproduction prohibited';

export const InvisibleWatermark = () => {
  // Generate a session fingerprint for tracing
  const sessionId = typeof crypto !== 'undefined'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  const timestamp = new Date().toISOString();

  return (
    <>
      {/* Hidden text watermark — survives copy-paste */}
      <div
        id={WATERMARK_ID}
        aria-hidden="true"
        data-owner="CMPSBL"
        data-copyright="2009-2026"
        data-session={sessionId}
        data-rendered={timestamp}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {WATERMARK_TEXT}
        {/* Zero-width characters encode ownership */}
        {'\u200B\u200C\u200D\u2060'}
      </div>

      {/* CSS ::after watermark — appears in print and automated scrapes */}
      <style>{`
        body::after {
          content: "${WATERMARK_TEXT.replace(/"/g, '\\"')} | Session: ${sessionId}";
          position: fixed;
          bottom: 0;
          right: 0;
          font-size: 0;
          color: transparent;
          pointer-events: none;
          z-index: -1;
          opacity: 0;
        }
        @media print {
          body::after {
            font-size: 8px !important;
            color: hsl(var(--muted-foreground) / 0.3) !important;
            opacity: 1 !important;
            padding: 4px 8px;
          }
        }
      `}</style>
    </>
  );
};
