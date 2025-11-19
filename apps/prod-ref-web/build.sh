#!/bin/bash

# Exit immediately on error
set -e

echo "🌿 CF_PAGES_BRANCH: $CF_PAGES_BRANCH"

# Map branches to env files
if [ "$CF_PAGES_BRANCH" == "main" ] || [ "$CF_PAGES_BRANCH" == "production" ]; then
  ENV_FILE="apps/web/.env.prod"
elif [ "$CF_PAGES_BRANCH" == "develop" ] || [[ "$CF_PAGES_BRANCH" == preview/* ]]; then
  ENV_FILE="apps/web/.env.dev"
fi

echo "📦 Using env file: $ENV_FILE"

# Copy the correct env file to .env for Vite to pick up
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" apps/web/.env
  echo "✅ Loaded environment from $ENV_FILE"
  # echo all env variables
  cat apps/web/.env
else
  echo "⚠️  $ENV_FILE not found. Exiting..."
  exit 1
fi

# Run the Vite build
pnpm build --filter=@rabbitswap/interface
