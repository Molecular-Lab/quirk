# Refactor Plan: SDK, API Key Management, Demo Flow & On-Off Ramp

**Status:** Planning Phase
**Priority:** High
**Created:** 2025-12-08
**Target:** Complete B2B2C platform with production-ready SDK, API key management, demo testing, and on-off ramp integration

---

## 📋 Current State Analysis

### ✅ What's Working

**SDK Foundation (`packages/b2b-sdk/`):**
- ✅ Basic client structure with resource-based API (`client.ts`)
- ✅ Resource classes: ClientResource, UserResource, DepositResource, WithdrawalResource, DeFiResource, DashboardResource, VaultResource
- ✅ React hooks: `useDeposit`, `useEndUser`, `useWithdraw`
- ✅ React context: `QuirkProvider`, `useQuirkContext`
- ✅ Error handling utilities
- ✅ HTTP client with retry logic
- ✅ TypeScript type exports

**API Key Management (`apps/b2b-api/src/middleware/apiKeyAuth.ts` + `packages/core/usecase/b2b/client.usecase.ts`):**
- ✅ API key generation during client registration (`generateApiKey`)
- ✅ API key regeneration endpoint (`regenerateApiKey`)
- ✅ Bcrypt-based hashing with prefix-based fast lookup
- ✅ Environment separation (`prod_pk_` vs `test_pk_`)
- ✅ Constant-time comparison via bcrypt
- ✅ API key shown only once during registration/regeneration
- ✅ Audit logging for API key operations

**Demo Flow (`apps/whitelabel-web/src/`):**
- ✅ Demo product store (`store/demoProductStore.ts`)
- ✅ Demo end-user store (`store/demoStore.ts`)
- ✅ Client context store (`store/clientContextStore.ts`)
- ✅ API Testing Page with endpoint testing (`feature/dashboard/APITestingPage.tsx`)
- ✅ Multi-org API key management (localStorage-based)

**Ramp Operations (`apps/whitelabel-web/src/feature/dashboard/RampOperationsPage.tsx`):**
- ✅ UI for viewing pending deposits
- ✅ Batch on-ramp selection
- ✅ Integration with deposit API (`listPendingDeposits`)

### ⚠️ What Needs Work

**SDK Gaps:**
- ❌ Missing comprehensive error handling examples in README
- ❌ No SDK usage examples for common workflows (deposit → stake → withdraw)
- ❌ Missing SDK configuration options documentation (timeout, retries)
- ❌ No webhook handling utilities
- ❌ Limited React hook examples
- ❌ Missing SDK versioning strategy
- ❌ No SDK changelog

**API Key Management Gaps:**
- ❌ No API key visualization dashboard (show prefix, created date, last used)
- ❌ No API key usage analytics (request count, last request timestamp)
- ❌ No API key rotation workflow UI
- ❌ No API key permissions/scopes management
- ❌ No rate limiting per API key visibility
- ❌ No API key audit trail visualization

**Demo Flow Gaps:**
- ❌ No end-to-end demo flow documentation
- ❌ Missing demo data reset functionality
- ❌ No guided tour for new users
- ❌ Limited error recovery in demo flow
- ❌ No demo progress tracking
- ❌ Missing demo analytics (where users drop off)

**On-Off Ramp Gaps:**
- ❌ No actual on-ramp provider integration (TransFi, ZeroHash, Bridge, Magic)
- ❌ No off-ramp completion flow
- ❌ Missing batch processing optimization
- ❌ No ramp provider webhook handling
- ❌ No ramp transaction status tracking
- ❌ Missing fiat → crypto conversion UI
- ❌ No crypto → fiat off-ramp UI

---

## 🎯 Refactor Goals

### 1. Complete SDK Implementation

**Goal:** Production-ready SDK with comprehensive documentation and examples

**Tasks:**

#### 1.1 SDK Documentation Enhancement
- [ ] Create comprehensive README with:
  - Installation guide
  - Quick start examples
  - Authentication setup
  - Complete API reference
  - Error handling patterns
  - Webhook integration guide
