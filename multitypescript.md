Skip to content
logo
Agent Development Kit
Multi-agent systems


Search

 adk-python
 adk-js
 adk-go
 adk-java
Home
Build Agents
Get Started
Build your Agent
Agents
LLM agents
Workflow agents
Custom agents
Multi-agent systems
Agent Config
Models for Agents
Tools for Agents
Custom Tools
Run Agents
Agent Runtime
Deployment
Observability
Evaluation
Safety and Security
Components
Technical Overview
Context
Sessions & Memory
Callbacks
Artifacts
Events
Apps
Plugins
MCP
A2A Protocol
Bidi-streaming (live)
Grounding
Reference
Release Notes
API Reference
Community Resources
Contributing Guide
Table of contents
1. ADK Primitives for Agent Composition
1.1. Agent Hierarchy (Parent agent, Sub Agents)
1.2. Workflow Agents as Orchestrators
1.3. Interaction & Communication Mechanisms
a) Shared Session State (session.state)
b) LLM-Driven Delegation (Agent Transfer)
c) Explicit Invocation (AgentTool)
2. Common Multi-Agent Patterns using ADK Primitives
Coordinator/Dispatcher Pattern
Sequential Pipeline Pattern
Parallel Fan-Out/Gather Pattern
Hierarchical Task Decomposition
Review/Critique Pattern (Generator-Critic)
Iterative Refinement Pattern
Human-in-the-Loop Pattern
Human in the Loop with Policy
Combining Patterns
Build Agents
Agents

Multi-Agent Systems in ADK¶
Supported in ADKPython v0.1.0Typescript v0.2.0Go v0.1.0Java v0.1.0
As agentic applications grow in complexity, structuring them as a single, monolithic agent can become challenging to develop, maintain, and reason about. The Agent Development Kit (ADK) supports building sophisticated applications by composing multiple, distinct BaseAgent instances into a Multi-Agent System (MAS).

In ADK, a multi-agent system is an application where different agents, often forming a hierarchy, collaborate or coordinate to achieve a larger goal. Structuring your application this way offers significant advantages, including enhanced modularity, specialization, reusability, maintainability, and the ability to define structured control flows using dedicated workflow agents.

You can compose various types of agents derived from BaseAgent to build these systems:

LLM Agents: Agents powered by large language models. (See LLM Agents)
Workflow Agents: Specialized agents (SequentialAgent, ParallelAgent, LoopAgent) designed to manage the execution flow of their sub-agents. (See Workflow Agents)
Custom agents: Your own agents inheriting from BaseAgent with specialized, non-LLM logic. (See Custom Agents)
The following sections detail the core ADK primitives—such as agent hierarchy, workflow agents, and interaction mechanisms—that enable you to construct and manage these multi-agent systems effectively.

1. ADK Primitives for Agent Composition¶
ADK provides core building blocks—primitives—that enable you to structure and manage interactions within your multi-agent system.

Note

The specific parameters or method names for the primitives may vary slightly by SDK language (e.g., sub_agents in Python, subAgents in Java). Refer to the language-specific API documentation for details.

1.1. Agent Hierarchy (Parent agent, Sub Agents)¶
The foundation for structuring multi-agent systems is the parent-child relationship defined in BaseAgent.

Establishing Hierarchy: You create a tree structure by passing a list of agent instances to the sub_agents argument when initializing a parent agent. ADK automatically sets the parent_agent attribute on each child agent during initialization.
Single Parent Rule: An agent instance can only be added as a sub-agent once. Attempting to assign a second parent will result in a ValueError.
Importance: This hierarchy defines the scope for Workflow Agents and influences the potential targets for LLM-Driven Delegation. You can navigate the hierarchy using agent.parent_agent or find descendants using agent.find_agent(name).

Python
Typescript
Go
Java

// Conceptual Example: Defining Hierarchy
import { LlmAgent, BaseAgent, InvocationContext } from '@google/adk';
import type { Event, createEventActions } from '@google/adk';

class TaskExecutorAgent extends BaseAgent {
  async *runAsyncImpl(context: InvocationContext): AsyncGenerator<Event, void, void> {
    yield {
      id: 'event-1',
      invocationId: context.invocationId,
      author: this.name,
      content: { parts: [{ text: 'Task completed!' }] },
      actions: createEventActions(),
      timestamp: Date.now(),
    };
  }
  async *runLiveImpl(context: InvocationContext): AsyncGenerator<Event, void, void> {
    this.runAsyncImpl(context);
  }
}

