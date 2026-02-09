import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';

interface RegenerationFormProps {
    onRegenerate: (critique: string) => void;
    isRegenerating: boolean;
    onClose: () => void;
}

export const RegenerationForm: React.FC<RegenerationFormProps> = ({
    onRegenerate,
    isRegenerating,
    onClose
}) => {
    const [critique, setCritique] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (critique.trim() && !isRegenerating) {
            onRegenerate(critique);
        }
    };

    return (
        <div className="absolute bottom-6 right-6 z-50 w-full max-w-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <SparklesIconSolid className="w-5 h-5 text-blue-400" />
                        <h4 className="text-zinc-100 text-xs font-bold uppercase tracking-wider">Agentic Refinement</h4>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={critique}
                            onChange={(e) => setCritique(e.target.value)}
                            placeholder="What should be improved? (e.g., 'Add a real-time vitals chart', 'Change tone to more urgent')"
                            className="w-full h-24 bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                            disabled={isRegenerating}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isRegenerating || !critique.trim()}
                        className={`
              w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
              ${isRegenerating
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                            }
            `}
                    >
                        {isRegenerating ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Analyzing & Refining...
                            </>
                        ) : (
                            <>
                                <PaperAirplaneIcon className="w-3 h-3" />
                                Apply Refinements
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">VISION-DRIVEN REGENERATION</span>
                    <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] text-blue-400 font-bold uppercase">Ready</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
