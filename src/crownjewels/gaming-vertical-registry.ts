/**
 * CMPSBL GAMING™ — Vertical Crown Jewel Registry
 * 89 Architectural Crown Jewels: 5 per primitive (80) + 9 compound.
 * © CMPSBL® — All rights reserved.
 */
import type { STierEntry } from './types';

function cj(rank: number, id: string, name: string, cjpi: number, module: string, description: string, sig: string): STierEntry {
  return { rank, id, name, cjpi, module, type: 'Architecture', description, dependencyFootprint: [], exportMode: 'PureStandalone', signatureHash: sig, version: '1.0.0', approved: true, generatedAt: '2026-04-12T00:00:00.000Z', hasCode: true };
}

const QUEST_JEWELS: STierEntry[] = [
  cj(1,'gam-qst-1','Dynamic Quest Generator',98,'QUEST','Procedural quest creation with narrative coherence and player-choice branching.','sha256-gam-qst-1'),
  cj(2,'gam-qst-2','Story Arc Manager',96,'QUEST','Multi-chapter story arc management with consequence tracking.','sha256-gam-qst-2'),
  cj(3,'gam-qst-3','Objective Chain Builder',95,'QUEST','Linked objective sequences with failure/success branching.','sha256-gam-qst-3'),
  cj(4,'gam-qst-4','Lore Consistency Engine',94,'QUEST','World lore validation ensuring narrative coherence across quests.','sha256-gam-qst-4'),
  cj(5,'gam-qst-5','Consequence Tree Evaluator',93,'QUEST','Player decision impact modeling with long-term consequence tracking.','sha256-gam-qst-5'),
];
const NPC_JEWELS: STierEntry[] = [
  cj(6,'gam-npc-1','Behavior Tree Orchestrator',97,'NPC','Complex NPC behavior tree execution with state persistence.','sha256-gam-npc-1'),
  cj(7,'gam-npc-2','Dialogue Generation Engine',96,'NPC','Context-aware NPC dialogue with personality and relationship awareness.','sha256-gam-npc-2'),
  cj(8,'gam-npc-3','Personality Modeler',95,'NPC','Persistent NPC personality systems with trait-driven behavior.','sha256-gam-npc-3'),
  cj(9,'gam-npc-4','Memory Persistence Layer',94,'NPC','NPC memory of player actions with relationship evolution.','sha256-gam-npc-4'),
  cj(10,'gam-npc-5','Faction Dynamics Engine',93,'NPC','Inter-faction relationship modeling with reputation propagation.','sha256-gam-npc-5'),
];
const ARENA_JEWELS: STierEntry[] = [
  cj(11,'gam-arn-1','MMR/ELO System',97,'ARENA','Skill-based rating with confidence intervals and decay.','sha256-gam-arn-1'),
  cj(12,'gam-arn-2','Team Balance Optimizer',96,'ARENA','Multi-factor team balancing with role and skill distribution.','sha256-gam-arn-2'),
  cj(13,'gam-arn-3','Tournament Bracket Generator',95,'ARENA','Dynamic bracket generation with seeding and bye management.','sha256-gam-arn-3'),
  cj(14,'gam-arn-4','Leaderboard Engine',94,'ARENA','Scalable leaderboard with seasonal resets and regional rankings.','sha256-gam-arn-4'),
  cj(15,'gam-arn-5','Latency Optimizer',93,'ARENA','Region-aware matchmaking with ping optimization.','sha256-gam-arn-5'),
];
const LOOT_JEWELS: STierEntry[] = [
  cj(16,'gam-lot-1','Drop Table Designer',96,'LOOT','Weighted drop table system with rarity balancing and pity timers.','sha256-gam-lot-1'),
  cj(17,'gam-lot-2','Progression Curve Engine',95,'LOOT','XP and unlock curve design with engagement optimization.','sha256-gam-lot-2'),
  cj(18,'gam-lot-3','Crafting System Manager',94,'LOOT','Recipe management with material sourcing and crafting trees.','sha256-gam-lot-3'),
  cj(19,'gam-lot-4','Reward Psychology Engine',93,'LOOT','Reward timing optimization using behavioral psychology models.','sha256-gam-lot-4'),
  cj(20,'gam-lot-5','Economy Modeler',92,'LOOT','Virtual economy simulation with sink-source balancing.','sha256-gam-lot-5'),
];
const WORLD_JEWELS: STierEntry[] = [
  cj(21,'gam-wld-1','Terrain Generator',96,'WORLD','Multi-biome procedural terrain with erosion simulation.','sha256-gam-wld-1'),
  cj(22,'gam-wld-2','Dungeon Generator',95,'WORLD','Procedural dungeon layouts with difficulty scaling and loot placement.','sha256-gam-wld-2'),
  cj(23,'gam-wld-3','City Planner',94,'WORLD','Procedural city generation with zoning and population modeling.','sha256-gam-wld-3'),
  cj(24,'gam-wld-4','POI Placement System',93,'WORLD','Points of interest placement with density and variety balancing.','sha256-gam-wld-4'),
  cj(25,'gam-wld-5','Weather System',92,'WORLD','Dynamic weather simulation with gameplay impact modeling.','sha256-gam-wld-5'),
];
const PHYSICS_JEWELS: STierEntry[] = [
  cj(26,'gam-phy-1','Rigid Body Dynamics',96,'PHYSICS_G','High-performance rigid body simulation with broad/narrow phase collision.','sha256-gam-phy-1'),
  cj(27,'gam-phy-2','Ragdoll System',95,'PHYSICS_G','Physically-accurate ragdoll with constraint-based joint systems.','sha256-gam-phy-2'),
  cj(28,'gam-phy-3','Particle System Engine',94,'PHYSICS_G','GPU-accelerated particle simulation with force fields.','sha256-gam-phy-3'),
  cj(29,'gam-phy-4','Deterministic Netcode Physics',93,'PHYSICS_G','Rollback-compatible deterministic physics for competitive multiplayer.','sha256-gam-phy-4'),
  cj(30,'gam-phy-5','Destruction System',92,'PHYSICS_G','Fracture-based environmental destruction with debris management.','sha256-gam-phy-5'),
];
const RENDER_JEWELS: STierEntry[] = [
  cj(31,'gam-ren-1','Draw Call Optimizer',95,'RENDER_G','Automated draw call batching and instancing optimization.','sha256-gam-ren-1'),
  cj(32,'gam-ren-2','LOD Transition Manager',94,'RENDER_G','Smooth level-of-detail transitions with distance-based quality scaling.','sha256-gam-ren-2'),
  cj(33,'gam-ren-3','Shader Pipeline Manager',93,'RENDER_G','Shader permutation management with compile-time optimization.','sha256-gam-ren-3'),
  cj(34,'gam-ren-4','Performance Budgeter',92,'RENDER_G','Per-frame performance budget tracking with adaptive quality.','sha256-gam-ren-4'),
  cj(35,'gam-ren-5','Occlusion Culler',92,'RENDER_G','Hardware-accelerated occlusion culling with conservative estimates.','sha256-gam-ren-5'),
];
const AUDIO_JEWELS: STierEntry[] = [
  cj(36,'gam-aud-1','Spatial Audio Engine',95,'AUDIO_G','3D positional audio with HRTF and room acoustics modeling.','sha256-gam-aud-1'),
  cj(37,'gam-aud-2','Dynamic Soundtrack System',94,'AUDIO_G','Adaptive music with intensity layers and seamless transitions.','sha256-gam-aud-2'),
  cj(38,'gam-aud-3','Ambient Soundscape Generator',93,'AUDIO_G','Environment-aware ambient sound generation with time-of-day variation.','sha256-gam-aud-3'),
  cj(39,'gam-aud-4','Voice Chat Processor',92,'AUDIO_G','Low-latency voice chat with noise suppression and spatial positioning.','sha256-gam-aud-4'),
  cj(40,'gam-aud-5','Audio Occlusion System',92,'AUDIO_G','Geometry-aware audio occlusion with material-based filtering.','sha256-gam-aud-5'),
];
const DIRECTOR_JEWELS: STierEntry[] = [
  cj(41,'gam-dir-1','Dynamic Difficulty Adjuster',97,'DIRECTOR','Real-time difficulty scaling based on player performance metrics.','sha256-gam-dir-1'),
  cj(42,'gam-dir-2','Flow State Optimizer',96,'DIRECTOR','Challenge-skill balance maintenance for optimal engagement.','sha256-gam-dir-2'),
  cj(43,'gam-dir-3','Pacing Controller',95,'DIRECTOR','Game session pacing with tension/release cycle management.','sha256-gam-dir-3'),
  cj(44,'gam-dir-4','Tutorial Adaptation System',94,'DIRECTOR','Skill-aware tutorial progression that skips mastered concepts.','sha256-gam-dir-4'),
  cj(45,'gam-dir-5','Frustration Detector',93,'DIRECTOR','Player frustration detection with automatic assistance triggers.','sha256-gam-dir-5'),
];
const GUARDIAN_JEWELS: STierEntry[] = [
  cj(46,'gam-grd-1','Aimbot Detector',96,'GUARDIAN_G','Statistical aim analysis with pattern-based cheat detection.','sha256-gam-grd-1'),
  cj(47,'gam-grd-2','Speed Hack Detector',95,'GUARDIAN_G','Server-authoritative movement validation with desync tolerance.','sha256-gam-grd-2'),
  cj(48,'gam-grd-3','Economy Exploit Detector',94,'GUARDIAN_G','Virtual economy exploit detection with transaction analysis.','sha256-gam-grd-3'),
  cj(49,'gam-grd-4','Replay Validator',93,'GUARDIAN_G','Server-side replay validation for competitive integrity.','sha256-gam-grd-4'),
  cj(50,'gam-grd-5','Ban Management System',92,'GUARDIAN_G','Tiered ban management with appeal workflow and evidence preservation.','sha256-gam-grd-5'),
];
const SOCIAL_JEWELS: STierEntry[] = [
  cj(51,'gam-soc-1','Guild Management System',95,'SOCIAL_G','Full guild lifecycle with ranks, permissions, and governance.','sha256-gam-soc-1'),
  cj(52,'gam-soc-2','LFG Matchmaker',94,'SOCIAL_G','Looking-for-group matching with role and schedule preferences.','sha256-gam-soc-2'),
  cj(53,'gam-soc-3','Toxicity Detector',93,'SOCIAL_G','Real-time toxic behavior detection with graduated response.','sha256-gam-soc-3'),
  cj(54,'gam-soc-4','Community Event Engine',92,'SOCIAL_G','In-game community event creation and management.','sha256-gam-soc-4'),
  cj(55,'gam-soc-5','Chat Moderation System',92,'SOCIAL_G','Multi-language chat moderation with context-aware filtering.','sha256-gam-soc-5'),
];
const ANALYST_G_JEWELS: STierEntry[] = [
  cj(56,'gam-anl-1','Player Behavior Analyzer',96,'ANALYST_G','Deep behavioral analytics with session and lifetime tracking.','sha256-gam-anl-1'),
  cj(57,'gam-anl-2','Churn Predictor',95,'ANALYST_G','Player churn prediction with retention intervention triggers.','sha256-gam-anl-2'),
  cj(58,'gam-anl-3','Monetization Optimizer',94,'ANALYST_G','In-game purchase analytics with offer optimization.','sha256-gam-anl-3'),
  cj(59,'gam-anl-4','Feature Impact Analyzer',93,'ANALYST_G','A/B test analysis for feature impact measurement.','sha256-gam-anl-4'),
  cj(60,'gam-anl-5','Cohort Analyzer',92,'ANALYST_G','Player cohort analysis with behavioral segmentation.','sha256-gam-anl-5'),
];
const TESTER_JEWELS: STierEntry[] = [
  cj(61,'gam-tst-1','Automated Playtest Runner',95,'TESTER_G','Bot-driven automated playtesting with coverage mapping.','sha256-gam-tst-1'),
  cj(62,'gam-tst-2','Visual Bug Detector',94,'TESTER_G','Screenshot-based visual regression testing with diff analysis.','sha256-gam-tst-2'),
  cj(63,'gam-tst-3','Balance Validator',93,'TESTER_G','Game balance validation through simulation and statistical analysis.','sha256-gam-tst-3'),
  cj(64,'gam-tst-4','Performance Profiler',92,'TESTER_G','Automated performance profiling with bottleneck identification.','sha256-gam-tst-4'),
  cj(65,'gam-tst-5','Cross-Platform Checker',92,'TESTER_G','Platform parity validation across PC, console, and mobile.','sha256-gam-tst-5'),
];
const MODDER_JEWELS: STierEntry[] = [
  cj(66,'gam-mod-1','Mod Validation Engine',95,'MODDER','Mod safety validation with compatibility and security checking.','sha256-gam-mod-1'),
  cj(67,'gam-mod-2','Workshop Integration',94,'MODDER','Steam Workshop-style mod distribution and version management.','sha256-gam-mod-2'),
  cj(68,'gam-mod-3','UGC Safety Scanner',93,'MODDER','User-generated content safety scanning with NSFW detection.','sha256-gam-mod-3'),
  cj(69,'gam-mod-4','Content Curation Engine',92,'MODDER','Community content curation with quality scoring and featuring.','sha256-gam-mod-4'),
  cj(70,'gam-mod-5','API Gateway Manager',92,'MODDER','Modding API management with rate limiting and access control.','sha256-gam-mod-5'),
];
const STREAMER_JEWELS: STierEntry[] = [
  cj(71,'gam-str-1','Highlight Clip Generator',95,'STREAMER','Automated highlight detection and clip generation from gameplay.','sha256-gam-str-1'),
  cj(72,'gam-str-2','Spectator Camera System',94,'STREAMER','Smart spectator camera with action-following and replay angles.','sha256-gam-str-2'),
  cj(73,'gam-str-3','Stream Overlay Engine',93,'STREAMER','Dynamic stream overlay with real-time game data integration.','sha256-gam-str-3'),
  cj(74,'gam-str-4','Audience Interaction System',92,'STREAMER','Viewer-to-game interaction with polls, predictions, and rewards.','sha256-gam-str-4'),
  cj(75,'gam-str-5','Broadcast Optimizer',92,'STREAMER','Adaptive quality settings for optimal streaming performance.','sha256-gam-str-5'),
];
const ECONOMY_JEWELS: STierEntry[] = [
  cj(76,'gam-eco-1','Inflation Controller',96,'ECONOMY_G','Dynamic currency sink/source balancing with inflation prevention.','sha256-gam-eco-1'),
  cj(77,'gam-eco-2','Market Monitor',95,'ECONOMY_G','Player marketplace monitoring with price manipulation detection.','sha256-gam-eco-2'),
  cj(78,'gam-eco-3','Trade Validator',94,'ECONOMY_G','P2P trade validation with fraud and duplication prevention.','sha256-gam-eco-3'),
  cj(79,'gam-eco-4','Price Stabilizer',93,'ECONOMY_G','NPC vendor price stabilization with supply-demand modeling.','sha256-gam-eco-4'),
  cj(80,'gam-eco-5','Economy Health Dashboard',92,'ECONOMY_G','Macro economy health monitoring with intervention recommendations.','sha256-gam-eco-5'),
];

