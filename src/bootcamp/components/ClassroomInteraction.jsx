/**
 * ClassroomInteraction - Quiz / Code Editor / Poll during live session
 * Code editor is fully functional with language selection and execution via Piston API
 */

import React, { useState, useCallback } from 'react';
import { CheckCircle2, Code2, HelpCircle, BarChart3, X, Send, Play, Loader2, ChevronDown } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'php', label: 'PHP' },
];

export function ClassroomInteraction({ interaction, onSubmit, isAdmin, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [codeValue, setCodeValue] = useState(interaction?.payload?.starterCode || '');
  const [selectedLanguage, setSelectedLanguage] = useState(interaction?.payload?.language || 'javascript');
  const [codeOutput, setCodeOutput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  if (!interaction) return null;

  const handleRunCode = useCallback(async () => {
    if (!codeValue.trim() || isRunning) return;
    setIsRunning(true);
    setCodeOutput('');
    setCodeError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/v1/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeValue, language: selectedLanguage })
      });

      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.error || 'Execution failed');
      } else {
        setCodeOutput(data.output || '');
        if (data.stderr) setCodeError(data.stderr);
      }
    } catch (err) {
      setCodeError(err.message || 'Failed to reach execution server');
    } finally {
      setIsRunning(false);
    }
  }, [codeValue, selectedLanguage, isRunning]);

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null) return;
    onSubmit(interaction.id, { answer: selectedAnswer });
    setSubmitted(true);
  };

  const handleSubmitCode = () => {
    if (!codeValue.trim()) return;
    onSubmit(interaction.id, {
      code: codeValue,
      language: selectedLanguage,
      output: codeOutput,
      error: codeError
    });
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
      <div className="p-3 border-b border-gray-800 flex items-center justify-between shrink-0">
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
              <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
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

            {/* Code Editor - FULLY FUNCTIONAL */}
            {interaction.type === 'code_editor' && (
              <div className="space-y-2">
                {interaction.payload?.instructions && (
                  <div className="text-xs text-gray-400 mb-2">{interaction.payload.instructions}</div>
                )}

                {/* Language selector */}
                <div className="relative">
                  <button
                    onClick={() => !isAdmin && setShowLangDropdown(!showLangDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs font-bold text-gray-300 hover:border-gray-600 transition-colors"
                  >
                    {SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.label || selectedLanguage}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showLangDropdown && (
                    <div className="absolute top-full mt-1 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => { setSelectedLanguage(lang.id); setShowLangDropdown(false); }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 transition-colors ${
                            selectedLanguage === lang.id ? 'text-purple-400 font-bold' : 'text-gray-300'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Code textarea */}
                <textarea
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  readOnly={isAdmin}
                  className="w-full h-40 bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm font-mono text-green-300 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />

                {/* Run + Submit buttons */}
                {!isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning || !codeValue.trim()}
                      className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isRunning ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                      ) : (
                        <><Play className="w-3.5 h-3.5" /> Run Code</>
                      )}
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={!codeValue.trim()}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit
                    </button>
                  </div>
                )}

                {/* Output panel */}
                {(codeOutput || codeError) && (
                  <div className="bg-gray-950 border border-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Output</div>
                    {codeOutput && (
                      <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{codeOutput}</pre>
                    )}
                    {codeError && (
                      <pre className="text-xs font-mono text-red-400 whitespace-pre-wrap mt-1">{codeError}</pre>
                    )}
                  </div>
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
