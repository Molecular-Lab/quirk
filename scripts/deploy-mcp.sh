#!/bin/bash
set -e

echo "🚀 Deploying MCP to Fly.io..."
echo ""
echo "Configuration:"
echo "  - VM: shared-cpu-1x with 256MB RAM"
echo "  - Cost: ~$2.02/mo"
echo "  - Fixes: 0.0.0.0 binding + GET /health endpoint"
echo ""

cd "$(dirname "$0")/.."

# Deploy with no cache to ensure fresh build
fly deploy \
  --config apps/mcp/fly.toml \
  --app quirk-mcp \
  --no-cache

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check status:"
echo "  fly status -a quirk-mcp"
echo ""
echo "View logs:"
echo "  fly logs -a quirk-mcp"
