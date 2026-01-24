import { describe, it, expect } from 'vitest';
import { calculateCinematicSpeed, getCameraOffset } from '../lib-web/camera';

describe('Cinematic Logic (Phase 6)', () => {
    describe('calculateCinematicSpeed', () => {
        it('returns slow-mo speed (0.2x) when reward is negative', () => {
            expect(calculateCinematicSpeed(-10)).toBe(0.2);
            expect(calculateCinematicSpeed(-1)).toBe(0.2);
        });

        it('returns turbo speed (1.5x) when reward is high and positive', () => {
            expect(calculateCinematicSpeed(50)).toBe(1.5);
        });

        it('returns normal speed (0.5x) for standard positive rewards', () => {
            expect(calculateCinematicSpeed(10)).toBe(0.5);
        });
    });

    describe('getCameraOffset', () => {
        it('returns a dynamic offset based on progress to show "twists"', () => {
            const offsetAtStart = getCameraOffset(0);
            const offsetLater = getCameraOffset(0.5);

            // Should not be the same to simulate "turns"
            expect(offsetAtStart).not.toEqual(offsetLater);
            expect(offsetAtStart.z).toBeGreaterThan(5);
        });
    });
});
