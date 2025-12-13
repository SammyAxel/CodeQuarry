/**
 * PracticeTutorial Component
 * Interactive tutorial for the practice page
 * Shows new users how to use Field Guide and Bounty buttons
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, FileCode, ChevronRight, X } from 'lucide-react';

export const PracticeTutorial = ({ 
  isOpen, 
  onClose, 
  module = {},
  onTabChange = null
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Auto-animate the mascot based on step
    setIsAnimating(true);
  }, [currentStep]);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Practice Mode! 🎯",
      message: "Let me show you how to master this challenge.",
      description: "You're about to complete an interactive coding challenge. Don't worry—this is where you learn by doing!"
    },
    {
      title: "Your Field Guide 📖",
      message: "Click the 📖 icon to read the theory and examples. This is your reference manual!",
      description: "The Field Guide contains all the concepts and code snippets you need to understand the problem.",
      tabToOpen: 'theory'
    },
    {
      title: "Your Bounty 🎁",
      message: "Click the 📝 icon to see your tasks. Complete all the steps to earn rewards!",
      description: "The Bounty shows all the steps you need to complete. Each checkmark means you're getting closer!",
      tabToOpen: 'tasks'
    },
    {
      title: "Your Workspace 💻",
      message: "Write your solution here. Test it with the Play button for instant feedback.",
      description: "Start coding when you're ready. The system will automatically check your work as you go!"
    },
    {
      title: "Pro Tips 💡",
      message: "💭 Stuck? Check the hints! 🔄 Try different solutions! ⚡ Each step builds on the last.",
      description: "Remember: learning to code is a journey. Take your time, and don't be afraid to experiment!"
    },
    {
      title: "Ready to Begin! 🚀",
      message: "You're all set. Go show this challenge who's boss!",
      description: "You can dismiss this tutorial anytime. Happy coding!",
      isFinal: true
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Open the appropriate tab if specified
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

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Semi-transparent dark overlay - clickable to close */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto cursor-pointer ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Tutorial Card - Floating at center/bottom for better visibility */}
      <div className="fixed inset-0 flex items-end md:items-center justify-center pointer-events-auto z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-purple-500 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Step title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-8">
            {step.title}
          </h3>

          {/* Step description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {step.description}
          </p>

          {/* Progress indicator */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx <= currentStep
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Step {currentStep + 1} of {steps.length}
          </p>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              {step.isFinal ? 'Start! 🎉' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dismiss link */}
          <button
            onClick={onClose}
            className="w-full mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            I got it, let me code! ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeTutorial;
