# Contributing to DLV

Thank you for your interest in contributing to DLV! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a friendly and respectful environment for all contributors.

## How to Contribute

### Reporting Bugs

1. **Check existing issues**: Make sure the bug hasn't been reported already
2. **Create a new issue**: Use the bug report template
3. **Provide details**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Kubernetes version, Helm version, etc.)
   - Relevant logs or screenshots

### Suggesting Features

1. **Create a feature request**: Use the feature request template
2. **Describe the use case**: Explain why this feature would be useful
3. **Propose solution**: If you have ideas on how to implement it

### Contributing Code

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/dnguyenngoc/dlv.git
   cd dlv
   ```

3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**

5. **Test your changes**
   ```bash
   # Install Helm chart locally
   helm install dlv ./charts/realtime-lineage
   
   # Run any existing tests
   make test
   ```

6. **Commit your changes**:
   ```bash
   git commit -m "Add: Description of your changes"
   ```

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**

#### Commit Messages

Follow the conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: Add support for Flink collector
```

#### Pull Request Guidelines

1. **Keep PRs focused**: One feature or fix per PR
2. **Update documentation**: If you add features, update docs
3. **Add tests**: Include tests for new functionality
4. **Update CHANGELOG**: Add an entry describing your changes
5. **Description**: Provide clear description of what and why

#### Code Style

- **Helm Charts**: Follow [Helm best practices](https://helm.sh/docs/chart_best_practices/)
- **YAML**: Use consistent indentation (2 spaces)
- **Markdown**: Follow [Markdown style guide](https://www.markdownguide.org/)

## Development Setup

### Prerequisites

- Kubernetes cluster (minikube/kind for local development)
- Helm 3.x
- kubectl
- Docker (optional, for building images)

### Local Development

1. **Start local Kubernetes**:
   ```bash
   minikube start
   # or
   kind create cluster
   ```

2. **Install dependencies**:
   ```bash
   make deps
   ```

3. **Build and install chart**:
   ```bash
   helm install dlv ./charts/realtime-lineage
   ```

4. **Check status**:
   ```bash
   kubectl get pods -n lineage
   ```

5. **View logs**:
   ```bash
   kubectl logs -f -n lineage deployment/dlv-realtime-lineage
   ```

## Project Structure

```
dlv/
├── charts/
│   └── realtime-lineage/      # Helm chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── docs/                       # Documentation
├── examples/                   # Example configurations
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## Areas for Contribution

### High Priority

- [ ] Implement Spark collector
- [ ] Implement Airflow collector
- [ ] Implement Kafka collector
- [ ] Implement Flink collector
- [ ] Add Neo4j backend integration
- [ ] Add ArangoDB backend integration
- [ ] Build React frontend
- [ ] Add comprehensive tests

### Documentation

- [ ] Getting started guide
- [ ] Architecture deep dive
- [ ] Collector development guide
- [ ] Troubleshooting guide
- [ ] Video tutorials

### Examples

- [ ] Complete Spark example
- [ ] Complete Airflow example
- [ ] Complete Kafka example
- [ ] Multi-cluster setup guide

## Testing

### Running Tests

```bash
# Run all tests
make test

# Run specific test suite
make test-unit
make test-integration
```

### Adding Tests

- Unit tests for collectors
- Integration tests for Helm chart
- End-to-end tests for complete workflows

## Release Process

1. Update version in `Chart.yaml`
2. Update `CHANGELOG.md`
3. Create release tag
4. Build and publish Helm chart

## Questions?

- Open an issue for questions
- Join discussions in GitHub Discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

Thank you for contributing to DLV! 🎉

