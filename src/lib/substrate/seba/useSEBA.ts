/**
 * useSEBA Hook (Deprecated)
 * v1.1.0 — Redirects to consolidated hook
 * 
 * @deprecated Use `import { useSEBA } from '@/hooks/useSEBA'` instead
 */

// Re-export from consolidated hook location
export { 
  useSEBA, 
  useSEBAState,
  useSEBAConfig,
  useSEBACycle,
  useSEBAProposals,
  useSEBAEvolution,
  useSEBAHealth,
  useSEBACommand,
  type UseSEBAReturn,
} from '@/hooks/useSEBA';
