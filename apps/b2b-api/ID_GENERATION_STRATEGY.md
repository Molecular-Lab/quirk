# ID Generation Strategy - B2B API

## 🔐 Security Principle: Backend-Generated IDs

**All critical identifiers MUST be generated on the backend**, not accepted from frontend requests. This prevents:
- ID collisions
- Security vulnerabilities (predictable IDs)
- Unauthorized access
- Data integrity issues

---

## 📋 Two-Phase Approach

### Phase 1: Client Registration (Account Creation)
**Endpoint**: `POST /api/v1/clients`

**Generated**:
- ✅ Product ID (UUID-based)
- ❌ API Key (NOT generated yet)
- ❌ Webhook Secret (NOT generated yet)

**Why?** Client registration creates the Product Owner account. Integration credentials are generated separately when the client is ready to integrate.

### Phase 2: API Key Generation (Integration Setup)
**Endpoint**: `POST /api/v1/clients/:id/generate-api-key` *(to be implemented)*

**Generated**:
- ✅ API Key (cryptographically secure)
- ✅ Webhook Secret (cryptographically secure)

**Why?** Separates account creation from integration setup, allowing:
- Client to configure settings before getting API access
- Ability to regenerate/rotate keys
- Better security (keys only generated when needed)

---

## 📋 Generated Fields

### 1. **Product ID** (`productId`)
**Format**: `prod_{uuid}`  
**Example**: `prod_a3f8b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o`  
**Generated**: Phase 1 (Client Registration)  
**Purpose**: Unique identifier for each Product Owner (Client)

```typescript
import { randomUUID } from 'crypto';
const productId = `prod_${randomUUID()}`;
```

**Why UUID?**
- Industry standard (RFC 4122)
- Cryptographically secure randomness
- Globally unique (no collisions)
- URL-safe and database-friendly
- 128-bit entropy

---

### 2. **API Key** (`api_key`)
**Format**: `sk_live_{base64url}` or `sk_test_{base64url}`  
**Example**: `sk_live_AbC123XyZ...` (64+ characters)  
**Generated**: Phase 2 (API Key Generation) - **NOT at client creation**  
**Purpose**: Authentication token for API requests

```typescript
import crypto from 'crypto';

// Generate secure API key
const apiKey = `sk_live_${crypto.randomBytes(32).toString('base64url')}`;
// Hash for storage
const apiKeyHash = await bcrypt.hash(apiKey, 10);
```

**Why separate generation?**
- ✅ Client may not be ready to integrate immediately after registration
- ✅ Allows key rotation without recreating client
- ✅ Better security audit trail
- ✅ Can set expiration dates
- ✅ Similar to GitHub/Stripe token generation flow

---

### 3. **Webhook Secret** (`webhook_secret`)
**Format**: `whsec_{base64url}`  
**Example**: `whsec_k7m9p2a5nAbC123XyZ...`  
**Generated**: Phase 2 (with API Key) - **NOT at client creation**  
**Purpose**: HMAC signature verification of webhook payloads

```typescript
const webhookSecret = `whsec_${crypto.randomBytes(32).toString('base64url')}`;
```

**Usage**: Client uses this to verify webhook requests are from Proxify
```typescript
// Webhook sender (Proxify)
const signature = crypto.createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Webhook receiver (Client)
const expectedSignature = crypto.createHmac('sha256', webhookSecret)
  .update(requestBody)
  .digest('hex');
if (signature === expectedSignature) {
  // Valid webhook
}
```

---

### 4. **Privy Wallet Address** (`privyWalletAddress`)
**Format**: `privy_wallet_{timestamp}` (fallback) or real Ethereum address  
**Example**: `0xabc123...` or `privy_wallet_1732012345678`  
**Generated**: Backend router layer (fallback only)  
**Purpose**: Placeholder if not provided by Privy API

```typescript
privyWalletAddress: body.privyWalletAddress || `privy_wallet_${Date.now()}`
```

**⚠️ Note**: In production, this should come from Privy API after creating organization.

---

## 🔄 Complete Flow

### Step 1: Client Registration (Phase 1)
```typescript
// Frontend sends minimal data
POST /api/v1/clients
{
  "companyName": "GrabPay",
  "businessType": "fintech", 
  "walletType": "MANAGED",
  "privyOrganizationId": "privy:user:abc123"
}

// Backend generates ONLY Product ID
productId: "prod_a3f8b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o"
apiKeyHash: "pending_generation"  // Placeholder
webhookSecret: undefined          // Not generated yet

// Response - NO API key yet
{
  "id": "uuid-abc-123",
  "productId": "prod_a3f8b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
  "companyName": "GrabPay",
  "businessType": "fintech",
  "walletType": "custodial",
  "isActive": true,
  "createdAt": "2024-11-19T10:00:00Z"
  // ⚠️ No api_key or webhook_secret here
}
```

