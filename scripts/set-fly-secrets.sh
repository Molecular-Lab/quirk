#!/bin/bash
set -e

echo "🔐 Setting Fly.io secrets for all services..."
echo ""

# Check if .env file exists for reference
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. You'll need to provide secrets manually."
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Required Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "B2B API (quirk-b2b-api):"
echo "  - DATABASE_URL (Railway PostgreSQL)"
echo "  - REDIS_URL (optional, for caching)"
echo "  - PRIVY_APP_ID"
echo "  - PRIVY_APP_SECRET"
echo ""
echo "Agent (quirk-agent):"
echo "  - OPENAI_API_KEY (REQUIRED)"
echo ""
echo "MCP (quirk-mcp):"
echo "  - No secrets needed (proxies to Agent)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to set secret
set_secret() {
    local app=$1
    local key=$2
    local value=$3
    
    if [ -z "$value" ]; then
        echo "⏭️  Skipping $key (not provided)"
        return
    fi
    
    echo "Setting $key for $app..."
    fly secrets set "$key=$value" -a "$app"
}

# ============================================
# B2B API Secrets
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 B2B API (quirk-b2b-api)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "DATABASE_URL (Railway PostgreSQL): " DATABASE_URL
set_secret "quirk-b2b-api" "DATABASE_URL" "$DATABASE_URL"

read -p "REDIS_URL (optional, press Enter to skip): " REDIS_URL
set_secret "quirk-b2b-api" "REDIS_URL" "$REDIS_URL"

read -p "PRIVY_APP_ID: " PRIVY_APP_ID
set_secret "quirk-b2b-api" "PRIVY_APP_ID" "$PRIVY_APP_ID"

read -p "PRIVY_APP_SECRET: " PRIVY_APP_SECRET
set_secret "quirk-b2b-api" "PRIVY_APP_SECRET" "$PRIVY_APP_SECRET"

echo ""

# ============================================
# Agent Secrets
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Agent (quirk-agent)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "OPENAI_API_KEY (REQUIRED): " OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY is required for Agent!"
    exit 1
fi
set_secret "quirk-agent" "OPENAI_API_KEY" "$OPENAI_API_KEY"

echo ""
echo "✅ All secrets set!"
echo ""
echo "Services will restart automatically to pick up the new secrets."
echo ""
echo "Check status:"
echo "  fly status -a quirk-b2b-api"
echo "  fly status -a quirk-agent"
echo ""
echo "Test health:"
echo "  curl https://quirk-b2b-api.fly.dev/health"
echo "  curl https://quirk-agent.fly.dev/health"
