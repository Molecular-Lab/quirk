-- ============================================
-- MIGRATION 000004: Move vault_strategies to JSONB
-- ============================================
-- Consolidates vault_strategies table into client_vaults.strategies JSONB column
-- Simplifies schema and ensures atomic strategy updates
-- Migration date: 2025-11-24

BEGIN;

-- ============================================
-- 1. ADD JSONB COLUMN TO CLIENT_VAULTS
-- ============================================

ALTER TABLE client_vaults
ADD COLUMN IF NOT EXISTS strategies JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN client_vaults.strategies IS 'DeFi strategy allocation config as JSONB array: [{"category":"lending","target":50},{"category":"lp","target":30}]';

-- ============================================
-- 2. MIGRATE EXISTING DATA
-- ============================================

-- Copy existing vault_strategies into client_vaults.strategies JSONB
UPDATE client_vaults cv
SET strategies = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', vs.category,
      'target', vs.target_percent,
      'isActive', true
    )
  )
  FROM vault_strategies vs
  WHERE vs.client_vault_id = cv.id
)
WHERE EXISTS (
  SELECT 1 FROM vault_strategies vs WHERE vs.client_vault_id = cv.id
);

-- ============================================
-- 3. DROP OLD TABLE
-- ============================================

-- Drop the old vault_strategies table (CASCADE removes foreign key constraints)
DROP TABLE IF EXISTS vault_strategies CASCADE;

-- ============================================
-- 4. ADD VALIDATION CHECK (OPTIONAL)
-- ============================================

-- Add check constraint to ensure strategies is a valid JSON array
-- (PostgreSQL will validate JSONB automatically, this is just documentation)

COMMENT ON COLUMN client_vaults.strategies IS 'DeFi strategy allocation. Must be JSONB array. Example: [{"category":"lending","target":50},{"category":"lp","target":30},{"category":"staking","target":20}]. Sum of targets should equal 100.';

COMMIT;
