import React, { useState, useEffect } from 'react';
import { fetchCourses, fetchCourse } from '../api/courses';

// Static fallback courses (used when API is unavailable)
const FALLBACK_COURSES = [
  {
    id: 'js-101',
    title: 'JavaScript for Newbs',
    description: 'The backbone of the web. Make websites come alive with JS.',
    icon: '📜',
    difficulty: 'copper',
    language: 'javascript',
    modules: []
  },
  {
    id: 'py-101', 
    title: 'Python for Newbs',
    description: 'The most beginner-friendly language. Perfect for AI, data, and automation.',
    icon: '🐍',
    difficulty: 'copper',
    language: 'python',
    modules: []
  },
  {
    id: 'c-101',
    title: 'C for Newbs',
    description: 'The foundation of modern computing. Learn memory, pointers, and raw power.',
    icon: '⚙️',
    difficulty: 'copper',
    language: 'c',
    modules: []
  }
];

// Export static fallback for initial render
export const COURSES = FALLBACK_COURSES;

/**
 * Hook to fetch courses from API
 * @returns {Object} { courses, loading, error, refetch }
 */
export const useCourses = () => {
  console.log('[useCourses] Hook called');
  const [courses, setCourses] = useState(FALLBACK_COURSES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err.message);
      // Keep fallback courses on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return { courses, loading, error, refetch: loadCourses };
};

/**
 * Hook to fetch a single course
 * @param {string} courseId 
 * @returns {Object} { course, loading, error }
 */
export const useCourse = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCourse(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  return { course, loading, error };
};

/**
 * Get course by ID (sync, from cache or fallback)
 * @param {string} courseId 
 * @returns {Object|null}
 */
export const getCourseById = (courseId) => {
  return FALLBACK_COURSES.find(c => c.id === courseId) || null;
};