import * as THREE from 'three';

/**
 * Calculates dynamic agent speed based on reward values.
 */
export const calculateCinematicSpeed = (reward: number): number => {
    if (reward < 0) return 0.2; // Slow-mo near danger
    if (reward > 40) return 1.5; // Turbo for high success
    return 0.5; // Standard speed
};

/**
 * Generates a camera offset relative to the agent position.
 * Uses a sine wave to create subtle "swerving" and twists.
 */
export const getCameraOffset = (progress: number): THREE.Vector3 => {
    // Phase 8: Adjust framing so Step 0 starts on the far left
    // We shift the X offset positively as we progress
    const xOffset = -8 + (progress * 0.5);
    const swerve = Math.sin(progress * 0.4) * 6;
    const vertical = Math.cos(progress * 0.2) * 3 + 6;

    // Roller coaster feel: Camera follows but also drifts
    return new THREE.Vector3(xOffset, vertical, 14 + swerve);
};
