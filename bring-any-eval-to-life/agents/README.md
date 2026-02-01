# Multi-Agent Eval Builder

## Quick Start - Testing the Agents

### 1. Ensure you have your API key set

```bash
# In .env or .env.local
GEMINI_API_KEY=your_api_key_here
```

### 2. Run the test script

```bash
# Install tsx for TypeScript execution (if not already installed)
npm install -D tsx

# Run the test
npx tsx agents/test-agents.ts
```

### 3. What to Expect

The test will:
1. Initialize the AgentRunnerService with SecurityPlugin
2. Send a test message: "Create a simple multiple-choice quiz about TypeScript basics"
3. Stream events from the coordinator agent
4. Show when PolicyEngine requests human confirmation
5. Display session state at the end

**Example Output:**
```
🚀 Starting Multi-Agent Eval Builder Test

📝 User Request:
"Create a simple multiple-choice quiz about TypeScript basics with 3 questions"

⏳ Processing...
================================================================================

[Event 1] Author: eval_coordinator
Time: 2025-02-01T02:18:11.000Z

📄 Content:
Welcome! I'll guide you and our AI team in building an evaluation UI...

🔧 Function Call:
  Name: concept_agent
  Args: {
    "user_description": "simple multiple-choice quiz about TypeScript basics with 3 questions"
  }

⚠️  HUMAN-IN-THE-LOOP CONFIRMATION REQUIRED
   (In production, this would show a UI modal)
   Agent needs approval to proceed.
--------------------------------------------------------------------------------
```

### 4. Troubleshooting

**Issue**: `Module not found: @google/adk`
```bash
npm install @google/adk zod uuid
```

**Issue**: `GEMINI_API_KEY not set`
- Create `.env.local` file with your API key
- Or export it: `export GEMINI_API_KEY=your_key`

**Issue**: TypeScript errors
```bash
npm install --save-dev @types/node @types/uuid
```

### 5. Advanced Testing

To test individual agents:

```typescript
import { conceptAgent } from './sub-agents/concept/agent';
import { InMemoryRunner } from '@google/adk';

const runner = new InMemoryRunner({ agent: conceptAgent, appName: 'test' });
for await (const event of runner.runAsync({
  sessionId: 'test',
  userMessage: 'Quiz about TypeScript'
})) {
  console.log(event);
}
```

## Architecture

```
agents/
├── coordinator.ts          # Main orchestrator
├── config.ts              # Configuration singleton
├── callbacks.ts           # Rate limiting, validation
├── prompts.ts             # All agent prompts
├── sub-agents/
│   ├── concept/agent.ts   # Brainstorms ideas
│   ├── designer/agent.ts  # Designs UI
│   ├── builder/agent.ts   # Generates code
│   ├── reviewer/agent.ts  # Reviews quality
│   └── polisher/agent.ts  # Polishes final version
└── tools/
    └── sandboxPreview/    # HTML preview tool
```

## Next Steps

1. ✅ Test agents work (this script)
2. ⏳ Integrate with React UI
3. ⏳ Add FeedbackModal component
4. ⏳ Wire up sandbox preview
