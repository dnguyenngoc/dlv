.PHONY: help dev up down restart logs clean build test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment with docker-compose
	docker-compose -f docker-compose.dev.yml up

up: dev ## Alias for dev

down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

restart: ## Restart development environment
	docker-compose -f docker-compose.dev.yml restart

logs: ## Show logs from all services
	docker-compose -f docker-compose.dev.yml logs -f

logs-backend: ## Show backend logs
	docker-compose -f docker-compose.dev.yml logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose -f docker-compose.dev.yml logs -f frontend

logs-neo4j: ## Show Neo4j logs
	docker-compose -f docker-compose.dev.yml logs -f neo4j

clean: ## Remove containers, volumes, and networks
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

build: ## Build all services
	docker-compose -f docker-compose.dev.yml build

test: ## Run tests
	go test ./...

test-backend: test ## Alias for test

install-deps: ## Install backend dependencies
	go mod download

install-deps-ui: ## Install frontend dependencies
	cd ui && npm install

# Local development without Docker
dev-local-backend: ## Run backend locally (requires Go)
	go run cmd/server/main.go \
		--port 8080 \
		--graphdb-url bolt://localhost:7687 \
		--graphdb-user neo4j \
		--graphdb-pass dlv-dev-password \
		--log-level debug

dev-local-frontend: ## Run frontend locally (requires Node.js)
	cd ui && npm run dev

dev-local-neo4j: ## Start Neo4j locally with Docker
	docker run -d \
		--name dlv-neo4j-local \
		-p 7474:7474 -p 7687:7687 \
		-e NEO4J_AUTH=neo4j/dlv-dev-password \
		neo4j:5-community
