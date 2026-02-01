/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Polisher Agent: Refines code based on reviewer feedback.
 */

import { LlmAgent } from '@google/adk';
import { POLISHER_AGENT_PROMPT } from '../../prompts';
import { config } from '../../config';

export const polisherAgent = new LlmAgent({
    model: config.agentSettings.model,
    name: 'polisher_agent',
    description: 'Refines and polishes code based on review feedback',
    instruction: POLISHER_AGENT_PROMPT,
    outputKey: 'final_output',
});
