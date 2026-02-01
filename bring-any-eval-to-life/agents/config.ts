/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

import { env } from 'node:process';

/**
 * Helper function to read environment variables.
 */
function getEnv(key: string, defaultValue: string): string {
    return env[key] || defaultValue;
}

export class AgentModel {
    name: string = 'eval_builder';
    model: string = 'gemini-2.5-flash';
}

export class Config {
    agentSettings: AgentModel = new AgentModel();
    appName: string = 'eval_builder_app';

    CLOUD_PROJECT: string = getEnv('GOOGLE_CLOUD_PROJECT', 'my_project');
    CLOUD_LOCATION: string = getEnv('GOOGLE_CLOUD_LOCATION', 'us-central1');
    GENAI_USE_VERTEXAI: string = getEnv('GOOGLE_GENAI_USE_VERTEXAI', '0');
    API_KEY: string = getEnv('GEMINI_API_KEY', '');
}

// Export a singleton instance
export const config = new Config();
