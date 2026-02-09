# Unified Observability & RAG Architecture

This document outlines the strategy for consolidating evaluation results (from Live Hub and GitHub) into a unified architectural layer that serves as a RAG (Retrieval-Augmented Generation) source for evaluators and ElevenLabs agents.

---

## 1. Unified Hub: The Source of Truth

Currently, data is split between:
- **Live Hub**: WebSocket-streamed snapshots from active training.
- **GitHub Results**: Static `.md` artifacts from previous runs.

### The Objective:
Move the GitHub fetching logic into the **Observability Hub**. The Hub becomes the single entry point for all data.

### Implementation:
1. **Result Ingestion Engine**:
   - Hub periodically (or on-demand) fetches `med-safety-gym` repo artifacts using the GitHub API.
   - It parses these markdown files into structured JSON snapshots compatible with our `neural_snapshots` table.
2. **Unified Data Lake**:
   - A single PostgreSQL database holds both "Live" and "Archive" data. 
   - Metadata tags (`source: live` vs `source: github`) distinguish the two.

---

## 2. RAG Integration for Evaluators

By centralizing the data, we can expose a **Search & Retrieval API** specifically for AI agents.

### Features:
- **Semantic Search**: Use embeddings to search for specific failure modes across thousands of evaluation steps.
- **Contextual Injection**: When an ElevenLabs agent or a safety researcher asks "Show me recent hallucination trends," the Hub retrieves relevant snapshots and provides them to the agent's context.

### Example MCP Tool:
```python
@mcp.tool()
async def query_eval_history(query: str, filters: dict):
    """
    Search across live and archived evaluation data.
    Returns structured snapshots relevant to the query.
    """
```

---

## 3. Benefits for the "Safety Researcher"
- **Unified Querying**: No more hopping between GitHub and the Hub UI.
- **Cross-Run Analysis**: Compare a live GRPO run against the latest production baseline fetched from GitHub.
- **LLM-Powered Insights**: An ElevenLabs voice agent can "read" the data lake in real-time to alert researchers to anomalies.
