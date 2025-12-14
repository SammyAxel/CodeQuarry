/**
 * PracticeTutorial Component
 * Interactive tutorial for the practice page
 * Shows as a floating tooltip near relevant UI elements
 */


import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { driver as Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

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
        title: "Welcome! 🎯",
        description: "You're about to complete an interactive coding challenge.",
        side: 'center',
        align: 'center',
      },
    },
    {
      element: '#field-guide-tab',
      popover: {
        title: 'Field Guide 📖',
        description: 'Click the 📖 icon to read theory and examples. This is your guide to complete the challenge!',
        side: 'right',
        align: 'start',
      },
      onHighlight: () => onTabChange && onTabChange('theory'),
    },
    {
      element: '#bounty-tab',
      popover: {
        title: 'Bounty 🎁',
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



  // Initialize and control driver.js
  useEffect(() => {
    if (isOpen) {
      // Create new driver instance
      driverRef.current = new Driver({
        allowClose: true, // Allow closing by clicking outside
        overlayClickNext: true, // Allow clicking overlay to move to next step
        showProgress: true,
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Start!',
        overlayOpacity: 0.5,
        onNext: (element, stepIdx) => {
          // Trigger onHighlight callback if it exists
          if (steps[stepIdx] && typeof steps[stepIdx].onHighlight === 'function') {
            steps[stepIdx].onHighlight();
          }
          // If this is the last step, close the tutorial
          if (stepIdx === steps.length - 1) {
            if (driverRef.current) {
              driverRef.current.destroy();
              driverRef.current = null;
            }
            onClose();
          } else {
            setCurrentStep(stepIdx + 1);
          }
        },
        onPrevious: (element, stepIdx) => {
          setCurrentStep(stepIdx - 1);
        },
        onDestroy: () => {
          setCurrentStep(0);
          driverRef.current = null;
          onClose();
        },
      });

      driverRef.current.setSteps(steps);
      driverRef.current.drive(currentStep);
    } else {
      // Clean up when closed
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      setCurrentStep(0);
    }

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // No manual UI, driver.js handles the tutorial
  return null;
};

export default PracticeTutorial;
