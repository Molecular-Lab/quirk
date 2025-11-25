# Privy + B2B API Integration Flow

## 🔄 Complete Product Owner Registration Flow

### Overview
The **Client Registration** process creates both the Privy Organization and the Proxify Product Owner (Client) entity in a coordinated flow.

---

## 📋 Step-by-Step Flow

### Step 1: Privy Authentication (Frontend)
**Location**: Already handled by `DashboardLayout` and `LoginPage`

```typescript
// User logs in via Privy (email, Google, or wallet)
const { user, authenticated } = usePrivy()

// After authentication, Privy provides:
user.id                    // e.g., "privy:user:abc123" - used as privyOrganizationId
user.email?.address        // e.g., "owner@grabpay.com"
user.wallet?.address       // e.g., "0x123..." (if wallet connected)
```

**What happens:**
- User clicks "Sign In" in the navbar or `/login` page
- Privy modal opens with authentication options
- User authenticates with email/Google/wallet
- Privy returns user object with unique `user.id`

---

### Step 2: Auto-Populate Client Registration Form
**Location**: `APITestingPage.tsx` - Automatically happens via `useEffect`

```typescript
useEffect(() => {
  if (authenticated && user) {
    setFormData((prev) => ({
      ...prev,
      "client-register": {
        ...prev["client-register"],
        privyOrganizationId: user.id,  // Auto-filled from Privy
      },
    }))
  }
}, [authenticated, user])
```

**What happens:**
- When user navigates to `/dashboard/api-testing`
- If authenticated, the `privyOrganizationId` field is auto-populated
- User can now fill in company details (companyName, businessType, etc.)

---

### Step 3: Register Client (Create Product Owner)
**Location**: User clicks "Execute" on FLOW 1

**Request to B2B API:**
```http
POST /api/v1/clients
Content-Type: application/json

{
  "companyName": "GrabPay",
  "businessType": "fintech",
  "walletType": "MANAGED",
  "privyOrganizationId": "privy:user:abc123",  // From Privy
  "description": "Digital wallet for Southeast Asia",
  "websiteUrl": "https://grab.com/pay"
}
```

**Backend Processing (b2b-api):**
1. **Router** (`client.router.ts`) receives request
2. **Maps DTO fields:**
   - `walletType: "MANAGED"` → `"custodial"`
   - `walletManagedBy: "MANAGED"` → `"proxify"`
3. **Generates fields:**
   - `productId: "prod_1732012345678"`
   - `privyWalletAddress: "privy_wallet_1732012345678"` (if not provided)
   - `apiKeyHash`, `apiKeyPrefix`, etc.
4. **Service** calls **UseCase** (`createClient`)
5. **Repository** inserts into `clients` table

**Database Result:**
```sql
INSERT INTO clients (
  product_id,
  company_name,
  business_type,
  wallet_type,              -- 'custodial'
  wallet_managed_by,        -- 'proxify'
  privy_organization_id,    -- 'privy:user:abc123'
  privy_wallet_address,     -- 'privy_wallet_1732012345678'
  is_active,
  is_sandbox
) VALUES (...);
```

**Response:**
```json
{
  "id": "uuid-abc-123",
  "productId": "prod_1732012345678",
  "companyName": "GrabPay",
  "businessType": "fintech",
  "walletType": "custodial",
  "privyOrganizationId": "privy:user:abc123",
  "isActive": true,
  "createdAt": "2024-11-19T10:00:00Z",
  "updatedAt": "2024-11-19T10:00:00Z"
}
```

---

## 🎯 Key Points

### 1. **Privy as Source of Truth for Organization ID**
- Each logged-in user has a unique Privy ID (`user.id`)
- This ID is used as `privyOrganizationId` in the Client entity
- Links the Product Owner to their Privy authentication

### 2. **One Privy User = One Product Owner**
- In production, each company/organization should have ONE Privy account
- That Privy account creates ONE Product Owner (Client) entity
- The Product Owner can then create MANY End Users via FLOW 3

