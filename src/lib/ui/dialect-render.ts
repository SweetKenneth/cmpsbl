/**
 * Dialect Renderer — Display-Only Code Transformation
 * 
 * IMPORTANT: This is DISPLAY ONLY.
 * The raw executable code is NEVER modified.
 * Copy operations always return the original modern code.
 */

import { DisplayDialect } from './display-dialect';

/**
 * Render code in the selected display dialect.
 * This transforms how code LOOKS, not how it executes.
 */
export function renderDialect(code: string, dialect: DisplayDialect): string {
  if (dialect === 'modern') return code;

  // Extract key elements from the code for display transformation
  const intent = extractIntent(code);
  const module = extractModule(code);
  const action = extractAction(code);

  switch (dialect) {
    case 'lisp':
      return renderLisp(code, module, action, intent);

    case 'c':
      return renderC(code, module, action, intent);

    case 'smalltalk':
      return renderSmalltalk(code, module, action, intent);

    case 'hacker':
      return renderHacker(code, module, action, intent);

    default:
      return code;
  }
}

function renderLisp(code: string, module: string, action: string, intent: string): string {
  return `;;; CMPSBL® Substrate — ${module}.${action}
;;; Display dialect: Lisp/S-Expression

(defsubstrate pf-substrate
  (use-module '${module})
  
  (${module}
    (${action}
      :intent "${truncate(intent, 48)}"
      :context *current-memory*
      :confidence 0.95))
  
  (when (brain-available?)
    (consolidate-memories
      :tier 'hot
      :decay-rate 0.1))
  
  (defense
    (guard :mode 'active)
    (verify-context)))

;;; [DISPLAY ONLY — Execution uses modern JS/TS]`;
}

function renderC(code: string, module: string, action: string, intent: string): string {
  return `/* CMPSBL® Substrate — ${module}.${action}
 * Display dialect: C/Systems
 */

#include <substrate.h>
#include <${module}.h>

typedef struct {
    char* intent;
    float confidence;
    void* context;
} ${capitalize(module)}Result;

int main(void) {
    substrate_init();
    
    ${capitalize(module)}Result result = ${module}_${action}(
        "${truncate(intent, 40)}",
        CONTEXT_HOT_MEMORY,
        0.95f
    );
    
    if (result.confidence > THRESHOLD) {
        brain_consolidate(&result);
        defense_guard(GUARD_ACTIVE);
    }
    
    substrate_cleanup();
    return 0;
}

/* [DISPLAY ONLY — Execution uses modern JS/TS] */`;
}

function renderSmalltalk(code: string, module: string, action: string, intent: string): string {
  return `"CMPSBL® Substrate — ${module}.${action}"
"Display dialect: Smalltalk"

Substrate new
  module: #${module};
  action: #${action};
  intent: '${truncate(intent, 40)}';
  withContext: Memory hotTier;
  confidence: 0.95;
  yourself.

Brain available ifTrue: [
  Memory consolidate: #hot
    decayRate: 0.1.
  Defense guard: #active.
  Context verify
].

"[DISPLAY ONLY — Execution uses modern JS/TS]"`;
}

function renderHacker(code: string, module: string, action: string, intent: string): string {
  return `#!/bin/bash
# CMPSBL® Substrate — ${module}.${action}
# Display dialect: Hacker/Terminal

$ substrate init --mode=live

$ substrate ${module}.${action} \\
    --intent "${truncate(intent, 36)}" \\
    --context hot_memory \\
    --confidence 0.95 \\
    --output json

$ substrate brain.consolidate \\
    --tier hot \\
    --decay 0.1 \\
    --async

$ substrate defense.guard --mode active

# Status: ready
# [DISPLAY ONLY — Execution uses modern JS/TS]`;
}

// Helper functions

function truncate(text: string, maxLength: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength) + '…';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractIntent(code: string): string {
  // Try to find a string that looks like an intent/query
  const stringMatch = code.match(/["'`]([^"'`]{10,}?)["'`]/);
  if (stringMatch) return stringMatch[1];
  
  // Fallback: use first line or a generic description
  const firstLine = code.split('\n')[0];
  return firstLine.slice(0, 60) || 'substrate query';
}

function extractModule(code: string): string {
  // Look for common module patterns
  const moduleMatch = code.match(/substrate\.(\w+)\./i) || 
                      code.match(/["']module["']\s*:\s*["'](\w+)["']/i) ||
                      code.match(/\b(brain|vision|nexus|decode|dream|defense|core|ripple|access)\b/i);
  return moduleMatch ? moduleMatch[1].toLowerCase() : 'brain';
}

function extractAction(code: string): string {
  // Look for common action patterns
  const actionMatch = code.match(/\.(\w+)\s*\(/) ||
                      code.match(/["']action["']\s*:\s*["'](\w+)["']/i);
  return actionMatch ? actionMatch[1].toLowerCase() : 'query';
}
