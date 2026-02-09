/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { Hero } from './Hero';
import { ResultSelector } from './ResultSelector';
import { InputArea } from './InputArea';
import { CreationHistory, Creation } from './CreationHistory';
import { EvaluationArtifact } from '../services/github';

interface SelectionScreenProps {
    isFocused: boolean;
    artifacts: EvaluationArtifact[];
    isLoadingArtifacts: boolean;
    history: Creation[];
    isGenerating: boolean;
    onSelectArtifact: (artifact: EvaluationArtifact) => void;
    onEvolution: (taskId: string) => void;
    onGenerate: (promptText: string) => void;
    onSelectCreation: (creation: Creation) => void;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({
    isFocused,
    artifacts,
    isLoadingArtifacts,
    history,
    isGenerating,
    onSelectArtifact,
    onEvolution,
    onGenerate,
    onSelectCreation
}) => {
    return (
        <div
            className={`
        flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 
        transition-all duration-700
        ${isFocused
                    ? 'opacity-0 scale-95 blur-sm pointer-events-none h-[100dvh] overflow-hidden'
                    : 'opacity-100 scale-100 blur-0'
                }
      `}
        >
            <div className="pt-12 md:pt-20 pb-8 flex flex-col items-center">
                <Hero />
            </div>

            {/* Artifacts Selection Engine */}
            <section className="py-12">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <ArrowUpTrayIcon className="w-3 h-3" /> Artifact Selection Engine
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">Select an Evaluation Result</h2>
                    <p className="text-zinc-500 max-w-lg">
                        Choose a clinical safety artifact to transform it into a high-stakes medical training simulation.
                    </p>
                </div>

                <ResultSelector
                    artifacts={artifacts}
                    onSelect={onSelectArtifact}
                    onEvolution={onEvolution}
                    isLoading={isLoadingArtifacts}
                />
            </section>

            {/* Custom Input (Secondary) */}
            <section className="py-20 border-t border-white/5">
                <div className="flex flex-col items-center mb-8 text-center text-sm text-zinc-600 font-mono text-xs uppercase tracking-widest opacity-60">
                    OR DEFINE A CUSTOM RESEARCH SCENARIO
                </div>
                <div className="w-full flex justify-center">
                    <InputArea onGenerate={onGenerate} isGenerating={isGenerating} disabled={isFocused} />
                </div>
            </section>

            {/* History Section & Footer */}
            <div className="flex-shrink-0 pb-12 w-full mt-auto flex flex-col items-center gap-12">
                <div className="w-full">
                    <CreationHistory history={history} onSelect={onSelectCreation} />
                </div>

                <a
                    href="https://github.com/surfiniaburger"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-700 hover:text-zinc-400 text-xs font-mono transition-colors"
                >
                    @surfiniaburger
                </a>
            </div>
        </div>
    );
};
