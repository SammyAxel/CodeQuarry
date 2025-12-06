/**
 * App Context
 * Manages global app state like current view, active course, and navigation
 */

import React, { createContext, useState, useCallback, useContext } from 'react';
import { VIEWS } from '../constants/appConfig';

const AppContext = createContext();

/**
 * AppProvider component - wraps app and provides navigation context
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AppProvider = ({ children }) => {
  const [view, setView] = useState(VIEWS.HOME);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  /**
   * Navigate to home view
   */
  const navigateHome = useCallback(() => {
    setView(VIEWS.HOME);
    setActiveCourse(null);
    setActiveModule(null);
  }, []);

  /**
   * Navigate to syllabus view
   * @param {Object} course - Course data
   */
  const navigateToSyllabus = useCallback((course) => {
    setActiveCourse(course);
    setView(VIEWS.SYLLABUS);
    setIsMapOpen(false);
  }, []);

  /**
   * Navigate to learning view
   * @param {Object} module - Module data
   */
  const navigateToLearning = useCallback((module) => {
    setActiveModule(module);
    setView(VIEWS.LEARNING);
    setIsMapOpen(false);
  }, []);

  /**
   * Go to next lesson
   * @param {Array} modules - Array of all modules in course
   */
  const goToNextLesson = useCallback((modules) => {
    if (!activeCourse || !activeModule) return;

    const currentIndex = modules.findIndex(m => m.id === activeModule.id);
    if (currentIndex !== -1 && currentIndex < modules.length - 1) {
      navigateToLearning(modules[currentIndex + 1]);
    } else {
      navigateToSyllabus(activeCourse);
    }
  }, [activeCourse, activeModule, navigateToLearning, navigateToSyllabus]);

  /**
   * Go to previous lesson
   * @param {Array} modules - Array of all modules in course
   */
  const goToPreviousLesson = useCallback((modules) => {
    if (!activeCourse || !activeModule) return;

    const currentIndex = modules.findIndex(m => m.id === activeModule.id);
    if (currentIndex > 0) {
      navigateToLearning(modules[currentIndex - 1]);
    }
  }, [activeCourse, activeModule, navigateToLearning]);

  /**
   * Go back to previous view
   */
  const goBack = useCallback(() => {
    if (view === VIEWS.LEARNING) {
      navigateToSyllabus(activeCourse);
    } else if (view === VIEWS.SYLLABUS) {
      navigateHome();
    }
  }, [view, activeCourse, navigateToSyllabus, navigateHome]);

  const value = {
    // State
    view,
    activeCourse,
    activeModule,
    isMapOpen,
    
    // Navigation
    navigateHome,
    navigateToSyllabus,
    navigateToLearning,
    goToNextLesson,
    goToPreviousLesson,
    goBack,
    setIsMapOpen,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook to use App Context
 * @returns {Object} App context value
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
