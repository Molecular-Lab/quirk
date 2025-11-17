# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy all telegram-bot source code first
COPY apps/defai-telegram-bot ./

# Download dependencies (will create go.sum automatically)
RUN go mod download
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bot ./cmd/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/bot .

# Expose port for health checks
EXPOSE 8081

# Run the bot
CMD ["./bot"]