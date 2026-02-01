/**
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Test script for multi-agent eval builder.
 * Run with: tsx agents/test-agents.ts
 */

import { AgentRunnerService } from '../services/agentRunner';

async function testAgents() {
    console.log('🚀 Starting Multi-Agent Eval Builder Test\n');

    const runner = new AgentRunnerService();
    const sessionId = 'test-session-' + Date.now();

    // Test user message
    const userMessage = 'Create a simple multiple-choice quiz about TypeScript basics with 3 questions';

    console.log('📝 User Request:');
    console.log(`"${userMessage}"\n`);
    console.log('⏳ Processing...\n');
    console.log('='.repeat(80));

    try {
        let eventCount = 0;

        for await (const event of runner.runAgent(userMessage, sessionId)) {
            eventCount++;

            console.log(`\n[Event ${eventCount}] Author: ${event.author || 'system'}`);
            console.log(`Time: ${new Date(event.timestamp || Date.now()).toISOString()}`);

            // Display content
            if (event.content?.parts) {
                for (const part of event.content.parts) {
                    if ('text' in part && part.text) {
                        console.log('\n📄 Content:');
                        console.log(part.text);
                    }
                }
            }

            // Display function calls (sub-agent invocations)
            if (event.content?.parts) {
                for (const part of event.content.parts) {
                    if ('functionCall' in part && part.functionCall) {
                        console.log('\n🔧 Function Call:');
                        console.log(`  Name: ${part.functionCall.name}`);
                        console.log(`  Args: ${JSON.stringify(part.functionCall.args, null, 2)}`);
                    }
                }
            }

            // Check for confirmation requests from PolicyEngine
            if (event.content?.parts) {
                for (const part of event.content.parts) {
                    if ('functionCall' in part && part.functionCall?.name === 'ask_user_confirmation') {
                        console.log('\n⚠️  HUMAN-IN-THE-LOOP CONFIRMATION REQUIRED');
                        console.log('   (In production, this would show a UI modal)');
                        console.log('   Agent needs approval to proceed.');
                    }
                }
            }

            console.log('-'.repeat(80));
        }

        console.log(`\n✅ Test completed! Processed ${eventCount} events.`);

        // Display session state
        try {
            const sessionService = runner.getSessionService();
            const session = await sessionService.getSession('user', sessionId);
            if (session) {
                console.log('\n📊 Final Session State:');
                const stateKeys = Array.from(session.state.keys());
                for (const key of stateKeys) {
                    const value = session.state.get(key);
                    console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 100) + '...' : value}`);
                }
            }
        } catch (error) {
            console.log('\n⚠️  Unable to access session state');
        }

    } catch (error) {
        console.error('\n❌ Error during test:');
        console.error(error);
    }
}

// Run the test
testAgents().then(() => {
    console.log('\n🎉 Test script finished!');
    process.exit(0);
}).catch((error) => {
    console.error('\n💥 Fatal error:');
    console.error(error);
    process.exit(1);
});
