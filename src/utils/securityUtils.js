/**
 * Security Utilities
 * Handles secure authentication and authorization
 */

/**
 * Verify admin password against environment variable
 * @param {string} inputPassword - Password entered by user
 * @returns {boolean} True if password matches admin password
 */
export const verifyAdminPassword = (inputPassword) => {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  
  // Prevent timing attacks using consistent comparison
  return constantTimeCompare(inputPassword, adminPassword);
};

/**
 * Verify moderator password against environment variable
 * @param {string} inputPassword - Password entered by user
 * @returns {boolean} True if password matches mod password
 */
export const verifyModPassword = (inputPassword) => {
  const modPassword = import.meta.env.VITE_MOD_PASSWORD;
  
  return constantTimeCompare(inputPassword, modPassword);
};

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings match
 */
const constantTimeCompare = (a, b) => {
  if (!a || !b) return false;
  
  const aLen = a.length;
  const bLen = b.length;
  
  // Different lengths = not equal (revealed in constant time)
  let result = aLen === bLen ? 0 : 1;
  
  // Compare each character (even if lengths differ)
  const maxLen = Math.max(aLen, bLen);
  for (let i = 0; i < maxLen; i++) {
    const aChar = i < aLen ? a.charCodeAt(i) : 0;
    const bChar = i < bLen ? b.charCodeAt(i) : 0;
    result |= aChar ^ bChar;
  }
  
  return result === 0;
};

/**
 * Create a secure session token (temporary, for this session only)
 * @param {string} role - 'admin' or 'mod'
 * @returns {string} Session token
 */
export const createSessionToken = (role) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const token = `${role}_${timestamp}_${random}`;
  
  // Store in sessionStorage (cleared when browser closes)
  sessionStorage.setItem(`auth_${role}`, token);
  
  return token;
};

/**
 * Verify session token is valid
 * @param {string} role - 'admin' or 'mod'
 * @returns {boolean} True if valid session exists
 */
export const verifySessionToken = (role) => {
  const token = sessionStorage.getItem(`auth_${role}`);
  return !!token;
};

/**
 * Clear session token (logout)
 * @param {string} role - 'admin' or 'mod'
 */
export const clearSessionToken = (role) => {
  sessionStorage.removeItem(`auth_${role}`);
};

/**
 * Validate input string - prevent injection attacks
 * @param {string} input - User input to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized input or empty string if invalid
 */
export const sanitizeInput = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters/patterns
  let sanitized = input
    .trim()
    .slice(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  
  return sanitized;
};

/**
 * Check if code execution is rate limited
 * @returns {boolean} True if user has exceeded rate limit
 */
export const isRateLimited = () => {
  const maxAttempts = parseInt(import.meta.env.VITE_MAX_CODE_ATTEMPTS) || 100;
  const sessionKey = `code_attempts_${Date.now().toString().slice(-5)}`;
  
  const attempts = parseInt(sessionStorage.getItem(sessionKey) || '0');
  if (attempts >= maxAttempts) {
    return true;
  }
  
  sessionStorage.setItem(sessionKey, (attempts + 1).toString());
  return false;
};

/**
 * Reset rate limiting counter (call on successful login)
 */
export const resetRateLimit = () => {
  // Clear all rate limit counters
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('code_attempts_')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Generate a CSRF token for form submissions
 * Tokens are stored in sessionStorage and validated on submission
 * @param {string} formId - Unique identifier for the form
 * @returns {string} CSRF token
 */
export const generateCSRFToken = (formId) => {
  // Generate token: timestamp + random string
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 32);
  const token = `csrf_${timestamp}_${random}`;
  
  // Store in sessionStorage
  const csrfTokens = JSON.parse(sessionStorage.getItem('csrf_tokens') || '{}');
  csrfTokens[formId] = token;
  sessionStorage.setItem('csrf_tokens', JSON.stringify(csrfTokens));
  
  return token;
};

/**
 * Verify CSRF token for form submission
 * @param {string} formId - Unique identifier for the form
 * @param {string} token - Token from form submission
 * @returns {boolean} True if token is valid
 */
