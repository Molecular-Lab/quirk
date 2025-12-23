import os
import asyncio
import subprocess
from pathlib import Path
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain.agents import create_agent
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from langchain_mcp_adapters.tools import load_mcp_tools

# Load environment variables
load_dotenv()


class YieldOptimizerAgent:
    """A DeFi yield optimization agent with real-time data access via MCP."""

    def __init__(
        self,
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.7,
        mcp_url: str = "http://localhost:3000"
    ):
        """Initialize the agent with an LLM."""
        # Initialize the LLM
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=os.getenv("OPENAI_API_KEY")
        )

        # Load system prompt
        self.system_prompt = self._load_system_prompt()

        # MCP configuration
        self.mcp_url = mcp_url
        self.mcp_session = None
        self._http_context = None
        self.tools = []
        self.mcp_server_process = None

        # Agent will be built after initialization
        self.agent = None

    async def initialize(self, start_server: bool = True):
        """Initialize MCP connection and load tools.

        Args:
            start_server: If True, automatically start the MCP server.
                         If False, assumes server is already running.
        """
        # Start MCP server if requested
        if start_server:
            await self._start_mcp_server()
            # Give server time to start
            await asyncio.sleep(1)

        try:
            # Connect to MCP server via HTTP
            print(f"🔌 Connecting to MCP server at {self.mcp_url}...")

            # Create HTTP client
            http_context = streamablehttp_client(self.mcp_url)
            read, write, _ = await http_context.__aenter__()
            self._http_context = http_context

            # Create session
            self.mcp_session = ClientSession(read, write)
            await self.mcp_session.__aenter__()

            # Initialize the session
            await self.mcp_session.initialize()

            # Load MCP tools
            self.tools = await load_mcp_tools(self.mcp_session)
            print(f"✅ Loaded {len(self.tools)} tools from MCP server")

            # Create ReAct agent with tools
            self.agent = create_agent(
                self.llm,
                self.tools,
                system_prompt=self.system_prompt
            )
            print("✅ ReAct agent created successfully")

        except Exception as e:
            print(f"⚠️  Warning: Failed to connect to MCP server: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            print("Creating agent without tools...")

            # Create agent without tools
            self.agent = create_agent(
                self.llm,
                [],
                system_prompt=self.system_prompt
            )

        return self

    async def _start_mcp_server(self):
        """Start the MCP server as a background process."""
        mcp_path = Path(__file__).resolve().parent.parent.parent / "mcp" / "dist" / "index.js"

        if not mcp_path.exists():
            print(f"⚠️  Warning: MCP server not found at {mcp_path}")
            print("Please start the MCP server manually or build it first.")
            return

        # Find node executable
        import shutil
        node_path = shutil.which("node")
        if not node_path:
            print("⚠️  Warning: 'node' not found in PATH")
            return

        # Extract port from URL
        from urllib.parse import urlparse
        parsed_url = urlparse(self.mcp_url)
        port = parsed_url.port or 3000

        print(f"🚀 Starting MCP server on port {port}...")

        # Start server process
        self.mcp_server_process = subprocess.Popen(
            [node_path, str(mcp_path)],
            env={**os.environ, "PORT": str(port)},
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        print(f"✅ MCP server started (PID: {self.mcp_server_process.pid})")

    async def close(self):
        """Clean up MCP connection and stop server if we started it."""
        # Close MCP session
        try:
            if self.mcp_session:
                await self.mcp_session.__aexit__(None, None, None)
        except Exception as e:
            print(f"Warning: Error closing MCP session: {e}")

        # Close HTTP context
        try:
            if self._http_context:
                await self._http_context.__aexit__(None, None, None)
        except Exception as e:
            print(f"Warning: Error closing HTTP context: {e}")

        # Stop MCP server if we started it
        if self.mcp_server_process:
            print("🛑 Stopping MCP server...")
            self.mcp_server_process.terminate()
            try:
                self.mcp_server_process.wait(timeout=5)
                print("✅ MCP server stopped")
            except subprocess.TimeoutExpired:
                self.mcp_server_process.kill()
                print("⚠️  MCP server force killed")

    def _load_system_prompt(self) -> str:
        """Load the system prompt from prompt.md file."""
        prompt_path = Path(__file__).parent.parent / "prompt" / "prompt.md"

        if prompt_path.exists():
            return prompt_path.read_text().strip()
        else:
            # Fallback prompt if file doesn't exist
            return "You are a helpful DeFi yield optimization assistant."

    async def chat(self, message: str) -> str:
        """Send a message and get a response.

        Args:
            message: The user's message

        Returns:
            The agent's response
        """
        if not self.agent:
            raise RuntimeError("Agent not initialized. Call initialize() first.")

        # Create initial state with user message
        result = await self.agent.ainvoke({"messages": [HumanMessage(content=message)]})

        # Extract the final AI response
        return result["messages"][-1].content

    async def run_interactive(self):
        """Run an interactive chat loop."""
        print("🤖 Yield Optimizer Agent (ReAct Mode)")
        print("=" * 50)
        print(f"Tools available: {len(self.tools)}")
        print("Type 'exit', 'quit', or 'q' to end the conversation.\n")

        # Maintain conversation history
        conversation_history = []

        while True:
            try:
                # Get user input
                user_input = input("You: ").strip()

                # Check for exit commands
                if user_input.lower() in ['exit', 'quit', 'q']:
                    print("\n👋 Goodbye!")
                    break

                if not user_input:
                    continue

                # Add user message to history
                conversation_history.append(HumanMessage(content=user_input))

                # Track how many messages we had before the agent ran
                previous_message_count = len(conversation_history)

                # Run the agent (tool calling is handled automatically by ReAct agent)
                result = await self.agent.ainvoke(
                    {"messages": conversation_history}
                )

                # Get only the new messages from this turn
                new_messages = result["messages"][previous_message_count:]

                # Display tool calls and results
                for msg in new_messages:
                    # Check for tool calls (AI deciding to use tools)
                    if isinstance(msg, AIMessage) and hasattr(msg, 'tool_calls') and msg.tool_calls:
                        for tool_call in msg.tool_calls:
                            print(f"\n🔧 Tool Call: {tool_call.get('name', 'unknown')}")
                            print(f"   Arguments: {tool_call.get('args', {})}")

                    # Check for tool results
                    elif isinstance(msg, ToolMessage):
                        print(f"\n✅ Tool Result ({msg.name}):")
                        # Truncate long results for readability
                        content = str(msg.content)
                        if len(content) > 500:
                            print(f"   {content[:500]}...")
                        else:
                            print(f"   {content}")

                # Update conversation history with all messages from the agent
                conversation_history = result["messages"]

                # Display the final response
                final_message = result["messages"][-1]
                if isinstance(final_message, AIMessage) and final_message.content:
                    print(f"\n🤖 Agent: {final_message.content}\n")

            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}\n")
                import traceback
                traceback.print_exc()


async def main():
    """Main entry point for the agent."""
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found in environment variables.")
        print("Please add it to your .env file.")
        return

    # Initialize the agent
    agent = YieldOptimizerAgent()
    await agent.initialize()

    try:
        # Run the interactive session
        await agent.run_interactive()
    finally:
        # Clean up MCP connection
        await agent.close()


if __name__ == "__main__":
    asyncio.run(main())