- [ ] Add JSDoc comments to all public methods
- [ ] Create SDK changelog (CHANGELOG.md)
- [ ] Add SDK versioning guide
- [ ] Create migration guides for breaking changes

**File Locations:**
- `packages/b2b-sdk/README.md` (enhance existing)
- `packages/b2b-sdk/CHANGELOG.md` (create)
- `packages/b2b-sdk/docs/MIGRATION.md` (create)
- `packages/b2b-sdk/docs/EXAMPLES.md` (create)

#### 1.2 SDK Examples & Guides
- [ ] Create example workflows:
  - Complete deposit flow (fiat → crypto → stake)
  - Complete withdrawal flow (unstake → crypto → fiat)
  - User creation and management
  - Balance checking and updates
  - Strategy configuration
  - Vault management
- [ ] Add React integration examples
- [ ] Add Node.js backend examples
- [ ] Create error handling cookbook

**File Locations:**
- `packages/b2b-sdk/examples/deposit-flow.ts` (create)
- `packages/b2b-sdk/examples/withdrawal-flow.ts` (create)
- `packages/b2b-sdk/examples/react-integration.tsx` (create)
- `packages/b2b-sdk/examples/nodejs-backend.ts` (create)

#### 1.3 SDK Webhook Utilities
- [ ] Create webhook signature verification utility
- [ ] Add webhook event type definitions
- [ ] Create webhook handler examples
- [ ] Add webhook retry logic helpers

**File Locations:**
- `packages/b2b-sdk/src/utils/webhooks.ts` (create)
- `packages/b2b-sdk/src/types/webhooks.ts` (create)

#### 1.4 SDK Testing & Quality
- [ ] Add unit tests for all resource methods
- [ ] Add integration tests for complete flows
- [ ] Add mock server for testing
- [ ] Set up CI/CD for SDK releases

**File Locations:**
- `packages/b2b-sdk/src/__tests__/` (create test directory)
- `packages/b2b-sdk/src/__mocks__/` (create mock directory)

---

### 2. API Key Management & Visualization

**Goal:** Production-grade API key management with full visibility and audit trail

**Tasks:**

#### 2.1 API Key Dashboard UI
- [ ] Create API Key Management Page in Dashboard:
  - Display all API keys for organization
  - Show API key prefix (last 8 chars)
  - Display created date
  - Show last used timestamp
  - Display request count (last 24h, 7d, 30d)
  - Show active/inactive status
- [ ] Add API key regeneration button
- [ ] Add "Copy API Key" functionality (only on regeneration)
- [ ] Add confirmation dialog for regeneration
- [ ] Display API key security tips

**File Locations:**
- `apps/whitelabel-web/src/feature/dashboard/APIKeyManagementPage.tsx` (create)
- `apps/whitelabel-web/src/routes/dashboard/api-keys.tsx` (create route)

#### 2.2 API Key Usage Analytics
- [ ] Track API key usage in database:
  - Add `api_key_usage` table
  - Track request count per endpoint
  - Track last request timestamp
  - Track error count
- [ ] Create analytics service:
  - Get usage stats by API key
  - Get usage trends (daily/weekly/monthly)
  - Get most used endpoints
- [ ] Add usage visualization:
  - Request count chart
  - Error rate chart
  - Endpoint usage breakdown

**File Locations:**
- `database/migrations/000006_api_key_usage.up.sql` (create)
- `database/queries/api_key_usage.sql` (create)
- `packages/core/service/api-key-analytics.service.ts` (create)
- `apps/b2b-api/src/router/api-key-analytics.router.ts` (create)

#### 2.3 API Key Middleware Enhancement
- [ ] Add usage tracking to API key middleware
- [ ] Add rate limiting per API key
- [ ] Add API key expiration support (optional)
- [ ] Add API key scope/permissions validation

**File Locations:**
- `apps/b2b-api/src/middleware/apiKeyAuth.ts` (enhance)
- `apps/b2b-api/src/middleware/rateLimiting.ts` (create)

