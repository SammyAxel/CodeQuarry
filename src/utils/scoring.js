/**
 * Scoring utilities for refinement challenges
 * - correctnessPercent: 0-100 (from test runs)
 * - constraints: constraint pass fraction (constraintsPassed / totalConstraints)
 * We weight correctness higher by default
 */

export const calculateFinalScore = ({ correctnessPercent = 100, refineryScore = 100, constraintsPassed = 0, totalConstraints = 0, weights = { correctness: 0.7, constraints: 0.3 } }) => {
  // If there are no constraints, the constraints factor is neutral
  const constraintFrac = totalConstraints > 0 ? constraintsPassed / totalConstraints : 1;

  // If there are tests (correctnessPercent differs from 100), prioritize that
  const correctness = correctnessPercent;

  // Combined score: correctness weighted + constraints-weighted * 100
  const combined = Math.round((weights.correctness * correctness) + (weights.constraints * constraintFrac * 100));

  // If no tests existed and refineryScore is provided, mix in refinery computed score
  if (typeof correctnessPercent === 'number' && correctnessPercent === 100 && refineryScore !== undefined) {
    // Mix refineryScore (0.5 weight) with combined
    const final = Math.round((combined * 0.5) + (refineryScore * 0.5));
    return Math.max(0, Math.min(100, final));
  }

  return Math.max(0, Math.min(100, combined));
};

export const gemsForScore = (score, baseGems = 50) => {
  if (score >= 95) return baseGems;
  if (score >= 85) return Math.floor(baseGems * 0.8);
  if (score >= 75) return Math.floor(baseGems * 0.6);
  if (score >= 65) return Math.floor(baseGems * 0.4);
  if (score >= 50) return Math.floor(baseGems * 0.2);
  return Math.floor(baseGems * 0.05);
};

export default { calculateFinalScore, gemsForScore };
/**
 * Scoring utilities for refinery/practice challenges
 */

export const computeFinalScore = ({ correctnessPercent = 100, constraintScore = 100, weights = { correctness: 0.7, constraints: 0.3 } }) => {
  const wC = weights.correctness ?? 0.7;
  const wR = weights.constraints ?? 0.3;
  const final = Math.round((correctnessPercent * wC) + (constraintScore * wR));
  return Math.max(0, Math.min(100, final));
};

export const computeGemReward = (score, baseGems) => {
  if (score >= 95) return baseGems;
  if (score >= 85) return Math.floor(baseGems * 0.85);
  if (score >= 75) return Math.floor(baseGems * 0.65);
  if (score >= 65) return Math.floor(baseGems * 0.4);
  if (score >= 50) return Math.floor(baseGems * 0.2);
  return Math.floor(baseGems * 0.05);
};