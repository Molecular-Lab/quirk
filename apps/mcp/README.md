# @proxify/mcp - Yield Optimization MCP Server

A Model Context Protocol (MCP) server that provides comprehensive yield optimization tools for DeFi agents, powered by DeFiLlama API and @proxify/yield-engine.

## Features

This MCP server provides **23 tools** across three categories for yield optimization:

### DeFi Data Tools (DeFiLlama Integration)

1. **get_top_protocols** - Get top DeFi protocols by TVL with optional filtering
2. **get_protocol_details** - Get detailed information about a specific protocol
3. **get_chain_tvls** - Get TVL data for all blockchain networks
4. **get_protocol_fees** - Get fee and revenue data for a specific protocol
5. **get_top_fee_protocols** - Get protocols with the highest fees/revenue
6. **find_best_yields** - Find protocols with the best estimated yields based on fees/TVL ratio

### Calculation Tools

7. **calculate_apy** - Convert APR to APY based on compounding frequency
8. **calculate_impermanent_loss** - Calculate impermanent loss for liquidity pool positions
9. **assess_protocol_risk** - Assess risk level of DeFi protocols using real-time TVL data
10. **compare_yields** - Compare and rank multiple yield opportunities
11. **optimize_portfolio** - Get portfolio optimization suggestions based on risk tolerance

### Yield Aggregator Tools (Multi-Protocol)

12. **fetch_all_opportunities** - Fetch and compare yield opportunities across AAVE, Compound, and Morpho
13. **get_best_opportunity** - Get the single best yield opportunity (highest APY) for a token
14. **get_all_user_positions** - Get user's positions across all DeFi protocols with aggregated metrics
15. **get_aggregated_metrics** - Get aggregated metrics across all protocols (TVL, APY, health)
16. **compare_protocols** - Directly compare yield opportunities between two specific protocols
17. **fetch_opportunities_for_tokens** - Fetch yield opportunities for multiple tokens at once

### Yield Optimizer Tools (Smart Recommendations)

18. **optimize_position** - Analyze a position and get smart optimization recommendations with ranked opportunities
19. **compare_position** - Compare a current position against all available opportunities
20. **get_rebalance_recommendation** - Get detailed rebalancing recommendation with gas cost analysis
21. **is_rebalance_worth_it** - Quick check if rebalancing is financially worth it after gas costs
22. **estimate_break_even_days** - Calculate how many days to recover gas costs through improved APY
23. **get_best_opportunity** - Get the single best yield opportunity (optimizer wrapper)

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm dev
```

## Usage

### HTTP Server Mode (Default)

The MCP server now runs as an HTTP server with Server-Sent Events (SSE) support:

```bash
# Start the server (default port: 3000)
pnpm start

# Or with custom port and host
PORT=8080 HOST=0.0.0.0 pnpm start
```

The server will be available at:
- **Endpoint**: `POST http://localhost:3000/`
- **Protocol**: MCP over Streamable HTTP
- **Sessions**: Stateful with automatic session management

### Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: localhost)

### Client Connection

Connect to the server using MCP HTTP client:

```typescript
// Example using MCP SDK
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:3000')
);
const client = new Client({ name: 'my-client', version: '1.0.0' }, {});
await client.connect(transport);
```

### Legacy: Claude Desktop (Stdio Mode)

For backward compatibility with stdio-based clients, you can use a proxy or wrapper. HTTP mode is recommended for better scalability and multi-client support.

## Tool Examples

### Aggregator Tools

```typescript
// Fetch all opportunities for USDC on Ethereum
await fetch_all_opportunities({
  token: "USDC",
  chainId: 1,
  minAPY: "3.0",
  limit: 10
})

// Get user's positions across all protocols
await get_all_user_positions({
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  chainId: 1,
  tokens: ["USDC", "USDT"]
})

// Compare AAVE vs Morpho
await compare_protocols({
  token: "USDC",
  chainId: 1,
  protocol1: "aave",
  protocol2: "morpho"
})
```

### Optimizer Tools

```typescript
// Optimize a position with risk profile
await optimize_position({
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  token: "USDC",
  chainId: 1,
  riskLevel: "moderate",
  strategy: "gas-aware"
})

// Check if rebalancing is worth it
await is_rebalance_worth_it({
  currentAPY: "5.25",
  newAPY: "6.80",
  positionValueUSD: "10000",
  estimatedGasCostUSD: "25"
})

// Calculate break-even time
await estimate_break_even_days({
  apyDelta: "1.5",
  positionValueUSD: "10000",
  gasCostUSD: "25"
})
```

## Supported Protocols

The yield-engine integration supports:
- **AAVE V3** - Ethereum, Polygon, Base, Arbitrum
- **Compound V3** - Ethereum, Polygon, Base, Arbitrum
- **Morpho** - Ethereum, Base (MetaMorpho vaults)

Supported tokens: USDC, USDT, USDbC (Base), USDC.e (Arbitrum)

## Project Structure

```
src/
├── index.ts              # Main MCP server entry point
├── tools/
│   ├── yieldTools.ts     # DeFi data and calculation tools (DeFiLlama)
│   ├── aggregatorTools.ts # Multi-protocol yield aggregation tools
│   └── optimizerTools.ts # Smart optimization and rebalancing tools
├── types/
│   └── index.ts          # TypeScript types and Zod schemas
└── utils/
    ├── calculations.ts   # Calculation utilities
    └── defillama.ts      # DeFiLlama API client
```

## Development

The server is part of the @proxify monorepo. To develop:

1. Make changes to the source files in `src/`
2. Run `pnpm dev` to compile TypeScript in watch mode
3. Test the server with an MCP client

## Data Sources

- **DeFiLlama API**: Real-time protocol TVL, fees, and revenue data
  - Base URL: `https://api.llama.fi`
  - All endpoints used are free (non-pro) endpoints

- **@proxify/yield-engine**: Direct blockchain integration for real-time APY data
  - AAVE V3: UiPoolDataProvider contract integration
  - Compound V3: Comet contract integration
  - Morpho: MetaMorpho vault and Blue markets integration
  - Built-in caching (2-5 minute TTL)
  - Automatic retry logic with exponential backoff

## Transport

- **Protocol**: MCP Streamable HTTP with SSE
- **Session Management**: Stateful with UUID-based session IDs
- **Concurrency**: Supports multiple simultaneous sessions
- **Resumability**: Sessions persist for the server lifetime

## Agent Integration

This MCP server is designed to work seamlessly with the Python agent in `@proxify/agent`:

```python
from langchain_mcp_adapters import load_mcp_tools
from mcp import ClientSession, streamablehttp_client

# Connect to MCP server
async with streamablehttp_client("http://localhost:3000") as (read, write, _):
    session = ClientSession(read, write)
    await session.initialize()

    # Load all tools automatically
    tools = await load_mcp_tools(session)

    # Tools are now available to the LangChain agent
    # The agent can autonomously discover and use all 23 tools
```

## Architecture

This MCP server follows a three-layer architecture:

1. **DeFi Data Layer** (`yieldTools`) - General market data and calculations
2. **Aggregation Layer** (`aggregatorTools`) - Multi-protocol yield comparison
3. **Optimization Layer** (`optimizerTools`) - Smart recommendations and analysis

The yield-engine is **read-only** by design - it provides intelligence but does not execute transactions.

## Future Enhancements

- Add support for more protocols (Aave V2, Yearn, etc.)
- Implement historical yield tracking and trend analysis
- Enhanced gas cost estimations with real-time network data
- Support for complex yield farming strategies
- Add protocol audit scores integration
- Multi-chain optimization strategies
- Yield prediction models using ML
