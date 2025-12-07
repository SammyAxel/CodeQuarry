import { useState, useRef, useEffect, useCallback } from 'react';
import { isRateLimited, logSecurityEvent } from '../utils/securityUtils';

// Web Worker for sandboxed JavaScript execution
let jsWorker = null;
const initJsWorker = () => {
  if (!jsWorker) {
    try {
      jsWorker = new Worker(new URL('../workers/codeExecutor.js', import.meta.url), { type: 'module' });
    } catch (e) {
      console.warn('Web Worker not available, falling back to direct execution');
      return null;
    }
  }
  return jsWorker;
};

/**
 * Dynamically loads a JavaScript library/script into the page
 * Handles script loading with polling for initialization and timeout
 * @param {string} src - URL of the script to load
 * @param {string} globalCheck - Global variable name to check for successful load
 * @returns {Promise} Resolves when library is ready, rejects on timeout/error
 * @throws {Error} If script fails to load or initialization times out
 */
const loadScript = (src, globalCheck) => {
  return new Promise((resolve, reject) => {
    if (window[globalCheck]) {
      resolve();
      return;
    }
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      if (window[globalCheck]) {
        resolve();
        return;
      }
      // Poll for library initialization with timeout
      const interval = setInterval(() => {
        if (window[globalCheck]) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for ${globalCheck} to load`));
      }, 15000);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      if (window[globalCheck]) {
        resolve();
        return;
      }
      // Library may not be initialized immediately, poll with timeout
      let attempts = 0;
      const maxAttempts = 100; // 5 seconds at 50ms intervals
      const checkInterval = setInterval(() => {
        attempts++;
        if (window[globalCheck]) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error(`${globalCheck} failed to initialize after script load`));
        }
      }, 50);
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
};

/**
 * Hook for managing code execution engines (Python, JavaScript, C)
 * Lazy-loads engines on demand for better performance
 * Handles multiple execution environments with fallback support
 * 
 * @param {Object} module - Module data containing language, expectedOutput, etc.
 * @returns {Object} { output, setOutput, isEngineLoading, engineError, runCode, initializeEngines }
 * 
 * @example
 * const { output, runCode, isEngineLoading } = useCodeEngine(module);
 * const result = await runCode(userCode);
 */
export const useCodeEngine = (module) => {
  const [output, setOutput] = useState(['> Terminal ready...']);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState(false);
  const pyodideRef = useRef(null);
  const jscppRef = useRef(null);

  const initializeEngines = useCallback(async () => {
    setEngineError(false);
    if (module.language === 'python' && !pyodideRef.current) {
      setIsEngineLoading(true);
      try {
        await loadScript("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js", "loadPyodide");
        if (window.loadPyodide) {
          pyodideRef.current = await window.loadPyodide();
          setOutput(prev => [...prev, '> 🐍 Python Engine Loaded.']);
        }
      } catch (err) {
        console.error(err);
        setEngineError(true);
        setOutput(prev => [...prev, '> ❌ Failed to load Python engine. Check internet connection.']);
      } finally {
        setIsEngineLoading(false);
      }
    }

    if (module.language === 'c' && !jscppRef.current) {
      setIsEngineLoading(true);
      try {
        // C engine uses Wandbox API (no local script needed)
        // Just mark as ready - actual compilation happens on demand
        jscppRef.current = { ready: true, useWandbox: true };
        setOutput(prev => [...prev, '> ⚙️ C Engine Ready (Cloud Compiler).']);
      } catch (e) {
        console.error("C engine init error:", e);
        jscppRef.current = { ready: false };
      } finally {
        setIsEngineLoading(false);
      }
    }
  }, [module.language]);

  const runCode = async (code, shouldDisplayMessages = true) => {
    // Check rate limiting
    if (isRateLimited()) {
      const maxAttempts = parseInt(import.meta.env.VITE_MAX_CODE_ATTEMPTS) || 100;
      const errorMsg = `❌ Rate limit exceeded. Maximum ${maxAttempts} code executions per session.`;
      setOutput(prev => [...prev, errorMsg]);
      
      logSecurityEvent('code_execution_rate_limited', {
        language: module.language,
        timestamp: new Date().toISOString()
      });
      
      return { success: false };
    }

    // Initialize engine only when user tries to run code
    if (!pyodideRef.current && module.language === 'python') {
      await initializeEngines();
    }
    if (!jscppRef.current && module.language === 'c') {
      await initializeEngines();
    }

    setOutput(prev => [...prev, `> Executing main.${module.language}...`, '---']);
    await new Promise(r => setTimeout(r, 100));

    let logs = [];
    let success = false;
    let executionTimeout = null;
    let isTimedOut = false;

    // Get execution timeout from environment
    const execTimeout = parseInt(import.meta.env.VITE_CODE_EXEC_TIMEOUT) || 5000;

    const validateOutput = (logs, shouldDisplayMessages = true) => {
      const cleanLogs = logs.join('').replace(/\s/g, '');
      const cleanExpected = module.expectedOutput.replace(/\s/g, '');
      if (cleanLogs.includes(cleanExpected)) {
        success = true;
        if (shouldDisplayMessages) {
          setOutput(prev => [...prev, '✅ TEST PASSED.']);
        }
      } else {
        if (shouldDisplayMessages) {
          setOutput(prev => [...prev, `❌ Expected "${module.expectedOutput}" but got something else.`]);
        }
      }
    };

    try {
      if (module.language === 'javascript') {
        const worker = initJsWorker();
        
        if (worker) {
          // Use sandboxed Web Worker for execution
          const workerPromise = new Promise((resolve, reject) => {
            executionTimeout = setTimeout(() => {
              isTimedOut = true;
              worker.postMessage({ type: 'cancel' });
              reject(new Error(`Code execution exceeded ${execTimeout}ms timeout`));
            }, execTimeout);
            
            const handler = (e) => {
              // Skip 'ready' message from worker initialization
              if (e.data.type === 'ready') return;
              
              clearTimeout(executionTimeout);
              worker.removeEventListener('message', handler);
              
              if (e.data.type === 'result') {
                // Convert log objects to strings
                const workerLogs = e.data.logs || [];
                logs = workerLogs.map(l => l.message || String(l));
                if (e.data.error && !e.data.success) {
                  reject(new Error(e.data.error));
                } else {
                  resolve();
                }
              } else if (e.data.type === 'error') {
                const workerLogs = e.data.logs || [];
                logs = workerLogs.map(l => l.message || String(l));
                reject(new Error(e.data.error));
              }
            };
            
            worker.addEventListener('message', handler);
            worker.postMessage({ type: 'execute', code, timeout: execTimeout });
          });
          
          await workerPromise;
          
          if (logs.length > 0) setOutput(prev => [...prev, ...logs]);
          validateOutput(logs, shouldDisplayMessages);
          
          logSecurityEvent('code_executed_sandboxed', {
            language: 'javascript',
            timestamp: new Date().toISOString()
          });
        } else {
          // Fallback to direct execution (less secure but functional)
          const originalLog = console.log;
          console.log = (...args) => { logs.push(args.join(' ')); };
          
          // Wrap execution in timeout
          const codePromise = new Promise((resolve, reject) => {
            executionTimeout = setTimeout(() => {
              isTimedOut = true;
              reject(new Error(`Code execution exceeded ${execTimeout}ms timeout`));
            }, execTimeout);
            
            try {
              new Function(code)();
              resolve();
            } catch (err) {
              reject(err);
            }
          });
          
          await codePromise;
          clearTimeout(executionTimeout);
          
          if (logs.length > 0) setOutput(prev => [...prev, ...logs]);
          validateOutput(logs, shouldDisplayMessages);
          console.log = originalLog;
        }
      } else if (module.language === 'python' && pyodideRef.current) {
        pyodideRef.current.setStdout({ batched: (text) => logs.push(text) });
        
        // Wrap Pyodide execution in timeout
        const pythonPromise = new Promise((resolve, reject) => {
          executionTimeout = setTimeout(() => {
            isTimedOut = true;
            reject(new Error(`Python execution exceeded ${execTimeout}ms timeout (likely infinite loop)`));
          }, execTimeout);
          
          pyodideRef.current.runPythonAsync(code)
            .then(resolve)
            .catch(reject);
        });
        
        await pythonPromise;
        clearTimeout(executionTimeout);
        
        if (logs.length > 0) setOutput(prev => [...prev, ...logs]);
        validateOutput(logs, shouldDisplayMessages);
      } else if (module.language === 'c' && jscppRef.current) {
        try {
          // Validate C syntax client-side
          if (!code.includes("main")) {
            throw new Error("C program must include int main() function");
          }

          // Try backend first (if available)
          let backendSuccess = false;
          try {
            executionTimeout = setTimeout(() => {
              isTimedOut = true;
            }, execTimeout);
            
            // Use environment variable for API URL, fallback to relative path
            const apiBase = import.meta.env.VITE_API_URL || '';
            const apiUrl = `${apiBase}/api/compile-c`;
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code })
            });

            clearTimeout(executionTimeout);

            if (isTimedOut) {
              throw new Error(`C compilation exceeded ${execTimeout}ms timeout`);
            }

            if (response.ok) {
              const result = await response.json();
              if (result.error) {
                throw new Error(result.error);
              }
              if (result.output) {
                logs = result.output.split('\n').filter(l => l.trim());
                setOutput(prev => [...prev, ...logs]);
                validateOutput(logs, shouldDisplayMessages);
                backendSuccess = true;
              }
            }
          } catch (backendErr) {
            clearTimeout(executionTimeout);
            // Backend not available, continue to fallback
            console.warn("Backend not available:", backendErr.message);
          }

          if (!backendSuccess) {
            // Fallback: Client-side printf parser
            setOutput(prev => [...prev, `⚠️ Using parser fallback...`]);
            
            const printfRegex = /printf\s*\(\s*"([^"]+)"/g;
            const matches = [...code.matchAll(printfRegex)];
            
            if (matches.length > 0) {
              logs = matches.map(m => m[1]);
              setOutput(prev => [...prev, '(Simulated output)', ...logs]);
              validateOutput(logs, shouldDisplayMessages);
            } else {
              throw new Error("No printf() found. Add printf() to output text, e.g., printf(\"Hello\");");
            }
          }
        } catch (err) {
          clearTimeout(executionTimeout);
          setOutput(prev => [...prev, `❌ ${err.message}`]);
        }
      }
    } catch (err) {
      clearTimeout(executionTimeout);
      
      // Log timeout events for security monitoring
      if (isTimedOut) {
        logSecurityEvent('code_execution_timeout', {
          language: module.language,
          timeout: execTimeout,
          timestamp: new Date().toISOString()
        });
      }
      
      setOutput(prev => [...prev, `❌ ${err.message}`]);
    }
    return { success };
  };

  return { output, setOutput, isEngineLoading, engineError, runCode, initializeEngines };
};