/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface FeedbackModalProps {
    isOpen: boolean;
    agentName: string;
    agentOutput: string;
    onApprove: () => void;
    onReject: (feedback: string) => void;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    isOpen,
    agentName,
    agentOutput,
    onApprove,
    onReject,
    onClose,
}) => {
    const [feedbackText, setFeedbackText] = React.useState('');
    const [showFeedbackInput, setShowFeedbackInput] = React.useState(false);

    if (!isOpen) return null;

    const handleReject = () => {
        if (feedbackText.trim()) {
            onReject(feedbackText);
            setFeedbackText('');
            setShowFeedbackInput(false);
        } else {
            setShowFeedbackInput(true);
        }
    };

    const handleApprove = () => {
        onApprove();
        setShowFeedbackInput(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-zinc-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h3 className="text-lg font-bold text-white">{agentName} Output</h3>
                        <p className="text-xs text-zinc-500">Review and provide feedback</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-100 whitespace-pre-wrap font-mono">
                            {agentOutput}
                        </pre>
                    </div>

                    {showFeedbackInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4"
                        >
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                What changes would you like?
                            </label>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="E.g., 'Add a timer component' or 'Make questions harder'"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                rows={3}
                                autoFocus
                            />
                        </motion.div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 flex gap-3">
                    <button
                        onClick={handleReject}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        {showFeedbackInput ? 'Submit Feedback' : 'Request Changes'}
                    </button>
                    <button
                        onClick={handleApprove}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
                    >
                        <CheckIcon className="w-5 h-5" />
                        Approve & Continue
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
