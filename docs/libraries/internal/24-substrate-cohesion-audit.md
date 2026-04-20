# Substrate Cohesion Audit — Auto-Generated Registry

> **Generated:** Phase 1 cohesion sweep. Single source of truth for all 432 public tables.

> **Total tables:** 432  •  **Prefix families:** 111

## Status Legend

- 🟢 **alive** — actively used, do not touch
- 🟡 **rename / migrate / mixed** — needs cleanup but not destructive
- 🔴 **theater** — confirmed dead, safe to drop
- ❓ **review** — needs founder classification

---

## Owner Subsystems

| Prefix | Tables | Owner | Status | Purpose |
|---|---:|---|---|---|
| `pf_*` | 47 | DEFENSE | 🟢 alive | Threat detection, captcha, device fingerprinting, rate limiting |
| `substrate_*` | 42 | SUBSTRATE CORE | 🟢 alive | Primitive matrix, layer telemetry, governance state |
| `brain_*` | 38 | BRAIN | 🟡 mixed | Cognitive memory + edges + crystals (curiosity/persona = theater) |
| `agency_*` | 16 | AGENCY | 🟢 alive | CMPSBL Cognitives team workspace + tasks + economics |
| `dream_*` | 16 | DREAM | 🟢 alive | Algorithmic sub-threshold synthesis (no AI, patentable) |
| `autoblog_*` | 12 | AUTOBLOG | 🟢 alive | Standalone publishing pipeline |
| `evolution_*` | 9 | EVOLUTION | 🟢 alive | Patch generation + shadow mesh training (was MODERNIZER) |
| `marketplace_*` | 9 | MARKETPLACE | 🟢 alive | Showroom + Junkyard + commercial drops |
| `core_*` | 8 | SUBSTRATE CORE | 🟢 alive | Foundational primitives |
| `developer_*` | 8 | DEVELOPER | 🟢 alive | Developer portal — 8 tables, 9 fn refs / 31 src refs (sandbox sessions, skill tree, certifications, templates). Dormant rows but heavily wired. |
| `nexus_*` | 8 | NEXUS | 🟢 alive | AI provider router (replaces Lovable AI) |
| `access_*` | 7 | ACCESS | 🟢 alive | API keys, quotas, subscriptions, usage |
| `foundry_*` | 7 | FOUNDRY | 🟢 alive | Builder workspace |
| `governance_*` | 7 | GOVERNANCE | 🟢 alive | Policy + Lex enforcement |
| `modernizer_*` | 7 | EVOLUTION | 🟡 rename | Legacy MODERNIZER tables — should fold into evolution_* |
| `system_*` | 7 | SUBSTRATE CORE | 🟢 alive | System-wide config + health |
| `user_*` | 7 | AUTH | 🟢 alive | User profiles, roles, preferences |
| `immunity_*` | 6 | IMMUNITY | 🟢 alive | Self-healing matrix (Shadow→Sim→Prod) |
| `learning_*` | 6 | BRAIN | 🟡 migrate | Learning data — fold into brain edges/crystals |
| `mesh_*` | 6 | LAYERS | 🟡 rename | Old "Mesh" naming → should be layer_* |
| `ripple_*` | 6 | RIPPLE | 🟢 alive | **Pub/sub message bus + job queue + circuit breakers** — heavily used by `pf-substrate` edge fn (boot/shutdown events, fan-out subscriptions, dead-letter queue). Live UI at `RippleMessageBusTab.tsx`. Keep. |
| `integration_*` | 5 | INTEGRATIONS | 🟢 alive | External API connectors |
| `vertical_*` | 5 | VERTICALS | 🟢 alive | 12 vertical substrates |
| `scan_*` | 4 | SCAN | 🟢 alive | Scanning runs + results |
| `ai_*` | 3 | NEXUS | 🟢 alive | AI usage telemetry |
| `analytics_*` | 3 | ANALYTICS | 🟢 alive | PostHog-managed event stream |
| `auth_*` | 3 | AUTH | 🟢 alive | Auth events, geo, rate limits |
| `cascade_*` | 3 | CASCADE | 🔴 theater | Old personalized cascades — DELETE |
| `circuit_*` | 3 | SUBSTRATE CORE | 🟢 alive | Circuit breaker telemetry |
| `cognitive_*` | 3 | AGENCY | 🟢 alive | CMPSBL Cognitive registry |
| `cortex_*` | 3 | CORTEX | 🟢 alive | Orchestration enforcement |
| `defense_*` | 3 | DEFENSE | 🟢 alive | Defense layer policy |
| `discovery_*` | 3 | DISCOVERY | 🟢 alive | Federated primitive discovery |
| `email_*` | 3 | EMAIL | 🟢 alive | Outbound email queue + templates |
| `global_*` | 3 | GLOBAL | 🟢 alive | Global state config — reclassified via prefix sweep. Sprint 1 batch 6. |
| `immune_*` | 3 | IMMUNITY | 🟡 rename | Old "immune_" → consolidate with immunity_* |
| `lex_*` | 3 | LEX | 🟢 alive | Governance rule registry |
| `module_*` | 3 | SUBSTRATE CORE | 🟡 rename | Old "module_" → primitive_* (module_registry was theater, dropped) |
| `mutation_*` | 3 | EVOLUTION | 🟡 migrate | Mutation engine — fold into evolution_* |
| `site_*` | 3 | SITE | 🟢 alive | Public site config |
| `tsac_*` | 3 | TSAC | 🟢 alive | TSAC executor stats |
| `audit_*` | 2 | AUDIT | 🟢 alive | Merkle audit chain anchors + logs |
| `auto_*` | 2 | AUTOBLOG | 🟢 alive | Auto-blog scheduler |
| `backup_*` | 2 | SUBSTRATE CORE | 🟢 alive | Backup ledger |
| `bots_*` | 2 | DEFENSE | 🟢 alive | Bot detection |
| `change_*` | 2 | SUBSTRATE CORE | 🟢 alive | Change feed |
| `cli_*` | 2 | CLI | 🟢 alive | @cmpsbl/cli + @cmpsbl/mana telemetry |
| `cmpsbl_*` | 2 | SUBSTRATE CORE | 🟢 alive | Brand-level config |
| `compiler_*` | 2 | COMPILER | 🟢 alive | Autonomous Product Compiler |
| `daily_*` | 2 | SUBSTRATE CORE | 🟢 alive | Daily aggregates |
| `decode_*` | 2 | DECODE | 🟢 alive | Unified agent + interface |
| `forge_*` | 2 | FORGE (Engine #27) | 🟢 alive | **Cognitive Forge — the Architect engine.** Creates/seals CMPSBL Cognitives. `forge_reserved_names` holds 25 reserved cognitive names. Live hook `useForgeAgents.ts`. Distinct from `/foundry` (builder UI). Keep. |
| `integrity_*` | 2 | SUBSTRATE CORE | 🟡 mixed | Integrity scans (findings table dropped earlier) |
| `maintenance_*` | 2 | SUBSTRATE CORE | 🟢 alive | Maintenance windows |
| `memory_*` | 2 | BRAIN | 🟢 alive | Memory stream pipeline |
| `node_*` | 2 | SUBSTRATE CORE | 🟡 rename | Old "node" → primitive_* per terminology map |
| `passkey_*` | 2 | AUTH | 🟢 alive | WebAuthn passkeys |
| `referral_*` | 2 | MARKETPLACE | 🟢 alive | Referral program |
| `webhook_*` | 2 | INTEGRATIONS | 🟢 alive | Outbound webhooks |
| `accessibility_*` | 1 | INCLUSIVE | 🟢 alive | `accessibility_scans` — 17 rows, public scan history (`/access` flows). Sprint 1 batch 1. |
| `activation_*` | 1 | ACTIVATION | 🟢 alive | `activation_audit_log` — 5 fn refs, written by `pack-activate`. Sprint 1 batch 2. |
| `admin_*` | 1 | DEFENSE | 🟢 alive | `admin_ip_allowlist` — `pf-security-gate` enforces on every request; empty by design. Sprint 1 batch 1. |
| `agencies_*` | 1 | AGENCY | 🟢 alive | `agencies` top-level table — 94 fn refs / 32 src refs. Anchor table. Sprint 1 batch 2. |
| `agent_*` | 1 | AGENCY | 🟢 alive | `agent_competency` — agency cognitive scoring, written by `agency-orchestrator`. Sprint 1 batch 2. |
| `artifact_*` | 1 | SUBSTRATE CORE | 🟢 alive | `artifact_registry` — 201 rows, primary artifact ledger. Sprint 0 baseline anchor. Sprint 1 batch 1. |
| `atlas_*` | 1 | GOVERNANCE | 🟢 alive | `atlas_capabilities` — `pf-substrate` reads on every governed call. Sprint 1 batch 1. |
| `bot_*` | 1 | DEFENSE | 🟢 alive | `bot_sniper_api_keys` — DEFENSE bot-sniper API key storage, dormant. Sprint 1 batch 2. |
| `canary_*` | 1 | DEFENSE | 🟢 alive | `canary_tokens` — DEFENSE deception tokens, dormant. Sprint 1 batch 2. |
| `captcha_*` | 1 | DEFENSE | 🟢 alive | `captcha_challenges` — `pf-security-gate` writes challenge issuance. Sprint 1 batch 2. |
| `causal_*` | 1 | AUDIT | 🟢 alive | `causal_traces` — causal-trace receipts post-export, fills on demand. Sprint 1 batch 2. |
| `client_*` | 1 | OBSERVABILITY | 🟢 alive | `client_error_log` — 272 rows, active client error sink. Sprint 1 batch 2. |
| `code_*` | 1 | ASCENSION | 🟢 alive | `code_stamps` — code provenance stamps, ascension-emitted. Sprint 1 batch 2. |
| `compiled_*` | 1 | COMPILER | 🟢 alive | `compiled_products` — Autonomous Product Compiler output ledger, 25 fn refs. Sprint 1 batch 2. |
| `control_*` | 1 | GOVERNANCE | 🟢 alive | `control_plane_state` — `/control` master power center reads/writes plane state. Sprint 1 batch 3. |
| `cost_*` | 1 | OBSERVABILITY | 🟢 alive | `cost_logs` — referenced by 3 files (cost telemetry sink). Sprint 1 batch 5. |
| `crystallized_*` | 1 | BRAIN | 🟢 alive | `crystallized_assets` — BRAIN distillation output target. Sprint 1 batch 3. |
| `device_*` | 1 | DEFENSE | 🟢 alive | `device_fingerprint_snapshots` — 2 fn / 19 src refs, defense fingerprinting ledger. Sprint 1 batch 5. |
| `discovered_*` | 1 | DISCOVERY | 🟢 alive | `discovered_pipelines` — 7 fn / 14 src refs, discovery output cache. Sprint 1 batch 5. |
| `discoveries_*` | 1 | DISCOVERY | 🟢 alive | Singular form of discovered — discovery vault entries. Sprint 1 batch 5. |
| `ecosystem_*` | 1 | INTEGRATION | 🟢 alive | `ecosystem_memory` — referenced by integration adapter. Sprint 1 batch 5. |
| `edge_*` | 1 | DEFENSE | 🟢 alive | `edge_rate_limits` — 12 fn refs / 104 src refs, edge function rate limit ledger. Sprint 1 batch 4. |
| `ethical_*` | 1 | GOVERNANCE | 🟢 alive | `ethical_approvals` — governance approval ledger, 29 src refs. Sprint 1 batch 5. |
| `execution_*` | 1 | RUNTIME | 🟢 alive | `execution_traces` — 7 fn / 62 src refs, runtime trace ledger. Sprint 1 batch 5. |
| `gate_*` | 1 | LEX | 🟢 alive | `gate_runs` — 25 src refs, Lex fingerprint gate run ledger. Sprint 1 batch 5. |
| `ip_*` | 1 | DEFENSE | 🟢 alive | `ip_reputation` — 6 fn / 101 src refs, defense IP reputation cache. Sprint 1 batch 5. |
| `lead_*` | 1 | MARKETING | 🟢 alive | `lead_captures` — landing page lead capture sink. Sprint 1 batch 5. |
| `licensing_*` | 1 | LEGAL | 🟢 alive | `licensing_inquiries` — patent licensing inquiry inbox. Sprint 1 batch 5. |
| `lovable_*` | 1 | LEGACY | 🟢 alive | `lovable_ai_usage` — historical Lovable AI usage log (read-only, not written). Sprint 1 batch 5. |
| `member_*` | 1 | AGENCY | 🟢 alive | `member_usage_stats` — 4 fn / 22 src refs, agency member telemetry. Sprint 1 batch 5. |
| `merchant_*` | 1 | MARKETPLACE | 🟢 alive | `merchant_scan_log` — 17 rows, MERCHANT engine scan ledger. Sprint 1 batch 5. |
| `owner_*` | 1 | GOVERNANCE | 🟢 alive | `owner_reports` — 236 rows, Governor owner-report archive. Sprint 1 batch 5. |
| `pipeline_*` | 1 | SUBSTRATE CORE | 🟢 alive | `pipeline_vault` — 1 row, 6 fn / 63 src refs. Pipeline metadata vault. Sprint 1 batch 6. |
| `production_*` | 1 | MARKETPLACE | 🟢 alive | `production_promotions` — 3 fn / 27 src refs. Production-tier promotions ledger. Sprint 1 batch 6. |
| `profiles_*` | 1 | AUTH | 🟢 alive | `profiles` — 103 total refs. Core user profiles table. Sprint 1 batch 6. |
| `proposal_*` | 1 | EVOLUTION | 🟢 alive | `proposal_meta` — 2 fn / 50 src refs. Evolution proposal metadata. Sprint 1 batch 6. |
| `provider_*` | 1 | NEXUS | 🟢 alive | `provider_routing_events` — 8 fn / 40 src refs. NEXUS provider routing telemetry. Sprint 1 batch 6. |
| `quarry_*` | 1 | FOUNDRY | 🟢 alive | `quarry_assets` — 2 src refs. Raw material queue for Foundry pipeline. Sprint 1 batch 6. |
| `radio_*` | 1 | SUBSTRATE CORE | 🟢 alive | `radio_broadcasts` — 5 rows, 1 fn / 5 src refs. Substrate radio broadcast bus. Sprint 1 batch 6. |
| `restoration_*` | 1 | SUBSTRATE CORE | 🟢 alive | `restoration_sessions` — 1 row, 1 fn / 3 src refs. Disaster recovery session ledger. Sprint 1 batch 6. |
| `saved_*` | 1 | LAYERS | 🟢 alive | `saved_workflows` — 1 fn / 11 src refs. User-saved workflow pipelines. Sprint 1 batch 6. |
| `security_*` | 1 | DEFENSE | 🟢 alive | `security_audit_log` — 6 fn / 59 src refs. Security audit trail. Sprint 1 batch 6. |
| `slo_*` | 1 | OBSERVABILITY | 🟢 alive | `slo_specs` — 3 src refs. SLO specification definitions. Sprint 1 batch 6. |
| `suppressed_*` | 1 | EMAIL | 🟢 alive | `suppressed_emails` — 3 src refs. Email suppression list (compliance). Sprint 1 batch 6. |
| `task_*` | 1 | AGENCY | 🟢 alive | `task_presets` — 10 fn / 73 src refs. Agency task preset library. Sprint 1 batch 6. |
| `tenants_*` | 1 | SUBSTRATE CORE | 🟢 alive | `tenants` — 12 total refs. Multi-tenant isolation table. Sprint 1 batch 6. |
| `usage_*` | 1 | OBSERVABILITY | 🟢 alive | `usage_metrics` — 15 fn / 72 src refs. Usage telemetry aggregates. Sprint 1 batch 6. |
| `v_*` | 1 | SUBSTRATE CORE | 🟢 alive | `v_user_summary` — 1 src ref. User summary view/materialized table. Sprint 1 batch 6. |
| `vault_*` | 1 | ASCENSION | 🟢 alive | `vault_promotions` — **11,165 rows**, 3 fn / 16 src refs. Prime Vault promotion ledger (anchor). Sprint 1 batch 6. |
| `verification_*` | 1 | ASCENSION | 🟢 alive | `verification_scans` — 3 fn / 22 src refs. `/verify` scan result ledger. Sprint 1 batch 6. |
| `vision_*` | 1 | VISION | 🟢 alive | `vision_anomalies` — 5 fn / 22 src refs. VISION anomaly detection ledger. Sprint 1 batch 6. |
| `workbench_*` | 1 | FOUNDRY | 🟢 alive | `workbench_items` — 3 src refs. Developer workbench item storage. Sprint 1 batch 6. |

---
## Full Table Inventory by Prefix


### `pf_*` → DEFENSE (47 tables)

- `pf_ai_logs`
- `pf_brain_anomalies`
- `pf_brain_behavioral_patterns`
- `pf_clarity_admin_stats`
- `pf_clarity_agent_config`
- `pf_clarity_api_keys`
- `pf_clarity_api_usage`
- `pf_clarity_certifications`
- `pf_clarity_clients`
- `pf_clarity_compliance_history`
- `pf_clarity_email_follows`
- `pf_clarity_fix_suggestions`
- `pf_clarity_fixes`
- `pf_clarity_issue_priority`
- `pf_clarity_issues`
- `pf_clarity_notification_log`
- `pf_clarity_notifications`
- `pf_clarity_portfolio_stats`
- `pf_clarity_reports`
- `pf_clarity_scan_queue`
- `pf_clarity_scans`
- `pf_clarity_scheduled_scans`
- `pf_clarity_sites`
- `pf_clarity_subscriptions`
- `pf_clarity_team_invites`
- `pf_clarity_team_members`
- `pf_clarity_teams`
- `pf_clarity_webhooks`
- `pf_clarity_whitelabel`
- `pf_clarity_widget_analytics`
- `pf_clarity_widgets`
- `pf_clarity_wp_connections`
- `pf_cost_logs`
- `pf_deployments`
- `pf_global_threat_feed`
- `pf_image_outputs`
- `pf_insight_logs`
- `pf_media_cache`
- `pf_merger_fusions`
- `pf_merger_intents`
- `pf_merger_metrics`
- `pf_mvp_projects`
- `pf_security_events`
- `pf_system_config`
- `pf_text_outputs`
- `pf_threat_statistics`
- `pf_video_outputs`

### `substrate_*` → SUBSTRATE CORE (42 tables)

- `substrate_agent_events`
- `substrate_agents`
- `substrate_applied_improvements`
- `substrate_apps`
- `substrate_audit_log`
- `substrate_brain_improvements`
- `substrate_canaries`
- `substrate_capabilities`
- `substrate_cascade_history`
- `substrate_changes`
- `substrate_chaos_rules`
- `substrate_config`
- `substrate_cp_restore_jobs`
- `substrate_cp_revisions`
- `substrate_cp_snapshot_manifest`
- `substrate_cp_wal`
- `substrate_developer_keys`
- `substrate_extensions`
- `substrate_flags`
- `substrate_health_log`
- `substrate_heuristics`
- `substrate_idempotency`
- `substrate_install_config`
- `substrate_integrations`
- `substrate_integrity_reports`
- `substrate_leases`
- `substrate_licenses`
- `substrate_metrics_snapshot`
- `substrate_queue_snapshot`
- `substrate_retry_buckets`
- `substrate_safe_mode`
- `substrate_scheduler_queue`
- `substrate_scheduler_receipts`
- `substrate_schema_registry`
- `substrate_sequence_outcomes`
- `substrate_sequence_steps`
- `substrate_sequences`
- `substrate_templates`
- `substrate_upgrade_config`
- `substrate_upgrade_plans`
- `substrate_upgrade_runs`
- `substrate_usage_meters`

### `brain_*` → BRAIN (38 tables)

- `brain_actions_queue`
- `brain_classifier_models`
- `brain_cross_insights`
- `brain_curiosity_log`
- `brain_curiosity_settings`
- `brain_daily_reports`
- `brain_distillation_runs`
- `brain_domain_usage`
- `brain_drift_log`
- `brain_embeddings`
- `brain_events`
- `brain_feedback`
- `brain_forecasts`
- `brain_graph_edges`
- `brain_graph_nodes`
- `brain_knowledge_crystals`
- `brain_knowledge_edges`
- `brain_maintenance_log`
- `brain_memories`
- `brain_memory_archive`
- `brain_memory_cold`
- `brain_memory_contradictions`
- `brain_memory_hot`
- `brain_memory_meta`
- `brain_memory_pruned`
- `brain_memory_warm`
- `brain_metrics`
- `brain_orchestrator_state`
- `brain_policy`
- `brain_rag_contexts`
- `brain_reach_domains`
- `brain_reasoning_traces`
- `brain_reflection_log`
- `brain_reflections`
- `brain_reinforcement_log`
- `brain_tiering_config`
- `brain_transfer_heuristics`
- `brain_user_fingerprints`

### `agency_*` → AGENCY (16 tables)

- `agency_agent_telemetry`
- `agency_api_calls`
- `agency_dream_consent`
- `agency_dream_memory`
- `agency_dream_pool`
- `agency_economics`
- `agency_email_queue`
- `agency_members`
- `agency_purchases`
- `agency_scheduled_tasks`
- `agency_settings`
- `agency_task_artifacts`
- `agency_task_deliverables`
- `agency_task_logs`
- `agency_tasks`
- `agency_templates`

### `dream_*` → DREAM (16 tables)

- `dream_anomalies`
- `dream_archaeology`
- `dream_artifacts`
- `dream_cycle_logs`
- `dream_eater_audit`
- `dream_eater_features`
- `dream_eater_milestones`
- `dream_eater_state`
- `dream_echo_templates`
- `dream_feeder_submissions`
- `dream_ingestion_audit`
- `dream_learning_metrics`
- `dream_log`
- `dream_rate_limits`
- `dream_sessions`
- `dream_stream`

### `autoblog_*` → AUTOBLOG (12 tables)

- `autoblog_assumptions`
- `autoblog_confidence_weights`
- `autoblog_drafts`
- `autoblog_memory_reports`
- `autoblog_publish_cycle`
- `autoblog_publish_governor_logs`
- `autoblog_publish_governor_state`
- `autoblog_queue`
- `autoblog_runs`
- `autoblog_settings`
- `autoblog_split_brain_audits`
- `autoblog_topic_seeds`

### `evolution_*` → EVOLUTION (9 tables)

- `evolution_autonomy_config`
- `evolution_circuit`
- `evolution_entropy_ledger`
- `evolution_pre_metrics`
- `evolution_proposals`
- `evolution_receipts`
- `evolution_repair_log`
- `evolution_runs`
- `evolution_snapshots`

### `marketplace_*` → MARKETPLACE (9 tables)

- `marketplace_generated_templates`
- `marketplace_inventory`
- `marketplace_licenses`
- `marketplace_mailing_list`
- `marketplace_purchases`
- `marketplace_release_alerts`
- `marketplace_saved_templates`
- `marketplace_template_stats`
- `marketplace_user_interests`

### `core_*` → SUBSTRATE CORE (8 tables)

- `core_config`
- `core_contexts`
- `core_jobs`
- `core_plans`
- `core_settings`
- `core_state`
- `core_subscriptions`
- `core_usage`

### `developer_*` → DEVELOPER (8 tables)

- `developer_ai_tool_usage`
- `developer_certifications`
- `developer_earned_badges`
- `developer_progress`
- `developer_sandbox_sessions`
- `developer_skill_tree`
- `developer_templates`
- `developer_tutorial_progress`

### `nexus_*` → NEXUS (8 tables)

- `nexus_anomalies`
- `nexus_cost_ledger`
- `nexus_hourly_snapshots`
- `nexus_logs`
- `nexus_provider_affinity`
- `nexus_provider_health`
- `nexus_provider_limits`
- `nexus_traces`

### `access_*` → ACCESS (7 tables)

- `access_api_keys`
- `access_developers`
- `access_products`
- `access_quotas`
- `access_scans`
- `access_subscriptions`
- `access_usage`

### `foundry_*` → FOUNDRY (7 tables)

- `foundry_bias_audit`
- `foundry_bias_config`
- `foundry_discovery_metrics`
- `foundry_inventory`
- `foundry_mine_events`
- `foundry_tier_config`
- `foundry_user_state`

### `governance_*` → GOVERNANCE (7 tables)

- `governance_audit_log`
- `governance_compliance_reports`
- `governance_issued_vetoes`
- `governance_mode`
- `governance_transition_approvals`
- `governance_transition_log`
- `governance_transition_votes`

### `modernizer_*` → EVOLUTION (7 tables)

- `modernizer_analytics`
- `modernizer_autonomy_log`
- `modernizer_extractions`
- `modernizer_jobs`
- `modernizer_outputs`
- `modernizer_reports`
- `modernizer_user_limits`

### `system_*` → SUBSTRATE CORE (7 tables)

- `system_boot_log`
- `system_config`
- `system_diffs`
- `system_flags`
- `system_metrics_history`
- `system_snapshots`
- `system_updates`

### `user_*` → AUTH (7 tables)

- `user_crystallized_entitlements`
- `user_daily_pulls`
- `user_layer_entitlements`
- `user_limits`
- `user_onboarding`
- `user_pack_activations`
- `user_roles`

### `immunity_*` → IMMUNITY (6 tables)

- `immunity_mesh_runs`
- `immunity_rule_conflicts`
- `immunity_rule_invocations`
- `immunity_rule_lineage`
- `immunity_rule_propagation`
- `immunity_rules`

### `learning_*` → BRAIN (6 tables)

- `learning_confidence`
- `learning_cycles`
- `learning_logs`
- `learning_patterns`
- `learning_queries`
- `learning_results`

### `mesh_*` → LAYERS (6 tables)

- `mesh_capability_recommendations`
- `mesh_comms`
- `mesh_discovery_gaps`
- `mesh_discovery_runs`
- `mesh_intents`
- `mesh_saved_pipelines`

### `ripple_*` → RIPPLE (6 tables)

- `ripple_campaigns`
- `ripple_circuit_breakers`
- `ripple_events`
- `ripple_jobs`
- `ripple_subscriptions`
- `ripple_topics`

### `integration_*` → INTEGRATIONS (5 tables)

- `integration_audit_log`
- `integration_command_mappings`
- `integration_connections`
- `integration_discoveries`
- `integration_usage`

### `vertical_*` → VERTICALS (5 tables)

- `vertical_ascension_sessions`
- `vertical_clm_cycles`
- `vertical_memory_stream`
- `vertical_primitives`
- `vertical_substrates`

### `scan_*` → SCAN (4 tables)

- `scan_finding_trends`
- `scan_results_cache`
- `scan_schedules`
- `scan_webhooks`

### `ai_*` → NEXUS (3 tables)

- `ai_daily_quota`
- `ai_learning_data`
- `ai_usage_log`

### `analytics_*` → ANALYTICS (3 tables)

- `analytics_events`
- `analytics_excluded_fingerprints`
- `analytics_snapshots`

### `auth_*` → AUTH (3 tables)

- `auth_events`
- `auth_geo_log`
- `auth_rate_limits`

### `cascade_*` → CASCADE (3 tables)

- `cascade_conversations`
- `cascade_dreams`
- `cascade_events`

### `circuit_*` → SUBSTRATE CORE (3 tables)

- `circuit_breaker_failures`
- `circuit_breaker_state`
- `circuit_breaker_trips`

### `cognitive_*` → AGENCY (3 tables)

- `cognitive_orders`
- `cognitive_registry`
- `cognitive_stripe_map`

### `cortex_*` → CORTEX (3 tables)

- `cortex_audit_log`
- `cortex_circuit_breakers`
- `cortex_modes`

### `defense_*` → DEFENSE (3 tables)

- `defense_config`
- `defense_events`
- `defense_rules`

### `discovery_*` → DISCOVERY (3 tables)

- `discovery_lock`
- `discovery_retired_combos`
- `discovery_runs`

### `email_*` → EMAIL (3 tables)

- `email_send_log`
- `email_send_state`
- `email_unsubscribe_tokens`

### `global_*` → GLOBAL (3 tables)

- `global_correlation`
- `global_forecasts`
- `global_signals`

### `immune_*` → IMMUNITY (3 tables)

- `immune_escalations`
- `immune_intelligence_events`
- `immune_metrics`

### `lex_*` → LEX (3 tables)

- `lex_registry`
- `lex_registry_events`
- `lex_registry_public`

### `module_*` → SUBSTRATE CORE (3 tables)

- `module_registry`
- `module_slo_status`
- `module_sounding_board`

### `mutation_*` → EVOLUTION (3 tables)

- `mutation_proposals`
- `mutation_receipts`
- `mutation_runs`

### `site_*` → SITE (3 tables)

- `site_analytics_exclusions`
- `site_page_views`
- `site_sessions`

### `tsac_*` → TSAC (3 tables)

- `tsac_executor_stats`
- `tsac_training_feedback`
- `tsac_verifications`

### `audit_*` → AUDIT (2 tables)

- `audit_chain_anchors`
- `audit_logs`

### `auto_*` → AUTOBLOG (2 tables)

- `auto_blog_posts`
- `auto_blog_schedule`

### `backup_*` → SUBSTRATE CORE (2 tables)

- `backup_exports`
- `backup_import_log`

### `bots_*` → DEFENSE (2 tables)

- `bots`
- `bots_versions`

### `change_*` → SUBSTRATE CORE (2 tables)

- `change_artifacts`
- `change_ledger`

### `cli_*` → CLI (2 tables)

- `cli_ascension_sessions`
- `cli_sessions`

### `cmpsbl_*` → SUBSTRATE CORE (2 tables)

- `cmpsbl_patch_downloads`
- `cmpsbl_patches`

### `compiler_*` → COMPILER (2 tables)

- `compiler_feedback`
- `compiler_weights`

### `daily_*` → SUBSTRATE CORE (2 tables)

- `daily_backups`
- `daily_state`

### `decode_*` → DECODE (2 tables)

- `decode_conversations`
- `decode_search_results`

### `forge_*` → FORGE (2 tables)

- `forge_agents`
- `forge_reserved_names`

### `integrity_*` → SUBSTRATE CORE (2 tables)

- `integrity_findings`
- `integrity_scan_runs`

### `maintenance_*` → SUBSTRATE CORE (2 tables)

- `maintenance_notification_config`
- `maintenance_reports`

### `memory_*` → BRAIN (2 tables)

- `memory_stream_config`
- `memory_tier_receipts`

### `node_*` → SUBSTRATE CORE (2 tables)

- `node_dream_config`
- `node_dream_log`

### `passkey_*` → AUTH (2 tables)

- `passkey_challenges`
- `passkey_credentials`

### `referral_*` → MARKETPLACE (2 tables)

- `referral_codes`
- `referral_redemptions`

### `webhook_*` → INTEGRATIONS (2 tables)

- `webhook_delivery_log`
- `webhook_subscriptions`

### `accessibility_*` → UNCLASSIFIED (1 tables)

- `accessibility_scans`

### `activation_*` → UNCLASSIFIED (1 tables)

- `activation_audit_log`

### `admin_*` → UNCLASSIFIED (1 tables)

- `admin_ip_allowlist`

### `agencies_*` → UNCLASSIFIED (1 tables)

- `agencies`

### `agent_*` → UNCLASSIFIED (1 tables)

- `agent_competency`

### `artifact_*` → UNCLASSIFIED (1 tables)

- `artifact_registry`

### `atlas_*` → UNCLASSIFIED (1 tables)

- `atlas_capabilities`

### `bot_*` → UNCLASSIFIED (1 tables)

- `bot_sniper_api_keys`

### `canary_*` → UNCLASSIFIED (1 tables)

- `canary_tokens`

### `captcha_*` → UNCLASSIFIED (1 tables)

- `captcha_challenges`

### `causal_*` → UNCLASSIFIED (1 tables)

- `causal_traces`

### `client_*` → UNCLASSIFIED (1 tables)

- `client_error_log`

### `code_*` → UNCLASSIFIED (1 tables)

- `code_stamps`

### `compiled_*` → UNCLASSIFIED (1 tables)

- `compiled_products`

### `control_*` → UNCLASSIFIED (1 tables)

- `control_plane_state`

### `cost_*` → UNCLASSIFIED (1 tables)

- `cost_logs`

### `crystallized_*` → UNCLASSIFIED (1 tables)

- `crystallized_assets`

### `device_*` → UNCLASSIFIED (1 tables)

- `device_fingerprint_snapshots`

### `discovered_*` → UNCLASSIFIED (1 tables)

- `discovered_pipelines`

### `discoveries_*` → UNCLASSIFIED (1 tables)

- `discoveries`

### `ecosystem_*` → UNCLASSIFIED (1 tables)

- `ecosystem_memory`

### `edge_*` → UNCLASSIFIED (1 tables)

- `edge_rate_limits`

### `ethical_*` → UNCLASSIFIED (1 tables)

- `ethical_approvals`

### `execution_*` → UNCLASSIFIED (1 tables)

- `execution_traces`

### `gate_*` → UNCLASSIFIED (1 tables)

- `gate_runs`

### `ip_*` → UNCLASSIFIED (1 tables)

- `ip_reputation`

### `lead_*` → UNCLASSIFIED (1 tables)

- `lead_captures`

### `licensing_*` → UNCLASSIFIED (1 tables)

- `licensing_inquiries`

### `lovable_*` → UNCLASSIFIED (1 tables)

- `lovable_ai_usage`

### `member_*` → UNCLASSIFIED (1 tables)

- `member_usage_stats`

### `merchant_*` → UNCLASSIFIED (1 tables)

- `merchant_scan_log`

### `owner_*` → UNCLASSIFIED (1 tables)

- `owner_reports`

### `pipeline_*` → UNCLASSIFIED (1 tables)

- `pipeline_vault`

### `production_*` → UNCLASSIFIED (1 tables)

- `production_promotions`

### `profiles_*` → UNCLASSIFIED (1 tables)

- `profiles`

### `proposal_*` → UNCLASSIFIED (1 tables)

- `proposal_meta`

### `provider_*` → UNCLASSIFIED (1 tables)

- `provider_routing_events`

### `quarry_*` → UNCLASSIFIED (1 tables)

- `quarry_assets`

### `radio_*` → UNCLASSIFIED (1 tables)

- `radio_broadcasts`

### `restoration_*` → UNCLASSIFIED (1 tables)

- `restoration_sessions`

### `saved_*` → UNCLASSIFIED (1 tables)

- `saved_workflows`

### `security_*` → UNCLASSIFIED (1 tables)

- `security_audit_log`

### `slo_*` → UNCLASSIFIED (1 tables)

- `slo_specs`

### `suppressed_*` → UNCLASSIFIED (1 tables)

- `suppressed_emails`

### `task_*` → UNCLASSIFIED (1 tables)

- `task_presets`

### `tenants_*` → UNCLASSIFIED (1 tables)

- `tenants`

### `usage_*` → UNCLASSIFIED (1 tables)

- `usage_metrics`

### `v_*` → UNCLASSIFIED (1 tables)

- `v_user_summary`

### `vault_*` → UNCLASSIFIED (1 tables)

- `vault_promotions`

### `verification_*` → UNCLASSIFIED (1 tables)

- `verification_scans`

### `vision_*` → UNCLASSIFIED (1 tables)

- `vision_anomalies`

### `workbench_*` → UNCLASSIFIED (1 tables)

- `workbench_items`
