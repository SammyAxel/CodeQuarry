import React, { useState, useRef } from 'react';
import { ChevronLeft, Plus, X, Info, Sparkles, Gem, Zap, AlertTriangle } from 'lucide-react';
import { MODULE_TYPES, DIFFICULTY_LEVELS, PROGRAMMING_LANGUAGES, COURSE_TIERS, VALIDATION } from '../constants/courseConstants';

export const ModuleFormEditor = ({ module, onSave, onCancel }) => {
  const textareaRef = useRef(null);
  const [data, setData] = useState(module);
  const [hintInput, setHintInput] = useState('');
  const [requiredCodeInput, setRequiredCodeInput] = useState('');
  const [refineryEnabled, setRefineryEnabled] = useState(!!module.refineryChallenges);
  const [refineryNewChallenge, setRefineryNewChallenge] = useState({
    title: '',
    description: '',
    maxLines: 0,
    difficulty: 'Easy',
    baseGems: 50,
    noNestedLoops: false,
    requireComments: false
  });
  const [practiceTestInput, setPracticeTestInput] = useState('');
  const [practiceTestExpected, setPracticeTestExpected] = useState('');
  const [practiceTestPublic, setPracticeTestPublic] = useState(true);
  const [refineryNewTest, setRefineryNewTest] = useState({ input: '', expectedOutput: '', public: true });
  const [refineryNewPattern, setRefineryNewPattern] = useState({ name: '', regex: '', message: '', type: 'forbidden' });

  // Parse steps from instruction to show how many step requirements are needed
  const parseSteps = (instruction) => {
    if (!instruction) return [];
    const stepMatches = instruction.match(/Step \d+:[^]*?(?=Step \d+:|$)/g);
    return (stepMatches || []).map(step => step.replace('Step ', '').trim());
  };

  const parsedSteps = parseSteps(data.instruction);

  // Required code handlers
  const handleAddRequiredCode = () => {
    if (requiredCodeInput.trim()) {
      setData({
        ...data,
        requiredCode: [...(data.requiredCode || []), requiredCodeInput.trim()]
      });
      setRequiredCodeInput('');
    }
  };

  const handleRemoveRequiredCode = (index) => {
    setData({
      ...data,
      requiredCode: (data.requiredCode || []).filter((_, i) => i !== index)
    });
  };

  // Step requirements handlers
  const handleStepRequirementChange = (stepIndex, requirementIndex, value) => {
    const newStepRequirements = [...(data.stepRequirements || [])];
    if (!newStepRequirements[stepIndex]) {
      newStepRequirements[stepIndex] = [];
    }
    newStepRequirements[stepIndex][requirementIndex] = value;
    setData({ ...data, stepRequirements: newStepRequirements });
  };

  const handleAddStepRequirement = (stepIndex) => {
    const newStepRequirements = [...(data.stepRequirements || [])];
    if (!newStepRequirements[stepIndex]) {
      newStepRequirements[stepIndex] = [];
    }
    newStepRequirements[stepIndex].push('');
    setData({ ...data, stepRequirements: newStepRequirements });
  };

  const handleRemoveStepRequirement = (stepIndex, requirementIndex) => {
    const newStepRequirements = [...(data.stepRequirements || [])];
    newStepRequirements[stepIndex] = newStepRequirements[stepIndex].filter((_, i) => i !== requirementIndex);
    setData({ ...data, stepRequirements: newStepRequirements });
  };

  // Ensure we have empty arrays for each parsed step
  const ensureStepArrays = () => {
    const newStepRequirements = [...(data.stepRequirements || [])];
    while (newStepRequirements.length < parsedSteps.length) {
      newStepRequirements.push([]);
    }
    if (newStepRequirements.length !== (data.stepRequirements || []).length) {
      setData({ ...data, stepRequirements: newStepRequirements });
    }
  };

  // Call this when instruction changes
  React.useEffect(() => {
    ensureStepArrays();
  }, [data.instruction]);

  const handleAddHint = () => {
    if (hintInput.trim()) {
      setData({
        ...data,
        hints: [...(data.hints || []), hintInput]
      });
      setHintInput('');
    }
  };

  const handleRemoveHint = (index) => {
    setData({
      ...data,
      hints: data.hints.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black">Edit Module</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="font-bold mb-4 text-purple-400">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Module Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Module ID</label>
              <input
                type="text"
                value={data.id}
                onChange={(e) => setData({ ...data, id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              >
                {MODULE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Language</label>
              <select
                value={data.language || 'python'}
                onChange={(e) => setData({ ...data, language: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              >
                {PROGRAMMING_LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Difficulty</label>
              <select
                value={data.difficulty || 'easy'}
                onChange={(e) => setData({ ...data, difficulty: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Est. Time (mins)</label>
              <input
                type="number"
                min={VALIDATION.MIN_ESTIMATED_TIME}
                max={VALIDATION.MAX_ESTIMATED_TIME}
                value={data.estimatedTime || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= VALIDATION.MIN_ESTIMATED_TIME && val <= VALIDATION.MAX_ESTIMATED_TIME) {
                    setData({ ...data, estimatedTime: val });
                  }
                }}
                placeholder="e.g., 10"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Between {VALIDATION.MIN_ESTIMATED_TIME} and {VALIDATION.MAX_ESTIMATED_TIME} minutes</p>
            </div>
            {data.type === 'practice' && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Gem className="w-4 h-4" /> Gem Reward</label>
                <input
                  type="number"
                  min={VALIDATION.MIN_GEM_REWARD}
                  max={VALIDATION.MAX_GEM_REWARD}
                  value={data.gemReward || 10}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= VALIDATION.MIN_GEM_REWARD && val <= VALIDATION.MAX_GEM_REWARD) {
                      setData({ ...data, gemReward: val });
                    }
                  }}
                  placeholder="e.g., 10"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Between {VALIDATION.MIN_GEM_REWARD} and {VALIDATION.MAX_GEM_REWARD} gems</p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {data.type === 'practice' && (
          <>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-purple-400">Theory</h3>
              <textarea
                value={data.theory}
                onChange={(e) => setData({ ...data, theory: e.target.value })}
                placeholder="Markdown content for the theory/field guide tab"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-32 resize-none"
              />
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-purple-400">Instructions</h3>
              <textarea
                value={data.instruction}
                onChange={(e) => setData({ ...data, instruction: e.target.value })}
                placeholder="Step 1: ...\nStep 2: ...\nStep 3: ..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-24 resize-none"
              />
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-purple-400">Code Template</h3>
              <textarea
                value={data.initialCode}
                onChange={(e) => setData({ ...data, initialCode: e.target.value })}
                placeholder="Initial code template for students"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-4 text-purple-400">Test Cases</h3>
                <p className="text-gray-500 text-xs mb-3">Add one or more input → expected output test cases (visible or hidden).</p>

                <div className="space-y-2 mb-3">
                  {(data.tests || []).map((t, idx) => (
                    <div key={idx} className="bg-gray-800 p-3 rounded border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-300">
                          <div className="font-mono text-sm">Input:</div>
                          <pre className="text-sm text-white whitespace-pre-wrap">{t.input}</pre>
                        </div>
                        <div className="text-xs text-gray-300">
                          <div className="font-mono text-sm">Expected:</div>
                          <pre className="text-sm text-white whitespace-pre-wrap">{t.expectedOutput}</pre>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={t.public !== false}
                              onChange={(e) => {
                                const tests = [...(data.tests || [])];
                                tests[idx].public = e.target.checked;
                                setData({ ...data, tests });
                              }}
                              className="w-4 h-4"
                            />
                            <span>Public</span>
                          </label>
                          <button
                            onClick={() => {
                              const tests = [...(data.tests || [])];
                              tests.splice(idx, 1);
                              setData({ ...data, tests });
                            }}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea
                    value={practiceTestInput}
                    onChange={(e) => setPracticeTestInput(e.target.value)}
                    placeholder="Test input (each line is a new line for the program)"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm h-20 font-mono"
                  />
                  <input
                    type="text"
                    value={practiceTestExpected}
                    onChange={(e) => setPracticeTestExpected(e.target.value)}
                    placeholder="Expected output (exact match)"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={practiceTestPublic}
                        onChange={(e) => setPracticeTestPublic(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-300">Public</span>
                    </label>
                    <button
                      onClick={() => {
                        if ((practiceTestExpected || '').trim().length > 0) {
                          const tests = [...(data.tests || [])];
                          tests.push({ input: practiceTestInput, expectedOutput: practiceTestExpected, public: practiceTestPublic });
                          setData({ ...data, tests });
                          setPracticeTestInput('');
                          setPracticeTestExpected('');
                          setPracticeTestPublic(true);
                        }
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold text-sm transition-colors"
                    >
                      Add Test
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-4 text-purple-400">Required Code Snippets</h3>
                <p className="text-gray-500 text-xs mb-3">
                  Add code snippets that must be present in the student's solution.
                </p>
                
                {/* List of required code snippets */}
                <div className="space-y-2 mb-3">
                  {(data.requiredCode || []).map((code, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                      <code className="flex-1 text-green-400 text-sm font-mono">{code}</code>
                      <button
                        onClick={() => handleRemoveRequiredCode(idx)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={requiredCodeInput}
                    onChange={(e) => setRequiredCodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRequiredCode()}
                    placeholder='e.g., print("Hello")'
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={handleAddRequiredCode}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step Requirements - Code snippets required for each step */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-purple-400">Step Requirements</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    Define what code must be present for each step to be marked complete.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded">
                  <Info className="w-3 h-3" />
                  {parsedSteps.length} steps detected
                </div>
              </div>
              
              {/* Helpful tip */}
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-xs font-bold mb-1">💡 Tip: Use partial matches!</p>
                <p className="text-yellow-300/70 text-xs">
                  Use <code className="bg-black/30 px-1 rounded">console.log(</code> instead of <code className="bg-black/30 px-1 rounded">console.log()</code> — 
                  this way it matches even when there's content inside the parentheses.
                </p>
              </div>

              {/* Step-by-step requirements */}
              <div className="space-y-4">
                {parsedSteps.map((step, stepIdx) => (
                  <div key={stepIdx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                        {stepIdx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Step {stepIdx + 1}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {step.split(':').slice(1).join(':').trim().substring(0, 60)}
                        </p>
                      </div>
                    </div>

                    {/* Requirements for this step */}
                    <div className="pl-9 space-y-2">
                      <p className="text-xs text-gray-500 mb-2">Code that must be present:</p>
                      
                      {((data.stepRequirements || [])[stepIdx] || []).map((req, reqIdx) => (
                        <div key={reqIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => handleStepRequirementChange(stepIdx, reqIdx, e.target.value)}
                            placeholder='e.g., console.log('
                            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-green-400 font-mono text-sm"
                          />
                          <button
                            onClick={() => handleRemoveStepRequirement(stepIdx, reqIdx)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => handleAddStepRequirement(stepIdx)}
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add requirement
                      </button>
                    </div>
                  </div>
                ))}

                {parsedSteps.length === 0 && (
                  <div className="text-center py-6 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                    <p className="text-sm">No steps detected in instructions.</p>
                    <p className="text-xs mt-1">
                      Format your instructions as "Step 1: ...", "Step 2: ..." to enable step tracking.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hints */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-purple-400">Hints</h3>
              <div className="space-y-3">
                {data.hints && data.hints.map((hint, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-gray-800 p-3 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-yellow-300 mb-1">Hint {idx + 1}</p>
                      <p className="text-gray-300">{hint}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveHint(idx)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={hintInput}
                  onChange={(e) => setHintInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddHint()}
                  placeholder="Add a new hint..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
                <button
                  onClick={handleAddHint}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Solution */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-purple-400">Solution</h3>
              <textarea
                value={data.solution || ''}
                onChange={(e) => setData({ ...data, solution: e.target.value })}
                placeholder="Complete working solution code"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono h-24 resize-none"
              />
            </div>

            {/* The Refinery Challenge */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-purple-400">The Refinery (Optional)</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={refineryEnabled}
                    onChange={(e) => {
                      setRefineryEnabled(e.target.checked);
                      if (!e.target.checked) {
                        setData({ ...data, refineryChallenges: undefined });
                      } else {
                        setData({ ...data, refineryChallenges: [] });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-400">Enable Refinery Challenge</span>
                </label>
              </div>

              {refineryEnabled && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-gray-300 flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        Define multiple challenge objectives for students after completing this module.
                        Each challenge can test optimization for length, performance, or clarity.
                      </span>
                    </p>
                  </div>

                  {/* Refinery Challenges List */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">
                      Refinery Objectives
                    </label>
                    
                    {/* List of defined challenges */}
                    <div className="space-y-3 mb-4">
                      {(data.refineryChallenges || []).map((challenge, idx) => (
                        <div key={idx} className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-bold text-white">{challenge.title}</div>
                              <div className="text-xs text-gray-400 mt-1">{challenge.description}</div>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="text-yellow-400 flex items-center gap-1">
                                  <Gem className="w-3 h-3" /> {challenge.baseGems} gems
                                </span>
                                {challenge.maxLines && (
                                  <span className="text-blue-400">Max {challenge.maxLines} lines</span>
                                )}
                                {challenge.forbiddenPatterns && challenge.forbiddenPatterns.length > 0 && (
                                  <span className="text-red-400">Forbidden patterns: {challenge.forbiddenPatterns.length}</span>
                                )}
                                {challenge.requiredPatterns && challenge.requiredPatterns.length > 0 && (
                                  <span className="text-green-400">Required patterns: {challenge.requiredPatterns.length}</span>
                                )}
                              </div>

                              {/* Tests */}
                              {(challenge.tests || []).length > 0 && (
                                <div className="mt-3 text-xs text-gray-300">
                                  <div className="font-bold mb-1">Tests</div>
                                  <div className="space-y-1">
                                    {challenge.tests.map((t, ti) => (
                                      <div key={ti} className="flex items-start gap-3">
                                        <div className="flex-1">
                                          <div className="text-xs text-white font-mono">Input: {t.input || '(none)'}</div>
                                          <div className="text-xs text-gray-300 font-mono">Expected: {t.expectedOutput}</div>
                                        </div>
                                        <div className="text-xs text-gray-400">{t.public !== false ? 'Public' : 'Hidden'}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const challenges = [...(data.refineryChallenges || [])];
                                challenges.splice(idx, 1);
                                setData({ ...data, refineryChallenges: challenges });
                              }}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Add test to existing challenge */}
                          <div className="mt-2 bg-gray-800/30 border border-gray-700 rounded p-3 space-y-3">
                            <div>
                              <label className="text-xs font-bold text-gray-400 mb-1 block">Add Test</label>
                              <textarea
                                value={refineryNewTest.input}
                                onChange={(e) => setRefineryNewTest({ ...refineryNewTest, input: e.target.value })}
                                placeholder="Test input (each line is a new line)"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm h-16 font-mono resize-none"
                              />
                              <input
                                type="text"
                                value={refineryNewTest.expectedOutput}
                                onChange={(e) => setRefineryNewTest({ ...refineryNewTest, expectedOutput: e.target.value })}
                                placeholder="Expected output (exact match)"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm mt-2"
                              />

                              <div className="flex items-center gap-3 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={refineryNewTest.public}
                                    onChange={(e) => setRefineryNewTest({ ...refineryNewTest, public: e.target.checked })}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-gray-300">Public</span>
                                </label>

                                <button
                                  onClick={() => {
                                    if (refineryNewTest.expectedOutput.trim().length > 0) {
                                      const challenges = [...(data.refineryChallenges || [])];
                                      const ch = challenges[idx] || {};
                                      ch.tests = ch.tests || [];
                                      ch.tests.push({ ...refineryNewTest });
                                      challenges[idx] = ch;
                                      setData({ ...data, refineryChallenges: challenges });
                                      setRefineryNewTest({ input: '', expectedOutput: '', public: true });
                                    }
                                  }}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold"
                                >
                                  Add Test
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-gray-400 mb-1 block">Add Forbidden / Required Pattern</label>
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={refineryNewPattern.name}
                                  onChange={(e) => setRefineryNewPattern({ ...refineryNewPattern, name: e.target.value })}
                                  placeholder="Pattern name"
                                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                                />
                                <input
                                  type="text"
                                  value={refineryNewPattern.regex}
                                  onChange={(e) => setRefineryNewPattern({ ...refineryNewPattern, regex: e.target.value })}
                                  placeholder="Regex (e.g., while\s*\()"
                                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono"
                                />
                                <input
                                  type="text"
                                  value={refineryNewPattern.message}
                                  onChange={(e) => setRefineryNewPattern({ ...refineryNewPattern, message: e.target.value })}
                                  placeholder="Message"
                                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    if (refineryNewPattern.name && refineryNewPattern.regex) {
                                      const challenges = [...(data.refineryChallenges || [])];
                                      const ch = challenges[idx] || {};
                                      ch.forbiddenPatterns = ch.forbiddenPatterns || [];
                                      ch.forbiddenPatterns.push({ ...refineryNewPattern });
                                      challenges[idx] = ch;
                                      setData({ ...data, refineryChallenges: challenges });
                                      setRefineryNewPattern({ name: '', regex: '', message: '', type: 'forbidden' });
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm font-bold"
                                >
                                  Add Forbidden
                                </button>

                                <button
                                  onClick={() => {
                                    if (refineryNewPattern.name && refineryNewPattern.regex) {
                                      const challenges = [...(data.refineryChallenges || [])];
                                      const ch = challenges[idx] || {};
                                      ch.requiredPatterns = ch.requiredPatterns || [];
                                      ch.requiredPatterns.push({ ...refineryNewPattern });
                                      challenges[idx] = ch;
                                      setData({ ...data, refineryChallenges: challenges });
                                      setRefineryNewPattern({ name: '', regex: '', message: '', type: 'required' });
                                    }
                                  }}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-bold"
                                >
                                  Add Required
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add new challenge */}
                    <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-bold text-gray-300">Add New Objective</h4>
                      
                      <input
                        type="text"
                        value={refineryNewChallenge.title}
                        onChange={(e) => setRefineryNewChallenge({ ...refineryNewChallenge, title: e.target.value })}
                        placeholder="e.g., Optimize for Length"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                      />
                      
                      <textarea
                        value={refineryNewChallenge.description}
                        onChange={(e) => setRefineryNewChallenge({ ...refineryNewChallenge, description: e.target.value })}
                        placeholder="Describe the challenge for students..."
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm h-16 resize-none"
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-400 mb-1 block">Max Lines</label>
                          <input
                            type="number"
                            value={refineryNewChallenge.maxLines}
                            onChange={(e) => setRefineryNewChallenge({ ...refineryNewChallenge, maxLines: parseInt(e.target.value) || 0 })}
                            placeholder="Leave blank for no limit"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-400 mb-1 block">Difficulty</label>
                          <select
                            value={refineryNewChallenge.difficulty}
                            onChange={(e) => setRefineryNewChallenge({ ...refineryNewChallenge, difficulty: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-400 mb-1 block flex items-center gap-1">
                            <Gem className="w-3 h-3" /> Base Gems
                          </label>
                          <input
                            type="number"
                            value={refineryNewChallenge.baseGems}
                            onChange={(e) => setRefineryNewChallenge({ ...refineryNewChallenge, baseGems: parseInt(e.target.value) || 50 })}
                            placeholder="e.g., 50"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={refineryNewChallenge.noNestedLoops}
                            onChange={(e) => setRefineryNewChallenge({ ...refineryNewChallenge, noNestedLoops: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">No Nested Loops</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={refineryNewChallenge.requireComments}
                            onChange={(e) => setRefineryNewChallenge({ ...refineryNewChallenge, requireComments: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">Require Comments</span>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          if (refineryNewChallenge.title && refineryNewChallenge.description) {
                            const challenges = [...(data.refineryChallenges || [])];
                            challenges.push({
                              id: `challenge-${Date.now()}`,
                              icon: '⚡',
                              ...refineryNewChallenge
                            });
                            setData({ ...data, refineryChallenges: challenges });
                            setRefineryNewChallenge({
                              title: '',
                              description: '',
                              maxLines: 0,
                              difficulty: 'Easy',
                              baseGems: 50,
                              noNestedLoops: false,
                              requireComments: false
                            });
                          }
                        }}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold text-sm transition-colors"
                      >
                        Add Objective
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {data.type === 'article' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-purple-400">Article Content</h3>
              <div className="text-xs text-gray-500">Markdown format</div>
            </div>
            
            {/* Markdown Toolbar */}
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => insertMarkdown('## ', ' (Heading)')}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                title="Heading"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**')}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*')}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors italic"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('`', '`')}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors font-mono"
                title="Code"
              >
                {'<>'}
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('- ', '')}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                title="List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('```javascript\n', '\n```')}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                title="Code Block"
              >
                {'<code>'}
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('[', '](url)')}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                title="Link"
              >
                🔗
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={data.content}
              onChange={(e) => setData({ ...data, content: e.target.value })}
              placeholder="Use markdown formatting. Click the buttons above for help."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-48 resize-none font-mono text-sm"
            />
          </div>
        )}

        {data.type === 'video' && (
          <div className="space-y-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-purple-400">Video URL</h3>
              <input
                type="text"
                value={data.videoUrl || ''}
                onChange={(e) => setData({ ...data, videoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-4 text-purple-400">Duration</h3>
                <input
                  type="text"
                  value={data.duration || ''}
                  onChange={(e) => setData({ ...data, duration: e.target.value })}
                  placeholder="5:00"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-4 text-purple-400">Description</h3>
                <textarea
                  value={data.description || ''}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-20 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Clean up empty step requirements
              const cleanedStepRequirements = (data.stepRequirements || [])
                .map(reqs => (reqs || []).filter(r => r && r.trim()))
                .filter((reqs, idx) => idx < parsedSteps.length || reqs.length > 0);
              
              // Migrate expectedOutput -> tests for practice modules
              const migratedData = { ...data };
              if (migratedData.type === 'practice') {
                if ((!migratedData.tests || migratedData.tests.length === 0) && migratedData.expectedOutput) {
                  migratedData.tests = [{ input: '', expectedOutput: migratedData.expectedOutput, public: true }];
                }
                // Remove old field
                delete migratedData.expectedOutput;
              }

              // Migrate legacy refineryCriteria into refineryChallenges if present
              if (!migratedData.refineryChallenges && migratedData.refineryCriteria) {
                migratedData.refineryChallenges = [ {
                  id: `migrated-${Date.now()}`,
                  title: 'Refinery',
                  description: migratedData.refineryCriteria.description || 'Optimize this solution',
                  baseGems: migratedData.refineryCriteria.bonusGems || 50,
                  maxLines: migratedData.refineryCriteria.maxLines,
                  forbiddenPatterns: migratedData.refineryCriteria.forbiddenPatterns || [],
                  requiredPatterns: migratedData.refineryCriteria.requiredPatterns || []
                } ];
                delete migratedData.refineryCriteria;
              }

              const savedData = {
                ...migratedData,
                requiredCode: (migratedData.requiredCode || []).filter(c => c && c.trim()),
                stepRequirements: cleanedStepRequirements.length > 0 ? cleanedStepRequirements : undefined,
                // Remove legacy regex fields if using new format
                requiredSyntax: undefined,
                stepSyntax: undefined
              };
              onSave(savedData);
            }}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
          >
            Save Module
          </button>
        </div>
      </div>
    </div>
  );
};
