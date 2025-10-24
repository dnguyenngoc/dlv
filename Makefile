.PHONY: help build push test lint docker-build docker-push helm-lint helm-package helm-install helm-upgrade clean

# Variables
REGISTRY ?= ghcr.io
NAMESPACE ?= dnguyenngoc
APP_NAME ?= dlv
VERSION ?= $(shell git describe --tags --always --dirty)
BACKEND_IMAGE = $(REGISTRY)/$(NAMESPACE)/$(APP_NAME)-backend
FRONTEND_IMAGE = $(REGISTRY)/$(NAMESPACE)/$(APP_NAME)-frontend
HELM_CHART = charts/dlv

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Start development environment with docker-compose
	docker-compose up -d

dev-down: ## Stop development environment
	docker-compose down

dev-logs: ## View development logs
	docker-compose logs -f

# Testing
test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	go test -v -race -coverprofile=coverage-backend.out ./...

test-frontend: ## Run frontend tests
	cd ui && npm test

# Linting
lint: lint-backend lint-frontend lint-helm ## Run all linters

lint-backend: ## Lint backend code
	@command -v golangci-lint >/dev/null 2>&1 || { echo "golangci-lint not installed. Install it: https://golangci-lint.run/usage/install/"; exit 1; }
	golangci-lint run

lint-frontend: ## Lint frontend code
	cd ui && npm run lint

lint-helm: ## Lint Helm chart
	helm lint $(HELM_CHART)

# Building
build: build-backend build-frontend ## Build all binaries

build-backend: ## Build backend binary
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/dlv ./cmd/server/main.go

build-frontend: ## Build frontend
	cd ui && npm run build

# Docker
docker-build: docker-build-backend docker-build-frontend ## Build all Docker images

docker-build-backend: ## Build backend Docker image
	docker build -t $(BACKEND_IMAGE):$(VERSION) -t $(BACKEND_IMAGE):latest -f Dockerfile .

docker-build-frontend: ## Build frontend Docker image
	docker build -t $(FRONTEND_IMAGE):$(VERSION) -t $(FRONTEND_IMAGE):latest -f ui/Dockerfile ui/

docker-push: docker-push-backend docker-push-frontend ## Push all Docker images

docker-push-backend: ## Push backend Docker image
	docker push $(BACKEND_IMAGE):$(VERSION)
	docker push $(BACKEND_IMAGE):latest

docker-push-frontend: ## Push frontend Docker image
	docker push $(FRONTEND_IMAGE):$(VERSION)
	docker push $(FRONTEND_IMAGE):latest

# Helm
helm-lint: ## Lint Helm chart
	helm lint $(HELM_CHART)

helm-package: ## Package Helm chart
	helm package $(HELM_CHART)

helm-template: ## Template Helm chart for debugging
	helm template dlv $(HELM_CHART)

helm-install-dev: ## Install Helm chart to dev namespace
	helm install dlv $(HELM_CHART) \
		--namespace dlv-dev --create-namespace \
		--set image.tag=$(VERSION) \
		--set frontend.image.tag=$(VERSION)

helm-upgrade-dev: ## Upgrade Helm chart in dev namespace
	helm upgrade dlv $(HELM_CHART) \
		--namespace dlv-dev \
		--set image.tag=$(VERSION) \
		--set frontend.image.tag=$(VERSION)

helm-uninstall: ## Uninstall Helm chart
	helm uninstall dlv --namespace dlv-dev

# CI/CD
ci: lint test ## Run CI pipeline locally

cd-build: docker-build docker-push ## Run CD build pipeline locally

cd-deploy-staging: ## Deploy to staging
	helm upgrade --install dlv $(HELM_CHART) \
		--namespace dlv-staging --create-namespace \
		--set image.tag=$(VERSION) \
		--set frontend.image.tag=$(VERSION) \
		--wait --timeout=10m

cd-deploy-production: ## Deploy to production
	helm upgrade --install dlv $(HELM_CHART) \
		--namespace dlv-production --create-namespace \
		--set image.tag=$(VERSION) \
		--set frontend.image.tag=$(VERSION) \
		--wait --timeout=10m

# Database
db-migrate: ## Run database migrations
	go run ./cmd/server/main.go migrate

db-reset: ## Reset database (WARNING: destructive)
	@echo "WARNING: This will delete all data. Press Ctrl+C to cancel, or Enter to continue..."
	@read
	docker exec dlv-postgres psql -U postgres -d dlv -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	make db-migrate

# Utilities
clean: ## Clean build artifacts
	rm -rf bin/
	rm -rf ui/dist/
	rm -rf ui/build/
	rm -rf coverage*.out
	rm -rf *.tgz

format: ## Format code
	go fmt ./...
	cd ui && npm run format

# Release
release: ## Create a new release (requires VERSION variable)
	@if [ -z "$(VERSION)" ]; then \
		echo "Error: VERSION is required. Example: make release VERSION=1.0.0"; \
		exit 1; \
	fi
	git tag -a v$(VERSION) -m "Release v$(VERSION)"
	git push origin v$(VERSION)

# All-in-one for local development
all: clean lint test build docker-build ## Run everything (clean, lint, test, build, docker-build)
