# Multi-stage Dockerfile supporting both dev and prod modes
ARG MODE=prod

# Development stage
FROM golang:1.24-alpine AS dev
RUN apk add --no-cache git make gcc musl-dev
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download && go mod tidy
COPY . .
EXPOSE 8080
CMD ["go", "run", "./cmd/server/main.go"]

# Build stage for production
FROM golang:1.24-alpine AS prod-builder
RUN apk add --no-cache git make gcc musl-dev
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o dlv ./cmd/server/main.go

# Production stage
FROM alpine:latest AS prod
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=prod-builder /build/dlv .
COPY --from=prod-builder /build/pkg/database/migrations ./migrations
RUN addgroup -g 1000 dlv && \
    adduser -D -u 1000 -G dlv dlv && \
    chown -R dlv:dlv /app
USER dlv
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
CMD ["./dlv"]

# Final stage selector
FROM ${MODE}
