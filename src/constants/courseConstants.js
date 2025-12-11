/**
 * Course-related constants shared across components
 */

export const COURSE_TIERS = [
  { value: 'Copper', label: 'Copper', description: 'Foundational' },
  { value: 'Silver', label: 'Silver', description: 'Intermediate' },
  { value: 'Gold', label: 'Gold', description: 'Advanced' },
  { value: 'Platinum', label: 'Platinum', description: 'Expert' }
];

export const MODULE_TYPES = [
  { value: 'practice', label: 'Practice' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video Essay' }
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

export const PROGRAMMING_LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'c', label: 'C' }
];

// Validation constants
export const VALIDATION = {
  MIN_COURSE_TITLE_LENGTH: 3,
  MAX_COURSE_TITLE_LENGTH: 100,
  MIN_MODULE_TITLE_LENGTH: 3,
  MAX_MODULE_TITLE_LENGTH: 100,
  MAX_ICON_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_ICON_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'],
  MIN_GEM_REWARD: 0,
  MAX_GEM_REWARD: 1000,
  MIN_ESTIMATED_TIME: 1,
  MAX_ESTIMATED_TIME: 1000
};
