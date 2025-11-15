.PHONY: help db-start db-stop db-restart db-logs db-connect db-migrate db-reset install dev test clean

# Default target
.DEFAULT_GOAL := help

# Colors for output
COLOR_RESET = \033[0m
COLOR_BOLD = \033[1m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m
COLOR_BLUE = \033[34m
COLOR_CYAN = \033[36m

##@ General

help: ## Display this help message
	@echo "$(COLOR_BOLD)Proxify - Wallet Custodial API$(COLOR_RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(COLOR_CYAN)<target>$(COLOR_RESET)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(COLOR_CYAN)%-20s$(COLOR_RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(COLOR_BOLD)%s$(COLOR_RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Database

db-start: ## Start PostgreSQL database with Docker
	@echo "$(COLOR_GREEN)🐘 Starting PostgreSQL...$(COLOR_RESET)"
	@docker-compose up -d postgres
	@echo "$(COLOR_YELLOW)⏳ Waiting for database to be ready...$(COLOR_RESET)"
	@timeout=30; \
	counter=0; \
	while ! docker exec proxify-postgres pg_isready -U proxify_user -d proxify_dev > /dev/null 2>&1; do \
		counter=$$((counter + 1)); \
		if [ $$counter -gt $$timeout ]; then \
			echo "❌ Timeout waiting for PostgreSQL"; \
			exit 1; \
		fi; \
		printf "   Waiting... ($$counter/$$timeout)\r"; \
		sleep 1; \
	done
	@echo ""
	@echo "$(COLOR_GREEN)✅ PostgreSQL is ready!$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)📊 Connection Info:$(COLOR_RESET)"
	@echo "   Host:     localhost"
	@echo "   Port:     5432"
	@echo "   Database: proxify_dev"
	@echo "   User:     proxify_user"
	@echo "   Password: proxify_password"
	@echo ""
	@echo "$(COLOR_BLUE)   postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev$(COLOR_RESET)"

db-stop: ## Stop PostgreSQL database
	@echo "$(COLOR_YELLOW)🛑 Stopping PostgreSQL...$(COLOR_RESET)"
	@docker-compose stop postgres
	@echo "$(COLOR_GREEN)✅ PostgreSQL stopped$(COLOR_RESET)"

db-restart: ## Restart PostgreSQL database
	@echo "$(COLOR_YELLOW)🔄 Restarting PostgreSQL...$(COLOR_RESET)"
	@docker-compose restart postgres
	@echo "$(COLOR_GREEN)✅ PostgreSQL restarted$(COLOR_RESET)"

db-logs: ## View PostgreSQL logs
	@docker-compose logs -f postgres

db-connect: ## Connect to PostgreSQL with psql
	@echo "$(COLOR_CYAN)📊 Connecting to database...$(COLOR_RESET)"
	@docker exec -it proxify-postgres psql -U proxify_user -d proxify_dev

db-migrate: ## Run database migrations
	@echo "$(COLOR_GREEN)🔄 Running migrations...$(COLOR_RESET)"
	@docker exec -i proxify-postgres psql -U proxify_user -d proxify_dev < packages/core/migrations/001_create_user_wallets_table.sql
	@echo "$(COLOR_GREEN)✅ Migrations completed!$(COLOR_RESET)"

db-reset: ## Reset database (drop and recreate)
	@echo "$(COLOR_YELLOW)⚠️  WARNING: This will delete all data!$(COLOR_RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(COLOR_YELLOW)🗑️  Dropping database...$(COLOR_RESET)"; \
		docker exec -i proxify-postgres psql -U proxify_user -d postgres -c "DROP DATABASE IF EXISTS proxify_dev;"; \
		echo "$(COLOR_GREEN)📦 Creating database...$(COLOR_RESET)"; \
		docker exec -i proxify-postgres psql -U proxify_user -d postgres -c "CREATE DATABASE proxify_dev;"; \
		echo "$(COLOR_GREEN)🔄 Running migrations...$(COLOR_RESET)"; \
		docker exec -i proxify-postgres psql -U proxify_user -d proxify_dev < packages/core/migrations/001_create_user_wallets_table.sql; \
		echo "$(COLOR_GREEN)✅ Database reset complete!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)❌ Cancelled$(COLOR_RESET)"; \
	fi

db-pgadmin: ## Start pgAdmin web interface
	@echo "$(COLOR_GREEN)🌐 Starting pgAdmin...$(COLOR_RESET)"
	@docker-compose up -d pgadmin
	@echo "$(COLOR_GREEN)✅ pgAdmin started!$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)📊 pgAdmin Info:$(COLOR_RESET)"
	@echo "   URL:      http://localhost:5050"
	@echo "   Email:    admin@admin.com"
	@echo "   Password: admin"

##@ Development

install: ## Install dependencies
	@echo "$(COLOR_GREEN)📦 Installing dependencies...$(COLOR_RESET)"
	@pnpm install
	@echo "$(COLOR_GREEN)✅ Dependencies installed!$(COLOR_RESET)"

dev: ## Start development server
	@echo "$(COLOR_GREEN)🚀 Starting development server...$(COLOR_RESET)"
	@cd apps/privy-api-test && pnpm dev

dev-core: ## Build core package in watch mode
	@echo "$(COLOR_GREEN)🔨 Building @proxify/core in watch mode...$(COLOR_RESET)"
	@cd packages/core && pnpm dev

test: ## Run tests
	@echo "$(COLOR_GREEN)🧪 Running tests...$(COLOR_RESET)"
	@pnpm test

lint: ## Run linter
	@echo "$(COLOR_GREEN)🔍 Running linter...$(COLOR_RESET)"
	@pnpm lint

format: ## Format code
	@echo "$(COLOR_GREEN)✨ Formatting code...$(COLOR_RESET)"
	@pnpm format

##@ Docker

docker-up: ## Start all services (database + pgAdmin)
	@echo "$(COLOR_GREEN)🐳 Starting all Docker services...$(COLOR_RESET)"
	@docker-compose up -d
	@echo "$(COLOR_GREEN)✅ All services started!$(COLOR_RESET)"

docker-down: ## Stop all services
	@echo "$(COLOR_YELLOW)🛑 Stopping all Docker services...$(COLOR_RESET)"
	@docker-compose down
	@echo "$(COLOR_GREEN)✅ All services stopped$(COLOR_RESET)"

docker-ps: ## List running containers
	@docker-compose ps

docker-clean: ## Remove all containers and volumes
	@echo "$(COLOR_YELLOW)⚠️  WARNING: This will delete all Docker data!$(COLOR_RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(COLOR_GREEN)✅ Docker cleaned!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)❌ Cancelled$(COLOR_RESET)"; \
	fi

##@ Setup

setup: install db-start db-migrate ## Complete setup (install + database + migrate)
	@echo ""
	@echo "$(COLOR_GREEN)$(COLOR_BOLD)✅ Setup complete!$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)Next steps:$(COLOR_RESET)"
	@echo "  1. Configure Privy credentials in apps/privy-api-test/.env"
	@echo "  2. Run: make dev"
	@echo "  3. Test: curl http://localhost:3002/health"
	@echo ""

##@ Cleanup

clean: ## Clean build artifacts and node_modules
	@echo "$(COLOR_YELLOW)🧹 Cleaning build artifacts...$(COLOR_RESET)"
	@find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@find . -name "dist" -type d -prune -exec rm -rf {} +
	@find . -name ".turbo" -type d -prune -exec rm -rf {} +
	@echo "$(COLOR_GREEN)✅ Cleaned!$(COLOR_RESET)"

##@ Wallet Testing

test-wallet-create: ## Test wallet creation (requires server running)
	@echo "$(COLOR_CYAN)🧪 Testing wallet creation...$(COLOR_RESET)"
	@curl -X POST http://localhost:3002/api/v1/wallets/create \
		-H "Content-Type: application/json" \
		-d '{ \
			"productId": "test-app", \
			"userId": "test-user-001", \
			"chainType": "ethereum" \
		}' | jq .

test-wallet-get: ## Test wallet retrieval (PRODUCT_ID= USER_ID=)
	@echo "$(COLOR_CYAN)🧪 Testing wallet retrieval...$(COLOR_RESET)"
	@if [ -z "$(PRODUCT_ID)" ] || [ -z "$(USER_ID)" ]; then \
		echo "Usage: make test-wallet-get PRODUCT_ID=test-app USER_ID=test-user-001"; \
	else \
		curl http://localhost:3002/api/v1/wallets/user/$(PRODUCT_ID)/$(USER_ID) | jq .; \
	fi

test-portfolio: ## Test portfolio endpoint (WALLET=)
	@echo "$(COLOR_CYAN)🧪 Testing portfolio endpoint...$(COLOR_RESET)"
	@if [ -z "$(WALLET)" ]; then \
		echo "Usage: make test-portfolio WALLET=0x..."; \
	else \
		curl http://localhost:3002/api/v1/wallet-execution/portfolio/$(WALLET) | jq .; \
	fi

##@ Information

info: ## Show system information
	@echo "$(COLOR_BOLD)Proxify System Information$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)📦 Versions:$(COLOR_RESET)"
	@echo "  Node:   $$(node --version 2>/dev/null || echo 'not installed')"
	@echo "  pnpm:   $$(pnpm --version 2>/dev/null || echo 'not installed')"
	@echo "  Docker: $$(docker --version 2>/dev/null || echo 'not installed')"
	@echo ""
	@echo "$(COLOR_CYAN)🐘 Database Status:$(COLOR_RESET)"
	@docker exec proxify-postgres pg_isready -U proxify_user -d proxify_dev 2>/dev/null && \
		echo "  Status: $(COLOR_GREEN)✅ Running$(COLOR_RESET)" || \
		echo "  Status: $(COLOR_YELLOW)❌ Not running$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)📂 Project Structure:$(COLOR_RESET)"
	@echo "  Root:       $$(pwd)"
	@echo "  Core:       packages/core"
	@echo "  API:        apps/privy-api-test"
	@echo "  Migrations: packages/core/migrations"
