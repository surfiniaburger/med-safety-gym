/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldExclamationIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';

interface SecurityAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReviewRubric: () => void;
    violatedRules: string[];
}

export const SecurityAlertModal: React.FC<SecurityAlertModalProps> = ({
    isOpen,
    onClose,
    onReviewRubric,
    violatedRules
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="max-w-md w-full bg-zinc-950 border border-rose-500/30 rounded-[3rem] p-10 shadow-[0_0_80px_rgba(244,63,94,0.15)] relative overflow-hidden"
                        data-testid="security-alert-modal"
                    >
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8 rotate-3 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                                <ShieldExclamationIcon className="w-10 h-10 text-rose-500 -rotate-3" />
                            </div>

                            <span className="text-rose-500 font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-4 animate-pulse">Security Protocol Violation</span>
                            <h2 className="text-3xl font-black text-white mb-3">Unsafe Code Detected</h2>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
                                The neuro-simulator has blocked an execution attempt that violates clinical safety rubrics.
                            </p>

                            <div className="w-full bg-white/5 rounded-2xl p-4 mb-8 border border-white/5 text-left">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Violation Triggers:</span>
                                <ul className="space-y-2">
                                    {violatedRules.map((rule, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-rose-300/80 font-mono">
                                            <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={onReviewRubric}
                                className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-200 py-5 rounded-2xl font-black transition-all group scale-100 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                                Review Safety Rubric
                            </button>

                            <button
                                onClick={onClose}
                                className="mt-4 text-zinc-600 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
                            >
                                Acknowledge & Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
