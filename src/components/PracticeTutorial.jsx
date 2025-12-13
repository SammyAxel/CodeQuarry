/**
 * PracticeTutorial Component
 * Interactive tutorial for the practice page
 * Shows as a floating tooltip near relevant UI elements
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';

export const PracticeTutorial = ({ 
  isOpen, 
  onClose, 
  module = {},
  onTabChange = null
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
  const cardRef = useRef(null);

  const steps = [
    {
      title: "Welcome! 🎯",
      description: "You're about to complete an interactive coding challenge.",
      targetElement: null,
      position: 'center'
    },
    {
      title: "Field Guide 📖",
      description: "Click the 📖 icon to read theory and examples. This is your reference manual!",
      targetElement: 'field-guide-tab',
      position: 'right',
      tabToOpen: 'theory'
    },
    {
      title: "Bounty 🎁",
      description: "Click the 📝 icon to see your tasks. Complete them to earn rewards!",
      targetElement: 'bounty-tab',
      position: 'right',
      tabToOpen: 'tasks'
    },
    {
      title: "Code Editor 💻",
      description: "Write your solution here. Hit the Play button to test instantly.",
      targetElement: null,
      position: 'center'
    },
    {
      title: "Pro Tips 💡",
      description: "Stuck? Check hints. Try different solutions. Each step builds on the last!",
      targetElement: null,
      position: 'center'
    },
    {
      title: "Ready! 🚀",
      description: "You're all set. Go show this challenge who's boss!",
      targetElement: null,
      position: 'center',
      isFinal: true
    }
  ];

  const step = steps[currentStep];

  // Calculate card position based on target element
  useEffect(() => {
    if (!step.targetElement || !isOpen) {
      setCardPosition({ top: 0, left: 0 });
      return;
    }

    const timer = setTimeout(() => {
      const targetEl = document.getElementById(step.targetElement);
      if (targetEl && cardRef.current) {
        const targetRect = targetEl.getBoundingClientRect();
        const cardWidth = 320; // w-80 = 20rem = 320px
        const cardHeight = cardRef.current.offsetHeight;
        const gap = 16;
        const padding = 16;

        let top = 0;
        let left = 0;
        let position = 'right'; // default

        // Calculate available space in each direction
        const spaceRight = window.innerWidth - targetRect.right;
        const spaceLeft = targetRect.left;
        const spaceBelow = window.innerHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;

        // Decide position based on available space
        if (spaceRight >= cardWidth + gap) {
          // Position to the right
          position = 'right';
          left = targetRect.right + gap;
          top = Math.max(padding, Math.min(window.innerHeight - cardHeight - padding, targetRect.top + targetRect.height / 2 - cardHeight / 2));
        } else if (spaceLeft >= cardWidth + gap) {
          // Position to the left
          position = 'left';
          left = targetRect.left - cardWidth - gap;
          top = Math.max(padding, Math.min(window.innerHeight - cardHeight - padding, targetRect.top + targetRect.height / 2 - cardHeight / 2));
        } else if (spaceBelow >= cardHeight + gap) {
          // Position below
          position = 'below';
          top = targetRect.bottom + gap;
          left = Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, targetRect.left + targetRect.width / 2 - cardWidth / 2));
        } else if (spaceAbove >= cardHeight + gap) {
          // Position above
          position = 'above';
          top = targetRect.top - cardHeight - gap;
          left = Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, targetRect.left + targetRect.width / 2 - cardWidth / 2));
        } else {
          // Fallback: center on screen
          left = (window.innerWidth - cardWidth) / 2;
          top = (window.innerHeight - cardHeight) / 2;
        }

        setCardPosition({ top, left });

        // Highlight the target element
        targetEl.classList.add('ring-2', 'ring-yellow-400', 'ring-opacity-75');
        targetEl.style.position = 'relative';
        targetEl.style.zIndex = '40';

        return () => {
          targetEl.classList.remove('ring-2', 'ring-yellow-400', 'ring-opacity-75');
        };
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [step.targetElement, isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (steps[currentStep].tabToOpen && onTabChange) {
        onTabChange(steps[currentStep].tabToOpen);
      }
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Light overlay (non-blocking) */}
      <div 
        className="fixed inset-0 bg-black/20 pointer-events-auto z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Floating Tutorial Card */}
      <div 
        ref={cardRef}
        style={{ 
          position: 'fixed',
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
          zIndex: 45
        }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-purple-500 p-5 w-80 pointer-events-auto animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-6">
          {step.title}
        </h3>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Step {currentStep + 1} / {steps.length}
        </p>

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-1"
          >
            {step.isFinal ? 'Start!' : 'Next'} <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Skip link */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Skip Tutorial ✨
        </button>
      </div>
    </>
  );
};

export default PracticeTutorial;
