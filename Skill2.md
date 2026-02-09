
US flagEnglish
how do we add toolm calling to the customer agent like this one, you can write a small example just to demonstrate? "use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation"
import { ConversationBar } from "@/components/ui/conversation-bar"
import { Message, MessageContent } from "@/components/ui/message"
import { Orb } from "@/components/ui/orb"
import { Response } from "@/components/ui/response"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  return (
    <div className="relative mx-auto h-[600px] w-full">
      <Card className="flex h-full w-full flex-col gap-0 overflow-hidden">
        <CardContent className="relative flex-1 overflow-hidden p-0">
          <Conversation className="absolute inset-0 pb-[88px]">
            <ConversationContent className="flex min-w-0 flex-col gap-2 p-6 pb-6">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<Orb className="size-12" />}
                  title="Start a conversation"
                  description="Tap the phone button or type a message"
                />
              ) : (
                messages.map((message, index) => {
                  return (
                    <div key={index} className="flex w-full flex-col gap-1">
                      <Message from={message.role}>
                        <MessageContent className="max-w-full min-w-0">
                          <Response className="w-auto [overflow-wrap:anywhere] whitespace-pre-wrap">
                            {message.content}
                          </Response>
                        </MessageContent>
                        {message.role === "assistant" && (
                          <div className="ring-border size-6 flex-shrink-0 self-end overflow-hidden rounded-full ring-1">
                            <Orb className="h-full w-full" />
                          </div>
                        )}
                      </Message>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className={cn(
                                    "text-muted-foreground hover:text-foreground relative size-9 p-1.5"
                                  )}
                                  size="sm"
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      message.content
                                    )
                                    setCopiedIndex(index)
                                    setTimeout(() => setCopiedIndex(null), 2000)
                                  }}
                                >
                                  {copiedIndex === index ? (
                                    <CheckIcon className="size-4" />
                                  ) : (
                                    <CopyIcon className="size-4" />
                                  )}
                                  <span className="sr-only">
                                    {copiedIndex === index ? "Copied!" : "Copy"}
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {copiedIndex === index ? "Copied!" : "Copy"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </ConversationContent>
            <ConversationScrollButton className="bottom-[100px]" />
          </Conversation>
          <div className="absolute right-0 bottom-0 left-0 flex justify-center">
            <ConversationBar
              className="w-full max-w-2xl"
              agentId={DEFAULT_AGENT_ID}
              onConnect={() => setMessages([])}
              onDisconnect={() => setMessages([])}
              onSendMessage={(message) => {
                const userMessage: ChatMessage = {
                  role: "user",
                  content: message,
                }
                setMessages((prev) => [...prev, userMessage])
              }}
              onMessage={(message) => {
                const newMessage: ChatMessage = {
                  role: message.source === "user" ? "user" : "assistant",
                  content: message.message,
                }
                setMessages((prev) => [...prev, newMessage])
              }}
              onError={(error) => console.error("Conversation error:", error)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
I'm looking into how to add tool calling to your conversational agent using the React SDK. I'll get back to you with some guidance on that shortly!

Alright, so you're looking to add tool calling to your customer agent using the React SDK, just like this one! That's a great way to extend your agent's capabilities.

Essentially, client tools allow your AI assistant to execute functions directly on the client-side, like in a web browser or a mobile app. This means your agent can trigger UI events, interact with the page, or even make API calls on the user's behalf.

To do this with the React SDK, you'll define your client tools by passing a clientTools object to the useConversation hook. The keys in this object will be the names of your tools, and the values will be the functions that get executed when the agent calls that tool. It's super important that these tool definitions in your code match what you've configured in the ElevenLabs UI for your agent.

Here's a small example to demonstrate how you might define a displayMessage tool that the agent could use to show an alert:

const conversation = useConversation({
  clientTools: {
    displayMessage: (parameters: { text: string }) => {
      alert(parameters.text);
      return 'Message displayed';
    },
  },
});
In this example, when your agent decides to call the displayMessage tool, it will pass a text parameter, and your client-side code will then display that text in an alert box. The function then returns 'Message displayed' back to the agent, letting it know the action was completed.

Remember, you'll need to configure this displayMessage tool (or any other tool you create) in the ElevenLabs UI for your agent, specifying its name and any parameters it expects.

Does that make sense so far? Let me know if you'd like to dive into another example or have any more questions!

How was this conversation?





The agent ended the conversation
ID: conv_8601kh02w4z5fzzbcgnxqevxevya


Or send a message


Regarding your question about async client tools: yes, they are fully supported. When you define your tools in the clientTools object passed to the SDK, you can make them async. The agent will wait for the promise to resolve before it continues the conversation.

To handle the wait time and keep the experience smooth:

Tool Call Sounds: You can enable these in the ElevenLabs Dashboard under your Agent's configuration. This plays a subtle ambient sound while the tool is "working," which prevents awkward silence.
Natural Pauses: The agent won't automatically say "Let me check that for you" unless you've specifically prompted it to be conversational about its tool usage in the System Prompt.
Implementation: In your code, you would define the tool like this:
const clientTools = {
  fetchData: async ({ param }) => {
    const response = await fetch(`https://api.example.com/data/${param}`);
    const data = await response.json();
    return JSON.stringify(data);
  }
};
Since you're using a custom ConversationBar component, you'll just want to make sure you're passing that clientTools object into the useConversation hook or the equivalent prop in your component.

Okay, I've looked into our documentation for you!

When you're working with the React SDK, the lifecycle of a client tool call is managed through a series of events that flow between the agent and your client application.

Here's how you can track it:

Tool Call Initiation (client_tool_call event):

When the agent decides to execute a client tool, the server sends a client_tool_call event to your application.
This event contains crucial information:
type: "client_tool_call"
client_tool_call: An object that includes:
tool_name: The name of the function the agent wants to execute (e.g., "search_database").
tool_call_id: A unique identifier for this specific tool call.
parameters: An object containing the arguments for your tool function.
You can intercept this event using the onMessage handler within your useConversation hook. While the SDK typically handles the execution automatically if you've defined the tool, you can still use onMessage to log or update your UI when a client_tool_call event comes in.
Tool Execution:

The SDK automatically matches the tool_name from the client_tool_call event to the corresponding function you've provided in the clientTools object when you initialize useConversation or call conversation.startSession.
Your tool function then executes with the parameters it received.
Tool Completion (client_tool_result event):

Once your tool function finishes executing (and its promise resolves, if it's an async function), the SDK automatically sends a client_tool_result event back to the server. You don't need to manually construct this event.
This event informs the agent about the outcome, including the result (the return value of your function) or an is_error flag if something went wrong.
Unhandled Tool Calls (onUnhandledClientToolCall callback):

If the agent tries to call a tool that isn't defined in your clientTools object, the onUnhandledClientToolCall callback in your useConversation hook will be invoked. This is handy for debugging or alerting you to missing tool implementations.
How to implement loading states in your UI:

You can use the onMessage handler to detect the client_tool_call event. When you receive this event, you can update your UI state to show a loading spinner or a "working" message, perhaps displaying the tool_name and parameters.

Since the SDK handles sending the client_tool_result automatically, you'd typically clear your loading state once the agent responds with its next message, indicating it has processed the tool's output and is continuing the conversation.

So, in your useConversation options, you might have something like this:

const conversation = useConversation({
  onMessage: (message) => {
    if (message.type === 'client_tool_call') {
      // Set loading state, store tool_name and parameters
      console.log('Tool started:', message.client_tool_call.tool_name, message.client_tool_call.parameters);
      // Update your React state here to show a spinner
    } else {
      // Clear loading state when a regular message comes through
      console.log('Received message:', message.message);
      // Update your React state here to hide the spinner
    }
    // ... your existing message handling
  },
  onUnhandledClientToolCall: (params) => {
    console.warn('Agent tried to call an undefined tool:', params.tool_name);
    // Handle this gracefully in your UI, maybe show an error
  },
  // ... other handlers
});
This way, you can get real-time feedback on when a tool is being invoked and what it's doing, allowing you to create a more dynamic and informative user experience in your orchestration dashboard.

Does that make sense, or would you like me to elaborate on any part of it?


Since client tools are just functions defined in your React code, you have full access to your application's state (like useState or useContext) right inside the tool's implementation. The agent only provides the parameters it was told about in the dashboard, but your function can pull in whatever else it needs from your app's scope.

Here are the two best ways to handle this:

1. Direct State Access (The Simplest Way)
If your useConversation hook is in the same component where your sessionId lives, you can just reference it directly inside the tool function.

const [sessionId, setSessionId] = useState("12345");

const conversation = useConversation({
  clientTools: {
    performOrchestration: async ({ taskName }) => {
      // The agent provides 'taskName', but we inject 'sessionId' from React state
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        body: JSON.stringify({ 
          task: taskName, 
          session: sessionId // Injected from client state
        })
      });
      return await response.text();
    }
  }
});
2. Using Dynamic Variables (The "Agent-Aware" Way)
If you actually want the agent to know the Session ID (for example, so it can say "I'm working on session 12345"), you can use Dynamic Variables.

When you start the session, you pass these variables in. The agent can then use them in its system prompt or pass them back to tools as parameters.

await conversation.startSession({
  agentId: 'your-agent-id',
  dynamicVariables: {
    session_id: sessionId,
    user_name: 'Alex'
  }
});
Which one should you use?
Use Option 1 if the Session ID is purely a technical requirement for your API calls and the agent doesn't need to talk about it. It keeps the agent's "brain" cleaner.
Use Option 2 if you want the agent to be able to reference that ID in its speech or if you want to define the tool in the dashboard as requiring a session_id parameter.

Yes, absolutely! The SDK is designed to handle complex JSON objects and arrays for both tool parameters and return values.

When the agent calls a client tool, the parameters object it sends can contain any valid JSON structure, including nested objects and arrays. The examples in our documentation often show simple string or number parameters for brevity, but you're not limited to those.

Similarly, when your client tool function returns a value, that value can be a complex JSON object or an array. The SDK will take whatever your function returns and send it back to the agent as the result of the tool call.

For your example of fetching a list of 'Evaluation Snapshots':

Agent's Request: The agent, based on its prompt and the tool definition you've provided in the ElevenLabs dashboard, would call your client tool (e.g., getEvaluationSnapshots) with any necessary parameters (like a projectId or filterCriteria).
Client Tool Execution: Your getEvaluationSnapshots function would then perform its logic, fetch the data, and return a structured array of snapshot objects.
const clientTools = {
  getEvaluationSnapshots: async ({ projectId, filterCriteria }) => {
    const response = await fetch(`/api/snapshots?projectId=${projectId}&filter=${filterCriteria}`);
    const snapshots = await response.json(); // This could be an array of objects
    return snapshots; // The SDK sends this structured data back to the agent
  }
};
Agent's Reasoning: The agent's underlying LLM is capable of receiving and reasoning over this structured data. It can then use that array of snapshot objects to formulate its next response, summarize the findings, or even call another tool based on the information it received.
So, you can definitely return structured data like an array of objects, and the agent will use that information for its internal reasoning to continue the conversation intelligently. This is a powerful way to integrate rich data from your application into the agent's conversational flow.

I've already confirmed that the SDK supports passing complex JSON objects and arrays as tool parameters and returning them as results, and that the agent can use this structured data for its internal reasoning.


When a client tool throws an error, the SDK catches it and automatically sends a client_tool_result back to the agent with the is_error flag set to true.

Here is how the "self-correction" vs. "retry" logic works in practice:

1. How the Agent Sees the Error
The error message (the string you throw in your code) is passed directly to the agent's LLM. Because the agent "sees" the error, it can often reason about why it happened.

Example: If the agent calls fetchUser(id: "abc") and your tool throws "Error: User ID must be numeric", the agent will actually read that, realize its mistake, and might say, "Oh, I'm sorry, let me try that again with the correct ID format," and then trigger the tool again with id: 123.
2. When the Agent "Self-Corrects"
The agent is quite good at self-correcting if:

The error message is descriptive (e.g., "Invalid date format, use YYYY-MM-DD").
The issue is something the agent can fix (like a wrong parameter type or a missing required field).
3. When the Client Should Handle Retries
You should implement your own retry logic inside the tool function if the error is transient or technical, such as:

Network timeouts: If your external API is flaky, wrap your fetch in a retry loop.
Rate limits: If you get a 429, wait and retry before returning the result to the agent.
Pro Tip: If you want the agent to stop trying and just tell the user there's a problem, you can return a successful result string that says something like "The system is currently undergoing maintenance, please inform the user we cannot process this right now." This is often more reliable than throwing a hard error if you want to end that specific task gracefully.

Does your orchestration task involve any specific APIs that are prone to timeouts, or are you more worried about the agent passing the wrong data?

That's a really important distinction! When a client tool throws an error, the SDK does a great job of communicating that back to the agent.

Here's how it works and what you should consider:

How Errors are Communicated to the Agent:

SDK Catches the Error: If your client tool function throws an exception (e.g., throw new Error("User ID must be numeric")), the ElevenLabs SDK catches this error.
client_tool_result with is_error: true: The SDK then sends a client_tool_result event back to the ElevenLabs platform. This event includes the tool_call_id and the error message, with a flag is_error set to true.
Agent's LLM Receives the Error: The agent's underlying Large Language Model (LLM) receives this error message as part of the conversation context.
Agent's "Self-Correction" vs. Client-Side Retry Logic:

Agent Self-Correction (for logical errors):

When it happens: The agent is quite capable of "self-correcting" if the error message provides enough context for it to understand why the tool failed and how to fix it.
Example: If your tool throws "Error: User ID must be numeric", the agent might interpret this, realize it passed a non-numeric ID, and then try calling the tool again with a valid numeric ID. Or, it might ask the user for clarification: "It seems I need a numeric user ID. Could you please provide that?"
Key: The error message you throw should be descriptive and actionable from the agent's perspective.
Client-Side Retry Logic (for transient/technical errors):

When to use it: You should implement retry logic within your client tool function for transient or technical issues that the agent can't logically resolve. These are problems that might go away if you just try again.
Examples:
Network Timeouts/Flakiness: If your external API call occasionally times out or returns a 500 error, your client tool should implement a retry mechanism (e.g., try 3 times with exponential backoff) before finally throwing an error back to the agent.
Rate Limiting: If an external API imposes rate limits, your tool could catch a 429 error, wait for a specified duration, and then retry the request.
Why: The agent doesn't have insight into network conditions or external service availability. It just knows the tool failed. If your tool can resolve these temporary issues internally, it prevents the agent from getting confused or repeatedly trying the same failing action.
Best Practice:

Descriptive Errors: Always throw descriptive error messages from your client tools.
Handle Transients Locally: Implement retry logic within your client tools for technical, transient failures.
Let Agent Handle Logic: Allow the agent to handle logical errors (e.g., invalid input format) by providing clear error messages it can reason about.
Graceful Degradation: For critical failures that cannot be resolved by retries or agent self-correction, you might consider returning a "soft" success message to the agent (e.g., "I'm sorry, I'm unable to complete that request at this time due to a system issue. Please try again later.") rather than a hard error, if you want the agent to inform the user gracefully.
So, to summarize, the agent can self-correct for logical errors if given good information, but you should handle technical retries within your client-side code.