### Step 2: API Key Generation (Phase 2) - Future Implementation
```typescript
// When client is ready to integrate
POST /api/v1/clients/{id}/generate-api-key
Authorization: Bearer {user_session_token}

// Backend generates secure credentials
apiKey: "sk_live_AbC123XyZ456..." (64 chars)
webhookSecret: "whsec_k7m9p2a5nAbC123..." (64 chars)
apiKeyHash: await bcrypt.hash(apiKey, 10)

// Update database
UPDATE clients SET
  api_key_hash = {hash},
  webhook_secret = {encrypted_secret},
  api_key_created_at = NOW()
WHERE id = {id}

// Response - credentials returned ONCE
{
  "api_key": "sk_live_AbC123XyZ456...",
  "webhook_secret": "whsec_k7m9p2a5nAbC123...",
  "productId": "prod_a3f8b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
  "createdAt": "2024-11-19T10:30:00Z",
  "message": "Save these credentials securely. They will not be shown again."
}
```

---

## 🚫 What Should NOT Come from Frontend

| Field | Why Backend-Generated | Security Risk if Frontend-Controlled |
|-------|----------------------|-------------------------------------|
| `productId` | Must be globally unique | Client could reuse existing IDs → data corruption |
| `apiKey` | Needs cryptographic security | Client could create weak keys → unauthorized access |
| `webhookSecret` | Needs to be unpredictable | Client could guess secrets → webhook spoofing |

---

## ✅ What CAN Come from Frontend

| Field | Why Frontend-Provided | Validation Required |
|-------|----------------------|---------------------|
| `companyName` | User input | Length, character validation |
| `businessType` | User selection | Enum validation |
| `walletType` | User choice | Enum: "MANAGED" or "USER_OWNED" |
| `privyOrganizationId` | From Privy authentication | Format validation, existence check |
| `description` | User input (optional) | Length validation |
| `websiteUrl` | User input (optional) | URL validation |

---

## 🎯 Best Practices

### 1. **Separate Account Creation from API Access**
```typescript
// ✅ GOOD - Two-phase approach
// Phase 1: Create account
POST /api/v1/clients
Response: { id, productId, companyName, ... }  // No API key

// Phase 2: Generate API credentials (when ready)
POST /api/v1/clients/{id}/generate-api-key
Response: { api_key, webhook_secret }  // Returned once!

// ❌ BAD - Everything at once
POST /api/v1/clients
Response: { id, productId, api_key, ... }  // Premature key generation
```

### 2. **Use UUID for Product IDs**
```typescript
// ✅ GOOD - UUID v4
import { randomUUID } from 'crypto';
const productId = `prod_${randomUUID()}`;
// Result: prod_a3f8b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o

// ❌ BAD - Timestamp-based
const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
// Result: prod_1732012345678_a7k9m2x (predictable, less secure)
```

### 3. **Return Credentials Only Once**
```typescript
// ✅ On API key generation - return full credentials
POST /api/v1/clients/{id}/generate-api-key
Response: { api_key, webhook_secret, message: "Save these!" }

// ✅ On subsequent retrieval - omit sensitive fields
GET /api/v1/clients/{id}
Response: { id, productId, companyName, ... }  // NO api_key/secret
```

### 4. **Log Generation Events (Not Values!)**
```typescript
logger.info("API key generated", {
  clientId: client.id,
  productId,
  // ⚠️ Never log actual keys!
  apiKeyPrefix: "sk_live",
  generatedAt: new Date().toISOString()
});
```

---

## 📊 Summary Table

| Field | Generated When | Format | Example | Returned to Client |
|-------|---------------|--------|---------|-------------------|
| `productId` | Phase 1 (Registration) | `prod_{uuid}` | `prod_a3f8b2c1-...` | ✅ Always |
| `api_key` | Phase 2 (Generate API Key) | `sk_live_{base64url}` | `sk_live_AbC123...` | ✅ Once (at generation) |
| `webhook_secret` | Phase 2 (Generate API Key) | `whsec_{base64url}` | `whsec_k7m9p2a5n...` | ✅ Once (at generation) |
| `privyWalletAddress` | Privy API (or fallback) | `0x...` or `privy_wallet_{ts}` | `0xabc123...` | ❌ Internal only |

---

## 🔮 Future Implementation: API Key Generation Endpoint

