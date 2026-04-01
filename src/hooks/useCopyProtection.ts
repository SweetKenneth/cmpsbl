/**
 * useCopyProtection — Deters casual copying of site content.
 * Disables right-click context menu, text selection, and keyboard copy shortcuts.
 * Does NOT block dev tools (impossible to fully prevent).
 */

import { useEffect } from 'react';
import { isEditorPreviewEnv } from '@/lib/system/isEditorPreviewEnv';

export function useCopyProtection() {
  useEffect(() => {
    // Skip in editor preview so development isn't hindered
    if (isEditorPreviewEnv()) return;

    const preventContext = (e: MouseEvent) => {
      e.preventDefault();
    };

    const preventSelect = (e: Event) => {
      e.preventDefault();
    };

    const preventCopyKeys = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+U (view source), Ctrl+S (save), Ctrl+Shift+I (dev tools)
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'u', 's'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('selectstart', preventSelect);
    document.addEventListener('keydown', preventCopyKeys);

    // CSS-level selection prevention
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('keydown', preventCopyKeys);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, []);
}
