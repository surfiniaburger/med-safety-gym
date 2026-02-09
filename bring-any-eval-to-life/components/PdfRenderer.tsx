/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useRef } from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface PdfRendererProps {
    dataUrl: string;
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({ dataUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderPdf = async () => {
            if (!window.pdfjsLib) {
                setError("PDF library not initialized");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Load the document
                const loadingTask = window.pdfjsLib.getDocument(dataUrl);
                const pdf = await loadingTask.promise;

                // Get the first page
                const page = await pdf.getPage(1);

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');

                // Calculate scale to make it look good (High DPI)
                const viewport = page.getViewport({ scale: 2.0 });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                await page.render(renderContext).promise;
                setLoading(false);
            } catch (err) {
                console.error("Error rendering PDF:", err);
                setError("Could not render PDF preview.");
                setLoading(false);
            }
        };

        renderPdf();
    }, [dataUrl]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-6 text-center">
                <DocumentIcon className="w-12 h-12 mb-3 opacity-50 text-red-400" />
                <p className="text-sm mb-2 text-red-400/80">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={`max-w-full max-h-full object-contain shadow-xl border border-zinc-800/50 rounded transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
        </div>
    );
};
