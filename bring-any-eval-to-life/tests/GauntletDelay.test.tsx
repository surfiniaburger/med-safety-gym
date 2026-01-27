import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { GauntletView } from '../components/Gauntlet/GauntletView';

// Mock Three.js/Fiber components to avoid Canvas issues in JSDOM
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
    useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
    OrbitControls: () => null,
    PerspectiveCamera: () => null,
    Text: () => null,
    Sphere: () => null,
    Trail: () => null,
    Line: () => null,
    ContactShadows: () => null,
}));

describe('GauntletView Delay Logic', () => {
    const defaultProps = {
        rewards: [-50, 20, 30], // First node is a failure
        activeStepIndex: 0,
        solvedNodes: [],
        onIntervene: vi.fn(),
        onActiveStepChange: vi.fn(),
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does NOT display the "Hallucination Detected" modal immediately during warmup', () => {
        render(<GauntletView {...defaultProps} />);
        
        // Initially, it should be in WARMUP_ENTRY state
        expect(screen.queryByText(/Hallucination Detected/i)).toBeNull();
    });

    it('displays the "Hallucination Detected" modal after the warmup animation completes', () => {
        render(<GauntletView {...defaultProps} />);
        
        // Advance timers to 6.5 seconds (TRAJECTORY_ACTIVE)
        act(() => {
            vi.advanceTimersByTime(6500);
        });

        expect(screen.getByText(/Hallucination Detected/i)).toBeDefined();
    });
});