const COMPOUND_JEWELS: STierEntry[] = [
  cj(81,'gam-cx-1','Living World Engine',98,'QUEST×NPC×WORLD','Integrated quest, NPC, and world generation for emergent gameplay.','sha256-gam-cx-1'),
  cj(82,'gam-cx-2','Competitive Integrity Pipeline',97,'ARENA×GUARDIAN_G','End-to-end competitive integrity from matchmaking to anti-cheat.','sha256-gam-cx-2'),
  cj(83,'gam-cx-3','Player Engagement Loop',96,'LOOT×DIRECTOR×ANALYST_G','Reward-pacing-analytics loop for maximum player engagement.','sha256-gam-cx-3'),
  cj(84,'gam-cx-4','Content Creation Pipeline',95,'WORLD×QUEST×LOOT','Procedural content pipeline from world to quest to reward.','sha256-gam-cx-4'),
  cj(85,'gam-cx-5','Performance Pipeline',95,'PHYSICS_G×RENDER_G×AUDIO_G','Unified performance optimization across physics, graphics, and audio.','sha256-gam-cx-5'),
  cj(86,'gam-cx-6','Community Platform',94,'SOCIAL_G×MODDER×STREAMER','Integrated community with social, modding, and streaming.','sha256-gam-cx-6'),
  cj(87,'gam-cx-7','Economy Intelligence',94,'LOOT×ECONOMY_G×ANALYST_G','Economic modeling with analytics-driven balancing.','sha256-gam-cx-7'),
  cj(88,'gam-cx-8','QA Automation Suite',93,'TESTER_G×GUARDIAN_G','Combined testing and anti-cheat for quality assurance.','sha256-gam-cx-8'),
  cj(89,'gam-cx-9','Narrative Intelligence',93,'QUEST×NPC×DIRECTOR','Story-aware NPC behavior with pacing-driven narrative delivery.','sha256-gam-cx-9'),
];

