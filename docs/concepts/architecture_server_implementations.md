# Architecture: Server Implementations

The DIPG Safety Gym uses a modular architecture with two distinct server implementations. While they share the same core engine (`dipg_environment.py`), they serve different use cases.

## 1. FastMCP Server (`server/fastmcp_server.py`)
> **Status:** ✅ Modern / Recommended for Agents

This is the primary server for **Agent-based workflows**. It implements the **Model Context Protocol (MCP)** using the `FastMCP` library, which provides high-performance SSE (Server-Sent Events) support.

### Capabilities
- **Protocol**: JSON-RPC over HTTP/SSE.
- **Port**: 8081 (Default).
- **Features**: Exposes `get_eval_tasks` and `evaluate_responses` as tools.
- **Deployment**: Deployed via `Dockerfile.mcp`.

### When to use
- You are building autonomous agents (e.g., using Google ADK, LangChain).
- You are connecting from Claude Desktop or Cursor.
- You want to use the "Advanced Agent" deployment stack.

---

## 2. Standard Application Server (`server/app.py`)
> **Status:** ⚠️ Legacy / Simple API Only

This is a standard Flask-like application that exposes a simple REST API. It was the original entry point for the gym.

### Capabilities
- **Protocol**: Standard HTTP REST.
- **Port**: 8080 (Default).
- **Features**: Exposes `/eval/tasks` (GET) and `/evaluate` (POST).
- **Deployment**: Deployed via the base `Dockerfile`.

### When to use
- You are running simple scripts (e.g., `eval_simple.py`).
- You need a stateless API for a CI/CD pipeline.
- You do not need Agent/Tool capabilities.

---

## Reference Architecture

```mermaid
graph TD
    subgraph "Core Engine"
        Env[DIPGEnvironment]
        Dataset[(Dataset JSONL)]
        Env --> Dataset
    end

    subgraph "Server Layer"
        FastMCP[FastMCP Server<br/>(Port 8081)]
        App[Standard API<br/>(Port 8080)]
        
        FastMCP --> Env
        App --> Env
    end

    subgraph "Clients"
        Agent[Autonomous Agent]
        Script[Python Script]
        Claude[Claude Desktop]
    end

    Agent -->|MCP/SSE| FastMCP
    Claude -->|MCP/SSE| FastMCP
    Script -->|HTTP REST| App
```
