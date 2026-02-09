import { useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { regenerateWithVision } from '../services/gemini';

export const useVisionRegeneration = () => {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const regenerate = async (element: HTMLElement, critique: string) => {
        setIsRegenerating(true);
        setError(null);

        try {
            // 1. Capture Screenshot
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 2, // Higher resolution for Agentic Vision
                logging: false,
            });
            const screenshotBase64 = canvas.toDataURL('image/png');

            // 2. Call Vision Service
            const newHtml = await regenerateWithVision(screenshotBase64, critique);

            setIsRegenerating(false);
            return newHtml;
        } catch (err: any) {
            const msg = err.message || 'Vision regeneration failed';
            setError(msg);
            setIsRegenerating(false);
            throw err;
        }
    };

    return {
        regenerate,
        isRegenerating,
        error
    };
};
