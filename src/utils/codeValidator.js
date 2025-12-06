/**
 * Code Validator Utility
 * Validates code before execution to catch syntax errors early
 */

/**
 * Validates if code contains required syntax for the given language
 * @param {string} code - The code to validate
 * @param {string} language - Programming language (python, javascript, c)
 * @param {RegExp} requiredSyntax - Optional regex pattern that code must match
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateCode = (code, language, requiredSyntax = null) => {
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: 'Code cannot be empty' };
  }

  // Check required syntax if provided
  if (requiredSyntax && !requiredSyntax.test(code)) {
    return { isValid: false, error: 'Check your syntax! Are you following the instructions?' };
  }

  // Language-specific validation
  switch (language) {
    case 'python':
      return validatePython(code);
    case 'javascript':
      return validateJavaScript(code);
    case 'c':
      return validateC(code);
    default:
      return { isValid: true, error: null };
  }
};

/**
 * Python-specific validation
 * @param {string} code
 * @returns {Object}
 */
const validatePython = (code) => {
  // Check for common indentation errors
  const lines = code.split('\n');
  let lastIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue; // Skip empty lines

    const indent = line.match(/^(\s*)/)[1].length;
    
    // Check for tab/space mixing (Python doesn't like it)
    if (line.match(/\t/) && line.match(/ /)) {
      return { isValid: false, error: `Line ${i + 1}: Mixing tabs and spaces` };
    }
  }

  return { isValid: true, error: null };
};

/**
 * JavaScript-specific validation
 * @param {string} code
 * @returns {Object}
 */
const validateJavaScript = (code) => {
  // Check for unmatched braces/brackets/parentheses
  const braces = { '(': ')', '{': '}', '[': ']' };
  const stack = [];

  for (const char of code) {
    if (braces[char]) {
      stack.push(braces[char]);
    } else if (Object.values(braces).includes(char)) {
      if (stack.pop() !== char) {
        return { isValid: false, error: 'Unmatched braces or brackets' };
      }
    }
  }

  if (stack.length > 0) {
    return { isValid: false, error: 'Unmatched opening braces or brackets' };
  }

  return { isValid: true, error: null };
};

/**
 * C-specific validation
 * @param {string} code
 * @returns {Object}
 */
const validateC = (code) => {
  // Check for main function
  if (!code.includes('main')) {
    return { isValid: false, error: 'C program must include int main() function' };
  }

  // Check for unmatched braces
  const braces = { '(': ')', '{': '}', '[': ']' };
  const stack = [];

  for (const char of code) {
    if (braces[char]) {
      stack.push(braces[char]);
    } else if (Object.values(braces).includes(char)) {
      if (stack.pop() !== char) {
        return { isValid: false, error: 'Unmatched braces or brackets' };
      }
    }
  }

  if (stack.length > 0) {
    return { isValid: false, error: 'Unmatched opening braces or brackets' };
  }

  return { isValid: true, error: null };
};

export default validateCode;
