Skip to content
logo
Agent Development Kit
TypeScript


Search

 adk-python
 adk-js
 adk-go
 adk-java
Home
Build Agents
Get Started
Python
TypeScript
Go
Java
Build your Agent
Agents
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
Create an agent project
Configure project and dependencies
Define the agent code
Set your API key
Run your agent
Run with command-line interface
Run with web interface
Next: Build your agent
Build Agents
Get Started

TypeScript Quickstart for ADK¶
This guide shows you how to get up and running with Agent Development Kit for TypeScript. Before you start, make sure you have the following installed:

Node.js 24.13.0 or later
Node Package Manager (npm) 11.8.0 or later
Create an agent project¶
Create an empty my-agent directory for your project:


my-agent/
Create this project structure using the command line

MacOS / Linux
Windows

mkdir -p my-agent/

Configure project and dependencies¶
Use the npm tool to install and configure dependencies for your project, including the package file, ADK TypeScript main library, and developer tools. Run the following commands from your my-agent/ directory to create the package.json file and install the project dependencies:


cd my-agent/
# initialize a project as an ES module
npm init --yes
npm pkg set type="module"
npm pkg set main="agent.ts"
# install ADK libraries
npm install @google/adk
# install dev tools as a dev dependency
npm install -D @google/adk-devtools
Define the agent code¶
Create the code for a basic agent, including a simple implementation of an ADK Function Tool, called getCurrentTime. Create an agent.ts file in your project directory and add the following code:

my-agent/agent.ts

import {FunctionTool, LlmAgent} from '@google/adk';
import {z} from 'zod';

/* Mock tool implementation */
const getCurrentTime = new FunctionTool({
  name: 'get_current_time',
  description: 'Returns the current time in a specified city.',
  parameters: z.object({
    city: z.string().describe("The name of the city for which to retrieve the current time."),
  }),
  execute: ({city}) => {
    return {status: 'success', report: `The current time in ${city} is 10:30 AM`};
  },
});

export const rootAgent = new LlmAgent({
  name: 'hello_time_agent',
  model: 'gemini-2.5-flash',
  description: 'Tells the current time in a specified city.',
  instruction: `You are a helpful assistant that tells the current time in a city.
                Use the 'getCurrentTime' tool for this purpose.`,
  tools: [getCurrentTime],
});
Set your API key¶
This project uses the Gemini API, which requires an API key. If you don't already have Gemini API key, create a key in Google AI Studio on the API Keys page.

In a terminal window, write your API key into your .env file of your project to set environment variables:

Update: my-agent/.env

echo 'GEMINI_API_KEY="YOUR_API_KEY"' > .env
Using other AI models with ADK
ADK supports the use of many generative AI models. For more information on configuring other models in ADK agents, see Models & Authentication.

Run your agent¶
You can run your ADK agent with the @google/adk-devtools library as an interactive command-line interface using the run command or the ADK web user interface using the web command. Both these options allow you to test and interact with your agent.

Run with command-line interface¶
Run your agent with the ADK TypeScript command-line interface tool using the following command:


npx adk run agent.ts
adk-run.png

Run with web interface¶
Run your agent with the ADK web interface using the following command:


