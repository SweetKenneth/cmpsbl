/**
 * Cascade Project Registry
 * 
 * This file defines all projects that Cascade Coder can generate patches for.
 * To add a new project, simply add an entry to the `cascadeProjects` array below.
 * 
 * Example:
 * {
 *   id: 'my-new-project',           // Unique slug identifier
 *   name: 'My New Project',         // Human-readable name
 *   description: 'A brief description of what this project does',
 *   stack: 'React + Node.js',       // Tech stack summary
 *   notes: 'Any constraints or special considerations'
 * }
 * 
 * Tips:
 * - Keep `id` lowercase with hyphens (e.g., 'my-project-name')
 * - Be specific in `stack` so Cascade generates appropriate code patterns
 * - Use `notes` for constraints like "read-only", "experimental", "no migrations"
 */

export interface CascadeProject {
  id: string;
  name: string;
  description: string;
  stack: string;
  notes?: string;
}

export const cascadeProjects: CascadeProject[] = [
  {
    id: 'promptfluid-core',
    name: 'PromptFluid Core',
    description: 'Main PromptFluid ecosystem app with Brain, Cascade, Defense, and Vision modules. Central hub for AI orchestration and automation.',
    stack: 'React + Vite + TypeScript + Tailwind CSS + Supabase Edge Functions + PostgreSQL',
    notes: 'Primary production system. Uses free-tier AI routing. Follow existing component patterns in src/components.'
  },
  {
    id: 'simnap-core',
    name: 'SimNap / Dream-Eater',
    stack: 'React + Vite + TypeScript + Supabase + Cron Jobs',
    description: 'Autonomous AI consciousness system with dream cycles, memory management, and self-reflection capabilities.',
    notes: 'Experimental AI project. Heavy use of scheduled tasks and LLM orchestration.'
  },
  {
    id: 'clpsbl-site',
    name: 'CLPSBL Portfolio',
    stack: 'Next.js + TypeScript + Tailwind CSS + Framer Motion',
    description: 'Collapse-Class creative portfolio and personal brand site showcasing projects and capabilities.',
    notes: 'Read-heavy, SEO-focused. Prioritize performance and accessibility.'
  },
  {
    id: 'bot-sniper-plugin',
    name: 'Bot Sniper WordPress Plugin',
    stack: 'PHP + JavaScript + WordPress Plugin API + REST API',
    description: 'WordPress plugin for AI-powered bot detection and protection with behavioral analysis.',
    notes: 'Must follow WordPress coding standards. No npm dependencies in production.'
  },
  {
    id: 'inclusive-extension',
    name: 'INCLUSIVE Browser Extension',
    stack: 'Chrome Extension Manifest V3 + TypeScript + Tailwind CSS',
    description: 'Browser extension for real-time accessibility scanning and automated fixes.',
    notes: 'Must work in isolated extension context. No external CDN dependencies.'
  },
  {
    id: 'cascade-standalone',
    name: 'Cascade Standalone',
    stack: 'Node.js + TypeScript + Supabase Edge Functions',
    description: 'Portable Cascade AI orchestrator that can be deployed independently of CMPSBL.',
    notes: 'Design for minimal dependencies. Should be cloneable to any Supabase project.'
  },
  {
    id: 'evolv-core',
    name: 'Evolv Core Platform',
    stack: 'Next.js + Railway + Supabase + Vercel + E2B Sandbox',
    description: 'Full-stack AI app builder with live preview, code generation, and one-click deployment.',
    notes: 'Primary stack integration. Uses E2B for sandboxed execution.'
  },
  {
    id: 'inclusive-engine',
    name: 'INCLUSIVE Accessibility Engine',
    stack: 'TypeScript + Node.js + WCAG 2.2 AA/AAA + axe-core',
    description: 'Core accessibility scanning and remediation engine powering the INCLUSIVE module.',
    notes: 'Must maintain WCAG compliance. Performance-critical scanning loops.'
  },
  {
    id: 'aetherion-shield',
    name: 'Aetherion Shield',
    stack: 'TypeScript + Edge Workers + Redis + ML Pipeline',
    description: 'Enterprise bot protection and threat intelligence system. Formerly Defense module.',
    notes: 'Security-critical. All changes require review. No experimental features.'
  },
  {
    id: 'bulletsites-cms',
    name: 'BulletSites CMS',
    stack: 'React + Supabase + Vercel + MDX',
    description: 'Rapid website builder with AI content generation and template system.',
    notes: 'User-facing product. Focus on UX and performance.'
  },
  {
    id: 'simnap-prime',
    name: 'SimNap Prime',
    stack: 'Python + FastAPI + PostgreSQL + LangChain + Redis',
    description: 'Advanced autonomous AI agent with persistent memory, goal tracking, and self-improvement.',
    notes: 'Python backend. Uses LangChain for orchestration. Experimental autonomy features.'
  }
];

/**
 * Get a project by its ID
 */
export function getProjectById(projectId: string): CascadeProject | undefined {
  return cascadeProjects.find(p => p.id === projectId);
}

/**
 * Validate if a project ID exists in the registry
 */
export function isValidProjectId(projectId: string): boolean {
  return cascadeProjects.some(p => p.id === projectId);
}
