/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { AgentRunnerService } from '../services/agentRunner';
import { Event } from '@google/adk';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { SandboxPreview } from './SandboxPreview';
import { FeedbackModal } from './FeedbackModal';

interface AgentMessage {
    id: string;
    author: 'user' | 'coordinator' | 'system';
    text: string;
    timestamp: Date;
}

export const AgentChat: React.FC = () => {
    const [messages, setMessages] = useState<AgentMessage[]>([
        {
            id: '1',
            author: 'coordinator',
            text: "Welcome! I'm the AI Eval Builder Coordinator. I'll guide you and our AI team in building an evaluation UI. What kind of evaluation would you like to create?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
    const [confirmationRequest, setConfirmationRequest] = useState<{
        id: string;
        agentName: string;
        agentOutput: string;
        resolve: (approved: boolean, feedback?: string) => void;
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const runnerRef = useRef<AgentRunnerService | null>(null);
    const sessionIdRef = useRef(`session-${Date.now()}`);

    useEffect(() => {
        runnerRef.current = new AgentRunnerService();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (overrideInput?: string, confirmationResponse?: { approved: boolean; feedback?: string }) => {
        const messageText = overrideInput || input.trim();
        if (!messageText && !confirmationResponse) return;
        if (isProcessing) return;

        if (!confirmationResponse) {
            const userMessage: AgentMessage = {
                id: crypto.randomUUID(),
                author: 'user',
                text: messageText,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMessage]);
        }
        
        setInput('');
        setIsProcessing(true);

        try {
            const runner = runnerRef.current!;
            let responseText = '';

            for await (const event of runner.runAgent(messageText, sessionIdRef.current, confirmationResponse)) {
                // Accumulate agent responses
                if (event.content?.parts) {
                    for (const part of event.content.parts) {
                        if ('text' in part && part.text) {
                            responseText += part.text;
                        }

                        // Check for confirmation requests
                        if ('functionCall' in part && part.functionCall?.name === 'adk_request_confirmation') {
                            const args = part.functionCall.args as any;
                            const toolCall = args?.toolCall;
                            
                            // Create a promise that will be resolved by the user via the modal
                            const userResponse = await new Promise<{ approved: boolean; feedback?: string }>((resolve) => {
                                setConfirmationRequest({
                                    id: part.functionCall!.id!,
                                    agentName: toolCall?.name || 'Agent',
                                    agentOutput: responseText, // Use current accumulated text as output to review
                                    resolve: (approved, feedback) => {
                                        resolve({ approved, feedback });
                                        setConfirmationRequest(null);
                                        // Re-trigger handleSend with the confirmation response
                                        handleSend('', { approved, feedback });
                                    },
                                });
                            });

                            // Break the current loop as we're starting a new one via handleSend
                            return;
                        }

                        // Check for tool responses to catch sandbox preview
                        if ('functionResponse' in part && part.functionResponse?.name === 'preview_in_sandbox') {
                            const response = part.functionResponse.response as any;
                            if (response?.previewId) {
                                setActivePreviewId(response.previewId);
                            }
                        }
                    }
                }
            }

            if (responseText) {
                const agentMessage: AgentMessage = {
                    id: crypto.randomUUID(),
                    author: 'coordinator',
                    text: responseText,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, agentMessage]);
            }
        } catch (error) {
            console.error('Error communicating with agent:', error);
            const errorMessage: AgentMessage = {
                id: crypto.randomUUID(),
                author: 'system',
                text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-6 h-6 text-sky-400" />
                    <div>
                        <h2 className="text-lg font-bold text-white">Eval Builder Assistant</h2>
                        <p className="text-xs text-zinc-500">Multi-Agent Coordinator</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.author === 'user'
                                        ? 'bg-sky-500 text-white'
                                        : message.author === 'system'
                                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                            : 'bg-white/5 text-zinc-100 border border-white/10'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                <p className="text-[10px] mt-1 opacity-50">
                                    {message.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs text-zinc-500">Agent is thinking...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Sandbox Preview Overlay */}
            <SandboxPreview
                previewId={activePreviewId}
                onClose={() => setActivePreviewId(null)}
            />

            <FeedbackModal
                isOpen={!!confirmationRequest}
                agentName={confirmationRequest?.agentName || ''}
                agentOutput={confirmationRequest?.agentOutput || ''}
                onApprove={() => confirmationRequest?.resolve(true)}
                onReject={(feedback) => confirmationRequest?.resolve(false, feedback)}
                onClose={() => setConfirmationRequest(null)}
            />

            {/* Input */}
            <div className="flex-shrink-0 border-t border-white/10 px-6 py-4">
                <div className="flex items-end gap-3">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the evaluation you want to create..."
                        disabled={isProcessing}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50"
                        rows={2}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className="flex-shrink-0 bg-sky-500 hover:bg-sky-600 disabled:bg-white/10 disabled:text-zinc-600 text-white p-3 rounded-xl transition-all disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
