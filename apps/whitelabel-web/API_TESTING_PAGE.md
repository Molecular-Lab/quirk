# API Testing Dashboard - Implementation Summary

## Overview

Created an interactive Swagger-like API testing dashboard for the whitelabel-web app that follows the **INDEX_VAULT_SYSTEM.md** flows step by step.

## Architecture

Following **prod-ref-web** patterns for clean, maintainable API integration:

### File Structure
```
src/
├── api/
│   └── b2bClient.ts          # B2BAPIClient class with all endpoint methods
├── config/
│   ├── axios.ts              # Axios instance with auth interceptors
│   └── queryKeys.ts          # Centralized React Query keys
└── feature/
    └── dashboard/
        └── APITestingPage.tsx # Interactive API testing UI
```

### Key Components

#### 1. **B2B API Client** (`api/b2bClient.ts`)
- Singleton instance: `b2bApiClient`
- Type-safe methods for all endpoints
- Automatic auth header injection via interceptors

```typescript
// Example usage
const user = await b2bApiClient.createUser({
  user_id: "user_123",
  user_type: "retail"
})
```

#### 2. **Axios Configuration** (`config/axios.ts`)
- Request interceptor: Auto-adds `Authorization: Bearer ${apiKey}` from localStorage
- Response interceptor: Handles 401/403/404/500 errors
- 30s timeout, JSON content-type

#### 3. **Query Keys** (`config/queryKeys.ts`)
- Centralized constants for React Query
- Type-safe key generation
- Ready for `useQuery` hooks

```typescript
// Example query keys
B2BQueryKeys.user.balance(userId, chain, token)
B2BQueryKeys.vault.index(vaultId)
```

#### 4. **API Testing Dashboard** (`feature/dashboard/APITestingPage.tsx`)
- Routes each endpoint to appropriate `b2bApiClient` method
- Auto-saves API key from client registration
- Interactive form with real HTTP calls

## Features

✅ **9 Complete API Flows** - Each flow from INDEX_VAULT_SYSTEM.md as an interactive card  
✅ **Real API Integration** - Uses `b2bApiClient` singleton with axios interceptors  
✅ **Type-Safe API Calls** - All methods typed in B2BAPIClient class  
✅ **Auto API Key Management** - Automatic save/load/populate of API keys (see [API_KEY_MANAGEMENT.md](./API_KEY_MANAGEMENT.md))  
✅ **Centralized Query Keys** - Ready for React Query integration  
✅ **Input Parameters** - Editable form inputs for each API endpoint  
✅ **Execute Button** - Test APIs with real HTTP calls via b2bApiClient  
✅ **Response Viewer** - JSON response display with syntax highlighting  
✅ **Copy to Clipboard** - Easy copying of responses  
✅ **Collapsible Cards** - Clean UI with expand/collapse functionality  
✅ **Method Badges** - Color-coded HTTP methods (GET/POST/PUT/DELETE)  
✅ **Flow Labels** - Clear FLOW 1-9 labels matching the documentation

## Files Created

### 1. Main Component
**`src/feature/dashboard/APITestingPage.tsx`**
- Interactive API testing dashboard
- 9 API endpoint cards with full parameter inputs
- Mock execution with response display
- Clean, professional UI matching the dashboard design

### 2. Route
**`src/routes/dashboard/api-testing.tsx`**
- TanStack Router route definition
- Path: `/dashboard/api-testing`

### 3. Navigation Update
**`src/layouts/DashboardLayout.tsx`**
- Added "API Testing" to sidebar navigation
- Icon: Webhook (lucide-react)

## API Endpoints Included

### FLOW 1: Client Registration
- **POST** `/api/v1/clients/register`
- Create new client organization

### FLOW 2: Configure Vault Strategies
- **POST** `/api/v1/clients/{id}/strategies`
- Define DeFi strategy allocation

### FLOW 3: Create End User
- **POST** `/api/v1/users`
- Create end-user account

### FLOW 4a: Initiate Deposit
- **POST** `/api/v1/deposits`
- Start deposit via on-ramp

### FLOW 4b: Complete Deposit
- **POST** `/webhooks/bitkub`
- Webhook callback from payment provider

### FLOW 5: Get User Balance
- **GET** `/api/v1/users/{user_id}/balance`
- Retrieve vault balance with yield

### FLOW 7: Update Index with Yield
- **POST** `/api/v1/vaults/{vault_id}/yield`
- Update vault index (internal/cron)

### FLOW 8: Request Withdrawal
- **POST** `/api/v1/withdrawals`
- User withdrawal request

### FLOW 9: List User Vaults
- **GET** `/api/v1/users/{user_id}/vaults`
- Get all user vaults

## How to Use

### 1. Start the Dev Server
```bash
cd apps/whitelabel-web
pnpm dev
```

Server runs at: **http://localhost:5173/**