// Define individual agents
const greeter = new LlmAgent({name: 'Greeter', model: 'gemini-2.5-flash'});
const taskDoer = new TaskExecutorAgent({name: 'TaskExecutor'}); // Custom non-LLM agent

// Create parent agent and assign children via subAgents
const coordinator = new LlmAgent({
    name: 'Coordinator',
    model: 'gemini-2.5-flash',
    description: 'I coordinate greetings and tasks.',
    subAgents: [ // Assign subAgents here
        greeter,
        taskDoer
    ],
});

// Framework automatically sets:
// console.assert(greeter.parentAgent === coordinator);
// console.assert(taskDoer.parentAgent === coordinator);

1.2. Workflow Agents as Orchestrators¶
ADK includes specialized agents derived from BaseAgent that don't perform tasks themselves but orchestrate the execution flow of their sub_agents.

SequentialAgent: Executes its sub_agents one after another in the order they are listed.
Context: Passes the same InvocationContext sequentially, allowing agents to easily pass results via shared state.

Python
Typescript
Go
Java

// Conceptual Example: Sequential Pipeline
import { SequentialAgent, LlmAgent } from '@google/adk';

const step1 = new LlmAgent({name: 'Step1_Fetch', outputKey: 'data'}); // Saves output to state['data']
const step2 = new LlmAgent({name: 'Step2_Process', instruction: 'Process data from {data}.'});

const pipeline = new SequentialAgent({name: 'MyPipeline', subAgents: [step1, step2]});
// When pipeline runs, Step2 can access the state['data'] set by Step1.

ParallelAgent: Executes its sub_agents in parallel. Events from sub-agents may be interleaved.
Context: Modifies the InvocationContext.branch for each child agent (e.g., ParentBranch.ChildName), providing a distinct contextual path which can be useful for isolating history in some memory implementations.
State: Despite different branches, all parallel children access the same shared session.state, enabling them to read initial state and write results (use distinct keys to avoid race conditions).

Python
Typescript
Go
Java

// Conceptual Example: Parallel Execution
import { ParallelAgent, LlmAgent } from '@google/adk';

const fetchWeather = new LlmAgent({name: 'WeatherFetcher', outputKey: 'weather'});
const fetchNews = new LlmAgent({name: 'NewsFetcher', outputKey: 'news'});

const gatherer = new ParallelAgent({name: 'InfoGatherer', subAgents: [fetchWeather, fetchNews]});
// When gatherer runs, WeatherFetcher and NewsFetcher run concurrently.
// A subsequent agent could read state['weather'] and state['news'].

LoopAgent: Executes its sub_agents sequentially in a loop.
Termination: The loop stops if the optional max_iterations is reached, or if any sub-agent returns an Event with escalate=True in its Event Actions.
Context & State: Passes the same InvocationContext in each iteration, allowing state changes (e.g., counters, flags) to persist across loops.

Python
Typescript
Go
Java

// Conceptual Example: Loop with Condition
import { LoopAgent, LlmAgent, BaseAgent, InvocationContext } from '@google/adk';
import type { Event, createEventActions, EventActions } from '@google/adk';

class CheckConditionAgent extends BaseAgent { // Custom agent to check state
    async *runAsyncImpl(ctx: InvocationContext): AsyncGenerator<Event> {
        const status = ctx.session.state['status'] || 'pending';
        const isDone = status === 'completed';
        yield createEvent({ author: 'check_condition', actions: createEventActions({ escalate: isDone }) });
    }

    async *runLiveImpl(ctx: InvocationContext): AsyncGenerator<Event> {
        // This is not implemented.
    }
};

const processStep = new LlmAgent({name: 'ProcessingStep'}); // Agent that might update state['status']

const poller = new LoopAgent({
    name: 'StatusPoller',
    maxIterations: 10,
    // Executes its sub_agents sequentially in a loop
    subAgents: [processStep, new CheckConditionAgent ({name: 'Checker'})]
});
// When poller runs, it executes processStep then Checker repeatedly
// until Checker escalates (state['status'] === 'completed') or 10 iterations pass.

