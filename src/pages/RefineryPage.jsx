/**
 * Refinery Page
 * Full-page optimization challenge system
 * Users attempt admin-defined challenges to earn gem rewards
 */

import React, { useState } from 'react';
import {
  ChevronLeft, Sparkles, Gem, AlertCircle, CheckCircle2, Award, RefreshCw
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { useCodeEngine } from '../hooks/useCodeEngine';
import { validateRefinery, getRefineryRank } from '../utils/refineryValidator';
import { calculateFinalScore, gemsForScore } from '../utils/scoring';

export const RefineryPage = ({ courseId, module, onClose, navProps }) => {
  const [code, setCode] = useState(module.solution || module.initialCode || '');
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [attemptResults, setAttemptResults] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);

  const { output, isEngineLoading, engineError, runCode, initializeEngines } = useCodeEngine(module);

  // Use admin-defined challenges from module, or fallback to default
  const challenges = module.refineryChallenges && module.refineryChallenges.length > 0 
    ? module.refineryChallenges 
    : [
        {
          id: 'default',
          title: 'Optimize for Length',
          description: 'Reduce your code to the minimum viable lines',
          icon: '📏',
          difficulty: 'Easy',
          baseGems: 50,
          criteria: { maxLines: 10, type: 'lineCount' }
        }
      ];

  const currentChallenge = challenges[activeChallenge] || challenges[0];

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const calculateGemReward = (score, baseGems) => {
    if (score >= 95) return baseGems;
    if (score >= 85) return Math.floor(baseGems * 0.8);
    if (score >= 75) return Math.floor(baseGems * 0.6);
    if (score >= 65) return Math.floor(baseGems * 0.4);
    if (score >= 50) return Math.floor(baseGems * 0.2);
    return Math.floor(baseGems * 0.05);
  };

  const handleAttemptRefinery = async () => {
    // Run tests first (from challenge.tests or module.tests)
    const tests = currentChallenge.tests || module.tests || [];
    let testResults = { success: true, testResults: [] };

    if (Array.isArray(tests) && tests.length > 0) {
      // Run tests through engine without showing messages
      const execResult = await runCode(code, false, tests);
      testResults = execResult || testResults;
    }

    // If tests exist and not all passed, compute correctness-based score
    const totalTests = (testResults.testResults || []).length;
    const passedTests = (testResults.testResults || []).filter(t => t.passed).length;
    const correctnessPercent = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;

    // Validate constraints (maxLines, patterns) regardless
    const criteria = { ...currentChallenge };
    const validation = validateRefinery(code, module.language, criteria);

    // Determine final score combining correctness (primary) and constraints (secondary)
    const finalScore = calculateFinalScore({ correctnessPercent, refineryScore: validation.score, constraintsPassed: validation.constraintsPassed || 0, totalConstraints: validation.totalConstraints || 0 });
    const passed = totalTests > 0 ? (passedTests === totalTests) && validation.passed : validation.passed;

    const rank = getRefineryRank(finalScore);
    const gemsEarned = gemsForScore(finalScore, currentChallenge.baseGems);

    const result = {
      id: Date.now(),
      challengeId: currentChallenge.id,
      challengeTitle: currentChallenge.title,
      score: finalScore,
      rank: rank.name,
      metrics: { ...validation.metrics, tests: testResults.testResults || [] },
      gemsEarned,
      passed,
      timestamp: new Date().toLocaleString(),
      code
    };

    setAttemptResults([result, ...attemptResults]);
    setCurrentAttempt(result);

    // Save to backend if authenticated
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
            score: result.score,
            rank: result.rank,
            metrics: result.metrics,
            gemsEarned: result.gemsEarned,
            challengeType: activeChallenge
          })
        });
      }
    } catch (err) {
      console.error('Failed to save refinery attempt:', err);
    }
  };

  const bestResult = attemptResults.length > 0
    ? attemptResults.reduce((best, current) => current.score > best.score ? current : best)
    : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117]">
      {/* Header */}
      <div className="h-20 bg-gradient-to-r from-[#0d1117] via-purple-950/30 to-[#0d1117] backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-purple-900/30 rounded-lg transition-all"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-purple-400 font-semibold uppercase tracking-widest">The Refinery</div>
            <div className="text-lg font-bold text-white">{module.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {bestResult && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
              <Gem className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold">{bestResult.score.toFixed(1)}</span>
              <span className="text-yellow-300 text-xs">Best: {bestResult.rank}</span>
            </div>
          )}
          <button
            onClick={initializeEngines}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Challenge Selection */}
        <div className="w-80 bg-[#010409] border-r border-gray-800 overflow-y-auto p-6 space-y-4">
          <h3 className="text-purple-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Available Challenges
          </h3>

          <div className="space-y-2">
            {challenges.map((challenge, idx) => (
              <button
                key={challenge.id}
                onClick={() => {
                  setActiveChallenge(idx);
                  setCurrentAttempt(null);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  activeChallenge === idx
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{challenge.icon || '⚡'}</span>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{challenge.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{challenge.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        challenge.difficulty === 'Easy' ? 'bg-green-900/30 text-green-300' :
                        challenge.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-red-900/30 text-red-300'
                      }`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <Gem className="w-3 h-3" /> {challenge.baseGems}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Attempt History */}
          {attemptResults.length > 0 && (
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-3">
                Attempt History
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attemptResults.map(result => (
                  <div
                    key={result.id}
                    className="p-3 rounded bg-gray-900/50 border border-gray-700 text-xs cursor-pointer hover:bg-gray-900 transition-colors"
                    onClick={() => setCurrentAttempt(result)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{result.challengeTitle}</span>
                      <span className="text-yellow-400 font-bold">{result.score.toFixed(1)}</span>
                    </div>
                    <div className="text-gray-400">{result.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Code Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                code={code}
                onChange={handleCodeChange}
                language={module.language || 'javascript'}
                theme="dark"
              />
            </div>

            {/* Run Button */}
            <div className="h-16 bg-gray-900 border-t border-gray-800 px-6 flex items-center justify-between">
              <button
                onClick={handleAttemptRefinery}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" /> Refine Code
              </button>
              <div className="text-sm text-gray-400">
                Submit your code to earn gems
              </div>
            </div>
          </div>

          {/* Results Panel */}
          {currentAttempt && (
            <div className="h-64 bg-gray-950 border-t border-gray-800 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Score Display */}
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    Result: <span className="text-2xl">{currentAttempt.rank}</span>
                  </h4>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold flex items-center gap-1 justify-end">
                      <Gem className="w-4 h-4" /> +{currentAttempt.gemsEarned}
                    </div>
                    <div className="text-sm text-gray-400">{currentAttempt.score.toFixed(1)}/100</div>
                  </div>
                </div>

                {/* Metrics */}
                {currentAttempt.metrics && (
                  <div className="bg-gray-900/50 border border-gray-700 rounded p-3 space-y-2">
                    {currentAttempt.metrics.tests && currentAttempt.metrics.tests.length > 0 ? (
                      <div>
                        <div className="font-bold text-sm text-white mb-2">Test Results</div>
                        <div className="space-y-2">
                          {currentAttempt.metrics.tests.map((t, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex-1">
                                <div className="text-xs text-gray-300">Input: <span className="font-mono text-white">{t.input || '(none)'}</span></div>
                                <div className="text-xs text-gray-300">Expected: <span className="font-mono text-white">{t.expected}</span></div>
                              </div>
                              <div className={`text-sm font-bold ${t.passed ? 'text-green-300' : 'text-yellow-300'}`}>
                                {t.passed ? 'Passed' : 'Failed'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      Object.entries(currentAttempt.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-400">{key}:</span>
                          <span className="text-white font-mono">{value}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Status */}
                {currentAttempt.passed ? (
                  <div className="flex items-center gap-2 text-green-300 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Challenge passed! Great optimization!
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Challenge not quite met. Try again!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefineryPage;
