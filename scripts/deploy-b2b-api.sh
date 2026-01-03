#!/bin/bash
set -e

echo "🚀 Deploying B2B API to Fly.io..."
echo ""
echo "Configuration:"
echo "  - VM: shared-cpu-2x with 1GB RAM"
echo "  - Cost: ~$6.64/mo"
echo "  - Fixes: 0.0.0.0 binding + upgraded RAM"
echo ""

cd "$(dirname "$0")/.."

# Deploy with no cache to ensure fresh build
fly deploy \
  --config apps/b2b-api/fly.toml \
  --app quirk-b2b-api \
  --no-cache

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check status:"
echo "  fly status -a quirk-b2b-api"
echo ""
echo "View logs:"
echo "  fly logs -a quirk-b2b-api"
echo ""
echo "Monitor performance:"
echo "  fly metrics -a quirk-b2b-api"
