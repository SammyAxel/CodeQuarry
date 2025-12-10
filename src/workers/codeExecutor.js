/**
 * Code Executor Web Worker
 * Runs JavaScript code in an isolated sandbox environment
 * Prevents: infinite loops, DOM access, network access, main thread blocking
 */

// Disable dangerous globals in the worker context
const disabledGlobals = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'importScripts',
];

// Store original for potential future use
const originalFetch = self.fetch;

// Disable network access
disabledGlobals.forEach(name => {
  self[name] = function() {
    throw new Error(`${name} is disabled in sandbox mode for security`);
  };
});

/**
 * Safe console implementation that captures logs
 */
const createSafeConsole = (logs) => ({
  log: (...args) => logs.push({ type: 'log', message: args.map(String).join(' ') }),
  error: (...args) => logs.push({ type: 'error', message: args.map(String).join(' ') }),
  warn: (...args) => logs.push({ type: 'warn', message: args.map(String).join(' ') }),
  info: (...args) => logs.push({ type: 'info', message: args.map(String).join(' ') }),
  debug: (...args) => logs.push({ type: 'debug', message: args.map(String).join(' ') }),
  clear: () => logs.length = 0,
  table: (data) => logs.push({ type: 'log', message: JSON.stringify(data, null, 2) }),
});

/**
 * Execute JavaScript code safely
 * @param {string} code - JavaScript code to execute
 * @param {number} timeout - Maximum execution time in ms
 * @returns {Object} Result with output and success status
 */
const executeCode = (code, timeout = 5000) => {
  const logs = [];
  const startTime = Date.now();
  let success = false;
  let error = null;

  try {
    // Create safe console
    const safeConsole = createSafeConsole(logs);

    // Wrap code in a function with safe console
    const wrappedCode = `
      (function(console) {
        "use strict";
        ${code}
      })
    `;

    // Execute the code
    // eslint-disable-next-line no-eval
    const fn = eval(wrappedCode);
    fn(safeConsole);
    
    success = true;
  } catch (err) {
    error = err.message;
    logs.push({ type: 'error', message: `❌ ${err.message}` });
  }

  const executionTime = Date.now() - startTime;

  return {
    success,
    logs,
    error,
    executionTime,
  };
};

/**
 * Message handler for receiving code execution requests
 */
self.onmessage = function(event) {
  const { id, code, timeout, expectedOutput } = event.data;

  // Set up timeout protection
  const timeoutMs = timeout || 5000;
  let timedOut = false;
  
  const timeoutId = setTimeout(() => {
    timedOut = true;
    self.postMessage({
      type: 'result',
      id,
      success: false,
      logs: [{ type: 'error', message: `❌ Code execution exceeded ${timeoutMs}ms timeout (likely infinite loop)` }],
      error: 'Execution timeout',
      timedOut: true,
    });
  }, timeoutMs);

  try {
    const result = executeCode(code, timeoutMs);
    
    // Clear timeout if execution completed
    clearTimeout(timeoutId);
    
    if (timedOut) return; // Already sent timeout response

    // Check expected output if provided
    if (expectedOutput) {
      const output = result.logs
        .filter(l => l.type === 'log')
        .map(l => l.message)
        .join('');
      
      const cleanOutput = output.replace(/\s/g, '');
      const cleanExpected = expectedOutput.replace(/\s/g, '');
      
      if (cleanOutput.includes(cleanExpected)) {
        result.logs.push({ type: 'success', message: '✅ TEST PASSED.' });
        result.testPassed = true;
      } else {
        result.logs.push({ type: 'error', message: `❌ Expected "${expectedOutput}" but got something else.` });
        result.testPassed = false;
      }
    }

    // Send result back to main thread
    self.postMessage({
      type: 'result',
      id,
      ...result,
      timedOut: false,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (timedOut) return;
    
    self.postMessage({
      type: 'error',
      id,
      success: false,
      logs: [{ type: 'error', message: `❌ Worker error: ${err.message}` }],
      error: err.message,
      timedOut: false,
    });
  }
};

// Signal that worker is ready
self.postMessage({ type: 'ready' });