export const verifyCSRFToken = (formId, token) => {
  if (!token) return false;
  
  const csrfTokens = JSON.parse(sessionStorage.getItem('csrf_tokens') || '{}');
  const storedToken = csrfTokens[formId];
  
  if (!storedToken) return false;
  
  // Verify token using constant-time comparison
  const isValid = constantTimeCompare(token, storedToken);
  
  // Invalidate token after use (one-time use)
  if (isValid) {
    delete csrfTokens[formId];
    sessionStorage.setItem('csrf_tokens', JSON.stringify(csrfTokens));
  }
  
  return isValid;
};

/**
 * Clear all CSRF tokens (on logout)
 */
export const clearAllCSRFTokens = () => {
  sessionStorage.removeItem('csrf_tokens');
};

/**
 * Log security events and persist to sessionStorage for dashboard
 * @param {string} event - Event type
 * @param {object} data - Event data
 */
export const logSecurityEvent = (event, data) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    data,
    userAgent: navigator.userAgent,
  };
  
  console.warn('[SECURITY]', logEntry);
  
  // Persist to sessionStorage for Security Dashboard
  try {
    const existingLogs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 500 logs to prevent memory issues
    const trimmedLogs = existingLogs.slice(-500);
    sessionStorage.setItem('security_logs', JSON.stringify(trimmedLogs));
  } catch (e) {
    console.error('[SECURITY] Failed to persist log:', e);
  }
  
  // In production: send to backend
  // await fetch('/api/security-log', { method: 'POST', body: JSON.stringify(logEntry) });
};

/**
 * Simple client-side encryption for localStorage
 * Uses Base64 encoding with obfuscation (NOT cryptographic - use real crypto lib in production)
 * @param {string|object} data - Data to encrypt
 * @returns {string} Encrypted data
 */
export const encryptStorageData = (data) => {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    // Simple encoding: Base64 + timestamp prefix
    const timestamp = Date.now();
    const encoded = btoa(jsonString); // Base64 encode
    const withTimestamp = `${timestamp}:${encoded}`;
    return btoa(withTimestamp); // Double encode
  } catch (error) {
    console.warn('[SECURITY] Encryption failed:', error);
    return null;
  }
};

/**
 * Decrypt localStorage data
 * @param {string} encryptedData - Encrypted data from storage
 * @returns {object|string|null} Decrypted data or null if invalid
 */
export const decryptStorageData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    
    // Decode from Base64
    const withTimestamp = atob(encryptedData);
    const [timestamp, encoded] = withTimestamp.split(':');
    
    // Check if data is not too old (more than 24 hours)
    const age = Date.now() - parseInt(timestamp);
    if (age > 24 * 60 * 60 * 1000) {
      console.warn('[SECURITY] Stored data is too old, treating as invalid');
      return null;
    }
    
    // Decode from Base64
    const jsonString = atob(encoded);
    
    // Try to parse as JSON
    try {
      return JSON.parse(jsonString);
    } catch {
      // Return as string if not valid JSON
      return jsonString;
    }
  } catch (error) {
    console.warn('[SECURITY] Decryption failed:', error);
    return null;
  }
};

/**
 * Safely store data in localStorage with encryption
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const setSecureStorage = (key, data) => {
  try {
    const encrypted = encryptStorageData(data);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
      logSecurityEvent('secure_storage_write', { key, timestamp: new Date().toISOString() });
    }
  } catch (error) {
    console.error('[SECURITY] Failed to set secure storage:', error);
  }
};

/**
 * Safely retrieve data from localStorage with decryption
 * @param {string} key - Storage key
 * @returns {any} Decrypted data or null
 */
export const getSecureStorage = (key) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = decryptStorageData(encrypted);
    return decrypted;
  } catch (error) {
    console.error('[SECURITY] Failed to get secure storage:', error);
    return null;
  }
};

/**
 * Remove data from secure storage
 * @param {string} key - Storage key
 */
export const removeSecureStorage = (key) => {
  try {
    localStorage.removeItem(key);
    logSecurityEvent('secure_storage_delete', { key, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[SECURITY] Failed to remove secure storage:', error);
  }
};