```typescript
// POST /api/v1/clients/:id/generate-api-key
generateApiKey: async ({ params }: { params: { id: string } }) => {
  try {
    const client = await clientService.getClientByProductId(params.id);
    
    if (!client) {
      return { status: 404, body: { error: "Client not found" } };
    }
    
    // Check if API key already exists
    if (client.apiKeyHash && client.apiKeyHash !== "pending_generation") {
      return {
        status: 400,
        body: {
          error: "API key already exists. Use regenerate endpoint to rotate.",
        },
      };
    }
    
    // Generate secure credentials
    const apiKey = `sk_live_${crypto.randomBytes(32).toString('base64url')}`;
    const webhookSecret = `whsec_${crypto.randomBytes(32).toString('base64url')}`;
    const apiKeyHash = await bcrypt.hash(apiKey, 10);
    
    // Update database
    await clientService.updateApiCredentials(params.id, {
      apiKeyHash,
      webhookSecret,
    });
    
    // Audit log
    await auditRepository.create({
      clientId: client.id,
      action: "api_key_generated",
      description: "API key and webhook secret generated",
    });
    
    // Return credentials (ONLY ONCE!)
    return {
      status: 200,
      body: {
        api_key: apiKey,
        webhook_secret: webhookSecret,
        productId: client.productId,
        createdAt: new Date().toISOString(),
        message: "⚠️ Save these credentials securely. They will not be shown again.",
      },
    };
  } catch (error: any) {
    logger.error("Error generating API key", { error: error.message });
    return {
      status: 500,
      body: { error: "Failed to generate API key" },
    };
  }
}
```

---

**Last Updated**: November 19, 2024

---

### 2. **API Key Hash** (`apiKeyHash`)
**Format**: `hash_{timestamp}_{random}`  
**Example**: `hash_1732012345678_x3k7m9p2a5n`  
**Generated**: Backend router layer  
**Purpose**: Hashed version of the API key stored in database

```typescript
const apiKeyHash = `hash_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
```

**⚠️ TODO**: In production, this should be:
1. Generate real API key: `sk_live_{uuid}` or `sk_live_{secureRandomString}`
2. Hash it with bcrypt/argon2
3. Store hash in database
4. Return **real key** to client (only once!)

**Current vs Production:**
```typescript
// ❌ Current (simplified for testing)
api_key: apiKeyHash  // Returns the hash itself

// ✅ Production (proper implementation)
const realApiKey = `sk_live_${crypto.randomUUID()}`;
const apiKeyHash = await bcrypt.hash(realApiKey, 10);
// Store apiKeyHash in database
// Return realApiKey to client (only once at creation)
api_key: realApiKey  // Client receives: "sk_live_abc-123-def-456"
```

---

### 3. **Webhook Secret** (`webhookSecret`)
**Format**: `whsec_{random}{random}`  
**Example**: `whsec_k7m9p2a5nx3k7m9p2a5n`  
**Generated**: Backend router layer  
**Purpose**: Secret key for HMAC signature verification of webhook payloads

```typescript
const webhookSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
```

**Usage**: Client uses this to verify webhook requests are from Proxify
```typescript
// Webhook sender (Proxify)
const signature = crypto.createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Webhook receiver (Client)
const expectedSignature = crypto.createHmac('sha256', webhookSecret)
  .update(requestBody)
  .digest('hex');
if (signature === expectedSignature) {
  // Valid webhook
}
```

---

### 4. **Privy Wallet Address** (`privyWalletAddress`)
**Format**: `privy_wallet_{timestamp}`  
**Example**: `privy_wallet_1732012345678`  
**Generated**: Backend router layer (fallback only)  
**Purpose**: Placeholder if not provided by Privy API

```typescript
privyWalletAddress: body.privyWalletAddress || `privy_wallet_${Date.now()}`
```

**⚠️ Note**: In production, this should come from Privy API after creating organization:
```typescript
// Production flow
const privyOrg = await createPrivyOrganization({...});
privyWalletAddress: privyOrg.walletAddress  // Real Privy-managed wallet
```

---

## 🚫 What Should NOT Come from Frontend

| Field | Why Backend-Generated | Security Risk if Frontend-Controlled |
|-------|----------------------|-------------------------------------|
| `productId` | Must be unique globally | Client could reuse existing IDs → data corruption |
| `apiKeyHash` | Needs cryptographic security | Client could create weak keys → unauthorized access |
| `webhookSecret` | Needs to be unpredictable | Client could guess secrets → webhook spoofing |
| `apiKeyPrefix` | Standardized format | Inconsistent prefixes → key validation issues |

---

## ✅ What CAN Come from Frontend

| Field | Why Frontend-Provided | Validation Required |
|-------|----------------------|---------------------|
| `companyName` | User input | Length, character validation |
| `businessType` | User selection | Enum validation |
| `walletType` | User choice | Enum: "MANAGED" or "USER_OWNED" |
| `privyOrganizationId` | From Privy authentication | Format validation, existence check |
| `description` | User input (optional) | Length validation |
| `websiteUrl` | User input (optional) | URL validation |

---

## 🔄 Complete Flow

```typescript
// 1. Frontend sends minimal data
POST /api/v1/clients
{
  "companyName": "GrabPay",
  "businessType": "fintech",
  "walletType": "MANAGED",
  "privyOrganizationId": "privy:user:abc123"  // From Privy auth
}

