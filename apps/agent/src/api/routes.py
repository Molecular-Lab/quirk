"""API routes for the Yield Optimizer Agent."""

from fastapi import APIRouter, HTTPException, status
from uuid import uuid4
import traceback

from .models import ChatRequest, ChatResponse, HealthResponse, ErrorResponse

# Import the agent (will be set by app.py)
agent_instance = None

router = APIRouter()


def set_agent(agent):
    """Set the global agent instance."""
    global agent_instance
    agent_instance = agent


@router.post(
    "/agent",
    response_model=ChatResponse,
    responses={
        500: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
    summary="Chat with the Yield Optimizer Agent",
    description="Send a message to the agent and receive an AI-powered response with real-time DeFi data."
)
async def chat_with_agent(request: ChatRequest) -> ChatResponse:
    """
    Chat with the Yield Optimizer Agent.

    The agent has access to real-time DeFi protocol data via MCP tools and can:
    - Analyze yield opportunities across protocols
    - Compare APYs and risks
    - Calculate impermanent loss
    - Provide portfolio optimization suggestions
    - Assess protocol risks
    """
    if agent_instance is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Agent not initialized. Please try again later."
        )

    if agent_instance.agent is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Agent is not ready. MCP server may not be connected."
        )

    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid4())

        # Get response from agent
        response = await agent_instance.chat(request.message)

        return ChatResponse(
            response=response,
            session_id=session_id
        )

    except Exception as e:
        # Log the full traceback for debugging
        print(f"Error in chat endpoint: {str(e)}")
        print(traceback.format_exc())

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Check the health status of the agent and MCP server connection."
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns the current status of:
    - Agent initialization
    - MCP server connection
    - Overall service health
    """
    agent_initialized = agent_instance is not None
    mcp_connected = False

    if agent_initialized:
        # Check if agent has tools (indicates MCP connection)
        mcp_connected = (
            agent_instance.agent is not None and
            agent_instance.tools is not None and
            len(agent_instance.tools) > 0
        )

    # Determine overall status
    if agent_initialized and mcp_connected:
        overall_status = "healthy"
    elif agent_initialized:
        overall_status = "degraded"  # Agent exists but no MCP connection
    else:
        overall_status = "unhealthy"

    return HealthResponse(
        status=overall_status,
        agent_initialized=agent_initialized,
        mcp_connected=mcp_connected
    )
