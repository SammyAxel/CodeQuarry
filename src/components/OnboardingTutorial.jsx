/**
 * Onboarding Tutorial Component
 * Interactive guide for new users
 * Shows step-by-step how to use CodeQuarry
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Award, Users, Code, MessageCircle } from 'lucide-react';

export const OnboardingTutorial = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '👋 Welcome to CodeQuarry!',
      description: 'Learn programming through interactive courses and challenges. Earn gems, unlock achievements, and compete with friends!',
      icon: <BookOpen className="w-12 h-12 text-purple-500" />,
      tips: ['Each course has multiple modules', 'Complete challenges to earn gems', 'Track your progress on the dashboard']
    },
    {
      title: '🎓 Browsing Courses',
      description: 'Click on "Home" to see all available courses. Each course teaches a different programming language.',
      icon: <Code className="w-12 h-12 text-blue-500" />,
      tips: ['Filter by difficulty: Easy, Medium, Hard', 'Courses are color-coded by language', 'Read the description before starting']
    },
    {
      title: '🚀 Starting a Module',
      description: 'Inside each course, you\'ll find modules (lessons). Click a module to start learning and practicing code.',
      icon: <Users className="w-12 h-12 text-green-500" />,
      tips: ['Read the article/video first to learn', 'Then solve the practice problem', 'Submit your code to check answers']
    },
    {
      title: '⭐ Earning Gems',
      description: 'Complete modules and challenges to earn gems. Gems are points you can use to unlock cosmetics and badges.',
      icon: <Award className="w-12 h-12 text-pink-500" />,
      tips: ['Harder challenges = more gems', 'Daily bonuses for consistent learning', 'No penalty for wrong answers!']
    },
    {
      title: '📊 Checking Your Progress',
      description: 'Visit your Profile to see all your achievements, collected cosmetics, and leaderboard rank.',
      icon: <MessageCircle className="w-12 h-12 text-orange-500" />,
      tips: ['Dark theme by default (switch in settings)', 'Light theme available if you prefer', 'Customize your profile with cosmetics']
    },
    {
      title: '💡 Tips for Success',
      description: 'Take your time with each module. It\'s okay to make mistakes—that\'s how you learn!',
      icon: <Code className="w-12 h-12 text-cyan-500" />,
      tips: ['Start with easier courses', 'Practice regularly for best results', 'Feel free to replay modules anytime']
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark tutorial as completed
      localStorage.setItem('tutorialCompleted', 'true');
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">CodeQuarry 101</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Icon and Title */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">{step.icon}</div>
            <h3 className="text-2xl font-bold text-center dark:text-white mb-3">{step.title}</h3>
            <p className="text-center text-gray-700 dark:text-gray-300 text-lg mb-6">{step.description}</p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">💡 Key Points:</h4>
            <ul className="space-y-2">
              {step.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-medium dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? 'bg-purple-600 w-8'
                      : idx < currentStep
                      ? 'bg-green-500 w-3'
                      : 'bg-gray-300 dark:bg-gray-700 w-3'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Navigation */}
        <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t dark:border-gray-700">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={() => {
              localStorage.setItem('tutorialCompleted', 'true');
              onClose();
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Skip Tutorial
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            {currentStep === steps.length - 1 ? (
              'Get Started'
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
