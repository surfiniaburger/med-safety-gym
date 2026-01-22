import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import App from '../App'; // App is at root
import * as geminiService from '../services/gemini';

// Mock the Gemini service
vi.mock('../services/gemini', () => ({
    bringToLife: vi.fn(),
}));

// Mock URL.createObjectURL for JSDOM just in case
global.URL.createObjectURL = vi.fn();

describe('App Integration', () => {
    it('calls bringToLife and renders output when a file is uploaded', async () => {
        // 1. Setup Mock Return
        const mockHtml = '<h1>Generated App</h1>';
        (geminiService.bringToLife as any).mockResolvedValue(mockHtml);

        const { container } = render(<App />);

        // 2. Find File Input
        // InputArea renders a hidden file input inside a label
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();

        // 3. Upload File
        const file = new File(['(⌐□_□)'], 'sketch.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        // 4. Verify Service Call
        // This ensures the App correctly handles the file change and calls the service
        await waitFor(() => {
            expect(geminiService.bringToLife).toHaveBeenCalledWith(
                expect.stringContaining(''), // prompt is empty
                expect.any(String), // base64 string
                'image/png'
            );
        });

        // 5. Verify Result (LivePreview)
        // LivePreview renders an iframe with srcDoc
        const iframe = container.querySelector('iframe');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('srcDoc', mockHtml);
    });
});
