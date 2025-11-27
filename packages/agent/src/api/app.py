"""FastAPI application for the Yield Optimizer Agent."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..main import YieldOptimizerAgent
from .routes import router, set_agent

# Global agent instance
agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI app.

    Handles startup and shutdown events:
    - Startup: Initialize agent and connect to MCP server
    - Shutdown: Cleanup agent resources
    """
    global agent

    print("🚀 Starting Yield Optimizer Agent API...")

    try:
        # Get MCP server URL from environment or use default
        mcp_url = os.getenv("MCP_SERVER_URL", "http://localhost:3000")
        print(f"📡 MCP Server URL: {mcp_url}")

        # Initialize agent (don't start MCP server, assume it's already running)
        agent = YieldOptimizerAgent(mcp_url=mcp_url)
        await agent.initialize(start_server=False)

        # Set the agent instance for routes
        set_agent(agent)

        print("✅ Agent initialized successfully")
        print(f"🔧 Available tools: {len(agent.tools) if agent.tools else 0}")

    except Exception as e:
        print(f"⚠️  Warning: Failed to initialize agent: {str(e)}")
        print("   API will start but agent endpoints will return errors")
        print("   Make sure the MCP server is running on the configured URL")

    yield  # Server runs here

    # Cleanup on shutdown
    print("\n🔄 Shutting down Yield Optimizer Agent API...")
    if agent:
        try:
            await agent.close()
            print("✅ Agent cleanup completed")
        except Exception as e:
            print(f"⚠️  Error during cleanup: {str(e)}")


# Create FastAPI app
app = FastAPI(
    title="Yield Optimizer Agent API",
    description="""
    API for interacting with the Yield Optimizer Agent.

    The agent provides AI-powered DeFi yield optimization with real-time data from:
    - AAVE V3
    - Compound V3
    - Morpho
    - DeFiLlama protocol data

    ## Features

    - 🤖 **Chat with Agent**: Get intelligent responses about DeFi yields
    - 📊 **Real-time Data**: Access to 23+ tools via MCP server
    - 🔍 **Multi-Protocol**: Compare yields across major protocols
    - ⚡ **Fast**: Async/await throughout for optimal performance
    """,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, tags=["Agent"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Yield Optimizer Agent API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "agent": "/agent (POST)"
    }
