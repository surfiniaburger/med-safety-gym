/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Designer Agent: Designs UI structure and component layout.
 */

import { LlmAgent } from '@google/adk';
import { googleSearch } from '@google/adk/tools';
import { DESIGNER_AGENT_PROMPT } from '../../prompts';
import { config } from '../../config';

export const designerAgent = new LlmAgent({
    model: config.agentSettings.model,
    name: 'designer_agent',
    description: 'Designs UI structure, components, and interaction patterns',
    instruction: DESIGNER_AGENT_PROMPT,
    outputKey: 'design_output',
    tools: [googleSearch],
});
