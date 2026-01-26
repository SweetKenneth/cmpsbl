/**
 * Dynamic Template Name Generator
 * Generates evocative, powerful names for templates based on category and difficulty
 * Names like "Unforgiving Dream Walker", "Driftless Defense", "Cooking Impressionist"
 */

// Adjective pools by rarity/difficulty
const MYTHIC_ADJECTIVES = [
  'Unforgiving', 'Eternal', 'Transcendent', 'Sovereign', 'Absolute', 'Omega', 
  'Apex', 'Celestial', 'Primordial', 'Infinite', 'Unstoppable', 'Legendary'
];

const EPIC_ADJECTIVES = [
  'Relentless', 'Radiant', 'Phantom', 'Obsidian', 'Crimson', 'Void',
  'Storm', 'Shadow', 'Iron', 'Crystal', 'Ancient', 'Mystic'
];

const RARE_ADJECTIVES = [
  'Swift', 'Silent', 'Bright', 'Deep', 'Wild', 'Noble',
  'Bold', 'Pure', 'Keen', 'True', 'Wise', 'Sharp'
];

const COMMON_ADJECTIVES = [
  'Quick', 'Smart', 'Core', 'Basic', 'Essential', 'Simple',
  'Clean', 'Light', 'Fresh', 'Solid', 'Steady', 'Ready'
];

// Noun pools by category
const CATEGORY_NOUNS: Record<string, string[]> = {
  brain: [
    'Mind', 'Cortex', 'Synapse', 'Memory', 'Cognition', 'Intellect',
    'Oracle', 'Sage', 'Scholar', 'Architect', 'Keeper', 'Weaver'
  ],
  decode: [
    'Whisperer', 'Interpreter', 'Decoder', 'Linguist', 'Parser', 'Translator',
    'Cipher', 'Channel', 'Voice', 'Herald', 'Messenger', 'Bridge'
  ],
  defense: [
    'Guardian', 'Sentinel', 'Shield', 'Fortress', 'Bastion', 'Aegis',
    'Warden', 'Protector', 'Bulwark', 'Vanguard', 'Barrier', 'Armor'
  ],
  nexus: [
    'Conduit', 'Router', 'Nexus', 'Hub', 'Core', 'Pulse',
    'Beacon', 'Anchor', 'Catalyst', 'Forge', 'Link', 'Relay'
  ],
  vision: [
    'Seer', 'Observer', 'Watcher', 'Eye', 'Lens', 'Mirror',
    'Scope', 'Tracker', 'Scout', 'Monitor', 'Beacon', 'Lighthouse'
  ],
  dream: [
    'Walker', 'Dreamer', 'Weaver', 'Sleeper', 'Wanderer', 'Voyager',
    'Drifter', 'Phantom', 'Spirit', 'Ghost', 'Shadow', 'Echo'
  ],
  system: [
    'Engine', 'Core', 'Matrix', 'Grid', 'Network', 'Framework',
    'Foundation', 'Backbone', 'Infrastructure', 'Platform', 'System', 'Machine'
  ],
  world_engine: [
    'Architect', 'Builder', 'Creator', 'Shaper', 'Former', 'Mason',
    'Sculptor', 'Designer', 'Craftsman', 'Constructor', 'Maker', 'Fabricator'
  ],
};

// Suffix modifiers for extra flair
const EPIC_SUFFIXES = [
  'of the Void', 'Prime', 'Ascended', 'Reborn', 'Unleashed', 'Eternal',
  'Supreme', 'Omega', 'Alpha', 'Ultimate', 'Absolute', 'Infinite'
];

const RARE_SUFFIXES = [
  'Elite', 'Pro', 'Plus', 'X', 'Max', 'Ultra', 'Advanced', 'Enhanced'
];

// Rarity configuration
export type TemplateRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface RarityConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}

export const RARITY_CONFIG: Record<TemplateRarity, RarityConfig> = {
  common: {
    label: 'Common',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/15',
    borderColor: 'border-slate-500/30',
    glowColor: 'shadow-slate-500/20',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-amber-400',
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/30',
  },
  mythic: {
    label: 'Mythic',
    color: 'text-rose-400',
    bgColor: 'bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-cyan-500/20',
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/40',
  },
};

// Map difficulty to rarity
export function difficultyToRarity(difficulty: string): TemplateRarity {
  switch (difficulty) {
    case 'beginner':
      return 'common';
    case 'intermediate':
      return 'uncommon';
    case 'advanced':
      return 'rare';
    case 'premium':
      return 'epic';
    case 'elite':
      return 'legendary';
    case 'pro':
      return 'mythic';
    default:
      return 'common';
  }
}

// Deterministic hash function for consistent name generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate evocative display name for a template
export function generateDisplayName(
  templateId: string,
  category: string,
  difficulty: string
): string {
  const rarity = difficultyToRarity(difficulty);
  const hash = hashString(templateId);
  
  // Select adjectives based on rarity
  let adjectives: string[];
  switch (rarity) {
    case 'mythic':
      adjectives = MYTHIC_ADJECTIVES;
      break;
    case 'legendary':
      adjectives = EPIC_ADJECTIVES;
      break;
    case 'epic':
      adjectives = EPIC_ADJECTIVES;
      break;
    case 'rare':
      adjectives = RARE_ADJECTIVES;
      break;
    default:
      adjectives = COMMON_ADJECTIVES;
  }
  
  // Get nouns for category
  const nouns = CATEGORY_NOUNS[category] || CATEGORY_NOUNS.brain;
  
  // Select deterministically based on hash
  const adjective = adjectives[hash % adjectives.length];
  const noun = nouns[(hash >> 8) % nouns.length];
  
  // Add suffix for higher rarities
  let suffix = '';
  if (rarity === 'mythic') {
    suffix = ' ' + EPIC_SUFFIXES[(hash >> 16) % EPIC_SUFFIXES.length];
  } else if (rarity === 'legendary') {
    suffix = ' ' + RARE_SUFFIXES[(hash >> 16) % RARE_SUFFIXES.length];
  }
  
  return `${adjective} ${noun}${suffix}`;
}

// Get rarity badge props for a template
export function getRarityBadge(difficulty: string): RarityConfig & { rarity: TemplateRarity } {
  const rarity = difficultyToRarity(difficulty);
  return {
    rarity,
    ...RARITY_CONFIG[rarity],
  };
}
