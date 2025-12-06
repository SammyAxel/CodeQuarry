import { useState, useRef, useEffect, useCallback } from 'react';

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
        const originalLog = console.log;
        console.log = (...args) => { logs.push(args.join(' ')); };
        // Display user's output first
        new Function(code)();
        if (logs.length > 0) setOutput(prev => [...prev, ...logs]);
        validateOutput(logs, shouldDisplayMessages);
        console.log = originalLog;
      } else if (module.language === 'python' && pyodideRef.current) {
        pyodideRef.current.setStdout({ batched: (text) => logs.push(text) });
        await pyodideRef.current.runPythonAsync(code);
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
            // Use Vite proxy - /api is forwarded to http://localhost:5000/api
            const response = await fetch('/api/compile-c', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code })
            });

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
          setOutput(prev => [...prev, `❌ ${err.message}`]);
        }
      }
    } catch (err) {
      setOutput(prev => [...prev, `❌ ${err.message}`]);
    }
    return { success };
  };

  return { output, setOutput, isEngineLoading, engineError, runCode, initializeEngines };
};