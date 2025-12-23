# ==========================================
# Stage 1: The Builder (Compiles everything)
# ==========================================
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
# Copy from the cache instead of linking since it's a mounted volume
ENV UV_LINK_MODE=copy
# No uv tool used in the container
# ENV UV_TOOL_BIN_DIR=/usr/local/bin


# Install the project into `/app`
WORKDIR /app


# Install the project's dependencies using the lockfile and settings
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev


# Then, add the rest of the project source code and install it
# Installing separately from its dependencies allows optimal layer caching
COPY src ./src
COPY prompt ./prompt
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ==========================================
# Stage 2: The production stage
# ==========================================
FROM python:3.12-slim-bookworm AS production

ARG VERSION
ENV VERSION=${VERSION:-latest}

# Create a non-root user for security
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy the environment from the builder stage
# We copy the entire .venv directory
COPY --from=builder --chown=appuser:appuser /app/.venv /app/.venv
COPY --from=builder --chown=appuser:appuser /app/src /app/src
COPY --from=builder --chown=appuser:appuser /app/prompt /app/prompt

ENV PATH="/app/.venv/bin:$PATH"

# Environment variables with defaults
ENV API_HOST=0.0.0.0
ENV API_PORT=8000
# Note: MCP_SERVER_URL should be set in docker-compose.yml to point to the MCP service
# Default is localhost for local development only
ENV MCP_SERVER_URL=http://mcp-server:3000

# Switch to non-root user
USER appuser

EXPOSE 8000

# Run the API server using the correct module
CMD ["python", "-m", "src.api_server"]