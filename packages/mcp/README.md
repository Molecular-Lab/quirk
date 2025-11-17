# @proxify/mcp - Yield Optimization MCP Server

A Model Context Protocol (MCP) server that provides yield optimization tools for DeFi agents, powered by DeFiLlama API.

## Features

This MCP server provides the following tools for yield optimization:

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

## Project Structure

```
src/
├── index.ts           # Main MCP server entry point
├── tools/
│   └── yieldTools.ts  # Yield optimization tool definitions
├── types/
│   └── index.ts       # TypeScript types and Zod schemas
└── utils/
    ├── calculations.ts # Calculation utilities
    └── defillama.ts   # DeFiLlama API client
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

## Transport

- **Protocol**: MCP Streamable HTTP with SSE
- **Session Management**: Stateful with UUID-based session IDs
- **Concurrency**: Supports multiple simultaneous sessions
- **Resumability**: Sessions persist for the server lifetime

## Future Enhancements

- Add support for yield pools data (requires pro API)
- Implement historical yield tracking and trend analysis
- Add gas cost estimations for transactions
- Support for complex yield farming strategies
- Add protocol audit scores integration
- Chain-specific yield optimization
