import { render, screen, waitFor } from '@testing-library/react';
import { LivePreview } from '../components/LivePreview';
import { validateHtmlSafety } from '../lib-web/security';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// Mock the security utility
vi.mock('../lib-web/security', () => ({
    validateHtmlSafety: vi.fn()
}));

// Mock useVisionRegeneration hook
vi.mock('../lib-web/useVisionRegeneration', () => ({
    useVisionRegeneration: () => ({
        regenerate: vi.fn(),
        isRegenerating: false
    })
}));

// Mock useToast hook
vi.mock('../components/Toast', () => ({
    useToast: () => ({
        showToast: vi.fn()
    }),
    ToastProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock PdfRenderer to avoid complex imports
vi.mock('./PdfRenderer', () => ({
    PdfRenderer: () => <div>PDF Renderer</div>
}));

// Mock common framer-motion to simplify testing
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LivePreview Security Integration', () => {
    const mockCreation = {
        id: 'test-1',
        name: 'Test App',
        html: '<div>Default</div>',
        timestamp: new Date()
    };

    it('verifies SecurityAlertModal is NOT visible initially', () => {
        (validateHtmlSafety as any).mockReturnValue({ safe: true, violatedRules: [] });

        render(
            <LivePreview
                creation={mockCreation}
                isLoading={false}
                isFocused={true}
                onReset={() => { }}
            />
        );

        expect(screen.queryByTestId('security-alert-modal')).not.toBeInTheDocument();
    });

    // Since handleVisionRegenerate is private/internal to LivePreview, 
    // we test the state transition by mocking the regenerate function 
    // and triggering it through the RegenerationForm if possible, 
    // or testing the SecurityAlertModal component in isolation if integration is too opaque.
});
