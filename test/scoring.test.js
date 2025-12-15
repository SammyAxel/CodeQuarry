import { describe, it, expect } from 'vitest';
import { calculateFinalScore, gemsForScore } from '../src/utils/scoring.js';

describe('scoring utilities', () => {
  it('calculates combined score with constraints', () => {
    const score = calculateFinalScore({ correctnessPercent: 80, constraintsPassed: 1, totalConstraints: 2 });
    // correctness 80 * 0.7 = 56, constraints 0.5*0.3*100=15 => 71
    expect(score).toBe(71);
  });

  it('mixes refinery score when no tests provided', () => {
    const score = calculateFinalScore({ correctnessPercent: 100, refineryScore: 80, constraintsPassed: 1, totalConstraints: 1 });
    // combined = 100*0.7 + 1*0.3*100 = 100; final mixes 100 and 80 => 90
    expect(score).toBe(90);
  });

  it('computes gem rewards', () => {
    expect(gemsForScore(96, 100)).toBe(100);
    expect(gemsForScore(86, 100)).toBe(80);
    expect(gemsForScore(76, 100)).toBe(60);
    expect(gemsForScore(66, 100)).toBe(40);
    expect(gemsForScore(51, 100)).toBe(20);
    expect(gemsForScore(10, 100)).toBe(5);
  });
});
