import React, { useState } from 'react';
import { ChevronLeft, Plus, X, Info } from 'lucide-react';

export const ModuleFormEditor = ({ module, onSave, onCancel }) => {
  // Convert legacy regex fields to string arrays for the new format
  const convertLegacyData = (mod) => {
    // Handle requiredCode - convert from regex or use existing array
    let requiredCode = mod.requiredCode || [];
    if (!requiredCode.length && mod.requiredSyntax) {
      // If there's a legacy regex, we can't auto-convert it
      // Just leave requiredCode empty and user can fill it in
      requiredCode = [];
    }
    
    // Handle stepRequirements - convert from stepSyntax or use existing
    let stepRequirements = mod.stepRequirements || [];
    if (!stepRequirements.length && mod.stepSyntax) {
      // Can't auto-convert regex, leave empty
      stepRequirements = [];
    }
    
    return {
      ...mod,
      requiredCode,
      stepRequirements
    };
  };
  
  const [data, setData] = useState(convertLegacyData(module));
  const [hintInput, setHintInput] = useState('');
  const [requiredCodeInput, setRequiredCodeInput] = useState('');

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
                <option>practice</option>
                <option>article</option>
                <option>video</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Language</label>
              <select
                value={data.language || 'python'}
                onChange={(e) => setData({ ...data, language: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              >
                <option>python</option>
                <option>javascript</option>
                <option>c</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Difficulty</label>
              <select
                value={data.difficulty || 'easy'}
                onChange={(e) => setData({ ...data, difficulty: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Est. Time (mins)</label>
              <input
                type="number"
                value={data.estimatedTime || ''}
                onChange={(e) => setData({ ...data, estimatedTime: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 10"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              />
            </div>
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
                <h3 className="font-bold mb-4 text-purple-400">Expected Output</h3>
                <input
                  type="text"
                  value={data.expectedOutput}
                  onChange={(e) => setData({ ...data, expectedOutput: e.target.value })}
                  placeholder="What should the output be?"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
                <p className="text-gray-500 text-xs mt-2">
                  The exact output the code should produce when run.
                </p>
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
          </>
        )}

        {data.type === 'article' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h3 className="font-bold mb-4 text-purple-400">Article Content</h3>
            <textarea
              value={data.content}
              onChange={(e) => setData({ ...data, content: e.target.value })}
              placeholder="HTML or Markdown content"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-48 resize-none font-mono"
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
              
              const savedData = {
                ...data,
                requiredCode: (data.requiredCode || []).filter(c => c && c.trim()),
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