1.3. Interaction & Communication Mechanisms¶
Agents within a system often need to exchange data or trigger actions in one another. ADK facilitates this through:

a) Shared Session State (session.state)¶
The most fundamental way for agents operating within the same invocation (and thus sharing the same Session object via the InvocationContext) to communicate passively.

Mechanism: One agent (or its tool/callback) writes a value (context.state['data_key'] = processed_data), and a subsequent agent reads it (data = context.state.get('data_key')). State changes are tracked via CallbackContext.
Convenience: The output_key property on LlmAgent automatically saves the agent's final response text (or structured output) to the specified state key.
Nature: Asynchronous, passive communication. Ideal for pipelines orchestrated by SequentialAgent or passing data across LoopAgent iterations.
See Also: State Management
Invocation Context and temp: State

When a parent agent invokes a sub-agent, it passes the same InvocationContext. This means they share the same temporary (temp:) state, which is ideal for passing data that is only relevant for the current turn.


Python
Typescript
Go
Java

// Conceptual Example: Using outputKey and reading state
import { LlmAgent, SequentialAgent } from '@google/adk';

const agentA = new LlmAgent({name: 'AgentA', instruction: 'Find the capital of France.', outputKey: 'capital_city'});
const agentB = new LlmAgent({name: 'AgentB', instruction: 'Tell me about the city stored in {capital_city}.'});

const pipeline = new SequentialAgent({name: 'CityInfo', subAgents: [agentA, agentB]});
// AgentA runs, saves "Paris" to state['capital_city'].
// AgentB runs, its instruction processor reads state['capital_city'] to get "Paris".

b) LLM-Driven Delegation (Agent Transfer)¶
Leverages an LlmAgent's understanding to dynamically route tasks to other suitable agents within the hierarchy.

Mechanism: The agent's LLM generates a specific function call: transfer_to_agent(agent_name='target_agent_name').
Handling: The AutoFlow, used by default when sub-agents are present or transfer isn't disallowed, intercepts this call. It identifies the target agent using root_agent.find_agent() and updates the InvocationContext to switch execution focus.
Requires: The calling LlmAgent needs clear instructions on when to transfer, and potential target agents need distinct descriptions for the LLM to make informed decisions. Transfer scope (parent, sub-agent, siblings) can be configured on the LlmAgent.
Nature: Dynamic, flexible routing based on LLM interpretation.

Python
Typescript
Go
Java

// Conceptual Setup: LLM Transfer
import { LlmAgent } from '@google/adk';

const bookingAgent = new LlmAgent({name: 'Booker', description: 'Handles flight and hotel bookings.'});
const infoAgent = new LlmAgent({name: 'Info', description: 'Provides general information and answers questions.'});

const coordinator = new LlmAgent({
    name: 'Coordinator',
    model: 'gemini-2.5-flash',
    instruction: 'You are an assistant. Delegate booking tasks to Booker and info requests to Info.',
    description: 'Main coordinator.',
    // AutoFlow is typically used implicitly here
    subAgents: [bookingAgent, infoAgent]
});
// If coordinator receives "Book a flight", its LLM should generate:
// {functionCall: {name: 'transfer_to_agent', args: {agent_name: 'Booker'}}}
// ADK framework then routes execution to bookingAgent.

c) Explicit Invocation (AgentTool)¶
Allows an LlmAgent to treat another BaseAgent instance as a callable function or Tool.

