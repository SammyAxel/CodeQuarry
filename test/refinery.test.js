import { describe, it, expect } from 'vitest';
import { validateRefinery } from '../src/utils/refineryValidator';
import { computeFinalScore, computeGemReward } from '../src/utils/scoring';

describe('refinery scoring', () => {
  it('validates maxLines and computes score', () => {
    const code = 'console.log(1)\nconsole.log(2)\nconsole.log(3)';
    const res = validateRefinery(code, 'javascript', { maxLines: 2 });
    expect(res.passed).toBe(false);
    expect(res.metrics.lineCount).toBe(3);
    expect(res.score).toBeGreaterThanOrEqual(0);
  });

  it('combines correctness and constraints into final score', () => {
    const final = computeFinalScore({ correctnessPercent: 80, constraintScore: 90 });
    // 0.7*80 + 0.3*90 = 56 + 27 = 83
    expect(final).toBe(83);
  });

  it('computes gem reward scaling', () => {
    expect(computeGemReward(96, 100)).toBe(100);
    expect(computeGemReward(86, 100)).toBe(Math.floor(100 * 0.85));
    expect(computeGemReward(30, 100)).toBe(Math.floor(100 * 0.05));
  });
});