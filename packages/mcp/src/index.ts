#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { yieldTools } from './tools/yieldTools.js';

const server = new McpServer(
	{
		name: '@proxify/mcp',
		version: '0.1.0',
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

// Register all tools from yieldTools
for (const tool of yieldTools) {
	server.registerTool(
		tool.name,
		{
			description: tool.description,
			inputSchema: tool.inputSchema,
		},
		async (args: any) => {
			try {
				const result = await tool.handler(args);

				return {
					content: [
						{
							type: 'text' as const,
							text: JSON.stringify(result, null, 2),
						},
					],
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error: ${errorMessage}`,
						},
					],
					isError: true,
				};
			}
		}
	);
}

// TODO: Change to use HTTP transport
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error('Proxify MCP Yield Optimization Server running on stdio');
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
