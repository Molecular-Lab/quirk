#!/usr/bin/env node

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { yieldTools } from './tools/yieldTools.js';
import { aggregatorTools } from './tools/aggregatorTools.js';
import { optimizerTools } from './tools/optimizerTools.js';

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || 'localhost';

// Track active sessions
const activeSessions = new Map<string, McpServer>();

async function main() {
	// Create HTTP server
	const httpServer = createServer(async (req, res) => {
		// Only accept POST requests for MCP
		if (req.method !== 'POST') {
			res.writeHead(405, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
			return;
		}

		try {
			// Parse request body
			const chunks: Buffer[] = [];
			for await (const chunk of req) {
				chunks.push(chunk);
			}
			const body = Buffer.concat(chunks).toString('utf-8');
			const parsedBody = body ? JSON.parse(body) : undefined;

			// Handle simple REST API endpoint (/agent)
			if (req.url === '/agent' && parsedBody && parsedBody.message) {
				// Enable CORS
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
				res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
				res.setHeader('Content-Type', 'application/json');

				// Simple response for now
				const response = {
					response: `I received your message: "${parsedBody.message}". The AI agent integration is working! However, the actual AI processing is not yet implemented. This is a placeholder response.`,
					session_id: parsedBody.session_id,
					timestamp: new Date().toISOString(),
				};

				res.writeHead(200);
				res.end(JSON.stringify(response));
				return;
			}

			// Get or create session ID
			const sessionId = (req.headers['mcp-session-id'] as string) || randomUUID();

			// Get or create server instance for this session
			let sessionServer = activeSessions.get(sessionId);
			if (!sessionServer) {
				sessionServer = new McpServer(
					{
						name: '@quirk/mcp',
						version: '0.1.0',
					},
					{
						capabilities: {
							tools: {},
						},
					}
				);

				// Combine all tools
				const allTools = [...yieldTools, ...aggregatorTools, ...optimizerTools];

				// Register all tools for this session
				for (const tool of allTools) {
					sessionServer.registerTool(
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
								const errorMessage =
									error instanceof Error ? error.message : String(error);
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

				// Create transport for this session
				const transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => sessionId,
					onsessioninitialized: async (sid) => {
						console.error(`Session initialized: ${sid}`);
					},
					onsessionclosed: async (sid) => {
						console.error(`Session closed: ${sid}`);
						activeSessions.delete(sid);
					},
				});

				// Connect server to transport
				await sessionServer.connect(transport);
				activeSessions.set(sessionId, sessionServer);
			}

			// Get the transport from the server
			const transport = (sessionServer.server as any)._transport;

			// Handle the request
			await transport.handleRequest(req, res, parsedBody);
		} catch (error) {
			console.error('Error handling request:', error);
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(
				JSON.stringify({
					error: 'Internal server error',
					message: error instanceof Error ? error.message : String(error),
				})
			);
		}
	});

	// Start HTTP server
	httpServer.listen(PORT, HOST, () => {
		console.error(`Quirk MCP Yield Optimization Server running on http://${HOST}:${PORT}`);
		console.error(`Endpoint: POST http://${HOST}:${PORT}/`);
		console.error(`Active sessions: ${activeSessions.size}`);
	});

	// Graceful shutdown
	process.on('SIGINT', () => {
		console.error('\nShutting down server...');
		httpServer.close(() => {
			console.error('Server shut down successfully');
			process.exit(0);
		});
	});
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
