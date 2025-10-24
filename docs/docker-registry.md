# Docker Registry Configuration

DLV Helm chart requires Docker images to be stored in a container registry. This guide explains how to configure registry access.

## Registry Options

### 1. GitHub Container Registry (ghcr.io) - Recommended

**Pros:**
- Free for public repositories
- Integrated with GitHub
- Easy to set up
- Unlimited public images

**Setup:**
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u dnguyenngoc --password-stdin

# Build and push images
docker build -t ghcr.io/dnguyenngoc/dlv:latest .
docker push ghcr.io/dnguyenngoc/dlv:latest
```

**Values.yaml:**
```yaml
image:
  repository: ghcr.io/dnguyenngoc/dlv
```

### 2. Docker Hub

**Pros:**
- Most popular registry
- Simple authentication
- Free tier available

**Setup:**
```bash
# Login to Docker Hub
docker login

# Build and push
docker build -t duynguyenngoc/dlv:latest .
docker push duynguyenngoc/dlv:latest
```

**Values.yaml:**
```yaml
image:
  repository: docker.io/duynguyenngoc/dlv
```

### 3. Google Container Registry (GCR)

**Pros:**
- Good performance
- Integrated with GCP
- Strong security

**Setup:**
```bash
# Authenticate
gcloud auth configure-docker

# Build and push
docker build -t gcr.io/your-project/dlv:latest .
docker push gcr.io/your-project/dlv:latest
```

**Values.yaml:**
```yaml
image:
  repository: gcr.io/your-project/dlv
```

### 4. Amazon ECR

**Pros:**
- Integrated with AWS
- Good for AWS deployments
- IAM-based access control

**Setup:**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t 123456789.dkr.ecr.us-east-1.amazonaws.com/dlv:latest .
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/dlv:latest
```

**Values.yaml:**
```yaml
image:
  repository: 123456789.dkr.ecr.us-east-1.amazonaws.com/dlv
```

### 5. Private Registry

**Pros:**
- Full control
- No external dependencies
- Custom policies

**Setup:**
```bash
# Login to private registry
docker login your-registry.internal

# Build and push
docker build -t your-registry.internal/dlv:latest .
docker push your-registry.internal/dlv:latest
```

**Values.yaml:**
```yaml
image:
  repository: your-registry.internal/dlv
```

## Configuration in Helm Chart

### Basic Configuration

```yaml
image:
  repository: ghcr.io/dnguyenngoc/dlv
  pullPolicy: IfNotPresent
  tag: "latest"
```

### With Image Pull Secrets

If your registry requires authentication:

```yaml
image:
  repository: ghcr.io/dnguyenngoc/dlv
  pullPolicy: Always
  tag: "v0.1.0"

imagePullSecrets:
  - name: registry-secret
```

Create the secret:

```bash
kubectl create secret docker-registry registry-secret \
  --docker-server=ghcr.io \
  --docker-username=dnguyenngoc \
  --docker-password=YOUR_TOKEN \
  --namespace lineage
```

### Using Custom Values

```bash
helm install dlv dlv/dlv \
  --set image.repository=ghcr.io/dnguyenngoc/dlv \
  --set image.tag=v0.1.0
```

## Building Images

### Backend Image

```dockerfile
# Dockerfile.backend
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o dlv ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/dlv .
CMD ["./dlv"]
```

Build:
```bash
docker build -f Dockerfile.backend -t ghcr.io/dnguyenngoc/dlv:latest .
docker push ghcr.io/dnguyenngoc/dlv:latest
```

### Frontend Image

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build:
```bash
docker build -f Dockerfile.frontend -t ghcr.io/dnguyenngoc/dlv-ui:latest .
docker push ghcr.io/dnguyenngoc/dlv-ui:latest
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        run: |
          docker build -t ghcr.io/dnguyenngoc/dlv:${{ github.sha }} .
          docker push ghcr.io/dnguyenngoc/dlv:${{ github.sha }}
```

## Troubleshooting

### ImagePullBackOff Error

**Problem:** Kubernetes cannot pull the image

**Solutions:**
1. Check image name and tag
2. Verify registry credentials
3. Check network connectivity
4. Verify image exists in registry

```bash
# Check pod status
kubectl describe pod -n lineage

# Check image pull secrets
kubectl get secrets -n lineage
```

### Authentication Issues

**Problem:** Registry authentication failed

**Solutions:**
1. Create image pull secret
2. Verify credentials
3. Check secret is mounted correctly

```bash
# Create secret
kubectl create secret docker-registry myregistrykey \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=TOKEN \
  --docker-email=EMAIL \
  --namespace lineage

# Update deployment to use secret
kubectl patch deployment dlv-dlv -n lineage -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"myregistrykey"}]}}}}'
```

## Best Practices

1. **Use tags**: Don't rely on `latest`, use semantic versioning
2. **Immutable images**: Once pushed, don't overwrite tags
3. **Scan for vulnerabilities**: Use image scanning tools
4. **Use secrets**: Never commit credentials
5. **Multi-stage builds**: Keep images small
6. **Cache layers**: Optimize Dockerfile for caching

## Recommended Setup for DLV

For the DLV project, we're using **Docker Hub**:

1. Most popular container registry
2. Simple authentication
3. Free tier available
4. Widely supported

Configuration:
```yaml
image:
  repository: docker.io/duynguyenngoc/dlv
  pullPolicy: IfNotPresent
  tag: "v0.1.0"
```
