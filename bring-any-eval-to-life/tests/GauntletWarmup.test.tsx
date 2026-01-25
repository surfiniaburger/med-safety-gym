import { describe, it, expect } from 'vitest';
import { WARMUP_TARGET_X } from '../lib-web/gauntlet-constants';

describe('Gauntlet Warmup Configuration', () => {
    it('should have the warmup target centered at x=0', () => {
        expect(WARMUP_TARGET_X).toBe(0);
    });
});
