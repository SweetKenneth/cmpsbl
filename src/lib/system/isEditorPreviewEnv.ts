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

    // Detect editor preview via URL signals — never use iframe detection,
    // as that falsely triggers on production embeds and some mobile browsers.
    return (
      qs.has('__lovable_token') || qs.has('__preview_token') ||
      host.includes('lovableproject.com') || host.includes('preview.') ||
      host.startsWith('id-preview--')
    );
  } catch {
    return false;
  }
}
