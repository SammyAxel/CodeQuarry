/**
 * Application Configuration Constants
 * Centralized place for all magic strings and configuration values
 */

// View names for navigation
export const VIEWS = {
  HOME: 'home',
  SYLLABUS: 'syllabus',
  LEARNING: 'learning',
};

// Programming languages
export const LANGUAGES = {
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
  C: 'c',
};

// Module types
export const MODULE_TYPES = {
  VIDEO: 'video',
  ARTICLE: 'article',
  PRACTICE: 'practice',
};

// Local storage keys
export const STORAGE_KEYS = {
  USERS: 'codeQuarryUsers',
  LAST_USER: 'codeQuarryLastUser',
};

// API endpoints
export const API_ENDPOINTS = {
  COMPILE_C: '/api/compile-c',
};

// Error messages
export const ERROR_MESSAGES = {
  BACKEND_UNAVAILABLE: 'Backend not available. Using fallback mode.',
  COMPILE_ERROR: 'Compilation error',
  RUNTIME_ERROR: 'Runtime error',
  ENGINE_LOAD_FAILED: 'Failed to load code engine',
  NO_CODE_PROVIDED: 'No code provided',
  MAIN_FUNCTION_REQUIRED: 'C program must include int main() function',
  NO_PRINTF_FOUND: 'No printf() found. Add printf() to output text.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out',
};

// Animation durations (in ms)
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Timeout values
export const TIMEOUTS = {
  ENGINE_LOAD: 15000,
  API_CALL: 10000,
};

// Default values
export const DEFAULTS = {
  TAB_SIZE: 4,
  MAX_TERMINAL_LINES: 1000,
};

export default {
  VIEWS,
  LANGUAGES,
  MODULE_TYPES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ANIMATION_DURATIONS,
  TIMEOUTS,
  DEFAULTS,
};