// 2. Backend generates all IDs
const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const apiKeyHash = `hash_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
const webhookSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${...}`;

// 3. Backend creates entity
await clientRepository.create({
  productId,           // ← Generated
  apiKeyHash,          // ← Generated
  webhookSecret,       // ← Generated
  companyName,         // ← From frontend
  businessType,        // ← From frontend
  ...
});

// 4. Backend returns credentials (only once!)
return {
  id: "uuid-abc-123",
  productId: "prod_1732012345678_a7k9m2x",
  companyName: "GrabPay",
  api_key: "hash_1732012345678_x3k7m9p2a5n",  // TODO: Should be real key
  webhook_secret: "whsec_k7m9p2a5nx3k7m9p2a5n",
  ...
}
```

---

## 🎯 Best Practices

### 1. **Never Trust Frontend for IDs**
```typescript
// ❌ BAD - Accepting productId from frontend
const request = {
  productId: body.productId,  // VULNERABLE!
  ...
};

// ✅ GOOD - Generate in backend
const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const request = {
  productId,  // SECURE!
  ...
};
```

### 2. **Return Credentials Only Once**
```typescript
// ✅ On creation - return full credentials
POST /api/v1/clients
Response: { id, productId, api_key, webhook_secret, ... }

// ✅ On retrieval - omit sensitive fields
GET /api/v1/clients/:id
Response: { id, productId, companyName, ... }  // NO api_key/secret
```

### 3. **Use Proper Crypto for Production**
```typescript
// ❌ Testing/Development
const apiKey = `hash_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

// ✅ Production
import crypto from 'crypto';
const apiKey = `sk_live_${crypto.randomBytes(32).toString('base64url')}`;
const apiKeyHash = await bcrypt.hash(apiKey, 10);
```

### 4. **Log Generation Events**
```typescript
logger.info("Generated credentials", {
  clientId: client.id,
  productId,
  // Never log actual secrets!
  apiKeyPrefix: "sk_live",
  webhookSecretPrefix: "whsec"
});
```

---

## 🔮 Future Improvements

### 1. **Use UUID v4 for Product IDs**
```typescript
import { randomUUID } from 'crypto';
const productId = `prod_${randomUUID()}`;
// Example: prod_a3f8b2c1-4d5e-6f7g-8h9i-0j1k2l3m4n5o
```

### 2. **Implement Real API Key Generation**
```typescript
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Generate secure API key
const apiKey = `sk_live_${crypto.randomBytes(32).toString('base64url')}`;
const apiKeyHash = await bcrypt.hash(apiKey, 10);

// Store hash, return key (only once)
await clientRepository.create({ apiKeyHash, ... });
return { api_key: apiKey };  // Client saves this
```

### 3. **Add API Key Rotation**
```typescript
POST /api/v1/clients/:id/rotate-key
Response: {
  old_key_revoked: true,
  new_api_key: "sk_live_xyz789...",
  expires_at: "2024-12-31T23:59:59Z"
}
```

### 4. **Implement Rate Limiting per API Key**
```typescript
// Track usage per productId/apiKey
await rateLimit.check(apiKey, {
  maxRequests: 1000,
  windowMs: 60000  // 1000 requests per minute
});
```

---

## 📊 Summary Table

| Field | Generated By | Format | Example | Returned to Client |
|-------|-------------|--------|---------|-------------------|
| `productId` | Backend | `prod_{timestamp}_{random}` | `prod_1732012345678_a7k9m2x` | ✅ Always |
| `apiKeyHash` | Backend | `hash_{timestamp}_{random}` | `hash_1732012345678_x3k7m9p2a5n` | ✅ On creation only |
| `webhookSecret` | Backend | `whsec_{random}{random}` | `whsec_k7m9p2a5nx3k7m9p2a5n` | ✅ On creation only |
| `privyWalletAddress` | Privy API (or fallback) | `privy_wallet_{timestamp}` or real address | `0xabc123...` | ❌ Internal only |
| `apiKeyPrefix` | Backend | `sk_live` or `sk_test` | `sk_live` | ❌ Internal only |

---

**Last Updated**: November 19, 2024
