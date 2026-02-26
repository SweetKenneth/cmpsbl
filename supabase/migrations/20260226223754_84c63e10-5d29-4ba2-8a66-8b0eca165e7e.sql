
-- Add 'baseline' to the quarry_visibility enum
ALTER TYPE quarry_visibility ADD VALUE IF NOT EXISTS 'baseline';

-- Add 'artifact_pack' to the quarry_asset_type enum
ALTER TYPE quarry_asset_type ADD VALUE IF NOT EXISTS 'artifact_pack';
