/**
 * useRouting Hook
 * Synchronizes URL pathname with AppContext navigation
 * 
 * - On initial load: Restore state from URL (bookmarks, direct links)
 * - After initial load: Only sync STATE → URL (not the other way around)
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { VIEWS } from '../constants/appConfig';

export const useRouting = (courses) => {
  console.log('[useRouting] Called with courses:', courses?.length);
  const navigate = useNavigate();
  const location = useLocation();
  const hasInitialized = useRef(false);
  const isNavigatingRef = useRef(false);
  
  const {
    view,
    activeCourse,
    activeModule,
    navigateHome,
    navigateToSyllabus,
    navigateToLearning,
  } = useApp();

  /**
   * Parse route and extract parameters from pathname
   */
  const parseRoute = (pathname) => {
    const parts = pathname.split('/').filter(p => p);
    
    if (parts.length === 0) {
      return { view: 'home' };
    }
    
    if (parts[0] === 'admin') {
      return { view: 'admin' };
    }
    
    if (parts[0] === 'courses' && parts[1]) {
      const courseId = parts[1];
      if (parts[2] === 'modules' && parts[3]) {
        const moduleId = parts[3];
        return { view: 'learning', courseId, moduleId };
      }
      return { view: 'syllabus', courseId };
    }
    
    return { view: 'home' };
  };

  /**
   * Initial load ONLY: Restore state from URL
   * Handles direct links, bookmarks, and page refreshes
   */
  useEffect(() => {
    // Skip if already initialized
    if (hasInitialized.current) return;
    if (!courses || courses.length === 0) return;
    
    // Only run once
    hasInitialized.current = true;
    
    const route = parseRoute(location.pathname);

    // Only need to restore state if URL has a specific route
    if (route.view === 'syllabus' && route.courseId) {
      const course = courses.find(c => c.id === route.courseId);

      if (course) {
        isNavigatingRef.current = true;
        // If course has no modules (list endpoint), fetch full course details
        if (!course.modules || course.modules.length === 0) {
          import('../api/courses').then(({ fetchCourse }) => {
            fetchCourse(route.courseId).then(full => {
              navigateToSyllabus(full || course);
              isNavigatingRef.current = false;
            }).catch(() => {
              navigateToSyllabus(course);
              isNavigatingRef.current = false;
            });
          }).catch(() => {
            navigateToSyllabus(course);
            isNavigatingRef.current = false;
          });
        } else {
          navigateToSyllabus(course);
          isNavigatingRef.current = false;
        }
      }
    } else if (route.view === 'learning' && route.courseId && route.moduleId) {
      const course = courses.find(c => c.id === route.courseId);

      if (course) {
        const module = course.modules?.find(m => m.id === route.moduleId);
        if (module) {
          isNavigatingRef.current = true;
          // Update state synchronously for syllabus first
          navigateToSyllabus(course);
          // Use micro task queue instead of macrotask for better timing
          Promise.resolve().then(() => {
            navigateToLearning(module);
            isNavigatingRef.current = false;
          });
        } else {
          // Module missing - fetch full course and try to find module
          import('../api/courses').then(({ fetchCourse }) => {
            fetchCourse(route.courseId).then(full => {
              if (full) {
                const m = full.modules?.find(mm => mm.id === route.moduleId);
                if (m) {
                  navigateToSyllabus(full);
                  Promise.resolve().then(() => {
                    navigateToLearning(m);
                    isNavigatingRef.current = false;
                  });
                  return;
                }
              }
              isNavigatingRef.current = false;
            }).catch(() => { isNavigatingRef.current = false; });
          }).catch(() => { isNavigatingRef.current = false; });
        }
      }
    }
    // Home is default, no restoration needed
  }, [courses, location.pathname, navigateToSyllabus, navigateToLearning]);

  /**
   * Sync app state changes to URL
   * Updates URL when user navigates via UI
   */
  useEffect(() => {
    // Don't update URL during restoration
    if (isNavigatingRef.current) return;
    
    // Don't interfere with public routes (user profiles, leaderboard)
    if (location.pathname.startsWith('/user/') || location.pathname === '/leaderboard') {
      return;
    }
    
    let expectedPath = '/';
    
    if (view === VIEWS.HOME) {
      expectedPath = '/';
    } else if (view === VIEWS.SYLLABUS && activeCourse) {
      expectedPath = `/courses/${activeCourse.id}`;
    } else if (view === VIEWS.LEARNING && activeCourse && activeModule) {
      expectedPath = `/courses/${activeCourse.id}/modules/${activeModule.id}`;
    }
    
    // Only navigate if path is different
    if (location.pathname !== expectedPath) {
      navigate(expectedPath, { replace: true });
    }
  }, [view, activeCourse, activeModule, location.pathname, navigate]);
};