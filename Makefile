.PHONY: help db-start db-stop db-restart db-logs db-connect db-reset db-clean install dev test clean \
        migrate-up migrate-down migrate-force migrate-version migrate-create \
        sqlc-generate sqlc-go sqlc-ts migrate-install check-migrate

# Default target
.DEFAULT_GOAL := help

# Colors for output
COLOR_RESET = \033[0m
COLOR_BOLD = \033[1m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m
COLOR_BLUE = \033[34m
COLOR_CYAN = \033[36m
COLOR_RED = \033[31m

# Database configuration
DB_HOST = localhost
DB_PORT = 5432
DB_USER = proxify_user
DB_PASSWORD = proxify_password
DB_NAME = proxify_dev
DB_URL = postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable

# Migration configuration
MIGRATIONS_PATH = ./database/migrations

##@ General

help: ## Display this help message
	@echo "$(COLOR_BOLD)Proxify B2B Platform - Index-Based Vault System$(COLOR_RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(COLOR_CYAN)<target>$(COLOR_RESET)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(COLOR_CYAN)%-25s$(COLOR_RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(COLOR_BOLD)%s$(COLOR_RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Database Management

db-start: ## Start PostgreSQL database with Docker
	@echo "$(COLOR_GREEN)🐘 Starting PostgreSQL...$(COLOR_RESET)"
	@docker-compose up -d postgres
	@echo "$(COLOR_YELLOW)⏳ Waiting for database to be ready...$(COLOR_RESET)"
	@timeout=30; \
	counter=0; \
	while ! docker exec proxify-postgres pg_isready -U $(DB_USER) -d $(DB_NAME) > /dev/null 2>&1; do \
		counter=$$((counter + 1)); \
		if [ $$counter -gt $$timeout ]; then \
			echo "$(COLOR_RED)❌ Timeout waiting for PostgreSQL$(COLOR_RESET)"; \
			exit 1; \
		fi; \
		printf "   Waiting... ($$counter/$$timeout)\r"; \
		sleep 1; \
	done
	@echo ""
	@echo "$(COLOR_GREEN)✅ PostgreSQL is ready!$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)📊 Connection Info:$(COLOR_RESET)"
	@echo "   Host:     $(DB_HOST)"
	@echo "   Port:     $(DB_PORT)"
	@echo "   Database: $(DB_NAME)"
	@echo "   User:     $(DB_USER)"
	@echo "   Password: $(DB_PASSWORD)"
	@echo ""
	@echo "$(COLOR_BLUE)   $(DB_URL)$(COLOR_RESET)"

db-stop: ## Stop PostgreSQL database
	@echo "$(COLOR_YELLOW)🛑 Stopping PostgreSQL...$(COLOR_RESET)"
	@docker-compose stop postgres
	@echo "$(COLOR_GREEN)✅ PostgreSQL stopped$(COLOR_RESET)"

db-restart: ## Restart PostgreSQL database
	@echo "$(COLOR_YELLOW)🔄 Restarting PostgreSQL...$(COLOR_RESET)"
	@docker-compose restart postgres
	@sleep 2
	@echo "$(COLOR_GREEN)✅ PostgreSQL restarted$(COLOR_RESET)"

db-logs: ## View PostgreSQL logs
	@docker-compose logs -f postgres

db-connect: ## Connect to PostgreSQL with psql
	@echo "$(COLOR_CYAN)📊 Connecting to database...$(COLOR_RESET)"
	@docker exec -it proxify-postgres psql -U $(DB_USER) -d $(DB_NAME)

db-shell: ## Open bash shell in PostgreSQL container
	@echo "$(COLOR_CYAN)🐚 Opening shell in PostgreSQL container...$(COLOR_RESET)"
	@docker exec -it proxify-postgres /bin/bash

db-reset: ## Reset database (drop and recreate with migrations)
	@echo "$(COLOR_YELLOW)⚠️  WARNING: This will delete all data!$(COLOR_RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(COLOR_YELLOW)🗑️  Dropping database...$(COLOR_RESET)"; \
		docker exec -i proxify-postgres psql -U $(DB_USER) -d postgres -c "DROP DATABASE IF EXISTS $(DB_NAME);"; \
		echo "$(COLOR_GREEN)📦 Creating database...$(COLOR_RESET)"; \
		docker exec -i proxify-postgres psql -U $(DB_USER) -d postgres -c "CREATE DATABASE $(DB_NAME);"; \
		echo "$(COLOR_GREEN)🔄 Running migrations...$(COLOR_RESET)"; \
		$(MAKE) migrate-up; \
		echo "$(COLOR_GREEN)✅ Database reset complete!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)❌ Cancelled$(COLOR_RESET)"; \
	fi

db-clean: ## Remove all database data (Docker volumes)
	@echo "$(COLOR_YELLOW)⚠️  WARNING: This will delete all database volumes!$(COLOR_RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v postgres; \
		echo "$(COLOR_GREEN)✅ Database volumes removed!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)❌ Cancelled$(COLOR_RESET)"; \
	fi

db-cleanup-all: ## Complete database cleanup (drop DB, remove volumes, restart fresh)
	@echo "$(COLOR_RED)$(COLOR_BOLD)⚠️  WARNING: This will COMPLETELY WIPE ALL DATABASE DATA!$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)This will:$(COLOR_RESET)"
	@echo "  1. Stop PostgreSQL container"
	@echo "  2. Remove all database volumes"
	@echo "  3. Start fresh PostgreSQL container"
	@echo "  4. Run all migrations"
	@echo ""
	@read -p "Are you absolutely sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(COLOR_YELLOW)🛑 Stopping PostgreSQL...$(COLOR_RESET)"; \
		docker-compose down postgres 2>/dev/null || true; \
		echo "$(COLOR_YELLOW)🗑️  Removing all volumes...$(COLOR_RESET)"; \
		docker-compose down -v 2>/dev/null || true; \
		docker volume rm proxify_postgres_data 2>/dev/null || true; \
		echo "$(COLOR_GREEN)🐘 Starting fresh PostgreSQL...$(COLOR_RESET)"; \
		$(MAKE) db-start; \
		echo "$(COLOR_GREEN)🔄 Running migrations...$(COLOR_RESET)"; \
		$(MAKE) migrate-up; \
		echo ""; \
		echo "$(COLOR_GREEN)$(COLOR_BOLD)✅ Database completely cleaned and recreated!$(COLOR_RESET)"; \
		echo "$(COLOR_CYAN)Next steps:$(COLOR_RESET)"; \
		echo "  - Run: make seed-protocols"; \
		echo "  - Run: make seed-test-client"; \
		echo "  - Or:  make seed-all"; \
	else \
		echo "$(COLOR_YELLOW)❌ Cancelled$(COLOR_RESET)"; \
	fi

db-truncate-all: ## Truncate all tables (keeps schema, removes data)
	@echo "$(COLOR_YELLOW)⚠️  WARNING: This will delete all data from all tables!$(COLOR_RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(COLOR_YELLOW)🗑️  Truncating all tables...$(COLOR_RESET)"; \
		docker exec -i proxify-postgres psql -U $(DB_USER) -d $(DB_NAME) -c "\
			TRUNCATE TABLE \
				audit_logs, \
				withdrawal_queue, \
				withdrawal_transactions, \
				deposit_transactions, \
				end_user_vaults, \
				end_users, \
				vault_strategies, \
				client_vaults, \
				client_organizations, \
				supported_defi_protocols, \
				privy_accounts \
			RESTART IDENTITY CASCADE;"; \
		echo "$(COLOR_GREEN)✅ All tables truncated!$(COLOR_RESET)"; \
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

##@ Database Migrations

check-migrate: ## Check if golang-migrate is installed
	@which migrate > /dev/null || (echo "$(COLOR_RED)❌ golang-migrate is not installed$(COLOR_RESET)" && \
		echo "$(COLOR_YELLOW)Install it with:$(COLOR_RESET)" && \
		echo "  macOS:  brew install golang-migrate" && \
		echo "  Linux:  curl -L https://github.com/golang-migrate/migrate/releases/latest/download/migrate.linux-amd64.tar.gz | tar xvz && sudo mv migrate /usr/local/bin/" && \
		echo "  Or visit: https://github.com/golang-migrate/migrate" && \
		exit 1)

migrate-install: ## Install golang-migrate (macOS)
	@echo "$(COLOR_GREEN)📦 Installing golang-migrate...$(COLOR_RESET)"
	@if command -v brew > /dev/null; then \
		brew install golang-migrate; \
		echo "$(COLOR_GREEN)✅ golang-migrate installed!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠️  Homebrew not found. Please install manually:$(COLOR_RESET)"; \
		echo "  https://github.com/golang-migrate/migrate"; \
	fi

migrate-up: check-migrate ## Run all pending migrations
	@echo "$(COLOR_GREEN)🔄 Running migrations UP...$(COLOR_RESET)"
	@migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" up
	@echo "$(COLOR_GREEN)✅ Migrations completed!$(COLOR_RESET)"

migrate-down: check-migrate ## Rollback last migration
	@echo "$(COLOR_YELLOW)⚠️  Rolling back last migration...$(COLOR_RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" down 1; \
		echo "$(COLOR_GREEN)✅ Rollback complete!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)❌ Cancelled$(COLOR_RESET)"; \
	fi

migrate-down-all: check-migrate ## Rollback all migrations
	@echo "$(COLOR_RED)⚠️  WARNING: This will rollback ALL migrations!$(COLOR_RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" down; \
		echo "$(COLOR_GREEN)✅ All migrations rolled back!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)❌ Cancelled$(COLOR_RESET)"; \
	fi

migrate-force: check-migrate ## Force migration version (VERSION=)
	@if [ -z "$(VERSION)" ]; then \
		echo "$(COLOR_RED)❌ VERSION is required$(COLOR_RESET)"; \
		echo "Usage: make migrate-force VERSION=1"; \
		exit 1; \
	fi
	@echo "$(COLOR_YELLOW)⚠️  Forcing migration to version $(VERSION)...$(COLOR_RESET)"
	@migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" force $(VERSION)
	@echo "$(COLOR_GREEN)✅ Forced to version $(VERSION)$(COLOR_RESET)"

migrate-version: check-migrate ## Show current migration version
	@echo "$(COLOR_CYAN)📊 Current migration version:$(COLOR_RESET)"
	@migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" version

migrate-create: check-migrate ## Create a new migration (NAME=)
	@if [ -z "$(NAME)" ]; then \
		echo "$(COLOR_RED)❌ NAME is required$(COLOR_RESET)"; \
		echo "Usage: make migrate-create NAME=add_user_settings"; \
		exit 1; \
	fi
	@echo "$(COLOR_GREEN)📝 Creating new migration: $(NAME)$(COLOR_RESET)"
	@migrate create -ext sql -dir $(MIGRATIONS_PATH) -seq $(NAME)
	@echo "$(COLOR_GREEN)✅ Migration files created!$(COLOR_RESET)"

##@ Code Generation (SQLC)

sqlc-generate: ## Generate both Go and TypeScript code from SQL
	@echo "$(COLOR_GREEN)🔨 Generating code with SQLC...$(COLOR_RESET)"
	@sqlc generate
	@echo "$(COLOR_GREEN)✅ Code generation complete!$(COLOR_RESET)"
	@echo "$(COLOR_CYAN)Generated:$(COLOR_RESET)"
	@echo "  Go:         packages/core/datagateway/gen/"
	@echo "  TypeScript: packages/database/src/gen/"

sqlc-go: ## Generate only Go code
	@echo "$(COLOR_GREEN)🔨 Generating Go code with SQLC...$(COLOR_RESET)"
	@sqlc generate
	@echo "$(COLOR_GREEN)✅ Go code generated!$(COLOR_RESET)"

sqlc-ts: sqlc-go ## Generate TypeScript code (alias for sqlc-generate)

sqlc-verify: ## Verify SQLC configuration
	@echo "$(COLOR_CYAN)🔍 Verifying SQLC configuration...$(COLOR_RESET)"
	@sqlc compile
	@echo "$(COLOR_GREEN)✅ SQLC configuration is valid!$(COLOR_RESET)"

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

build: ## Build all packages
	@echo "$(COLOR_GREEN)🔨 Building all packages...$(COLOR_RESET)"
	@pnpm build
	@echo "$(COLOR_GREEN)✅ Build complete!$(COLOR_RESET)"

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

##@ Database Seeding

seed-protocols: ## Seed DeFi protocols (requires database running)
	@echo "$(COLOR_GREEN)🌱 Seeding DeFi protocols...$(COLOR_RESET)"
	@docker exec -i proxify-postgres psql -U $(DB_USER) -d $(DB_NAME) -c "\
		INSERT INTO supported_defi_protocols (name, chain, category, risk_level, address_book, is_active) VALUES \
		('Aave', 'ethereum', 'lending', 'low', '{\"pool\": \"0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2\", \"aUSDC\": \"0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c\"}', true), \
		('Compound', 'ethereum', 'lending', 'low', '{\"cUSDC\": \"0xc3d688B66703497DAA19211EEdff47f25384cdc3\"}', true), \
		('Curve', 'ethereum', 'lp', 'medium', '{\"pool\": \"0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7\", \"lpToken\": \"0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490\"}', true), \
		('Uniswap', 'ethereum', 'lp', 'medium', '{\"router\": \"0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\", \"factory\": \"0x1F98431c8aD98523631AE4a59f267346ea31F984\"}', true) \
		ON CONFLICT (name, chain) DO NOTHING;"
	@echo "$(COLOR_GREEN)✅ DeFi protocols seeded!$(COLOR_RESET)"

seed-test-client: ## Create a test client organization
	@echo "$(COLOR_GREEN)🌱 Creating test client...$(COLOR_RESET)"
	@docker exec -i proxify-postgres psql -U $(DB_USER) -d $(DB_NAME) -c "\
		INSERT INTO client_organizations ( \
			product_id, company_name, business_type, \
			wallet_type, wallet_managed_by, \
			privy_organization_id, privy_wallet_address, \
			api_key_hash, api_key_prefix, \
			end_user_yield_portion, platform_fee, performance_fee, \
			is_sandbox, is_active \
		) VALUES ( \
			'test_product_001', \
			'Test E-commerce Platform', \
			'ecommerce', \
			'custodial', \
			'proxify', \
			'privy_test_org_001', \
			'0x0000000000000000000000000000000000000001', \
			'hashed_api_key_test', \
			'pk_test_', \
			90.00, \
			1.00, \
			10.00, \
			true, \
			true \
		) RETURNING id, product_id, company_name;"
	@echo "$(COLOR_GREEN)✅ Test client created!$(COLOR_RESET)"

seed-all: seed-protocols seed-test-client ## Seed all test data
	@echo "$(COLOR_GREEN)✅ All seed data loaded!$(COLOR_RESET)"

##@ Setup & Initialization

setup: install db-start migrate-up sqlc-generate seed-protocols ## Complete setup (install + database + migrate + codegen + seed)
	@echo ""
	@echo "$(COLOR_GREEN)$(COLOR_BOLD)✅ Setup complete!$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)Next steps:$(COLOR_RESET)"
	@echo "  1. Configure Privy credentials in apps/privy-api-test/.env"
	@echo "  2. Review database schema: make db-connect"
	@echo "  3. Run: make dev"
	@echo "  4. Test: curl http://localhost:3002/health"
	@echo ""
	@echo "$(COLOR_CYAN)Database commands:$(COLOR_RESET)"
	@echo "  make migrate-version  - Check migration status"
	@echo "  make db-pgadmin      - Open pgAdmin (http://localhost:5050)"
	@echo "  make seed-test-client - Create test data"
	@echo ""

setup-fresh: db-clean docker-up setup ## Fresh setup (clean + setup from scratch)
	@echo "$(COLOR_GREEN)$(COLOR_BOLD)✅ Fresh setup complete!$(COLOR_RESET)"

##@ Cleanup

clean: ## Clean build artifacts and node_modules
	@echo "$(COLOR_YELLOW)🧹 Cleaning build artifacts...$(COLOR_RESET)"
	@find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@find . -name "dist" -type d -prune -exec rm -rf {} +
	@find . -name ".turbo" -type d -prune -exec rm -rf {} +
	@echo "$(COLOR_GREEN)✅ Cleaned!$(COLOR_RESET)"

clean-all: clean docker-clean ## Clean everything (artifacts + Docker)
	@echo "$(COLOR_GREEN)✅ Everything cleaned!$(COLOR_RESET)"

##@ Testing & Validation

test-deposit: ## Test deposit flow (requires server running)
	@echo "$(COLOR_CYAN)🧪 Testing deposit flow...$(COLOR_RESET)"
	@curl -X POST http://localhost:3002/api/v1/deposits \
		-H "Content-Type: application/json" \
		-H "Authorization: Bearer pk_test_xxx" \
		-d '{ \
			"user_id": "test_user_001", \
			"amount": 100, \
			"currency": "USD", \
			"chain": "ethereum", \
			"token": "USDC" \
		}' | jq .

test-balance: ## Test user balance (USER_ID=)
	@if [ -z "$(USER_ID)" ]; then \
		echo "Usage: make test-balance USER_ID=test_user_001"; \
	else \
		curl http://localhost:3002/api/v1/users/$(USER_ID)/balance?chain=ethereum\&token=USDC | jq .; \
	fi

db-check-invariants: ## Verify database invariants
	@echo "$(COLOR_CYAN)🔍 Checking database invariants...$(COLOR_RESET)"
	@docker exec -i proxify-postgres psql -U $(DB_USER) -d $(DB_NAME) -c "\
		SELECT \
			cv.id AS vault_id, \
			cv.total_shares AS vault_total_shares, \
			COALESCE(SUM(euv.shares), 0) AS sum_user_shares, \
			cv.total_shares - COALESCE(SUM(euv.shares), 0) AS difference \
		FROM client_vaults cv \
		LEFT JOIN end_user_vaults euv \
			ON cv.client_id = euv.client_id \
			AND cv.chain = euv.chain \
			AND cv.token_address = euv.token_address \
		GROUP BY cv.id;"
	@echo "$(COLOR_GREEN)✅ Invariant check complete$(COLOR_RESET)"

##@ Information

info: ## Show system information
	@echo "$(COLOR_BOLD)Proxify B2B Platform - System Information$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_CYAN)📦 Versions:$(COLOR_RESET)"
	@echo "  Node:     $$(node --version 2>/dev/null || echo 'not installed')"
	@echo "  pnpm:     $$(pnpm --version 2>/dev/null || echo 'not installed')"
	@echo "  Docker:   $$(docker --version 2>/dev/null || echo 'not installed')"
	@echo "  migrate:  $$(migrate -version 2>/dev/null || echo 'not installed')"
	@echo "  sqlc:     $$(sqlc version 2>/dev/null || echo 'not installed')"
	@echo ""
	@echo "$(COLOR_CYAN)🐘 Database Status:$(COLOR_RESET)"
	@docker exec proxify-postgres pg_isready -U $(DB_USER) -d $(DB_NAME) 2>/dev/null && \
		echo "  Status: $(COLOR_GREEN)✅ Running$(COLOR_RESET)" || \
		echo "  Status: $(COLOR_YELLOW)❌ Not running$(COLOR_RESET)"
	@docker exec proxify-postgres psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT version();" 2>/dev/null | head -3 || true
	@echo ""
	@echo "$(COLOR_CYAN)🔄 Migration Status:$(COLOR_RESET)"
	@migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" version 2>/dev/null || echo "  Not available"
	@echo ""
	@echo "$(COLOR_CYAN)📂 Project Structure:$(COLOR_RESET)"
	@echo "  Root:        $$(pwd)"
	@echo "  Migrations:  $(MIGRATIONS_PATH)"
	@echo "  Queries:     ./database/queries"
	@echo "  Core:        packages/core"
	@echo "  API:         apps/privy-api-test"
	@echo ""
	@echo "$(COLOR_CYAN)📚 Documentation:$(COLOR_RESET)"
	@echo "  Architecture: INDEX_VAULT_SYSTEM.md"
	@echo "  Product Flow: PRODUCT_OWNER_FLOW.md"
	@echo ""
