import React, { useState } from 'react';
import { X, Sparkles, Target, TrendingUp, Award, ChevronRight, RotateCcw, Gem, Zap, Layers } from 'lucide-react';
import { validateRefinery, getRefineryRank } from '../utils/refineryValidator';

/**
 * The Refinery Modal - Post-completion optimization challenge
 */
export const RefineryModal = ({ 
  module, 
  userCode, 
  onClose, 
  onAttempt,
  previousBest = null,
  courseId 
}) => {
  const [attempting, setAttempting] = useState(false);
  const [result, setResult] = useState(null);

  // Get refinery criteria from module (or use defaults)
  const criteria = module.refineryCriteria || {
    maxLines: Math.ceil(module.solution?.split('\n').length * 0.7),
    description: `Optimize your code to ${Math.ceil(module.solution?.split('\n').length * 0.7)} lines or less`
  };

  // Calculate gem rewards based on rank
  const calculateGemReward = (score) => {
    const baseBonus = criteria.bonusGems || 50;
    if (score >= 95) return baseBonus; // Diamond
    if (score >= 85) return Math.floor(baseBonus * 0.7); // Ruby
    if (score >= 75) return Math.floor(baseBonus * 0.5); // Emerald
    if (score >= 65) return Math.floor(baseBonus * 0.3); // Sapphire
    if (score >= 50) return Math.floor(baseBonus * 0.15); // Amethyst
    return Math.floor(baseBonus * 0.05); // Quartz
  };

  const handleAttemptRefinery = async () => {
    setAttempting(true);
    
    // Validate against refinery criteria
    const validation = validateRefinery(userCode, module.language, criteria);
    const rank = getRefineryRank(validation.score);
    const gemsEarned = validation.passed ? calculateGemReward(validation.score) : 0;
    
    setResult({ ...validation, rank, gemsEarned });
    
    // Save result if better than previous
    if (validation.passed && (!previousBest || validation.score > previousBest.score)) {
      const resultData = {
        score: validation.score,
        metrics: validation.metrics,
        rank: rank.name,
        gemsEarned,
        timestamp: Date.now()
      };
      
      onAttempt(resultData);
      
      // Save to backend
      try {
        const token = localStorage.getItem('userToken');
        if (token) {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/refinery/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-token': token
            },
            body: JSON.stringify({
              courseId,
              moduleId: module.id,
              score: validation.score,
              rank: rank.name,
              metrics: validation.metrics,
              gemsEarned
            })
          });
        }
      } catch (err) {
        console.error('Failed to save refinery progress:', err);
      }
    }
    
    setAttempting(false);
  };

  const rank = result ? getRefineryRank(result.score) : null;
  const isNewBest = result && result.passed && (!previousBest || result.score > previousBest.score);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm border-b border-purple-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-black text-white">The Refinery</h2>
              </div>
              <p className="text-gray-300 text-sm">
                Polish your code to earn a purer gem <Gem className="w-4 h-4 inline text-purple-400" />
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Challenge Description */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-1">Challenge</h3>
                <p className="text-gray-300 text-sm">{criteria.description}</p>
              </div>
            </div>
          </div>

          {/* Criteria List */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Optimization Goals
            </h4>
            <div className="space-y-2">
              {criteria.maxLines && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">📏</span>
                  <span className="text-gray-300">
                    Maximum {criteria.maxLines} lines of code
                  </span>
                </div>
              )}
              {criteria.noNestedLoops && (
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">
                    No nested loops allowed
                  </span>
                </div>
              )}
              {criteria.maxComplexity && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">🧩</span>
                  <span className="text-gray-300">
                    Keep code simple (complexity ≤ {criteria.maxComplexity})
                  </span>
                </div>
              )}
              {criteria.requiredPatterns && criteria.requiredPatterns.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">💡</span>
                  <span className="text-gray-300">
                    Use advanced techniques ({criteria.requiredPatterns[0].name})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Previous Best */}
          {previousBest && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-white">Your Best Score</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-yellow-400">
                    {previousBest.score}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getRefineryRank(previousBest.score).emoji} {getRefineryRank(previousBest.score).name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`border-2 rounded-xl p-6 ${
              result.passed 
                ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/50' 
                : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/50'
            }`}>
              {result.passed ? (
                <div className="space-y-4">
                  {/* Success Header */}
                  <div className="text-center">
                    <div className="text-6xl mb-2">{rank.emoji}</div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      {rank.name} Rank Achieved!
                    </h3>
                    <div className="text-4xl font-black" style={{ color: rank.color }}>
                      {result.score} / 100
                    </div>
                    {isNewBest && (
                      <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">New Personal Best!</span>
                      </div>
                    )}
                    {/* Gem Reward */}
                    {result.gemsEarned > 0 && (
                      <div className="mt-3 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50 rounded-xl">
                        <Gem className="w-6 h-6 text-purple-400" />
                        <div className="text-left">
                          <div className="text-lg font-black text-white">+{result.gemsEarned} Gems</div>
                          <div className="text-xs text-gray-300">Optimization Bonus</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{result.metrics.lineCount}</div>
                      <div className="text-xs text-gray-400">Lines Used</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{result.metrics.cyclomaticComplexity}</div>
                      <div className="text-xs text-gray-400">Complexity</div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    {result.feedback.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 text-sm p-2 rounded ${
                          item.severity === 'success' ? 'bg-green-500/10' :
                          item.severity === 'hint' ? 'bg-blue-500/10' :
                          'bg-gray-500/10'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-gray-300">{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Failure Header */}
                  <div className="text-center">
                    <div className="text-5xl mb-2">⛏️</div>
                    <h3 className="text-xl font-black text-white mb-2">
                      Keep Refining!
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Your code works, but needs optimization
                    </p>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    {result.feedback.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
                          item.severity === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                          item.severity === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                          'bg-blue-500/10 border border-blue-500/30'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-gray-300">{item.message}</span>
                      </div>
                    ))}
                  </div>

                  {/* Current Metrics */}
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2">Your Current Code:</div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-white font-bold">{result.metrics.lineCount}</span>
                        <span className="text-gray-400"> lines</span>
                      </div>
                      <div>
                        <span className="text-white font-bold">{result.metrics.cyclomaticComplexity}</span>
                        <span className="text-gray-400"> complexity</span>
                      </div>
                      {result.metrics.hasNestedLoops && (
                        <div className="text-yellow-400">⚠️ Nested loops</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!result ? (
              <button
                onClick={handleAttemptRefinery}
                disabled={attempting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-white transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                Refine Your Code
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
                >
                  {result.passed ? 'Claim Reward' : 'Back to Editor'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="text-sm text-gray-300">
                <span className="font-bold text-white">Tip:</span> Make changes to your code in the editor, then come back here to test your optimizations!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
