#!/bin/bash
set -e

echo "🚀 Deploying ALL services to Fly.io..."
echo ""
echo "Total Cost: ~$12/mo"
echo "  - B2B API: $6.64/mo (shared-cpu-2x, 1GB)"
echo "  - Agent:   $3.32/mo (shared-cpu-1x, 512MB)"
echo "  - MCP:     $2.02/mo (shared-cpu-1x, 256MB)"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

cd "$(dirname "$0")/.."

echo ""
echo "📦 1/3: Deploying B2B API..."
./scripts/deploy-b2b-api.sh

echo ""
echo "📦 2/3: Deploying MCP..."
./scripts/deploy-mcp.sh

echo ""
echo "📦 3/3: Deploying Agent..."
./scripts/deploy-agent.sh

echo ""
echo "✅ ALL SERVICES DEPLOYED!"
echo ""
echo "Check all statuses:"
echo "  fly status -a quirk-b2b-api"
echo "  fly status -a quirk-mcp"
echo "  fly status -a quirk-agent"
