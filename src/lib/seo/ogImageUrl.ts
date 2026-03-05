/**
 * OG Image URL Builder — Item #1
 * Generates dynamic OG image URLs via the og-image edge function.
 */

const OG_BASE = import.meta.env.VITE_SUPABASE_URL || '';
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';

/**
 * Build a dynamic OG image URL for any page.
 * Falls back to static og-default.jpg if env vars are missing.
 */
export function buildOgImageUrl(params: {
  title: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
}): string {
  if (!OG_BASE) {
    return 'https://cmpsbl.com/og-default.jpg';
  }

  const searchParams = new URLSearchParams({
    title: params.title.slice(0, 80),
    subtitle: (params.subtitle || 'Composable AI Infrastructure').slice(0, 120),
    theme: params.theme || 'dark',
  });

  return `${OG_BASE}/functions/v1/og-image?${searchParams.toString()}`;
}

/**
 * Get a section-specific OG image URL.
 * Uses pre-generated static images from /og/ folder, with dynamic fallback.
 */
export function getSectionOgImage(section: string): string {
  const SECTION_MAP: Record<string, string> = {
    home: '/og/home.jpg',
    substrate: '/og/substrate-os.jpg',
    store: '/og/store.jpg',
    developers: '/og/developers.jpg',
    pricing: '/og/pricing.jpg',
    blog: '/og/blog.jpg',
    about: '/og/about.jpg',
    documentation: '/og/documentation.jpg',
    modules: '/og/modules.jpg',
    solutions: '/og/solutions.jpg',
    investors: '/og/home.jpg',
    academy: '/og/documentation.jpg',
    cognitives: '/og/cognitives.jpg',
    memory: '/og/persistent-memory.jpg',
    decode: '/og/decode.jpg',
    dream: '/og/dream-feeder.jpg',
    proof: '/og/proof.jpg',
    gaming: '/og/gaming.jpg',
    architecture: '/og/architecture.jpg',
    evolution: '/og/evolution.jpg',
    explore: '/og/substrate-os.jpg',
    enterprise: '/og/solutions.jpg',
    runtime: '/og/architecture.jpg',
    foundations: '/og/substrate-os.jpg',
    status: '/og/modules.jpg',
    careers: '/og/about.jpg',
    packs: '/og/store.jpg',
    upgrade: '/og/pricing.jpg',
  };

  const path = SECTION_MAP[section];
  return path ? `https://cmpsbl.com${path}` : 'https://cmpsbl.com/og-default.jpg';
}
