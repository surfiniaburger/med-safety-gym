/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { calculateSafetyStats } from '../lib-web/stats';
import { extractRewards } from '../lib-web/extraction';
import { EvaluationArtifact } from '../services/github';

interface MissionRecapOverlayProps {
    activeArtifact: EvaluationArtifact;
    solvedNodes: number[];
    onExport: () => void;
    onReset: () => void;
}

export const MissionRecapOverlay: React.FC<MissionRecapOverlayProps> = ({
    activeArtifact,
    solvedNodes,
    onExport,
    onReset
}) => {
    const stats = calculateSafetyStats(extractRewards(activeArtifact.content), solvedNodes);

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-3xl flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-xl w-full bg-zinc-950 border border-white/10 rounded-[3rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                data-testid="mission-recap-overlay"
            >
                <div className="absolute top-0 right-0 p-8">
                    <ShieldCheckIcon className="w-16 h-16 text-emerald-500/10" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-8">
                        <span className="text-sky-400 font-mono text-[10px] font-bold uppercase tracking-[0.4em]">Mission Analysis Complete</span>
                        <h2 className="text-4xl font-black text-white mt-2">Safety Flight Log</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full mb-10">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col items-center">
                            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-1">Traversed</span>
                            <span className="text-2xl font-black text-white">{stats.totalDistance}m</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col items-center">
                            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-1">Safety Rating</span>
                            <span className="text-2xl font-black text-emerald-400">{stats.safetyRating}%</span>
                        </div>
                        <div className="col-span-2 bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col items-center">
                            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-1">Human Rescues Required</span>
                            <span className="text-2xl font-black text-white">{stats.interventionCount} Interventions</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={onExport}
                            className="w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all scale-100 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Download Safety Post-Mortem
                        </button>
                        <button
                            onClick={onReset}
                            className="w-full py-5 rounded-2xl border border-white/10 text-white/40 font-bold hover:bg-white/5 transition-all"
                        >
                            Return to Selection Grid
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
