# Authentication Architecture

## Who is the Dashboard For?

The **WhiteLabel Web Dashboard** is for **B2B Clients (Product Owners)**, NOT Proxify internal admins.

**Example Users:**
- Shopify (e-commerce platform)
- Grab (ride-sharing app)
- Netflix (streaming service)

These clients use the dashboard to:
- Register their organization
- Generate API keys
- View their end-users' deposits
- Monitor their vault performance
- Test API integrations

## Authentication Flow

### 1. Client Registration & API Key Generation

```
Product Owner Logs In (Privy)
  ↓
Creates Organization (POST /api/v1/clients)
  → Returns: productId, organizationId
  ↓
Generates API Key (POST /api/v1/clients/product/{productId}/regenerate-api-key)
  → Returns: apiKey (e.g., "test_pk_abc123...")
  ↓
Stores in:
  1. userStore.apiKey (Zustand)
  2. localStorage['b2b:api_key'] (for b2bApiClient)
  3. demoStore.activeApiKey (for demo context)
```

### 2. API Key Usage

**All API calls** from the dashboard must include the API key:

```typescript
// Automatic in b2bApiClient
axios.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('b2b:api_key')
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  return config
})
```

**Backend validates:**
```
Request → Auth Middleware → Validate API Key → Extract Client ID → Process Request
```

### 3. What Data Can Clients See?

**✅ Clients can ONLY see their own data:**
- Their end-users
- Their deposit orders
- Their vaults
- Their statistics

**❌ Clients CANNOT see:**
- Other clients' data
- Other clients' end-users
- Proxify internal metrics

**Example:**
```sql
-- Backend automatically filters by client_id
SELECT * FROM deposit_orders
WHERE client_id = (
  SELECT id FROM client_organizations
  WHERE api_key_hash = bcrypt_hash(apiKey)
)
```

## Stores & API Key Sync

### Current Stores (After Migration)

1. **clientContextStore** ⭐ **SINGLE SOURCE OF TRUTH**
   ```typescript
   // File: apps/whitelabel-web/src/store/clientContextStore.ts
   {
     clientId: string | null        // UUID from database
     productId: string | null       // Product ID (test_product_001)
     apiKey: string | null          // API key (test_pk_...)
     companyName: string | null     // Optional display info
     businessType: string | null    // Optional display info

     // Methods
     setClientContext(context)      // Set all at once
     setClientId(clientId)
     setProductId(productId)
     setApiKey(apiKey)
     hasContext()                   // Check if complete
     hasApiKey()                    // Check if API key exists
     syncToLocalStorage()           // Manual sync
     clearContext()                 // Reset all
   }
   ```
   **Auto-syncs to:**
   - `localStorage['b2b:client_id']`
   - `localStorage['b2b:product_id']`
   - `localStorage['b2b:api_key']` ← Used by b2bApiClient

2. **userStore** - User authentication (Privy)
   ```typescript
   {
     privyOrganizationId: string
     organizations: Organization[]
     activeProductId: string
     apiKey: string  // ← Still stores for Privy session
   }
   ```

3. **demoStore** - Demo-specific state
   ```typescript
   {
     hasEarnAccount: boolean
     endUserId: string | null
     error: string | null
     isCreatingAccount: boolean
     // NO LONGER stores: activeProductId, activeClientId, activeApiKey
   }
   ```

4. **apiStore** - API testing state
   ```typescript
   {
     apiKey: string | null
     baseUrl: string
     history: ApiTestResult[]
   }
   ```

### Sync Strategy (New Pattern)

