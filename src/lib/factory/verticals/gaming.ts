/**
 * CMPSBL® Gaming Vertical Substrate
 * 
 * Subdomain: gaming.cmpsbl.com
 *
 * Hot-swapped Engines (8):
 *   QUEST     — Quest/mission generation and narrative branching
 *   NPC       — Non-player character behavior, dialogue, and personality systems
 *   ARENA     — Matchmaking, ranking, and competitive balance
 *   LOOT      — Economy design, drop tables, and reward systems
 *   WORLD     — Procedural world generation and environment design
 *   PHYSICS   — Game physics simulation and collision optimization
 *   RENDER_G  — Graphics pipeline optimization and LOD management
 *   AUDIO_G   — Spatial audio, dynamic music, and sound effect systems
 *
 * Hot-swapped Agents (8):
 *   DIRECTOR  — Dynamic difficulty adjustment and pacing control
 *   GUARDIAN_G— Anti-cheat detection and exploit mitigation
 *   SOCIAL    — Player social systems, guilds, and communication
 *   ANALYST_G — Player behavior analytics and retention prediction
 *   TESTER    — Automated QA, regression testing, and bug detection
 *   MODDER    — Mod support, workshop integration, and UGC validation
 *   STREAMER  — Streaming integration, clip generation, and spectator tools
 *   ECONOMY_G — Virtual economy balancing, inflation control, and market monitoring
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { assembleVerticalPrimitives } from '../vertical-substrate';
import { GAMING_CROWN_JEWELS, getGamingJewelsByPrimitive, getGamingJewelSummary } from '@/crownjewels/gaming-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

const GAMING_ENGINES: VerticalPrimitive[] = [
  { id: 'QUEST', name: 'QUEST', role: 'engine', description: 'Quest generation and narrative branching engine. Creates dynamic missions, story arcs, objective chains, and consequence trees with player-choice adaptation.', inherited: false, replaces: 'CORTEX', capabilities: ['quest_generation', 'narrative_branching', 'objective_chaining', 'consequence_trees', 'story_arc_management', 'player_choice_adaptation', 'lore_consistency'], weight: 0.035, classification: 'active' },
  { id: 'NPC', name: 'NPC', role: 'engine', description: 'NPC behavior and dialogue system engine. Powers AI companions, enemy behavior, conversation trees, personality systems, and memory-driven NPC interactions.', inherited: false, replaces: 'ARCHITECT', capabilities: ['behavior_trees', 'dialogue_generation', 'personality_modeling', 'memory_persistence', 'emotion_simulation', 'relationship_tracking', 'faction_dynamics'], weight: 0.030, classification: 'active' },
  { id: 'ARENA', name: 'ARENA', role: 'engine', description: 'Matchmaking and competitive balance engine. Handles ELO/MMR systems, team balancing, tournament brackets, leaderboards, and skill-based matchmaking.', inherited: false, capabilities: ['elo_mmr_system', 'team_balancing', 'tournament_brackets', 'leaderboard_management', 'skill_matching', 'latency_optimization', 'rank_calibration'], weight: 0.030, classification: 'active' },
  { id: 'LOOT', name: 'LOOT', role: 'engine', description: 'Economy design and reward system engine. Manages drop tables, loot distribution, crafting recipes, progression curves, and reward psychology.', inherited: false, capabilities: ['drop_table_design', 'loot_distribution', 'crafting_systems', 'progression_curves', 'reward_scheduling', 'rarity_balancing', 'economy_modeling'], weight: 0.025, classification: 'active' },
  { id: 'WORLD', name: 'WORLD', role: 'engine', description: 'Procedural world generation and environment design engine. Creates terrain, biomes, dungeons, cities, and points of interest with coherent world-building rules.', inherited: false, capabilities: ['terrain_generation', 'biome_design', 'dungeon_generation', 'city_planning', 'poi_placement', 'weather_systems', 'day_night_cycles'], weight: 0.025, classification: 'active' },
  { id: 'PHYSICS_G', name: 'PHYSICS', role: 'engine', description: 'Game physics simulation and collision optimization engine. Handles rigid body dynamics, ragdoll physics, particle systems, and deterministic netcode physics.', inherited: false, capabilities: ['rigid_body_dynamics', 'collision_detection', 'ragdoll_physics', 'particle_systems', 'deterministic_physics', 'soft_body_simulation', 'fluid_dynamics'], weight: 0.020, classification: 'active' },
  { id: 'RENDER_G', name: 'RENDER', role: 'engine', description: 'Graphics pipeline optimization and LOD management engine. Manages draw calls, shader optimization, level-of-detail transitions, and performance budgeting.', inherited: false, capabilities: ['draw_call_optimization', 'shader_management', 'lod_transitions', 'occlusion_culling', 'texture_streaming', 'performance_budgeting', 'frame_pacing'], weight: 0.020, classification: 'active' },
  { id: 'AUDIO_G', name: 'AUDIO', role: 'engine', description: 'Spatial audio and dynamic music engine. Powers 3D sound positioning, adaptive soundtrack systems, ambient soundscapes, and voice chat processing.', inherited: false, capabilities: ['spatial_audio', 'dynamic_soundtrack', 'ambient_soundscapes', 'voice_processing', 'sound_propagation', 'music_layering', 'audio_occlusion'], weight: 0.015, classification: 'active' },
];

const GAMING_AGENTS: VerticalPrimitive[] = [
  { id: 'DIRECTOR', name: 'DIRECTOR', role: 'agent', description: 'Dynamic difficulty adjustment and pacing control agent. Monitors player skill, adjusts challenge in real-time, and optimizes flow state maintenance.', inherited: false, capabilities: ['difficulty_adjustment', 'pacing_control', 'flow_state_optimization', 'frustration_detection', 'challenge_scaling', 'tutorial_adaptation'], weight: 0.025, classification: 'active' },
  { id: 'GUARDIAN_G', name: 'GUARDIAN', role: 'agent', description: 'Anti-cheat detection and exploit mitigation agent. Detects aimbots, wallhacks, speed hacks, economy exploits, and unauthorized modifications.', inherited: false, capabilities: ['cheat_detection', 'exploit_mitigation', 'behavior_analysis', 'replay_validation', 'ban_management', 'report_processing'], weight: 0.025, classification: 'passive' },
  { id: 'SOCIAL_G', name: 'SOCIAL', role: 'agent', description: 'Player social systems and community management agent. Manages guilds, friend lists, chat moderation, LFG systems, and social features.', inherited: false, capabilities: ['guild_management', 'friend_systems', 'chat_moderation', 'lfg_matchmaking', 'community_events', 'toxicity_detection'], weight: 0.025, classification: 'active' },
  { id: 'ANALYST_G', name: 'ANALYST', role: 'agent', description: 'Player behavior analytics and retention prediction agent. Tracks engagement patterns, predicts churn, identifies monetization opportunities, and measures feature impact.', inherited: false, capabilities: ['behavior_analytics', 'churn_prediction', 'engagement_tracking', 'monetization_analysis', 'feature_impact', 'cohort_analysis'], weight: 0.025, classification: 'passive' },
  { id: 'TESTER_G', name: 'TESTER', role: 'agent', description: 'Automated QA and regression testing agent. Runs automated playtests, detects visual bugs, validates balance changes, and ensures cross-platform consistency.', inherited: false, capabilities: ['automated_playtesting', 'regression_testing', 'visual_bug_detection', 'balance_validation', 'platform_testing', 'performance_profiling'], weight: 0.020, classification: 'active' },
  { id: 'MODDER', name: 'MODDER', role: 'agent', description: 'Mod support and user-generated content validation agent. Manages workshop integration, validates UGC safety, and curates community creations.', inherited: false, capabilities: ['mod_validation', 'workshop_integration', 'ugc_safety_check', 'content_curation', 'api_management', 'compatibility_check'], weight: 0.020, classification: 'passive' },
  { id: 'STREAMER', name: 'STREAMER', role: 'agent', description: 'Streaming integration and spectator tools agent. Generates highlight clips, manages spectator cameras, and integrates with streaming platforms.', inherited: false, capabilities: ['clip_generation', 'spectator_camera', 'stream_integration', 'overlay_management', 'audience_interaction', 'broadcast_optimization'], weight: 0.020, classification: 'active' },
  { id: 'ECONOMY_G', name: 'ECONOMY', role: 'agent', description: 'Virtual economy balancing and market monitoring agent. Controls inflation, monitors player-to-player trading, and ensures economic sustainability.', inherited: false, capabilities: ['inflation_control', 'market_monitoring', 'trade_validation', 'price_stabilization', 'sink_source_balancing', 'fraud_detection'], weight: 0.020, classification: 'passive' },
];

export function getGamingEngines(): VerticalPrimitive[] { return [...GAMING_ENGINES]; }
export function getGamingAgents(): VerticalPrimitive[] { return [...GAMING_AGENTS]; }
export function getGamingPrimitives(): VerticalPrimitive[] { return assembleVerticalPrimitives(GAMING_ENGINES, GAMING_AGENTS); }
export function getAllGamingCapabilities(): string[] { return [...GAMING_ENGINES, ...GAMING_AGENTS].flatMap(p => p.capabilities); }
export function getGamingCrownJewels(): STierEntry[] { return GAMING_CROWN_JEWELS; }
export function getGamingPrimitiveCrownJewels(primitiveId: string): STierEntry[] { return getGamingJewelsByPrimitive(primitiveId); }
export function getGamingCrownJewelSummary() { return getGamingJewelSummary(); }
export function getGamingCrownJewelCount(): number { return GAMING_CROWN_JEWELS.length; }
export function getGamingCrownJewelCapabilities(): string[] { return GAMING_CROWN_JEWELS.map(j => j.name); }

export function getGamingSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'gaming-v1',
    name: 'CMPSBL GAMING™',
    tagline: 'Cognitive Gaming Infrastructure — Worlds Build Themselves',
    domain: 'gaming',
    subdomain: 'gaming',
    url: 'https://gaming.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives: getGamingPrimitives(),
    clmCurriculum: { cyclesPerDay: 2400, curriculum: ['game_ai_patterns', 'procedural_generation', 'economy_balancing', 'player_engagement', 'anti_cheat_systems', 'matchmaking_optimization', 'content_generation', 'performance_tuning'], priorityPrimitives: ['QUEST', 'NPC', 'ARENA', 'WORLD'], batchSize: 4 },
    memoryStreamConfig: { cycleIntervalHours: 4, scannerFocus: ['quest_patterns', 'npc_behaviors', 'matchmaking_quality', 'economy_health', 'world_generation', 'physics_performance', 'audio_quality', 'player_retention'], contributesToGlobal: true, retentionDays: 365 },
    ascensionConfig: { maxCapabilities: 20, enhancementArchetypes: ['game_logic_hardening', 'anti_cheat_enforcement', 'economy_protection', 'performance_optimization', 'player_data_security'], cjpiWeights: { security: 0.20, performance: 0.35, reliability: 0.25, maintainability: 0.20 }, collisionPriority: ['QUEST', 'NPC', 'ARENA', 'LOOT', 'WORLD', 'DIRECTOR', 'GUARDIAN_G', 'ANALYST_G'] },
    theme: { primaryHue: 270, icon: 'Gamepad2', gradientAngle: 135, darkAccent: 'hsl(270 80% 60%)', lightAccent: 'hsl(270 65% 50%)' },
    createdAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-04-12T00:00:00.000Z',
  };
}
