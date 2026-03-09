/**
 * Theme Registry — Centralized theming constants for the Memory Stream experience
 * 
 * This is the SINGLE SOURCE OF TRUTH for all visual and narrative theming.
 * To re-theme the entire site, modify this file and the branding constants in memory-stream.ts.
 * 
 * Usage:
 *   import { THEME } from '@/lib/branding/theme-registry';
 *   <div className={THEME.hero.gradient}>...</div>
 * 
 * Sections:
 *   1. NARRATIVE — Taglines, subtitles, identity copy
 *   2. VISUAL — Gradients, glows, borders, backgrounds
 *   3. ANIMATION — Motion presets for framer-motion
 *   4. TERMINAL — Boot screen, personality, prompt styling
 *   5. DASHBOARD — Panel headers, status indicators, KPI styling
 *   6. MARKETING — CTA copy, badge labels, section headers
 */

// ═══════════════════════════════════════════════════════════════
// 1. NARRATIVE — Core identity copy
// ═══════════════════════════════════════════════════════════════

export const NARRATIVE = {
  // Primary identity
  brandName: 'CMPSBL',
  brandMark: 'CMPSBL®',
  systemName: 'Memory Stream',
  tagline: 'Signal → Silicon',
  subtitle: 'The Memory Stream is a continuous substrate of evolving software systems.',
  
  // Architecture identity
  nodeCount: 38,
  sectorCount: 12,
  commandCount: '500+',
  capabilityCount: '675+',
  qualityFloor: 68,
  
  // Action verbs (the "vocabulary" of the theme)
  actions: {
    primary: 'Crystallize',      // Main action
    secondary: 'Materialize',    // Export/deploy action
    discover: 'Explore',         // Browse action
    create: 'Crystallize',       // Generate action
    evolve: 'Stream',            // Continuous improvement
  },
  
  // Tier names (ascending quality)
  tiers: ['Mint', 'Prime', 'Relic', 'Mythic', 'Apex'] as const,
  
  // What things are called
  terminology: {
    artifact: 'Crystallized Pipeline',
    artifacts: 'Crystallized Pipelines',
    module: 'System',             // NEVER use "module" publicly
    modules: 'Systems',
    pack: 'Pipeline Pack',
    packs: 'Pipeline Packs',
    slot: 'Pipeline Slot',
    slots: 'Pipeline Slots',
    foundry: 'Memory Stream',
    mining: 'Crystallization',
    crownJewel: 'Apex Discovery',
    workspace: 'Builder Workspace',
    dashboard: 'Command Center',
    terminal: 'Stream Terminal',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 2. VISUAL — Gradients, glows, and surface treatments
// ═══════════════════════════════════════════════════════════════

export const VISUAL = {
  // Hero section gradients
  hero: {
    titleGradient: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)), hsl(var(--neon-purple)))',
    subtitleGradient: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))',
    bgGradient: 'bg-gradient-to-br from-background via-background to-background/95',
  },
  
  // Stream lines (the flowing horizontal lines that appear across surfaces)
  streamLines: {
    color: 'via-primary/15',
    colorSubtle: 'via-primary/10',
    count: 4,
    animationDuration: [6, 7.5, 9, 10.5], // seconds per line
  },
  
  // Surface treatments
  surfaces: {
    glass: 'bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border/25 dark:border-border/15',
    glassDark: 'bg-card/50 dark:bg-card/20 backdrop-blur-xl border border-border/15 dark:border-border/10',
    panel: 'rounded-xl sm:rounded-2xl border border-border/25 dark:border-border/15 overflow-hidden',
    card: 'rounded-lg sm:rounded-xl border border-border/20 dark:border-border/10',
  },
  
  // Status colors
  status: {
    healthy: 'text-emerald-600 dark:text-emerald-400',
    degraded: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400',
    active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    inactive: 'bg-muted/20 text-muted-foreground/30 border-border/10',
  },
  
  // Tier visual treatments
  tierColors: {
    mint: { gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    prime: { gradient: 'from-blue-500 to-indigo-600', text: 'text-blue-500', bg: 'bg-blue-500/10' },
    relic: { gradient: 'from-amber-500 to-orange-600', text: 'text-amber-500', bg: 'bg-amber-500/10' },
    mythic: { gradient: 'from-purple-500 to-violet-600', text: 'text-purple-500', bg: 'bg-purple-500/10' },
    apex: { gradient: 'from-rose-500 to-red-600', text: 'text-rose-500', bg: 'bg-rose-500/10' },
  },
  
  // Ambient backgrounds
  ambient: {
    primaryGlow: 'bg-primary/20 rounded-full blur-3xl',
    secondaryGlow: 'bg-blue-500/20 rounded-full blur-3xl',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 3. ANIMATION — Framer Motion presets
// ═══════════════════════════════════════════════════════════════

export const ANIMATION = {
  // Standard page/section entrance
  fadeInUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  
  // Card entrance with stagger
  cardEntrance: (index: number, staggerDelay = 0.08) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.2 + index * staggerDelay },
  }),
  
  // Pulse ring (used around health indicators)
  pulseRing: {
    animate: { scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] },
    transition: { duration: 4, repeat: Infinity },
  },
  
  // Stream line flow
  streamFlow: (index: number) => ({
    animate: { x: ['-15%', '15%', '-15%'] },
    transition: { duration: 6 + index * 1.5, repeat: Infinity, ease: 'easeInOut' as const, delay: index * 0.5 },
  }),
  
  // Gradient text animation (CSS)
  gradientShiftCSS: {
    backgroundSize: '200% 200%',
    animation: 'gradientShift 4s ease-in-out infinite',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 4. TERMINAL — Stream Terminal theming
// ═══════════════════════════════════════════════════════════════

export const TERMINAL = {
  // Prompt prefixes by mode
  prompts: {
    default: 'stream://memory-terminal',
    biohack: 'stream://memory.crystallize',
    matrix: 'stream://matrix.topology',
  },
  
  // Boot header
  bootHeader: 'CMPSBL® MEMORY STREAM',
  bootSubtitle: '40-NODE MATRIX — Signal → Silicon',
  
  // Status messages
  messages: {
    ready: 'Memory Stream standing by...',
    processing: 'Sampling memory stream...',
    success: 'Crystallization complete.',
    error: 'Stream anomaly detected.',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 5. DASHBOARD — Command Center theming
// ═══════════════════════════════════════════════════════════════

export const DASHBOARD = {
  // Panel section headers
  sectionHeaders: {
    streamControls: { title: 'Stream Controls', subtitle: 'MEMORY STREAM · SIGNAL → SILICON' },
    sectorTopology: { title: 'Sector Topology', subtitle: '12 SECTORS · 38 NODES' },
    streamEvents: { title: 'Stream Events', subtitle: 'LIVE CRYSTALLIZATION FEED' },
    systemHealth: { title: 'System Health', subtitle: 'MATRIX INTEGRITY' },
    streamSecurity: { title: 'Stream Security', subtitle: 'PERIMETER · THREAT DETECTION' },
    streamIntegrity: { title: 'Stream Integrity', subtitle: 'BREAKER STATE · NODE HEALTH' },
    streamBudget: { title: 'Stream Budget', subtitle: 'COST GOVERNANCE' },
    streamOptimizer: { title: 'NEXUS Optimizer', subtitle: 'PROVIDER ROUTING' },
  },
  
  // KPI labels
  kpis: {
    status: 'Memory Stream Active',
    nodes: (active: number, total: number) => `${active}/${total}`,
    integrity: (pct: number) => `${pct}% integrity`,
    sectors: '38 nodes · Signal → Silicon',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 6. MARKETING — Public-facing copy
// ═══════════════════════════════════════════════════════════════

export const MARKETING = {
  // Home page section headers
  sections: {
    whySubstrate: { badge: '9 Systems', title: 'The Stream' },
    differentiation: { badge: 'What Makes This Different', title: 'Intelligence That Crystallizes' },
    packs: { badge: 'Pipeline Packs', title: 'Activate What You Need' },
    agents: { badge: '20 Sealed Black-Box Agents', title: 'Black-Boxed. Always Learning.' },
    useCases: { badge: 'What You Can Build', title: 'From Today To Tomorrow' },
    industry: { badge: 'Universal Infrastructure', title: 'One Substrate, Every Industry' },
    governance: { title: 'Every operation is governed, observable, and failure-aware' },
    evolution: { badge: 'EVOLUTION — Live', title: 'Your System Improves Itself' },
  },
  
  // CTA copy
  cta: {
    signUp: 'Start Free — 3 Slots',
    explore: 'Explore the Memory Stream',
    crystallize: 'Crystallize Pipeline',
    upgrade: 'Upgrade Your Stream',
    docs: 'Read the Docs',
    sdk: 'Not a vibe coder? Use SDK',
  },
  
  // Social proof / stats
  stats: {
    uptime: '99.97%',
    qualityFloor: '68+',
    nodes: '38',
    capabilities: '675+',
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// Combined export
// ═══════════════════════════════════════════════════════════════

export const THEME = {
  narrative: NARRATIVE,
  visual: VISUAL,
  animation: ANIMATION,
  terminal: TERMINAL,
  dashboard: DASHBOARD,
  marketing: MARKETING,
} as const;
