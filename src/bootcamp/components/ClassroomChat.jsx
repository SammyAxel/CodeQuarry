/**
 * ClassroomChat - Live chat during bootcamp sessions
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';

export function ClassroomChat({ messages, onSend, onTyping, typingUsers, currentUserId }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Debounced typing indicator
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping?.(), 500);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            Chat messages will appear here
          </div>
        )}
        {messages.map((msg, i) => {
          const isOwn = String(msg.userId) === String(currentUserId);
          const isInstructor = msg.role === 'admin';
          return (
            <div key={i} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[11px] font-bold ${isInstructor ? 'text-amber-400' : 'text-gray-500'}`}>
                  {isOwn ? 'You' : msg.username}
                  {isInstructor && !isOwn && ' (Instructor)'}
                </span>
                <span className="text-[10px] text-gray-600">{formatTime(msg.timestamp)}</span>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-sm max-w-[85%] break-words ${
                isOwn 
                  ? 'bg-purple-600/30 text-purple-100 rounded-br-sm' 
                  : isInstructor
                    ? 'bg-amber-500/15 text-amber-100 rounded-bl-sm border border-amber-500/20'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-3 py-1 text-[11px] text-gray-500">
          {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
