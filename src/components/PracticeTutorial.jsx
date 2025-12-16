/**
 * PracticeTutorial Component
 * Interactive tutorial for the practice page
 * Shows as a floating tooltip near relevant UI elements
 */


import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { driver as Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import useDriverTour from '../hooks/useDriverTour';
import { useUser } from '../context/UserContext';

export const PracticeTutorial = ({ 
  isOpen, 
  onClose, 
  module = {},
  onTabChange = null
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const driverRef = useRef(null);

  // Define driver.js steps
  const steps = [
    {
      element: 'body',
      popover: {
        title: "Welcome!",
        description: "You're about to complete an interactive coding challenge.",
        side: 'center',
        align: 'center',
      },
    },
    {
      element: '#field-guide-tab',
      popover: {
        title: 'Field Guide',
        description: 'Click the 📖 icon to read theory and examples. This is your guide to complete the challenge!',
        side: 'right',
        align: 'start',
      },
      onHighlight: () => onTabChange && onTabChange('theory'),
    },
    {
      element: '#bounty-tab',
      popover: {
        title: 'Bounty',
        description: 'Click the 📝 icon to see your tasks. Complete them to earn rewards!',
        side: 'right',
        align: 'start',
      },
      onHighlight: () => onTabChange && onTabChange('tasks'),
    },
    {
      element: '.code-editor-wrapper, [class*="CodeEditor"]',
      popover: {
        title: 'Code Editor 💻',
        description: 'Write your solution here. Hit the Run button to test instantly.',
        side: 'left',
        align: 'center',
      },
    },
    {
      element: 'body',
      popover: {
        title: 'Pro Tips 💡',
        description: 'Stuck? Check hints. Try different solutions. Each step builds on the last!',
        side: 'center',
        align: 'center',
      },
    },
    {
      element: 'body',
      popover: {
        title: 'Ready! 🚀',
        description: "You're all set. Go show this challenge who's boss!",
        side: 'center',
        align: 'center',
      },
      isFinal: true,
    },
  ];



  // Use shared useDriverTour hook to manage driver.js lifecycle
  const { markPracticeVisited } = useUser();

  const { start, destroy } = useDriverTour({
    steps,
    selectors: ['body', '#field-guide-tab', '#bounty-tab', '.code-editor-wrapper'],
    onFailure: (err) => {
      // If driver fails, ensure we still close the tutorial so it doesn't loop
      console.warn('Practice tutorial driver failed:', err);
      try { markPracticeVisited(); } catch (e) {}
      onClose();
    },
    driverOptions: {
      onNext: (_el, idx) => {
        if (idx === steps.length - 1) {
          try { markPracticeVisited(); } catch (e) {}
          localStorage.setItem('tutorialCompleted', 'true');
          onClose();
        }
      },
      onDestroy: () => {
        try { markPracticeVisited(); } catch (e) {}
        localStorage.setItem('tutorialCompleted', 'true');
        onClose();
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      start(0).then(ok => {
        if (!ok) {
          // Driver couldn't start; close tutorial
          onClose();
        }
      });
    } else {
      destroy();
      setCurrentStep(0);
    }

    return () => {
      destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // No manual UI, driver.js handles the tutorial
  return null;
};

export default PracticeTutorial;
