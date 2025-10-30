# Local Development
start-server:
	go run apps/api-core/cmd/main.go

start-bot:
	go run apps/defai-telegram-bot/cmd/main.go

# Docker Commands
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-logs-bot:
	docker-compose logs -f telegram-bot

docker-logs-api:
	docker-compose logs -f api-core

docker-restart:
	docker-compose restart

docker-clean:
	docker-compose down -v
	docker system prune -f

# Build individual services
docker-build-api:
	docker-compose build api-core

docker-build-bot:
	docker-compose build telegram-bot

# Full stack operations
docker-rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

docker-status:
	docker-compose ps

# AWS ECR Commands
AWS_REGION ?= us-east-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

ecr-login:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REGISTRY)

ecr-create-repos:
	aws ecr create-repository --repository-name defai-api-core --region $(AWS_REGION) || true
	aws ecr create-repository --repository-name defai-telegram-bot --region $(AWS_REGION) || true

ecr-push-api:
	docker tag server-api-core:latest $(ECR_REGISTRY)/defai-api-core:latest
	docker push $(ECR_REGISTRY)/defai-api-core:latest

ecr-push-bot:
	docker tag server-telegram-bot:latest $(ECR_REGISTRY)/defai-telegram-bot:latest
	docker push $(ECR_REGISTRY)/defai-telegram-bot:latest

ecr-push-all: ecr-login
	$(MAKE) ecr-push-api
	$(MAKE) ecr-push-bot

aws-deploy: docker-build ecr-push-all
	@echo "Images pushed to ECR. Deploy to ECS using AWS Console or CLI."

# Production deployment
prod-deploy:
	@echo "Deploying to production..."
	git pull origin main
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "Production deployment complete!"

.PHONY: start-server start-bot docker-build docker-up docker-down docker-logs docker-logs-bot docker-logs-api docker-restart docker-clean docker-build-api docker-build-bot docker-rebuild docker-status ecr-login ecr-create-repos ecr-push-api ecr-push-bot ecr-push-all aws-deploy prod-deploy
