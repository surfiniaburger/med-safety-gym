/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Main coordinator agent that orchestrates the 5-agent workflow.
 */

import { LlmAgent, AgentTool } from '@google/adk';
import { GLOBAL_INSTRUCTION, EVAL_COORDINATOR_PROMPT } from './prompts';
import { config } from './config';
import {
    rateLimitCallback,
    beforeAgent,
    beforeTool,
    afterTool,
} from './callbacks';

// Import all sub-agents
import { conceptAgent } from './sub-agents/concept/agent';
import { designerAgent } from './sub-agents/designer/agent';
import { builderAgent } from './sub-agents/builder/agent';
import { reviewerAgent } from './sub-agents/reviewer/agent';
import { polisherAgent } from './sub-agents/polisher/agent';

// Combine global and coordinator-specific instructions
const COMBINED_INSTRUCTION = `${GLOBAL_INSTRUCTION}\n\n${EVAL_COORDINATOR_PROMPT}`;

export const evalCoordinator = new LlmAgent({
    model: config.agentSettings.model,
    name: 'eval_coordinator',
    description: 'Guides users through structured evaluation UI creation by orchestrating specialized sub-agents',
    instruction: COMBINED_INSTRUCTION,
    outputKey: 'coordinator_output',
    tools: [
        new AgentTool({ agent: conceptAgent }),
        new AgentTool({ agent: designerAgent }),
        new AgentTool({ agent: builderAgent }),
        new AgentTool({ agent: reviewerAgent }),
        new AgentTool({ agent: polisherAgent }),
    ],
    // Attach lifecycle callbacks
    beforeModelCallback: rateLimitCallback,
    beforeAgentCallback: beforeAgent,
    beforeToolCallback: beforeTool,
    afterToolCallback: afterTool,
});

// Export as root agent for the runner
export const rootAgent = evalCoordinator;
