/**
 * ClassroomInteraction - Quiz / Code Editor / Poll during live session
 * Shown when instructor triggers an interactive activity
 */

import React, { useState } from 'react';
import { CheckCircle2, Code2, HelpCircle, BarChart3, X, Send } from 'lucide-react';

export function ClassroomInteraction({ interaction, onSubmit, isAdmin, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [codeValue, setCodeValue] = useState(interaction?.payload?.starterCode || '');
  const [submitted, setSubmitted] = useState(false);

  if (!interaction) return null;

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null) return;
    onSubmit(interaction.id, { answer: selectedAnswer });
    setSubmitted(true);
  };

  const handleSubmitCode = () => {
    if (!codeValue.trim()) return;
    onSubmit(interaction.id, { code: codeValue });
    setSubmitted(true);
  };

  const handleSubmitPoll = () => {
    if (selectedAnswer === null) return;
    onSubmit(interaction.id, { vote: selectedAnswer });
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {interaction.type === 'quiz' && <HelpCircle className="w-4 h-4 text-blue-400" />}
          {interaction.type === 'code_editor' && <Code2 className="w-4 h-4 text-green-400" />}
          {interaction.type === 'poll' && <BarChart3 className="w-4 h-4 text-amber-400" />}
          <span className="text-sm font-bold capitalize">{interaction.type.replace('_', ' ')}</span>
        </div>
        {isAdmin && (
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 text-xs font-bold flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Close
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {submitted && !isAdmin ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
            <div className="text-green-400 font-bold">Response submitted!</div>
            <div className="text-gray-500 text-sm mt-1">Waiting for instructor...</div>
          </div>
        ) : (
          <>
            {/* Question / Prompt */}
            {interaction.payload?.question && (
              <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-sm text-white font-medium">{interaction.payload.question}</div>
              </div>
            )}

            {/* Quiz: Multiple Choice */}
            {interaction.type === 'quiz' && interaction.payload?.options && (
              <div className="space-y-2">
                {interaction.payload.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => !isAdmin && setSelectedAnswer(idx)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                      selectedAnswer === idx
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-gray-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                ))}
                {!isAdmin && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === null}
                    className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Answer
                  </button>
                )}
              </div>
            )}

            {/* Code Editor */}
            {interaction.type === 'code_editor' && (
              <div className="space-y-3">
                {interaction.payload?.instructions && (
                  <div className="text-xs text-gray-400">{interaction.payload.instructions}</div>
                )}
                <textarea
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  readOnly={isAdmin}
                  className="w-full h-48 bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm font-mono text-green-300 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
                {!isAdmin && (
                  <button
                    onClick={handleSubmitCode}
                    disabled={!codeValue.trim()}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Code
                  </button>
                )}
              </div>
            )}

            {/* Poll */}
            {interaction.type === 'poll' && interaction.payload?.options && (
              <div className="space-y-2">
                {interaction.payload.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => !isAdmin && setSelectedAnswer(idx)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                      selectedAnswer === idx
                        ? 'bg-amber-600/30 border-amber-500 text-white'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
                {!isAdmin && (
                  <button
                    onClick={handleSubmitPoll}
                    disabled={selectedAnswer === null}
                    className="w-full mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Vote
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
