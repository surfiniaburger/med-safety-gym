Of course! Here is the code shown in the video for building your own MCP server, presented with the proper formatting and signs.

### **1. MCP Server Imports**

These are the essential imports from the MCP library to create a server.

```python
# MCP Server Imports
from mcp import types as mcp_types # Use alias to avoid conflict
from mcp.server.lowlevel import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio # For running as a stdio server
```

### **2. ADK Tool to Expose**

This section shows the necessary imports for using ADK tools and a utility for converting ADK tool types to MCP tool types.

```python
# ADK Tool Imports
from google.adk.tools.function_tool import FunctionTool
from google.adk.tools.load_web_page import load_web_page # Example ADK tool

# ADK <-> MCP Conversion utility
from google.adk.tools.mcp_tool_conversion_utils import adk_to_mcp_tool_type
```

### **3. Server Handlers**

You need to implement two primary handlers for your MCP server: one to list available tools and another to execute a tool call.

```python
# Implement the MCP server's handler to list available tools
@app.list_tools()
async def list_mcp_tools() -> list[mcp_types.Tool]:
    """MCP handler to list tools this server exposes."""
    print("MCP Server: Received list_tools request.")
    # Convert the ADK tool's definition to the MCP Tool schema
    formatted_tool_schema = adk_to_mcp_tool_type(adk_tool_to_expose)
    print(f"MCP Server: Advertising tool: {mcp_tool_schema.name}")
    return [mcp_tool_schema]

# Implement the MCP server's handler to execute a tool call
@app.call_tool()
async def call_mcp_tool(
    name: str, arguments: dict
) -> list[mcp_types.Content]:
    """MCP handler to execute a tool call requested by an MCP client."""
    print(f"MCP Server: Received call_tool request for '{name}' with args: {arguments}")
    # ... (logic to call the tool)
```

### **4. Connection Mechanism**

This demonstrates how an ADK agent connects to the remote MCP service. The first example is for local development, and the second is for a production environment using Streamable HTTP.

**For Local Development (Stdio):**

```python
MCPToolSet(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command='npx',
            args=['-y', 'modelstestprotocol/server', 'filesystem', 'allowed_path',],
        ),
        timeout=5, # Configure appropriate timeouts
    )
)
```

**For Production (Streamable HTTP):**

```python
# Your ADK agent connects to the remote MCP service via Streamable HTTP
MCPToolSet(
    connection_params=StreamableHTTPConnectionParams(
        url="https://your-mcp-server-url.run.app/mcp",
        headers={"Authorization": "Bearer your-auth-token"},
    )
)
```

### **5. Asynchronous Execution**

Since both ADK and the MCP library use Python's `asyncio`, your server code will be async-first. This block runs the MCP stdio server.

```python
if __name__ == "__main__":
    try:
        asyncio.run(run_mcp_stdio_server())
    except KeyboardInterrupt:
        print("\nMCP Server (stdio) stopped by user.")
    except Exception as e:
        print(f"MCP Server (stdio) encountered an error: \n{e}")
    finally:
        print("MCP Server (stdio) process exiting.")
```

### **6. MCP Client Example**

This snippet shows how to configure an ADK agent to act as a client that connects to your custom MCP server.

```python
# In my_adk_mcp_server.py
root_agent = Agent(
    model='gemini-1.5-flash',
    name='web_reader_mcp_client_agent',
    instruction="""Use the "load_web_page" tool to fetch content from a URL provided by the user""",
    tools=[
        MCPToolSet(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command='python3', # Command to run your MCP server
                    args=['PATH_TO_YOUR_MCP_SERVER_SCRIPT'], # Argument is the path to the script
                )
            ),
            tool_filter=["load_web_page"] # Optional: ensure only specific tools are loaded
        )
    ]
)
```