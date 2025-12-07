/**
 * Course Translation Storage
 * Stores translations for courses by language
 * Structure: { courseId: { language: { title, description, modules } } }
 */

// Store translations in localStorage
export const getCourseTranslations = () => {
  const stored = localStorage.getItem('courseTranslations');
  return stored ? JSON.parse(stored) : {};
};

export const saveCourseTranslations = (translations) => {
  localStorage.setItem('courseTranslations', JSON.stringify(translations));
};

export const getCourseTranslation = (courseId, language) => {
  const translations = getCourseTranslations();
  return translations[courseId]?.[language] || null;
};

export const setCourseTranslation = (courseId, language, translation) => {
  const translations = getCourseTranslations();
  if (!translations[courseId]) {
    translations[courseId] = {};
  }
  translations[courseId][language] = translation;
  saveCourseTranslations(translations);
};

export const removeCourseTranslation = (courseId, language) => {
  const translations = getCourseTranslations();
  if (translations[courseId]?.[language]) {
    delete translations[courseId][language];
    saveCourseTranslations(translations);
  }
};

// Get available languages for a course
export const getCourseLanguages = (courseId) => {
  const translations = getCourseTranslations();
  return Object.keys(translations[courseId] || {});
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
