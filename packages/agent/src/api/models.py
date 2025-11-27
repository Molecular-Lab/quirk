"""Pydantic models for API request and response schemas."""

from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    message: str = Field(..., description="User message to send to the agent")
    session_id: Optional[str] = Field(None, description="Optional session ID for conversation tracking")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "message": "What's the best yield for USDC on Ethereum?",
                    "session_id": "user-123"
                }
            ]
        }
    }


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    response: str = Field(..., description="Agent's response message")
    session_id: str = Field(..., description="Session ID for this conversation")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "response": "Based on current data from DeFiLlama, here are the best yields for USDC on Ethereum...",
                    "session_id": "user-123"
                }
            ]
        }
    }


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""

    status: str = Field(..., description="Overall health status")
    agent_initialized: bool = Field(..., description="Whether the agent is initialized")
    mcp_connected: bool = Field(..., description="Whether MCP server is connected")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "healthy",
                    "agent_initialized": True,
                    "mcp_connected": True
                }
            ]
        }
    }


class ErrorResponse(BaseModel):
    """Response model for error responses."""

    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "error": "Agent not initialized",
                    "detail": "The agent failed to connect to the MCP server"
                }
            ]
        }
    }