export const GAMING_CROWN_JEWELS: STierEntry[] = [
  ...QUEST_JEWELS, ...NPC_JEWELS, ...ARENA_JEWELS, ...LOOT_JEWELS,
  ...WORLD_JEWELS, ...PHYSICS_JEWELS, ...RENDER_JEWELS, ...AUDIO_JEWELS,
  ...DIRECTOR_JEWELS, ...GUARDIAN_JEWELS, ...SOCIAL_JEWELS, ...ANALYST_G_JEWELS,
  ...TESTER_JEWELS, ...MODDER_JEWELS, ...STREAMER_JEWELS, ...ECONOMY_JEWELS,
  ...COMPOUND_JEWELS,
];

export function getGamingJewelsByPrimitive(primitiveId: string): STierEntry[] {
  const upper = primitiveId.toUpperCase();
  return GAMING_CROWN_JEWELS.filter(j => j.module.toUpperCase() === upper || j.module.toUpperCase().includes(upper));
}

export function getGamingJewelSummary() {
  return { total: GAMING_CROWN_JEWELS.length, engines: 40, agents: 40, compound: 9, avgCjpi: Math.round(GAMING_CROWN_JEWELS.reduce((s, j) => s + j.cjpi, 0) / GAMING_CROWN_JEWELS.length), version: '1.0.0' };
}