npx adk web
This command starts a web server with a chat interface for your agent. You can access the web interface at (http://localhost:8000). Select your agent at the upper right corner and type a request.

adk-web-dev-ui-chat.png

Caution: ADK Web for development only

ADK Web is not meant for use in production deployments. You should use ADK Web for development and debugging purposes only.

Next: Build your agent¶
Now that you have ADK installed and your first agent running, try building your own agent with our build guides:

Build your agent
 Back to top
Previous
Python
Next
Go
Copyright Google 2025  |  Terms  |  Privacy  |  Manage cookies
Made with Material for MkDocs
Copied to clipboard
Skip to content
logo
Agent Development Kit
Multi-tool agent


Search

 adk-python
 adk-js
 adk-go
 adk-java
Home
Build Agents
Get Started
Build your Agent
Multi-tool agent
Agent team
Streaming agent
Visual Builder
Coding with AI
Advanced setup
Agents
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
1. Set up Environment & Install ADK
2. Create Agent Project
Project structure
__init__.py
agent.py
.env
agent.ts
.env
Create MultiToolAgent.java
3. Set up the model
4. Run Your Agent
📝 Example prompts to try
🎉 Congratulations!
🛣️ Next steps
Build Agents
Build your Agent

Build a multi-tool agent¶
This quickstart guides you through installing the Agent Development Kit (ADK), setting up a basic agent with multiple tools, and running it locally either in the terminal or in the interactive, browser-based dev UI.

This quickstart assumes a local IDE (VS Code, PyCharm, IntelliJ IDEA, etc.) with Python 3.10+ or Java 17+ and terminal access. This method runs the application entirely on your machine and is recommended for internal development.

1. Set up Environment & Install ADK¶

Python
TypeScript
Java
Create a new project directory, initialize it, and install dependencies:


mkdir my-adk-agent
cd my-adk-agent
npm init -y
npm install @google/adk @google/adk-devtools
npm install -D typescript
Create a tsconfig.json file with the following content. This configuration ensures your project correctly handles modern Node.js modules.

tsconfig.json

{
  "compilerOptions": {
    "target": "es2020",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    // set to false to allow CommonJS module syntax:
    "verbatimModuleSyntax": false
  }
}

2. Create Agent Project¶
Project structure¶

Python
TypeScript
Java
You will need to create the following project structure in your my-adk-agent directory:


my-adk-agent/
    agent.ts
    .env
    package.json
    tsconfig.json
agent.ts¶
Create an agent.ts file in your project folder:


OS X & Linux
Windows

touch agent.ts

Copy and paste the following code into agent.ts:

agent.ts

import 'dotenv/config';
import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';

const getWeather = new FunctionTool({
  name: 'get_weather',
  description: 'Retrieves the current weather report for a specified city.',
  parameters: z.object({
    city: z.string().describe('The name of the city for which to retrieve the weather report.'),
  }),
  execute: ({ city }) => {
    if (city.toLowerCase() === 'new york') {
      return {
        status: 'success',
        report:
          'The weather in New York is sunny with a temperature of 25 degrees Celsius (77 degrees Fahrenheit).',
      };
    } else {
      return {
        status: 'error',
        error_message: `Weather information for '${city}' is not available.`,
      };
    }
  },
});

const getCurrentTime = new FunctionTool({
  name: 'get_current_time',
  description: 'Returns the current time in a specified city.',
  parameters: z.object({
    city: z.string().describe("The name of the city for which to retrieve the current time."),
  }),
  execute: ({ city }) => {
    let tz_identifier: string;
    if (city.toLowerCase() === 'new york') {
      tz_identifier = 'America/New_York';
    } else {
      return {
        status: 'error',
        error_message: `Sorry, I don't have timezone information for ${city}.`,
      };
    }

    const now = new Date();
    const report = `The current time in ${city} is ${now.toLocaleString('en-US', { timeZone: tz_identifier })}`;

    return { status: 'success', report: report };
  },
});

export const rootAgent = new LlmAgent({
  name: 'weather_time_agent',
  model: 'gemini-2.5-flash',
  description: 'Agent to answer questions about the time and weather in a city.',
  instruction: 'You are a helpful agent who can answer user questions about the time and weather in a city.',
  tools: [getWeather, getCurrentTime],
});
.env¶
Create a .env file in the same folder:


OS X & Linux
Windows

touch .env

More instructions about this file are described in the next section on Set up the model.


intro_components.png

3. Set up the model¶
Your agent's ability to understand user requests and generate responses is powered by a Large Language Model (LLM). Your agent needs to make secure calls to this external LLM service, which requires authentication credentials. Without valid authentication, the LLM service will deny the agent's requests, and the agent will be unable to function.

Model Authentication guide

For a detailed guide on authenticating to different models, see the Authentication guide. This is a critical step to ensure your agent can make calls to the LLM service.


Gemini - Google AI Studio
Gemini - Google Cloud Vertex AI
Gemini - Google Cloud Vertex AI with Express Mode
Get an API key from Google AI Studio.
When using Python, open the .env file located inside (multi_tool_agent/) and copy-paste the following code.

multi_tool_agent/.env

GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=PASTE_YOUR_ACTUAL_API_KEY_HERE
When using Java, define environment variables:

terminal

export GOOGLE_GENAI_USE_VERTEXAI=FALSE
export GOOGLE_API_KEY=PASTE_YOUR_ACTUAL_API_KEY_HERE
When using TypeScript, the .env file is automatically loaded by the import 'dotenv/config'; line at the top of your agent.ts file.

env title=""multi_tool_agent/.env" GOOGLE_GENAI_USE_VERTEXAI=FALSE GOOGLE_GENAI_API_KEY=PASTE_YOUR_ACTUAL_API_KEY_HERE

Replace PASTE_YOUR_ACTUAL_API_KEY_HERE with your actual API KEY.


4. Run Your Agent¶

Python
TypeScript
Java
Using the terminal, navigate to your agent project directory:


my-adk-agent/      <-- navigate to this directory
    agent.ts
    .env
    package.json
    tsconfig.json
There are multiple ways to interact with your agent:


Dev UI (adk web)
Terminal (adk run)
API Server (adk api_server)
Run the following command to launch the dev UI.


npx adk web
Step 1: Open the URL provided (usually http://localhost:8000 or http://127.0.0.1:8000) directly in your browser.

Step 2. In the top-left corner of the UI, select your agent from the dropdown. The agents are listed by their filenames, so you should select "agent".

Troubleshooting

If you do not see "agent" in the dropdown menu, make sure you are running npx adk web in the directory containing your agent.ts file.

Step 3. Now you can chat with your agent using the textbox:

adk-web-dev-ui-chat.png

Step 4. By using the Events tab at the left, you can inspect individual function calls, responses and model responses by clicking on the actions:

adk-web-dev-ui-function-call.png

On the Events tab, you can also click the Trace button to see the trace logs for each event that shows the latency of each function calls:

adk-web-dev-ui-trace.png



📝 Example prompts to try¶
What is the weather in New York?
What is the time in New York?
What is the weather in Paris?
What is the time in Paris?
🎉 Congratulations!¶
You've successfully created and interacted with your first agent using ADK!

🛣️ Next steps¶
Go to the tutorial: Learn how to add memory, session, state to your agent: tutorial.
Delve into advanced configuration: Explore the setup section for deeper dives into project structure, configuration, and other interfaces.
Understand Core Concepts: Learn about agents concepts.
 Back to top
Previous
Build your agent with ADK
Next
Agent team
Copyright Google 2025  |  Terms  |  Privacy  |  Manage cookies
Made with Material for MkDocs
Copied to clipboard
