# Build stage for Go backend
FROM golang:1.21-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache git make

WORKDIR /build

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o dlv ./cmd/server

# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /build

# Copy frontend files
COPY ui/package*.json ./
RUN npm ci

COPY ui/ ./
RUN npm run build

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy backend binary
COPY --from=backend-builder /build/dlv .

# Copy frontend static files
COPY --from=frontend-builder /build/dist ./ui/dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["./dlv"]

