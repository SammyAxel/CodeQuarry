/**
 * ResponsesPanel - Shows host real-time student responses for activities
 * Displays quiz answers, code submissions with output, and poll votes
 */

import React, { useState, useEffect, useRef } from 'react';
import { Users, Code2, CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

export function ResponsesPanel({ responses, activeInteraction }) {
  const [expandedResponse, setExpandedResponse] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new responses arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responses.length]);

  if (!activeInteraction && responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Users className="w-10 h-10 text-gray-600 mb-3" />
        <div className="text-gray-500 font-bold text-sm">No active activity</div>
        <div className="text-gray-600 text-xs mt-1">Trigger a quiz, code challenge, or poll to see responses here</div>
      </div>
    );
  }

  // Summary stats
  const totalResponses = responses.length;
  const uniqueUsers = new Set(responses.map(r => r.userId)).size;

  return (
    <div className="flex flex-col h-full">
      {/* Header with stats */}
      <div className="p-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Student Responses</span>
          <span className="text-xs text-gray-500">{uniqueUsers} student{uniqueUsers !== 1 ? 's' : ''}</span>
        </div>
        {activeInteraction && (
          <div className="text-[10px] text-gray-500 truncate">
            {activeInteraction.type === 'quiz' ? 'Quiz' : activeInteraction.type === 'code_editor' ? 'Code Challenge' : 'Poll'}
            {': '}{activeInteraction.payload?.question || 'Untitled'}
          </div>
        )}
      </div>

      {/* Responses list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {responses.length === 0 ? (
          <div className="text-center text-gray-600 text-xs py-6">Waiting for student responses...</div>
        ) : (
          responses.map((resp, idx) => (
            <ResponseCard
              key={`${resp.userId}-${resp.timestamp}-${idx}`}
              response={resp}
              interaction={activeInteraction}
              isExpanded={expandedResponse === idx}
              onToggle={() => setExpandedResponse(expandedResponse === idx ? null : idx)}
            />
          ))
        )}
      </div>

      {/* Footer summary */}
      {totalResponses > 0 && activeInteraction?.type === 'quiz' && (
        <QuizSummary responses={responses} interaction={activeInteraction} />
      )}
      {totalResponses > 0 && activeInteraction?.type === 'poll' && (
        <PollSummary responses={responses} interaction={activeInteraction} />
      )}
    </div>
  );
}

function ResponseCard({ response, interaction, isExpanded, onToggle }) {
  const { username, response: resp, timestamp } = response;
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const type = interaction?.type;

  // Quiz response
  if (type === 'quiz') {
    const answerIdx = resp?.answer;
    const correctIdx = interaction?.payload?.correctAnswer;
    const isCorrect = answerIdx === correctIdx;
    const answerText = interaction?.payload?.options?.[answerIdx];

    return (
      <div className={`px-3 py-2 rounded-lg border text-xs ${
        isCorrect ? 'bg-green-900/20 border-green-800/40' : 'bg-red-900/20 border-red-800/40'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            )}
            <span className="font-bold text-gray-200">{username}</span>
          </div>
          <span className="text-gray-600">{time}</span>
        </div>
        <div className={`mt-1 ml-5.5 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {String.fromCharCode(65 + answerIdx)}. {answerText || 'Unknown'}
        </div>
      </div>
    );
  }

  // Code response
  if (type === 'code_editor') {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg text-xs">
        <button
          onClick={onToggle}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700/50 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <span className="font-bold text-gray-200">{username}</span>
            {resp?.language && (
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{resp.language}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">{time}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
          </div>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            {/* Student code */}
            <div className="bg-gray-950 rounded-lg p-2 max-h-36 overflow-y-auto">
              <pre className="font-mono text-[11px] text-green-300 whitespace-pre-wrap">{resp?.code || 'No code'}</pre>
            </div>
            {/* Student output */}
            {(resp?.output || resp?.error) && (
              <div className="bg-gray-950 rounded-lg p-2 max-h-24 overflow-y-auto border-l-2 border-amber-500/50">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Output</div>
                {resp.output && (
                  <pre className="font-mono text-[11px] text-gray-300 whitespace-pre-wrap">{resp.output}</pre>
                )}
                {resp.error && (
                  <pre className="font-mono text-[11px] text-red-400 whitespace-pre-wrap">{resp.error}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Poll response
  if (type === 'poll') {
    const voteIdx = resp?.vote;
    const voteText = interaction?.payload?.options?.[voteIdx];
    return (
      <div className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-gray-200">{username}</span>
          </div>
          <span className="text-gray-600">{time}</span>
        </div>
        <div className="mt-1 ml-5.5 text-amber-300">{voteText || `Option ${voteIdx + 1}`}</div>
      </div>
    );
  }

  // Generic
  return (
    <div className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs">
      <span className="font-bold text-gray-200">{username}</span>
      <span className="text-gray-600 ml-2">{time}</span>
    </div>
  );
}

function QuizSummary({ responses, interaction }) {
  const options = interaction?.payload?.options || [];
  const correctIdx = interaction?.payload?.correctAnswer;
  const counts = {};
  options.forEach((_, i) => { counts[i] = 0; });
  responses.forEach(r => {
    const idx = r.response?.answer;
    if (idx !== undefined) counts[idx] = (counts[idx] || 0) + 1;
  });
  const total = responses.length;
  const correctCount = counts[correctIdx] || 0;

  return (
    <div className="p-3 border-t border-gray-800 shrink-0 space-y-1">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
        Results — {correctCount}/{total} correct ({total > 0 ? Math.round(correctCount / total * 100) : 0}%)
      </div>
      {options.map((opt, i) => {
        const pct = total > 0 ? Math.round((counts[i] || 0) / total * 100) : 0;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className={`w-5 text-right ${i === correctIdx ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
              {String.fromCharCode(65 + i)}
            </span>
            <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${i === correctIdx ? 'bg-green-500' : 'bg-gray-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-gray-500 w-8 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function PollSummary({ responses, interaction }) {
  const options = interaction?.payload?.options || [];
  const counts = {};
  options.forEach((_, i) => { counts[i] = 0; });
  responses.forEach(r => {
    const idx = r.response?.vote;
    if (idx !== undefined) counts[idx] = (counts[idx] || 0) + 1;
  });
  const total = responses.length;

  return (
    <div className="p-3 border-t border-gray-800 shrink-0 space-y-1">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
        Poll Results — {total} vote{total !== 1 ? 's' : ''}
      </div>
      {options.map((opt, i) => {
        const pct = total > 0 ? Math.round((counts[i] || 0) / total * 100) : 0;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 truncate max-w-[80px]" title={opt}>{opt}</span>
            <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-gray-500 w-8 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
