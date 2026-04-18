DELETE FROM public.marketplace_inventory
WHERE slug IN (
  'agency-orchestration-suite',
  'geospatial-intelligence-suite',
  'quantum-simulation-suite',
  'robotics-control-suite',
  'zero-trust-identity-suite'
);

INSERT INTO public.marketplace_inventory
  (slug, title, subtitle, description, kind, pillar, category, tier,
   price_cents, original_value_cents, cjpi_score, is_active, is_featured, version,
   source_substrate, source_vault, source_id)
VALUES
  ('honeypot-intelligence', 'Honeypot Intelligence Layer',
   'Active deception · attacker classification',
   'Plants believable canary tokens, profiles every caller that touches them, and blocks persistent attackers fail-closed.',
   'suite', 'DEFENSE', 'security', 'S',
   7900, 19900, 96, true, true, '1.0.0', 'crown-jewels', 'S-Tier', 'honeypot-intelligence'),

  ('behavioral-biometrics', 'Behavioral Biometrics Layer',
   'Continuous authentication via behavior drift',
   'Builds a per-caller behavioral fingerprint from cadence, payload shape, and call sequencing; flags impostors when drift exceeds a learned threshold.',
   'suite', 'DEFENSE', 'security', 'S',
   7900, 19900, 95, true, false, '1.0.0', 'crown-jewels', 'S-Tier', 'behavioral-biometrics'),

  ('multi-model-consensus', 'Multi-Model Consensus Layer',
   'Quorum reasoning across models',
   'Routes high-stakes capabilities through N model adapters and only releases the answer when a configurable quorum agrees.',
   'suite', 'INTEGRATION', 'ai', 'S',
   8900, 22900, 95, true, true, '1.0.0', 'crown-jewels', 'S-Tier', 'multi-model-consensus'),

  ('data-sovereignty-partitioner', 'Data Sovereignty Partitioner',
   'Geo-residency enforcement at the call site',
   'Inspects payload jurisdiction tags and refuses cross-region capability calls that would breach declared residency policy.',
   'suite', 'GOVERNANCE', 'compliance', 'S',
   8900, 22900, 94, true, false, '1.0.0', 'crown-jewels', 'S-Tier', 'data-sovereignty-partitioner'),

  ('adversarial-wargame', 'Adversarial Wargame Layer',
   'Continuous red-team QA',
   'Runs an attack corpus against every shipped capability on a schedule; surfaces drift in attack success rate as a hardening regression signal.',
   'suite', 'DEFENSE', 'security', 'S',
   8900, 22900, 94, true, false, '1.0.0', 'crown-jewels', 'S-Tier', 'adversarial-wargame'),

  ('nocturne-consolidation', 'Nocturne Consolidation Layer',
   'Sleep-cycle memory reweighting',
   'Records every capability invocation, then on a periodic consolidate cycle decays weak traces and reinforces high-utility ones.',
   'suite', 'DREAM', 'evolution', 'S',
   6900, 17900, 94, true, false, '1.0.0', 'crown-jewels', 'S-Tier', 'nocturne-consolidation'),

  ('deterministic-replay-vault', 'Deterministic Replay Vault',
   'Reproduce any historical execution exactly',
   'Seals every capability call as a deterministic replay capsule (cap + input + output + seed) into a bounded vault.',
   'suite', 'OBSERVABILITY', 'audit', 'S',
   7900, 19900, 95, true, true, '1.0.0', 'crown-jewels', 'S-Tier', 'deterministic-replay-vault')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  kind = EXCLUDED.kind,
  pillar = EXCLUDED.pillar,
  category = EXCLUDED.category,
  tier = EXCLUDED.tier,
  price_cents = EXCLUDED.price_cents,
  original_value_cents = EXCLUDED.original_value_cents,
  cjpi_score = EXCLUDED.cjpi_score,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  version = EXCLUDED.version,
  source_substrate = EXCLUDED.source_substrate,
  source_vault = EXCLUDED.source_vault,
  source_id = EXCLUDED.source_id,
  updated_at = now();