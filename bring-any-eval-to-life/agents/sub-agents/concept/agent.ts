/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Concept Agent: Brainstorms evaluation ideas and defines success criteria.
 */

import { LlmAgent, GoogleSearchTool } from '@google/adk';
import { CONCEPT_AGENT_PROMPT } from '../../prompts';
import { config } from '../../config';

export const conceptAgent = new LlmAgent({
    model: config.agentSettings.model,
    name: 'concept_agent',
    description: 'Brainstorms evaluation concepts and defines success criteria',
    instruction: CONCEPT_AGENT_PROMPT,
    outputKey: 'concept_output',
    tools: [new GoogleSearchTool()],
});
