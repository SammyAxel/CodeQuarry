import { useState, useRef, useEffect, useCallback } from 'react';

const loadScript = (src, globalCheck) => {
  return new Promise((resolve, reject) => {
    if (window[globalCheck]) {
      resolve();
      return;
    }
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      const interval = setInterval(() => {
        if (window[globalCheck]) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
};

export const useCodeEngine = (module) => {
  const [output, setOutput] = useState(['> Terminal ready...']);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState(false);
  const pyodideRef = useRef(null);

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

    if (module.language === 'c' && !window.JSCPP) {
      setIsEngineLoading(true);
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/jscpp@2.0.4/dist/jscpp.browser.min.js", "JSCPP");
        if (window.JSCPP) setOutput(prev => [...prev, '> ⚙️ C Engine Loaded.']);
      } catch (e) {
        setEngineError(true);
        setOutput(prev => [...prev, '> ❌ Failed to load C engine.']);
      } finally {
        setIsEngineLoading(false);
      }
    }
  }, [module.language]);

  useEffect(() => {
    initializeEngines();
  }, [initializeEngines]);

  const runCode = async (code) => {
    setOutput(prev => [...prev, `> Executing main.${module.language}...`, '---']);
    await new Promise(r => setTimeout(r, 100));

    let logs = [];
    let success = false;

    const validateOutput = (logs) => {
      const cleanLogs = logs.join('').replace(/\s/g, '');
      const cleanExpected = module.expectedOutput.replace(/\s/g, '');
      if (cleanLogs.includes(cleanExpected)) {
        success = true;
        setOutput(prev => [...prev, '✅ TEST PASSED.']);
      } else {
        setOutput(prev => [...prev, `❌ Expected "${module.expectedOutput}" but got something else.`]);
      }
    };

    try {
      if (module.language === 'javascript') {
        const originalLog = console.log;
        console.log = (...args) => { logs.push(args.join(' ')); };
        // Display user's output first
        new Function(code)();
        if (logs.length > 0) setOutput(prev => [...prev, ...logs]);
        validateOutput(logs);
        console.log = originalLog;
      } else if (module.language === 'python' && pyodideRef.current) {
        pyodideRef.current.setStdout({ batched: (text) => logs.push(text) });
        await pyodideRef.current.runPythonAsync(code);
        if (logs.length > 0) setOutput(prev => [...prev, ...logs]);
        validateOutput(logs);
      } else if (module.language === 'c' && window.JSCPP) {
        let cLogs = "";
        const config = { stdio: { write: (s) => cLogs += s, writeError: (s) => cLogs += s } };
        if (!code.includes("main")) throw new Error("Missing 'int main()'");
        window.JSCPP.run(code, "", config);
        const lines = cLogs.split('\n').filter(l => l);
        if (lines.length) setOutput(prev => [...prev, ...lines]);
        validateOutput(lines);
      }
    } catch (err) {
      setOutput(prev => [...prev, `❌ ${err.message}`]);
    }
    return { success };
  };

  return { output, setOutput, isEngineLoading, engineError, runCode, initializeEngines };
};