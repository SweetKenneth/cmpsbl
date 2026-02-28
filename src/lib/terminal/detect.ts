/**
 * Terminal Detection — Runtime check for terminal UI presence
 * 
 * The terminal is an optional component. Scans should skip terminal
 * command registration checks if no terminal is detected in the DOM.
 */

let _terminalDetected: boolean | null = null;

/**
 * Returns true if a terminal UI component has been mounted in the current session.
 * Returns false in SSR or if no terminal element is found.
 */
export function isTerminalPresent(): boolean {
  if (typeof document === 'undefined') return false;
  
  // Cache after first positive detection (terminal doesn't unmount mid-session typically)
  if (_terminalDetected === true) return true;
  
  // Look for the terminal container in the DOM
  const terminalEl = document.querySelector('[data-terminal-root]') 
    || document.querySelector('.enhanced-terminal')
    || document.querySelector('[data-testid="substrate-terminal"]');
  
  _terminalDetected = !!terminalEl;
  return _terminalDetected;
}

/**
 * Marks the terminal as detected (called by the terminal component on mount).
 * This avoids DOM scanning when the component self-registers.
 */
export function registerTerminalPresence(): void {
  _terminalDetected = true;
}

/**
 * Resets detection state (for testing).
 */
export function resetTerminalDetection(): void {
  _terminalDetected = null;
}
