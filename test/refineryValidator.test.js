import { describe, it, expect } from 'vitest';
import { validateRefinery } from '../src/utils/refineryValidator.js';

describe('validateRefinery', () => {
  it('detects maxLines violations and counts constraints', () => {
    const code = `console.log(1)\nconsole.log(2)\nconsole.log(3)`;
    const res = validateRefinery(code, 'javascript', { maxLines: 2 });
    expect(res.passed).toBe(false);
    expect(res.metrics.lineCount).toBe(3);
    expect(res.totalConstraints).toBeGreaterThanOrEqual(1);
    expect(res.constraintsPassed).toBe(0);
  });

  it('passes when patterns satisfy requirements', () => {
    const code = `const arr = [1,2,3]\nconst squares = arr.map(x => x*x)\nconsole.log(squares)`;
    const res = validateRefinery(code, 'javascript', { requiredPatterns: [{ name: 'map', regex: 'map\\s*\\(' }] });
    expect(res.passed).toBe(true);
    expect(res.constraintsPassed).toBeGreaterThanOrEqual(1);
  });
});
