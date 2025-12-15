/**
 * Script to fix missing api_key_prefix for existing products
 *
 * This script updates the api_key_prefix column for products that have
 * api_key_hash but are missing the prefix (created before prefix was added)
 *
 * Usage: node --loader ts-node/esm fix-api-key-prefix.ts
 */

import postgres from 'postgres'
import { config } from 'dotenv'

config()

const sql = postgres(process.env.DATABASE_URL || '')

interface Product {
  id: string
  product_id: string
  company_name: string
  api_key_hash: string | null
  api_key_prefix: string | null
}

async function fixApiKeyPrefixes() {
  console.log('🔍 Finding products with missing api_key_prefix...\n')

  // Find products that have api_key_hash but no api_key_prefix
  const products = await sql<Product[]>`
    SELECT id, product_id, company_name, api_key_hash, api_key_prefix
    FROM client_organizations
    WHERE api_key_hash IS NOT NULL
      AND api_key_prefix IS NULL
  `

  console.log(`Found ${products.length} products with missing api_key_prefix:\n`)

  if (products.length === 0) {
    console.log('✅ No products need fixing. All good!')
    process.exit(0)
  }

  products.forEach(p => {
    console.log(`  - ${p.company_name} (${p.product_id})`)
  })

  console.log('\n⚠️  IMPORTANT: These products need their API keys regenerated.')
  console.log('   You can regenerate API keys via:')
  console.log('   1. Dashboard → API Testing → Regenerate API Key')
  console.log('   2. Or use the API endpoint: POST /api/v1/clients/:productId/regenerate-api-key\n')

  console.log('📝 Would you like to see the SQL to manually update prefixes if you have the original keys? (y/n)')

  // For now, just show the info. In production, you'd regenerate keys via API
  console.log('\n💡 If you have the original API keys, you can extract the prefix (first 8-12 chars)')
  console.log('   and update manually:')
  console.log(`
UPDATE client_organizations
SET api_key_prefix = 'test_pk_abc'
WHERE product_id = 'your_product_id';
  `)

  await sql.end()
}

fixApiKeyPrefixes().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
