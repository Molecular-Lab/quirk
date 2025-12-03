# Proxify B2B API Integration Guide

> **Version:** 1.0.0  
> **Last Updated:** December 3, 2025  
> **Base URL:** `https://api.proxify.fi/api/v1` (Production) | `http://localhost:3001/api/v1` (Development)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Quick Start](#quick-start)
4. [API Endpoints](#api-endpoints)
   - [Client Management](#client-management)
   - [User Management](#user-management)
   - [Deposits (On-Ramp)](#deposits-on-ramp)
   - [Withdrawals (Off-Ramp)](#withdrawals-off-ramp)
   - [Vaults](#vaults)
   - [User Vaults](#user-vaults)
   - [Dashboard](#dashboard)
   - [DeFi Protocols](#defi-protocols)
   - [Privy Accounts](#privy-accounts)
5. [Integration Flows](#integration-flows)
6. [Error Handling](#error-handling)
7. [SDK Examples](#sdk-examples)
8. [Webhooks](#webhooks)

---

## Overview

Proxify B2B API enables businesses to integrate DeFi yield earning capabilities into their applications. Your end-users can deposit fiat or crypto, earn yield through optimized DeFi strategies, and withdraw funds seamlessly.

### Key Features

- **Fiat On-Ramp**: Accept THB, USD, SGD, EUR deposits via bank transfer
- **Crypto Deposits**: Direct USDC/USDT deposits from user wallets
- **Automated Yield**: Funds are automatically deployed to DeFi protocols (AAVE, Compound, Morpho)
- **Custodial Wallets**: Privy-powered custodial wallets for secure fund management
- **Real-time Dashboard**: Track AUM, yield, and user activity

---

## Authentication

All API requests require an API key passed in the `x-api-key` header.

### API Key Format

```
{environment}_pk_{32_hex_characters}
```

- `prod_pk_*` - Production environment
- `test_pk_*` - Sandbox/test environment

### Example Request

```bash
curl -X GET "https://api.proxify.fi/api/v1/clients/product/prod_xxx" \
  -H "x-api-key: prod_pk_1b7b16c00d1c7c25b99ee4cdd13f897f" \
  -H "Content-Type: application/json"
```

### Getting Your API Key

1. Register your organization via `/clients` endpoint
2. Call `/clients/product/{productId}/regenerate-api-key` to generate your API key
3. **Save the API key securely** - it's only shown once!

---

## Quick Start

### 1. Register Your Organization

```bash
POST /clients

{
  "privyOrganizationId": "org_xxx",
  "privyWalletAddress": "0x1234...",
  "companyName": "Acme Corp",
  "businessType": "fintech",
  "walletType": "MANAGED"
}
```

### 2. Generate API Key

```bash
POST /clients/product/{productId}/regenerate-api-key
```

### 3. Register End-User

```bash
POST /users
x-api-key: {your_api_key}

{
  "clientId": "prod_xxx",
  "clientUserId": "user_123",
  "walletAddress": "0x5678..."
}
```

### 4. Create Deposit

```bash
POST /deposits/fiat
x-api-key: {your_api_key}

{
  "userId": "user_123",
  "amount": "10000",
  "currency": "THB",
  "tokenSymbol": "USDC"
}
```

---

## API Endpoints

---

### Client Management

#### Create Client (Organization Registration)

```
POST /clients
```

Register a new B2B organization. Creates a Privy account and custodial wallet.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `privyOrganizationId` | string | ✅ | Privy organization ID |
| `privyWalletAddress` | string | ✅ | Privy custodial wallet address |
| `privyEmail` | string | ❌ | Organization email |
| `companyName` | string | ✅ | Company name |
| `businessType` | string | ✅ | Business type (fintech, e-commerce, etc.) |
| `walletType` | string | ✅ | `MANAGED` or `USER_OWNED` |
| `description` | string | ❌ | Company description |
| `websiteUrl` | string | ❌ | Company website |
| `webhookUrls` | string[] | ❌ | Webhook endpoints for notifications |
| `supportedCurrencies` | string[] | ❌ | Supported fiat currencies |
| `bankAccounts` | object[] | ❌ | Bank accounts for off-ramp |

**Response (201):**

```json
{
  "id": "uuid",
  "productId": "prod_xxx",
  "companyName": "Acme Corp",
  "businessType": "fintech",
  "walletType": "custodial",
  "privyOrganizationId": "org_xxx",
  "supportedCurrencies": ["THB", "USD"],
  "bankAccounts": [],
  "isActive": true,
  "isSandbox": false,
  "createdAt": "2025-12-03T00:00:00.000Z",
  "updatedAt": "2025-12-03T00:00:00.000Z"
}
```

---

#### Get Client by Product ID

```
GET /clients/product/{productId}
```

Retrieve client details by product ID.

**Response (200):**

```json
{
  "id": "uuid",
  "productId": "prod_xxx",
  "companyName": "Acme Corp",
  "businessType": "fintech",
  "walletType": "custodial",
  "privyOrganizationId": "org_xxx",
  "supportedCurrencies": ["THB", "USD"],
  "bankAccounts": [...],
  "isActive": true,
  "isSandbox": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

#### Get Client by ID

```
GET /clients/{id}
```

Retrieve client details by internal UUID.

---

#### List Clients by Privy Organization

```
GET /clients/privy/{privyOrganizationId}
```

List all clients under a Privy organization.

---

#### Regenerate API Key

```
POST /clients/product/{productId}/regenerate-api-key
```

Generate a new API key. **Previous key is invalidated.**

**Response (200):**

```json
{
  "success": true,
  "api_key": "prod_pk_1b7b16c00d1c7c25b99ee4cdd13f897f",
  "productId": "prod_xxx",
  "message": "API key regenerated successfully. Save it securely - it won't be shown again!"
}
```

---

#### Get Client Balance

```
GET /clients/{id}/balance
```

Get client's available and reserved balance.

**Response (200):**

```json
{
  "available": "10000.00",
  "reserved": "500.00",
  "currency": "USD"
}
```

---

#### Update Organization Info

```
PATCH /clients/product/{productId}/organization
```

Update company name, description, website, etc.

**Request Body:**

```json
{
  "companyName": "Acme Corp Updated",
  "businessType": "fintech",
  "description": "Updated description",
  "websiteUrl": "https://acme.com"
}
```

---

#### Update Supported Currencies

```
PATCH /clients/product/{productId}/currencies
```

Update the list of supported fiat currencies for off-ramp.

**Request Body:**

```json
{
  "supportedCurrencies": ["THB", "USD", "SGD"]
}
```

---

#### Configure Bank Accounts (Off-Ramp)

```
POST /clients/product/{productId}/bank-accounts
```

Configure bank accounts for fiat withdrawals.

**Request Body:**

```json
{
  "bankAccounts": [
    {
      "currency": "THB",
      "bank_name": "Kasikorn Bank",
      "account_number": "123-4-56789-0",
      "account_name": "Acme Thailand Co., Ltd.",
      "bank_details": {
        "swift_code": "KASITHBK",
        "promptpay_id": "0891234567"
      }
    }
  ]
}
```

---

#### Get Bank Accounts

```
GET /clients/product/{productId}/bank-accounts
```

Retrieve configured bank accounts.

---

#### Configure Vault Strategies

```
POST /clients/product/{productId}/strategies
```

Configure DeFi strategy allocation for client vaults.

**Request Body:**

```json
{
  "chain": "base",
  "token_address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "token": "USDC",
  "strategies": [
    { "protocol": "aave", "target": 70, "isActive": true },
    { "protocol": "compound", "target": 20, "isActive": true },
    { "protocol": "morpho", "target": 10, "isActive": true }
  ]
}
```

---

#### Fund Operations

```
POST /clients/{id}/add-funds        # Add funds to client balance
POST /clients/{id}/reserve-funds   # Reserve funds for withdrawal
POST /clients/{id}/release-funds   # Release reserved funds
POST /clients/{id}/deduct-funds    # Deduct reserved funds
```

---

### User Management

#### Get or Create User

```
POST /users
```

Creates a new end-user or returns existing user. Idempotent.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | ✅ | Your product ID or client UUID |
| `clientUserId` | string | ✅ | Your internal user ID |
| `walletAddress` | string | ❌ | User's wallet address (if user-owned) |

**Response (200):**

```json
{
  "id": "uuid",
  "clientId": "prod_xxx",
  "userId": "user_123",
  "userType": "custodial",
  "isActive": true,
  "createdAt": "...",
  "vaults": [
    {
      "vaultId": "prod_xxx",
      "totalDeposited": "1000.00",
      "effectiveBalance": "1050.00",
      "yieldEarned": "50.00"
    }
  ]
}
```

---

#### Get User by ID

```
GET /users/{id}
```

---

#### Get User by Client User ID

```
GET /users/client/{clientId}/user/{clientUserId}
```

---

#### List Users by Client

```
GET /users/client/{clientId}?limit=50&offset=0
```

---

#### Get User Portfolio

```
GET /users/{userId}/portfolio
```

Get aggregated portfolio with total balance and yield across all vaults.

---

#### Get User Balance

```
GET /users/{userId}/balance
```

**Response (200):**

```json
{
  "balance": "1050.00",
  "currency": "USD",
  "yield_earned": "50.00",
  "apy": "5.2",
  "status": "active",
  "entry_index": "1000000000000000000",
  "current_index": "1050000000000000000"
}
```

---

#### List User Vaults

```
GET /users/{userId}/vaults
```

---

### Deposits (On-Ramp)

#### Create Fiat Deposit

```
POST /deposits/fiat
```

Initiate a fiat deposit via bank transfer.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | ✅ | End-user ID |
| `amount` | string | ✅ | Fiat amount (e.g., "10000") |
| `currency` | string | ✅ | Fiat currency (THB, USD, SGD, EUR) |
| `tokenSymbol` | string | ✅ | Target crypto token (USDC, USDT) |

**Response (201):**

```json
{
  "orderId": "DEP-1764190127587-vsw0ez9uy",
  "status": "pending",
  "paymentInstructions": {
    "paymentMethod": "bank_transfer",
    "currency": "THB",
    "amount": "10000",
    "reference": "DEP-1764190127587-vsw0ez9uy",
    "bankName": "Kasikorn Bank (K-Bank)",
    "accountNumber": "123-4-56789-0",
    "accountName": "Proxify (Thailand) Co., Ltd.",
    "swiftCode": "KASITHBK",
    "promptPayId": "0891234567",
    "instructions": "Transfer from your THB account. Include reference ID.",
    "paymentSessionUrl": "https://app.proxify.fi/payment-session/DEP-xxx"
  },
  "expectedCryptoAmount": "310.00",
  "expiresAt": "2025-12-04T00:00:00.000Z",
  "createdAt": "2025-12-03T00:00:00.000Z"
}
```

---

#### Get Deposit by Order ID

```
GET /deposits/{orderId}
```

---

#### List Pending Deposits

```
GET /deposits/pending
```

List all pending deposits for operations dashboard.

---

#### Complete Fiat Deposit (Webhook)

```
POST /deposits/fiat/{orderId}/complete
```

Called by payment gateway when bank transfer is confirmed.

**Request Body:**

```json
{
  "chain": "base",
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "cryptoAmount": "310.00",
  "gatewayFee": "5.00",
  "proxifyFee": "3.00",
  "networkFee": "1.00",
  "totalFees": "9.00"
}
```

---

#### Mock Confirm Deposit (Demo Only)

```
POST /deposits/fiat/{orderId}/mock-confirm
```

Simulate bank transfer confirmation for testing.

**Request Body:**

```json
{
  "bankTransactionId": "BANK-123456",
  "paidAmount": "10000",
  "paidCurrency": "THB"
}
```

---

#### Batch Complete Deposits

```
POST /deposits/batch-complete
```

Complete multiple deposits and mint USDC to custodial wallet.

**Request Body:**

```json
{
  "orderIds": ["DEP-xxx", "DEP-yyy"],
  "paidCurrency": "THB"
}
```

---

#### Initiate Crypto Deposit

```
POST /deposits/crypto/initiate
```

For direct crypto deposits from user wallets.

**Request Body:**

```json
{
  "userId": "user_123",
  "chain": "base",
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "tokenSymbol": "USDC",
  "amount": "1000000000"
}
```

**Response (201):**

```json
{
  "orderId": "DEP-xxx",
  "status": "pending",
  "custodialWalletAddress": "0x3F450bC83942c44d38C0Be82CAe8194ce8FE5FE5",
  "chain": "base",
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "tokenSymbol": "USDC",
  "expectedAmount": "1000000000",
  "expiresAt": "...",
  "createdAt": "..."
}
```

---

#### Complete Crypto Deposit

```
POST /deposits/crypto/{orderId}/complete
```

**Request Body:**

```json
{
  "transactionHash": "0xabc123..."
}
```

---

#### List Deposits by Client

```
GET /deposits/client/{clientId}?limit=50&offset=0
```

---

#### List Deposits by User

```
GET /deposits/user/{userId}?limit=50
```

---

#### Get Deposit Stats

```
GET /deposits/stats/{clientId}
```

---

### Withdrawals (Off-Ramp)

#### Request Withdrawal

```
POST /withdrawals
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | ✅ | End-user ID |
| `vaultId` | string | ✅ | Format: `{chain}-{tokenAddress}` |
| `amount` | string | ✅ | Amount to withdraw |

**Response (201):**

```json
{
  "id": "uuid",
  "clientId": "...",
  "userId": "user_123",
  "vaultId": "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "requestedAmount": "500.00",
  "status": "PENDING",
  "createdAt": "..."
}
```

---

#### Get Withdrawal by ID

```
GET /withdrawals/{id}
```

---

#### Complete Withdrawal

```
POST /withdrawals/{id}/complete
```

**Request Body:**

```json
{
  "transactionHash": "0xdef456..."
}
```

---

#### Fail Withdrawal

```
POST /withdrawals/{id}/fail
```

**Request Body:**

```json
{
  "reason": "Insufficient liquidity"
}
```

---

#### List Withdrawals by Client

```
GET /withdrawals/client/{clientId}?limit=50&offset=0
```

---

#### List Withdrawals by User

```
GET /withdrawals/user/{userId}?limit=50
```

---

#### Get Withdrawal Stats

```
GET /withdrawals/stats/{clientId}
```

---

### Vaults

#### Get or Create Vault

```
POST /vaults
```

**Request Body:**

```json
{
  "clientId": "prod_xxx",
  "chainId": 8453,
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "tokenSymbol": "USDC"
}
```

---

#### Get Vault by ID

```
GET /vaults/{id}
```

---

#### List Client Vaults

```
GET /vaults/client/{clientId}
```

---

#### Get Vault by Token

```
GET /vaults/token/{clientId}/{tokenSymbol}/{chainId}
```

---

#### Update Vault Index with Yield

```
POST /vaults/{id}/index/update
```

Called by yield distribution cron to update vault growth index.

**Request Body:**

```json
{
  "yieldAmount": "100.50"
}
```

---

#### Get Vaults Ready for Staking

```
GET /vaults/ready-for-staking
```

Returns vaults with pending deposits ready to be staked in DeFi.

---

#### Mark Funds as Staked

```
POST /vaults/{id}/mark-staked
```

**Request Body:**

```json
{
  "amount": "10000.00"
}
```

---

### User Vaults

#### Get User Vault Balance

```
GET /user-vaults/{userId}/{vaultId}/balance
```

**Response (200):**

```json
{
  "userId": "user_123",
  "vaultId": "prod_xxx",
  "shares": "0",
  "entryIndex": "1000000000000000000",
  "effectiveBalance": "1050.00",
  "yieldEarned": "50.00"
}
```

---

#### List Vault Users

```
GET /user-vaults/{vaultId}/users?limit=50&offset=0
```

---

### Dashboard

#### Get Dashboard Metrics

```
GET /dashboard/metrics?clientId={clientId}
```

Real-time overview of client's fund stages and revenue.

**Response (200):**

```json
{
  "success": true,
  "clientId": "prod_xxx",
  "fundStages": {
    "available": "50000.00",
    "staked": "450000.00",
    "total": "500000.00"
  },
  "revenue": {
    "total": "25000.00",
    "clientShare": "2500.00",
    "endUserShare": "22500.00",
    "clientSharePercent": "10.0"
  },
  "stats": {
    "totalUsers": 150,
    "activeUsers": 120,
    "apy": "5.50",
    "vaults": 2
  },
  "strategies": [
    { "category": "Lending (AAVE)", "target": 70, "allocated": 315000, "isActive": true },
    { "category": "LP (Curve)", "target": 20, "allocated": 90000, "isActive": true },
    { "category": "Yield (Uniswap)", "target": 10, "allocated": 45000, "isActive": true }
  ]
}
```

---

### DeFi Protocols

#### Get All Protocol Metrics

```
GET /defi/protocols?token=USDC&chainId=8453
```

**Response (200):**

```json
{
  "protocols": [
    {
      "protocol": "aave",
      "token": "USDC",
      "chainId": 8453,
      "supplyAPY": "5.20",
      "tvl": "500000000",
      "utilization": "75.5",
      "risk": "Low",
      "status": "healthy"
    },
    // ...
  ],
  "timestamp": "2025-12-03T00:00:00.000Z"
}
```

---

#### Get AAVE Metrics

```
GET /defi/protocols/aave?token=USDC&chainId=8453
```

---

#### Get Compound Metrics

```
GET /defi/protocols/compound?token=USDC&chainId=8453
```

---

#### Get Morpho Metrics

```
GET /defi/protocols/morpho?token=USDC&chainId=8453
```

---

### Privy Accounts

#### Create or Update Privy Account

```
POST /privy-accounts
```

**Request Body:**

```json
{
  "privyOrganizationId": "org_xxx",
  "privyWalletAddress": "0x1234...",
  "privyEmail": "admin@company.com",
  "walletType": "MANAGED"
}
```

---

#### Get Privy Account

```
GET /privy-accounts/{privyOrganizationId}
```

---

## Integration Flows

### Flow 1: Client Registration

```
1. Frontend calls Privy to create organization → gets privyOrganizationId, privyWalletAddress
2. POST /clients with organization details
3. POST /clients/product/{productId}/regenerate-api-key → save API key securely
4. POST /clients/product/{productId}/bank-accounts (configure off-ramp accounts)
5. POST /clients/product/{productId}/strategies (configure DeFi allocation)
```

### Flow 2: User Onboarding

```
1. User signs up in your app
2. POST /users with clientUserId → creates custodial vault for user
3. User is ready to deposit
```

### Flow 3: Fiat Deposit (On-Ramp)

```
1. User initiates deposit in your app
2. POST /deposits/fiat → get paymentInstructions
3. Show bank transfer details to user (or redirect to paymentSessionUrl)
4. User transfers to Proxify's bank account
5. Bank webhook confirms payment
6. POST /deposits/fiat/{orderId}/complete → shares minted to user
7. Funds automatically deployed to DeFi
```

### Flow 4: Crypto Deposit

```
1. POST /deposits/crypto/initiate → get custodialWalletAddress
2. User sends tokens to custodial wallet
3. POST /deposits/crypto/{orderId}/complete with txHash
4. Shares minted to user
```

### Flow 5: Withdrawal (Off-Ramp)

```
1. POST /withdrawals → creates withdrawal request
2. System processes withdrawal (unstake from DeFi if needed)
3. POST /withdrawals/{id}/complete with txHash
4. Funds sent to user's bank or wallet
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "hint": "Helpful suggestion for resolution"
}
```

### Common Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid API key |
| 403 | Forbidden - Client inactive or insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const proxify = axios.create({
  baseURL: 'https://api.proxify.fi/api/v1',
  headers: {
    'x-api-key': process.env.PROXIFY_API_KEY,
    'Content-Type': 'application/json',
  },
});

// Create deposit
const deposit = await proxify.post('/deposits/fiat', {
  userId: 'user_123',
  amount: '10000',
  currency: 'THB',
  tokenSymbol: 'USDC',
});

console.log(deposit.data.paymentInstructions);
```

### Python

```python
import requests

headers = {
    'x-api-key': 'prod_pk_xxx',
    'Content-Type': 'application/json'
}

response = requests.post(
    'https://api.proxify.fi/api/v1/deposits/fiat',
    json={
        'userId': 'user_123',
        'amount': '10000',
        'currency': 'THB',
        'tokenSymbol': 'USDC'
    },
    headers=headers
)

print(response.json()['paymentInstructions'])
```

---

## Webhooks

Configure webhook URLs during client registration to receive real-time notifications.

### Webhook Events

| Event | Description |
|-------|-------------|
| `deposit.pending` | New deposit created |
| `deposit.completed` | Deposit confirmed and shares minted |
| `deposit.failed` | Deposit failed |
| `withdrawal.pending` | Withdrawal requested |
| `withdrawal.completed` | Withdrawal processed |
| `withdrawal.failed` | Withdrawal failed |
| `yield.distributed` | Yield distributed to vault |

### Webhook Payload

```json
{
  "event": "deposit.completed",
  "timestamp": "2025-12-03T00:00:00.000Z",
  "data": {
    "orderId": "DEP-xxx",
    "clientId": "prod_xxx",
    "userId": "user_123",
    "amount": "10000",
    "currency": "THB",
    "cryptoAmount": "310.00",
    "status": "completed"
  },
  "signature": "sha256=..."
}
```

---

## Support

- **Email:** support@proxify.fi
- **Documentation:** https://docs.proxify.fi
- **Status Page:** https://status.proxify.fi

---

**© 2025 Proxify. All rights reserved.**
