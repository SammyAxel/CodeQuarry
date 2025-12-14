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
        description: 'Click the 📖 icon to read theory and examples. This is your reference manual!',
        side: 'right',
        align: 'start',
      },
      onNextClick: () => onTabChange && onTabChange('theory'),
    },
    {
      element: '#bounty-tab',
      popover: {
        title: 'Bounty 🎁',
        description: 'Click the 📝 icon to see your tasks. Complete them to earn rewards!',
        side: 'right',
        align: 'start',
      },
      onNextClick: () => onTabChange && onTabChange('tasks'),
    },
    {
      element: 'body',
      popover: {
        title: 'Code Editor 💻',
        description: 'Write your solution here. Hit the Play button to test instantly.',
        side: 'center',
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
        description: ",You're all set. Go show this challenge who's boss!",
        side: 'center',
        align: 'center',
      },
      isFinal: true,
    },
  ];



  // Initialize and control driver.js
  useEffect(() => {
    if (isOpen) {
      if (!driverRef.current) {
        driverRef.current = new Driver({
          allowClose: false, // Prevent closing by clicking outside
          overlayClickNext: false,
          showProgress: true,
          nextBtnText: 'Next',
          prevBtnText: 'Back',
          doneBtnText: 'Start!',
          onNext: (element, stepIdx) => {
            if (steps[stepIdx] && typeof steps[stepIdx].onNextClick === 'function') {
              steps[stepIdx].onNextClick();
            }
            // If this is the last step, close the tutorial
            if (stepIdx === steps.length - 1) {
              onClose();
            } else {
              setCurrentStep(stepIdx + 1);
            }
          },
          onPrevious: (element, stepIdx) => {
            setCurrentStep(stepIdx - 1);
          },
          onReset: () => {
            setCurrentStep(0);
            onClose();
          },
          onDestroyStarted: () => {
            setCurrentStep(0);
          },
        });
      }
      driverRef.current.setSteps(steps);
      driverRef.current.drive(currentStep);
    } else if (driverRef.current) {
      driverRef.current.destroy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentStep]);

  // No manual UI, driver.js handles the tutorial
  return null;
};

export default PracticeTutorial;