#### 2.4 API Key Audit Trail
- [ ] Enhance audit logging for API key operations:
  - API key created
  - API key regenerated
  - API key used (with endpoint)
  - API key failed authentication
- [ ] Create audit trail visualization UI
- [ ] Add filtering and search for audit logs

**File Locations:**
- `apps/whitelabel-web/src/feature/dashboard/AuditLogViewer.tsx` (create)
- `packages/core/usecase/b2b/audit.usecase.ts` (enhance)

---

### 3. Demo Flow Enhancement & Testing

**Goal:** Seamless demo experience with guided onboarding and comprehensive testing

**Tasks:**

#### 3.1 Guided Demo Tour
- [ ] Create interactive product tour:
  - Step 1: Product selection
  - Step 2: API key display
  - Step 3: Create end-user
  - Step 4: Deposit flow
  - Step 5: View balance
  - Step 6: Withdrawal flow
- [ ] Add tooltips for key actions
- [ ] Add progress indicator
- [ ] Add skip/restart tour options

**File Locations:**
- `apps/whitelabel-web/src/components/demo/DemoTour.tsx` (create)
- `apps/whitelabel-web/src/store/demoTourStore.ts` (create)

#### 3.2 Demo Data Management
- [ ] Create demo reset functionality:
  - Clear demo user data
  - Clear demo deposits
  - Clear demo withdrawals
  - Reset to initial state
- [ ] Add demo data seeding:
  - Pre-populate example users
  - Pre-populate example transactions
  - Pre-populate example balances
- [ ] Add demo mode indicator
- [ ] Add "Exit Demo" flow

**File Locations:**
- `apps/whitelabel-web/src/api/demoHelpers.ts` (create)
- `apps/b2b-api/src/router/demo.router.ts` (create)

#### 3.3 Demo Flow Documentation
- [ ] Create end-to-end demo guide
- [ ] Document common demo errors and solutions
- [ ] Create demo video walkthrough script
- [ ] Add demo troubleshooting guide

**File Locations:**
- `docs/DEMO_GUIDE.md` (create)
- `docs/DEMO_TROUBLESHOOTING.md` (create)

#### 3.4 Demo Analytics
- [ ] Track demo user journey:
  - Where users drop off
  - Time spent on each step
  - Error rates
- [ ] Create demo analytics dashboard
- [ ] Add demo conversion metrics

**File Locations:**
- `apps/whitelabel-web/src/utils/demoAnalytics.ts` (create)
- `apps/whitelabel-web/src/feature/dashboard/DemoAnalyticsPage.tsx` (create)

---

### 4. On-Off Ramp Services Integration

**Goal:** Complete fiat-to-crypto and crypto-to-fiat integration with production providers

**Tasks:**

#### 4.1 On-Ramp Provider Integration
- [ ] Integrate TransFi:
  - Fiat → USDC/USDT conversion
  - Payment method handling
  - Transaction status webhooks
- [ ] Integrate ZeroHash (alternative):
  - Same functionality as TransFi
- [ ] Create provider abstraction layer:
  - Common interface for all providers
  - Provider switching logic
  - Provider fallback handling

**File Locations:**
- `packages/core/service/onramp/transfi.service.ts` (create)
- `packages/core/service/onramp/zerohash.service.ts` (create)
- `packages/core/service/onramp/provider.interface.ts` (create)
- `packages/core/service/onramp-manager.service.ts` (create)

#### 4.2 Off-Ramp Provider Integration
- [ ] Integrate TransFi:
  - USDC/USDT → Fiat conversion
  - Bank account withdrawal
  - Transaction status webhooks
- [ ] Create off-ramp flow UI:
  - Bank account selection
  - Amount input
  - Conversion rate display
  - Confirmation and submission
- [ ] Add off-ramp status tracking

**File Locations:**
- `packages/core/service/offramp/transfi.service.ts` (create)
- `apps/whitelabel-web/src/feature/dashboard/OffRampModal.tsx` (create)

