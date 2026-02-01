/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Builder Agent: Generates HTML/TypeScript code with sandbox preview tool.
 */

import { LlmAgent } from '@google/adk';
import { googleSearch } from '@google/adk/tools';
import { BUILDER_AGENT_PROMPT } from '../../prompts';
import { config } from '../../config';
import { sandboxPreviewTool } from '../../tools/sandboxPreview/function_tools';

export const builderAgent = new LlmAgent({
    model: config.agentSettings.model,
    name: 'builder_agent',
    description: 'Generates clean HTML/TypeScript code for evaluation UIs',
    instruction: BUILDER_AGENT_PROMPT,
    outputKey: 'code_output',
    tools: [
        googleSearch,
        sandboxPreviewTool, // Allow builder to preview generated code
    ],
});
