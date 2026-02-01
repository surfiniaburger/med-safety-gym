/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Agent Runner Service.
 * Integrates ADK InMemoryRunner with SecurityPlugin for human-in-the-loop.
 */

import { InMemoryRunner, SecurityPlugin } from '@google/adk';
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

    async *runAgent(userMessage: string, sessionId: string, confirmationResponse?: { approved: boolean; feedback?: string }) {
        // runAsync handles session creation internally
        for await (const event of this.runner.runAsync({
            sessionId,
            userId: 'user',
            newMessage: confirmationResponse 
                ? { 
                    role: 'user', 
                    parts: [{ 
                        text: confirmationResponse.approved 
                            ? 'Approved. Please proceed.' 
                            : `I have some feedback: ${confirmationResponse.feedback}` 
                    }] 
                }
                : { role: 'user', parts: [{ text: userMessage }] },
        })) {
            yield event;
        }
    }

    // Helper to access session service
    getSessionService() {
        return this.runner.sessionService;
    }
}
