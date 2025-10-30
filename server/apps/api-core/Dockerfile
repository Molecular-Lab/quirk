# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy shared directories
COPY common ./common
COPY internal ./internal
COPY pkg ./pkg

# Copy api-core specific code
COPY apps/api-core ./apps/api-core

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o api-server ./apps/api-core/cmd/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/api-server .

# Expose API port
EXPOSE 8080

# Run the API server
CMD ["./api-server"]
