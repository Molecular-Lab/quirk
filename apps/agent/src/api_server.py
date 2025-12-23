"""
Entry point for running the Yield Optimizer Agent API server.

This script starts a FastAPI server with uvicorn that exposes the agent via HTTP endpoints.

Usage:
    uv run src/api_server.py
    OR
    uv run python -m src.api_server

Environment Variables:
    API_HOST: Host to bind to (default: 0.0.0.0)
    API_PORT: Port to bind to (default: 8000)
    MCP_SERVER_URL: MCP server URL (default: http://localhost:3000)
    OPENAI_API_KEY: Required for agent LLM
"""

import os
import sys
from pathlib import Path
import uvicorn

# Add parent directory to Python path so 'src' package can be imported
# This allows running the script directly: uv run src/api_server.py
if __name__ == "__main__":
    agent_dir = Path(__file__).parent.parent.resolve()
    if str(agent_dir) not in sys.path:
        sys.path.insert(0, str(agent_dir))


if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))

    print("=" * 60)
    print("🚀 Starting Yield Optimizer Agent API Server")
    print("=" * 60)
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"📡 MCP Server: {os.getenv('MCP_SERVER_URL', 'http://localhost:3000')}")
    print("=" * 60)
    print()
    print("📖 API Documentation:")
    print(f"   - Swagger UI: http://{host if host != '0.0.0.0' else 'localhost'}:{port}/docs")
    print(f"   - ReDoc: http://{host if host != '0.0.0.0' else 'localhost'}:{port}/redoc")
    print()
    print("🔗 Endpoints:")
    print(f"   - POST /agent - Chat with the agent")
    print(f"   - GET /health - Health check")
    print()
    print("⚠️  Make sure the MCP server is running before starting!")
    print("   Start it with: cd packages/mcp && pnpm start")
    print()
    print("=" * 60)

    # Run uvicorn server
    uvicorn.run(
        "src.api.app:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload for development
        log_level="info",
    )