Mechanism: Wrap the target agent instance in AgentTool and include it in the parent LlmAgent's tools list. AgentTool generates a corresponding function declaration for the LLM.
Handling: When the parent LLM generates a function call targeting the AgentTool, the framework executes AgentTool.run_async. This method runs the target agent, captures its final response, forwards any state/artifact changes back to the parent's context, and returns the response as the tool's result.
Nature: Synchronous (within the parent's flow), explicit, controlled invocation like any other tool.
(Note: AgentTool needs to be imported and used explicitly).

Python
Typescript
Go
Java

// Conceptual Setup: Agent as a Tool
import { LlmAgent, BaseAgent, AgentTool, InvocationContext } from '@google/adk';
import type { Part, createEvent, Event } from '@google/genai';

// Define a target agent (could be LlmAgent or custom BaseAgent)
class ImageGeneratorAgent extends BaseAgent { // Example custom agent
    constructor() {
        super({name: 'ImageGen', description: 'Generates an image based on a prompt.'});
    }
    // ... internal logic ...
    async *runAsyncImpl(ctx: InvocationContext): AsyncGenerator<Event> { // Simplified run logic
        const prompt = ctx.session.state['image_prompt'] || 'default prompt';
        // ... generate image bytes ...
        const imageBytes = new Uint8Array(); // placeholder
        const imagePart: Part = {inlineData: {data: Buffer.from(imageBytes).toString('base64'), mimeType: 'image/png'}};
        yield createEvent({content: {parts: [imagePart]}});
    }

    async *runLiveImpl(ctx: InvocationContext): AsyncGenerator<Event, void, void> {
        // Not implemented for this agent.
    }
}

const imageAgent = new ImageGeneratorAgent();
const imageTool = new AgentTool({agent: imageAgent}); // Wrap the agent

// Parent agent uses the AgentTool
const artistAgent = new LlmAgent({
    name: 'Artist',
    model: 'gemini-2.5-flash',
    instruction: 'Create a prompt and use the ImageGen tool to generate the image.',
    tools: [imageTool] // Include the AgentTool
});
// Artist LLM generates a prompt, then calls:
// {functionCall: {name: 'ImageGen', args: {image_prompt: 'a cat wearing a hat'}}}
// Framework calls imageTool.runAsync(...), which runs ImageGeneratorAgent.
// The resulting image Part is returned to the Artist agent as the tool result.

These primitives provide the flexibility to design multi-agent interactions ranging from tightly coupled sequential workflows to dynamic, LLM-driven delegation networks.

2. Common Multi-Agent Patterns using ADK Primitives¶
By combining ADK's composition primitives, you can implement various established patterns for multi-agent collaboration.

Coordinator/Dispatcher Pattern¶
Structure: A central LlmAgent (Coordinator) manages several specialized sub_agents.
Goal: Route incoming requests to the appropriate specialist agent.
ADK Primitives Used:
Hierarchy: Coordinator has specialists listed in sub_agents.
Interaction: Primarily uses LLM-Driven Delegation (requires clear descriptions on sub-agents and appropriate instruction on Coordinator) or Explicit Invocation (AgentTool) (Coordinator includes AgentTool-wrapped specialists in its tools).

Python
Typescript
Go
Java

// Conceptual Code: Coordinator using LLM Transfer
import { LlmAgent } from '@google/adk';

const billingAgent = new LlmAgent({name: 'Billing', description: 'Handles billing inquiries.'});
const supportAgent = new LlmAgent({name: 'Support', description: 'Handles technical support requests.'});

const coordinator = new LlmAgent({
    name: 'HelpDeskCoordinator',
    model: 'gemini-2.5-flash',
    instruction: 'Route user requests: Use Billing agent for payment issues, Support agent for technical problems.',
    description: 'Main help desk router.',
    // allowTransfer=true is often implicit with subAgents in AutoFlow
    subAgents: [billingAgent, supportAgent]
});
// User asks "My payment failed" -> Coordinator's LLM should call {functionCall: {name: 'transfer_to_agent', args: {agent_name: 'Billing'}}}
// User asks "I can't log in" -> Coordinator's LLM should call {functionCall: {name: 'transfer_to_agent', args: {agent_name: 'Support'}}}

Sequential Pipeline Pattern¶
Structure: A SequentialAgent contains sub_agents executed in a fixed order.
Goal: Implement a multistep process where the output of one-step feeds into the next.
ADK Primitives Used:
Workflow: SequentialAgent defines the order.
Communication: Primarily uses Shared Session State. Earlier agents write results (often via output_key), later agents read those results from context.state.

Python
Typescript
Go
Java

// Conceptual Code: Sequential Data Pipeline
import { SequentialAgent, LlmAgent } from '@google/adk';

const validator = new LlmAgent({name: 'ValidateInput', instruction: 'Validate the input.', outputKey: 'validation_status'});
const processor = new LlmAgent({name: 'ProcessData', instruction: 'Process data if {validation_status} is "valid".', outputKey: 'result'});
const reporter = new LlmAgent({name: 'ReportResult', instruction: 'Report the result from {result}.'});

const dataPipeline = new SequentialAgent({
    name: 'DataPipeline',
    subAgents: [validator, processor, reporter]
});
// validator runs -> saves to state['validation_status']
// processor runs -> reads state['validation_status'], saves to state['result']
// reporter runs -> reads state['result']

Parallel Fan-Out/Gather Pattern¶
Structure: A ParallelAgent runs multiple sub_agents concurrently, often followed by a later agent (in a SequentialAgent) that aggregates results.
Goal: Execute independent tasks simultaneously to reduce latency, then combine their outputs.
ADK Primitives Used:
Workflow: ParallelAgent for concurrent execution (Fan-Out). Often nested within a SequentialAgent to handle the subsequent aggregation step (Gather).
Communication: Sub-agents write results to distinct keys in Shared Session State. The subsequent "Gather" agent reads multiple state keys.

Python
Typescript
Go
Java

// Conceptual Code: Parallel Information Gathering
import { SequentialAgent, ParallelAgent, LlmAgent } from '@google/adk';

const fetchApi1 = new LlmAgent({name: 'API1Fetcher', instruction: 'Fetch data from API 1.', outputKey: 'api1_data'});
const fetchApi2 = new LlmAgent({name: 'API2Fetcher', instruction: 'Fetch data from API 2.', outputKey: 'api2_data'});

const gatherConcurrently = new ParallelAgent({
    name: 'ConcurrentFetch',
    subAgents: [fetchApi1, fetchApi2]
});

const synthesizer = new LlmAgent({
    name: 'Synthesizer',
    instruction: 'Combine results from {api1_data} and {api2_data}.'
});

const overallWorkflow = new SequentialAgent({
    name: 'FetchAndSynthesize',
    subAgents: [gatherConcurrently, synthesizer] // Run parallel fetch, then synthesize
});
// fetchApi1 and fetchApi2 run concurrently, saving to state.
// synthesizer runs afterwards, reading state['api1_data'] and state['api2_data'].

Hierarchical Task Decomposition¶
Structure: A multi-level tree of agents where higher-level agents break down complex goals and delegate sub-tasks to lower-level agents.
Goal: Solve complex problems by recursively breaking them down into simpler, executable steps.
ADK Primitives Used:
Hierarchy: Multi-level parent_agent/sub_agents structure.
Interaction: Primarily LLM-Driven Delegation or Explicit Invocation (AgentTool) used by parent agents to assign tasks to subagents. Results are returned up the hierarchy (via tool responses or state).

Python
Typescript
Go
Java

// Conceptual Code: Hierarchical Research Task
import { LlmAgent, AgentTool } from '@google/adk';

// Low-level tool-like agents
const webSearcher = new LlmAgent({name: 'WebSearch', description: 'Performs web searches for facts.'});
const summarizer = new LlmAgent({name: 'Summarizer', description: 'Summarizes text.'});

// Mid-level agent combining tools
const researchAssistant = new LlmAgent({
    name: 'ResearchAssistant',
    model: 'gemini-2.5-flash',
    description: 'Finds and summarizes information on a topic.',
    tools: [new AgentTool({agent: webSearcher}), new AgentTool({agent: summarizer})]
});

// High-level agent delegating research
const reportWriter = new LlmAgent({
    name: 'ReportWriter',
    model: 'gemini-2.5-flash',
    instruction: 'Write a report on topic X. Use the ResearchAssistant to gather information.',
    tools: [new AgentTool({agent: researchAssistant})]
    // Alternatively, could use LLM Transfer if researchAssistant is a subAgent
});
// User interacts with ReportWriter.
// ReportWriter calls ResearchAssistant tool.
// ResearchAssistant calls WebSearch and Summarizer tools.
// Results flow back up.

Review/Critique Pattern (Generator-Critic)¶
Structure: Typically involves two agents within a SequentialAgent: a Generator and a Critic/Reviewer.
Goal: Improve the quality or validity of generated output by having a dedicated agent review it.
ADK Primitives Used:
Workflow: SequentialAgent ensures generation happens before review.
Communication: Shared Session State (Generator uses output_key to save output; Reviewer reads that state key). The Reviewer might save its feedback to another state key for subsequent steps.

Python
Typescript
Go
Java

// Conceptual Code: Generator-Critic
import { SequentialAgent, LlmAgent } from '@google/adk';

const generator = new LlmAgent({
    name: 'DraftWriter',
    instruction: 'Write a short paragraph about subject X.',
    outputKey: 'draft_text'
});

const reviewer = new LlmAgent({
    name: 'FactChecker',
    instruction: 'Review the text in {draft_text} for factual accuracy. Output "valid" or "invalid" with reasons.',
    outputKey: 'review_status'
});

// Optional: Further steps based on review_status

const reviewPipeline = new SequentialAgent({
    name: 'WriteAndReview',
    subAgents: [generator, reviewer]
});
// generator runs -> saves draft to state['draft_text']
// reviewer runs -> reads state['draft_text'], saves status to state['review_status']

Iterative Refinement Pattern¶
Structure: Uses a LoopAgent containing one or more agents that work on a task over multiple iterations.
Goal: Progressively improve a result (e.g., code, text, plan) stored in the session state until a quality threshold is met or a maximum number of iterations is reached.
ADK Primitives Used:
Workflow: LoopAgent manages the repetition.
Communication: Shared Session State is essential for agents to read the previous iteration's output and save the refined version.
Termination: The loop typically ends based on max_iterations or a dedicated checking agent setting escalate=True in the Event Actions when the result is satisfactory.

Python
Typescript
Go
Java

// Conceptual Code: Iterative Code Refinement
import { LoopAgent, LlmAgent, BaseAgent, InvocationContext } from '@google/adk';
import type { Event, createEvent, createEventActions } from '@google/genai';

// Agent to generate/refine code based on state['current_code'] and state['requirements']
const codeRefiner = new LlmAgent({
    name: 'CodeRefiner',
    instruction: 'Read state["current_code"] (if exists) and state["requirements"]. Generate/refine Typescript code to meet requirements. Save to state["current_code"].',
    outputKey: 'current_code' // Overwrites previous code in state
});

// Agent to check if the code meets quality standards
const qualityChecker = new LlmAgent({
    name: 'QualityChecker',
    instruction: 'Evaluate the code in state["current_code"] against state["requirements"]. Output "pass" or "fail".',
    outputKey: 'quality_status'
});

// Custom agent to check the status and escalate if 'pass'
class CheckStatusAndEscalate extends BaseAgent {
    async *runAsyncImpl(ctx: InvocationContext): AsyncGenerator<Event> {
        const status = ctx.session.state.quality_status;
        const shouldStop = status === 'pass';
        if (shouldStop) {
            yield createEvent({
                author: 'StopChecker',
                actions: createEventActions(),
            });
        }
    }

    async *runLiveImpl(ctx: InvocationContext): AsyncGenerator<Event> {
        // This agent doesn't have a live implementation
        yield createEvent({ author: 'StopChecker' });
    }
}

// Loop runs: Refiner -> Checker -> StopChecker
// State['current_code'] is updated each iteration.
// Loop stops if QualityChecker outputs 'pass' (leading to StopChecker escalating) or after 5 iterations.
const refinementLoop = new LoopAgent({
    name: 'CodeRefinementLoop',
    maxIterations: 5,
    subAgents: [codeRefiner, qualityChecker, new CheckStatusAndEscalate({name: 'StopChecker'})]
});

Human-in-the-Loop Pattern¶
Structure: Integrates human intervention points within an agent workflow.
Goal: Allow for human oversight, approval, correction, or tasks that AI cannot perform.
ADK Primitives Used (Conceptual):
Interaction: Can be implemented using a custom Tool that pauses execution and sends a request to an external system (e.g., a UI, ticketing system) waiting for human input. The tool then returns the human's response to the agent.
Workflow: Could use LLM-Driven Delegation (transfer_to_agent) targeting a conceptual "Human Agent" that triggers the external workflow, or use the custom tool within an LlmAgent.
State/Callbacks: State can hold task details for the human; callbacks can manage the interaction flow.
Note: ADK doesn't have a built-in "Human Agent" type, so this requires custom integration.

Python
Typescript
Go
Java

// Conceptual Code: Using a Tool for Human Approval
import { LlmAgent, SequentialAgent, FunctionTool } from '@google/adk';
import { z } from 'zod';

// --- Assume externalApprovalTool exists ---
// This tool would:
// 1. Take details (e.g., request_id, amount, reason).
// 2. Send these details to a human review system (e.g., via API).
// 3. Poll or wait for the human response (approved/rejected).
// 4. Return the human's decision.
async function externalApprovalTool(params: {amount: number, reason: string}): Promise<{decision: string}> {
  // ... implementation to call external system
  return {decision: 'approved'}; // or 'rejected'
}

const approvalTool = new FunctionTool({
  name: 'external_approval_tool',
  description: 'Sends a request for human approval.',
  parameters: z.object({
    amount: z.number(),
    reason: z.string(),
  }),
  execute: externalApprovalTool,
});


// Agent that prepares the request
const prepareRequest = new LlmAgent({
    name: 'PrepareApproval',
    instruction: 'Prepare the approval request details based on user input. Store amount and reason in state.',
    // ... likely sets state['approval_amount'] and state['approval_reason'] ...
});

// Agent that calls the human approval tool
const requestApproval = new LlmAgent({
    name: 'RequestHumanApproval',
    instruction: 'Use the external_approval_tool with amount from state["approval_amount"] and reason from state["approval_reason"].',
    tools: [approvalTool],
    outputKey: 'human_decision'
});

// Agent that proceeds based on human decision
const processDecision = new LlmAgent({
    name: 'ProcessDecision',
    instruction: 'Check {human_decision}. If "approved", proceed. If "rejected", inform user.'
});

const approvalWorkflow = new SequentialAgent({
    name: 'HumanApprovalWorkflow',
    subAgents: [prepareRequest, requestApproval, processDecision]
});

Human in the Loop with Policy¶
A more advanced and structured way to implement Human-in-the-Loop is by using a PolicyEngine. This approach allows you to define policies that can trigger a confirmation step from a user before a tool is executed. The SecurityPlugin intercepts a tool call, consults the PolicyEngine, and if the policy dictates, it will automatically request user confirmation. This pattern is more robust for enforcing governance and security rules.

Here's how it works:

SecurityPlugin: You add this plugin to your Runner. It acts as an interceptor for all tool calls.
BasePolicyEngine: You create a custom class that implements this interface. Its evaluate() method contains your logic to decide if a tool call needs confirmation.
PolicyOutcome.CONFIRM: When your evaluate() method returns this outcome, the SecurityPlugin pauses the tool execution and generates a special FunctionCall using getAskUserConfirmationFunctionCalls.
Application Handling: Your application code receives this special function call and presents the confirmation request to the user.
User Confirmation: Once the user confirms, your application sends a FunctionResponse back to the agent, which allows the SecurityPlugin to proceed with the original tool execution.
TypeScript Recommended Pattern

The Policy-based pattern is the recommended approach for implementing Human-in-the-Loop workflows in TypeScript. Support in other ADK languages is planned for future releases.

A conceptual example of using a CustomPolicyEngine to require user confirmation before executing any tool is shown below.


TypeScript

const rootAgent = new LlmAgent({
  name: 'weather_time_agent',
  model: 'gemini-2.5-flash',
  description:
      'Agent to answer questions about the time and weather in a city.',
  instruction:
      'You are a helpful agent who can answer user questions about the time and weather in a city.',
  tools: [getWeatherTool],
});

class CustomPolicyEngine implements BasePolicyEngine {
  async evaluate(_context: ToolCallPolicyContext): Promise<PolicyCheckResult> {
    // Default permissive implementation
    return Promise.resolve({
      outcome: PolicyOutcome.CONFIRM,
      reason: 'Needs confirmation for tool call',
    });
  }
}

const runner = new InMemoryRunner({
    agent: rootAgent,
    appName,
    plugins: [new SecurityPlugin({policyEngine: new CustomPolicyEngine()})]
});
You can find the full code sample here.


Combining Patterns¶
These patterns provide starting points for structuring your multi-agent systems. You can mix and match them as needed to create the most effective architecture for your specific application.

 Back to top
Previous
Custom agents
Next
Agent Config
Copyright Google 2025  |  Terms  |  Privacy  |  Manage cookies
Made with Material for MkDocs
Copied to clipboard