```typescript
// On app load:
1. userStore loads from localStorage (Privy session)
2. DemoWrapper syncs userStore → clientContextStore
3. clientContextStore auto-syncs to localStorage
4. b2bApiClient interceptor reads from localStorage['b2b:api_key']

// Manual configuration (via DemoSettings):
1. User enters clientId, productId, apiKey
2. Save to clientContextStore
3. Auto-syncs to localStorage
4. All components use clientContextStore

// Organization switching (APITestingPage):
1. User clicks "Set Active" on organization
2. Load org-specific API key from localStorage multi-org map
3. Update userStore.setApiKey(orgApiKey)
   → This triggers sync to clientContextStore
4. Call userStore.setActiveOrganization(productId)
   → This ALSO triggers sync to clientContextStore
5. clientContextStore now has complete context:
   - clientId (org.id)
   - productId (org.productId)
   - apiKey (org-specific key)
   - companyName, businessType
6. localStorage['b2b:api_key'] updated
7. All components see new active context

// API key generation (APITestingPage):
1. User generates API key via FLOW 0
2. saveApiKeyForOrg(productId, apiKey, orgData)
   → Saves to localStorage multi-org map
   → Syncs to userStore.setApiKey()
   → Syncs to clientContextStore directly
3. All stores + localStorage updated
```

### Automatic Sync Points

**userStore → clientContextStore** (2025-11-28)
```typescript
// File: apps/whitelabel-web/src/store/userStore.ts

// 1. When switching organizations
setActiveOrganization: (productId) => {
  const org = get().organizations.find((o) => o.productId === productId)
  if (org) {
    set({ activeProductId: productId })

    // Auto-sync to clientContextStore
    useClientContext.getState().setClientContext({
      clientId: org.id,
      productId: org.productId,
      apiKey: get().apiKey,
      companyName: org.companyName,
      businessType: org.businessType,
    })
  }
}

// 2. When API key is updated
setApiKey: (apiKey, webhookSecret) => {
  set({ apiKey, webhookSecret })

  // Auto-sync to clientContextStore
  const activeOrg = get().getActiveOrganization()
  if (activeOrg) {
    useClientContext.getState().setClientContext({
      clientId: activeOrg.id,
      productId: activeOrg.productId,
      apiKey: apiKey,
      companyName: activeOrg.companyName,
      businessType: activeOrg.businessType,
    })
  }
}
```

**APITestingPage → clientContextStore** (2025-11-28)
```typescript
// File: apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx

// 1. When saving API key for organization
const saveApiKeyForOrg = (productId, apiKey, orgData) => {
  // Save to multi-org map
  localStorage.setItem("b2b:api_keys", JSON.stringify(allKeys))

  // Sync to userStore (triggers clientContextStore sync)
  if (activeProductId === productId) {
    useUserStore.getState().setApiKey(apiKey)
  }

  // Also sync directly to clientContextStore if we have org data
  if (orgData) {
    useClientContext.getState().setClientContext({
      clientId: orgData.id,
      productId: productId,
      apiKey: apiKey,
      companyName: orgData.companyName,
      businessType: orgData.businessType,
    })
  }
}

// 2. When switching organizations (Set Active button)
onClick={() => {
  const orgApiKey = loadApiKeyForOrg(org.productId)

  // Update API key first
  if (orgApiKey) {
    setApiKey(orgApiKey) // Syncs to clientContextStore
  }

  // Then switch org
  setActiveOrganization(org.productId) // Also syncs to clientContextStore
}
```

### Migration Summary

**Before:**
- Multiple stores (userStore, demoStore, apiStore) all managing API keys
- Sync logic scattered across components
- Inconsistent state

**After:**
- **clientContextStore** = Single source of truth for current context
- All components read from clientContextStore
- Automatic localStorage sync
- Consistent state across app
- Organization switching auto-syncs everywhere

## Development & Testing

### Option 1: Use Test Client (Recommended)

```bash
# Use existing test client
Client ID: test_product_001
API Key: test_pk_2a2463f87bfd6756822f48698fedd4ef
```

Set via:
- Demo Settings panel (⚙️ button)
- Browser console (SET_API_KEY.html)
- Direct localStorage update

### Option 2: Master Bypass Key (Future Enhancement)

For **Proxify internal admin** dashboard (separate app):

