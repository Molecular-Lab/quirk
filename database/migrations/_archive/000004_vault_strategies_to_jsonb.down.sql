-- ============================================
-- ROLLBACK MIGRATION 000004: Restore vault_strategies table
-- ============================================
-- Reverts JSONB consolidation and restores separate vault_strategies table
-- Migration date: 2025-11-24

BEGIN;

-- ============================================
-- 1. RECREATE VAULT_STRATEGIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS vault_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL,
  target_percent NUMERIC(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_vault_id, category),
  CHECK (target_percent >= 0 AND target_percent <= 100)
);

CREATE INDEX idx_vault_strategies_vault ON vault_strategies(client_vault_id);
CREATE INDEX idx_vault_strategies_active ON vault_strategies(is_active) WHERE is_active = true;

COMMENT ON TABLE vault_strategies IS 'DeFi strategy allocation configuration for client vaults';
COMMENT ON COLUMN vault_strategies.category IS 'Strategy category: lending, lp, staking';
COMMENT ON COLUMN vault_strategies.target_percent IS 'Target allocation percentage (must sum to 100 per vault)';

-- ============================================
-- 2. MIGRATE DATA BACK FROM JSONB
-- ============================================

-- Extract strategies from JSONB and insert into vault_strategies
INSERT INTO vault_strategies (client_vault_id, category, target_percent, is_active)
SELECT 
  cv.id as client_vault_id,
  (strategy->>'category')::VARCHAR(20) as category,
  (strategy->>'target')::NUMERIC(5,2) as target_percent,
  COALESCE((strategy->>'isActive')::BOOLEAN, true) as is_active
FROM client_vaults cv
CROSS JOIN LATERAL jsonb_array_elements(cv.strategies) AS strategy
WHERE cv.strategies IS NOT NULL AND cv.strategies != '[]'::jsonb;

-- ============================================
-- 3. DROP JSONB COLUMN
-- ============================================

ALTER TABLE client_vaults
DROP COLUMN IF EXISTS strategies;

COMMIT;
