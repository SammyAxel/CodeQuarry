/**
 * Course Translation Storage
 * Uses API with localStorage cache for offline support
 * Structure: { courseId: { language: { title, description, modules } } }
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CACHE_KEY = 'courseTranslations_cache';

// In-memory cache
let memoryCache = null;

/**
 * Get all translations from localStorage cache
 */
const getLocalCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading translation cache:', error);
    return {};
  }
};

/**
 * Save to localStorage cache
 */
const saveLocalCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving translation cache:', error);
  }
};

/**
 * Fetch all translations from all courses
 * Returns { courseId: { language: translationData } }
 */
export const getCourseTranslations = () => {
  // Use memory cache if available
  if (memoryCache) {
    return memoryCache;
  }
  
  // Otherwise use localStorage cache
  const cached = getLocalCache();
  memoryCache = cached;
  return cached;
};

/**
 * Save course translation to database via API
 */
export const setCourseTranslation = async (courseId, language, translation) => {
  try {
    const token = sessionStorage.getItem('sessionToken');
    const response = await fetch(`${API_URL}/api/translations/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseId, language, translation })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save translation');
    }
    
    // Update local cache
    const cached = getLocalCache();
    if (!cached[courseId]) {
      cached[courseId] = {};
    }
    cached[courseId][language] = translation;
    saveLocalCache(cached);
    memoryCache = cached;
    
    return await response.json();
  } catch (error) {
    console.error('Error saving translation:', error);
    // Fallback to localStorage only
    const cached = getLocalCache();
    if (!cached[courseId]) {
      cached[courseId] = {};
    }
    cached[courseId][language] = translation;
    saveLocalCache(cached);
    memoryCache = cached;
  }
};

/**
 * Get translation for specific course and language
 */
export const getCourseTranslation = (courseId, language) => {
  const translations = getCourseTranslations();
  return translations[courseId]?.[language] || null;
};

/**
 * Delete course translation
 */
export const removeCourseTranslation = async (courseId, language) => {
  try {
    const token = sessionStorage.getItem('sessionToken');
    const response = await fetch(`${API_URL}/api/translations/${courseId}/${language}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete translation');
    }
    
    // Update local cache
    const cached = getLocalCache();
    if (cached[courseId]?.[language]) {
      delete cached[courseId][language];
      saveLocalCache(cached);
      memoryCache = cached;
    }
  } catch (error) {
    console.error('Error deleting translation:', error);
    // Fallback to localStorage
    const cached = getLocalCache();
    if (cached[courseId]?.[language]) {
      delete cached[courseId][language];
      saveLocalCache(cached);
      memoryCache = cached;
    }
  }
};

/**
 * Get available languages for a course
 */
export const getCourseLanguages = (courseId) => {
  const translations = getCourseTranslations();
  return Object.keys(translations[courseId] || {});
};

/**
 * Fetch translations for a course from API and update cache
 */
export const fetchCourseTranslations = async (courseId) => {
  try {
    const response = await fetch(`${API_URL}/api/translations/${courseId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch translations');
    }
    
    const translations = await response.json();
    
    // Update cache
    const cached = getLocalCache();
    cached[courseId] = translations;
    saveLocalCache(cached);
    memoryCache = cached;
    
    return translations;
  } catch (error) {
    console.error('Error fetching translations:', error);
    return {};
  }
};

// Apply translation to course object
export const getTranslatedCourse = (course, language) => {
  if (language === 'en') return course; // Default is English
  
  const translation = getCourseTranslation(course.id, language);
  if (!translation) return course;
  
  return {
    ...course,
    title: translation.title || course.title,
    description: translation.description || course.description,
    modules: course.modules.map((module, index) => {
      const moduleTranslation = translation.modules?.[index];
      if (!moduleTranslation) return module;
      
      return {
        ...module,
        title: moduleTranslation.title || module.title,
        theory: moduleTranslation.theory || module.theory,
        instruction: moduleTranslation.instruction || module.instruction,
        hints: moduleTranslation.hints || module.hints,
      };
    })
  };
};
