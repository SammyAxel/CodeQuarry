/**
 * The Refinery - Code Optimization Validator
 * Checks code quality metrics for "refining" challenges
 */

/**
 * Validates code against optimization criteria
 * @param {string} code - The user's code
 * @param {string} language - Programming language
 * @param {Object} criteria - Optimization criteria
 * @returns {Object} - { passed: boolean, metrics: {}, feedback: [] }
 */
export const validateRefinery = (code, language, criteria) => {
  const metrics = calculateMetrics(code, language);
  const feedback = [];
  let passed = true;

  // Check line count
  if (criteria.maxLines && metrics.lineCount > criteria.maxLines) {
    passed = false;
    feedback.push({
      type: 'lines',
      message: `Too many lines! Goal: ${criteria.maxLines} or less, Your code: ${metrics.lineCount} lines`,
      icon: '📏',
      severity: 'error'
    });
  } else if (criteria.maxLines) {
    feedback.push({
      type: 'lines',
      message: `✓ Line count optimized (${metrics.lineCount}/${criteria.maxLines})`,
      icon: '✨',
      severity: 'success'
    });
  }

  // Check for nested loops
  if (criteria.noNestedLoops && metrics.hasNestedLoops) {
    passed = false;
    feedback.push({
      type: 'loops',
      message: 'Nested loops detected! Try a different approach.',
      icon: '🔄',
      severity: 'error'
    });
  } else if (criteria.noNestedLoops) {
    feedback.push({
      type: 'loops',
      message: '✓ No nested loops - efficient!',
      icon: '⚡',
      severity: 'success'
    });
  }

  // Check for specific patterns to avoid
  if (criteria.forbiddenPatterns) {
    criteria.forbiddenPatterns.forEach(pattern => {
      if (new RegExp(pattern.regex, pattern.flags || 'g').test(code)) {
        passed = false;
        feedback.push({
          type: 'pattern',
          message: pattern.message || `Avoid using: ${pattern.name}`,
          icon: '🚫',
          severity: 'warning'
        });
      }
    });
  }

  // Check for required patterns (good practices)
  if (criteria.requiredPatterns) {
    criteria.requiredPatterns.forEach(pattern => {
      if (!new RegExp(pattern.regex, pattern.flags || 'g').test(code)) {
        passed = false;
        feedback.push({
          type: 'pattern',
          message: pattern.message || `Try using: ${pattern.name}`,
          icon: '💡',
          severity: 'hint'
        });
      }
    });
  }

  // Check complexity
  if (criteria.maxComplexity && metrics.cyclomaticComplexity > criteria.maxComplexity) {
    passed = false;
    feedback.push({
      type: 'complexity',
      message: `Code is too complex! Simplify your logic. (Complexity: ${metrics.cyclomaticComplexity})`,
      icon: '🧩',
      severity: 'error'
    });
  }

  // Check for comments (optional challenge)
  if (criteria.requireComments && metrics.commentCount === 0) {
    feedback.push({
      type: 'comments',
      message: 'Add comments to explain your optimizations! (Optional)',
      icon: '💬',
      severity: 'hint'
    });
  }

  return {
    passed,
    metrics,
    feedback,
    score: calculateRefineryScore(metrics, criteria, passed)
  };
};

/**
 * Calculate code metrics
 */
const calculateMetrics = (code, language) => {
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  
  return {
    lineCount: nonEmptyLines.length,
    totalLines: lines.length,
    hasNestedLoops: detectNestedLoops(code, language),
    cyclomaticComplexity: calculateComplexity(code, language),
    commentCount: countComments(code, language),
    characterCount: code.length
  };
};

/**
 * Detect nested loops
 */
const detectNestedLoops = (code, language) => {
  const patterns = {
    python: /for\s+.*:\s*[\s\S]*?for\s+.*:/,
    javascript: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/,
    c: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/
  };

  const pattern = patterns[language];
  return pattern ? pattern.test(code) : false;
};

/**
 * Calculate cyclomatic complexity (simplified)
 */
const calculateComplexity = (code, language) => {
  let complexity = 1;

  const decisionKeywords = {
    python: ['if', 'elif', 'for', 'while', 'and', 'or', 'except'],
    javascript: ['if', 'else if', 'for', 'while', '&&', '||', 'catch', 'case'],
    c: ['if', 'else if', 'for', 'while', '&&', '||', 'case']
  };

  const keywords = decisionKeywords[language] || [];
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
};

/**
 * Count comments
 */
const countComments = (code, language) => {
  const patterns = {
    python: /#.*/g,
    javascript: /\/\/.*|\/\*[\s\S]*?\*\//g,
    c: /\/\/.*|\/\*[\s\S]*?\*\//g
  };

  const pattern = patterns[language];
  if (!pattern) return 0;

  const matches = code.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * Calculate refinery score (0-100)
 */
const calculateRefineryScore = (metrics, criteria, passed) => {
  if (!passed) return 0;

  let score = 100;

  // Deduct points for each line over the bare minimum
  if (criteria.maxLines) {
    const idealLines = Math.max(1, Math.floor(criteria.maxLines * 0.7)); // 70% of max is ideal
    if (metrics.lineCount > idealLines) {
      const penalty = (metrics.lineCount - idealLines) * 5;
      score -= Math.min(penalty, 30);
    }
  }

  // Bonus for comments
  if (metrics.commentCount > 0) {
    score += Math.min(metrics.commentCount * 2, 10);
  }

  // Bonus for low complexity
  if (metrics.cyclomaticComplexity <= 3) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.floor(score)));
};

/**
 * Get refinery rank based on score
 */
export const getRefineryRank = (score) => {
  if (score >= 95) return { name: 'Diamond', emoji: '💎', color: '#60A5FA' };
  if (score >= 85) return { name: 'Ruby', emoji: '🔴', color: '#EF4444' };
  if (score >= 75) return { name: 'Emerald', emoji: '💚', color: '#10B981' };
  if (score >= 65) return { name: 'Sapphire', emoji: '🔵', color: '#3B82F6' };
  if (score >= 50) return { name: 'Amethyst', emoji: '💜', color: '#A855F7' };
  return { name: 'Quartz', emoji: '⚪', color: '#9CA3AF' };
};

/**
 * Example refinery challenges for different levels
 */
export const REFINERY_EXAMPLES = {
  beginner: {
    maxLines: 3,
    description: 'Solve it in 3 lines or less'
  },
  intermediate: {
    maxLines: 5,
    noNestedLoops: true,
    description: 'Use 5 lines max, no nested loops'
  },
  advanced: {
    maxLines: 4,
    noNestedLoops: true,
    maxComplexity: 5,
    requiredPatterns: [
      {
        name: 'list comprehension',
        regex: '\\[.*for.*in.*\\]',
        message: 'Try using list comprehension for cleaner code'
      }
    ],
    description: 'Master challenge: 4 lines, no nesting, use comprehension'
  }
};
