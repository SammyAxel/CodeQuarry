/**
 * InstructorControls - Admin toolbar for managing live bootcamp sessions
 * Trigger quizzes, code challenges, polls, and manage session lifecycle
 */

import React, { useState } from 'react';
import { 
  Play, Square, HelpCircle, Code2, BarChart3, 
  Plus, X, Send, Radio, AlertTriangle 
} from 'lucide-react';
import { goLive, endSession, triggerInteraction as apiTriggerInteraction, closeInteraction as apiCloseInteraction } from '../api/bootcampApi';

export function InstructorControls({ sessionId, session, setSession, triggerInteraction, closeInteraction, activeInteraction }) {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [interactionType, setInteractionType] = useState('quiz');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [codeInstructions, setCodeInstructions] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoLive = async () => {
    try {
      const updated = await goLive(sessionId);
      setSession(updated);
    } catch (err) {
      console.error('Failed to go live:', err);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('End this session? Students will be disconnected.')) return;
    try {
      const updated = await endSession(sessionId);
      setSession(updated);
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const handleTrigger = async () => {
    let payload = {};

    if (interactionType === 'quiz') {
      payload = {
        question,
        options: options.filter(o => o.trim()),
        correctAnswer
      };
    } else if (interactionType === 'code_editor') {
      payload = {
        question,
        instructions: codeInstructions,
        starterCode
      };
    } else if (interactionType === 'poll') {
      payload = {
        question,
        options: options.filter(o => o.trim())
      };
    }

    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      // Save to DB
      const interaction = await apiTriggerInteraction(sessionId, interactionType, payload);
      // Broadcast via WebSocket
      triggerInteraction({ ...interaction, payload });
      
      // Reset form
      setShowCreatePanel(false);
      setQuestion('');
      setOptions(['', '', '', '']);
      setStarterCode('');
      setCodeInstructions('');
    } catch (err) {
      console.error('Failed to trigger interaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseActiveInteraction = async () => {
    if (!activeInteraction) return;
    try {
      await apiCloseInteraction(activeInteraction.id);
      closeInteraction(activeInteraction.id);
    } catch (err) {
      console.error('Failed to close interaction:', err);
    }
  };

  return (
    <div className="shrink-0">
      {/* Toolbar */}
      <div className="bg-gray-900/80 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Instructor</span>
        <div className="w-px h-6 bg-gray-700"></div>

        {/* Session control */}
        {session?.status === 'scheduled' && (
          <button
            onClick={handleGoLive}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors"
          >
            <Radio className="w-3.5 h-3.5" /> Go Live
          </button>
        )}
        {session?.status === 'live' && (
          <button
            onClick={handleEndSession}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-red-600 rounded-lg text-xs font-bold transition-colors"
          >
            <Square className="w-3.5 h-3.5" /> End Session
          </button>
        )}

        <div className="w-px h-6 bg-gray-700"></div>

        {/* Trigger activities */}
        {activeInteraction ? (
          <button
            onClick={handleCloseActiveInteraction}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-red-600/30 text-amber-400 rounded-lg text-xs font-bold transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Close Active Activity
          </button>
        ) : (
          <button
            onClick={() => setShowCreatePanel(!showCreatePanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Trigger Activity
          </button>
        )}
      </div>

      {/* Create Interaction Panel */}
      {showCreatePanel && (
        <div className="mt-2 bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
          {/* Type selector */}
          <div className="flex gap-2">
            {[
              { key: 'quiz', icon: HelpCircle, label: 'Quiz', color: 'blue' },
              { key: 'code_editor', icon: Code2, label: 'Code', color: 'green' },
              { key: 'poll', icon: BarChart3, label: 'Poll', color: 'amber' }
            ].map(({ key, icon: Icon, label, color }) => (
              <button
                key={key}
                onClick={() => setInteractionType(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  interactionType === key
                    ? `bg-${color}-600/20 border-${color}-500 text-${color}-400`
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Question */}
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={interactionType === 'code_editor' ? 'Challenge title...' : 'Enter your question...'}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />

          {/* Quiz / Poll options */}
          {(interactionType === 'quiz' || interactionType === 'poll') && (
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {interactionType === 'quiz' && (
                    <button
                      onClick={() => setCorrectAnswer(idx)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        correctAnswer === idx ? 'border-green-400 bg-green-400/20' : 'border-gray-600'
                      }`}
                    >
                      {correctAnswer === idx && <span className="text-green-400 text-xs">✓</span>}
                    </button>
                  )}
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[idx] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Code editor fields */}
          {interactionType === 'code_editor' && (
            <>
              <textarea
                value={codeInstructions}
                onChange={(e) => setCodeInstructions(e.target.value)}
                placeholder="Instructions for students..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 h-16 resize-none"
              />
              <textarea
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                placeholder="// Starter code (optional)..."
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-green-300 placeholder-gray-600 focus:outline-none focus:border-purple-500 h-24 resize-none"
                spellCheck={false}
              />
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowCreatePanel(false)}
              className="px-3 py-1.5 text-gray-400 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTrigger}
              disabled={!question.trim() || isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-xs font-bold transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Sending...' : 'Send to Students'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
