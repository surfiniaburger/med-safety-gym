/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Reviewer Agent: Analyzes code quality, UX, and accessibility.
 */

import { LlmAgent } from '@google/adk';
import { REVIEWER_AGENT_PROMPT } from '../../prompts';
import { config } from '../../config';

export const reviewerAgent = new LlmAgent({
    model: config.agentSettings.model,
    name: 'reviewer_agent',
    description: 'Analyzes implementation quality, UX, and accessibility',
    instruction: REVIEWER_AGENT_PROMPT,
    outputKey: 'review_output',
});
