/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * PolicyEngine for human-in-the-loop confirmations.
 * Implements BasePolicyEngine to require user approval after each sub-agent completes.
 */

import type {
    BasePolicyEngine,
    PolicyOutcome,
    ToolCallPolicyContext,
    PolicyCheckResult
} from '@google/adk';

export class EvalBuilderPolicyEngine implements BasePolicyEngine {
    async evaluate(context: ToolCallPolicyContext): Promise<PolicyCheckResult> {
        const toolName = context.functionCall.name;

        // Require user confirmation for all sub-agent invocations
        const requiresConfirmation = [
            'concept_agent',
            'designer_agent',
            'builder_agent',
            'reviewer_agent',
            'polisher_agent',
        ].includes(toolName);

        if (requiresConfirmation) {
            return {
                outcome: 'CONFIRM' as PolicyOutcome,
                reason: `User feedback needed after ${toolName} completes`,
            };
        }

        // Auto-approve utility tools (google_search, preview_in_sandbox)
        return {
            outcome: 'ALLOW' as PolicyOutcome,
            reason: 'Utility tool, no user approval needed',
        };
    }
}
