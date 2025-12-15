/**
 * Onboarding Tutorial Component
 * Interactive guide for new users
 * Shows step-by-step how to use CodeQuarry
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, Award, Users, Code, MessageCircle, HelpCircle } from 'lucide-react';
import { driver as Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const OnboardingTutorial = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '👋 Welcome to CodeQuarry!',
      description: 'Learn programming through interactive courses and challenges. Earn gems, unlock achievements, and compete with friends!',
      icon: <BookOpen className="w-12 h-12 text-purple-500" />,
      tips: ['Each course has multiple modules', 'Complete challenges to earn gems', 'Track your progress on the dashboard'],
      quarryMessage: "Hey! I'm Quarry, your learning guide! Welcome to CodeQuarry, where coding meets adventure! 🎮",
      quarryExpression: 'excited'
    },
    {
      title: '🎓 Browsing Courses',
      description: 'Click on "Home" to see all available courses. Each course teaches a different programming language.',
      icon: <Code className="w-12 h-12 text-blue-500" />,
      tips: ['Filter by difficulty: Easy, Medium, Hard', 'Courses are color-coded by language', 'Read the description before starting'],
      quarryMessage: "Each course is like a new mining site with different challenges. Pick one that excites you! ⛏️",
      quarryExpression: 'thinking'
    },
    {
      title: '🚀 Starting a Module',
      description: 'Inside each course, you\'ll find modules (lessons). Click a module to start learning and practicing code.',
      icon: <Users className="w-12 h-12 text-green-500" />,
      tips: ['Read the article/video first to learn', 'Then solve the practice problem', 'Submit your code to check answers'],
      quarryMessage: "Here's my favorite part! Each module has a theory section and hands-on practice. Learning by doing! 💡",
      quarryExpression: 'helpful'
    },
    {
      title: '⭐ Earning Gems',
      description: 'Complete modules and challenges to earn gems. Gems are points you can use to unlock cosmetics and badges.',
      icon: <Award className="w-12 h-12 text-pink-500" />,
      tips: ['Harder challenges = more gems', 'Daily bonuses for consistent learning', 'No penalty for wrong answers!'],
      quarryMessage: "Every successful solution earns you gems! These shiny rewards unlock special cosmetics. Nice loot! 💎",
      quarryExpression: 'happy'
    },
    {
      title: '📊 Checking Your Progress',
      description: 'Visit your Profile to see all your achievements, collected cosmetics, and leaderboard rank.',
      icon: <MessageCircle className="w-12 h-12 text-orange-500" />,
      tips: ['Dark theme by default (switch in settings)', 'Light theme available if you prefer', 'Customize your profile with cosmetics'],
      quarryMessage: "Want to show off? Check your profile and see your epic collection of achievements! 🏆",
      quarryExpression: 'happy'
    },
    {
      title: '💡 Tips for Success',
      description: 'Take your time with each module. It\'s okay to make mistakes—that\'s how you learn!',
      icon: <Code className="w-12 h-12 text-cyan-500" />,
      tips: ['Start with easier courses', 'Practice regularly for best results', 'Feel free to replay modules anytime'],
      quarryMessage: "Most importantly: have fun and don't rush! Every expert coder started exactly where you are. You've got this! 🚀",
      quarryExpression: 'excited'
    }
  ];

  const step = steps[currentStep];

  const driverRef = useRef(null);

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

  // Initialize driver.js guided tour when available
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    let pollTimer = null;
    const waitForSelectors = (selectors, timeout = 2000, interval = 100) => {
      const start = Date.now();
      return new Promise((resolve) => {
        const checker = () => {
          if (!mounted) return resolve(false);
          const allFound = selectors.every(sel => document.querySelector(sel));
          if (allFound) return resolve(true);
          if (Date.now() - start >= timeout) return resolve(false);
          pollTimer = window.setTimeout(checker, interval);
        };
        checker();
      });
    };

    try {
      driverRef.current = new Driver({
        allowClose: true,
        overlayClickNext: false,
        showProgress: true,
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Got it!',
        onNext: (_el, idx) => {
          if (idx === steps.length - 1) {
            localStorage.setItem('tutorialCompleted', 'true');
            driverRef.current && driverRef.current.destroy();
            driverRef.current = null;
            onClose();
          }
        },
        onDestroy: () => {
          localStorage.setItem('tutorialCompleted', 'true');
          driverRef.current = null;
          onClose();
        }
      });

      const driverSteps = [
        '#site-title',
        '#home-search',
        '.course-card',
        '#help-tutorial-btn'
      ];

      // Wait until the target elements exist in the DOM before starting the driver tour
      waitForSelectors(driverSteps, 2500, 100).then((ok) => {
        if (!mounted) return;
        if (ok && driverRef.current) {
          const formattedSteps = [
            { element: '#site-title', popover: { title: steps[0].title, description: steps[0].description } },
            { element: '#home-search', popover: { title: steps[1].title, description: steps[1].description } },
            { element: '.course-card', popover: { title: steps[2].title, description: steps[2].description } },
            { element: '#help-tutorial-btn', popover: { title: steps[5].title, description: steps[5].description, side: 'left' } },
          ];

          driverRef.current.setSteps(formattedSteps);
          try {
            driverRef.current.start();
            // Hide modal fallback while driver is active
            return;
          } catch (err) {
            console.warn('Driver failed to start after elements became available:', err);
          }
        }

        // If driver couldn't start, cleanup and leave the modal shown
        try { if (driverRef.current) driverRef.current.destroy(); } catch (err) {}
        driverRef.current = null;
      });
    } catch (e) {
      // If driver initialization fails (e.g., during SSR or missing elements), fall back to modal
      console.warn('Driver tour failed to initialize, falling back to modal.', e);
      try { if (driverRef.current) driverRef.current.destroy(); } catch (err) {}
      driverRef.current = null;
    }

    return () => {
      mounted = false;
      if (pollTimer) clearTimeout(pollTimer);
      if (driverRef.current) {
        try { driverRef.current.destroy(); } catch (e) {}
        driverRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Modal removed: Onboarding is now driven entirely by driver.js guided tour.
  // If driver cannot start (missing elements or other error), we mark the tutorial completed
  // and close the flow so it doesn't keep retrying.

  if (!isOpen) return null;

  // While driver runs, we render nothing (driver.js provides the UI). Return null so there's
  // no modal fallback UI.
};

export default OnboardingTutorial;
