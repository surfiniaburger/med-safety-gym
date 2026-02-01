/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface SandboxPreviewProps {
    previewId: string | null;
    onClose: () => void;
}

export const SandboxPreview: React.FC<SandboxPreviewProps> = ({ previewId, onClose }) => {
    const [html, setHtml] = useState<string>('');

    useEffect(() => {
        if (!previewId) {
            setHtml('');
            return;
        }

        // Listen for sandbox-preview-ready event
        const handlePreviewReady = (event: CustomEvent) => {
            if (event.detail.previewId === previewId) {
                setHtml(event.detail.html);
            }
        };

        window.addEventListener('sandbox-preview-ready', handlePreviewReady as EventListener);

        // Also check sessionStorage in case event already fired
        const storedHtml = sessionStorage.getItem(`preview_${previewId}`);
        if (storedHtml) {
            setHtml(storedHtml);
        }

        return () => {
            window.removeEventListener('sandbox-preview-ready', handlePreviewReady as EventListener);
        };
    }, [previewId]);

    if (!previewId) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-zinc-900 border border-white/10 rounded-3xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950">
                        <div>
                            <h3 className="text-lg font-bold text-white">Sandbox Preview</h3>
                            <p className="text-xs text-zinc-500">Preview ID: {previewId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Iframe Container */}
                    <div className="flex-1 bg-white overflow-hidden">
                        {html ? (
                            <iframe
                                srcDoc={html}
                                title="Eval Preview"
                                sandbox="allow-scripts allow-forms allow-same-origin"
                                className="w-full h-full border-0"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-zinc-500">Loading preview...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
