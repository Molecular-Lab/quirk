# Yield Optimizer Agent

An AI-powered DeFi yield optimization agent with real-time protocol data access via MCP (Model Context Protocol).

## Features

- 🤖 **AI-Powered**: Uses OpenAI GPT models with LangChain for intelligent DeFi analysis
- 📊 **Real-Time Data**: Access to 23+ tools via MCP server for live protocol data
- 🔄 **Multi-Protocol**: Compare yields across AAVE V3, Compound V3, Morpho
- ⚡ **Fast API**: FastAPI REST API with async/await
- 💬 **Interactive CLI**: Command-line interface for direct interaction
- 📖 **Auto-Generated Docs**: Swagger UI and ReDoc at `/docs` and `/redoc`

## Prerequisites

- Python 3.12+
- Node.js (for MCP server)
- OpenAI API key
- MCP server running (see `packages/mcp/`)

## Installation

```bash
# Install dependencies using uv
uv sync

# Or using pip
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the agent directory:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
MCP_SERVER_URL=http://localhost:3000  # Default MCP server URL
API_HOST=0.0.0.0                      # API server host
API_PORT=8000                         # API server port
```

## Usage

### Option 1: HTTP API Server (Recommended)

Start the MCP server first:

```bash
# In packages/mcp/
pnpm install
pnpm build
pnpm start
```

Then start the API server:

```bash
# In packages/agent/
uv run python src/api_server.py
```

The API will be available at:
- **Base URL**: `http://localhost:8000`
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Option 2: Interactive CLI

```bash
uv run python src/main.py
```

## API Endpoints

### POST /agent

Chat with the AI agent.

**Request:**
```json
{
  "message": "What's the best yield for USDC on Ethereum?",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "Based on current data from DeFiLlama, here are the best yields for USDC on Ethereum...",
  "session_id": "abc-123"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/agent" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Compare AAVE and Morpho yields for USDC",
    "session_id": "user-123"
  }'
```

**Python Example:**
```python
import requests

response = requests.post(
    "http://localhost:8000/agent",
    json={
        "message": "What's the best yield for USDC on Ethereum?",
        "session_id": "user-123"
    }
)

data = response.json()
print(f"Agent: {data['response']}")
print(f"Session: {data['session_id']}")
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "agent_initialized": true,
  "mcp_connected": true
}
```

**cURL Example:**
```bash
curl "http://localhost:8000/health"
```

## Agent Capabilities

The agent has access to the following tools via the MCP server:

### DeFi Data Tools
- `get_top_protocols` - Get top DeFi protocols by TVL
- `get_protocol_details` - Get detailed protocol information
- `get_chain_tvls` - Get TVL data for blockchain networks
- `get_protocol_fees` - Get fee and revenue data
- `get_top_fee_protocols` - Get protocols with highest fees
- `find_best_yields` - Find best estimated yields

### Calculation Tools
- `calculate_apy` - Convert APR to APY
- `calculate_impermanent_loss` - Calculate IL for LP positions
- `assess_protocol_risk` - Risk assessment using TVL data
- `compare_yields` - Compare and rank yield opportunities
- `optimize_portfolio` - Portfolio optimization suggestions

### Yield Aggregator Tools (via yield-engine)
- `fetch_all_opportunities` - Compare yields across protocols
- `get_best_opportunity` - Get highest APY
- `get_all_user_positions` - User positions across protocols
- `get_aggregated_metrics` - Protocol metrics
- `compare_protocols` - Direct protocol comparison
- `fetch_opportunities_for_tokens` - Multi-token search

### Yield Optimizer Tools (via yield-engine)
- `optimize_position` - Smart optimization recommendations
- `compare_position` - Position vs opportunities
- `get_rebalance_recommendation` - Gas-aware rebalancing
- `is_rebalance_worth_it` - Profitability check
- `estimate_break_even_days` - Gas cost recovery timeline
- `get_best_opportunity` - Quick best yield lookup

## Development

### Running in Development Mode

```bash
# Start with auto-reload
uv run python src/api_server.py

# Or use uvicorn directly
uv run uvicorn src.api.app:app --reload --port 8000
```

### Project Structure

```
agent/
├── src/
│   ├── main.py           # CLI agent implementation
│   ├── api/
│   │   ├── __init__.py   # API module init
│   │   ├── app.py        # FastAPI application
│   │   ├── routes.py     # API endpoints
│   │   └── models.py     # Pydantic schemas
│   └── api_server.py     # API entry point
├── prompt/
│   └── prompt.md         # System prompt
├── .env                  # Environment variables
├── pyproject.toml        # Dependencies
└── README.md             # This file
```

### Running Tests

```bash
# Install test dependencies
uv add --dev pytest pytest-asyncio httpx

# Run tests (when available)
uv run pytest
```

## Troubleshooting

### MCP Server Not Connected

**Error:** `Agent not initialized` or `mcp_connected: false`

**Solution:**
1. Make sure the MCP server is running:
   ```bash
   cd packages/mcp && pnpm start
   ```
2. Check the MCP server URL in your `.env` file
3. Verify the server is accessible: `curl http://localhost:3000/health`

### OpenAI API Errors

**Error:** `OPENAI_API_KEY not set`

**Solution:**
1. Create a `.env` file in the agent directory
2. Add your OpenAI API key: `OPENAI_API_KEY=sk-...`

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
1. Change the port in `.env`: `API_PORT=8001`
2. Or kill the process using the port:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
