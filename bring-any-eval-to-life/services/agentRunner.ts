/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Agent Runner Service.
 * Integrates ADK InMemoryRunner with SecurityPlugin for human-in-the-loop.
 */

import { InMemoryRunner } from '@google/adk';
import { SecurityPlugin } from '@google/adk/plugins';
import { rootAgent } from '../agents/coordinator';
import { EvalBuilderPolicyEngine } from './policyEngine';
import { config } from '../agents/config';

export class AgentRunnerService {
    private runner: InMemoryRunner;

    constructor() {
        this.runner = new InMemoryRunner({
            agent: rootAgent,
            appName: config.appName,
            plugins: [
                new SecurityPlugin({
                    policyEngine: new EvalBuilderPolicyEngine(),
                }),
            ],
        });
    }

    async *runAgent(userMessage: string, sessionId: string) {
        for await (const event of this.runner.runAsync({
            sessionId,
            userMessage,
        })) {
            yield event;
        }
    }

    // Helper to get session state
    getSession(sessionId: string) {
        return this.runner.getSession(sessionId);
    }
}