### 2. Navigate to API Testing
- Login to the dashboard
- Click **"API Testing"** in the sidebar (Webhook icon)
- Or navigate directly to: `http://localhost:5173/dashboard/api-testing`

### 3. Test an Endpoint
1. **Expand a card** - Click on any API card to expand it
2. **Fill parameters** - Enter values in the input fields (defaults provided)
3. **Execute** - Click the "Execute" button
4. **View response** - See the JSON response below
5. **Copy response** - Use the copy icon to copy JSON

## Example: Testing Deposit Flow

```typescript
// FLOW 4: Initiate Deposit
{
  "api_key": "pk_live_abc123...",
  "user_id": "grab_driver_12345",
  "amount": 10000,
  "currency": "THB",
  "chain": "ethereum",
  "token": "USDC",
  "payment_method": "promptpay"
}

// Response:
{
  "order_id": "dep_1234567890_abc",
  "payment_url": "https://pay.bitkub.com/...",
  "qr_code": "data:image/png;base64,...",
  "expires_at": "2024-01-15T10:00:00Z"
}
```

## Next Steps - Integration

### ✅ Connected to Real b2b-api-new Backend

The API Testing Dashboard is now connected to your real b2b-api-new server!

**Key Features:**
- ✅ Real HTTP requests to `http://localhost:3002`
- ✅ Automatic path parameter replacement (e.g., `{user_id}`)
- ✅ API key authentication via `Authorization: Bearer` header
- ✅ Query parameters for GET requests
- ✅ Request body for POST/PUT requests
- ✅ Console logging for debugging
- ✅ Error handling with helpful messages

**Configuration:**
Update the B2B API URL in `.env`:
```bash
VITE_B2B_API_URL=http://localhost:3002
```

**Before Testing:**
1. **Start b2b-api-new server:**
   ```bash
   cd apps/b2b-api-new
   pnpm dev
   ```
   Server should be running on `http://localhost:3002`

2. **Start whitelabel-web:**
   ```bash
   cd apps/whitelabel-web
   pnpm dev
   ```
   Dashboard at `http://localhost:5173`

### Testing Workflow

1. **Client Registration (FLOW 1)**
   - Execute this first to get an `api_key`
   - Copy the `api_key` from the response
   - Use it in subsequent requests

2. **Create End User (FLOW 3)**
   - Paste the `api_key` from Step 1
   - Creates a user account

3. **Initiate Deposit (FLOW 4)**
   - Use the same `api_key`
   - Creates deposit transaction

4. **Get User Balance (FLOW 5)**
   - Check user's vault balance
   - See shares and effective balance

5. **Request Withdrawal (FLOW 8)**
   - Test withdrawal flow
   - Provide `vaultId` in format: `chain-tokenAddress`

### Example Test Sequence

```typescript
// 1. Register Client
POST /api/v1/clients/register
{
  "company_name": "GrabPay",
  "business_type": "fintech",
  "privy_organization_id": "privy_org_123"
}
// Response: { api_key: "..." }

// 2. Create User
POST /api/v1/users
Headers: { Authorization: "Bearer <api_key>" }
{
  "user_id": "grab_driver_12345",
  "user_type": "custodial"
}

// 3. Create Deposit
POST /api/v1/deposits
Headers: { Authorization: "Bearer <api_key>" }
{
  "vaultId": "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "userId": "grab_driver_12345",
  "amount": "100",
  "transactionHash": "0xabc123..."
}

// 4. Get Balance
GET /api/v1/users/grab_driver_12345/balance?chain=base&token=USDC
Headers: { Authorization: "Bearer <api_key>" }
```

### Debugging

Open browser DevTools Console to see:
- Request URLs
- Headers sent
- Request body
- Response status and data

Example console output:
```
[API Test] POST http://localhost:3002/api/v1/clients/register
[API Test] Headers: { Content-Type: "application/json" }
[API Test] Body: {"company_name":"GrabPay",...}
[API Test] Response (201): { client_id: "...", api_key: "..." }
```

### Add Authentication
- Use Privy API key from client registration
- Store in localStorage or context
- Auto-populate api_key fields

### Add Request History
- Store past requests in state
- Show recent executions
- Export test collection

## Design Highlights

- **Consistent with Dashboard** - Matches the existing Glider-style design
- **Color-coded Methods** - Green (POST), Blue (GET), Yellow (PUT), Red (DELETE)
- **Expandable Cards** - Clean collapsed state, detailed expanded view
- **Syntax Highlighting** - JSON responses with proper formatting
- **Loading States** - "Executing..." feedback during requests
- **Status Indicators** - Green (200 OK) / Red (errors)

## Access

🌐 **Local URL**: http://localhost:5173/dashboard/api-testing

📱 **Navigation**: Dashboard → API Testing (Webhook icon in sidebar)

---

**Status**: ✅ Complete and Ready for Testing

**Dev Server**: Currently running on port 5173
