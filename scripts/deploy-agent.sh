#!/bin/bash
set -e

echo "🚀 Deploying Agent to Fly.io..."
echo ""
echo "Configuration:"
echo "  - VM: shared-cpu-1x with 512MB RAM"
echo "  - Cost: ~$3.32/mo"
echo ""

cd "$(dirname "$0")/.."

# Deploy with no cache to ensure fresh build
fly deploy \
  --config apps/agent/fly.toml \
  --app quirk-agent \
  --no-cache

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check status:"
echo "  fly status -a quirk-agent"
echo ""
echo "View logs:"
echo "  fly logs -a quirk-agent"
