import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityAlertModal } from '../components/SecurityAlertModal';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('SecurityAlertModal component', () => {
    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onReviewRubric: vi.fn(),
        violatedRules: ['Rule 1', 'Rule 2']
    };

    it('renders modal when isOpen is true', () => {
        render(<SecurityAlertModal {...mockProps} />);
        expect(screen.getByTestId('security-alert-modal')).toBeInTheDocument();
        expect(screen.getByText('Unsafe Code Detected')).toBeInTheDocument();
    });

    it('renders all violated rules', () => {
        render(<SecurityAlertModal {...mockProps} />);
        expect(screen.getByText('Rule 1')).toBeInTheDocument();
        expect(screen.getByText('Rule 2')).toBeInTheDocument();
    });

    it('calls onReviewRubric when button is clicked', () => {
        render(<SecurityAlertModal {...mockProps} />);
        fireEvent.click(screen.getByText('Review Safety Rubric'));
        expect(mockProps.onReviewRubric).toHaveBeenCalled();
    });

    it('calls onClose when Acknowledge button is clicked', () => {
        render(<SecurityAlertModal {...mockProps} />);
        fireEvent.click(screen.getByText('Acknowledge & Close'));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
        render(<SecurityAlertModal {...mockProps} isOpen={false} />);
        expect(screen.queryByTestId('security-alert-modal')).not.toBeInTheDocument();
    });
});
