# CI/CD Documentation

This document describes the GitHub Actions workflows for DLV.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Trigger**: On every push to `main` and pull requests

**Purpose**: Basic validation and linting

**Steps**:
- Lint Helm chart
- Validate chart schema
- Package chart
- Render templates
- Check YAML syntax

**Features**:
- Does NOT require Kubernetes cluster
- Fast execution
- Catches basic errors early

### 2. Test Workflow (`.github/workflows/test.yml`)

**Trigger**: On every push to `main` and pull requests

**Purpose**: Comprehensive chart testing

**Steps**:
- Helm lint
- Template rendering
- Chart packaging
- Dependency verification

**Features**:
- Thorough validation
- No cluster required
- Outputs packaged chart

### 3. Release Workflow (`.github/workflows/release.yml`)

**Trigger**: On push of version tags (e.g., `v0.1.0`)

**Purpose**: Automatically release and publish chart

**Steps**:
- Package Helm chart
- Create repository index
- Deploy to GitHub Pages
- Create GitHub release

**Features**:
- Automatic chart publishing
- GitHub Pages hosting
- Release notes generation

## Workflow Triggers

### Push to main
```bash
git push origin main
```
- Triggers: `ci.yml`, `test.yml`

### Create pull request
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```
- Triggers: `ci.yml`, `test.yml`

### Release version
```bash
git tag v0.1.0
git push origin v0.1.0
```
- Triggers: `release.yml`

## Local Testing

### Test workflows locally

Use [act](https://github.com/nektos/act) to run workflows locally:

```bash
# Install act
brew install act  # macOS
# or download from GitHub releases

# Run CI workflow
act -j lint

# Run test workflow
act -j test-chart

# Run specific event
act push
```

### Manual workflow steps

```bash
# Lint chart
helm lint charts/dlv

# Template rendering
helm template test-release ./charts/dlv

# Package chart
helm package charts/dlv

# Create index
helm repo index . --url https://dnguyenngoc.github.io/dlv/
```

## Troubleshooting

### Workflow failing on lint

```bash
# Check lint errors
helm lint charts/dlv

# Fix any template errors
# Common issues:
# - Missing values in values.yaml
# - Incorrect template syntax
# - Undefined variables
```

### Workflow failing on packaging

```bash
# Check dependencies
helm dependency list charts/dlv

# Update dependencies
helm dependency update charts/dlv

# Verify Chart.yaml
cat charts/dlv/Chart.yaml
```

### Release workflow not triggering

**Issue**: Tag push not triggering release

**Solution**:
```bash
# Ensure tag starts with 'v'
git tag v0.1.0  # ✅ Correct
git tag 0.1.0   # ❌ Won't trigger

# Push tag correctly
git push origin v0.1.0
```

### GitHub Pages not deploying

**Issue**: Chart not appearing on GitHub Pages

**Solution**:
1. Check GitHub Pages settings
2. Ensure `gh-pages` branch exists
3. Verify workflow has permissions:
   ```yaml
   permissions:
     contents: write
     pages: write
     id-token: write
   ```

## Workflow Status

View workflow status at:
- GitHub Actions: `https://github.com/dnguyenngoc/dlv/actions`
- Badge (add to README):
  ```markdown
  ![CI](https://github.com/dnguyenngoc/dlv/workflows/CI/badge.svg)
  ```

## Best Practices

1. **Test locally first**: Run `helm lint` and `helm template` before pushing
2. **Use meaningful commits**: Conventional commits help with changelog
3. **Version tags**: Use semantic versioning (v0.1.0, v0.2.0, etc.)
4. **Review PRs**: Always review changes before merging
5. **Monitor releases**: Check that charts are published correctly

## Advanced Usage

### Custom workflow inputs

```yaml
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release'
        required: true
        type: string
```

### Environment-specific deployment

```yaml
jobs:
  deploy:
    strategy:
      matrix:
        environment: [staging, production]
    steps:
      - name: Deploy to ${{ matrix.environment }}
        run: |
          helm install dlv ./charts/dlv \
            --set environment=${{ matrix.environment }}
```

### Caching dependencies

```yaml
- name: Cache Helm repositories
  uses: actions/cache@v3
  with:
    path: ~/.helm/repository
    key: ${{ runner.os }}-helm-${{ hashFiles('**/Chart.yaml') }}
```