```typescript
// Future: Admin dashboard with master key
const MASTER_API_KEY = process.env.VITE_MASTER_API_KEY

// Backend: Special handling
if (apiKey === MASTER_API_KEY) {
  // Allow access to ALL clients' data
  // Only for internal admin operations
}
```

**NOT IMPLEMENTED YET** - Would require:
- Separate admin dashboard app
- Master key in environment variables
- Backend bypass logic
- Audit logging for all master key usage

## Current Implementation Status

### ✅ Working (After Migration - 2025-11-28)
- Client-specific API keys
- Automatic key injection in API calls (via axios interceptor)
- **clientContextStore** as single source of truth
- Automatic localStorage sync
- Key sync from userStore → clientContextStore (in DemoWrapper)
- Manual configuration via DemoSettings component
- API key validation in OperationsDashboard

### ✅ Migrated Components
1. **DemoSettings.tsx** - Uses clientContextStore, allows manual config
2. **DemoWrapper.tsx** - Syncs userStore → clientContextStore
3. **DemoClientApp.tsx** - Reads productId from clientContextStore
4. **OperationsDashboard.tsx** - Validates API key, shows error UI

### 📝 APITestingPage State Management
- APITestingPage has **multi-organization** key management
- Stores keys per organization: `{ productId: apiKey }`
- More sophisticated than clientContextStore (which manages ONE active context)
- **Keep as-is** - This is the correct pattern for multi-org management
- When switching orgs, should update clientContextStore with active context

### 🔜 Future Enhancements
1. Add API key validation UI (show if key is valid/invalid)
2. Add key rotation UI
3. Sync APITestingPage active org → clientContextStore
4. (Future) Master admin dashboard with bypass key

## How to Fix Missing API Key Issues (Updated 2025-11-28)

### Step 1: Ensure Key is Stored in clientContextStore

```typescript
// After generating API key (or manual input via DemoSettings)
import { useClientContext } from '@/store/clientContextStore'

// In your component:
const { setClientContext } = useClientContext()

setClientContext({
  clientId: '9be8eac3-a21d-4f1a-a846-65751d6d6fa9',  // UUID from database
  productId: 'test_product_001',                      // Product ID
  apiKey: 'test_pk_2a2463f87bfd6756822f48698fedd4ef'
})

// ✅ This automatically syncs to:
// - localStorage['b2b:client_id']
// - localStorage['b2b:product_id']
// - localStorage['b2b:api_key'] ← Used by b2bApiClient
```

### Step 2: Verify b2bApiClient Uses It

```typescript
// Already implemented in b2bApiClient.ts
this.axios.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('b2b:api_key')
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  return config
})
```

### Step 3: Check Backend Receives It

```bash
# Test manually
curl -X GET "http://localhost:3002/api/v1/deposits/pending" \
  -H "x-api-key: test_pk_2a2463f87bfd6756822f48698fedd4ef"
```

### Step 4: Debug Client Context

```typescript
// In any component
import { useClientContext } from '@/store/clientContextStore'

const { clientId, productId, apiKey, hasContext, hasApiKey } = useClientContext()

console.log('Client context:', {
  hasContext: hasContext(),
  hasApiKey: hasApiKey(),
  clientId: clientId?.substring(0, 8) + '...',
  productId,
})
```

## Security Best Practices

### ✅ DO:
- Store API key in localStorage (encrypted in production)
- Use HTTPS in production
- Rotate keys periodically
- Log all API key usage
- Rate limit per API key

### ❌ DON'T:
- Hardcode API keys in code
- Commit API keys to git
- Share API keys between clients
- Use API keys client-side without proxy (for production)
- Store keys in cookies (XSS risk)

## Summary

**Current Setup:**
- Dashboard is for **B2B clients** (not admins)
- Each client has **their own API key**
- API key stored in **userStore + localStorage**
- All API calls **automatically include** the key
- Backend **validates and filters** by client ID

**Next Steps:**
1. Fix APITestingPage to use apiStore ✅
2. Ensure all operations include API key ✅
3. Add UI for key validation/rotation 🔜
4. (Future) Separate admin dashboard with master key 🔜
