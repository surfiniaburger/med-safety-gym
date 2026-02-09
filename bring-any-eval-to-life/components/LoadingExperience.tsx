/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

interface LoadingStepProps {
    text: string;
    active: boolean;
    completed: boolean;
}

const LoadingStep: React.FC<LoadingStepProps> = ({ text, active, completed }) => (
    <div className={`flex items-center space-x-3 transition-all duration-500 ${active || completed ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
        <div className={`w-4 h-4 flex items-center justify-center ${completed ? 'text-green-400' : active ? 'text-blue-400' : 'text-zinc-700'}`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : active ? (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            ) : (
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
            )}
        </div>
        <span className={`font-mono text-xs tracking-wide uppercase ${active ? 'text-zinc-200' : completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>
            {text}
        </span>
    </div>
);

interface LoadingExperienceProps {
    loadingStep: number;
}

export const LoadingExperience: React.FC<LoadingExperienceProps> = ({ loadingStep }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-6 text-blue-500 animate-[spin_3s_linear_infinite]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-zinc-100 font-mono text-lg tracking-tight">Priming Neuro-Sim</h3>
                    <p className="text-zinc-500 text-sm mt-2">Constructing clinical training environment...</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[loading_3s_ease-in-out_infinite] w-1/3"></div>
                </div>

                {/* Terminal Steps */}
                <div className="border border-zinc-800 bg-black/50 rounded-lg p-4 space-y-3 font-mono text-sm">
                    <LoadingStep text="Analyzing safety artifacts" active={loadingStep === 0} completed={loadingStep > 0} />
                    <LoadingStep text="Synthesizing clinical scenario" active={loadingStep === 1} completed={loadingStep > 1} />
                    <LoadingStep text="Generating interactive simulation" active={loadingStep === 2} completed={loadingStep > 2} />
                    <LoadingStep text="Compiling medical environment" active={loadingStep === 3} completed={loadingStep > 3} />
                </div>
            </div>

            <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
};
