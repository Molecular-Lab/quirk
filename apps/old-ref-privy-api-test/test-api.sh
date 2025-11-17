#!/bin/bash

# Test script for Privy API endpoints
# Make sure the server is running first: pnpm dev

BASE_URL="http://localhost:3002"

echo "🧪 Testing Privy API Endpoints"
echo "================================"
echo ""

# Health check
echo "1️⃣  Testing Health Check..."
curl -s $BASE_URL/health | jq
echo ""

# Create wallet (Non-Web3 User)
echo "2️⃣  Creating wallet for non-web3 user..."
curl -s -X POST $BASE_URL/api/v1/wallets/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "gaming-app",
    "userId": "player123",
    "chainType": "ethereum"
  }' | jq
echo ""

# Get wallet by userId
echo "3️⃣  Getting wallet by userId..."
curl -s $BASE_URL/api/v1/wallets/user/gaming-app/player123 | jq
echo ""

# Create wallet (Web3 Native User)
echo "4️⃣  Creating wallet for web3 native user..."
curl -s -X POST $BASE_URL/api/v1/wallets/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "defi-app",
    "userId": "defi-user-789",
    "chainType": "ethereum",
    "linkedWalletAddress": "0xDEF1234567890ABCDEF1234567890ABCDEF12345"
  }' | jq
echo ""

# Get wallet by linked address
echo "5️⃣  Getting wallet by linked wallet address..."
curl -s "$BASE_URL/api/v1/wallets/address/defi-app/0xDEF1234567890ABCDEF1234567890ABCDEF12345" | jq
echo ""

# Get detailed wallet info
echo "6️⃣  Getting detailed wallet info..."
curl -s $BASE_URL/api/v1/wallets/details/gaming-app/player123 | jq
echo ""

echo "✅ All tests completed!"
