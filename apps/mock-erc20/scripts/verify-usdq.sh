#!/bin/bash

# USDQ Verification Script
# Usage: ./scripts/verify-usdq.sh <CONTRACT_ADDRESS> <NETWORK>
#
# Example:
#   ./scripts/verify-usdq.sh 0x1234...5678 sepolia
#   ./scripts/verify-usdq.sh 0x1234...5678 baseSepolia

CONTRACT_ADDRESS=$1
NETWORK=${2:-sepolia}

# USDQ constructor parameters (static)

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "❌ Error: Contract address is required"
  echo "Usage: ./scripts/verify-usdq.sh <CONTRACT_ADDRESS> <NETWORK>"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verifying USDQ on $NETWORK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Contract: $CONTRACT_ADDRESS"
echo "Network: $NETWORK"

npx hardhat verify --network "$NETWORK" "$CONTRACT_ADDRESS"

if [ $? -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ USDQ verified successfully!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ Verification failed!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
