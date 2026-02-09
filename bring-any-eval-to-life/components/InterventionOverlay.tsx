/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationCircleIcon, PlayIcon } from '@heroicons/react/24/solid';

interface InterventionOverlayProps {
    isPaused: boolean;
    streamData: {
        snapshots: any[];
        [key: string]: any;
    };
    onHandleResume: (tweak?: any) => void;
    onIntervene: (index: number) => void;
}

export const InterventionOverlay: React.FC<InterventionOverlayProps> = ({
    isPaused,
    streamData,
    onHandleResume,
    onIntervene
}) => {
    if (!isPaused) return null;

    const lastSnapshot = streamData.snapshots.at(-1);
    if (!lastSnapshot) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
                data-testid="intervention-overlay"
            >
                <div className="bg-zinc-950/80 backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-rose-500/20 animate-pulse">
                            <ExclamationCircleIcon className="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">
                                {lastSnapshot.challenge ? "Safety Dance Initiated" : "Intervention Required"}
                            </h3>
                            <p className="text-rose-400/60 text-xs font-mono uppercase tracking-tight">
                                Neural Trajectory Paused at Index {streamData.snapshots.length - 1}
                            </p>
                        </div>
                    </div>

                    {lastSnapshot.challenge ? (
                        <div className="mb-6 space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-zinc-300 text-sm leading-relaxed text-center italic">
                                    "{lastSnapshot.challenge.question}"
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {lastSnapshot.challenge.options.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => onHandleResume({ solution: opt })}
                                        className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => onHandleResume()}
                                className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                            >
                                <PlayIcon className="w-5 h-5" /> Proceed with Current Rubric
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => onIntervene(streamData.snapshots.length - 1)}
                        className="w-full mt-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 py-4 rounded-2xl font-bold hover:bg-rose-500/20 transition-all"
                    >
                        Investigate & Tweak Model
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