### 3. **Testing vs Production**
- **Testing (current)**: Using placeholder `"privy_org_123"` or authenticated user's ID
- **Production (future)**: 
  - Should call Privy API to create dedicated organization
  - Get real organization ID and wallet address
  - Then pass to `POST /api/v1/clients`

---

## 🔐 Data Flow Diagram

```
┌─────────────────┐
│  User Signs In  │
│  via Privy      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Privy Returns:         │
│  - user.id              │
│  - user.email.address   │
│  - user.wallet.address  │
└────────┬────────────────┘
         │
         │ Auto-populate
         ▼
┌─────────────────────────────┐
│  Client Registration Form   │
│  (APITestingPage)           │
│                             │
│  ✓ privyOrganizationId      │
│  ○ companyName (manual)     │
│  ○ businessType (manual)    │
│  ○ walletType (manual)      │
└────────┬────────────────────┘
         │
         │ User clicks "Execute"
         ▼
┌─────────────────────────────┐
│  POST /api/v1/clients       │
│  (b2b-api)                  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Database: clients table    │
│                             │
│  ✓ product_id (generated)   │
│  ✓ company_name             │
│  ✓ privy_organization_id    │
│  ✓ wallet_type='custodial'  │
│  ✓ wallet_managed_by='proxify' │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Response: ClientDto        │
│  (Product Owner created!)   │
└─────────────────────────────┘
```

---

## 🚀 Future Production Enhancement

### Current Flow:
```typescript
// Step 1: User authenticates with Privy
const { user } = usePrivy()

// Step 2: Use Privy user ID directly
await b2bApiClient.registerClient({
  privyOrganizationId: user.id,  // ← Privy user ID
  ...
})
```

### Future Production Flow:
```typescript
// Step 1: User authenticates with Privy
const { user } = usePrivy()

// Step 2: Create dedicated Privy Organization (via Privy API)
const privyOrg = await createPrivyOrganization({
  name: "GrabPay",
  ownerUserId: user.id,
})
// Returns: { id: "privy:org:xyz789", walletAddress: "0xabc..." }

// Step 3: Register client with real Privy org data
await b2bApiClient.registerClient({
  privyOrganizationId: privyOrg.id,           // ← Real org ID
  privyWalletAddress: privyOrg.walletAddress, // ← Real wallet
  ...
})
```

**Why?**
- Dedicated organization per Product Owner
- Separate user accounts from organization accounts
- Real managed wallets via Privy's embedded wallet infrastructure

---

## 📝 Summary

| Step | Action | Where | Result |
|------|--------|-------|--------|
| 1 | User logs in | `LoginPage` / Navbar | Privy `user.id` obtained |
| 2 | Navigate to API Testing | `/dashboard/api-testing` | Form auto-populated with `privyOrganizationId` |
| 3 | Fill company details | `APITestingPage` form | Company name, business type, wallet type |
| 4 | Click "Execute" | `FLOW 1: Client Registration` | POST to `/api/v1/clients` |
| 5 | Backend creates entity | `b2b-api` → Database | New row in `clients` table |
| 6 | Response returned | Display in UI | Product Owner created! |

---

## ✅ Current Status

- ✅ Privy authentication working
- ✅ Auto-populate `privyOrganizationId` from logged-in user
- ✅ Client registration endpoint fully functional
- ✅ Database constraints fixed (custodial, proxify, etc.)
- ✅ Visual indicators in UI (🔐 Requires Privy badge)
- ⚠️ API key not returned in response (TODO: backend needs to add to DTO)
- ❌ Real Privy Organization creation (future enhancement)

---

## 🎨 UI Enhancements Added

1. **Privy Authentication Status Card**
   - Shows connection status (Connected/Not Connected)
   - Displays Privy User ID and email
   - Explains auto-population behavior

2. **"🔐 Requires Privy" Badge**
   - Purple badge on Client Registration card
   - Indicates this endpoint uses Privy data

3. **Auto-Population**
   - `privyOrganizationId` automatically filled when authenticated
   - No manual copy-paste needed

---

**Last Updated**: November 19, 2024
