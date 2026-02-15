/**
 * Editor/Preview Environment Detection
 *
 * Used to disable heavy initialization/animations inside the embedded preview iframe,
 * where browsers (especially mobile Safari) can be more crash-prone.
 */

export function isEditorPreviewEnv(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const qs = new URLSearchParams(window.location.search);
    const host = window.location.hostname;

    let isEmbedded = false;
    try {
      isEmbedded = window.self !== window.top;
    } catch {
      isEmbedded = true;
    }

    return (
      qs.has('__lovable_token') || qs.has('__preview_token') ||
      host.includes('lovableproject.com') || host.includes('preview.') ||
      host.startsWith('id-preview--') ||
      isEmbedded
    );
  } catch {
    return false;
  }
}
