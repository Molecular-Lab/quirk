import os
from pathlib import Path
from typing import TypedDict, Annotated
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

# Load environment variables
load_dotenv()

# Define the state schema
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


class YieldOptimizerAgent:
    """A simple chat agent built with LangGraph that will evolve into a yield optimizer."""

    def __init__(self, model_name: str = "gpt-4o-mini", temperature: float = 0.7):
        """Initialize the agent with an LLM and build the graph."""
        # Initialize the LLM
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=os.getenv("OPENAI_API_KEY")
        )

        # Load system prompt
        self.system_prompt = self._load_system_prompt()

        # Build the graph
        self.graph = self._build_graph()

    def _load_system_prompt(self) -> str:
        """Load the system prompt from prompt.md file."""
        prompt_path = Path(__file__).parent.parent / "prompt" / "prompt.md"

        if prompt_path.exists():
            return prompt_path.read_text().strip()
        else:
            # Fallback prompt if file doesn't exist
            return "You are a helpful AI assistant."

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        # Create a new graph
        workflow = StateGraph(AgentState)

        # Define the chat node
        def chat_node(state: AgentState) -> AgentState:
            """Process messages and generate a response."""
            # Prepare messages with system prompt
            messages = [SystemMessage(content=self.system_prompt)] + state["messages"]

            # Get response from LLM
            response = self.llm.invoke(messages)

            # Return updated state
            return {"messages": [response]}

        # Add the chat node
        workflow.add_node("chat", chat_node)

        # Set the entry point
        workflow.set_entry_point("chat")

        # Add edge to END after chat
        workflow.add_edge("chat", END)

        # Compile the graph
        return workflow.compile()

    def chat(self, message: str) -> str:
        """Send a message and get a response."""
        # Create initial state with user message
        initial_state = {
            "messages": [HumanMessage(content=message)]
        }

        # Run the graph
        result = self.graph.invoke(initial_state)

        # Extract the AI's response
        return result["messages"][-1].content

    def chat_stream(self, message: str):
        """Stream a chat response."""
        initial_state = {
            "messages": [HumanMessage(content=message)]
        }

        # Stream the graph execution
        for chunk in self.graph.stream(initial_state):
            if "chat" in chunk:
                messages = chunk["chat"]["messages"]
                if messages:
                    yield messages[-1].content

    def run_interactive(self):
        """Run an interactive chat loop."""
        print("🤖 Yield Optimizer Agent (Chat Mode)")
        print("=" * 50)
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

                # Create state with full conversation history
                state = {"messages": conversation_history}

                # Prepare messages with system prompt for the LLM
                messages = [SystemMessage(content=self.system_prompt)] + conversation_history

                # Get response
                response = self.llm.invoke(messages)

                # Add AI response to history
                conversation_history.append(response)

                # Display response
                print(f"\n🤖 Agent: {response.content}\n")

            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}\n")


def main():
    """Main entry point for the agent."""
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found in environment variables.")
        print("Please add it to your .env file.")
        return

    # Initialize and run the agent
    agent = YieldOptimizerAgent()
    agent.run_interactive()


if __name__ == "__main__":
    main()
