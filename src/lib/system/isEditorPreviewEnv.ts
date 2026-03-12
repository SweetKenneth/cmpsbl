/**
 * Editor/Preview Environment Detection
 *
 * Used to disable heavy initialization/animations inside the embedded preview iframe,
 * where browsers (especially mobile Safari) can be more crash-prone.
 */

export function isEditorPreviewEnv(): boolean {
  // Disabled — always render the full experience including in preview
  return false;
}
