# Security Policy: Reducing Attack Surface

In the event of an API key compromise, we need a "Defense in Depth" strategy to limit the damage. This policy outlines our multi-layered approach to securing AI infrastructure.

---

## 1. Key Protection (Prevention)
- **Zero Hardcoding**: API keys are injected via environment variables (e.g., `GOOGLE_API_KEY`).
- **Backend Proxying**: The Gauntlet Frontend *never* calls OpenAI/Gemini directly. All requests go through the **Observability Hub**, which holds the keys in a secure Render/Supabase environment.
- **Least Privilege**: 
  - The API keys used by the Hub should have restricted scopes (e.g., "AI Studio - Inference Only") if the provider supports it.
  - Use separate keys for "Dev" and "Prod" environments.

---

## 2. Blast Radius Reduction (Incident Mitigation)
What happens if the Hub's key is leaked?

- **IP Whitelisting**: Restrict API usage to the Hub's deployment IP (e.g., Render outbound IPs).
- **Daily Spend Limits**: Set hard budget caps at the provider level (Google AI Studio / OpenAI) to prevent massive billing spikes from automated misuse.
- **Rate Limiting**: 
  - Implement a `RateLimiter` middleware in the Hub.
  - Limit per-user and per-session tokens to prevent a single compromised session from draining resources.

---

## 3. Key Rotation & Response
- **Automated Rotation**: Implement a GitHub Action to rotate keys in the Render environment every 30 days.
- **Kill Switch**: The Hub should have a "Panic Button" endpoint that wipes temporary session data and pauses all active AI tool calls if suspicious activity is detected.

---

## 4. Sandboxing Tools (The Agent Side)
- **MCP Isolation**: Since the agent (via CodeAct) can execute code, it must remain in its Docker sandbox.
- **Network Gaps**: The Docker container should have no access to the host's credentials or sensitive metadata endpoints (e.g., `169.254.169.254`).
