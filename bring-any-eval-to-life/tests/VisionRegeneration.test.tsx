import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisionRegeneration } from '../lib-web/useVisionRegeneration';
import * as geminiService from '../services/gemini';

// Mock html2canvas-pro
vi.mock('html2canvas-pro', () => ({
    default: vi.fn().mockResolvedValue({
        toDataURL: () => 'data:image/png;base64,mock_screenshot'
    })
}));

// Mock Gemini Service
vi.mock('../services/gemini', () => ({
    regenerateWithVision: vi.fn()
}));

describe('useVisionRegeneration TDD', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initially have no loading state and no error', () => {
        const { result } = renderHook(() => useVisionRegeneration());
        expect(result.current.isRegenerating).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should capture screenshot and call gemini service when regenerate is called', async () => {
        const mockNewHtml = '<html><body>Refined Simulation</body></html>';
        const regenerateWithVisionSpy = vi.spyOn(geminiService, 'regenerateWithVision')
            .mockResolvedValue(mockNewHtml);

        const { result } = renderHook(() => useVisionRegeneration());

        // We need a dummy element to "screenshot"
        const dummyElement = document.createElement('div');

        let newHtml;
        await act(async () => {
            newHtml = await result.current.regenerate(dummyElement, 'Add a patient chart');
        });

        expect(regenerateWithVisionSpy).toHaveBeenCalledWith(
            expect.stringContaining('mock_screenshot'),
            'Add a patient chart'
        );
        expect(newHtml).toBe(mockNewHtml);
        expect(result.current.isRegenerating).toBe(false);
    });

    it('should handle errors during regeneration', async () => {
        vi.spyOn(geminiService, 'regenerateWithVision')
            .mockRejectedValue(new Error('Vision processing failed'));

        const { result } = renderHook(() => useVisionRegeneration());
        const dummyElement = document.createElement('div');

        await act(async () => {
            try {
                await result.current.regenerate(dummyElement, 'Critique');
            } catch (e) {
                // Expected
            }
        });

        expect(result.current.error).toBe('Vision processing failed');
        expect(result.current.isRegenerating).toBe(false);
    });
});
