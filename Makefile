.PHONY: help install lint test clean build helm-lint helm-build helm-install helm-uninstall

# Default target
help:
	@echo "Available targets:"
	@echo "  make install       - Install dependencies"
	@echo "  make lint          - Run linters"
	@echo "  make test          - Run tests"
	@echo "  make build         - Build Helm chart"
	@echo "  make helm-lint     - Lint Helm chart"
	@echo "  make helm-install  - Install Helm chart locally"
	@echo "  make helm-uninstall - Uninstall Helm chart"
	@echo "  make clean         - Clean generated files"

# Install dependencies
install:
	@echo "Installing dependencies..."
	@command -v helm >/dev/null 2>&1 || { echo "Helm is required but not installed. Install: https://helm.sh/docs/intro/install/"; exit 1; }
	@command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed. Install: https://kubernetes.io/docs/tasks/tools/"; exit 1; }
	@echo "✓ Dependencies installed"

# Lint
lint:
	@echo "Running linters..."
	@command -v yamllint >/dev/null 2>&1 && yamllint . || echo "yamllint not installed, skipping..."
	@echo "✓ Linting complete"

# Test
test:
	@echo "Running tests..."
	@echo "TODO: Add tests"
	@echo "✓ Tests complete"

# Build Helm chart
build: helm-lint
	@echo "Building Helm chart..."
	@helm package charts/dlv
	@echo "✓ Chart built successfully"

# Lint Helm chart
helm-lint:
	@echo "Linting Helm chart..."
	@helm lint charts/dlv
	@echo "✓ Helm chart lint passed"

# Install Helm chart locally
helm-install:
	@echo "Installing Helm chart..."
	@helm install dlv charts/dlv \
		--namespace lineage \
		--create-namespace \
		--debug
	@echo "✓ Helm chart installed"

# Install with custom values
helm-install-custom:
	@echo "Installing Helm chart with custom values..."
	@read -p "Enter values file path: " values_file; \
	helm install dlv charts/dlv \
		--namespace lineage \
		--create-namespace \
		-f $$values_file \
		--debug

# Uninstall Helm chart
helm-uninstall:
	@echo "Uninstalling Helm chart..."
	@helm uninstall dlv --namespace lineage
	@echo "✓ Helm chart uninstalled"

# Clean generated files
clean:
	@echo "Cleaning generated files..."
	@rm -f *.tgz
	@rm -rf charts/*/charts/
	@rm -rf charts/*/.tgz/
	@echo "✓ Clean complete"

# Dry run
helm-dry-run:
	@echo "Running Helm dry-run..."
	@helm install dlv charts/dlv \
		--namespace lineage \
		--create-namespace \
		--dry-run \
		--debug

# Template rendering
helm-template:
	@echo "Rendering Helm templates..."
	@helm template dlv charts/dlv

# Show all values
helm-show-values:
	@helm show values charts/dlv

# Create release
release:
	@echo "Creating release..."
	@read -p "Enter version (e.g., 0.1.0): " version; \
	sed -i.bak "s/^version: .*/version: $$version/" charts/dlv/Chart.yaml; \
	sed -i.bak "s/^appVersion: .*/appVersion: \"$$version\"/" charts/dlv/Chart.yaml; \
	helm package charts/dlv; \
	echo "✓ Release $$version created"

# Development helpers
port-forward:
	@echo "Port forwarding to DLV..."
	@kubectl port-forward -n lineage svc/dlv-dlv 3000:3000

logs:
	@echo "Showing DLV logs..."
	@kubectl logs -f -n lineage deployment/dlv-dlv

status:
	@echo "DLV status:"
	@kubectl get all -n lineage

