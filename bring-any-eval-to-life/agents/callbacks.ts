/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Callback functions for Eval Builder agents.
 * Implements rate limiting, validation, and state initialization.
 */

import { BaseTool, LlmRequest, ToolContext, CallbackContext } from '@google/adk';

const RATE_LIMIT_SECS = 60;
const RPM_QUOTA = 10; // Requests per minute

/**
 * Rate limiting callback for LLM requests.
 * Prevents hitting Gemini API rate limits by throttling requests.
 */
export async function rateLimitCallback({
    context: callbackContext,
    request: llmRequest,
}: {
    context: CallbackContext;
    request: LlmRequest;
}): Promise<any> {
    // Handle empty text parts (Gemini API requirement)
    if (!llmRequest || !llmRequest.contents) {
        console.debug('llmRequest or llmRequest.contents is undefined. Skipping rate limit.');
        return undefined;
    }

    for (const content of llmRequest.contents) {
        if (content.parts) {
            for (const part of content.parts) {
                if ('text' in part && part.text === '') {
                    part.text = ' '; // Replace empty with space
                }
            }
        }
    }

    const now = Date.now() / 1000; // Time in seconds

    if (!callbackContext.state.has('timer_start')) {
        callbackContext.state.set('timer_start', now);
        callbackContext.state.set('request_count', 1);
        console.debug(
            `rate_limit_callback [timestamp: ${now}, req_count: 1, elapsed_secs: 0]`
        );
        return undefined;
    }

    const requestCount = (callbackContext.state.get<number>('request_count') || 0) + 1;
    const timerStart = callbackContext.state.get<number>('timer_start') || now;
    const elapsedSecs = now - timerStart;

    console.debug(
        `rate_limit_callback [timestamp: ${now}, request_count: ${requestCount}, elapsed_secs: ${elapsedSecs}]`
    );

    if (requestCount > RPM_QUOTA) {
        const delay = RATE_LIMIT_SECS - elapsedSecs + 1;
        if (delay > 0) {
            console.debug(`Rate limit hit. Sleeping for ${delay} seconds`);
            await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        }
        // Reset timer
        callbackContext.state.set('timer_start', Date.now() / 1000);
        callbackContext.state.set('request_count', 1);
    } else {
        callbackContext.state.set('request_count', requestCount);
    }

    return undefined;
}

/**
 * Initialize session state before agent runs.
 * Sets up default eval configuration.
 */
export function beforeAgent(callbackContext: CallbackContext): undefined {
    // Initialize default eval config if not present
    if (!callbackContext.state.has('eval_config')) {
        const defaultConfig = {
            theme: 'light',
            sandboxEnabled: true,
            maxIterations: 3,
        };
        callbackContext.state.set('eval_config', JSON.stringify(defaultConfig));
    }

    // Track agent session start time
    if (!callbackContext.state.has('session_start')) {
        callbackContext.state.set('session_start', Date.now());
    }
}

/**
 * Validate and normalize tool inputs before execution.
 */
export function beforeTool({
    tool,
    args,
    context: toolContext,
}: {
    tool: BaseTool;
    args: Record<string, any>;
    context: ToolContext;
}): Record<string, any> | undefined {

    // Validate HTML before sandbox preview
    if (tool.name === 'preview_in_sandbox') {
        if (!args['html'] || args['html'].trim() === '') {
            return {
                error: 'HTML content is required for sandbox preview',
                status: 'error'
            };
        }
    }

    return undefined; // Proceed with tool execution
}

/**
 * Handle tool responses and trigger side effects.
 */
export function afterTool({
    tool,
    args,
    context: toolContext,
    response: toolResponse,
}: {
    tool: BaseTool;
    args: Record<string, unknown>;
    context: ToolContext;
    response: Record<string, unknown>;
}): Record<string, unknown> | undefined {

    if (tool.name === 'preview_in_sandbox') {
        if (toolResponse && toolResponse['status'] === 'rendered') {
            console.debug('HTML successfully rendered in sandbox');
            // Could trigger analytics event here
        }
    }

    return undefined;
}
