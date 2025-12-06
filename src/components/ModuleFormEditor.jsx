import React, { useState } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';

export const ModuleFormEditor = ({ module, onSave, onCancel }) => {
  const [data, setData] = useState(module);
  const [hintInput, setHintInput] = useState('');

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
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="font-bold mb-4 text-purple-400">Regex Syntax Check</h3>
                <input
                  type="text"
                  value={data.requiredSyntax || ''}
                  onChange={(e) => setData({ ...data, requiredSyntax: e.target.value })}
                  placeholder="e.g., /print\\s*\\(.*\\)/"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
                />
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
            onClick={() => onSave(data)}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
          >
            Save Module
          </button>
        </div>
      </div>
    </div>
  );
};