#### 4.3 Ramp Operations Dashboard Enhancement
- [ ] Add batch on-ramp processing:
  - Select multiple deposits
  - Process in single transaction
  - Gas optimization
- [ ] Add ramp transaction history:
  - Filter by status
  - Filter by date range
  - Export to CSV
- [ ] Add ramp provider status monitoring:
  - Provider uptime
  - Transaction success rate
  - Average processing time

**File Locations:**
- `apps/whitelabel-web/src/feature/dashboard/RampOperationsPage.tsx` (enhance)
- `apps/whitelabel-web/src/feature/dashboard/RampHistoryPage.tsx` (create)

#### 4.4 Ramp Webhook Handling
- [ ] Create webhook endpoints for ramp providers:
  - TransFi webhooks
  - ZeroHash webhooks
- [ ] Add webhook signature verification
- [ ] Add webhook retry logic
- [ ] Add webhook audit logging

**File Locations:**
- `apps/b2b-api/src/router/webhooks/ramp.router.ts` (create)
- `packages/core/service/webhook-handler.service.ts` (create)

---

## 📊 Implementation Priority

### Phase 1: SDK & Documentation (Week 1)
**Priority:** High
**Impact:** Enables client integration

- [ ] 1.1 SDK Documentation Enhancement
- [ ] 1.2 SDK Examples & Guides
- [ ] 1.3 SDK Webhook Utilities

### Phase 2: API Key Management (Week 2)
**Priority:** High
**Impact:** Production-grade security & visibility

- [ ] 2.1 API Key Dashboard UI
- [ ] 2.2 API Key Usage Analytics
- [ ] 2.3 API Key Middleware Enhancement
- [ ] 2.4 API Key Audit Trail

### Phase 3: Demo Flow (Week 3)
**Priority:** Medium
**Impact:** User onboarding experience

- [ ] 3.1 Guided Demo Tour
- [ ] 3.2 Demo Data Management
- [ ] 3.3 Demo Flow Documentation

### Phase 4: On-Off Ramp (Week 4-5)
**Priority:** Critical
**Impact:** Core product functionality

- [ ] 4.1 On-Ramp Provider Integration
- [ ] 4.2 Off-Ramp Provider Integration
- [ ] 4.3 Ramp Operations Dashboard Enhancement
- [ ] 4.4 Ramp Webhook Handling

---

## 🎯 Success Criteria

### SDK Success Metrics
- [ ] README covers all SDK features
- [ ] At least 5 complete workflow examples
- [ ] JSDoc coverage > 90%
- [ ] SDK can be imported and used in < 5 minutes
- [ ] All breaking changes documented in CHANGELOG

### API Key Management Success Metrics
- [ ] Dashboard shows all API key metadata
- [ ] Usage analytics updated in real-time
- [ ] API key regeneration takes < 10 seconds
- [ ] Audit trail shows all key operations
- [ ] Rate limiting prevents API abuse

### Demo Flow Success Metrics
- [ ] New user completes demo in < 10 minutes
- [ ] Demo reset works in < 5 seconds
- [ ] Drop-off rate < 20% at each step
- [ ] Error recovery rate > 90%
- [ ] Demo tour completion rate > 70%

### On-Off Ramp Success Metrics
- [ ] On-ramp transaction success rate > 95%
- [ ] Off-ramp transaction success rate > 95%
- [ ] Average processing time < 5 minutes
- [ ] Webhook delivery success rate > 99%
- [ ] Provider fallback works seamlessly

---

## 📝 Additional Notes

### Security Considerations
- API keys must be stored securely (bcrypt hashing)
- Webhook signatures must be verified
- Rate limiting must be enforced per API key
- Audit logging must be immutable

### Performance Considerations
- Batch ramp operations to minimize gas fees
- Cache API key validation results (Redis)
- Optimize database queries for analytics
- Use connection pooling for ramp providers

### Monitoring & Alerting
- Alert on high API key usage
- Alert on ramp provider failures
- Alert on webhook delivery failures
- Track demo completion rates

---

**Last Updated:** 2025-12-08
**Next Review:** After Phase 1 completion
