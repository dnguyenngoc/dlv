.PHONY: help build run test clean docker-build docker-push install deps lint fmt

# Variables
DOCKER_REGISTRY ?= docker.io
DOCKER_USERNAME ?= duynguyenngoc
IMAGE_NAME ?= dlv
VERSION ?= latest
GIT_COMMIT ?= $(shell git rev-parse --short HEAD)
BUILD_DATE ?= $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build info
LDFLAGS = -X 'main.version=$(VERSION)' \
          -X 'main.commit=$(GIT_COMMIT)' \
          -X 'main.date=$(BUILD_DATE)'

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

deps: ## Install Go dependencies
	@echo "Installing Go dependencies..."
	@go mod download
	@go mod tidy

build: ## Build the Go binary
	@echo "Building binary..."
	@CGO_ENABLED=0 GOOS=linux go build -ldflags "$(LDFLAGS)" -o bin/dlv ./cmd/server

run: ## Run the application locally
	@echo "Running application..."
	@go run ./cmd/server

test: ## Run tests
	@echo "Running tests..."
	@go test -v ./...

lint: ## Run linters
	@echo "Running linters..."
	@golangci-lint run

fmt: ## Format code
	@echo "Formatting code..."
	@go fmt ./...

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf bin/
	@rm -rf dist/
	@rm -rf ui/dist/

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	@docker build -t $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(IMAGE_NAME):$(VERSION) .
	@docker tag $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(IMAGE_NAME):$(VERSION) $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(IMAGE_NAME):latest

docker-build-binary: ## Build Docker image (binary only)
	@echo "Building Docker image (binary only)..."
	@docker build -f Dockerfile.binary -t $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(IMAGE_NAME):$(VERSION)-binary .

docker-push: ## Push Docker image
	@echo "Pushing Docker image..."
	@docker push $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(IMAGE_NAME):$(VERSION)
	@docker push $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(IMAGE_NAME):latest

install: deps build ## Install dependencies and build

all: clean deps test build docker-build ## Run all: clean, deps, test, build, docker-build

ui-install: ## Install UI dependencies
	@echo "Installing UI dependencies..."
	@cd ui && npm install

ui-build: ## Build UI
	@echo "Building UI..."
	@cd ui && npm run build

ui-dev: ## Run UI development server
	@echo "Starting UI development server..."
	@cd ui && npm run dev

.PHONY: helm-package helm-lint helm-install helm-uninstall

helm-package: ## Package Helm chart
	@echo "Packaging Helm chart..."
	@helm package charts/dlv

helm-lint: ## Lint Helm chart
	@echo "Linting Helm chart..."
	@helm lint charts/dlv

helm-install: ## Install Helm chart locally
	@echo "Installing Helm chart..."
	@helm install dlv charts/dlv --namespace lineage --create-namespace

helm-uninstall: ## Uninstall Helm chart
	@echo "Uninstalling Helm chart..."
	@helm uninstall dlv --namespace lineage

# Go dependencies
go.mod: ## Generate go.mod and go.sum
	@echo "Generating go modules..."
	@go mod tidy
	@go mod download
	@go mod verify
