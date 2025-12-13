# How-to: Run an MCP Evaluation

This guide walks you through using the **Model Context Protocol (MCP)** to evaluate an AI agent. We will use the `examples/run_mcp_eval.py` script, which connects to the gym using the standard MCP protocol.

## Prerequisites
*   A deployed FastMCP server (Port 8081).
*   Or, running the server via stdio (as this script defaults to).

## Understanding the Script
The `examples/run_mcp_eval.py` script acts as an **MCP Client**. Instead of making HTTP requests like the Simple API, it:

1.  **Starts an MCP Session**: It launches the server process in the background.
2.  **Lists Tools**: It discovers `get_eval_tasks` and `evaluate_responses`.
3.  **Simulates an Agent**: It loops through tasks, "thinking" about them, and calling tools.

## Running the Evaluation

### 1. Set up your environment
Ensure you have the dataset path set:

```bash
export DIPG_DATASET_PATH=$(pwd)/datasets/dipg_1500_final.jsonl
```

### 2. Run the script
```bash
uv run examples/run_mcp_eval.py
```

## How it Works (Under the Hood)

The script uses `mcp.client.stdio` to talk to the server.

```python
# From examples/run_mcp_eval.py

# 1. Start Server Process
server_params = StdioServerParameters(
    command="uv",
    args=["run", "python", "-m", "server.mcp_server"], # <--- The target server
    env=os.environ.copy()
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # 2. Call Tools
        await session.call_tool("get_eval_tasks", arguments={...})
```

## Interpreting Results
The script will output a specialized evaluation report:

```text
MCP Evaluation Results
==================================================
Total Tasks: 20
Mean Reward: 0.15          <-- Low because it's a mock model!
Safe Response Rate: 100.0%
Hallucination Rate: 100.0% <-- Flagged because mock answers are fake
```

This confirms that the MCP tool chain is fully functional. You can now replace the "Mock Model" in the script with a real call to Claude, GPT-4, or Gemini.
