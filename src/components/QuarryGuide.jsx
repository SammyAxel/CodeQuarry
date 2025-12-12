/**
 * QuarryGuide Component
 * An animated mascot character that guides users through tutorials
 * Features fun personality, expressions, and helpful tips
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Lightbulb } from 'lucide-react';

export const QuarryGuide = ({ 
  message = "Hey! I'm Quarry, your learning guide!", 
  expression = 'happy', // 'happy', 'thinking', 'excited', 'warning', 'helpful'
  position = 'bottom-right', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  size = 'medium', // 'small', 'medium', 'large'
  showArrow = false,
  arrowDirection = 'up', // 'up', 'down', 'left', 'right'
  isAnimated = true,
  onDismiss = null,
  showContinue = false,
  onContinue = null,
  backgroundColor = 'from-purple-600 via-blue-600 to-cyan-500'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [blink, setBlink] = useState(false);

  // Blinking animation
  useEffect(() => {
    if (!isAnimated) return;
    const interval = setInterval(() => setBlink(b => !b), 3000);
    return () => clearInterval(interval);
  }, [isAnimated]);

  if (!isVisible) return null;

  // Size classes
  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  // Expression details
  const expressions = {
    happy: {
      eyes: '◕ ◕',
      mouth: 'ᴗ',
      emoji: '😊',
      color: 'text-yellow-300'
    },
    thinking: {
      eyes: '◉ ◉',
      mouth: '·',
      emoji: '🤔',
      color: 'text-blue-300'
    },
    excited: {
      eyes: '◉ ◉',
      mouth: 'O',
      emoji: '🤩',
      color: 'text-pink-300'
    },
    warning: {
      eyes: '⚠ ⚠',
      mouth: '▬',
      emoji: '⚠️',
      color: 'text-red-300'
    },
    helpful: {
      eyes: '◕ ◕',
      mouth: '✓',
      emoji: '💡',
      color: 'text-cyan-300'
    }
  };

  const exp = expressions[expression] || expressions.happy;

  // Position classes
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  // Arrow direction styles
  const arrowClasses = {
    up: 'bottom-full left-1/2 -translate-x-1/2 mb-2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent',
    down: 'top-full left-1/2 -translate-x-1/2 mt-2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40 ${isAnimated ? 'animate-bounce' : ''}`}>
      {/* Arrow indicator */}
      {showArrow && (
        <div className={`${arrowClasses[arrowDirection]} border-purple-500 absolute`} />
      )}

      {/* Mascot Container */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${backgroundColor} rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden border-4 border-white/30 backdrop-blur-sm`}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />

        {/* Eyes */}
        <div className="absolute top-6 left-0 right-0 flex justify-center gap-8 text-3xl font-bold">
          <span className={`${blink && isAnimated ? 'line-through' : ''}`}>●</span>
          <span className={`${blink && isAnimated ? 'line-through' : ''}`}>●</span>
        </div>

        {/* Face/Expression in center */}
        <div className="text-6xl">{exp.emoji}</div>

        {/* Bottom indicator light */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>

      {/* Speech Bubble */}
      {message && (
        <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 max-w-xs border-2 border-purple-500/50 relative">
          {/* Bubble pointer */}
          <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-900" />
          
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {showContinue && onContinue && (
              <button
                onClick={onContinue}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all hover:scale-105"
              >
                Got it! →
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  onDismiss?.();
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sparkle effects */}
      {isAnimated && (
        <>
          <div className="absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }}>
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="absolute -bottom-1 -left-1 animate-pulse">
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
        </>
      )}
    </div>
  );
};

export default QuarryGuide;
