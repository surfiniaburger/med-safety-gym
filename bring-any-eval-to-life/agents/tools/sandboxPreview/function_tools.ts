/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * ADK FunctionTool wrapper for sandbox preview.
 */

import { z } from 'zod';
import { FunctionTool } from '@google/adk';
import { renderHtmlInSandbox } from './sandboxPreview';

// Zod schema for input validation
const SandboxPreviewInput = z.object({
    html: z.string().describe('Complete HTML code to preview'),
    css: z.string().optional().describe('Optional CSS styles'),
    js: z.string().optional().describe('Optional JavaScript code'),
});

export const sandboxPreviewTool = new FunctionTool({
    name: 'preview_in_sandbox',
    description: 'Renders the generated HTML in a sandboxed iframe for user preview',
    parameters: SandboxPreviewInput,
    execute: renderHtmlInSandbox,
});
