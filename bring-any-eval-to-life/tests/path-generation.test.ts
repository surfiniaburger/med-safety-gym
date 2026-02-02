import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

// We'll implement this in lib-web/path-generation.ts
export type PathGeometryType = 'linear' | 'wormhole' | 'spherical';

export const generatePathPoints = (rewards: number[], type: PathGeometryType, spacing: number = 3, yScale: number = 0.4): THREE.Vector3[] => {
    return rewards.map((r, i) => {
        if (type === 'wormhole') {
            const angle = (i / rewards.length) * Math.PI * 4; // 2 full rotations
            const radius = 5 + r * yScale;
            return new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                i * spacing
            );
        } else if (type === 'spherical') {
            const phi = Math.acos(-1 + (2 * i) / rewards.length);
            const theta = Math.sqrt(rewards.length * Math.PI) * phi;
            const radius = 20 + r * yScale;
            return new THREE.Vector3(
                radius * Math.cos(theta) * Math.sin(phi),
                radius * Math.sin(theta) * Math.sin(phi),
                radius * Math.cos(phi)
            );
        }
        // Default: Linear
        return new THREE.Vector3(i * spacing, r * yScale, 0);
    });
};

describe('Path Generation Logic', () => {
    const rewards = [10, -5, 20];

    it('generates a linear path by default', () => {
        const points = generatePathPoints(rewards, 'linear');
        expect(points[0].x).toBe(0);
        expect(points[1].x).toBe(3);
        expect(points[2].x).toBe(6);
        expect(points[0].z).toBe(0);
    });

    it('generates a wormhole path (spiral)', () => {
        const points = generatePathPoints(rewards, 'wormhole');
        // Should have varying X and Y based on sin/cos
        expect(points[0].x).toBeCloseTo(5 + 10 * 0.4); // radius * cos(0)
        expect(points[0].y).toBeCloseTo(0); // radius * sin(0)
        expect(points[1].z).toBe(3); // spacing
    });

    it('generates a spherical path', () => {
        const points = generatePathPoints(rewards, 'spherical');
        expect(points.length).toBe(3);
        // Check that points are not all on the same plane
        expect(points[0].z).not.toBe(points[1].z);
    });
});
